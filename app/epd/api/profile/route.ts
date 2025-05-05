import { NextRequest, NextResponse } from 'next/server';
import { generateStaticProfile } from './emergency-fix';

// This route handler will serve static HTML for the profile page when needed
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const useStatic = url.searchParams.get('static') === 'true';
  
  if (useStatic) {
    // Generate and return static HTML for the profile page
    console.log('Serving static profile page through API route handler');
    const html = generateStaticProfile();
    return new NextResponse(html, {
      headers: {
        'content-type': 'text/html',
      },
    });
  }
  
  // If the static parameter is not set, return a JSON response
  return NextResponse.json({ 
    message: 'Use ?static=true query parameter to get static HTML version of profile page',
    status: 'ok'
  });
}
