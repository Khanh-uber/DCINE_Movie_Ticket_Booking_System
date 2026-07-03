/**
 * Checkout order helpers — port of the order reconstruction logic from
 * frontend_2/assets/js/payment.js. The old snapshots were written by several
 * page generations, so field access stays deliberately liberal.
 */

import { STORAGE_KEYS, readJson } from '@/lib/storage'
import type { BookingCart, ConcessionsCart, OrderSummary, Promotion } from '@/types'

type LooseRecord = Record<string, unknown>

export interface CheckoutComboLine {
  title: string
  qty: number
  amount: number
}

export interface CheckoutOrder {
  bookingId: number | null
  movieTitle: string
  theaterName: string
  showDate: string
  showTime: string
  seats: string[]
  combos: CheckoutComboLine[]
  ticketAmount: number
  combosAmount: number
  discountAmount: number
  discountCode: string
}

export interface CheckoutTotals {
  ticketAmount: number
  combosAmount: number
  discountAmount: number
  subTotal: number
  grandTotal: number
}

function asRecord(value: unknown): LooseRecord {
  return value && typeof value === 'object' ? (value as LooseRecord) : {}
}

function normalizeText(value: unknown): string {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
}

function toNumber(value: unknown): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function firstText(...values: unknown[]): string {
  for (const value of values) {
    const text = normalizeText(value)
    if (text) return text
  }
  return ''
}

export function toPositiveInteger(value: unknown): number | null {
  if (typeof value === 'number' && Number.isInteger(value) && value > 0) return value
  const text = String(value ?? '').trim()
  if (!/^\d+$/.test(text)) return null
  const parsed = Number.parseInt(text, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

export function firstPositiveInteger(values: unknown[]): number | null {
  for (const value of values) {
    const parsed = toPositiveInteger(value)
    if (parsed) return parsed
  }
  return null
}

function pickText(sources: LooseRecord[], keys: string[]): string {
  for (const source of sources) {
    for (const key of keys) {
      const text = normalizeText(source[key])
      if (text) return text
    }
  }
  return ''
}

export function seatCode(value: unknown): string {
  if (typeof value === 'string') return normalizeText(value)
  const record = asRecord(value)
  return normalizeText(record.code ?? record.seatCode ?? record.label ?? record.id)
}

function extractSeats(sources: LooseRecord[]): string[] {
  for (const source of sources) {
    for (const key of ['selectedSeats', 'seats', 'items']) {
      const raw = source[key]
      if (Array.isArray(raw)) {
        const seats = raw.map(seatCode).filter(Boolean)
        if (seats.length) {
          return [...seats].sort((a, b) => a.localeCompare(b, 'en', { numeric: true }))
        }
      }
    }
  }
  return []
}

export function comboLine(value: unknown): CheckoutComboLine {
  const combo = asRecord(value)
  const qty = toNumber(combo.qty ?? combo.quantity ?? 1) || 1
  const unitPrice = toNumber(combo.unitPrice ?? combo.price)
  const lineTotal = toNumber(combo.lineTotal ?? combo.totalPrice ?? combo.total)
  return {
    title: firstText(combo.title, combo.name) || 'Combo',
    qty,
    amount: lineTotal > 0 ? lineTotal : unitPrice * qty,
  }
}

/**
 * Rebuild the order from the local booking + concessions snapshots
 * (mirror of buildLocalOrderFromSnapshot in the old payment.js).
 */
export function buildLocalOrder(): CheckoutOrder {
  const booking = asRecord(readJson<BookingCart>(STORAGE_KEYS.bookingCart))
  const concessions = asRecord(readJson<ConcessionsCart>(STORAGE_KEYS.concessionsCart))

  const bookingMeta = asRecord(booking.meta)
  const bookingTicket = asRecord(booking.ticket)
  const concessionMeta = asRecord(concessions.meta)
  const concessionTicket = asRecord(concessions.ticket)

  const textSources = [bookingTicket, booking, bookingMeta, concessions, concessionTicket, concessionMeta]

  const movieTitle = pickText(textSources, ['movieTitle', 'movieName', 'title']) || 'Phim chưa xác định'
  const theaterName = pickText(textSources, ['cinemaName', 'theaterName', 'cinema', 'theater'])
  const showDate = pickText(textSources, ['showDate', 'date', 'ngayChieu'])
  const showTime = pickText(textSources, ['showTime', 'time', 'gioChieu', 'showtimeText'])

  const seats = extractSeats([booking, bookingTicket, concessionTicket, concessions])

  const comboSource = Array.isArray(concessions.combos)
    ? concessions.combos
    : Array.isArray(concessions.items)
      ? concessions.items
      : Array.isArray(booking.combos)
        ? booking.combos
        : Array.isArray(booking.itemsCombos)
          ? booking.itemsCombos
          : []
  const combos = comboSource.filter(Boolean).map(comboLine)

  const concessionTotals = asRecord(concessions.totals)
  const bookingTotals = asRecord(booking.totals)
  const seatItems = Array.isArray(booking.items) ? booking.items : []

  const ticketAmount =
    toNumber(
      booking.ticketAmount ??
        booking.totalAmount ??
        bookingTicket.totalAmount ??
        concessionTicket.totalAmount ??
        concessionTotals.ticketAmount,
    ) || seatItems.reduce((sum, item) => sum + toNumber(asRecord(item).price), 0)

  const combosAmount =
    combos.reduce((sum, line) => sum + line.amount, 0) || toNumber(concessionTotals.combosAmount)

  const discountAmount = toNumber(
    concessions.discountAmount ??
      concessionTotals.discountAmount ??
      booking.discountAmount ??
      bookingTotals.discountAmount,
  )
  const discountCode = firstText(
    concessions.discountCode,
    concessionTotals.discountCode,
    asRecord(concessions._voucher).code,
    booking.discountCode,
    bookingTotals.discountCode,
  )

  const bookingId = firstPositiveInteger([
    booking.bookingId,
    booking.id,
    bookingMeta.bookingId,
    bookingTicket.bookingId,
    concessions.bookingId,
    concessions.id,
    concessionMeta.bookingId,
    concessionTicket.bookingId,
  ])

  return {
    bookingId,
    movieTitle,
    theaterName,
    showDate,
    showTime,
    seats,
    combos,
    ticketAmount,
    combosAmount,
    discountAmount,
    discountCode,
  }
}

export function computeTotals(order: CheckoutOrder): CheckoutTotals {
  const ticketAmount = Math.max(0, order.ticketAmount)
  const combosAmount = Math.max(0, order.combosAmount)
  const subTotal = ticketAmount + combosAmount
  const discountAmount = Math.min(subTotal, Math.max(0, order.discountAmount))
  return {
    ticketAmount,
    combosAmount,
    discountAmount,
    subTotal,
    grandTotal: Math.max(0, subTotal - discountAmount),
  }
}

/** Overlay a backend OrderSummary on top of the local snapshot order. */
export function mergeSummary(local: CheckoutOrder, summary: OrderSummary | null | undefined): CheckoutOrder {
  if (!summary || typeof summary !== 'object') return local

  const raw = asRecord(summary)
  const ticket = asRecord(raw.ticket)
  const totals = asRecord(raw.totals)

  const combos =
    Array.isArray(raw.combos) && raw.combos.length ? raw.combos.filter(Boolean).map(comboLine) : local.combos
  const seatsRaw = ticket.seats
  const seats =
    Array.isArray(seatsRaw) && seatsRaw.length ? seatsRaw.map(seatCode).filter(Boolean) : local.seats

  const ticketAmount = toNumber(totals.ticketAmount ?? ticket.amount) || local.ticketAmount
  const combosAmount =
    combos.reduce((sum, line) => sum + line.amount, 0) || toNumber(totals.combosAmount) || local.combosAmount
  const hasDiscount = totals.discount != null || totals.discountAmount != null
  const discountAmount = hasDiscount ? toNumber(totals.discount ?? totals.discountAmount) : local.discountAmount
  const discountCode = firstText(raw.voucherCode, totals.discountCode) || (hasDiscount ? '' : local.discountCode)

  return {
    bookingId: firstPositiveInteger([raw.bookingId, local.bookingId]),
    movieTitle: firstText(ticket.movieTitle, raw.movieTitle) || local.movieTitle,
    theaterName: firstText(ticket.theaterName, ticket.cinemaName, raw.theaterName) || local.theaterName,
    showDate: firstText(ticket.date, ticket.showDate, raw.showDate) || local.showDate,
    showTime: firstText(ticket.time, ticket.showTime, raw.showTime) || local.showTime,
    seats,
    combos,
    ticketAmount,
    combosAmount,
    discountAmount,
    discountCode,
  }
}

/** Convert the internal order shape back to the API's OrderSummary payload. */
export function toOrderSummary(order: CheckoutOrder): OrderSummary {
  const totals = computeTotals(order)
  return {
    bookingId: order.bookingId ?? undefined,
    ticket: {
      movieTitle: order.movieTitle,
      theaterName: order.theaterName,
      date: order.showDate,
      time: order.showTime,
      seats: order.seats,
      amount: order.ticketAmount,
    },
    totals: {
      ticketAmount: totals.ticketAmount,
      combosAmount: totals.combosAmount,
      discount: totals.discountAmount,
      grandTotal: totals.grandTotal,
    },
    voucherCode: order.discountCode || undefined,
  }
}

/** Local voucher math (fallback when checkout/apply-voucher is unavailable). */
export function computeLocalDiscount(promo: Promotion, subTotal: number): number {
  const raw = asRecord(promo)
  const value = toNumber(raw.discountValue ?? raw.value)
  const amount = promo.discountType === 'percent' ? Math.round((subTotal * value) / 100) : value
  return Math.max(0, Math.min(subTotal, amount))
}
