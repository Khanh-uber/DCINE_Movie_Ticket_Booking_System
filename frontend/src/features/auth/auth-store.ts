import { useSyncExternalStore } from 'react'
import { STORAGE_KEYS } from '@/lib/storage'

export interface SessionUser {
  fullName: string
  username: string
  avatarUrl: string
  loyaltyPoints: number
  totalSpending: number
  membershipTierName: string
}

const AUTH_KEYS = [
  STORAGE_KEYS.accessToken,
  STORAGE_KEYS.fullName,
  STORAGE_KEYS.username,
  STORAGE_KEYS.avatarUrl,
  STORAGE_KEYS.loyaltyPoints,
  STORAGE_KEYS.totalSpending,
  STORAGE_KEYS.membershipTierName,
]

const listeners = new Set<() => void>()
let snapshot = readSnapshot()

function readSnapshot(): { token: string | null; user: SessionUser | null } {
  const token = localStorage.getItem(STORAGE_KEYS.accessToken)
  if (!token) return { token: null, user: null }
  return {
    token,
    user: {
      fullName: localStorage.getItem(STORAGE_KEYS.fullName) ?? '',
      username: localStorage.getItem(STORAGE_KEYS.username) ?? '',
      avatarUrl: localStorage.getItem(STORAGE_KEYS.avatarUrl) ?? '',
      loyaltyPoints: Number(localStorage.getItem(STORAGE_KEYS.loyaltyPoints) ?? 0),
      totalSpending: Number(localStorage.getItem(STORAGE_KEYS.totalSpending) ?? 0),
      membershipTierName: localStorage.getItem(STORAGE_KEYS.membershipTierName) ?? 'Standard',
    },
  }
}

function emit() {
  snapshot = readSnapshot()
  listeners.forEach((l) => l())
}

export const authStore = {
  subscribe(listener: () => void): () => void {
    listeners.add(listener)
    return () => listeners.delete(listener)
  },
  getSnapshot() {
    return snapshot
  },
  setSession(token: string, user: Partial<SessionUser>) {
    localStorage.setItem(STORAGE_KEYS.accessToken, token)
    if (user.fullName != null) localStorage.setItem(STORAGE_KEYS.fullName, user.fullName)
    if (user.username != null) localStorage.setItem(STORAGE_KEYS.username, user.username)
    if (user.avatarUrl != null) localStorage.setItem(STORAGE_KEYS.avatarUrl, user.avatarUrl)
    if (user.loyaltyPoints != null) localStorage.setItem(STORAGE_KEYS.loyaltyPoints, String(user.loyaltyPoints))
    if (user.totalSpending != null) localStorage.setItem(STORAGE_KEYS.totalSpending, String(user.totalSpending))
    if (user.membershipTierName != null) localStorage.setItem(STORAGE_KEYS.membershipTierName, user.membershipTierName)
    emit()
  },
  updateUser(user: Partial<SessionUser>) {
    const token = localStorage.getItem(STORAGE_KEYS.accessToken)
    if (token) this.setSession(token, user)
  },
  clearSession() {
    AUTH_KEYS.forEach((key) => localStorage.removeItem(key))
    emit()
  },
}

// Other tabs / legacy code can change localStorage too.
window.addEventListener('storage', emit)

export function useAuth() {
  const { token, user } = useSyncExternalStore(authStore.subscribe, authStore.getSnapshot)
  return { isAuthenticated: !!token, token, user }
}
