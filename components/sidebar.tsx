'use client'

import Link from 'next/link'
import { useRouter, usePathname } from "next/navigation"
import { BarChart2, FileText, Settings, Search, MessageSquare, LogOut, Menu } from 'lucide-react'
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { useTranslations } from 'next-intl'
import { signOut } from "next-auth/react"
import { useUserStore } from '@/lib/store/user'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useEffect, useRef } from 'react'
import { ImImage } from 'react-icons/im'
import Image from 'next/image'
import { useLocale } from "next-intl"
import { useRouter as useNextRouter } from "@/i18n/navigation"
import { germanToEnglishPaths } from "@/lib/i18n-paths"

interface SidebarProps {
  className?: string;
  onMobileClose?: () => void;
}

export function Sidebar({ className, onMobileClose }: SidebarProps) {
  return (
    <div className={`w-64 h-screen bg-white dark:bg-black border-r dark:border-gray-800 ${className}`}>
      <SidebarContent isMobile={false} onMobileClose={onMobileClose} />
    </div>
  )
}

// Extract sidebar content to a separate component for reuse
function SidebarContent({ isMobile, onMobileClose }: { isMobile?: boolean; onMobileClose?: () => void }) {
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()
  
  // Use a reducer pattern to minimize store subscriptions
  const userState = useUserStore((state) => ({
    user: state.user,
    clearUser: state.clearUser,
    setShowSignInModal: state.setShowSignInModal
  }))
  const { setShowSignInModal } = userState
  const n = useTranslations('Navigation')

  // Skip circular update on profile page
  const isProfilePage = pathname?.includes('/dashboard/profile')
  
  // Use useRef to avoid re-renders from console logs
  const logRef = useRef({
    logged: false
  })

  useEffect(() => {
    // Skip effect for profile page
    if (isProfilePage) {
      return
    }
    
    // Log only once to prevent update loops
    if (!logRef.current.logged && userState.user) {
      logRef.current.logged = true
      console.log('User data in sidebar:', {
        name: `${userState.user.first_name} ${userState.user.last_name}`,
        picture: userState.user.profile_picture_url
      })
    }
  }, [userState.user, isProfilePage])

  useEffect(() => {
    if (userState.user) {
      console.log('Current user in sidebar:', userState.user)
    }
  }, [userState.user])

  const isLinkActive = (path: string) => {
    // Handle potential pathname differences between dev and production
    if (!pathname) return false;
    
    const sanitizedPathname = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
    const sanitizedPath = path.endsWith('/') ? path.slice(0, -1) : path;
    
    return sanitizedPathname === sanitizedPath || sanitizedPathname.startsWith(`${sanitizedPath}/`);
  };

  const getLinkClassName = (path: string) => {
    const baseClasses = "flex items-center space-x-3 px-3 py-2 rounded-lg"
    const isActive = isLinkActive(path)
    
    return `${baseClasses} ${
      isActive
        ? "text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-black"
        : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900"
    }`
  }

  const handleLogout = async () => {
    try {
      if (isMobile && onMobileClose) {
        onMobileClose()
      }
      
      // Get the current path for analytics
      const currentPath = pathname || '/';

      // Log the user's navigation path before logout
      console.log('User navigation before logout:', {
        path: currentPath,
        locale: currentPath.split('/')[2] || locale,
        timestamp: new Date().toISOString(),
      });

      // Log any query parameters
      if (typeof window !== 'undefined') {
        console.log('URL search params:', window.location.search);
      }

      // Clear the user data from the store
      userState.clearUser()
      
      // Clear tokens from local storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
      
      // Perform logout with explicit configuration
      await signOut({
        redirect: false
      });
      
      // Show sign-in modal after logout
      setShowSignInModal(true);
      
      // Redirect to the home page
      router.push('/');
      
    } catch (error) {
      console.error('Logout process failed:', error);
      
      // Clear tokens from local storage (in case the signOut failed)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
      
      // Show sign-in modal even if logout failed
      setShowSignInModal(true);
      
      // Redirect to the home page
      router.push('/');
    }
  };

  // Add event listener to capture any potential issues
  useEffect(() => {
    // Skip for profile page
    if (isProfilePage) {
      return
    }
    
    const logoutButton = document.querySelector('button[type="button"]');
    if (logoutButton) {
      const handleClick = (e: Event) => {
        console.log('Logout button clicked', { 
          event: e, 
          isMobile,
          pathname 
        });
      };
      
      logoutButton.addEventListener('click', handleClick);
      
      return () => {
        logoutButton.removeEventListener('click', handleClick);
      };
    }
  }, [isMobile, pathname, isProfilePage]);

  return (
    <div className="flex flex-col h-full relative">
      {/* Logo */}
      <div className={`${isMobile ? 'p-6' : 'p-6'}`}>
        <Image
          src="/assets/images/ipsum-logo.svg" 
          alt="Ipsum"
          width={120}
          height={35}
          priority
          className="w-auto h-auto"
        />
      </div>

      {/* User Info */}
      <div className={`${isMobile ? 'p-4' : 'p-4'} flex items-center space-x-3`}>
        <Avatar className="w-8 h-8">
          {userState.user?.profile_picture_url ? (
            <AvatarImage 
              src={userState.user.profile_picture_url}
              alt={`${userState.user.first_name} ${userState.user.last_name}`}
              className="object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
              }}
            />
          ) : (
            <AvatarFallback className="bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              {userState.user?.first_name?.[0]?.toUpperCase() || userState.user?.email?.[0]?.toUpperCase() || '👤'}
            </AvatarFallback>
          )}
        </Avatar>
        <div>
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {userState.user ? `${userState.user.first_name} ${userState.user.last_name}` : n('userName')}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {userState.user?.company_name || n('companyName')}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          <Link 
            href="/en/product-portfolio" 
            className={getLinkClassName('/product-portfolio')}
          >
            <BarChart2 className="h-5 w-5" />
            <span>{n('productPortfolio')}</span>
          </Link>
          <Link 
            href="/en/dashboard/project-management" 
            className={getLinkClassName('/dashboard/project-management')}
          >
            <FileText className="h-5 w-5" />
            <span>{n('projectManagement')}</span>
          </Link>
          <Link 
            href="/en/dashboard/profile" 
            className={getLinkClassName('/dashboard/profile')}
          >
            <Settings className="h-5 w-5" />
            <span>{n('administrative')}</span>
          </Link>
          <Link 
            href="/en/dashboard/epd-preview" 
            className={getLinkClassName('/dashboard/epd-preview')}
          >
            <Search className="h-5 w-5" />
            <span>{n('epdPreview')}</span>
          </Link>
          <Link 
            href="/en/dashboard/requests" 
            className={getLinkClassName('/dashboard/requests')}
          >
            <MessageSquare className="h-5 w-5" />
            <span>{n('requests')}</span>
            <span className="ml-auto bg-teal-100 dark:bg-black text-teal-600 dark:text-teal-400 text-xs px-2 py-0.5 rounded-full">2</span>
          </Link>
        </div>
      </nav>

      {/* Logout Button - Fixed at bottom */}
      <div className="p-4 border-t dark:border-gray-800 mt-auto">
        <button 
          onClick={handleLogout}
          type="button"
          className="w-full flex items-center space-x-3 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>{n('logout')}</span>
        </button>
      </div>
    </div>
  )
}