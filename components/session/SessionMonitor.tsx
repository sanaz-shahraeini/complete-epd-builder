"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSession, signOut } from "next-auth/react";
import { refreshAccessToken } from "@/lib/api/auth";
import { useRouter } from "@/i18n/navigation";
import { useToast } from "@/components/ui/use-toast";
import { useUserStore } from "@/lib/store/user";
import { usePathname } from "@/i18n/navigation";

// Constants for session management
const SESSION_CHECK_INTERVAL = 15 * 60 * 1000; // Check every 15 minutes (increased from 5)
const TOKEN_REFRESH_THRESHOLD = 20 * 60 * 1000; // Refresh if less than 20 minutes left (increased from 10)
const SESSION_TIMEOUT =
  Number(process.env.NEXT_PUBLIC_SESSION_TIMEOUT) || 4 * 60 * 60 * 1000; // 4 hours default (increased from 2)
const WARNING_TIME = 10 * 60 * 1000; // 10 minutes before timeout (increased from 5)

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
  const isInitialMount = useRef(true);
  const redirectInProgress = useRef(false);

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
      (/^epd\/(en|de)\/[^/]*$/.test(pathname) && !pathname.includes("dashboard"))
    );
  }, [pathname]);

  // Detect if we're on a profile page to prevent infinite loops
  const isProfilePage = pathname?.includes('/dashboard/profile');

  // Handle session expiration
  const handleSessionExpired = useCallback(async () => {
    if (isHandlingExpiry.current || redirectInProgress.current) return;
    isHandlingExpiry.current = true;

    try {
      console.log("Session expired, signing out...");
      await signOut({ redirect: false });
      
      toast({
        title: "Session Expired",
        description: "You have been logged out due to inactivity.",
        variant: "destructive",
      });

      // Use a ref to track redirect state instead of component state
      redirectInProgress.current = true;
      setShowSignInModal(true);
      
      // Use window.location for direct navigation instead of router
      window.location.href = "/";
    } catch (error) {
      console.error("Error handling session expiry:", error);
    } finally {
      isHandlingExpiry.current = false;
    }
  }, [toast, setShowSignInModal]);

  // Handle user activity
  const updateActivity = useCallback(() => {
    lastActivity.current = Date.now();
  }, []);

  // After authentication is checked, handle the possible redirect
  useEffect(() => {
    // Skip for profile page to prevent infinite loops
    if (isProfilePage) {
      console.log('SessionMonitor: Skipping redirect handling on profile page');
      return;
    }

    // Only check for unauthenticated users on protected routes
    const isProtectedRoute =
      pathname?.startsWith('/epd/') &&
      !pathname.includes('/dashboard/profile');

    if (status === "unauthenticated" && isProtectedRoute) {
      console.log('User is not authenticated on protected route:', pathname);
      
      // Show sign-in modal
      setShowSignInModal(true);
      
      if (redirectInProgress.current) {
        return;
      }
      
      redirectInProgress.current = true;
      
      // For routes that are not the profile page, redirect to home
      if (!pathname?.includes('/dashboard/profile')) {
        console.log('Redirecting unauthenticated user to home page');
        // Use window.location for direct navigation
        window.location.href = "/";
      }
    }
  }, [status, isOnPublicPage, setShowSignInModal, pathname, isProfilePage]);

  // Check session status only once on initial mount
  useEffect(() => {
    // Early return for profile page to prevent infinite loops
    if (isProfilePage) {
      console.log('SessionMonitor: Skipping authentication check on profile page');
      return;
    }

    // Skip this effect on initial mount to prevent immediate redirects
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Skip redirect for profile page to prevent circular navigation
    if (pathname?.includes('/dashboard/profile')) {
      console.log('Profile page detected, skipping auth redirect');
      return;
    }

    if (status === "unauthenticated" && !redirectInProgress.current && !isOnPublicPage()) {
      console.log('Unauthenticated user on protected page, redirecting');
      redirectInProgress.current = true;
      setShowSignInModal(true);
      
      // Use window.location for direct navigation
      window.location.href = "/";
    }
  }, [status, isOnPublicPage, setShowSignInModal, pathname, isProfilePage]);

  // Monitor user activity
  useEffect(() => {
    // Early return for profile page to prevent infinite loops
    if (isProfilePage) {
      console.log('SessionMonitor: Skipping user activity monitoring on profile page');
      return;
    }

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
  }, [status, isOnPublicPage, updateActivity, isProfilePage]);

  // Debounce function to limit API calls
  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout | null = null;
    return (...args: any[]) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  // Session refresh and check - with additional guards against infinite loops
  useEffect(() => {
    // Early return for profile page to prevent infinite loops
    if (isProfilePage) {
      console.log('SessionMonitor: Skipping session refresh on profile page');
      return;
    }

    // Skip this effect if we're already handling a redirect
    if (redirectInProgress.current) return;
    
    if (!session?.user || status !== "authenticated" || isOnPublicPage()) {
      if (checkInterval.current) {
        clearInterval(checkInterval.current);
      }
      return;
    }

    // Last time we refreshed the token
    const lastRefreshTime = useRef(Date.now());

    const checkAndRefreshSession = async () => {
      // Skip if already handling expiry or redirect
      if (isHandlingExpiry.current || redirectInProgress.current) return;
      
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
            description: "Your session will expire in 10 minutes. Please save your work.",
            variant: "default",
            duration: 10000,
          });
        }

        // Refresh token if needed, but not more often than every 10 minutes
        const timeSinceLastRefresh = Date.now() - lastRefreshTime.current;
        if (timeUntilExpiry < TOKEN_REFRESH_THRESHOLD && session.refreshToken && timeSinceLastRefresh > 10 * 60 * 1000) {
          console.log("Refreshing token...");
          lastRefreshTime.current = Date.now();
          const refreshedToken = await refreshAccessToken(session.refreshToken);
          if (refreshedToken) {
            // Debounce the update call to prevent multiple rapid updates
            debounce(async () => {
              await update(refreshedToken);
            }, 5000)();
          }
        }
      } catch (error) {
        console.error("Error in session check:", error);
        if (error instanceof Error && error.message.includes('token_not_valid')) {
          await handleSessionExpired();
        }
      }
    };

    // Initial check - with longer delay to prevent immediate API calls on page load
    const initialCheckTimeout = setTimeout(checkAndRefreshSession, 10000);

    // Set up interval with a random offset to prevent synchronized calls
    const randomOffset = Math.floor(Math.random() * 60000); // Random offset up to 1 minute
    checkInterval.current = setInterval(checkAndRefreshSession, SESSION_CHECK_INTERVAL + randomOffset);

    return () => {
      if (initialCheckTimeout) clearTimeout(initialCheckTimeout);
      if (checkInterval.current) {
        clearInterval(checkInterval.current);
      }
    };
  }, [session, status, update, isOnPublicPage, handleSessionExpired, toast, pathname, isProfilePage]);

  return null;
}