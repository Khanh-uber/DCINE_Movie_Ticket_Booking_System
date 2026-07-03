import { http } from '@/lib/http'
import type { CinemaLocation, Province, SeatMapData, ShowtimeDetail, ShowtimeSlot, Theater } from '@/types'

function asArray<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[]
  const obj = raw as { data?: T[]; content?: T[] }
  return obj?.data ?? obj?.content ?? []
}

function unwrap<T>(raw: unknown): T {
  const obj = raw as { data?: T }
  return obj?.data ?? (raw as T)
}

export const catalogApi = {
  async provinces(): Promise<Province[]> {
    const res = await http.get('/provinces')
    return asArray<Province>(res.data)
  },
  async locations(): Promise<CinemaLocation[]> {
    const res = await http.get('/locations')
    return asArray<CinemaLocation>(res.data)
  },
  async theaters(): Promise<Theater[]> {
    const res = await http.get('/theaters')
    return asArray<Theater>(res.data)
  },
}

export const showtimesApi = {
  async search(params: { movie?: string | number; province?: string | number }): Promise<ShowtimeSlot[]> {
    const res = await http.get('/showtimes', { params })
    return asArray<ShowtimeSlot>(res.data)
  },
  async byId(id: string | number): Promise<ShowtimeDetail> {
    const res = await http.get(`/showtimes/${id}`)
    return unwrap<ShowtimeDetail>(res.data)
  },
  async seats(id: string | number): Promise<SeatMapData> {
    const res = await http.get(`/showtimes/${id}/seats`)
    return unwrap<SeatMapData>(res.data)
  },
  async holdSeats(id: string | number, seats: string[], action: 'hold' | 'release') {
    const res = await http.post(`/showtimes/${id}/holds`, { seats, action })
    return res.data
  },
  async pricingPreview(id: string | number, seats: { code: string; type: string }[]) {
    const res = await http.post(`/showtimes/${id}/pricing-preview`, { seats })
    return unwrap<{ items: { code: string; zone?: string; type: string; price: number }[]; totalAmount: number }>(res.data)
  },
}
