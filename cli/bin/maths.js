#!/usr/bin/env node

import { Command } from 'commander'
import { login } from '../src/commands/login.js'
import { logout } from '../src/commands/logout.js'
import { whoami } from '../src/commands/whoami.js'
import { solo } from '../src/commands/solo.js'
import { duel } from '../src/commands/duel.js'
import { history } from '../src/commands/history.js'

const program = new Command()

program
  .name('maths')
  .description('CLI officielle de maths-app.fr')
  .version('1.0.0')

// Commande login
program
  .command('login')
  .description('Se connecter avec une clef API')
  .action(login)

// Commande logout
program
  .command('logout')
  .description('Se déconnecter')
  .action(logout)

// Commande whoami
program
  .command('whoami')
  .description('Afficher les informations de l\'utilisateur connecté')
  .action(whoami)

// Commande history
program
  .command('history')
  .description('Afficher l\'historique des parties solo')
  .option('-n, --number <number>', 'Nombre de parties à afficher', '5')
  .action(history)

// Commande solo
program
  .command('solo')
  .description('Lancer une partie solo')
  .option('-d, --difficulty <difficulty>', 'Difficulté (easy, medium, hard, mixed)', 'mixed')
  .option('-q, --questions <number>', 'Nombre de questions (10, 20)', '10')
  .option('-t, --type <type>', 'Type de jeu (casual, training)', 'casual')
  .action(solo)

// Commande duel
const duelCommand = program
  .command('duel')
  .description('Gérer les duels multijoueurs')

duelCommand
  .command('create')
  .description('Créer un nouveau duel')
  .option('-d, --difficulty <difficulty>', 'Difficulté (easy, medium, hard, mixed)', 'mixed')
  .option('-t, --time <timeControl>', 'Contrôle du temps (bullet, blitz, rapid)', 'blitz')
  .option('-q, --questions <number>', 'Nombre de questions (10, 20)', '10')
  .action((options) => duel('create', options))

duelCommand
  .command('join')
  .description('Rejoindre un duel avec un code')
  .argument('<code>', 'Code de rejoindre du duel')
  .action((code) => duel('join', { code }))

// Gérer les erreurs
program.exitOverride((err) => {
  if (err.code === 'commander.help' || err.code === 'commander.version') {
    process.exit(0)
  }
  throw err
})

process.on('uncaughtException', (err) => {
  console.error('❌ Erreur inattendue:', err.message)
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Promise non gérée:', reason)
  process.exit(1)
})

// Démarrer le programme
program.parse()
