import { NextRequest } from 'next/server'
import bcryptjs from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function authenticateCliKey(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  console.log('🔑 CLI Auth - Header:', authHeader ? 'Present' : 'Missing')
  
  if (!authHeader?.startsWith('Bearer mths_')) {
    console.log('❌ CLI Auth - Invalid format')
    return null
  }

  const rawKey = authHeader.replace('Bearer ', '')
  console.log('🔍 CLI Auth - Testing key:', rawKey.substring(0, 20) + '...')
  
  // Récupérer toutes les clefs et comparer avec bcrypt
  // (en prod : optimiser avec un lookup par préfixe)
  const keys = await prisma.cliApiKey.findMany({
    include: { user: true }
  })
  
  console.log(`📊 CLI Auth - Found ${keys.length} keys in database`)
  
  for (const keyRecord of keys) {
    const match = await bcryptjs.compare(rawKey, keyRecord.keyHash)
    if (match) {
      console.log(`✅ CLI Auth - Key matched for user: ${keyRecord.user.username}`)
      await prisma.cliApiKey.update({
        where: { id: keyRecord.id },
        data: { lastUsedAt: new Date() }
      })
      return keyRecord.user
    }
  }
  
  console.log('❌ CLI Auth - No key matched')
  return null
}
