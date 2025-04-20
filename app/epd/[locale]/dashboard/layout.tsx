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
  console.log('Current locale:', locale)

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getUserProfile()
        setUser(userData)
      } catch (error) {
        console.error('Failed to fetch user data', error)
      }
    }

    fetchUserData()
  }, [setUser])

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