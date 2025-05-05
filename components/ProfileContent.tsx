'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Create a completely isolated profile component that doesn't use the Zustand store
export default function ProfileContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Handle unauthenticated state
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/epd/en');
      return;
    }

    // Directly fetch profile data if authenticated, bypassing Zustand store
    if (status === 'authenticated' && session?.user) {
      setProfileData({
        firstName: session.user.name?.split(' ')[0] || 'User',
        lastName: session.user.name?.split(' ')[1] || '',
        email: session.user.email || '',
        image: session.user.image || null,
      });
      setLoading(false);
    }
  }, [session, status, router]);

  // Simple error handling
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6 text-red-600">Error</h1>
          <p className="mb-4">{error}</p>
          <a 
            href="/epd/en/dashboard"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading || !profileData) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6">Profile Information</h1>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          </div>
        </div>
      </div>
    );
  }

  // Render profile data
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Profile Information</h1>
        
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-medium mb-2">Personal Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  First Name
                </label>
                <p className="text-gray-900 dark:text-gray-100 border rounded-md px-3 py-2 bg-gray-50 dark:bg-gray-900">
                  {profileData.firstName}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Last Name
                </label>
                <p className="text-gray-900 dark:text-gray-100 border rounded-md px-3 py-2 bg-gray-50 dark:bg-gray-900">
                  {profileData.lastName}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <p className="text-gray-900 dark:text-gray-100 border rounded-md px-3 py-2 bg-gray-50 dark:bg-gray-900">
                  {profileData.email}
                </p>
              </div>
            </div>
          </div>
          
          <div className="pt-4">
            <a 
              href="/epd/en/dashboard"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
            >
              Back to Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
