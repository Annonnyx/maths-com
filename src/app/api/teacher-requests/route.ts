import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

async function isAdminEmail(email: string): Promise<boolean> {
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

// GET /api/teacher-requests - Lister les demandes (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const isAdmin = await isAdminEmail(session.user.email);
    if (!isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const requests = await prisma.teacherRequest.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, username: true, displayName: true, email: true }
        }
      }
    });

    return NextResponse.json({ requests });
  } catch (error: any) {
    console.error('Error fetching teacher requests:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message },
      { status: 500 }
    );
  }
}

// POST /api/teacher-requests - Soumettre une demande professeur
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, school, subject, message } = body;

    // Validation
    if (!name || !school || !subject) {
      return NextResponse.json(
        { error: 'Name, school and subject are required' },
        { status: 400 }
      );
    }

    // Get user from email
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, isTeacher: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user is already a teacher
    if (user.isTeacher) {
      return NextResponse.json({ 
        error: 'Already a teacher',
        details: 'You are already registered as a teacher'
      }, { status: 400 });
    }

    // Check if user already has a pending request
    const existingRequest = await prisma.teacherRequest.findFirst({
      where: { 
        userId: user.id,
        status: 'pending'
      }
    });

    if (existingRequest) {
      return NextResponse.json({ 
        error: 'Request already exists',
        details: 'You already have a pending teacher request'
      }, { status: 400 });
    }

    // Créer la demande
    const teacherRequest = await prisma.teacherRequest.create({
      data: {
        userId: user.id,
        name: name.trim(),
        email: session.user.email,
        school: school.trim(),
        subject: subject.trim(),
        message: message?.trim() || null,
        status: 'pending'
      }
    });

    console.log('✅ Nouvelle demande professeur:', {
      id: teacherRequest.id,
      name,
      email: session.user.email,
      school,
      subject,
      timestamp: teacherRequest.createdAt
    });

    return NextResponse.json({
      success: true,
      request: teacherRequest,
      message: 'Votre demande a été enregistrée et sera examinée par notre équipe.'
    });
  } catch (error: any) {
    console.error('❌ Error submitting teacher request:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error?.message },
      { status: 500 }
    );
  }
}
