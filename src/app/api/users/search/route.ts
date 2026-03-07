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

    if (!query || query.length < 1) {
      return NextResponse.json({ users: [] });
    }

    let whereClause: any = {};
    let searchType = 'username';

    // Détection automatique du type de recherche
    if (query.startsWith('@')) {
      // Recherche par username exact
      searchType = 'username';
      whereClause = {
        username: {
          equals: query.slice(1),
          mode: 'insensitive'
        }
      };
    } else if (query.startsWith('#')) {
      // Recherche par ID exact
      searchType = 'id';
      whereClause = {
        id: query.slice(1)
      };
    } else {
      // Recherche par displayName ou username partiel
      searchType = 'display';
      whereClause = {
        OR: [
          {
            displayName: {
              startsWith: query,
              mode: 'insensitive'
            }
          },
          {
            username: {
              startsWith: query,
              mode: 'insensitive'
            }
          }
        ]
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
      take: 5, // Limiter à 5 résultats maximum
      orderBy: [
        { soloElo: 'desc' }, // Montrer les ELO élevés d'abord
        { username: 'asc' }
      ]
    });

    return NextResponse.json({ 
      users,
      searchType,
      query: query
    });
  } catch (error) {
    console.error('Error searching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
