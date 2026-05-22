import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function isAdminUser(email: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { isAdmin: true, email: true }
  });

  if (user?.isAdmin) return true;

  const allowlistedEmail = process.env.ADMIN_EMAIL;
  if (allowlistedEmail && user?.email && user.email.toLowerCase() === allowlistedEmail.toLowerCase()) {
    return true;
  }

  return false;
}

// POST /api/teacher-requests/[id]/approve - Approuver une demande professeur
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Vérifier que l'utilisateur est admin
    const isAdmin = await isAdminUser(session.user.email);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { id } = await params;

    // Trouver la demande
    const teacherRequest = await prisma.teacherRequest.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, username: true, email: true }
        }
      }
    });

    if (!teacherRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    if (teacherRequest.status !== 'pending') {
      return NextResponse.json({ error: 'Request already processed' }, { status: 400 });
    }

    // Approuver la demande et mettre à jour l'utilisateur
    await prisma.$transaction([
      prisma.teacherRequest.update({
        where: { id },
        data: { status: 'approved' }
      }),
      prisma.user.update({
        where: { id: teacherRequest.userId },
        data: { isTeacher: true }
      })
    ]);

    // Créer une notification pour l'utilisateur
    await prisma.notification.create({
      data: {
        userId: teacherRequest.userId,
        type: 'teacher_approved',
        title: 'Demande approuvée !',
        message: 'Votre demande pour devenir professeur a été approuvée. Vous pouvez maintenant créer des classes.',
        senderId: session.user.id
      }
    }).catch(() => {
      // Notification is non-critical, don't fail the request
    });

    return NextResponse.json({
      success: true,
      message: 'Teacher request approved',
      userId: teacherRequest.userId
    });

  } catch (error: any) {
    console.error('Error approving teacher request:', error);
    return NextResponse.json(
      { error: 'Failed to approve request', details: error?.message },
      { status: 500 }
    );
  }
}
