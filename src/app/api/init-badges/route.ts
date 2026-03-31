import { NextRequest, NextResponse } from 'next/server';
import { initializeBadges } from '@/lib/badges';

export async function POST(req: NextRequest) {
  try {
    // Simple authentication check
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await initializeBadges();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Badges initialized successfully with French class system' 
    });

  } catch (error) {
    console.error('Error initializing badges:', error);
    return NextResponse.json(
      { error: 'Failed to initialize badges' },
      { status: 500 }
    );
  }
}
