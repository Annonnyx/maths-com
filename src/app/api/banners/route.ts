import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/banners - Get all active banners (public)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Get all active banners - accessible to everyone
    const banners = await prisma.customBanner.findMany({
      where: {
        isActive: true
      },
      select: {
        id: true,
        name: true,
        description: true,
        imageUrl: true,
        thumbnailUrl: true,
        isPremium: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ banners });
  } catch (error) {
    console.error('Error fetching banners:', error);
    return NextResponse.json({ error: 'Failed to fetch banners' }, { status: 500 });
  }
}
