import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/class-groups/public - Lister les classes publiques
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Récupérer toutes les classes publiques avec leurs professeurs et nombre de membres
    const publicClasses = await prisma.classGroup.findMany({
      where: {
        isPrivate: false
      },
      include: {
        teacher: {
          select: { id: true, username: true, displayName: true }
        },
        members: {
          select: { id: true }
        },
        _count: {
          select: { members: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transformer les données pour le frontend
    const groups = publicClasses.map(group => ({
      ...group,
      studentCount: group._count.members,
      _count: group._count
    }));

    return NextResponse.json({ groups });
  } catch (error) {
    console.error('Error fetching public classes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
