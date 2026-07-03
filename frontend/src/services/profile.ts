import { http } from '@/lib/http'
import type { ProfileBooking, UserProfile } from '@/types'

function unwrap<T>(raw: unknown): T {
  const obj = raw as { data?: T }
  return obj?.data ?? (raw as T)
}

function asArray<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[]
  const obj = raw as { data?: T[]; content?: T[] }
  return obj?.data ?? obj?.content ?? []
}

export const profileApi = {
  async me(): Promise<UserProfile> {
    const res = await http.get('/profile')
    return unwrap<UserProfile>(res.data)
  },
  async update(payload: Partial<UserProfile>): Promise<UserProfile> {
    const res = await http.put('/profile', payload)
    return unwrap<UserProfile>(res.data)
  },
  async changePassword(payload: { oldPassword: string; newPassword: string }) {
    const res = await http.put('/profile/password', payload)
    return res.data
  },
  async bookings(): Promise<ProfileBooking[]> {
    const res = await http.get('/profile/bookings')
    return asArray<ProfileBooking>(res.data)
  },
}
