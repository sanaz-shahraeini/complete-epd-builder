"use client";

import { useState, useEffect } from 'react';
import SignUpForm from '@/components/sign/SignUpForm';
import { useRouter } from '@/i18n/navigation';
import { useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';

const SignUpPage = () => {
  const router = useRouter();
  const locale = useLocale();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);

  // Get the callbackUrl from URL parameters or use default
  const defaultPath = '/dashboard/profile';
  const callbackUrl = searchParams?.get('callbackUrl') || defaultPath;

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleClose = () => {
    router.push(`/${locale}`);
  };

  const handleSignInClick = () => {
    router.push(`/${locale}/signin${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`);
  };

  const handleShowSignUp = () => {
    // This function is required by the SignUpForm props but since we're already
    // on the signup page, we don't need to do anything here
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-black p-4">
      <SignUpForm
        open={true}
        onClose={handleClose}
        setShowSignIn={handleSignInClick}
        setShowSignUp={handleShowSignUp}
      />
    </div>
  );
};

export default SignUpPage;
