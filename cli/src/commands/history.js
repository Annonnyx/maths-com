import chalk from 'chalk'
import { api } from '../lib/api.js'
import { display, formatTime } from '../lib/display.js'
import { spinner } from '../lib/display.js'

export async function history(options) {
  const limit = parseInt(options.number) || 5

  const loading = spinner('Récupération de l\'historique...')
  loading.start()

  try {
    const response = await api.getSoloHistory(limit, 0)
    
    loading.stop()

    if (response.tests.length === 0) {
      display.info('Aucune partie solo trouvée')
      return
    }

    display.header(`Historique des ${response.tests.length} dernières parties`)

    response.tests.forEach((test, index) => {
      const date = new Date(test.completedAt).toLocaleDateString('fr-FR')
      const score = test.correctAnswers / test.totalQuestions
      const scoreColor = score >= 0.7 ? chalk.green : score >= 0.5 ? chalk.yellow : chalk.red
      const eloColor = test.eloChange >= 0 ? chalk.green : chalk.red
      const eloSign = test.eloChange >= 0 ? '+' : ''

      console.log(`${chalk.bold(index + 1)}. ${date}`)
      console.log(`   Score : ${scoreColor(`${test.correctAnswers}/${test.totalQuestions} (${Math.round(score * 100)}%)`)}`)
      console.log(`   ELO : ${eloColor(`${test.eloBefore} → ${test.eloAfter} (${eloSign}${test.eloChange})`)}`)
      console.log(`   Temps : ${chalk.gray(formatTime(test.timeTaken))}`)
      
      if (test.isPerfect) {
        console.log(`   ${chalk.yellow('⭐')} ${chalk.yellow('Partie parfaite !')}`)
      }
      
      console.log()
    })

    if (response.pagination.hasMore) {
      console.log(chalk.gray(`... et ${response.total - limit} autres parties`))
    }
  } catch (error) {
    loading.stop()
    display.error('Erreur lors de la récupération de l\'historique')
    console.error(error.message)
  }
}
