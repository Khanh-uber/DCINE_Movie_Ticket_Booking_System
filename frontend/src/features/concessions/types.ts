import type { BookingCartMeta, Concession } from '@/types'

/** Menu item as returned by the backend — extends the shared Concession type
 *  with the extra fields the old concessions.js consumed. */
export interface MenuItem extends Concession {
  oldPrice?: number | null
  tag?: string | null
  active?: boolean
}

export interface Totals {
  ticketAmount: number
  combosAmount: number
  grandTotal: number
}

/** Normalized view of the ticket snapshot read from booking_cart. */
export interface TicketInfo {
  bookingId?: number
  showtimeId: number | string
  movieTitle: string
  theaterName: string
  date: string
  time: string
  endTime: string
  seats: string[]
  totalAmount: number
  meta: BookingCartMeta
}

export interface SetQtyPayload {
  item: MenuItem
  variantValue: string
  variantLabel: string
  unitPrice: number
  qty: number
}

export const MAX_QTY = 10

export const CAT_ORDER = ['all', 'combo', 'popcorn', 'beverage', 'hot-food', 'coffee', 'dessert'] as const

export const CAT_LABELS: Record<string, string> = {
  all: 'Tất cả',
  combo: 'Combo',
  popcorn: 'Bắp rang',
  beverage: 'Nước',
  'hot-food': 'Đồ ăn nóng',
  coffee: 'Cà phê',
  dessert: 'Tráng miệng',
}
