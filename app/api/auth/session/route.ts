import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  // In a real implementation, this would check if the user is authenticated
  // and return the user's session information
  
  // For this implementation, we'll simulate an authenticated session
  return NextResponse.json({
    user: {
      id: "user-1",
      name: "Demo User",
      email: "user@example.com",
      image: null,
      role: "user",
    },
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  });
} 