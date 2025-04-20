'use client'

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Check, Globe } from 'lucide-react'
import { useLocale, useTranslations } from 'next-intl'
import { usePathname, useRouter, type Locale } from '@/i18n/navigation'
import { cn } from "@/lib/utils"

type Language = {
  code: Locale;
  flag: string;
};

const languages: Language[] = [
  { 
    code: 'en',
    flag: '🇺🇸'
  },
  { 
    code: 'de',
    flag: '🇩🇪'
  }
]

export function LanguageSwitcher() {
  const locale = useLocale()
  const t = useTranslations('languages')
  const pathname = usePathname()
  const router = useRouter()

  // Find the current locale from the URL if it exists
  const urlLocale = pathname.split('/').find(segment => ['en', 'de'].includes(segment)) as Locale || locale;
  
  const currentLanguage = languages.find(lang => lang.code === urlLocale) || languages[0];

  const handleLanguageChange = async (newLocale: Locale) => {
    try {
      // Get the current path segments
      const segments = pathname.split('/');
      
      // Find the current locale segment index (should be 1)
      const localeIndex = segments.findIndex(segment => ['en', 'de'].includes(segment));
      
      if (localeIndex !== -1) {
        // Replace the locale segment
        segments[localeIndex] = newLocale;
      } else {
        // If no locale found, insert it after the first empty segment
        segments.splice(1, 0, newLocale);
      }
      
      // Join the segments back together
      const newPathname = segments.join('/');
      
      console.log('Switching language to:', newLocale, 'New path:', newPathname);
      
      // Use router.push with locale option and shallow: false to trigger a full page load
      await router.push(newPathname, { locale: newLocale, shallow: false });
      
      // Force a hard navigation to ensure translations are updated
      window.location.href = newPathname;
    } catch (error) {
      console.error('Error switching language:', error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn(
            "h-9 px-3 gap-2",
            "bg-background hover:bg-accent",
            "text-sm font-medium text-muted-foreground",
            "transition-colors duration-200"
          )}
          aria-label={t('switchLanguage')}
        >
          <Globe className="h-4 w-4" />
          <span className="inline-flex items-center gap-2">
            <span>{currentLanguage.flag}</span>
            <span className="hidden sm:inline">{t(currentLanguage.code)}</span>
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className={cn(
          "w-[150px] p-1",
          "animate-in fade-in-0 zoom-in-95",
          "bg-background border border-border"
        )}
      >
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={cn(
              "flex items-center justify-between px-3 py-2 text-sm",
              "cursor-pointer rounded-md",
              "hover:bg-accent hover:text-accent-foreground",
              "transition-colors duration-200",
              urlLocale === language.code && "bg-accent"
            )}
          >
            <span className="inline-flex items-center gap-2">
              <span>{language.flag}</span>
              <span>{t(language.code)}</span>
            </span>
            {urlLocale === language.code && (
              <Check className="h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
