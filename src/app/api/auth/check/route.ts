import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendValidationError, sendNotFoundError, sendInternalError } from '@/lib/api-utils';

export async function POST(req: NextRequest) {
  try {
    console.log("🔍 Début de /api/auth/check");
    const { email } = await req.json();
    console.log("📧 Email reçu:", email);
    
    if (!email) {
      console.log("❌ Email manquant");
      return sendValidationError('Email requis');
    }

    console.log("🔍 Recherche utilisateur dans la base...");
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { username: email }
        ]
      },
      select: {
        id: true,
        email: true,
        username: true,
        password: true
      }
    });

    console.log("👤 Utilisateur trouvé:", user ? "OUI" : "NON");

    if (!user) {
      console.log("❌ Utilisateur non trouvé");
      return sendValidationError('Utilisateur non trouvé', { exists: false, code: 'USER_NOT_FOUND' });
    }

    if (!user.password) {
      console.log("🔑 Compte OAuth sans mot de passe");
      return sendValidationError('Compte OAuth', { exists: true, hasPassword: false, code: 'OAUTH_ACCOUNT' });
    }

    console.log("✅ Vérification réussie");
    const response = NextResponse.json({ 
      exists: true, 
      hasPassword: true 
    });
    console.log("📤 Réponse envoyée:", response);
    return response;
    
  } catch (error) {
    console.error('💥 Erreur dans /api/auth/check:', error);
    return sendInternalError('Erreur lors de la vérification de l\'utilisateur');
  }
}
