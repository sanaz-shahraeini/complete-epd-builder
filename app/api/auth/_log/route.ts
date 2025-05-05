import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

// Simple rate limiting - only log once every 5 seconds
let lastLogTime = 0;

export async function POST(request: NextRequest) {
  try {
    // Check if we should log this request
    const now = Date.now();
    if (now - lastLogTime > 5000) { // Only log once every 5 seconds
      lastLogTime = now;
      // Try to parse the log data
      const data = await request.json();
      console.log('[Auth Log]', data);
    }
  } catch (error) {
    // If parsing fails, just ignore it
  }
  
  // Always return success
  return NextResponse.json({ success: true });
}