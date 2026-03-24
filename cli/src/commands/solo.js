import inquirer from 'inquirer'
import chalk from 'chalk'
import { api } from '../lib/api.js'
import { display, spinner, formatTime } from '../lib/display.js'

export async function solo(options) {
  let loading = null
  try {
    // Configuration interactive si non fournie
    let config = { ...options }

    if (!config.difficulty || !config.questions || !config.type) {
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
          name: 'questions',
          message: 'Nombre de questions ?',
          choices: [
            { name: '10 questions', value: 10 },
            { name: '20 questions', value: 20 }
          ],
          default: 10
        },
        {
          type: 'list',
          name: 'type',
          message: 'Type de jeu ?',
          choices: [
            { name: 'Casual (30s/question)', value: 'casual' },
            { name: 'Training (60s/question)', value: 'training' }
          ],
          default: 'casual'
        }
      ])

      config = { ...config, ...answers }
    }

    // Démarrer la partie
    loading = spinner('Chargement des questions...')
    loading.start()

    const response = await api.startSolo(config)
    loading.stop()

    const { testId, questions, timeLimit } = response

    display.header(`Partie solo - ${config.difficulty}`)
    console.log(chalk.gray(`${questions.length} questions - ${formatTime(timeLimit)} total\n`))

    // Collecter les réponses
    const answers = []
    const startTime = Date.now()

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i]
      const questionStartTime = Date.now()

      display.question(i + 1, questions.length, question.question)

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

      const timeTaken = Math.round((Date.now() - questionStartTime) / 1000)

      answers.push({
        questionId: question.id,
        answer: answer.trim(),
        correctAnswer: question.answer,
        timeTaken,
        type: question.type,
        difficulty: question.difficulty,
        question: question.question,
        order: i
      })

      // Afficher une confirmation rapide
      console.log(chalk.gray(`Réponse enregistrée (${formatTime(timeTaken)})\n`))
    }

    const totalTime = Math.round((Date.now() - startTime) / 1000)

    // Envoyer les résultats
    loading.start('Calcul des résultats...')
    
    const result = await api.completeSolo(testId, {
      answers,
      timeTaken: totalTime
    })

    loading.stop()

    // Afficher les résultats
    display.header('Résultats')
    display.score(result.correctAnswers, result.totalQuestions, result.timeTaken)
    display.eloChange(result.eloBefore, result.eloAfter)

    if (result.isPerfect) {
      console.log(chalk.bold.yellow('⭐ PARTIE PARFAITE ! ⭐\n'))
    }

    // Tableau détaillé
    const detailedResults = answers.map((answer, index) => ({
      ...answer,
      isCorrect: result.questions[index]?.isCorrect || false
    }))

    display.resultsTable(detailedResults)

    console.log(chalk.bold('\n🎯 Partie terminée !'))
    console.log(chalk.gray(`Utilise \`maths history\` pour voir ton historique\n`))

  } catch (error) {
    if (loading) loading.stop()
    display.error('Erreur lors de la partie solo')
    console.error(error.message)
  }
}
