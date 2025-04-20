import { createNavigation } from 'next-intl/navigation';
import { defineRouting } from 'next-intl/routing';

// Define supported locales
export const locales = ['en', 'de'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

// Define route constants for better maintainability
const ROUTES = {
  ROOT: '/',
  DASHBOARD: '/dashboard',
  AUTH: {
    SIGNIN: '/signin',
    SIGNUP: '/signup'
  },
  DASHBOARD_ROUTES: {
    PORTFOLIO: '/dashboard/portfolio',
    PROJECTS: '/dashboard/projects',
    ADMIN: '/dashboard/admin',
    EPD: '/dashboard/epd',
    REQUESTS: '/dashboard/requests',
    PROFILE: '/dashboard/profile',
    INBOX: '/dashboard/inbox'
  }
} as const;

// Define German translations for routes
const DE_ROUTES = {
  [ROUTES.AUTH.SIGNIN]: '/anmelden',
  [ROUTES.AUTH.SIGNUP]: '/registrieren',
  [ROUTES.DASHBOARD_ROUTES.PORTFOLIO]: '/dashboard/portfolio',
  [ROUTES.DASHBOARD_ROUTES.PROJECTS]: '/dashboard/projekte',
  [ROUTES.DASHBOARD_ROUTES.ADMIN]: '/dashboard/verwaltung',
  [ROUTES.DASHBOARD_ROUTES.EPD]: '/dashboard/epd',
  [ROUTES.DASHBOARD_ROUTES.REQUESTS]: '/dashboard/anfragen',
  [ROUTES.DASHBOARD_ROUTES.PROFILE]: '/dashboard/profil',
  [ROUTES.DASHBOARD_ROUTES.INBOX]: '/dashboard/posteingang'
} as const;

// Generate pathnames configuration
const generatePathnames = () => {
  const pathnames: Record<string, string | Record<Locale, string>> = {
    '/': '/',
    '/signin': {
      en: '/signin',
      de: '/anmelden'
    },
    '/signup': {
      en: '/signup',
      de: '/registrieren'
    },
    '/dashboard': '/dashboard'
  };

  // Add dashboard routes with their translations
  Object.entries(ROUTES.DASHBOARD_ROUTES).forEach(([key, path]) => {
    pathnames[path] = {
      en: path,
      de: DE_ROUTES[path]
    };
  });

  return pathnames;
};

// Create the routing configuration
export const routing = defineRouting({
  locales,
  defaultLocale,
  pathnames: generatePathnames()
});

export type Pathnames = keyof typeof routing.pathnames;

// Export navigation utilities
export const {
  Link,
  getPathname,
  redirect,
  usePathname,
  useRouter
} = createNavigation(routing);

// Export route constants for use in components
export { ROUTES };