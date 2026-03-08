import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET - Récupérer les devoirs d'une classe
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

    // TODO: Implémenter le modèle Assignment dans Prisma
    // Pour l'instant, retourner un tableau vide
    return NextResponse.json({ assignments: [] });

  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

// POST - Créer un devoir (prof uniquement)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { classId, title, description, dueDate, type } = body;

    if (!classId || !title) {
      return NextResponse.json({ error: 'classId et title requis' }, { status: 400 });
    }

    // Vérifier que l'utilisateur est le professeur
    const classGroup = await prisma.classGroup.findUnique({
      where: { id: classId },
      select: { teacherId: true }
    });

    if (!classGroup || classGroup.teacherId !== session.user.id) {
      return NextResponse.json({ error: 'Accès réservé au professeur' }, { status: 403 });
    }

    // TODO: Créer le devoir quand le modèle Prisma sera ajouté
    return NextResponse.json({ 
      success: true, 
      message: 'Devoir créé (API prête - modèle Prisma à ajouter)'
    });

  } catch (error) {
    console.error('Error creating assignment:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
