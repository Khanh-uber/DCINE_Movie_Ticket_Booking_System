import { http } from '@/lib/http'
import type { SessionUser } from '@/features/auth/auth-store'

interface LoginResponse {
  accessToken: string
  user: Partial<SessionUser>
}

/** Backend wraps payloads inconsistently ({data:{...}} or flat) — normalize here. */
function unwrap<T>(raw: unknown): T {
  const obj = raw as Record<string, unknown>
  return (obj?.data ?? obj) as T
}

export const authApi = {
  async login(payload: { emailOrPhone: string; password: string }): Promise<LoginResponse> {
    const res = await http.post('/auth/login', payload)
    const data = unwrap<Record<string, unknown>>(res.data)
    const user = (data.user ?? data) as Partial<SessionUser>
    return { accessToken: String(data.accessToken ?? ''), user }
  },

  async register(payload: {
    fullName: string
    username: string
    email?: string
    phone?: string
    password: string
    confirmPassword: string
  }) {
    const res = await http.post('/auth/register', payload)
    return res.data
  },

  async session() {
    const res = await http.get('/auth/session')
    return unwrap<Record<string, unknown>>(res.data)
  },

  async logout() {
    await http.get('/auth/logout')
  },

  async sendOtp(payload: { channelType: 'email' | 'phone'; identifier: string }): Promise<string> {
    const res = await http.post('/auth/forgot/send-otp', payload)
    const data = unwrap<Record<string, unknown>>(res.data)
    return String(data.requestId ?? data.recoveryToken ?? data.token ?? '')
  },

  async verifyOtp(payload: { requestId: string; code: string }) {
    const res = await http.post('/auth/forgot/verify-otp', payload)
    return res.data
  },

  async resetPassword(payload: { requestId: string; newPassword: string; confirmPassword: string }) {
    const res = await http.post('/auth/forgot/reset', payload)
    return res.data
  },
}
