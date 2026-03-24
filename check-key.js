const { PrismaClient } = require('@prisma/client');
const bcryptjs = require('bcryptjs');

const prisma = new PrismaClient();

async function checkKey() {
  try {
    console.log('🔍 Recherche de la clé dans la base de données...');
    
    // Récupérer toutes les clés
    const keys = await prisma.cliApiKey.findMany({
      include: { user: true }
    });
    
    console.log(`📊 Nombre total de clés trouvées: ${keys.length}`);
    
    // La clé fournie
    const targetKey = 'mths_92cb505dcdde74012d3eb909065bc98721665cbb9afb1d7aeb4e8426a414c797';
    
    let found = false;
    for (const keyRecord of keys) {
      const match = await bcryptjs.compare(targetKey, keyRecord.keyHash);
      if (match) {
        console.log('✅ Clé trouvée !');
        console.log(`👤 Utilisateur: ${keyRecord.user.username}`);
        console.log(`📧 Email: ${keyRecord.user.email}`);
        console.log(`🆔 User ID: ${keyRecord.user.id}`);
        console.log(`🔑 Key ID: ${keyRecord.id}`);
        console.log(`📅 Créée le: ${keyRecord.createdAt}`);
        console.log(`🔄 Dernier usage: ${keyRecord.lastUsedAt}`);
        console.log(`🏷️  Label: ${keyRecord.label}`);
        found = true;
        break;
      }
    }
    
    if (!found) {
      console.log('❌ Clé non trouvée dans la base de données');
      console.log('\n📋 Clés disponibles:');
      keys.forEach((key, index) => {
        console.log(`${index + 1}. ID: ${key.id}, User: ${key.user.username}, Label: ${key.label}, Created: ${key.createdAt}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkKey();
