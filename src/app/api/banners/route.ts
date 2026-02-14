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
  } catch (error: any) {
    console.error('Error fetching banners:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch banners',
      details: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}

// POST /api/banners - Save user banner selection
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bannerUrl, selectedBadgeIds } = await req.json();

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        bannerUrl,
        selectedBadgeIds: JSON.stringify(selectedBadgeIds)
      }
    });

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    console.error('Error saving banner:', error);
    return NextResponse.json({ 
      error: 'Failed to save banner',
      details: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}
