import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const { status } = await request.json();
    const { requestId } = await params;
    
    if (!['accepted', 'refused'].includes(status)) {
      return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });
    }

    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Vérifier que l'utilisateur est le professeur de cette demande
    const { data: joinRequest } = await supabase
      .from('class_join_requests')
      .select('*')
      .eq('id', requestId)
      .eq('teacher_id', user.id)
      .single();

    if (!joinRequest) {
      return NextResponse.json({ error: 'Demande non trouvée' }, { status: 404 });
    }

    if (joinRequest.status !== 'pending') {
      return NextResponse.json({ error: 'Demande déjà traitée' }, { status: 409 });
    }

    // Mettre à jour le statut de la demande
    const { data: updatedRequest, error: updateError } = await supabase
      .from('class_join_requests')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', requestId)
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
      .single();

    if (updateError) {
      console.error('Error updating join request:', updateError);
      return NextResponse.json({ error: 'Erreur lors de la mise à jour' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true,
      request: updatedRequest
    });

  } catch (error) {
    console.error('Error in class-requests PUT route:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const { requestId } = await params;
    
    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    }

    // Vérifier que l'utilisateur est le professeur de cette demande
    const { data: joinRequest } = await supabase
      .from('class_join_requests')
      .select('*')
      .eq('id', requestId)
      .eq('teacher_id', user.id)
      .single();

    if (!joinRequest) {
      return NextResponse.json({ error: 'Demande non trouvée' }, { status: 404 });
    }

    // Supprimer la demande
    const { error: deleteError } = await supabase
      .from('class_join_requests')
      .delete()
      .eq('id', requestId);

    if (deleteError) {
      console.error('Error deleting join request:', deleteError);
      return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error in class-requests DELETE route:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
