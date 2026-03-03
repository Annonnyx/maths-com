import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { teacherId } = await request.json();
    
    // Vérifier l'authentification avec NextAuth
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Vérifier si l'utilisateur est un étudiant
    const profile = await prisma.user.findUnique({
      where: { id: token.id! },
      select: { isTeacher: true }
    });

    if (profile?.isTeacher) {
      return NextResponse.json({ error: 'Les professeurs ne peuvent pas rejoindre de classe' }, { status: 403 });
    }

    // Vérifier si une demande existe déjà
    const existingRequest = await prisma.classJoinRequest.findFirst({
      where: {
        studentId: token.id!,
        teacherId: teacherId,
        status: { in: ['pending', 'accepted'] }
      }
    });

    if (existingRequest) {
      return NextResponse.json({ 
        status: existingRequest.status,
        message: existingRequest.status === 'pending' 
          ? 'Demande déjà envoyée' 
          : 'Déjà membre de cette classe'
      }, { status: 409 });
    }

    // Vérifier si le professeur accepte les demandes
    const teacherProfile = await prisma.user.findUnique({
      where: { id: teacherId },
      select: { acceptJoinRequests: true }
    });

    if (!teacherProfile?.acceptJoinRequests) {
      return NextResponse.json({ 
        error: 'Ce professeur n\'accepte pas les nouvelles demandes' 
      }, { status: 403 });
    }

    // Créer la demande
    const joinRequest = await prisma.classJoinRequest.create({
      data: {
        studentId: token.id!,
        teacherId: teacherId,
        status: 'pending'
      }
    });

    return NextResponse.json({ 
      success: true,
      request: joinRequest
    });

  } catch (error) {
    console.error('Error in class-join route:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');
    
    if (!teacherId) {
      return NextResponse.json({ error: 'teacherId requis' }, { status: 400 });
    }

    // Vérifier l'authentification avec NextAuth
    const token = await getToken({ req: request });
    if (!token) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Vérifier le statut de la demande
    const joinRequest = await prisma.classJoinRequest.findFirst({
      where: {
        studentId: token.id!,
        teacherId: teacherId
      }
    });

    return NextResponse.json({ 
      hasRequest: !!joinRequest,
      status: joinRequest?.status || null
    });

  } catch (error) {
    console.error('Error in class-join GET route:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
