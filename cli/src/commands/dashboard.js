import chalk from 'chalk'
import { getConfig } from '../lib/config.js'
import { api } from '../lib/api.js'

// Interface Retro-Futuriste
function showDashboard(userData) {
  console.clear()
  
  // Header principal
  console.log(chalk.cyan('╔══════════════════════════════════════════╗'))
  console.log(chalk.cyan('║  ▣▣▣▣ MATHS APP CLI ▣▣▣▣                  ║'))
  console.log(chalk.cyan('╠══════════════════════════════════════════╣'))
  console.log(chalk.cyan('║                                          ║'))
  
  // Section utilisateur
  console.log(chalk.cyan('║  ╔═════════════════════════════════════╗  ║'))
  console.log(chalk.cyan('║  ║  👤 UTILISATEUR : ') + chalk.bold.white(userData.username.padEnd(15)) + chalk.cyan('║  ║'))
  console.log(chalk.cyan('║  ║  🔥 STREAK : ') + chalk.bold.yellow(userData.streak ? userData.streak.toString().padEnd(15) : '0'.padEnd(15)) + chalk.cyan('║  ║'))
  console.log(chalk.cyan('║  ║  💎 ELO SOLO : ') + chalk.bold.green(userData.soloElo.toString().padEnd(13)) + chalk.cyan('║  ║'))
  console.log(chalk.cyan('║  ║  ⚔️ ELO MULTI : ') + chalk.bold.magenta(userData.multiplayerElo ? userData.multiplayerElo.toString().padEnd(11) : 'N/A'.padEnd(11)) + chalk.cyan('║  ║'))
  console.log(chalk.cyan('║  ╚═════════════════════════════════════╝  ║'))
  console.log(chalk.cyan('║                                          ║'))
  
  // Menu principal
  console.log(chalk.cyan('║  ◆ STATISTIQUES  ◆ JOUER  ◆ CLASSEMENT   ║'))
  console.log(chalk.cyan('║                                          ║'))
  console.log(chalk.cyan('║  ╔═════════════════════════════════════╗  ║'))
  console.log(chalk.cyan('║  ║  📊 PROGRESSION MENSUELLE            ║  ║'))
  console.log(chalk.cyan('║  ║  🎯 SOLO : ') + chalk.bold.green('PRÊT À JOUER'.padEnd(19)) + chalk.cyan('║  ║'))
  console.log(chalk.cyan('║  ║  ⚔️ MULTI : ') + chalk.bold.magenta('DISPONIBLE'.padEnd(17)) + chalk.cyan('║  ║'))
  console.log(chalk.cyan('║  ║  🏆 CLASSEMENT : ') + chalk.bold.yellow('TOP 15%'.padEnd(12)) + chalk.cyan('║  ║'))
  console.log(chalk.cyan('║  ╚═════════════════════════════════════╝  ║'))
  console.log(chalk.cyan('║                                          ║'))
  
  // Footer
  console.log(chalk.cyan('║  ╔═════════════════════════════════════╗  ║'))
  console.log(chalk.cyan('║  ║  💡 CONSEIL : ') + chalk.gray('La pratique régulière'.padEnd(17)) + chalk.cyan('║  ║'))
  console.log(chalk.cyan('║  ║  ') + chalk.gray('est la clé de la maîtrise !'.padEnd(37)) + chalk.cyan('║  ║'))
  console.log(chalk.cyan('║  ╚═════════════════════════════════════╝  ║'))
  console.log(chalk.cyan('║                                          ║'))
  console.log(chalk.cyan('╚══════════════════════════════════════════╝'))
  
  console.log()
  console.log(chalk.bold.white('🎮 Commandes disponibles :'))
  console.log(chalk.cyan('  maths solo    ') + chalk.gray('- Lancer une partie solo'))
  console.log(chalk.cyan('  maths duel    ') + chalk.gray('- Créer/rejoindre un duel'))
  console.log(chalk.cyan('  maths stats   ') + chalk.gray('- Voir tes statistiques'))
  console.log(chalk.cyan('  maths history ') + chalk.gray('- Historique des parties'))
  console.log(chalk.cyan('  maths dashboard') + chalk.gray('- Afficher ce tableau de bord'))
  console.log()
}

export async function dashboard() {
  try {
    // Vérifier si l'utilisateur est connecté
    const apiKey = getConfig('apiKey')
    if (!apiKey) {
      console.log(chalk.red('❌ Tu dois d\'abord te connecter avec "maths login"'))
      return
    }

    // Rafraîchir les données utilisateur
    const response = await api.verifyKey()
    
    if (response.valid) {
      showDashboard({
        username: response.username,
        soloElo: response.soloElo,
        multiplayerElo: response.multiplayerElo,
        streak: response.streak || 0
      })
    } else {
      console.log(chalk.red('❌ Session invalide, reconnecte-toi avec "maths login"'))
    }
  } catch (error) {
    console.log(chalk.red('❌ Erreur lors du chargement du dashboard'))
    console.error(error.message)
  }
}
