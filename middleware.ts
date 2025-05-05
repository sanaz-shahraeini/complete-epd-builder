import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { locales, defaultLocale } from "./i18n/navigation";

// Adding export keyword to fix the "Cannot find the middleware module" error
export function middleware(request: NextRequest) {
  // Get the pathname from the URL
  const { pathname } = request.nextUrl;

  // Skip processing for static assets and API routes
  if (
    pathname.startsWith("/_next") || 
    pathname.includes("/static/") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/users/") || // Skip for backend API endpoints
    pathname === "/" // Skip processing for root path to prevent recursive redirects
  ) {
    return NextResponse.next();
  }

  // Throttle excessive auth API calls
  if (pathname.startsWith("/api/auth/")) {
    // Allow session endpoint with normal frequency
    if (pathname === "/api/auth/session") {
      // Store the last time we allowed a session request
      const store = request.cookies.get("last_session_request");
      const lastRequest = store ? parseInt(store.value) : 0;
      const now = Date.now();
      
      // Only allow session requests every 30 seconds
      if (now - lastRequest < 30000) {
        // Return cached response to prevent excessive calls
        return NextResponse.json(
          { user: null, expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() },
          { 
            status: 200,
            headers: { 'Cache-Control': 'public, max-age=30, s-maxage=30' }
          }
        );
      }
      
      // Allow this request and update the timestamp
      const response = NextResponse.next();
      response.cookies.set("last_session_request", now.toString());
      return response;
    }
    
    // For _log endpoint, severely limit frequency
    if (pathname === "/api/auth/_log") {
      // Store the last time we allowed a log request
      const store = request.cookies.get("last_log_request");
      const lastRequest = store ? parseInt(store.value) : 0;
      const now = Date.now();
      
      // Only allow log requests every 5 minutes
      if (now - lastRequest < 300000) {
        return NextResponse.json({ status: "throttled" }, { status: 429 });
      }
      
      // Allow this request and update the timestamp
      const response = NextResponse.next();
      response.cookies.set("last_log_request", now.toString());
      return response;
    }
    
    // For other auth endpoints, limit frequency
    const store = request.cookies.get("last_auth_request");
    const lastRequest = store ? parseInt(store.value) : 0;
    const now = Date.now();
    
    // Only allow auth requests every 5 seconds
    if (now - lastRequest < 5000) {
      // For CSRF endpoint, return a cached response
      if (pathname === "/api/auth/csrf") {
        return NextResponse.json(
          { csrfToken: "cached_token" },
          { 
            status: 200,
            headers: { 'Cache-Control': 'public, max-age=5, s-maxage=5' }
          }
        );
      }
      
      return NextResponse.json({ status: "throttled" }, { status: 429 });
    }
    
    // Allow this request and update the timestamp
    const response = NextResponse.next();
    response.cookies.set("last_auth_request", now.toString());
    return response;
  }

  // NEW: Check if we've already attempted to normalize this request to prevent redirect loops
  if (request.cookies.has('path-normalized')) {
    // If we've already tried to normalize, don't do it again
    console.log('Path already normalized, skipping further redirects');
    return NextResponse.next();
  }

  // Special case for profile page to prevent redirect loops
  if (pathname.match(/\/epd\/[^/]+\/dashboard\/profile(\/?|$)/)) {
    console.log('Profile page detected, skipping redirects');
    return NextResponse.next();
  }

  // NEW: Normalize URLs with multiple locale segments or incorrect structure
  // This will fix URLs like /epd/en/en/en/dashboard/profile
  if (pathname.startsWith('/epd/')) {
    const segments = pathname.split('/');
    
    // Remove the empty first segment and 'epd'
    segments.shift(); // Remove empty segment from leading slash
    segments.shift(); // Remove 'epd'
    
    if (segments.length > 0) {
      // Get the first segment which should be a locale
      const firstSegment = segments[0];
      
      // Check if it's a valid locale
      if (locales.includes(firstSegment as 'en' | 'de')) {
        // Remove all locale segments except the first one
        let normalizedPath = '/epd/' + firstSegment;
        
        // Find the first non-locale segment
        let nonLocaleIndex = 1;
        while (nonLocaleIndex < segments.length && locales.includes(segments[nonLocaleIndex] as 'en' | 'de')) {
          nonLocaleIndex++;
        }
        
        // Add all segments from the first non-locale segment onwards
        if (nonLocaleIndex < segments.length) {
          normalizedPath += '/' + segments.slice(nonLocaleIndex).join('/');
        }
        
        // If the path has changed, redirect to the normalized path
        if (normalizedPath !== pathname) {
          console.log(`Normalizing path: ${pathname} -> ${normalizedPath}`);
          const response = NextResponse.redirect(new URL(normalizedPath, request.url));
          // Set a cookie to prevent further normalization attempts
          response.cookies.set('path-normalized', 'true', { maxAge: 300, path: '/', httpOnly: false });
          return response;
        }
      }
    }
  }

  // Check if the pathname starts with a locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // If the pathname doesn't have a locale, redirect to the default locale
  if (!pathnameHasLocale) {
    // Check if it's a locale-less EPD route
    if (pathname.startsWith("/epd/")) {
      return NextResponse.redirect(
        new URL(`/epd/${defaultLocale}${pathname.substring(4)}`, request.url)
      );
    }

    // Check if it's a locale-less dashboard route
    if (pathname.startsWith("/dashboard")) {
      return NextResponse.redirect(
        new URL(`/epd/${defaultLocale}${pathname}`, request.url)
      );
    }

    // For all other routes without a locale, add the default locale
    return NextResponse.redirect(
      new URL(`/${defaultLocale}${pathname}`, request.url)
    );
  }

  // Check if the pathname is missing the /epd prefix for dashboard routes
  // This is the key fix for the /en/dashboard/profile issue
  const dashboardWithoutEpdPattern = new RegExp(`^/(${locales.join('|')})/dashboard`);
  if (dashboardWithoutEpdPattern.test(pathname)) {
    console.log('Intercepting dashboard path without /epd prefix:', pathname);
    const locale = pathname.split('/')[1];
    const pathAfterLocale = pathname.substring(pathname.indexOf('/', 1));
    const correctedPath = `/epd/${locale}${pathAfterLocale}`;
    console.log('Redirecting to correct path:', correctedPath);
    const response = NextResponse.redirect(new URL(correctedPath, request.url));
    // Set a cookie to prevent further normalization attempts
    response.cookies.set('path-normalized', 'true', { maxAge: 300, path: '/', httpOnly: false });
    return response;
  }

  // Check if the pathname is a non-EPD route that should be an EPD route
  const nonEpdRoute = new RegExp(`^/(${locales.join('|')})/(?!epd/)`);
  const excludedRoutes = ["/signup", "/signin", "/forgot-password", "/auth"];
  const shouldBeEpdRoute = nonEpdRoute.test(pathname) && 
    !excludedRoutes.some(route => 
      pathname === route || pathname.startsWith(`${route}/`)
    );

  if (shouldBeEpdRoute) {
    const locale = pathname.split('/')[1];
    const pathAfterLocale = pathname.substring(pathname.indexOf('/', 1));
    return NextResponse.redirect(
      new URL(`/epd/${locale}${pathAfterLocale}`, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
