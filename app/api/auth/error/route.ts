import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  // Return a successful response with null error
  return NextResponse.json({ 
    error: null,
    message: "No authentication errors" 
  });
} 