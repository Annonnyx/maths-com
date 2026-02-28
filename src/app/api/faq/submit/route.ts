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

    // Créer l'entrée en base de données
    const submission = await prisma.faqSubmission.create({
      data: {
        type: body.type,
        title: body.title,
        description: body.description,
        email: body.email || null,
        category: body.category,
        status: 'pending',
        userAgent: request.headers.get('user-agent') || null,
        ip: request.headers.get('x-forwarded-for') || null
      }
    });

    // Log pour l'admin
    console.log('✅ Nouvelle soumission FAQ enregistrée:', {
      id: submission.id,
      type: body.type,
      title: body.title,
      timestamp: submission.createdAt
    });

    return NextResponse.json({
      success: true,
      ticketId: submission.id,
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
