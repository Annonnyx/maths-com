import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function POST(request: NextRequest) {
  try {
    const { category, title, description, priority } = await request.json();

    // Validation
    if (!category || !title || !description || !priority) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    if (!['bug', 'question', 'autre'].includes(category)) {
      return NextResponse.json(
        { error: 'Catégorie invalide' },
        { status: 400 }
      );
    }

    if (!['low', 'medium', 'high'].includes(priority)) {
      return NextResponse.json(
        { error: 'Priorité invalide' },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    // Vérifier l'authentification
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Utilisateur non authentifié' },
        { status: 401 }
      );
    }

    // Insérer le ticket dans Supabase
    const { data: ticket, error: ticketError } = await supabase
      .from('tickets')
      .insert({
        user_id: user.id,
        title,
        category,
        description,
        priority
      })
      .select()
      .single();

    if (ticketError) {
      console.error('Error creating ticket:', ticketError);
      return NextResponse.json(
        { error: 'Erreur lors de la création du ticket' },
        { status: 500 }
      );
    }

    // Appeler le bot Discord pour créer le channel
    console.log('🎫 Tentative de création du channel Discord pour le ticket:', ticket.id);
    
    try {
      const botApiUrl = process.env.BOT_API_URL || 'http://localhost:3002';
      const botApiSecret = process.env.BOT_API_SECRET || 'ae88486ea8d3d7325cea8542e6a2be15c87fc1e7f3cdb12cd43aacbcdd21eded';
      
      console.log('🤖 Communication avec le bot Discord:', botApiUrl);
      
      const botResponse = await fetch(`${botApiUrl}/api/tickets/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${botApiSecret}`
        },
        body: JSON.stringify({
          ticketId: ticket.id,
          title: ticket.title,
          category: ticket.category,
          priority: ticket.priority,
          description: ticket.description,
          userId: user.id,
          username: user.user_metadata?.username || user.email
        }),
        // Timeout pour éviter les blocages
        signal: AbortSignal.timeout(5000)
      });

      if (botResponse.ok) {
        const botData = await botResponse.json();
        console.log('✅ Bot Discord a créé le channel:', botData.channelId);
        
        // Mettre à jour le ticket avec l'ID du channel Discord
        await supabase
          .from('tickets')
          .update({ discord_channel_id: botData.channelId })
          .eq('id', ticket.id);
      } else {
        const errorText = await botResponse.text();
        console.error('❌ Bot Discord API error:', errorText);
        
        // Continuer quand même sans le channel Discord
        console.log('⚠️ Ticket créé sans channel Discord (bot indisponible)');
      }
    } catch (botError) {
      console.error('❌ Erreur communication bot Discord:', botError);
      console.log('⚠️ Ticket créé sans channel Discord (bot indisponible)');
      // Ne pas échouer toute la requête si le bot ne répond pas
    }

    return NextResponse.json({
      success: true,
      ticket: {
        id: ticket.id,
        title: ticket.title,
        category: ticket.category,
        priority: ticket.priority,
        status: ticket.status,
        created_at: ticket.created_at
      }
    });

  } catch (error) {
    console.error('Error in /api/tickets/create:', error);
    return NextResponse.json(
      { error: 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}
