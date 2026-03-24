const { PrismaClient } = require('@prisma/client');
const bcryptjs = require('bcryptjs');

const prisma = new PrismaClient();

async function checkNewKey() {
  try {
    console.log('🔍 Recherche de la nouvelle clé dans la base de données...');
    
    // La nouvelle clé fournie
    const targetKey = 'mths_188f4d72b58f339feff7c3b8bb6ef62c1d6761733b306b515eca47bf299ea106';
    
    // Récupérer toutes les clés
    const keys = await prisma.cliApiKey.findMany({
      include: { user: true }
    });
    
    console.log(`📊 Nombre total de clés trouvées: ${keys.length}`);
    
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
      console.log('❌ Clé non trouvée dans la base de données locale');
      console.log('\n📋 Clés disponibles localement:');
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

checkNewKey();
