import { NextRequest, NextResponse } from 'next/server';
import { generateStaticProfile } from './emergency-fix';

// This route handler will only be used when the static parameter is set to true
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const useStatic = url.searchParams.get('static') === 'true';
  
  if (useStatic) {
    // Generate and return static HTML for the profile page
    console.log('Serving static profile page through route handler');
    const html = generateStaticProfile();
    return new NextResponse(html, {
      headers: {
        'content-type': 'text/html',
      },
    });
  }
  
  // If the static parameter is not set, redirect to the page without query parameters
  const baseUrl = url.pathname;
  return NextResponse.redirect(new URL(baseUrl, request.url));
}
