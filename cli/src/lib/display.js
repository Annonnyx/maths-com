import chalk from 'chalk'
import ora from 'ora'

// Fonctions pour afficher des messages stylisés
export const display = {
  success(message) {
    console.log(chalk.green('✓'), message)
  },

  error(message) {
    console.log(chalk.red('✗'), message)
  },

  info(message) {
    console.log(chalk.blue('ℹ'), message)
  },

  warning(message) {
    console.log(chalk.yellow('⚠'), message)
  },

  header(text) {
    console.log(chalk.bold.cyan(`\n${text}`))
    console.log(chalk.cyan('─'.repeat(text.length)))
  },

  divider() {
    console.log(chalk.gray('─'.repeat(process.stdout.columns || 80)))
  },

  // Afficher une question avec numéro
  question(number, total, text) {
    const progress = Math.round((number / total) * 10)
    const progressBar = '█'.repeat(progress) + '░'.repeat(10 - progress)
    
    console.log(chalk.bold.yellow(`\nQuestion ${number}/${total}`))
    console.log(chalk.gray(`[${progressBar}] ${progress * 10}%`))
    console.log(chalk.white(`\n${text}\n`))
  },

  // Afficher le score
  score(correct, total, time) {
    const percentage = Math.round((correct / total) * 100)
    const color = percentage >= 70 ? chalk.green : percentage >= 50 ? chalk.yellow : chalk.red
    
    console.log(color(`Score : ${correct}/${total} (${percentage}%)`))
    console.log(chalk.gray(`Temps : ${formatTime(time)}`))
  },

  // Afficher les changements ELO
  eloChange(before, after) {
    const change = after - before
    const sign = change >= 0 ? '+' : ''
    const color = change > 0 ? chalk.green : change < 0 ? chalk.red : chalk.gray
    
    console.log(color(`ELO : ${before} → ${after} (${sign}${change})`))
  },

  // Afficher un tableau de résultats
  resultsTable(results) {
    console.log(chalk.bold('\nRésultats détaillés :'))
    console.log(chalk.gray('─'.repeat(80)))
    
    results.forEach((result, index) => {
      const correct = result.isCorrect ? chalk.green('✓') : chalk.red('✗')
      const questionNum = chalk.bold(`Q${index + 1}`)
      
      console.log(`${questionNum} | ${correct} | ${result.question.substring(0, 40)}...`)
      console.log(`    | Ta réponse : ${chalk.gray(result.userAnswer || 'N/A')}`)
      console.log(`    | Bonne réponse : ${chalk.gray(result.answer)}`)
      console.log()
    })
  },

  // Afficher le code de rejoindre pour les duels
  joinCode(code) {
    const boxWidth = 25
    const padding = (boxWidth - code.length) / 2
    
    console.log(chalk.bold.cyan('\n╔' + '═'.repeat(boxWidth) + '╗'))
    console.log(chalk.cyan('║') + ' '.repeat(Math.floor(padding)) + chalk.bold.white(code) + ' '.repeat(Math.ceil(padding)) + chalk.cyan('║'))
    console.log(chalk.cyan('║' + ' '.repeat(5) + chalk.gray('Partage ce code !') + ' '.repeat(5) + chalk.cyan('║')))
    console.log(chalk.cyan('╚' + '═'.repeat(boxWidth) + '╝\n'))
  },

  // Afficher le statut d'un duel
  duelStatus(yourScore, opponentScore, opponentName) {
    console.log(chalk.bold(`\nScore : Toi ${yourScore} — ${opponentName} ${opponentScore}\n`))
  },

  // Afficher le résultat d'un duel
  duelResult(winner, yourScore, opponentScore, opponentName, eloChange) {
    if (winner === 'you') {
      console.log(chalk.bold.green(`\n🏆 VICTOIRE ! Tu as battu ${opponentName} ${yourScore}-${opponentScore}\n`))
    } else if (winner === 'opponent') {
      console.log(chalk.bold.red(`\n💔 DÉFAITE. ${opponentName} a gagné ${opponentScore}-${yourScore}\n`))
    } else {
      console.log(chalk.bold.yellow(`\n🤝 MATCH NUL ! ${yourScore}-${opponentScore}\n`))
    }
    
    if (eloChange !== 0) {
      const sign = eloChange >= 0 ? '+' : ''
      const color = eloChange > 0 ? chalk.green : chalk.red
      console.log(color(`ELO : ${sign}${eloChange}\n`))
    }
  },

  // Afficher l'adversaire trouvé
  opponentFound(username, elo) {
    console.log(chalk.green(`\nAdversaire trouvé : ${username} (ELO: ${elo})\n`))
  }
}

// Spinner pour les opérations longues
export function spinner(text) {
  return ora({
    text,
    color: 'cyan',
    spinner: 'dots'
  })
}

// Formater le temps
export function formatTime(seconds) {
  if (seconds < 60) {
    return `${seconds}s`
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}m${remainingSeconds}s`
  } else {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    return `${hours}h${minutes}m`
  }
}

// Créer une barre de progression
export function progressBar(current, total, width = 40) {
  const percentage = Math.round((current / total) * 100)
  const filled = Math.round((width * current) / total)
  const empty = width - filled
  
  const filledBar = '█'.repeat(filled)
  const emptyBar = '░'.repeat(empty)
  
  return `${chalk.cyan(filledBar)}${chalk.gray(emptyBar)} ${percentage}%`
}
