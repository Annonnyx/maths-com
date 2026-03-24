const { PrismaClient } = require('@prisma/client');
const bcryptjs = require('bcryptjs');

const prisma = new PrismaClient();

async function checkNewestKey() {
  try {
    console.log('🔍 Recherche de la toute dernière clé...');
    
    // La nouvelle clé fournie
    const targetKey = 'mths_10bf28fdff4adb7f48db43a8d7f7f77ddc0dbcdc05cabe370ea17f72324c2547';
    
    // Récupérer toutes les clés
    const keys = await prisma.cliApiKey.findMany({
      include: { user: true }
    });
    
    console.log(`📊 Nombre total de clés trouvées: ${keys.length}`);
    
    let found = false;
    for (const keyRecord of keys) {
      const match = await bcryptjs.compare(targetKey, keyRecord.keyHash);
      if (match) {
        console.log('✅ Dernière clé trouvée !');
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
      console.log('❌ Dernière clé non trouvée dans la base de données locale');
      console.log('\n📋 Toutes les clés disponibles:');
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

checkNewestKey();
