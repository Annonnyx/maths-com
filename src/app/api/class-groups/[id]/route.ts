import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/class-groups/[id] - Détails d'un groupe spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const group = await prisma.classGroup.findUnique({
      where: { id: params.id },
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
        messages: {
          include: {
            user: {
              select: { id: true, username: true, displayName: true }
            }
          },
          orderBy: { createdAt: 'asc' },
          take: 50
        }
      }
    });

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    // Vérifier si membre ou professeur
    const isMember = group.members.some(m => m.userId === session.user.id);
    const isTeacher = group.teacherId === session.user.id;

    if (group.isPrivate && !isMember && !isTeacher) {
      return NextResponse.json({ error: 'Private group' }, { status: 403 });
    }

    return NextResponse.json({ group });
  } catch (error) {
    console.error('Error fetching class group:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
