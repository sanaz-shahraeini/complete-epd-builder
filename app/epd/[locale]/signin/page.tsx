"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useSession } from "next-auth/react";
import { useUserStore } from "@/lib/store/user";
import { useTranslations } from "next-intl";

export default function SignInPage() {
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

    // Show sign-in modal
    setShowSignInModal(true);

    // Redirect to home page after showing modal
    router.replace("/epd/en");
  }, [status, router, setShowSignInModal]);

  return null; // No UI needed as we're using a modal
} 