import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    console.log('Direct session endpoint called');
    
    // Vérifier si NextAuth est bien importé
    if (!authOptions) {
      throw new Error('authOptions not defined');
    }
    
    // Retourner une session vide pour tester
    return NextResponse.json({
      session: null,
      message: 'Direct session endpoint working'
    });
  } catch (error) {
    console.error('Direct session error:', error);
    return NextResponse.json(
      { error: 'Direct session error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
