import chalk from 'chalk'
import { clearConfig, getConfigValue } from '../lib/config.js'
import { display } from '../lib/display.js'

export async function logout() {
  const username = getConfigValue('username')
  
  if (!username) {
    display.warning('Vous n\'êtes pas connecté')
    return
  }

  clearConfig()
  display.success(`Déconnecté. Au revoir ${username} !`)
}
