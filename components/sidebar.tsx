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
import { useEffect } from 'react'
import { ImImage } from 'react-icons/im'
import Image from 'next/image'

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
  const n = useTranslations('navigation')
  const { user, clearUser } = useUserStore()

  console.log('Current user in sidebar:', user)

  useEffect(() => {
    if (user) {
      console.log('User data in sidebar:', {
        name: `${user.first_name} ${user.last_name}`,
        picture: user.profile_picture_url
      })
    }
  }, [user])

  const isLinkActive = (path: string) => {
    if (!pathname) return false;
    
    // Map German paths to their English equivalents for checking
    const germanToEnglishPaths = {
      '/dashboard/posteingang': '/dashboard/inbox',
      '/dashboard/profil': '/dashboard/profile',
      '/dashboard/epd-vorschau': '/dashboard/epd-preview'
    };

    // Get the current path without locale prefix
    const currentPath = pathname.replace(/^\/[a-z]{2}/, '');
    
    // Special handling for administrative section
    if (path === '/dashboard/profile') {
      // Consider profile, inbox, and EPD pages as part of administrative section
      return currentPath.includes('/dashboard/profile') || 
             currentPath.includes('/dashboard/inbox') ||
             currentPath.includes('/dashboard/epd') ||
             currentPath.includes('/dashboard/epd-preview') ||
             currentPath.includes('/dashboard/profil') ||
             currentPath.includes('/dashboard/posteingang') ||
             currentPath.includes('/dashboard/epd-vorschau');
    }

    // Check if current path matches either English or German version
    return currentPath === path || 
           currentPath === germanToEnglishPaths[path as keyof typeof germanToEnglishPaths] ||
           Object.entries(germanToEnglishPaths).find(([de, en]) => 
             (currentPath.includes(de) && path.includes(en)) || 
             (currentPath.includes(en) && path.includes(de))
           ) !== undefined;
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

  const handleLogout = async (e: React.MouseEvent) => {
    try {
      // Prevent default navigation
      e.preventDefault();
      e.stopPropagation();
      
      // Log initial logout attempt
      console.log('Logout initiated', { 
        isMobile, 
        pathname, 
        onMobileClose: !!onMobileClose 
      });

      // Close mobile menu if it's open
      if (onMobileClose) {
        onMobileClose()
      }

      // Clear the user data from the store
      clearUser()
      
      // Get current locale before signing out
      const currentLocale = pathname.split('/')[1] || 'en';
      
      // Perform logout with explicit configuration
      await signOut({
        redirect: true,
        callbackUrl: `/${currentLocale}/signin`
      });
      
    } catch (error) {
      console.error('Logout process failed:', error);
      
      // Fallback redirect methods
      try {
        // Method 1: Direct API call
        await fetch('/api/auth/signout', { method: 'POST' });
      } catch (apiError) {
        console.error('Signout API call failed:', apiError);
      }
      
      // Method 2: Force redirect
      window.location.href = `/${currentLocale}/signin`;
    }
  };

  // Add event listener to capture any potential issues
  useEffect(() => {
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
  }, [isMobile, pathname]);

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
          {user?.profile_picture_url ? (
            <AvatarImage 
              src={user.profile_picture_url}
              alt={`${user.first_name} ${user.last_name}`}
              className="object-cover"
              onError={(e) => {
                console.error('Avatar image failed to load:', e)
                const target = e.target as HTMLImageElement
                target.style.display = 'none'
              }}
            />
          ) : (
            <AvatarFallback className="bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              {user?.first_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '👤'}
            </AvatarFallback>
          )}
        </Avatar>
        <div>
          <div className="font-medium text-gray-900 dark:text-gray-100">
            {user ? `${user.first_name} ${user.last_name}` : n('userName')}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {user?.company_name || n('companyName')}
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