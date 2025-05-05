const fs = require('fs');
const path = require('path');

// Define the path to the profile page
const profilePagePath = path.join(__dirname, 'app', 'epd', '[locale]', 'dashboard', 'profile', 'page.tsx');

// Define the new content for the profile page - completely static version
const newContent = `"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ProfilePage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Profile Information</h1>
        <p className="mb-4">Your profile information is currently unavailable.</p>
        <p className="text-sm text-gray-500 mb-6">
          We're working on resolving some technical issues with the profile page.
        </p>
        <Link href="/epd/en/dashboard" passHref>
          <Button variant="outline">
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}`;

// Write the new content to the profile page
try {
  fs.writeFileSync(profilePagePath, newContent, 'utf8');
  console.log('Profile page updated with static version successfully!');
} catch (error) {
  console.error('Error updating profile page:', error);
}
