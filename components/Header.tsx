import React from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Menu, Users } from "lucide-react"
import { LanguageSwitcher } from './language-switcher';
import { ModeToggle } from './mode-toggle';
import { Sidebar } from '@/components/dashboard/Sidebar';

const tabs = [
  { label: 'tabs.epdOverview', href: '/dashboard/epd' },
  { label: 'tabs.inbox', href: '/dashboard/inbox' },
  { label: 'tabs.myProfile', href: '/dashboard/profile' },
] as const;

const Header = ({ 
  user, 
  onMobileMenuClick, 
  onAdminPanelClick 
}: { 
  user?: any, 
  onMobileMenuClick?: () => void, 
  onAdminPanelClick?: () => void 
}) => {
  const n = useTranslations('navigation');
  const router = useRouter();
  const pathname = usePathname();
  
  const isProductPortfolio = router.pathname?.startsWith('/product-portfolio/');
  const isInputData = router.pathname?.startsWith('/dashboard/input-data/');

  const getInitials = () => {
    if (!user) return 'UN'
    const firstName = user.first_name?.[0] || 'U'
    const lastName = user.last_name?.[0] || 'N'
    return `${firstName}${lastName}`.toUpperCase()
  }

  return (
    <div>
      {/* Top bar - User Info and Controls */}
      <div className="flex items-center justify-between px-4 py-2">
        {/* Left side - User Info */}
        <div className="flex items-center space-x-3">
          {/* Mobile Sidebar */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden mr-2"
              >
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 p-0">
              <SheetTitle className="sr-only">{n('sidebarMenu')}</SheetTitle>
              <Sidebar />
            </SheetContent>
          </Sheet>

          {/* User Avatar */}
          {!isProductPortfolio && (
            <>
              {user?.profile_picture_url && user.profile_picture_url.trim() !== '' ? (
                <Avatar>
                  <AvatarImage 
                    src={user.profile_picture_url} 
                    alt={`${user?.first_name || ''} ${user?.last_name || ''}`} 
                    className="object-cover"
                  />
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                </Avatar>
              ) : (
                <Avatar>
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                </Avatar>
              )}
              
              {/* User Details */}
              <div className="flex flex-col">
                <div className="text-sm font-medium">
                  {user?.first_name} {user?.last_name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {user?.user_type === 'company' ? n('companyUser') : user?.user_type}
                </div>
              </div>

              {/* Admin Panel Toggle (Mobile) */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden ml-2"
                onClick={onAdminPanelClick}
              >
                <Users className="h-5 w-5" />
              </Button>
            </>
          )}
        </div>

        {/* Right side - Controls */}
        <div className="flex items-center space-x-2">
          <LanguageSwitcher />
          <ModeToggle />
        </div>
      </div>

      {/* Navigation Tabs */}
      {(!isProductPortfolio || !isInputData) && (
        <div className="border-b border-gray-200 dark:border-gray-800">
          <nav className="flex justify-start px-4 ml-auto w-[700px] overflow-x-auto space-x-4">
            {tabs.map((tab) => {
              const isActive = pathname?.includes(tab.href.split('/').pop()!);
              
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`
                    relative px-3 py-3 text-sm font-medium tracking-wide transition-all duration-300 ease-in-out
                    ${
                      isActive
                        ? 'text-[#00A499] font-semibold after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-full after:h-[3px] after:bg-[#00A499] after:rounded-t-sm'
                        : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200 after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-0 after:h-[3px] after:bg-[#00A499] after:transition-all after:duration-300 hover:after:w-full'
                    }
                  `}
                >
                  {n(tab.label)}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </div>
  );
};

export default Header;
