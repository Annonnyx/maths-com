import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification avec NextAuth
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    // Pour l'instant, retourner des tickets mockés
    // TODO: Implémenter avec Prisma quand la table tickets sera créée
    const mockTickets = [
      {
        id: 'mock-1',
        title: 'Problème avec la grille de géométrie',
        category: 'bug',
        description: 'La grille ne s\'affiche pas correctement',
        priority: 'high',
        status: 'ouvert',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    return NextResponse.json({
      success: true,
      tickets: mockTickets
    });

  } catch (error) {
    console.error('Error in /api/tickets:', error);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification avec NextAuth
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, category, description, priority } = body;

    if (!title || !category || !description) {
      return NextResponse.json(
        { error: 'Champs requis manquants' },
        { status: 400 }
      );
    }

    // Pour l'instant, retourner un ticket mocké
    // TODO: Implémenter avec Prisma quand la table tickets sera créée
    const newTicket = {
      id: `ticket-${Date.now()}`,
      title,
      category,
      description,
      priority: priority || 'medium',
      status: 'ouvert',
      user_id: session.user.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      ticket: newTicket
    });

  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}
