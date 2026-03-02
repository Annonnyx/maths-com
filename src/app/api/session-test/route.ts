import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    // Test session endpoint
    const session = await getServerSession(authOptions);
    
    return NextResponse.json({
      message: 'Session test endpoint',
      timestamp: new Date().toISOString(),
      hasSession: !!session,
      session: session ? {
        user: {
          id: session.user?.id,
          email: session.user?.email,
          username: session.user?.username,
        }
      } : null,
      headers: Object.fromEntries(req.headers.entries())
    });
  } catch (error) {
    console.error('Session test error:', error);
    return NextResponse.json(
      { error: 'Session test error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
