import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST /api/admin/force-logout - Forcer la déconnexion de tous les utilisateurs
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Vérifier si l'utilisateur est admin
    if (!session?.user?.email || !session.user.email.includes('admin')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    console.log('🔄 Déconnexion forcée de tous les utilisateurs...');

    // Option 1: Supprimer toutes les sessions NextAuth
    let sessionCount = 0;
    try {
      const result = await prisma.session.deleteMany({});
      sessionCount = result.count;
      console.log(`✅ ${sessionCount} sessions NextAuth supprimées`);
    } catch (error) {
      console.log('ℹ️  Pas de table session trouvée (normal si JWT)');
    }

    // Option 2: Mettre à jour updatedAt pour invalider les tokens
    const userResult = await prisma.user.updateMany({
      data: {
        updatedAt: new Date()
      }
    });
    console.log(`✅ ${userResult.count} utilisateurs mis à jour`);

    // Option 3: Si vous utilisez Supabase, vous pouvez aussi révoquer les tokens
    // (nécessite le client Supabase admin)
    try {
      const { getSupabase } = await import('@/lib/supabase');
      const supabase = getSupabase();
      
      // Révoquer tous les tokens refresh
      const { error } = await supabase.auth.admin.signOutAll();
      if (error) {
        console.log('ℹ️  Impossible de révoquer les tokens Supabase:', error.message);
      } else {
        console.log('✅ Tokens Supabase révoqués');
      }
    } catch (error) {
      console.log('ℹ️  Supabase admin non disponible');
    }

    return NextResponse.json({
      success: true,
      message: 'Tous les utilisateurs ont été déconnectés',
      sessionsDeleted: sessionCount,
      usersUpdated: userResult.count,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Erreur lors de la déconnexion forcée:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la déconnexion forcée' },
      { status: 500 }
    );
  }
}
