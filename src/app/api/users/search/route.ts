import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type') || 'username';

    if (!query || query.length < 2) {
      return NextResponse.json({ users: [] });
    }

    let whereClause: any = {};

    if (type === 'id') {
      // Search by exact ID
      whereClause = {
        id: query
      };
    } else {
      // Search by username (partial match)
      whereClause = {
        username: {
          contains: query,
          mode: 'insensitive'
        }
      };
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        username: true,
        displayName: true,
        soloElo: true,
        soloRankClass: true,
        isOnline: true,
        lastSeenAt: true,
        isTeacher: true,
        createdAt: true
      },
      take: type === 'id' ? 1 : 20, // Limit results for username search
      orderBy: [
        { soloElo: 'desc' }, // Show high ELO users first
        { username: 'asc' }
      ]
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
