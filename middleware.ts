import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { locales, defaultLocale } from "./i18n/navigation"

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
    pathname.startsWith("/api/") ||
    pathname.startsWith("/users/") || // Skip for backend API endpoints
    pathname === "/" // Skip processing for root path to prevent recursive redirects
  ) {
    return NextResponse.next();
  }

  // Handle root locale paths (e.g., /en, /de)
  const isRootLocalePath = new RegExp(`^/(${locales.join("|")})/?$`);
  if (isRootLocalePath.test(pathname)) {
    return NextResponse.next();
  }

  // Check for and fix double locale in path (e.g., /epd/en/en/...)
  const doubleLocalePattern = new RegExp(`^/epd/(${locales.join("|")})/(${locales.join("|")})`);
  if (doubleLocalePattern.test(pathname)) {
    const correctedPath = pathname.replace(doubleLocalePattern, `/epd/$1`);
    return NextResponse.redirect(
      new URL(correctedPath, request.url)
    );
  }

  // Detect and redirect API routes with locale prefixes
  // e.g., /epd/en/api/auth/error -> /api/auth/error
  const localeApiMatch = new RegExp(`^/epd/(${locales.join("|")})/api/`);
  if (localeApiMatch.test(pathname)) {
    const apiPath = pathname.replace(/^\/epd\/[^\/]+\/api/, '/api');
    return NextResponse.redirect(
      new URL(apiPath, request.url)
    );
  }

  // Fix paths with duplicate /epd/ segments (e.g., /epd/en/epd/en/signup)
  const duplicateEpdPattern = /\/epd\/([^\/]+)\/epd\/([^\/]+)/;
  if (duplicateEpdPattern.test(pathname)) {
    // Extract segments to ensure we keep the locale
    const match = pathname.match(duplicateEpdPattern);
    if (match && match[1] === match[2]) {
      // If the locales are the same, simply remove the duplicate part
      const correctedPath = pathname.replace(`/epd/${match[1]}/epd/${match[2]}`, `/epd/${match[1]}`);
      return NextResponse.redirect(
        new URL(correctedPath, request.url)
      );
    }
  }

  // General case for multiple /epd/ segments
  if (pathname.includes("/epd/epd/")) {
    const correctedPath = pathname.replace(/\/epd\/+epd\/+/g, '/epd/');
    return NextResponse.redirect(
      new URL(correctedPath, request.url)
    );
  }

  // Handle direct locale routes
  const directLocaleMatch = new RegExp(`^/(${locales.join("|")})/`);
  if (directLocaleMatch.test(pathname) && !pathname.startsWith(`/${defaultLocale}`)) {
    const segments = pathname.split('/');
    const locale = segments[1];
    const newPath = `/epd${pathname}`;
    return NextResponse.redirect(
      new URL(newPath, request.url)
    );
  }

  // Check if this is an EPD route
  const isEpdRoute = pathname.startsWith("/epd") || 
                    ["/signin", "/signup", "/forgot-password", "/dashboard"].some(
                      route => pathname === route || pathname.startsWith(`${route}/`)
                    );

  // If not an EPD route, let Next.js handle it
  if (!isEpdRoute) {
    return NextResponse.next();
  }

  // Handle /epd root path
  if (pathname === "/epd") {
    return NextResponse.redirect(
      new URL(`/epd/${defaultLocale}`, request.url)
    );
  }

  // Check if the path has a locale
  const localePattern = new RegExp(`^/epd/(${locales.join("|")})/`);
  const hasLocale = localePattern.test(pathname);

  // If already has locale, don't modify
  if (hasLocale) {
    return NextResponse.next();
  }

  // Add locale to EPD routes
  if (pathname.startsWith("/epd/")) {
    const pathWithoutPrefix = pathname.substring(4); // Remove /epd
    return NextResponse.redirect(
      new URL(`/epd/${defaultLocale}${pathWithoutPrefix}`, request.url)
    );
  }

  // Handle non-prefixed routes
  if (["/signin", "/signup", "/forgot-password", "/dashboard"].some(route => 
    pathname === route || pathname.startsWith(`${route}/`))
  ) {
    return NextResponse.redirect(
      new URL(`/epd/${defaultLocale}${pathname}`, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
