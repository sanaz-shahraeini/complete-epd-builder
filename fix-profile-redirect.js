const fs = require('fs');
const path = require('path');

// Define the path to the profile page
const profilePagePath = path.join(__dirname, 'app', 'epd', '[locale]', 'dashboard', 'profile', 'page.tsx');

// Define the new content for the profile page - with fixed redirect paths
const newContent = `"use client";

import { useState, useEffect, useRef } from "react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getUserProfile } from "@/lib/api/auth";
import { useUserStore } from "@/lib/store/user";

export default function ProfilePage() {
  // Use refs to prevent re-renders
  const initializedRef = useRef(false);
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslations();
  const p = useTranslations('Profile');
  const { setShowSignInModal } = useUserStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState(null);

  // This effect will only run once when the component mounts
  useEffect(() => {
    // Prevent multiple initializations
    if (initializedRef.current) return;
    initializedRef.current = true;
    
    const checkAuthAndLoadProfile = async () => {
      // Check authentication
      if (status === 'unauthenticated') {
        setShowSignInModal(true);
        // Use absolute path to avoid double locale prefixing
        window.location.href = '/epd/en';
        return;
      }
      
      if (status !== 'authenticated') {
        return; // Still loading auth state
      }
      
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch user profile
        const userProfile = await getUserProfile();
        
        // Only update state if component is still mounted and not already initialized
        if (initializedRef.current) {
          if (userProfile) {
            setProfile(userProfile);
          } else {
            setError('Could not load profile data');
          }
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        
        if (initializedRef.current) {
          setError('An error occurred while loading your profile');
          
          // Handle token expiration
          if (err instanceof Error && err.message.includes('token_not_valid')) {
            await signOut({ redirect: false });
            setShowSignInModal(true);
            // Use absolute path to avoid double locale prefixing
            window.location.href = '/epd/en';
          }
        }
      } finally {
        if (initializedRef.current) {
          setIsLoading(false);
        }
      }
    };
    
    // Use setTimeout to ensure this runs after initial render
    const timer = setTimeout(() => {
      checkAuthAndLoadProfile();
    }, 0);
    
    // Cleanup function
    return () => {
      clearTimeout(timer);
      initializedRef.current = false;
    };
  }, []); // Empty dependency array means this effect runs once on mount

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Error Loading Profile</h2>
        <p className="text-gray-600 mb-6">{error}</p>
        <Button 
          variant="outline"
          onClick={() => {
            // Use absolute path to avoid double locale prefixing
            window.location.href = '/epd/en/dashboard';
          }}
        >
          Back to Dashboard
        </Button>
      </div>
    );
  }

  // Success state - display a simplified profile
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Profile Information</h1>
        
        {profile ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{profile.first_name} {profile.last_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{profile.email}</p>
                  </div>
                  {profile.username && (
                    <div>
                      <p className="text-sm text-gray-500">Username</p>
                      <p className="font-medium">{profile.username}</p>
                    </div>
                  )}
                  {profile.company_name && (
                    <div>
                      <p className="text-sm text-gray-500">Company</p>
                      <p className="font-medium">{profile.company_name}</p>
                    </div>
                  )}
                  {profile.country && (
                    <div>
                      <p className="text-sm text-gray-500">Country</p>
                      <p className="font-medium">{profile.country}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold mb-4">Account Information</h2>
                <div className="space-y-3">
                  {profile.user_type && (
                    <div>
                      <p className="text-sm text-gray-500">Account Type</p>
                      <p className="font-medium capitalize">{profile.user_type}</p>
                    </div>
                  )}
                  {profile.created_at && (
                    <div>
                      <p className="text-sm text-gray-500">Member Since</p>
                      <p className="font-medium">{new Date(profile.created_at).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button 
                variant="outline" 
                onClick={() => {
                  // Use absolute path to avoid double locale prefixing
                  window.location.href = '/epd/en/dashboard';
                }}
              >
                Back to Dashboard
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <p className="mb-4">No profile data available.</p>
            <Button 
              variant="outline" 
              onClick={() => {
                // Use absolute path to avoid double locale prefixing
                window.location.href = '/epd/en/dashboard';
              }}
            >
              Back to Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}`;

// Write the new content to the profile page
try {
  fs.writeFileSync(profilePagePath, newContent, 'utf8');
  console.log('Profile page updated with fixed redirects successfully!');
} catch (error) {
  console.error('Error updating profile page:', error);
}
