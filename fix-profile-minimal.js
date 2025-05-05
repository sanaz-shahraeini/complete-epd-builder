const fs = require('fs');
const path = require('path');

// Define the path to the profile page
const profilePagePath = path.join(__dirname, 'app', 'epd', '[locale]', 'dashboard', 'profile', 'page.tsx');

// Define the new content for the profile page - extremely minimal version
const newContent = `"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "@/i18n/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const { status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  
  // Single effect with no dependencies
  useEffect(() => {
    // Check if user is authenticated
    if (status === 'unauthenticated') {
      router.replace('/epd/en');
      return;
    }
    
    // Set loading to false after a short delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    // Cleanup
    return () => clearTimeout(timer);
  }, [status, router]);

  // Loading state
  if (isLoading || status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  // Simple static profile display
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Profile Information</h1>
        <p className="mb-4">Your profile information is currently unavailable.</p>
        <p className="text-sm text-gray-500 mb-6">
          We're working on resolving some technical issues with the profile page.
        </p>
        <Button 
          variant="outline" 
          onClick={() => router.push('/epd/en/dashboard')}
        >
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
}`;

// Write the new content to the profile page
try {
  fs.writeFileSync(profilePagePath, newContent, 'utf8');
  console.log('Profile page updated with minimal version successfully!');
} catch (error) {
  console.error('Error updating profile page:', error);
}
