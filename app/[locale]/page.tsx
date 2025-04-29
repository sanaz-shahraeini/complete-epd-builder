"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useSession } from "next-auth/react";
import { useUserStore } from "@/lib/store/user";
import { useTranslations } from "next-intl";

export default function LocalePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const setShowSignInModal = useUserStore((state) => state.setShowSignInModal);
  const t = useTranslations();

  useEffect(() => {
    // If authenticated, redirect to dashboard
    if (status === "authenticated") {
      router.replace("/epd/en/dashboard");
      return;
    }

    // Show sign-in modal for unauthenticated users
    setShowSignInModal(true);
  }, [status, router, setShowSignInModal]);

  // You can add a loading state or some content here if needed
  return (
    <div className="min-h-screen flex items-center justify-center">
      {/* Add your landing page content here */}
    </div>
  );
} 