import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/class-groups/[id] - Détails d'un groupe spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const group = await prisma.classGroup.findUnique({
      where: { id },
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

// PATCH /api/class-groups/[id] - Mettre à jour un groupe
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Vérifier que l'utilisateur est le professeur de la classe
    const group = await prisma.classGroup.findUnique({
      where: { id }
    });

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    if (group.teacherId !== session.user.id) {
      return NextResponse.json({ error: 'Only teacher can update group' }, { status: 403 });
    }

    // Mettre à jour le groupe
    const updatedGroup = await prisma.classGroup.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        maxStudents: body.maxStudents,
        isPrivate: body.isPrivate
      }
    });

    return NextResponse.json({ group: updatedGroup });
  } catch (error) {
    console.error('Error updating class group:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/class-groups/[id] - Supprimer un groupe
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Vérifier que l'utilisateur est le professeur de la classe
    const group = await prisma.classGroup.findUnique({
      where: { id }
    });

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    if (group.teacherId !== session.user.id) {
      return NextResponse.json({ error: 'Only teacher can delete group' }, { status: 403 });
    }

    // Supprimer le groupe (cascade supprimera automatiquement les membres et messages)
    await prisma.classGroup.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting class group:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
