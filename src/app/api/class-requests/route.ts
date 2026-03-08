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

// POST - Accepter ou refuser une demande d'adhésion
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { action, requestId, classId } = body;

    if (!action || !requestId || !classId) {
      return NextResponse.json({ 
        error: 'Paramètres manquants: action, requestId et classId sont requis' 
      }, { status: 400 });
    }

    if (!['accept', 'reject'].includes(action)) {
      return NextResponse.json({ 
        error: 'Action invalide. Utilisez "accept" ou "reject"' 
      }, { status: 400 });
    }

    // Vérifier que la classe appartient au professeur
    const classGroup = await prisma.classGroup.findUnique({
      where: { id: classId },
      select: { teacherId: true, name: true }
    });

    if (!classGroup) {
      return NextResponse.json({ error: 'Classe non trouvée' }, { status: 404 });
    }

    if (classGroup.teacherId !== session.user.id) {
      return NextResponse.json({ 
        error: 'Vous n\'êtes pas le professeur de cette classe' 
      }, { status: 403 });
    }

    // Vérifier que la demande existe et est en attente
    const pendingMember = await prisma.classGroupMember.findFirst({
      where: {
        id: requestId,
        groupId: classId,
        role: 'pending'
      },
      include: {
        user: {
          select: { id: true, displayName: true, username: true }
        }
      }
    });

    if (!pendingMember) {
      return NextResponse.json({ 
        error: 'Demande non trouvée ou déjà traitée' 
      }, { status: 404 });
    }

    if (action === 'accept') {
      // Accepter la demande - changer le role en 'student'
      await prisma.classGroupMember.update({
        where: { id: requestId },
        data: { role: 'student' }
      });

      // Créer une notification pour l'élève
      await prisma.notification.create({
        data: {
          userId: pendingMember.user.id,
          type: 'class_accepted',
          title: 'Demande acceptée !',
          message: `Votre demande pour rejoindre la classe "${classGroup.name}" a été acceptée.`,
          senderId: session.user.id,
          metadata: { classId: classId }
        }
      });

      return NextResponse.json({ 
        success: true, 
        message: 'Élève accepté avec succès',
        student: pendingMember.user
      });

    } else {
      // Refuser la demande - supprimer le member
      await prisma.classGroupMember.delete({
        where: { id: requestId }
      });

      // Créer une notification pour l'élève
      await prisma.notification.create({
        data: {
          userId: pendingMember.user.id,
          type: 'class_rejected',
          title: 'Demande refusée',
          message: `Votre demande pour rejoindre la classe "${classGroup.name}" a été refusée.`,
          senderId: session.user.id,
          metadata: { classId: classId }
        }
      });

      return NextResponse.json({ 
        success: true, 
        message: 'Demande refusée'
      });
    }

  } catch (error) {
    console.error('Error in class-requests POST route:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur lors du traitement de la demande' 
    }, { status: 500 });
  }
}
