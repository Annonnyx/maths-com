import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: NextRequest) {
  try {
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

    // Récupérer les demandes en attente
    const { data: pendingRequests, error: requestsError } = await supabase
      .from('class_join_requests')
      .select(`
        *,
        student!inner(
          id,
          username,
          displayName,
          avatarUrl,
          elo,
          rankClass
        )
      `)
      .eq('teacher_id', user.id)
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (requestsError) {
      console.error('Error fetching join requests:', requestsError);
      return NextResponse.json({ error: 'Erreur lors de la récupération des demandes' }, { status: 500 });
    }

    // Récupérer les élèves acceptés
    const { data: acceptedRequests, error: acceptedError } = await supabase
      .from('class_join_requests')
      .select(`
        student_id,
        updated_at:joined_at,
        student!inner(
          id,
          username,
          displayName,
          avatarUrl,
          elo,
          rankClass
        )
      `)
      .eq('teacher_id', user.id)
      .eq('status', 'accepted')
      .order('updated_at', { ascending: false });

    if (acceptedError) {
      console.error('Error fetching accepted students:', acceptedError);
      return NextResponse.json({ error: 'Erreur lors de la récupération des élèves' }, { status: 500 });
    }

    return NextResponse.json({ 
      pendingRequests: pendingRequests || [],
      acceptedStudents: acceptedRequests || []
    });

  } catch (error) {
    console.error('Error in class-requests GET route:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
