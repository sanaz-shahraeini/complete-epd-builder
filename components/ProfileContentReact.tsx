'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from 'next/link';

// IMPORTANT: This component intentionally does NOT use the Zustand store to avoid rendering loops
export default function ProfileContentReact() {
  const { data: session, status } = useSession();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const hasInitialized = useRef(false);

  // Load profile data from session or localStorage, not from Zustand store
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    try {
      // Try to get user data from local storage
      const userStoreData = localStorage.getItem('user-store');
      if (userStoreData) {
        const parsedData = JSON.parse(userStoreData);
        if (parsedData?.state?.user) {
          console.log('Loading profile from localStorage');
          setProfile(parsedData.state.user);
          setLoading(false);
          return;
        }
      }
      
      // Fall back to session data if available
      if (status === 'authenticated' && session?.user) {
        console.log('Loading profile from session');
        setProfile({
          first_name: session.user.name?.split(' ')[0] || 'User',
          last_name: session.user.name?.split(' ')[1] || '',
          email: session.user.email || '',
          profile_picture_url: session.user.image || '',
        });
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading profile data:', error);
      setLoading(false);
    }
  }, [session, status]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>View and manage your profile details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Not Authenticated</CardTitle>
            <CardDescription>You need to be logged in to view your profile</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Please sign in to access your profile information.</p>
          </CardContent>
          <CardFooter>
            <Link href="/epd/en/dashboard">
              <Button>Back to Dashboard</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-12 w-12">
            {profile.profile_picture_url ? (
              <AvatarImage src={profile.profile_picture_url} alt={`${profile.first_name} ${profile.last_name}`} />
            ) : (
              <AvatarFallback>{profile.first_name?.[0]?.toUpperCase()}</AvatarFallback>
            )}
          </Avatar>
          <div>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>View and manage your profile details</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-medium mb-2">Personal Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input id="firstName" value={profile.first_name || ''} readOnly className="bg-gray-50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input id="lastName" value={profile.last_name || ''} readOnly className="bg-gray-50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" value={profile.email || ''} readOnly className="bg-gray-50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Company</Label>
                  <Input id="company" value={profile.company_name || ''} readOnly className="bg-gray-50" />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Link href="/epd/en/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
