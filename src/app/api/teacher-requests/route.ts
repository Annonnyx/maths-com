import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/teacher-requests - Soumettre une demande professeur
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    const body = await request.json();
    const { name, email, school, subject, message } = body;

    // Validation
    if (!name || !email || !school || !subject) {
      return NextResponse.json(
        { error: 'Name, email, school and subject are required' },
        { status: 400 }
      );
    }

    // Créer la demande
    const teacherRequest = await prisma.teacherRequest.create({
      data: {
        userId: session?.user?.id || 'anonymous',
        name,
        email,
        school,
        subject,
        message: message || null,
        status: 'pending'
      }
    });

    console.log('✅ Nouvelle demande professeur:', {
      id: teacherRequest.id,
      name,
      email,
      school,
      timestamp: teacherRequest.createdAt
    });

    return NextResponse.json({
      success: true,
      requestId: teacherRequest.id,
      message: 'Votre demande a été enregistrée et sera examinée par notre équipe.'
    });
  } catch (error) {
    console.error('❌ Error submitting teacher request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
