import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Try to parse the log data
    const data = await request.json();
    console.log('[Auth Log]', data);
  } catch (error) {
    // If parsing fails, log the error
    console.error('[Auth Log] Error parsing log data:', error);
  }
  
  // Always return success
  return NextResponse.json({ success: true });
} 