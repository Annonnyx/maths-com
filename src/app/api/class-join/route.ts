import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { teacherId } = await request.json();
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Vérifier si l'utilisateur est un étudiant
    const { data: profile } = await supabase
      .from('users')
      .select('isTeacher')
      .eq('id', user.id)
      .single();

    if (profile?.isTeacher) {
      return NextResponse.json({ error: 'Les professeurs ne peuvent pas rejoindre de classe' }, { status: 403 });
    }

    // Vérifier si une demande existe déjà
    const { data: existingRequest } = await supabase
      .from('class_join_requests')
      .select('*')
      .eq('student_id', user.id)
      .eq('teacher_id', teacherId)
      .in('status', ['pending', 'accepted'])
      .single();

    if (existingRequest) {
      return NextResponse.json({ 
        status: existingRequest.status,
        message: existingRequest.status === 'pending' 
          ? 'Demande déjà envoyée' 
          : 'Déjà membre de cette classe'
      }, { status: 409 });
    }

    // Vérifier si le professeur accepte les demandes
    const { data: teacherProfile } = await supabase
      .from('users')
      .select('accept_join_requests')
      .eq('id', teacherId)
      .single();

    if (!teacherProfile?.accept_join_requests) {
      return NextResponse.json({ 
        error: 'Ce professeur n\'accepte pas les nouvelles demandes' 
      }, { status: 403 });
    }

    // Créer la demande
    const { data: joinRequest, error: insertError } = await supabase
      .from('class_join_requests')
      .insert({
        student_id: user.id,
        teacher_id: teacherId,
        status: 'pending'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating join request:', insertError);
      return NextResponse.json({ error: 'Erreur lors de la création de la demande' }, { status: 500 });
    }

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

    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Vérifier le statut de la demande
    const { data: joinRequest } = await supabase
      .from('class_join_requests')
      .select('*')
      .eq('student_id', user.id)
      .eq('teacher_id', teacherId)
      .single();

    return NextResponse.json({ 
      hasRequest: !!joinRequest,
      status: joinRequest?.status || null
    });

  } catch (error) {
    console.error('Error in class-join GET route:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
