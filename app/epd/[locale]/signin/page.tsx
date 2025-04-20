"use client";

import { useState, useEffect } from "react";
import SignInForm from "@/components/sign/SignInForm";
import { useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

// Import UI components to ensure styles are loaded
import '@/components/ui' 

export default function SignInPage() {
  const [isOpen, setIsOpen] = useState(true);
  const [initialLoad, setInitialLoad] = useState(true);
  const router = useRouter();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const callbackUrl =
    searchParams?.get("callbackUrl") || `/epd/${locale}/dashboard/profile`;
  const { status, data: session } = useSession();

  // Check if we should skip redirects (to prevent loops)
  const skipRedirect =
    searchParams?.get("noredirect") === "true" ||
    searchParams?.get("source") === "session_expired";

  useEffect(() => {
    // Wait a bit for session to load to prevent flashing
    const timer = setTimeout(() => {
      setInitialLoad(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Don't redirect if we're told to skip it or still in initial load
    if (skipRedirect || initialLoad) {
      return;
    }

    // If authenticated, redirect to appropriate dashboard
    if (status === "authenticated" && session?.user) {
      console.log(
        "SignInPage: User is authenticated, redirecting to dashboard"
      );

      const destination =
        session.user.user_type === "regular"
          ? `/epd/${locale}/dashboard/coming-soon`
          : `/epd/${locale}/dashboard/profile`;

      router.replace(`${destination}?noredirect=true`);
    }
  }, [status, session, router, locale, skipRedirect, initialLoad]);

  // Show loading state while checking session
  if (initialLoad || status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Don't render the form if we need to redirect (prevents flash)
  if (status === "authenticated" && !skipRedirect) {
    return null;
  }

  const handleClose = () => {
    setIsOpen(false);
    router.push(`/epd/${locale}`);
  };

  const handleShowSignUp = (show: boolean) => {
    if (show) {
      router.push(
        `/epd/${locale}/signup${
          callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""
        }`
      );
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <SignInForm
        open={isOpen}
        onClose={handleClose}
        setShowSignUp={handleShowSignUp}
        callbackUrl={callbackUrl}
      />
    </div>
  );
}
