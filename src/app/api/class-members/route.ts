import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// DELETE - Quitter une classe (élève) ou exclure un élève (prof)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const memberId = searchParams.get('memberId');

    if (!classId) {
      return NextResponse.json({ error: 'classId est requis' }, { status: 400 });
    }

    // Vérifier que la classe existe
    const classGroup = await prisma.classGroup.findUnique({
      where: { id: classId },
      select: { teacherId: true, name: true }
    });

    if (!classGroup) {
      return NextResponse.json({ error: 'Classe non trouvée' }, { status: 404 });
    }

    const isTeacher = classGroup.teacherId === session.user.id;
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isTeacher: true, isAdmin: true }
    });

    if (memberId) {
      // Cas 1: Exclure un élève (prof uniquement)
      if (!isTeacher && !user?.isAdmin) {
        return NextResponse.json({ 
          error: 'Seul le professeur peut exclure un élève' 
        }, { status: 403 });
      }

      // Vérifier que le member existe et est un élève (pas le prof)
      const member = await prisma.classGroupMember.findFirst({
        where: {
          id: memberId,
          groupId: classId,
          role: 'student'
        },
        include: {
          user: {
            select: { id: true, displayName: true, username: true }
          }
        }
      });

      if (!member) {
        return NextResponse.json({ 
          error: 'Élève non trouvé dans cette classe' 
        }, { status: 404 });
      }

      // Supprimer le membre
      await prisma.classGroupMember.delete({
        where: { id: memberId }
      });

      // Notifier l'élève exclu
      await prisma.notification.create({
        data: {
          userId: member.user.id,
          type: 'class_removed',
          title: 'Exclu de la classe',
          message: `Vous avez été exclu de la classe "${classGroup.name}".`,
          senderId: session.user.id,
          metadata: { classId: classId }
        }
      });

      return NextResponse.json({ 
        success: true, 
        message: `${member.user.displayName || member.user.username} a été exclu de la classe`
      });

    } else {
      // Cas 2: Quitter la classe (élève lui-même)
      const member = await prisma.classGroupMember.findFirst({
        where: {
          groupId: classId,
          userId: session.user.id,
          role: { in: ['student', 'pending'] }
        }
      });

      if (!member) {
        return NextResponse.json({ 
          error: 'Vous n\'êtes pas membre de cette classe' 
        }, { status: 404 });
      }

      // Empêcher le prof de quitter sa propre classe
      if (member.role === 'teacher') {
        return NextResponse.json({ 
          error: 'Le professeur ne peut pas quitter sa propre classe. Utilisez "Supprimer la classe" ou transférez la propriété.' 
        }, { status: 400 });
      }

      // Supprimer le membre
      await prisma.classGroupMember.delete({
        where: { id: member.id }
      });

      // Notifier le prof
      await prisma.notification.create({
        data: {
          userId: classGroup.teacherId,
          type: 'class_left',
          title: 'Élève parti',
          message: `Un élève a quitté votre classe "${classGroup.name}".`,
          senderId: session.user.id,
          metadata: { classId: classId }
        }
      });

      return NextResponse.json({ 
        success: true, 
        message: 'Vous avez quitté la classe'
      });
    }

  } catch (error) {
    console.error('Error in class-members DELETE route:', error);
    return NextResponse.json({ 
      error: 'Erreur serveur' 
    }, { status: 500 });
  }
}
