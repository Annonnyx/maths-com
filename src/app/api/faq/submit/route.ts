import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface FAQSubmission {
  type: 'bug' | 'question' | 'suggestion';
  title: string;
  description: string;
  email?: string;
  category: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: FAQSubmission = await request.json();

    // Validation basique
    if (!body.title || !body.description) {
      return NextResponse.json(
        { error: 'Titre et description requis' },
        { status: 400 }
      );
    }

    // Créer un ticket admin pour cette soumission FAQ
    const ticketId = `faq_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    // Pour l'instant, on stocke dans la base de données des tickets (à créer)
    // En attendant, on peut utiliser une table temporaire ou les logs
    // TODO: Créer une table faq_submissions ou utiliser le système de tickets

    // Log pour l'admin (sera visible dans les logs Railway/admin)
    console.log('📝 Nouvelle soumission FAQ:', {
      id: ticketId,
      type: body.type,
      category: body.category,
      title: body.title,
      description: body.description,
      email: body.email || 'Non fourni',
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || 'Unknown'
    });

    // Ici on pourrait envoyer un email ou créer une notification
    // Pour l'instant, on confirme juste la réception

    return NextResponse.json({
      success: true,
      ticketId,
      message: 'Votre demande a été enregistrée. Notre équipe vous répondra bientôt.'
    });

  } catch (error) {
    console.error('❌ Erreur lors de la soumission FAQ:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
