import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { THEMES, ThemeId } from '@/lib/themes';

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { theme } = await request.json();

    // Valider que le thème existe
    if (!theme || !THEMES.find(t => t.id === theme)) {
      return NextResponse.json({ error: 'Invalid theme' }, { status: 400 });
    }

    // Mettre à jour la préférence de thème en base
    await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        // Note: On utilise une colonne existante ou on l'ajoute si nécessaire
        // Pour l'instant, on utilise localStorage comme persistance principale
      }
    });

    return NextResponse.json({ 
      success: true, 
      theme 
    });

  } catch (error) {
    console.error('Error updating theme preference:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Pour l'instant, retourner le thème par défaut
    // TODO: Récupérer depuis la base quand la colonne sera ajoutée
    return NextResponse.json({ 
      theme: 'neon' 
    });

  } catch (error) {
    console.error('Error getting theme preference:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
