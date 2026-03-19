import fetch from 'node-fetch'
import { getConfigValue, isLoggedIn } from './config.js'
import chalk from 'chalk'

const API_TIMEOUT = 10000 // 10 secondes

class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function apiRequest(endpoint, options = {}) {
  const config = getConfigValue('apiUrl')
  const apiKey = getConfigValue('apiKey')

  if (!apiKey && !options.skipAuth) {
    console.error(chalk.red('❌ Vous devez d\'abord vous connecter : maths login'))
    console.error(chalk.gray('🔍 Clé API trouvée:', apiKey ? 'OUI' : 'NON'))
    process.exit(1)
  }

  const url = `${config}/api/cli${endpoint}`
  
  const headers = {
    'Content-Type': 'application/json',
    'User-Agent': 'maths-cli/1.0.0',
    ...options.headers
  }

  if (apiKey && !options.skipAuth) {
    headers.Authorization = `Bearer ${apiKey}`
  }

  try {
    const response = await fetch(url, {
      method: options.method || 'GET',
      timeout: API_TIMEOUT,
      ...options,
      headers
    })

    const responseText = await response.text()
    
    let data
    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.error(chalk.red('❌ Erreur parsing JSON:', parseError.message))
      console.error(chalk.red('Réponse:', responseText))
      throw new Error('Réponse invalide du serveur')
    }

    if (!response.ok) {
      if (response.status === 401) {
        console.error(chalk.red('❌ Clef invalide ou expirée. Relancez maths login'))
        process.exit(1)
      }
      throw new ApiError(data.error || `Erreur HTTP ${response.status}`, response.status)
    }

    return data
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error(chalk.red('❌ Timeout : la requête a pris trop de temps'))
      process.exit(1)
    }
    
    if (error instanceof ApiError) {
      throw error
    }

    console.error(chalk.red('❌ Erreur réseau :', error.message))
    process.exit(1)
  }
}

// Méthodes spécifiques pour chaque endpoint
export const api = {
  // Authentification
  async verifyKey() {
    return apiRequest('/auth/verify', { 
      method: 'POST',
      body: JSON.stringify({})
    })
  },

  // Solo
  async startSolo(options) {
    return apiRequest('/solo/start', {
      method: 'POST',
      body: JSON.stringify(options)
    })
  },

  async completeSolo(testId, answers) {
    return apiRequest(`/solo/complete/${testId}`, {
      method: 'POST',
      body: JSON.stringify(answers)
    })
  },

  async getSoloHistory(limit = 5, offset = 0) {
    return apiRequest(`/solo/history?limit=${limit}&offset=${offset}`)
  },

  // Duel
  async createDuel(options) {
    return apiRequest('/duel/create', {
      method: 'POST',
      body: JSON.stringify(options)
    })
  },

  async joinDuel(joinCode) {
    return apiRequest('/duel/join', {
      method: 'POST',
      body: JSON.stringify({ joinCode })
    })
  },

  async answerDuel(gameId, answer) {
    return apiRequest(`/duel/${gameId}/answer`, {
      method: 'POST',
      body: JSON.stringify(answer)
    })
  },

  async getDuelStatus(gameId) {
    return apiRequest(`/duel/${gameId}/status`)
  }
}
