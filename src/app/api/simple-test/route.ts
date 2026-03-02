import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    console.log('Simple test endpoint called');
    return NextResponse.json({
      message: 'Simple test working',
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url
    });
  } catch (error) {
    console.error('Simple test error:', error);
    return NextResponse.json(
      { error: 'Simple test error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
