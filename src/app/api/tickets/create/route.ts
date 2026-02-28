import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

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

    const cookieStore = await cookies();
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            cookie: cookieStore.toString(),
          },
        },
      }
    );

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
    try {
      const botResponse = await fetch(`${process.env.BOT_API_URL || 'http://localhost:3002'}/api/tickets/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.BOT_API_SECRET || 'ae88486ea8d3d7325cea8542e6a2be15c87fc1e7f3cdb12cd43aacbcdd21eded'}`
        },
        body: JSON.stringify({
          ticketId: ticket.id,
          title: ticket.title,
          category: ticket.category,
          priority: ticket.priority,
          description: ticket.description,
          userId: user.id,
          username: user.user_metadata?.username || user.email
        })
      });

      if (botResponse.ok) {
        const botData = await botResponse.json();
        
        // Mettre à jour le ticket avec l'ID du channel Discord
        await supabase
          .from('tickets')
          .update({ discord_channel_id: botData.channelId })
          .eq('id', ticket.id);
      } else {
        console.error('Bot API error:', await botResponse.text());
      }
    } catch (botError) {
      console.error('Error calling bot API:', botError);
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
