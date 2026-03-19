#!/usr/bin/env node

import { apiRequest } from './src/lib/api.js'

async function testLogin() {
  try {
    console.log('🔑 Test de connexion avec mths_test123456789')
    
    // Simuler la sauvegarde de la clé et forcer localhost
    const { getConfigValue, setConfig } = await import('./src/lib/config.js')
    setConfig('apiKey', 'mths_test123456789')
    setConfig('apiUrl', 'http://localhost:3000')
    
    // Tester l'API
    const response = await apiRequest('/auth/verify', { 
      method: 'POST',
      body: JSON.stringify({})
    })
    
    console.log('✅ Réponse API:', response)
    
    if (response.valid) {
      console.log('🎉 Connexion réussie !')
      console.log('👤 Utilisateur:', response.username)
      console.log('💎 ELO Solo:', response.soloElo)
      console.log('⚔️ ELO Multi:', response.multiplayerElo)
      console.log('🔥 Streak:', response.streak)
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message)
  }
}

testLogin()
