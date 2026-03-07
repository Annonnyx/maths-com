import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Vérifier que l'utilisateur est un professeur
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isTeacher: true }
    });

    if (!user?.isTeacher) {
      return NextResponse.json({ error: 'Accès réservé aux professeurs' }, { status: 403 });
    }

    // Récupérer les demandes en attente pour les classes du professeur
    const pendingRequests = await prisma.classGroupMember.findMany({
      where: {
        role: 'pending',
        group: {
          teacherId: session.user.id
        }
      },
      include: {
        user: {
          select: { 
            id: true, 
            username: true, 
            displayName: true, 
            avatarUrl: true,
            soloElo: true,
            soloRankClass: true
          }
        },
        group: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        joinedAt: 'desc'
      }
    });

    // Récupérer les élèves acceptés
    const acceptedStudents = await prisma.classGroupMember.findMany({
      where: {
        role: 'student',
        group: {
          teacherId: session.user.id
        }
      },
      include: {
        user: {
          select: { 
            id: true, 
            username: true, 
            displayName: true, 
            avatarUrl: true,
            soloElo: true,
            soloRankClass: true
          }
        },
        group: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        joinedAt: 'desc'
      }
    });

    return NextResponse.json({ 
      pendingRequests: pendingRequests || [],
      acceptedStudents: acceptedStudents || []
    });

  } catch (error) {
    console.error('Error in class-requests GET route:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
