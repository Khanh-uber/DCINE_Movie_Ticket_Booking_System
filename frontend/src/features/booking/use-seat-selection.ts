import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import { showtimesApi } from '@/services/showtimes'
import { STORAGE_KEYS, readJson, removeJson, writeJson } from '@/lib/storage'
import type { BookingCart, PricedSeat, SeatMapData, SeatZone, TicketType } from '@/types'
import {
  colOf,
  couplePairCode,
  couplePairLabel,
  getDisplayPrice,
  normalizeZone,
  rowOf,
  zoneOf,
  type PricingTable,
} from './pricing'

export type SeatCellStatus = 'available' | 'held' | 'booked'

export interface SeatCell {
  code: string
  row: string
  col: number
  zone: SeatZone
  status: SeatCellStatus
}

export interface SeatWarn {
  code: string
  message: string
  key: number
}

export interface PopoverState {
  /** Danh sách mã ghế bị ảnh hưởng (ghế đôi = 2 mã). */
  codes: string[]
  label: string
  zone: SeatZone
  anchor: { x: number; top: number; bottom: number }
}

interface PricingPreview {
  items: { code: string; zone?: string; type: string; price: number }[]
  totalAmount: number
}

const SINGLE_GAP_MSG = 'Không được để trống 1 ghế lẻ'
const DEFAULT_ROWS = 'ABCDEFGHIJ'.split('')
const DEFAULT_AISLES = [4, 12]
const HOLD_THROTTLE_MS = 300
const PREVIEW_DEBOUNCE_MS = 350
const WARN_TTL_MS = 1800

interface UseSeatSelectionParams {
  showtimeId: string | null
  seatMap: SeatMapData | undefined
  pricing: PricingTable | undefined | null
}

export function useSeatSelection({ showtimeId, seatMap, pricing }: UseSeatSelectionParams) {
  // ===== Layout (rows / cols / aisles từ BE, có fallback) =====
  const rows = useMemo(() => (seatMap?.rows?.length ? seatMap.rows : DEFAULT_ROWS), [seatMap])
  const cols = useMemo(() => {
    const n = typeof seatMap?.cols === 'number' && seatMap.cols > 0 ? seatMap.cols : 16
    return Array.from({ length: n }, (_, i) => i + 1)
  }, [seatMap])
  const aislesAfter = useMemo(
    () => (Array.isArray(seatMap?.aislesAfter) && seatMap.aislesAfter.length ? seatMap.aislesAfter : DEFAULT_AISLES),
    [seatMap],
  )

  // ===== Trạng thái ghế từ server (merge lên full grid) =====
  const seats = useMemo(() => {
    const map: Record<string, SeatCell> = {}
    rows.forEach((r) => {
      cols.forEach((c) => {
        const code = `${r}${c}`
        map[code] = { code, row: r, col: c, zone: zoneOf(r), status: 'available' }
      })
    })
    seatMap?.seats?.forEach((s) => {
      const code = s.code || (s.row && s.col ? `${s.row}${s.col}` : '')
      if (!code) return
      const row = s.row || rowOf(code)
      let status = String(s.status ?? '').toLowerCase()
      if (s.booked) status = 'booked'
      if (status === 'holding') status = 'held'
      const cellStatus: SeatCellStatus = status === 'booked' ? 'booked' : status === 'held' ? 'held' : 'available'
      map[code] = {
        code,
        row,
        col: typeof s.col === 'number' ? s.col : colOf(code),
        zone: normalizeZone(s.zone, row),
        status: cellStatus,
      }
    })
    return map
  }, [seatMap, rows, cols])

  // ===== Lựa chọn của tôi: Map<code, TicketType> =====
  const [selection, setSelection] = useState<Map<string, TicketType>>(new Map())
  const [popover, setPopover] = useState<PopoverState | null>(null)
  const [warn, setWarn] = useState<SeatWarn | null>(null)
  const [preview, setPreview] = useState<PricingPreview | null>(null)

  const restoredRef = useRef(false)
  const warnTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const storageKey = showtimeId ? STORAGE_KEYS.seatSelectedPrefix + showtimeId : null

  // ===== Hold/release throttle (~300ms, gom batch) =====
  const pendingHoldsRef = useRef(new Map<string, 'hold' | 'release'>())
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const flushHolds = useCallback(() => {
    holdTimerRef.current = null
    if (!showtimeId) {
      pendingHoldsRef.current.clear()
      return
    }
    const entries = [...pendingHoldsRef.current.entries()]
    pendingHoldsRef.current.clear()
    const holds = entries.filter(([, a]) => a === 'hold').map(([c]) => c)
    const releases = entries.filter(([, a]) => a === 'release').map(([c]) => c)
    if (holds.length) showtimesApi.holdSeats(showtimeId, holds, 'hold').catch(() => {})
    if (releases.length) showtimesApi.holdSeats(showtimeId, releases, 'release').catch(() => {})
  }, [showtimeId])

  const queueHold = useCallback(
    (codes: string[], action: 'hold' | 'release') => {
      if (!showtimeId || !codes.length) return
      codes.forEach((c) => pendingHoldsRef.current.set(c, action))
      if (holdTimerRef.current == null) {
        holdTimerRef.current = setTimeout(flushHolds, HOLD_THROTTLE_MS)
      }
    },
    [showtimeId, flushHolds],
  )

  // Flush phần còn dồn khi rời trang.
  useEffect(() => {
    return () => {
      if (holdTimerRef.current != null) {
        clearTimeout(holdTimerRef.current)
        flushHolds()
      }
      if (warnTimerRef.current != null) clearTimeout(warnTimerRef.current)
    }
  }, [flushHolds])

  // ===== Khôi phục lựa chọn (session key trước, sau đó booking_cart) =====
  useEffect(() => {
    if (restoredRef.current || !showtimeId || !seatMap) return
    restoredRef.current = true

    const next = new Map<string, TicketType>()
    const addCode = (code: string, type?: string) => {
      const cell = seats[code]
      if (!cell || cell.status === 'booked') return
      next.set(code, type === 'child' ? 'child' : 'adult')
    }

    try {
      const persisted = readJson<{ selected?: string[]; assigned?: [string, string][] }>(
        STORAGE_KEYS.seatSelectedPrefix + showtimeId,
        [sessionStorage],
      )
      if (persisted?.selected?.length) {
        const typeMap = new Map(persisted.assigned ?? [])
        persisted.selected.forEach((code) => addCode(code, typeMap.get(code)))
      }
    } catch {
      // bản ghi hỏng — bỏ qua
    }

    if (!next.size) {
      const cart = readJson<BookingCart>(STORAGE_KEYS.bookingCart)
      if (cart && String(cart.showtimeId ?? '') === String(showtimeId)) {
        if (Array.isArray(cart.items) && cart.items.length) {
          cart.items.forEach((it) => it?.code && addCode(it.code, it.type))
        } else if (Array.isArray(cart.selectedSeats)) {
          cart.selectedSeats.forEach((code) => addCode(code, 'adult'))
        }
      }
    }

    if (next.size) setSelection(next)
  }, [showtimeId, seatMap, seats])

  // ===== Persist lựa chọn vào sessionStorage =====
  useEffect(() => {
    if (!restoredRef.current || !storageKey) return
    if (!selection.size) {
      removeJson(storageKey, [sessionStorage])
      return
    }
    writeJson(
      storageKey,
      { selected: [...selection.keys()], assigned: [...selection.entries()] },
      [sessionStorage],
    )
  }, [selection, storageKey])

  // ===== Live refresh: ghế của tôi bị người khác đặt → loại + cảnh báo =====
  useEffect(() => {
    if (!restoredRef.current) return
    const stolen = [...selection.keys()].filter((code) => seats[code]?.status === 'booked')
    if (!stolen.length) return
    setSelection((prev) => {
      const next = new Map(prev)
      stolen.forEach((code) => next.delete(code))
      return next
    })
    toast.warning(`Ghế ${stolen.join(', ')} vừa được người khác đặt nên đã bị bỏ khỏi lựa chọn của bạn.`)
  }, [seats, selection])

  // ===== Pricing preview (debounce) =====
  const previewSeqRef = useRef(0)
  useEffect(() => {
    const seq = ++previewSeqRef.current
    if (!showtimeId || !selection.size) {
      setPreview(null)
      return
    }
    const timer = setTimeout(() => {
      const payload = [...selection.entries()].map(([code, type]) => ({ code, type }))
      showtimesApi
        .pricingPreview(showtimeId, payload)
        .then((res) => {
          if (previewSeqRef.current === seq) setPreview(res)
        })
        .catch(() => {
          // lỗi preview → dùng bảng giá cục bộ
          if (previewSeqRef.current === seq) setPreview(null)
        })
    }, PREVIEW_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [selection, showtimeId])

  // ===== Quy tắc "không để trống 1 ghế lẻ" =====
  const rowChunks = useMemo(() => {
    const chunks: number[][] = []
    let current: number[] = []
    for (const c of cols) {
      current.push(c)
      if (aislesAfter.includes(c)) {
        chunks.push(current)
        current = []
      }
    }
    if (current.length) chunks.push(current)
    return chunks
  }, [cols, aislesAfter])

  const violatesSingleGap = useCallback(
    (row: string, changedCols: number[], willSelect: boolean) => {
      const rowStates: Record<number, string> = {}
      cols.forEach((c) => {
        const code = `${row}${c}`
        rowStates[c] = selection.has(code) ? 'selected' : (seats[code]?.status ?? 'available')
      })
      changedCols.forEach((c) => {
        rowStates[c] = willSelect ? 'selected' : 'available'
      })
      const blocked = (v: string) => v === 'booked' || v === 'selected'
      for (const chunk of rowChunks) {
        for (let i = 1; i < chunk.length - 1; i++) {
          const cur = rowStates[chunk[i]]
          if (cur === 'available' && blocked(rowStates[chunk[i - 1]]) && blocked(rowStates[chunk[i + 1]])) {
            return true
          }
        }
      }
      return false
    },
    [cols, rowChunks, seats, selection],
  )

  const fireWarn = useCallback((code: string) => {
    if (warnTimerRef.current != null) clearTimeout(warnTimerRef.current)
    setWarn({ code, message: SINGLE_GAP_MSG, key: Date.now() })
    warnTimerRef.current = setTimeout(() => setWarn(null), WARN_TTL_MS)
  }, [])

  // ===== Chọn / bỏ chọn =====
  const removeCodes = useCallback(
    (codes: string[]) => {
      setSelection((prev) => {
        const next = new Map(prev)
        codes.forEach((c) => next.delete(c))
        return next
      })
      queueHold(codes, 'release')
    },
    [queueHold],
  )

  const deselect = useCallback(
    (code: string) => {
      const cell = seats[code]
      if (!cell || !selection.has(code)) return
      if (cell.zone === 'couple') {
        const pair = couplePairCode(code)
        removeCodes([code, pair].filter((c) => selection.has(c)))
        return
      }
      if (violatesSingleGap(cell.row, [cell.col], false)) {
        fireWarn(code)
        return
      }
      removeCodes([code])
    },
    [seats, selection, removeCodes, violatesSingleGap, fireWarn],
  )

  const handleSeatClick = useCallback(
    (code: string, rect: DOMRect) => {
      const cell = seats[code]
      if (!cell) return
      const isSelected = selection.has(code)
      const anchor = { x: rect.left + rect.width / 2, top: rect.top, bottom: rect.bottom }

      if (cell.zone === 'couple') {
        const pairCode = couplePairCode(code)
        const pairCell = seats[pairCode]
        const blockedByOthers = (c: SeatCell | undefined, selfCode: string) =>
          !c || ((c.status === 'booked' || c.status === 'held') && !selection.has(selfCode))

        if (isSelected) {
          removeCodes([code, pairCode].filter((c) => selection.has(c)))
          return
        }
        if (blockedByOthers(cell, code) || blockedByOthers(pairCell, pairCode)) {
          toast.error('Ghế đôi này không bán lẻ hoặc 1 bên đã được đặt!')
          return
        }
        setPopover({ codes: [code, pairCode].sort((a, b) => colOf(a) - colOf(b)), label: couplePairLabel(code), zone: 'couple', anchor })
        return
      }

      if (isSelected) {
        if (violatesSingleGap(cell.row, [cell.col], false)) {
          fireWarn(code)
          return
        }
        removeCodes([code])
        return
      }

      if (cell.status === 'booked' || cell.status === 'held') return

      if (violatesSingleGap(cell.row, [cell.col], true)) {
        fireWarn(code)
        return
      }

      setPopover({ codes: [code], label: code, zone: cell.zone, anchor })
    },
    [seats, selection, removeCodes, violatesSingleGap, fireWarn],
  )

  const confirmTicketType = useCallback(
    (type: TicketType) => {
      if (!popover) return
      const codes = popover.codes
      setSelection((prev) => {
        const next = new Map(prev)
        codes.forEach((c) => next.set(c, type))
        return next
      })
      queueHold(codes, 'hold')
      setPopover(null)
    },
    [popover, queueHold],
  )

  const closePopover = useCallback(() => setPopover(null), [])

  // ===== Tổng hợp giá (ưu tiên preview từ BE nếu còn khớp lựa chọn) =====
  const previewMatches = useMemo(() => {
    if (!preview || !Array.isArray(preview.items)) return false
    if (preview.items.length !== selection.size) return false
    return preview.items.every((it) => {
      const t = selection.get(it.code)
      return t != null && t === (it.type === 'child' ? 'child' : 'adult')
    })
  }, [preview, selection])

  const items: PricedSeat[] = useMemo(() => {
    const byCode = (a: string, b: string) =>
      rowOf(a) === rowOf(b) ? colOf(a) - colOf(b) : rowOf(a).localeCompare(rowOf(b))

    if (previewMatches && preview) {
      return [...preview.items]
        .sort((a, b) => byCode(a.code, b.code))
        .map((it) => ({
          code: it.code,
          zone: normalizeZone(it.zone, rowOf(it.code)),
          type: it.type === 'child' ? ('child' as const) : ('adult' as const),
          price: typeof it.price === 'number' ? it.price : 0,
        }))
    }
    return [...selection.entries()]
      .sort((a, b) => byCode(a[0], b[0]))
      .map(([code, type]) => {
        const zone = seats[code]?.zone ?? zoneOf(rowOf(code))
        return { code, zone, type, price: getDisplayPrice(zone, type, pricing) }
      })
  }, [previewMatches, preview, selection, seats, pricing])

  const totalAmount = useMemo(() => {
    if (previewMatches && preview && typeof preview.totalAmount === 'number') return preview.totalAmount
    return items.reduce((sum, it) => sum + (it.price || 0), 0)
  }, [previewMatches, preview, items])

  const priceOf = useCallback(
    (zone: SeatZone, type: TicketType) => getDisplayPrice(zone, type, pricing),
    [pricing],
  )

  return {
    rows,
    cols,
    aislesAfter,
    seats,
    selection,
    items,
    totalAmount,
    warn,
    popover,
    priceOf,
    handleSeatClick,
    confirmTicketType,
    closePopover,
    deselect,
  }
}
