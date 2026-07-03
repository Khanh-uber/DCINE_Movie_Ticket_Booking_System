import type { SeatZone, ShowtimeDetail, TicketType } from '@/types'

/**
 * Bảng giá fallback mỗi ghế (vé người lớn) khi BE không trả pricing.
 * Trẻ em = người lớn × 0.8. Ghế đôi tính giá theo TỪNG ghế (cặp = 2 ghế).
 */
export const FALLBACK_SEAT_PRICE: Record<SeatZone, number> = {
  standard: 75_000,
  vip: 95_000,
  couple: 85_000,
}

const CHILD_FACTOR = 0.8

/** Phân vùng fallback theo hàng: A–C là VIP, J là Couple, còn lại Standard. */
export function zoneOf(row: string): SeatZone {
  if (row === 'A' || row === 'B' || row === 'C') return 'vip'
  if (row === 'J') return 'couple'
  return 'standard'
}

export function normalizeZone(zone: string | undefined, row: string): SeatZone {
  if (zone === 'vip' || zone === 'standard' || zone === 'couple') return zone
  return zoneOf(row)
}

export type PricingTable = NonNullable<ShowtimeDetail['pricing']>

/** Giá hiển thị: ưu tiên giá BE (`pricing.byZone`), fallback bảng giá cứng. */
export function getDisplayPrice(zone: SeatZone, type: TicketType, pricing?: PricingTable | null): number {
  const value = pricing?.byZone?.[zone]?.[type]
  if (typeof value === 'number') return value
  const base = FALLBACK_SEAT_PRICE[zone]
  return type === 'child' ? base * CHILD_FACTOR : base
}

export function rowOf(code: string): string {
  return code.charAt(0)
}

export function colOf(code: string): number {
  return Number(code.slice(1))
}

/** Ghế đôi ghép theo cặp: cột lẻ đi với cột chẵn kế tiếp. */
export function couplePairCode(code: string): string {
  const row = rowOf(code)
  const col = colOf(code)
  return col % 2 !== 0 ? `${row}${col + 1}` : `${row}${col - 1}`
}

export function couplePairLabel(code: string): string {
  const row = rowOf(code)
  const col = colOf(code)
  const left = col % 2 === 0 ? col - 1 : col
  return `${row}${left}-${row}${left + 1}`
}
