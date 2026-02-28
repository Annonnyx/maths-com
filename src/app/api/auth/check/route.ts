import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendValidationError, sendNotFoundError, sendInternalError } from '@/lib/api-utils';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    
    if (!email) {
      return sendValidationError('Email requis');
    }

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

    if (!user) {
      return sendValidationError('Utilisateur non trouvé', { exists: false, code: 'USER_NOT_FOUND' });
    }

    if (!user.password) {
      return sendValidationError('Compte OAuth', { exists: true, hasPassword: false, code: 'OAUTH_ACCOUNT' });
    }

    return NextResponse.json({ 
      exists: true, 
      hasPassword: true 
    });
    
  } catch (error) {
    console.error('Error checking user:', error);
    return sendInternalError('Erreur lors de la vérification de l\'utilisateur');
  }
}
