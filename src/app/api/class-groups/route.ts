import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/class-groups - Liste des groupes de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const groups = await prisma.classGroup.findMany({
      where: {
        OR: [
          { teacherId: session.user.id },
          { members: { some: { userId: session.user.id } } }
        ]
      },
      include: {
        teacher: {
          select: { id: true, username: true, displayName: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, username: true, displayName: true }
            }
          }
        },
        _count: {
          select: { members: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ groups });
  } catch (error) {
    console.error('Error fetching class groups:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/class-groups - Créer un groupe (professeur uniquement)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Vérifier si l'utilisateur est professeur
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isTeacher: true }
    });

    if (!user?.isTeacher) {
      return NextResponse.json({ error: 'Only teachers can create groups' }, { status: 403 });
    }

    const body = await request.json();
    const { name, description, level, subject, maxStudents, isPrivate } = body;

    if (!name) {
      return NextResponse.json({ error: 'Group name is required' }, { status: 400 });
    }

    // Générer un code d'invitation unique
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const group = await prisma.classGroup.create({
      data: {
        name,
        description: description || null,
        isPrivate: isPrivate ?? false,
        inviteCode,
        teacherId: session.user.id,
        members: {
          create: {
            userId: session.user.id,
            role: 'teacher'
          }
        }
      },
      include: {
        teacher: {
          select: { id: true, username: true, displayName: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, username: true, displayName: true }
            }
          }
        }
      }
    });

    return NextResponse.json({ success: true, group });
  } catch (error) {
    console.error('Error creating class group:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
