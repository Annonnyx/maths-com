import { NextRequest } from 'next/server'
import bcryptjs from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function authenticateCliKey(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer mths_')) return null

  const rawKey = authHeader.replace('Bearer ', '')
  
  // Récupérer toutes les clefs et comparer avec bcrypt
  // (en prod : optimiser avec un lookup par préfixe)
  const keys = await prisma.cliApiKey.findMany({
    include: { user: true }
  })
  
  for (const keyRecord of keys) {
    const match = await bcryptjs.compare(rawKey, keyRecord.keyHash)
    if (match) {
      await prisma.cliApiKey.update({
        where: { id: keyRecord.id },
        data: { lastUsedAt: new Date() }
      })
      return keyRecord.user
    }
  }
  return null
}
