import { http } from '@/lib/http'
import type { BookingCart, Concession, ConcessionsCart, OrderSummary, TicketType } from '@/types'

function unwrap<T>(raw: unknown): T {
  const obj = raw as { data?: T }
  return obj?.data ?? (raw as T)
}

function asArray<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[]
  const obj = raw as { data?: T[]; content?: T[] }
  return obj?.data ?? obj?.content ?? []
}

export const bookingApi = {
  async create(showtimeId: string | number, seats: { code: string; type: TicketType }[]): Promise<BookingCart> {
    const res = await http.post('/bookings', { showtimeId, seats })
    return unwrap<BookingCart>(res.data)
  },
}

export const concessionsApi = {
  async menu(): Promise<Concession[]> {
    const res = await http.get('/concessions')
    return asArray<Concession>(res.data)
  },
  async summary(): Promise<ConcessionsCart> {
    const res = await http.get('/concessions/summary')
    return unwrap<ConcessionsCart>(res.data)
  },
  async updateCart(items: { comboId: string | number; variant?: string; qty: number }[]): Promise<ConcessionsCart> {
    const res = await http.post('/concessions/cart', { items })
    return unwrap<ConcessionsCart>(res.data)
  },
}

export const checkoutApi = {
  async summary(): Promise<OrderSummary> {
    const res = await http.get('/checkout/summary')
    return unwrap<OrderSummary>(res.data)
  },
  async applyVoucher(code: string, order: OrderSummary): Promise<OrderSummary> {
    const res = await http.post('/checkout/apply-voucher', { code, order })
    return unwrap<OrderSummary>(res.data)
  },
  async lastConfirmed(): Promise<OrderSummary> {
    const res = await http.get('/checkout/last-confirmed')
    return unwrap<OrderSummary>(res.data)
  },
  async createPaymentUrl(bookingId: number): Promise<string> {
    const res = await http.post(`/payment/create-url/${bookingId}`)
    const data = unwrap<{ url?: string; paymentUrl?: string; redirectUrl?: string }>(res.data)
    return data.url ?? data.paymentUrl ?? data.redirectUrl ?? ''
  },
}
