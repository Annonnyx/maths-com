import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/class-groups/my-classes - Classes de l'utilisateur connecté
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Récupérer toutes les classes où l'utilisateur est membre
    const userClasses = await prisma.classGroup.findMany({
      where: {
        members: {
          some: {
            userId: session.user.id
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transformer les données pour le frontend
    const classesData = userClasses.map(classGroup => ({
      id: classGroup.id,
      name: classGroup.name,
      description: classGroup.description,
      level: classGroup.level,
      subject: classGroup.subject,
      maxStudents: classGroup.maxStudents,
      isPrivate: classGroup.isPrivate,
      studentCount: classGroup.members.length,
      inviteCode: classGroup.inviteCode,
      createdAt: classGroup.createdAt,
      teacher: classGroup.teacher,
      isTeacher: classGroup.teacherId === session.user.id,
      joinedAt: classGroup.members.find(m => m.userId === session.user.id)?.joinedAt?.toISOString()
    }));

    return NextResponse.json({ 
      success: true,
      classes: classesData,
      count: classesData.length
    });

  } catch (error) {
    console.error('Error fetching user classes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
