import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import QRCode from 'qrcode'
import { CheckCircle, Download, Home, Ticket } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate, formatVnd } from '@/lib/format'
import { STORAGE_KEYS, readJson, removeJson } from '@/lib/storage'
import { checkoutApi } from '@/services/booking'
import type { OrderSummary } from '@/types'
import { seatCode } from './order-utils'

/**
 * Old confirmation.js accepted many shapes for the confirmed order
 * (root-level fields or nested under ticket/totals) — stay liberal here too.
 */
type LooseConfirmedOrder = Omit<OrderSummary, 'combos'> & {
  movieTitle?: string
  movieName?: string
  theaterName?: string
  cinemaName?: string
  showDate?: string
  date?: string
  showTime?: string
  time?: string
  showtimeText?: string
  seats?: Array<string | { code?: string }> | string
  seatsText?: string
  total?: number
  grandTotal?: number
  combos?: Array<{ name?: string; title?: string; qty?: number; quantity?: number }>
}

interface OrderView {
  orderId: string
  movieText: string
  theaterText: string
  showDate: string
  showtimeText: string
  seatsText: string
  combosText: string
  total: number
  createdAt: string
}

function text(...values: Array<unknown>): string {
  for (const value of values) {
    const t = String(value ?? '').trim()
    if (t) return t
  }
  return ''
}

function buildOrderView(raw: LooseConfirmedOrder): OrderView {
  const ticket = raw.ticket ?? {}
  const totals = raw.totals ?? {}

  const seatsSource = ticket.seats ?? raw.seats ?? raw.seatsText ?? []
  const seatsText = Array.isArray(seatsSource)
    ? seatsSource.map(seatCode).filter(Boolean).join(', ')
    : String(seatsSource || '')

  const combos = Array.isArray(raw.combos) ? raw.combos : []
  const combosText = combos.length
    ? combos
        .map((c) => `${c.title || c.name || 'Combo'} (x${c.qty ?? c.quantity ?? 1})`)
        .join(', ')
    : 'Không có'

  return {
    orderId: text(raw.orderId, raw.bookingId),
    movieText: text(ticket.movieTitle, raw.movieTitle, raw.movieName) || 'Phim chưa xác định',
    theaterText: text(ticket.theaterName, raw.theaterName, raw.cinemaName) || 'Rạp chưa xác định',
    showDate: text(ticket.date, raw.showDate, raw.date) || '--',
    showtimeText: text(ticket.time, raw.showTime, raw.time, raw.showtimeText) || '--',
    seatsText: seatsText || '--',
    combosText,
    total: Number(totals.grandTotal ?? raw.total ?? raw.grandTotal ?? 0) || 0,
    createdAt: raw.createdAt || new Date().toISOString(),
  }
}

function TicketRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2">
      <span className="text-sm text-muted-foreground">{label}</span>
      <strong className="text-right text-sm font-semibold">{value || '--'}</strong>
    </div>
  )
}

export default function ConfirmationPage() {
  const navigate = useNavigate()

  const confirmedQuery = useQuery({
    queryKey: ['checkout', 'last-confirmed'],
    queryFn: checkoutApi.lastConfirmed,
    retry: false,
    refetchOnWindowFocus: false,
  })

  const order = useMemo<LooseConfirmedOrder | null>(() => {
    if (confirmedQuery.isPending) return null
    return (
      (confirmedQuery.data as LooseConfirmedOrder | undefined) ??
      readJson<LooseConfirmedOrder>(STORAGE_KEYS.orderConfirmed)
    )
  }, [confirmedQuery.isPending, confirmedQuery.data])

  const view = useMemo(() => (order ? buildOrderView(order) : null), [order])

  const [qrSrc, setQrSrc] = useState<string | null>(null)

  useEffect(() => {
    if (!order) return
    const raw = order.ticketQr || order.qrCode
    if (raw) {
      setQrSrc(raw.startsWith('data:image') ? raw : `data:image/png;base64,${raw}`)
      return
    }
    const id = text(order.orderId, order.bookingId)
    if (!id) return
    let cancelled = false
    QRCode.toDataURL(id, { width: 220, margin: 1 })
      .then((url) => {
        if (!cancelled) setQrSrc(url)
      })
      .catch(() => {
        // QR không bắt buộc — bỏ qua nếu không tạo được.
      })
    return () => {
      cancelled = true
    }
  }, [order])

  function handleDownloadQr() {
    if (!qrSrc) return
    const link = document.createElement('a')
    link.href = qrSrc
    link.download = `Ve_DCINE_${view?.orderId || 'ticket'}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  function clearAndGo(to: string) {
    removeJson(STORAGE_KEYS.orderConfirmed)
    removeJson(STORAGE_KEYS.bookingCart)
    removeJson(STORAGE_KEYS.concessionsCart)
    navigate(to)
  }

  if (confirmedQuery.isPending) {
    return (
      <div className="container mx-auto max-w-3xl px-4 py-10">
        <Skeleton className="mx-auto h-28 w-full rounded-xl" />
        <Skeleton className="mt-6 h-80 w-full rounded-xl" />
        <Skeleton className="mt-6 h-40 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-10">
      {/* Success banner */}
      <div className="flex flex-col items-center gap-3 rounded-xl border border-success/40 bg-success/10 px-6 py-8 text-center">
        <CheckCircle className="size-14 text-success" aria-hidden />
        <h1 className="font-display text-2xl font-bold uppercase md:text-3xl">Đặt vé thành công!</h1>
        <p className="text-sm text-muted-foreground">
          {view
            ? 'Cảm ơn bạn đã đặt vé tại D-cine. Thông tin vé của bạn ở bên dưới.'
            : 'Giao dịch của bạn đã được ghi nhận. Vui lòng kiểm tra mục "Vé của tôi" để xem chi tiết.'}
        </p>
      </div>

      {view ? (
        <>
          {/* Ticket card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display uppercase">
                <Ticket className="size-5 text-primary" aria-hidden />
                Vé của bạn
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-[1fr_auto]">
              <div className="divide-y divide-border">
                <TicketRow label="Mã đơn" value={view.orderId ? `#${view.orderId}` : '--'} />
                <TicketRow label="Phim" value={view.movieText} />
                <TicketRow label="Rạp" value={view.theaterText} />
                <TicketRow label="Ngày chiếu" value={view.showDate} />
                <TicketRow label="Suất chiếu" value={view.showtimeText} />
                <TicketRow label="Ghế" value={view.seatsText} />
                <TicketRow label="Bắp nước" value={view.combosText} />
              </div>

              <div className="flex flex-col items-center gap-3">
                {qrSrc ? (
                  <img
                    src={qrSrc}
                    alt={`Mã QR vé ${view.orderId || ''}`}
                    className="size-44 rounded-lg bg-white p-2"
                  />
                ) : (
                  <div className="flex size-44 items-center justify-center rounded-lg border border-dashed border-border text-center text-xs text-muted-foreground">
                    Không có mã QR
                  </div>
                )}
                <p className="max-w-44 text-center text-xs text-muted-foreground">
                  Mã QR này sẽ được quét tại rạp để xác nhận vé của bạn.
                </p>
                <Button variant="outline" size="sm" disabled={!qrSrc} onClick={handleDownloadQr}>
                  <Download className="size-4" aria-hidden />
                  Tải mã QR
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Invoice card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="font-display uppercase">Tóm tắt đơn hàng</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <TicketRow label="Mã hoá đơn" value={view.orderId ? `#${view.orderId}` : '--'} />
              <TicketRow label="Ngày thanh toán" value={formatDate(view.createdAt) || '--'} />
              <TicketRow label="Phương thức" value="Cổng thanh toán VNPAY" />
              <Separator className="my-2" />
              <div className="flex items-center justify-between py-2">
                <span className="font-display font-bold uppercase">Tổng tiền</span>
                <strong className="text-xl font-bold text-primary">{formatVnd(view.total)}</strong>
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button variant="outline" onClick={() => clearAndGo('/')}>
          <Home className="size-4" aria-hidden />
          Về trang chủ
        </Button>
        <Button onClick={() => clearAndGo('/profile?tab=tickets')}>
          <Ticket className="size-4" aria-hidden />
          Xem vé của tôi
        </Button>
      </div>
    </div>
  )
}
