import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email requis' }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: email }
        ]
      },
      select: {
        id: true,
        email: true,
        username: true,
        password: true
      }
    });

    if (!user) {
      return NextResponse.json({ 
        exists: false,
        error: 'USER_NOT_FOUND'
      });
    }

    if (!user.password) {
      return NextResponse.json({ 
        exists: true,
        hasPassword: false,
        error: 'OAUTH_ACCOUNT'
      });
    }

    return NextResponse.json({ 
      exists: true, 
      hasPassword: true 
    });
    
  } catch (error) {
    console.error('Error checking user:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
