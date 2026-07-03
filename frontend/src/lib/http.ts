import axios, { AxiosError } from 'axios'
import { env } from '@/config/env'
import { STORAGE_KEYS } from '@/lib/storage'

/**
 * Shared API client. The backend uses BOTH a session cookie
 * (withCredentials) and a Bearer token — frontend_2 sent both, so keep both.
 */
export const http = axios.create({
  baseURL: env.apiBaseUrl,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

http.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.accessToken)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

http.interceptors.response.use(
  (res) => res,
  (error: AxiosError) => {
    const status = error.response?.status
    const url = error.config?.url ?? ''
    if (status === 401 && !url.includes('/auth/')) {
      window.dispatchEvent(new CustomEvent('dcine:unauthorized'))
    }
    return Promise.reject(error)
  },
)

export function getApiErrorMessage(error: unknown, fallback = 'Đã có lỗi xảy ra, vui lòng thử lại.'): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; error?: string } | undefined
    return data?.message ?? data?.error ?? fallback
  }
  return fallback
}
