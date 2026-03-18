import inquirer from 'inquirer'
import chalk from 'chalk'
import { api } from '../lib/api.js'
import { display, spinner } from '../lib/display.js'

export async function duel(action, options = {}) {
  try {
    if (action === 'create') {
      await createDuel(options)
    } else if (action === 'join') {
      await joinDuel(options.code)
    }
  } catch (error) {
    display.error('Erreur lors du duel')
    console.error(error.message)
  }
}

async function createDuel(options) {
  // Configuration interactive si non fournie
  let config = { ...options }

  if (!config.difficulty || !config.time || !config.questions) {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'difficulty',
        message: 'Difficulté ?',
        choices: [
          { name: 'Facile', value: 'easy' },
          { name: 'Moyen', value: 'medium' },
          { name: 'Difficile', value: 'hard' },
          { name: 'Mixte', value: 'mixed' }
        ],
        default: 'mixed'
      },
      {
        type: 'list',
        name: 'time',
        message: 'Contrôle du temps ?',
        choices: [
          { name: 'Bullet (1min)', value: 'bullet' },
          { name: 'Blitz (3min)', value: 'blitz' },
          { name: 'Rapid (5min)', value: 'rapid' }
        ],
        default: 'blitz'
      },
      {
        type: 'list',
        name: 'questions',
        message: 'Nombre de questions ?',
        choices: [
          { name: '10 questions', value: 10 },
          { name: '20 questions', value: 20 }
        ],
        default: 10
      }
    ])

    config = { ...config, ...answers }
  }

  // Créer le duel
  const loading = spinner('Création du duel...')
  loading.start()

  const response = await api.createDuel(config)
  loading.stop()

  const { gameId, joinCode, timeLimit } = response

  display.header('Duel créé')
  display.joinCode(joinCode)
  console.log(chalk.gray(`En attente d'un adversaire...\n`))

  // Polling pour attendre un adversaire
  await waitForOpponent(gameId)
}

async function joinDuel(joinCode) {
  if (!joinCode) {
    const { code } = await inquirer.prompt([
      {
        type: 'input',
        name: 'code',
        message: 'Code du duel :',
        validate: (input) => {
          if (!input.trim()) {
            return 'Le code est requis'
          }
          return true
        }
      }
    ])
    joinCode = code.trim().toUpperCase()
  }

  const loading = spinner('Recherche du duel...')
  loading.start()

  try {
    const response = await api.joinDuel(joinCode)
    loading.stop()

    const { gameId, opponent, firstQuestion } = response

    display.opponentFound(opponent.username, opponent.multiplayerElo)
    
    // Commencer le flux de questions
    await playDuel(gameId, firstQuestion)
  } catch (error) {
    loading.stop()
    throw error
  }
}

async function waitForOpponent(gameId) {
  const loading = spinner('En attente d\'un adversaire...')
  
  while (true) {
    try {
      const status = await api.getDuelStatus(gameId)
      
      if (status.status === 'playing') {
        loading.stop()
        display.success('Adversaire trouvé !')
        
        // Récupérer la première question
        // Pour simplifier, on va commencer avec une question par défaut
        await playDuel(gameId, null)
        break
      } else if (status.status === 'waiting') {
        // Continuer d'attendre
        await new Promise(resolve => setTimeout(resolve, 2000))
      } else {
        loading.stop()
        display.error('Le duel a été annulé')
        break
      }
    } catch (error) {
      loading.stop()
      throw error
    }
  }
}

async function playDuel(gameId, firstQuestion) {
  let currentQuestionIndex = 0
  let totalQuestions = 10 // Par défaut

  while (currentQuestionIndex < totalQuestions) {
    try {
      // Récupérer le statut actuel
      const status = await api.getDuelStatus(gameId)
      
      if (status.status === 'finished') {
        await showDuelResult(gameId)
        break
      }

      // Afficher la question actuelle
      let question
      if (currentQuestionIndex === 0 && firstQuestion) {
        question = firstQuestion
      } else {
        // Pour simplifier, on utilise une question générique
        question = {
          id: `q${currentQuestionIndex}`,
          question: `Question ${currentQuestionIndex + 1}`,
          timeLimit: 30
        }
      }

      display.question(currentQuestionIndex + 1, totalQuestions, question.question)

      const { answer } = await inquirer.prompt([
        {
          type: 'input',
          name: 'answer',
          message: 'Ta réponse :',
          validate: (input) => {
            if (!input.trim()) {
              return 'Une réponse est requise'
            }
            return true
          }
        }
      ])

      // Envoyer la réponse
      const response = await api.answerDuel(gameId, {
        questionIndex: currentQuestionIndex,
        answer: answer.trim(),
        timeTaken: 5 // Temps simulé
      })

      // Afficher le résultat immédiat
      const resultText = response.isCorrect ? 
        chalk.green('✓ Correct !') : 
        chalk.red(`✗ Raté (réponse : ${response.correctAnswer})`)

      console.log(`${resultText} | Score : Toi ${response.yourScore} — Adversaire ${response.opponentScore}\n`)

      currentQuestionIndex++

      // Vérifier s'il y a une prochaine question
      if (response.nextQuestion === null) {
        // La partie est terminée
        await showDuelResult(gameId)
        break
      }

    } catch (error) {
      display.error('Erreur lors de la question')
      console.error(error.message)
      break
    }
  }
}

async function showDuelResult(gameId) {
  const loading = spinner('Récupération des résultats...')
  loading.start()

  try {
    const status = await api.getDuelStatus(gameId)
    loading.stop()

    display.header('Résultat du duel')

    let winnerText
    if (status.winner === 'you') {
      winnerText = chalk.bold.green('🏆 VICTOIRE !')
    } else if (status.winner === 'opponent') {
      winnerText = chalk.bold.red('💔 DÉFAITE')
    } else {
      winnerText = chalk.bold.yellow('🤝 MATCH NUL')
    }

    console.log(`${winnerText}`)
    console.log(`Score final : Toi ${status.yourScore} — Adversaire ${status.opponentScore}\n`)

  } catch (error) {
    loading.stop()
    throw error
  }
}
