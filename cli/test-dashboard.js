#!/usr/bin/env node

import { setConfig } from './src/lib/config.js'
import { showDashboard } from './src/commands/login.js'

// Simuler une connexion réussie
setConfig('apiKey', 'mths_test123456789')
setConfig('username', 'Ønyx')
setConfig('soloElo', 400)
setConfig('multiplayerElo', 400)

// Afficher le dashboard
showDashboard({
  username: 'Ønyx',
  soloElo: 400,
  multiplayerElo: 400,
  streak: 0
})
