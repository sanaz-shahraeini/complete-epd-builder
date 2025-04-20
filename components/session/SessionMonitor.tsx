"use client";

import { useEffect, useRef, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { refreshAccessToken } from "@/lib/api/auth";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";

// Constants for session management
const SESSION_CHECK_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes
const TOKEN_REFRESH_THRESHOLD = 10 * 60 * 1000; // Refresh if less than 10 minutes left
const SESSION_TIMEOUT =
  Number(process.env.NEXT_PUBLIC_SESSION_TIMEOUT) || 2 * 60 * 60 * 1000; // 2 hours default
const WARNING_TIME = 5 * 60 * 1000; // 5 minutes before timeout

export function SessionMonitor() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const checkInterval = useRef<NodeJS.Timeout>();
  const [hasRedirected, setHasRedirected] = useState(false);

  // Detect if we're on a public page that doesn't require authentication
  const isOnPublicPage = () => {
    if (typeof window === "undefined") return false;

    const path = window.location.pathname;
    return (
      path.includes("/signin") ||
      path.includes("/signup") ||
      path.includes("/forgot-password") ||
      path.includes("/auth")
    );
  };

  useEffect(() => {
    // Only redirect if:
    // 1. Status is explicitly unauthenticated (not loading)
    // 2. We haven't redirected already (to prevent loops)
    // 3. We're not already on a public page
    if (status === "unauthenticated" && !hasRedirected && !isOnPublicPage()) {
      console.log(
        "User is unauthenticated and not on public page, redirecting to signin..."
      );
      setHasRedirected(true);

      // Use a timeout to prevent potential redirect loops
      setTimeout(() => {
        // Use router.push instead of window.location for better Next.js integration
        router.push("/signin?source=session_expired");
      }, 100);
    }
  }, [status, hasRedirected, router]);

  useEffect(() => {
    let inactivityTimeout: NodeJS.Timeout;
    let warningTimeout: NodeJS.Timeout;
    let lastActivity = Date.now();

    // Don't monitor sessions on public pages
    if (isOnPublicPage()) {
      return;
    }

    const handleSessionExpired = async () => {
      console.log("Session expired, signing out...");

      // Prevent multiple sign-outs
      if (hasRedirected) return;
      setHasRedirected(true);

      await signOut({
        redirect: false,
        callbackUrl: "/signin",
      });

      toast({
        title: "Session Expired",
        description: "You have been logged out due to inactivity.",
        variant: "destructive",
      });

      // Use router for navigation
      router.push("/signin?source=inactivity");
    };

    // Reset the redirect flag if we get a valid session
    if (status === "authenticated" && session) {
      setHasRedirected(false);
    }

    // Function to handle user activity
    const updateActivity = () => {
      lastActivity = Date.now();
      // Refresh the session
      update().catch((error) => {
        console.error("Session refresh failed:", error);
        handleSessionExpired();
      });
    };

    const showWarning = () => {
      toast({
        title: "Session Warning",
        description:
          "Your session will expire in 5 minutes. Please save your work.",
        variant: "default",
        duration: 10000,
      });
    };

    // Function to check inactivity
    const checkInactivity = () => {
      const inactiveTime = Date.now() - lastActivity;

      if (inactiveTime >= SESSION_TIMEOUT) {
        handleSessionExpired();
      } else if (inactiveTime >= SESSION_TIMEOUT - WARNING_TIME && session) {
        showWarning();
      }
    };

    // Only set up activity monitoring if authenticated
    if (status === "authenticated") {
      // Set up activity listeners
      const events = [
        "mousedown",
        "mousemove",
        "keypress",
        "scroll",
        "touchstart",
        "click",
      ];

      // Add event listeners
      events.forEach((event) => {
        window.addEventListener(event, updateActivity);
      });

      // Start inactivity check
      inactivityTimeout = setInterval(checkInactivity, 60000); // Check every minute

      // Set up warning timeout
      warningTimeout = setInterval(() => {
        const inactiveTime = Date.now() - lastActivity;
        if (inactiveTime >= SESSION_TIMEOUT - WARNING_TIME && session) {
          showWarning();
        }
      }, WARNING_TIME);

      return () => {
        // Clean up
        events.forEach((event) => {
          window.removeEventListener(event, updateActivity);
        });
        clearInterval(inactivityTimeout);
        clearInterval(warningTimeout);
      };
    }
  }, [router, toast, session, status, update, hasRedirected]);

  useEffect(() => {
    // Don't check session on public pages or when unauthenticated
    if (isOnPublicPage() || status !== "authenticated" || !session) {
      return () => {
        if (checkInterval.current) {
          clearInterval(checkInterval.current);
        }
      };
    }

    const checkAndRefreshSession = async () => {
      try {
        if (!session?.user) {
          console.log("No active session found");
          return;
        }

        const tokenExpiry = session.expires
          ? new Date(session.expires).getTime()
          : 0;
        const timeUntilExpiry = tokenExpiry - Date.now();

        // If token is about to expire, try to refresh it
        if (timeUntilExpiry < TOKEN_REFRESH_THRESHOLD) {
          console.log("Token needs refresh, attempting to refresh...");

          if (session.refreshToken) {
            try {
              const refreshedToken = await refreshAccessToken(
                session.refreshToken
              );
              if (refreshedToken) {
                await update(refreshedToken);
                console.log("Token refreshed successfully");
                return;
              }
            } catch (error) {
              console.error("Failed to refresh token:", error);
            }
          }

          // If refresh failed or no refresh token, sign out and redirect
          if (!hasRedirected) {
            console.log("Session expired, signing out...");
            setHasRedirected(true);
            await signOut({ redirect: false });
            router.push("/signin?source=token_expired");
          }
        }
      } catch (error) {
        console.error("Error checking session:", error);
      }
    };

    // Set up periodic session check
    checkInterval.current = setInterval(
      checkAndRefreshSession,
      SESSION_CHECK_INTERVAL
    );

    // Initial check
    checkAndRefreshSession();

    return () => {
      if (checkInterval.current) {
        clearInterval(checkInterval.current);
      }
    };
  }, [session, status, update, router, hasRedirected]);

  // This is a background component, no UI needed
  return null;
}
