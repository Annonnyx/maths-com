import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Récupérer les messages d'une classe avec filtres
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const messageType = searchParams.get('type'); // 'announcement', 'teacher_feed', 'discussion'
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!classId) {
      return NextResponse.json({ error: 'classId requis' }, { status: 400 });
    }

    // Vérifier que l'utilisateur est membre de la classe ou professeur
    const classGroup = await prisma.classGroup.findUnique({
      where: { id: classId },
      include: {
        members: {
          where: { userId: session.user.id },
          select: { id: true, role: true }
        }
      }
    });

    if (!classGroup) {
      return NextResponse.json({ error: 'Classe non trouvée' }, { status: 404 });
    }

    const isTeacher = classGroup.teacherId === session.user.id;
    const isMember = classGroup.members.length > 0;

    if (!isTeacher && !isMember) {
      return NextResponse.json({ error: 'Non membre de la classe' }, { status: 403 });
    }

    // Construire la requête
    const whereClause: any = { classId };
    if (messageType) {
      whereClause.messageType = messageType;
    }

    const messages = await prisma.classMessage.findMany({
      where: whereClause,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
            role: true
          }
        },
        parentMessage: {
          select: {
            id: true,
            content: true,
            sender: {
              select: {
                displayName: true,
                username: true
              }
            }
          }
        },
        replies: {
          take: 3,
          orderBy: { createdAt: 'asc' },
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                displayName: true,
                role: true
              }
            }
          }
        },
        readBy: {
          where: { userId: session.user.id },
          select: { readAt: true }
        },
        confirmations: {
          where: { userId: session.user.id },
          select: { confirmedAt: true }
        }
      }
    });

    return NextResponse.json({ messages });

  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Créer un nouveau message
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      classId, 
      content, 
      messageType = 'discussion',
      priority = 'normal',
      parentMessageId = null,
      requiresConfirmation = false
    } = body;

    if (!classId || !content?.trim()) {
      return NextResponse.json({ error: 'classId et content requis' }, { status: 400 });
    }

    // Vérifier les permissions selon le type de message
    const classGroup = await prisma.classGroup.findUnique({
      where: { id: classId },
      include: {
        members: {
          where: { userId: session.user.id },
          select: { id: true, role: true }
        }
      }
    });

    if (!classGroup) {
      return NextResponse.json({ error: 'Classe non trouvée' }, { status: 404 });
    }

    const isTeacher = classGroup.teacherId === session.user.id;
    const isMember = classGroup.members.length > 0;

    // Seul le professeur peut créer des annonces et teacher_feed
    if ((messageType === 'announcement' || messageType === 'teacher_feed') && !isTeacher) {
      return NextResponse.json({ error: 'Seul le professeur peut créer ce type de message' }, { status: 403 });
    }

    // Vérifier que l'utilisateur est membre pour les discussions
    if (messageType === 'discussion' && !isTeacher && !isMember) {
      return NextResponse.json({ error: 'Non membre de la classe' }, { status: 403 });
    }

    // Créer le message
    const message = await prisma.classMessage.create({
      data: {
        classId,
        senderId: session.user.id,
        content: content.trim(),
        messageType,
        priority,
        parentMessageId,
        requiresConfirmation,
      },
      include: {
        sender: {
          select: {
            id: true,
            username: true,
            displayName: true,
            role: true
          }
        }
      }
    });

    // Notifier les membres de la classe (sauf l'expéditeur)
    if (messageType === 'announcement' || requiresConfirmation) {
      const members = await prisma.classGroupMember.findMany({
        where: {
          groupId: classId,
          userId: { not: session.user.id }
        },
        select: { userId: true }
      });

      await prisma.notification.createMany({
        data: members.map(m => ({
          userId: m.userId,
          type: messageType === 'announcement' ? 'announcement' : 'message',
          title: messageType === 'announcement' ? '📢 Nouvelle annonce' : '💬 Nouveau message',
          content: `Dans "${classGroup.name}" : ${content.slice(0, 100)}${content.length > 100 ? '...' : ''}`,
          senderId: session.user.id,
          data: { classId, messageId: message.id }
        }))
      });
    }

    return NextResponse.json({ success: true, message });

  } catch (error) {
    console.error('Error creating message:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// PATCH - Marquer un message comme lu ou confirmer
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { messageId, action } = body; // action: 'read' ou 'confirm'

    if (!messageId || !action) {
      return NextResponse.json({ error: 'messageId et action requis' }, { status: 400 });
    }

    const message = await prisma.classMessage.findUnique({
      where: { id: messageId },
      include: { class: { select: { id: true, teacherId: true } } }
    });

    if (!message) {
      return NextResponse.json({ error: 'Message non trouvé' }, { status: 404 });
    }

    if (action === 'read') {
      // Marquer comme lu (créer ou mettre à jour MessageRead)
      await prisma.messageRead.upsert({
        where: {
          messageId_userId: {
            messageId,
            userId: session.user.id
          }
        },
        update: { readAt: new Date() },
        create: {
          messageId,
          userId: session.user.id,
          readAt: new Date()
        }
      });
    } else if (action === 'confirm') {
      // Confirmer la réception (pour les messages importants)
      if (!message.requiresConfirmation) {
        return NextResponse.json({ error: 'Ce message ne requiert pas de confirmation' }, { status: 400 });
      }

      await prisma.messageConfirmation.upsert({
        where: {
          messageId_userId: {
            messageId,
            userId: session.user.id
          }
        },
        update: { confirmedAt: new Date() },
        create: {
          messageId,
          userId: session.user.id,
          confirmedAt: new Date()
        }
      });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error updating message:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// DELETE - Supprimer un message (professeur seulement ou auteur)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('id');

    if (!messageId) {
      return NextResponse.json({ error: 'id requis' }, { status: 400 });
    }

    const message = await prisma.classMessage.findUnique({
      where: { id: messageId },
      include: { class: { select: { teacherId: true } } }
    });

    if (!message) {
      return NextResponse.json({ error: 'Message non trouvé' }, { status: 404 });
    }

    // Vérifier les permissions
    const isTeacher = message.class.teacherId === session.user.id;
    const isAuthor = message.senderId === session.user.id;

    if (!isTeacher && !isAuthor) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    await prisma.classMessage.delete({
      where: { id: messageId }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error deleting message:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
