import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

// List of valid auth endpoints
const validAuthEndpoints = [
  'providers',
  '_log',
  'error',
  'session',
  'callback',
  'signin',
  'signout',
  'csrf'
];

// Cache control to prevent frequent requests
const cacheHeaders = {
  'Cache-Control': 'public, max-age=60, s-maxage=60'
};

export async function GET(
  request: NextRequest,
  { params }: { params: { nextauth: string[] } }
) {
  const endpoint = params.nextauth?.[0] || '';
  
  // Check if valid auth endpoint
  if (!validAuthEndpoints.includes(endpoint)) {
    return NextResponse.json(
      { error: `Auth endpoint '${endpoint}' not implemented` },
      { status: 501 }
    );
  }

  // For now, return a mock response based on the endpoint
  switch (endpoint) {
    case 'providers':
      return NextResponse.json({
        email: { id: "email", name: "Email", type: "email" },
      }, { headers: cacheHeaders });
    
    case 'error':
      return NextResponse.json({
        error: null
      }, { headers: cacheHeaders });
    
    case 'session':
      return NextResponse.json({
        user: null,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }, { headers: cacheHeaders });
      
    case 'signin':
      // For signin, get the callback URL and redirect directly
      const callbackUrl = request.nextUrl.searchParams.get('callbackUrl') || '/epd/en/dashboard';
      return NextResponse.redirect(callbackUrl);
      
    case 'csrf':
      // Implement CSRF token endpoint
      return NextResponse.json({
        csrfToken: 'mock-csrf-token-' + Date.now()
      }, { headers: cacheHeaders });
    
    default:
      return NextResponse.json({
        message: `Auth endpoint '${endpoint}' placeholder response`
      }, { headers: cacheHeaders });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { nextauth: string[] } }
) {
  const endpoint = params.nextauth?.[0] || '';
  
  // Handle POST requests for specific auth endpoints
  switch (endpoint) {
    case '_log':
      // Just return success response for logging
      return NextResponse.json({ success: true }, { headers: cacheHeaders });
    
    case 'signin':
      try {
        // In a real implementation, this would validate credentials
        // For now, just redirect to the callback URL
        const callbackUrl = request.nextUrl.searchParams.get('callbackUrl') || '/epd/en/dashboard';
        return NextResponse.redirect(callbackUrl);
      } catch (error) {
        return NextResponse.json(
          { error: 'Authentication failed' },
          { status: 401 }
        );
      }
      
    case 'signout':
      // Handle signout - redirect to the callback URL after clearing session
      const callbackUrl = request.nextUrl.searchParams.get('callbackUrl') || '/';
      // Return a redirect response instead of JSON to properly handle the signout
      return NextResponse.redirect(new URL(callbackUrl, request.url));
    
    case 'csrf':
      // Implement CSRF token endpoint for POST requests
      return NextResponse.json({
        csrfToken: 'mock-csrf-token-' + Date.now()
      }, { headers: cacheHeaders });
      
    default:
      return NextResponse.json(
        { message: `Auth endpoint '${endpoint}' handled` },
        { status: 200, headers: cacheHeaders }
      );
  }
} 