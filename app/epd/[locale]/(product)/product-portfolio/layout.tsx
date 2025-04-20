"use client"

import { ReactNode } from 'react'
import { useUserStore } from "@/lib/store/user"
import { useEffect } from "react"
import { getUserProfile } from "@/lib/api/auth"
import { Sidebar } from "@/components/sidebar"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from 'lucide-react'
import { ModeToggle } from "@/components/mode-toggle"

export default function ProductPortfolioLayout({ 
  children 
}: { 
  children: ReactNode 
}) {
  const { setUser } = useUserStore()

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
    <div className="flex min-h-screen bg-white dark:bg-black">
      {/* Desktop Sidebar */}
      <div className="fixed inset-y-0  z-50 hidden md:block w-60">
        <Sidebar className="h-full" />
      </div>

      {/* Mobile Controls */}
      <div className="fixed top-4 right-4 flex items-center gap-2 md:hidden z-50">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0 bg-white dark:bg-black border-r dark:border-gray-800">
            <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
            <Sidebar className="h-full" />
          </SheetContent>
        </Sheet>
        <ModeToggle />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-2  bg-white dark:bg-black d:w-[mcalc(100%-256px)] md:ml-64">
        {children}
      </div>
    </div>
  )
}
