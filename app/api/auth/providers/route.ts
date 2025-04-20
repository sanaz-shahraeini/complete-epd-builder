import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  // Return a mock list of providers
  return NextResponse.json({
    email: { id: "email", name: "Email", type: "email" },
    google: { id: "google", name: "Google", type: "oauth" },
    // Add other providers as needed
  });
} 