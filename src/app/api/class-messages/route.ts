import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Récupérer les messages d'une classe
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');

    if (!classId) {
      return NextResponse.json({ error: 'classId requis' }, { status: 400 });
    }

    // Vérifier que l'utilisateur est membre de la classe
    const membership = await prisma.classGroupMember.findFirst({
      where: {
        groupId: classId,
        userId: session.user.id
      }
    });

    if (!membership) {
      return NextResponse.json({ error: 'Non membre de cette classe' }, { status: 403 });
    }

    // Récupérer les messages via ClassMessage
    const messages = await prisma.classMessage.findMany({
      where: {
        groupId: classId
      },
      include: {
        user: {
          select: { id: true, username: true, displayName: true, avatarUrl: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50
    });

    return NextResponse.json({ messages });

  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Envoyer un message (prof uniquement pour l'instant)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { classId, content, type = 'text' } = body;

    if (!classId || !content?.trim()) {
      return NextResponse.json({ error: 'classId et content requis' }, { status: 400 });
    }

    // Vérifier que l'utilisateur est le professeur de la classe
    const classGroup = await prisma.classGroup.findUnique({
      where: { id: classId },
      select: { teacherId: true, name: true }
    });

    if (!classGroup) {
      return NextResponse.json({ error: 'Classe non trouvée' }, { status: 404 });
    }

    const isTeacher = classGroup.teacherId === session.user.id;
    
    // Pour l'instant, seul le prof peut envoyer des messages
    // TODO: Permettre aux élèves de répondre dans le futur
    if (!isTeacher) {
      return NextResponse.json({ error: 'Accès réservé au professeur' }, { status: 403 });
    }

    // Créer le message
    const message = await prisma.classMessage.create({
      data: {
        groupId: classId,
        userId: session.user.id,
        content: content.trim(),
        type
      },
      include: {
        user: {
          select: { id: true, username: true, displayName: true, avatarUrl: true }
        }
      }
    });

    // Notifier tous les élèves de la classe
    const students = await prisma.classGroupMember.findMany({
      where: {
        groupId: classId,
        role: 'student'
      },
      select: { userId: true }
    });

    // Créer des notifications pour chaque élève
    await prisma.notification.createMany({
      data: students.map(s => ({
        userId: s.userId,
        type: 'class_message',
        title: 'Nouveau message',
        message: `Nouveau message dans la classe "${classGroup.name}"`,
        senderId: session.user.id,
        metadata: { classId, messageId: message.id }
      }))
    });

    return NextResponse.json({ 
      success: true, 
      message
    });

  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
