import inquirer from 'inquirer'
import chalk from 'chalk'
import { api } from '../lib/api.js'
import { setConfig } from '../lib/config.js'
import { display, spinner } from '../lib/display.js'

export async function login() {
  console.log(chalk.bold.cyan('\n🔐 Connexion à maths-app.fr'))
  console.log(chalk.gray('Génère ta clef sur https://maths-app.fr/dashboard → Paramètres → CLI\n'))

  const { apiKey } = await inquirer.prompt([
    {
      type: 'password',
      name: 'apiKey',
      message: 'Colle ta clef API (mths_...) :',
      validate: (input) => {
        if (!input.trim()) {
          return 'La clef API est requise'
        }
        if (!input.startsWith('mths_')) {
          return 'La clef doit commencer par "mths_"'
        }
        return true
      }
    }
  ])

  const loading = spinner('Vérification de la clef...')
  loading.start()

  try {
    const response = await api.verifyKey()

    loading.stop()

    if (response.valid) {
      // Sauvegarder la configuration
      setConfig('apiKey', apiKey)
      setConfig('username', response.username)
      setConfig('userId', response.userId)
      setConfig('soloElo', response.soloElo)
      setConfig('multiplayerElo', response.multiplayerElo)

      display.success(`Connecté en tant que ${response.username}`)
      console.log(chalk.gray(`ELO solo: ${response.soloElo} | ELO multi: ${response.multiplayerElo}`))
    } else {
      display.error('Clef invalide')
    }
  } catch (error) {
    loading.stop()
    display.error('Erreur lors de la vérification de la clef')
    console.error(error.message)
  }
}
