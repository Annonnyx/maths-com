import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    console.log('Auth session endpoint called');
    console.log('Headers:', Object.fromEntries(req.headers.entries()));
    
    // Simuler une réponse de session vide pour tester
    return NextResponse.json({
      session: null,
      message: 'Auth session test endpoint working'
    });
  } catch (error) {
    console.error('Auth session test error:', error);
    return NextResponse.json(
      { error: 'Auth session test error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
