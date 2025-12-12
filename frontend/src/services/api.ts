import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add JWT token to requests if it exists
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/**
 * Authentication
 */
export const authAPI = {
  loginWithTON: (address: string, signature: string) =>
    apiClient.post('/auth/ton-login', { address, signature }),

  getCurrentUser: () => apiClient.get('/users/me'),
}

/**
 * Players & Profiles
 */
export const playersAPI = {
  getProfile: (userId: string) => apiClient.get(`/users/${userId}`),
  updateProfile: (userId: string, data: any) =>
    apiClient.put(`/users/${userId}`, data),
  getLeaderboard: () => apiClient.get('/users/leaderboard'),
  getStats: (userId: string) => apiClient.get(`/users/${userId}/stats`),
}

/**
 * Economy / $VITYAZ Token
 */
export const economyAPI = {
  getBalance: () => apiClient.get('/economy/balance'),

  awardReward: (amount: number, reason: string) =>
    apiClient.post('/economy/reward', { amount, reason }),

  getTransactionHistory: () => apiClient.get('/economy/history'),

  transfer: (toAddress: string, amount: number) =>
    apiClient.post('/economy/transfer', { toAddress, amount }),

  stake: (amount: number, period: number) =>
    apiClient.post('/economy/stake', { amount, period }),

  unstake: (stakeId: string) =>
    apiClient.post(`/economy/unstake/${stakeId}`),
}

/**
 * Battles
 */
export const battlesAPI = {
  startBattle: (difficulty: string) =>
    apiClient.post('/battles/start', { difficulty }),

  endBattle: (battleId: string, score: number, kills: number) =>
    apiClient.post(`/battles/${battleId}/end`, { score, kills }),

  getBattleHistory: () => apiClient.get('/battles/history'),

  recordKill: (battleId: string, targetId: string, weapon: string) =>
    apiClient.post(`/battles/${battleId}/kill`, { targetId, weapon }),
}

/**
 * NFT & Marketplace
 */
export const nftAPI = {
  getInventory: () => apiClient.get('/nft/inventory'),

  mintNFT: (type: string, metadata: any) =>
    apiClient.post('/nft/mint', { type, metadata }),

  listNFT: (nftId: string, price: number) =>
    apiClient.post(`/nft/${nftId}/list`, { price }),

  buyNFT: (listingId: string) => apiClient.post(`/nft/buy/${listingId}`),

  getMarketplace: () => apiClient.get('/nft/marketplace'),
}

/**
 * Tournaments
 */
export const tournamentsAPI = {
  getActive: () => apiClient.get('/tournaments'),

  join: (tournamentId: string) =>
    apiClient.post(`/tournaments/${tournamentId}/join`),

  getParticipants: (tournamentId: string) =>
    apiClient.get(`/tournaments/${tournamentId}/participants`),

  submitScore: (tournamentId: string, score: number) =>
    apiClient.post(`/tournaments/${tournamentId}/score`, { score }),
}

/**
 * Health check
 */
export const systemAPI = {
  health: () => apiClient.get('/health').catch(() => ({ status: 'offline' })),
}

export default apiClient
