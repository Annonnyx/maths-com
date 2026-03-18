import Conf from 'conf'

const config = new Conf({
  projectName: 'maths-cli',
  projectVersion: '1.0.0',
  defaults: {
    apiKey: null,
    username: null,
    userId: null,
    soloElo: 400,
    multiplayerElo: 400,
    apiUrl: 'https://maths-app.fr'
  }
})

export function getConfig() {
  return config
}

export function setConfig(key, value) {
  config.set(key, value)
}

export function getConfigValue(key) {
  return config.get(key)
}

export function clearConfig() {
  config.clear()
}

export function isLoggedIn() {
  return !!config.get('apiKey')
}
