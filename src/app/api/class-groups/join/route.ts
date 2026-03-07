import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/class-groups/join - Rejoindre un groupe avec code
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { inviteCode } = body;

    if (!inviteCode) {
      return NextResponse.json({ error: 'Invite code is required' }, { status: 400 });
    }

    // Trouver le groupe avec le code
    const group = await prisma.classGroup.findUnique({
      where: { inviteCode: inviteCode.toUpperCase() },
      include: {
        teacher: {
          select: { id: true, username: true, displayName: true }
        }
      }
    });

    if (!group) {
      return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 });
    }

    // Vérifier si déjà membre
    const existingMember = await prisma.classGroupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: group.id,
          userId: session.user.id
        }
      }
    });

    if (existingMember) {
      if (existingMember.role === 'pending') {
        return NextResponse.json({ error: 'Demande déjà en attente' }, { status: 400 });
      }
      return NextResponse.json({ error: 'Already a member of this group' }, { status: 400 });
    }

    // Vérifier que la classe n'est pas pleine
    const currentMembers = await prisma.classGroupMember.count({
      where: {
        groupId: group.id,
        role: { not: 'pending' }
      }
    });

    if (group.maxStudents > 0 && currentMembers >= group.maxStudents) {
      return NextResponse.json({ error: 'Class is full' }, { status: 400 });
    }

    // Si la classe est privée, mettre en attente d'approbation
    // Si la classe est publique, rejoindre directement
    const role = group.isPrivate ? 'pending' : 'student';

    const member = await prisma.classGroupMember.create({
      data: {
        groupId: group.id,
        userId: session.user.id,
        role
      },
      include: {
        group: {
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
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      member,
      needsApproval: group.isPrivate,
      message: group.isPrivate 
        ? 'Demande envoyée, en attente d\'approbation du professeur'
        : 'Classe rejointe avec succès'
    });
  } catch (error) {
    console.error('Error joining class group:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
