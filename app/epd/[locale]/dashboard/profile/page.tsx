'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ProfilePage() {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Load user data from localStorage on client side only
  useEffect(() => {
    try {
      // Try to get user data from local storage
      const userStoreData = localStorage.getItem('user-store');
      if (userStoreData) {
        const parsedData = JSON.parse(userStoreData);
        if (parsedData?.state?.user) {
          console.log('Loading profile from localStorage');
          setUserData(parsedData.state.user);
        }
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6">Profile Information</h1>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold mb-6">Not Authenticated</h1>
          <p className="mb-4">You need to be logged in to view your profile information.</p>
          <Link href="/epd/en/dashboard">
            <span className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-gray-300 bg-white hover:bg-gray-100 h-10 px-4 py-2">
              Back to Dashboard
            </span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Profile Information</h1>
        
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-medium mb-2">Personal Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <p className="text-gray-900 border rounded-md px-3 py-2 bg-gray-50">
                  {userData.first_name || 'Not available'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <p className="text-gray-900 border rounded-md px-3 py-2 bg-gray-50">
                  {userData.last_name || 'Not available'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <p className="text-gray-900 border rounded-md px-3 py-2 bg-gray-50">
                  {userData.email || 'Not available'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company
                </label>
                <p className="text-gray-900 border rounded-md px-3 py-2 bg-gray-50">
                  {userData.company_name || 'Not available'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="pt-4">
            <Link href="/epd/en/dashboard">
              <span className="inline-flex items-center justify-center rounded-md text-sm font-medium border border-gray-300 bg-white hover:bg-gray-100 h-10 px-4 py-2">
                Back to Dashboard
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}