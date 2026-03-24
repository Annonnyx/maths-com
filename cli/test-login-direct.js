import { api } from './src/lib/api.js';
import { setConfig } from './src/lib/config.js';

async function testLogin() {
  try {
    // Forcer la clé API
    setConfig('apiKey', 'mths_10bf28fdff4adb7f48db43a8d7f7f77ddc0dbcdc05cabe370ea17f72324c2547');
    setConfig('apiUrl', 'https://www.maths-app.com');
    
    console.log('🔑 Test de connexion avec la clé...');
    const response = await api.verifyKey();
    console.log('✅ Réponse:', response);
    
    if (response.valid) {
      console.log('🎉 CONNEXION RÉUSSIE !');
      console.log(`👤 Utilisateur: ${response.username}`);
      console.log(`🏆 ELO Solo: ${response.soloElo}`);
      console.log(`🏆 ELO Multi: ${response.multiplayerElo}`);
    } else {
      console.log('❌ Échec de connexion');
    }
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testLogin();
