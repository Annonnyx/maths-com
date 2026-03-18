import chalk from 'chalk'
import { getConfigValue, isLoggedIn } from '../lib/config.js'
import { display } from '../lib/display.js'

export async function whoami() {
  if (!isLoggedIn()) {
    display.info('Non connecté. Lance maths login')
    return
  }

  const username = getConfigValue('username')
  const soloElo = getConfigValue('soloElo')
  const multiplayerElo = getConfigValue('multiplayerElo')

  display.header('Informations utilisateur')
  console.log(chalk.bold(`Utilisateur : ${username}`))
  console.log(chalk.cyan(`ELO solo : ${soloElo}`))
  console.log(chalk.magenta(`ELO multi : ${multiplayerElo}`))
  console.log(chalk.gray(`API : ${getConfigValue('apiUrl')}`))
}
