import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import bcryptjs from 'bcryptjs'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    console.log('🔑 CLI Keys API - POST request received');
    
    const session = await getServerSession(authOptions)
    console.log('🔍 Session check:', session ? 'Session found' : 'No session');
    console.log('🔍 Session user:', session?.user?.email || 'No user email');
    
    if (!session?.user?.email) {
      console.log('❌ No session or email found');
      return NextResponse.json({ error: 'Non autorisé - Session requise' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      console.log('❌ User not found in database for email:', session.user.email);
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    console.log('✅ User found:', user.username);

    const body = await request.json()
    const { label } = body

    // Générer la clef brute
    const rawKey = 'mths_' + crypto.randomBytes(32).toString('hex')
    
    // Hasher la clef avec bcryptjs
    const saltRounds = 12
    const keyHash = await bcryptjs.hash(rawKey, saltRounds)

    // Sauvegarder le hash dans la base de données
    const apiKey = await prisma.cliApiKey.create({
      data: {
        userId: user.id,
        keyHash,
        label: label || 'Clef CLI'
      }
    })

    // Retourner la clef en clair une seule fois
    return NextResponse.json({
      success: true,
      key: rawKey,
      keyId: apiKey.id,
      createdAt: apiKey.createdAt
    })
  } catch (error) {
    console.error('Erreur création clef CLI:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔑 CLI Keys API - GET request received');
    
    const session = await getServerSession(authOptions)
    console.log('🔍 Session check (GET):', session ? 'Session found' : 'No session');
    console.log('🔍 Session user (GET):', session?.user?.email || 'No user email');
    
    if (!session?.user?.email) {
      console.log('❌ No session or email found (GET)');
      return NextResponse.json({ error: 'Non autorisé - Session requise' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      console.log('❌ User not found in database for email (GET):', session.user.email);
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    console.log('✅ User found for GET:', user.username);

    const keys = await prisma.cliApiKey.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        label: true,
        lastUsedAt: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ keys })
  } catch (error) {
    console.error('Erreur récupération clefs CLI:', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
