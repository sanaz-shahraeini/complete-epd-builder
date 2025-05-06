'use client'

import { Sidebar } from "@/components/sidebar"
import { AdminSidebar } from "@/app/epd/components/dashboard/AdminSidebar"

import { useEffect, useState } from "react"
import { useUserStore } from "@/lib/store/user"
import { getUserProfile } from "@/lib/api/auth"
import { UsersProvider } from "@/lib/context/UsersContext"
import Header from "@/components/Header"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Menu, Users, X } from "lucide-react"
import { useTranslations, useLocale } from "next-intl"


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { setUser } = useUserStore()
  const user = useUserStore((state) => state.user)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isAdminSidebarOpen, setIsAdminSidebarOpen] = useState(false)
  const locale = useLocale()
  const [isProfilePage, setIsProfilePage] = useState(false)
  const [userDataFetched, setUserDataFetched] = useState(false)

  // Check if we're on the profile page to prevent update loops - improved detection
  useEffect(() => {
    // Check location based on window object to avoid dependency on router
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const isProfile = path.includes('/dashboard/profile') || 
                        path.includes('/epd/en/dashboard/profile') || 
                        path.includes('/epd/en/en/dashboard/profile') ||
                        path.match(/\/epd\/[a-z]{2}\/dashboard\/profile/);
      
      setIsProfilePage(isProfile);
      console.log('Is profile page:', isProfile, 'Path:', path);
    }
  }, []);

  // Fetch user data only if needed and not on profile page
  useEffect(() => {
    // Skip effect if we're on the profile page or already fetched data
    if (isProfilePage || userDataFetched) {
      console.log('Skipping user data fetch: isProfilePage=', isProfilePage, 'userDataFetched=', userDataFetched);
      return;
    }

    // If we already have user data, just mark as fetched
    if (user) {
      console.log('Already have user data, marking as fetched');
      setUserDataFetched(true);
      return;
    }

    let isMounted = true;
    const controller = new AbortController();
    
    const fetchUserData = async () => {
      try {
        console.log('Fetching user data from dashboard layout');
        const userData = await getUserProfile();
        
        if (isMounted && userData) {
          console.log('User data fetched successfully:', userData);
          // Only set user if we're not on profile page to prevent loops
          if (!isProfilePage) {
            setUser(userData);
          }
          setUserDataFetched(true);
        }
      } catch (error) {
        console.error('Failed to fetch user data', error);
        // Mark as fetched even on error to prevent loops
        setUserDataFetched(true);
      }
    };

    fetchUserData();
    
    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [isProfilePage, userDataFetched]); // Remove user from dependencies to prevent loops

  return (
    <UsersProvider>
      <div className="flex h-screen bg-gray-50/50 dark:bg-black/50 overflow-x-hidden">
        {/* Desktop Sidebar */}
        <div className="fixed inset-y-0 left-0 z-50 hidden md:block w-64">
          <Sidebar className="h-full" />
        </div>

        {/* Mobile Sidebar */}
        <div 
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 transform transition-transform duration-200 ease-in-out md:hidden",
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <Sidebar className="h-full" onMobileClose={() => setIsMobileMenuOpen(false)} />
        </div>

        {/* Main Content */}
        <div className="flex-1 w-full md:w-[calc(100%-256px)] md:ml-64 transition-all duration-300 ease-in-out overflow-x-hidden">
          {/* Header */}
          <Header 
            user={user} 
            onMobileMenuClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            onAdminPanelClick={() => setIsAdminSidebarOpen(!isAdminSidebarOpen)}
          />

          <main className="p-4 md:p-6 w-full max-w-full overflow-x-hidden ">
            <div className="flex flex-col lg:flex-row gap-6 w-full">
              <div className="flex-1 w-full overflow-x-hidden">
                {children}
              </div>

              {/* Right side - Admin Sidebar */}
              <div className={cn(
                "w-full lg:w-80 bg-white dark:bg-black lg:static lg:block",
                "fixed inset-y-0 right-0 z-50 transform transition-transform duration-200 ease-in-out",
                isAdminSidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
              )}>
                {/* Mobile Close Button */}
                <div className="flex justify-end p-4 lg:hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsAdminSidebarOpen(false)}
                    className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <AdminSidebar 
                  currentUser={user ? { ...user } as any : undefined}
                  onAddUser={() => console.log('Add new user')}
                />
              </div>
            </div>
          </main>
        </div>

        {/* Mobile Overlay for Main Sidebar */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Overlay for Admin Sidebar */}
        {isAdminSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsAdminSidebarOpen(false)}
          />
        )}
      </div>
    </UsersProvider>
  )
}