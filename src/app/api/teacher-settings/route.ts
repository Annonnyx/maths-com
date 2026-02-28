import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PUT(request: NextRequest) {
  try {
    const { acceptJoinRequests } = await request.json();
    
    if (typeof acceptJoinRequests !== 'boolean') {
      return NextResponse.json({ error: 'acceptJoinRequests doit être un booléen' }, { status: 400 });
    }

    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Vérifier que l'utilisateur est un professeur
    const { data: profile } = await supabase
      .from('users')
      .select('isTeacher')
      .eq('id', user.id)
      .single();

    if (!profile?.isTeacher) {
      return NextResponse.json({ error: 'Accès réservé aux professeurs' }, { status: 403 });
    }

    // Mettre à jour la préférence
    const { data: updatedProfile, error: updateError } = await supabase
      .from('users')
      .update({ accept_join_requests: acceptJoinRequests })
      .eq('id', user.id)
      .select('accept_join_requests')
      .single();

    if (updateError) {
      console.error('Error updating teacher settings:', updateError);
      return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      acceptJoinRequests: updatedProfile.accept_join_requests
    });

  } catch (error) {
    console.error('Error in teacher-settings route:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Récupérer les préférences du professeur
    const { data: profile } = await supabase
      .from('users')
      .select('accept_join_requests')
      .eq('id', user.id)
      .single();

    return NextResponse.json({ 
      acceptJoinRequests: profile?.accept_join_requests ?? true
    });

  } catch (error) {
    console.error('Error in teacher-settings GET route:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
