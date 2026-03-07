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

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const teacherSearch = searchParams.get('teacher') || '';

    // Si recherche par professeur
    if (teacherSearch) {
      const teacherQuery = teacherSearch.startsWith('@') 
        ? { username: teacherSearch.slice(1) }
        : teacherSearch.startsWith('#')
        ? { id: teacherSearch.slice(1) }
        : { displayName: { contains: teacherSearch, mode: 'insensitive' } };

      const teacherClasses = await prisma.classGroup.findMany({
        where: {
          isPrivate: false,
          teacher: {
            ...(teacherSearch.startsWith('@') 
              ? { username: teacherSearch.slice(1) }
              : teacherSearch.startsWith('#')
              ? { id: teacherSearch.slice(1) }
              : { displayName: { contains: teacherSearch, mode: 'insensitive' } })
          }
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
          members: {
            _count: 'desc'
          }
        }
      });

      const groups = teacherClasses.map(group => ({
        ...group,
        studentCount: group._count.members - 1, // Exclure le professeur
        _count: group._count
      }));

      return NextResponse.json({ groups });
    }

    // Recherche normale par nom de classe
    let whereClause: any = {
      isPrivate: false
    };

    if (search) {
      whereClause.name = {
        startsWith: search,
        mode: 'insensitive'
      };
    }

    const publicClasses = await prisma.classGroup.findMany({
      where: whereClause,
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
      orderBy: [
        {
          members: {
            _count: 'desc'
          }
        },
        {
          createdAt: 'desc'
        }
      ],
      take: 5 // Limiter à 5 résultats maximum
    });

    // Transformer les données pour le frontend
    const groups = publicClasses.map(group => ({
      ...group,
      studentCount: group._count.members - 1, // Exclure le professeur
      _count: group._count
    }));

    return NextResponse.json({ groups });
  } catch (error) {
    console.error('Error fetching public classes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
