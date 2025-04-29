"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { refreshAccessToken } from "@/lib/api/auth";
import { useRouter } from "@/i18n/navigation";
import { useToast } from "@/components/ui/use-toast";
import { useUserStore } from "@/lib/store/user";
import { usePathname } from "@/i18n/navigation";

// Constants for session management
const SESSION_CHECK_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes
const TOKEN_REFRESH_THRESHOLD = 10 * 60 * 1000; // Refresh if less than 10 minutes left
const SESSION_TIMEOUT =
  Number(process.env.NEXT_PUBLIC_SESSION_TIMEOUT) || 2 * 60 * 60 * 1000; // 2 hours default
const WARNING_TIME = 5 * 60 * 1000; // 5 minutes before timeout

export function SessionMonitor() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const checkInterval = useRef<NodeJS.Timeout>();
  const [hasRedirected, setHasRedirected] = useState(false);
  const setShowSignInModal = useUserStore((state) => state.setShowSignInModal);
  const lastActivity = useRef(Date.now());
  const isHandlingExpiry = useRef(false);

  // Detect if we're on a public page that doesn't require authentication
  const isOnPublicPage = useCallback(() => {
    if (typeof window === "undefined") return true;

    return (
      pathname === "/" ||
      pathname === "/epd/en" ||
      pathname === "/epd/de" ||
      pathname.includes("/signup") ||
      pathname.includes("/signin") ||
      pathname.includes("/forgot-password") ||
      pathname.includes("/auth") ||
      // Only match exact locale paths or their immediate children
      (/^\/epd\/(en|de)\/[^/]*$/.test(pathname) && !pathname.includes("dashboard"))
    );
  }, [pathname]);

  // Handle session expiration
  const handleSessionExpired = useCallback(async () => {
    if (isHandlingExpiry.current) return;
    isHandlingExpiry.current = true;

    try {
      console.log("Session expired, signing out...");
      await signOut({ redirect: false });
      
      toast({
        title: "Session Expired",
        description: "You have been logged out due to inactivity.",
        variant: "destructive",
      });

      setShowSignInModal(true);
      setHasRedirected(true);
      
      // Use the i18n router to handle locale properly
      router.replace("/");
    } catch (error) {
      console.error("Error handling session expiry:", error);
    } finally {
      isHandlingExpiry.current = false;
    }
  }, [toast, setShowSignInModal, router]);

  // Handle user activity
  const updateActivity = useCallback(() => {
    lastActivity.current = Date.now();
  }, []);

  // Check session status
  useEffect(() => {
    if (status === "unauthenticated" && !hasRedirected && !isOnPublicPage()) {
      setShowSignInModal(true);
      setHasRedirected(true);
      
      // Use the i18n router to handle locale properly
      router.replace("/");
    }
  }, [status, hasRedirected, isOnPublicPage, setShowSignInModal, router]);

  // Monitor user activity
  useEffect(() => {
    if (status !== "authenticated" || isOnPublicPage()) return;

    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];

    events.forEach((event) => {
      window.addEventListener(event, updateActivity);
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, updateActivity);
      });
    };
  }, [status, isOnPublicPage, updateActivity]);

  // Session refresh and check
  useEffect(() => {
    if (!session?.user || status !== "authenticated" || isOnPublicPage()) {
      if (checkInterval.current) {
        clearInterval(checkInterval.current);
      }
      return;
    }

    const checkAndRefreshSession = async () => {
      try {
        const tokenExpiry = session.expires
          ? new Date(session.expires).getTime()
          : 0;
        const timeUntilExpiry = tokenExpiry - Date.now();
        const inactiveTime = Date.now() - lastActivity.current;

        // Check inactivity timeout
        if (inactiveTime >= SESSION_TIMEOUT) {
          await handleSessionExpired();
          return;
        }

        // Show warning if approaching timeout
        if (inactiveTime >= SESSION_TIMEOUT - WARNING_TIME) {
          toast({
            title: "Session Warning",
            description: "Your session will expire in 5 minutes. Please save your work.",
            variant: "default",
            duration: 10000,
          });
        }

        // Refresh token if needed
        if (timeUntilExpiry < TOKEN_REFRESH_THRESHOLD && session.refreshToken) {
          console.log("Refreshing token...");
          const refreshedToken = await refreshAccessToken(session.refreshToken);
          if (refreshedToken) {
            await update(refreshedToken);
          }
        }
      } catch (error) {
        console.error("Error in session check:", error);
        if (error instanceof Error && error.message.includes('token_not_valid')) {
          await handleSessionExpired();
        }
      }
    };

    // Initial check
    checkAndRefreshSession();

    // Set up interval
    checkInterval.current = setInterval(checkAndRefreshSession, SESSION_CHECK_INTERVAL);

    return () => {
      if (checkInterval.current) {
        clearInterval(checkInterval.current);
      }
    };
  }, [session, status, update, isOnPublicPage, handleSessionExpired, toast]);

  return null;
}
