import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/admin/give-banner - Admin gives a banner to a user
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || session.user.email !== 'noe.barneron@gmail.com') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId, bannerUrl } = await req.json();

    if (!userId || !bannerUrl) {
      return NextResponse.json({ error: 'User ID and banner URL are required' }, { status: 400 });
    }

    // Verify the user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, bannerUrl: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify the banner exists if it's a custom banner
    if (!bannerUrl.startsWith('gradient:')) {
      const banner = await prisma.customBanner.findFirst({
        where: { imageUrl: bannerUrl }
      });
      if (!banner) {
        return NextResponse.json({ error: 'Banner not found' }, { status: 404 });
      }
    }

    // Update user's banner
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { bannerUrl },
      select: {
        id: true,
        username: true,
        bannerUrl: true
      }
    });

    return NextResponse.json({
      success: true,
      message: `Bannière attribuée à ${user.username}`,
      user: updatedUser
    });

  } catch (error) {
    console.error('Error giving banner:', error);
    return NextResponse.json({
      error: 'Failed to give banner',
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
