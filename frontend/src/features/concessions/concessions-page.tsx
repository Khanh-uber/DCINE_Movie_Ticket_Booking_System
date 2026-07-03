import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Armchair, Popcorn } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate, formatTime, formatVnd } from '@/lib/format'
import { getApiErrorMessage } from '@/lib/http'
import { clearBookingState, readJson, STORAGE_KEYS, writeJson } from '@/lib/storage'
import { concessionsApi } from '@/services/booking'
import type { BookingCart, BookingCartMeta, ConcessionCartItem, ConcessionsCart } from '@/types'

import { CartPanel } from './cart-panel'
import { ProductCard } from './product-card'
import { CAT_LABELS, CAT_ORDER, MAX_QTY, type MenuItem, type SetQtyPayload, type TicketInfo, type Totals } from './types'

// ===== Ticket snapshot helpers =====

function deriveTicket(cart: BookingCart | null): TicketInfo | null {
  if (!cart || typeof cart !== 'object') return null
  if (cart.showtimeId == null || String(cart.showtimeId) === '') return null

  const meta: BookingCartMeta = cart.meta ?? {}
  const items = Array.isArray(cart.items) ? cart.items : []
  const selected = Array.isArray(cart.selectedSeats) ? cart.selectedSeats : []
  const seats = (items.length ? items.map((i) => i?.code) : selected).filter(
    (s): s is string => typeof s === 'string' && s !== '',
  )
  if (!seats.length) return null

  let totalAmount = Number(cart.totalAmount ?? 0)
  if (!Number.isFinite(totalAmount) || totalAmount < 0) {
    totalAmount = items.reduce((sum, i) => sum + (Number(i?.price) || 0), 0)
  }
  if (!Number.isFinite(totalAmount) || totalAmount <= 0) return null

  return {
    bookingId: cart.bookingId ?? meta.bookingId,
    showtimeId: cart.showtimeId,
    movieTitle: meta.movieTitle ?? '',
    theaterName: meta.theater ?? 'Rạp chưa xác định',
    date: meta.date ?? '',
    time: meta.time ?? '',
    endTime: meta.endTime ?? '',
    seats: [...seats].sort((a, b) => a.localeCompare(b, 'en', { numeric: true })),
    totalAmount,
    meta,
  }
}

/** Stale guard: true only when we can confidently tell the showtime already ended. */
function showtimeEnded(ticket: TicketInfo): boolean {
  const raw = ticket.endTime
  if (!raw) return false
  let end: Date | null = null
  if (raw.includes('T')) {
    end = new Date(raw)
  } else if (ticket.date) {
    const hm = raw.length > 5 ? raw.slice(0, 5) : raw
    end = new Date(`${ticket.date}T${hm}`)
  }
  if (!end || Number.isNaN(end.getTime())) return false
  return end.getTime() < Date.now()
}

function readTicketSnapshot(): TicketInfo | null {
  const raw = readJson<BookingCart>(STORAGE_KEYS.bookingCart)
  if (!raw) return null
  const ticket = deriveTicket(raw)
  if (!ticket || showtimeEnded(ticket)) {
    // Malformed or already-ended snapshot — wipe the whole booking flow state.
    clearBookingState()
    return null
  }
  return ticket
}

function restoreCombos(ticket: TicketInfo | null): ConcessionCartItem[] {
  if (!ticket) return []
  const snap = readJson<ConcessionsCart>(STORAGE_KEYS.concessionsCart)
  if (!snap || String(snap.showtimeId ?? '') !== String(ticket.showtimeId)) return []
  if (!Array.isArray(snap.combos)) return []
  return snap.combos
    .filter((c) => c && typeof c.key === 'string' && Number(c.qty) > 0)
    .map((c) => {
      const qty = Math.min(MAX_QTY, Math.round(Number(c.qty)))
      const unitPrice = Number(c.unitPrice) || 0
      return { ...c, qty, unitPrice, lineTotal: unitPrice * qty }
    })
}

function buildSnapshot(ticket: TicketInfo, cart: ConcessionCartItem[], totals: Totals): ConcessionsCart {
  return {
    bookingId: ticket.bookingId,
    showtimeId: ticket.showtimeId,
    ticket: {
      ...ticket.meta,
      bookingId: ticket.bookingId,
      seats: ticket.seats,
      totalAmount: ticket.totalAmount,
    },
    combos: cart,
    totals,
    grandTotal: totals.grandTotal,
  }
}

function toCartPayload(cart: ConcessionCartItem[]) {
  return cart.map((it) => ({ comboId: it.id, variant: it.variant || undefined, qty: it.qty }))
}

function displayTime(value: string): string {
  if (!value) return ''
  if (value.includes('T')) return formatTime(value)
  return value.length > 5 ? value.slice(0, 5) : value
}

function displayDate(value: string): string {
  if (!value) return ''
  return /^\d{4}-\d{2}-\d{2}/.test(value) ? formatDate(value) : value
}

// ===== Page =====

export default function ConcessionsPage() {
  const navigate = useNavigate()

  const [ticket] = useState<TicketInfo | null>(() => readTicketSnapshot())
  const [cart, setCart] = useState<ConcessionCartItem[]>(() => restoreCombos(ticket))
  const [category, setCategory] = useState<string>('all')

  // Backend-first mode: any API error on summary/cart sync disables it for the session.
  const [backendMode, setBackendMode] = useState(true)
  const [serverTotals, setServerTotals] = useState<Totals | null>(null)

  const applyServerResponse = useCallback((res: ConcessionsCart | null | undefined) => {
    const t = res?.totals
    if (t && typeof t.grandTotal === 'number' && Number.isFinite(t.grandTotal)) {
      setServerTotals({
        ticketAmount: Number(t.ticketAmount ?? 0),
        combosAmount: Number(t.combosAmount ?? 0),
        grandTotal: Number(t.grandTotal),
      })
    } else {
      setServerTotals(null)
    }
  }, [])

  const disableBackend = useCallback(() => {
    setBackendMode(false)
    setServerTotals(null)
  }, [])

  // Initial authoritative totals: cart sync when we restored combos, summary otherwise.
  const initialCartRef = useRef(cart)
  useEffect(() => {
    if (!ticket) return
    let cancelled = false
    void (async () => {
      try {
        const res = initialCartRef.current.length
          ? await concessionsApi.updateCart(toCartPayload(initialCartRef.current))
          : await concessionsApi.summary()
        if (!cancelled) applyServerResponse(res)
      } catch {
        if (!cancelled) disableBackend()
      }
    })()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Debounced cart sync (~400ms) on every cart mutation.
  const didMountRef = useRef(false)
  useEffect(() => {
    if (!ticket) return
    if (!didMountRef.current) {
      didMountRef.current = true
      return
    }
    if (!backendMode) return
    const timer = setTimeout(() => {
      void concessionsApi
        .updateCart(toCartPayload(cart))
        .then(applyServerResponse)
        .catch(() => disableBackend())
    }, 400)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart])

  const totals = useMemo<Totals>(() => {
    const combosAmount = cart.reduce((sum, it) => sum + (Number(it.lineTotal) || 0), 0)
    if (backendMode && serverTotals) {
      return { ...serverTotals }
    }
    const ticketAmount = ticket?.totalAmount ?? 0
    return { ticketAmount, combosAmount, grandTotal: ticketAmount + combosAmount }
  }, [cart, backendMode, serverTotals, ticket])

  // Persist concessions_cart on every change (booking_cart stays untouched).
  useEffect(() => {
    if (!ticket) return
    writeJson(STORAGE_KEYS.concessionsCart, buildSnapshot(ticket, cart, totals))
  }, [ticket, cart, totals])

  const persistNow = useCallback(() => {
    if (ticket) writeJson(STORAGE_KEYS.concessionsCart, buildSnapshot(ticket, cart, totals))
  }, [ticket, cart, totals])

  // ===== Menu =====

  const menuQuery = useQuery({
    queryKey: ['concessions', 'menu'],
    queryFn: () => concessionsApi.menu(),
    enabled: !!ticket,
  })

  useEffect(() => {
    if (menuQuery.isError) {
      toast.error(getApiErrorMessage(menuQuery.error, 'Không tải được danh sách bắp nước.'))
    }
  }, [menuQuery.isError, menuQuery.error])

  const items = useMemo<MenuItem[]>(() => {
    const raw = (menuQuery.data ?? []) as MenuItem[]
    return raw
      .filter((it) => it && it.active !== false)
      .map((it) => ({
        ...it,
        price: Number(it.price ?? 0),
        category: String(it.category ?? 'combo').toLowerCase(),
      }))
  }, [menuQuery.data])

  const categories = useMemo(() => {
    const present = new Set(items.map((it) => it.category))
    return CAT_ORDER.filter((c) => c === 'all' || present.has(c))
  }, [items])

  const filtered = useMemo(
    () => (category === 'all' ? items : items.filter((it) => it.category === category)),
    [items, category],
  )

  // ===== Cart mutations =====

  const getQty = useCallback((key: string) => cart.find((it) => it.key === key)?.qty ?? 0, [cart])

  const handleSetQty = useCallback((payload: SetQtyPayload) => {
    setCart((prev) => {
      const key = `${payload.item.id}__${payload.variantValue}`
      const qty = Math.max(0, Math.min(MAX_QTY, payload.qty))
      if (qty <= 0) return prev.filter((it) => it.key !== key)
      const next: ConcessionCartItem = {
        key,
        id: payload.item.id,
        code: payload.item.code,
        title: payload.item.title,
        imageUrl: payload.item.imageUrl,
        variant: payload.variantValue,
        variantLabel: payload.variantLabel,
        unitPrice: payload.unitPrice,
        qty,
        lineTotal: payload.unitPrice * qty,
      }
      const idx = prev.findIndex((it) => it.key === key)
      if (idx >= 0) {
        const copy = [...prev]
        copy[idx] = next
        return copy
      }
      return [...prev, next]
    })
  }, [])

  const handleRemove = useCallback((key: string) => {
    setCart((prev) => prev.filter((it) => it.key !== key))
  }, [])

  // ===== Navigation =====

  const goBackToSeats = () => {
    persistNow()
    navigate(ticket ? `/seat-map?showtimeId=${encodeURIComponent(String(ticket.showtimeId))}` : '/seat-map')
  }

  const goToPayment = () => {
    persistNow()
    navigate('/payment')
  }

  // ===== No-ticket notice =====

  if (!ticket) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-16">
        <Card className="mx-auto max-w-md border-border bg-card text-center">
          <CardContent className="flex flex-col items-center gap-4 py-10">
            <Armchair className="size-12 text-primary" />
            <h1 className="font-display text-xl font-bold uppercase">Bạn chưa chọn ghế</h1>
            <p className="text-sm text-muted-foreground">
              Vui lòng chọn phim, suất chiếu và ghế trước khi chọn bắp nước & combo.
            </p>
            <Button size="lg" onClick={() => navigate('/movies')}>
              Chọn phim ngay
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const timeRange = ticket.time
    ? ticket.endTime
      ? `${displayTime(ticket.time)} ~ ${displayTime(ticket.endTime)}`
      : displayTime(ticket.time)
    : ''

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <h1 className="font-display text-2xl font-bold uppercase">
        Chọn bắp nước <span className="text-primary">& combo</span>
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Thêm bắp nước, đồ ăn kèm để hoàn thiện trải nghiệm xem phim.
      </p>

      {/* Ticket summary bar */}
      <Card className="mt-6 border-border bg-card py-4">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 px-4">
          <div className="min-w-0">
            <p className="truncate font-display text-lg font-bold">{ticket.movieTitle || 'Phim đã chọn'}</p>
            <p className="text-sm text-muted-foreground">{ticket.theaterName}</p>
            {(ticket.date || timeRange) && (
              <p className="text-sm text-muted-foreground">
                {[displayDate(ticket.date), timeRange].filter(Boolean).join(' • ')}
              </p>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm">
              <span className="text-muted-foreground">Ghế: </span>
              <span className="font-semibold">{ticket.seats.join(', ')}</span>
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Tiền vé: <span className="text-base font-bold text-primary">{formatVnd(totals.ticketAmount)}</span>
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[1fr_360px]">
        {/* Menu */}
        <section>
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Danh mục món ăn">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={category === cat}
                onClick={() => setCategory(cat)}
                className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                  category === cat
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-muted-foreground hover:border-primary/60 hover:text-foreground'
                }`}
              >
                {CAT_LABELS[cat] ?? cat}
              </button>
            ))}
          </div>

          <div className="mt-4">
            {menuQuery.isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-[4/3] w-full rounded-xl" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                ))}
              </div>
            ) : menuQuery.isError ? (
              <Card className="border-border bg-card">
                <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
                  <Popcorn className="size-10 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Không tải được danh sách món. Vui lòng thử lại.
                  </p>
                  <Button variant="outline" onClick={() => void menuQuery.refetch()}>
                    Thử lại
                  </Button>
                </CardContent>
              </Card>
            ) : filtered.length === 0 ? (
              <Card className="border-border bg-card">
                <CardContent className="py-10 text-center text-sm text-muted-foreground">
                  Chưa có món trong danh mục này.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filtered.map((item) => (
                  <ProductCard key={String(item.id)} item={item} getQty={getQty} onSetQty={handleSetQty} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Cart */}
        <aside className="lg:sticky lg:top-20">
          <CartPanel
            cart={cart}
            totals={totals}
            onRemove={handleRemove}
            onBack={goBackToSeats}
            onCheckout={goToPayment}
          />
        </aside>
      </div>
    </div>
  )
}
