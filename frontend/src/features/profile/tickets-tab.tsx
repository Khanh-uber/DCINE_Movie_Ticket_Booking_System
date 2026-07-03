import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { Armchair, CalendarDays, Download, MapPin, QrCode, Ticket } from 'lucide-react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate, formatVnd } from '@/lib/format'
import type { ProfileBooking } from '@/types'

const POSTER_FALLBACK = '/images/poster-placeholder.svg'

const STATUS_LABELS: Record<string, string> = {
  CONFIRMED: 'Đã xác nhận',
  PAID: 'Đã thanh toán',
  PENDING: 'Chờ thanh toán',
  CANCELLED: 'Đã hủy',
  USED: 'Đã dùng',
  EXPIRED: 'Hết hạn',
}

function statusBadge(booking: ProfileBooking, isFuture: boolean) {
  const raw = (booking.status ?? '').toUpperCase()
  const label = STATUS_LABELS[raw] ?? booking.status ?? (isFuture ? 'Sắp chiếu' : 'Đã dùng')
  if (raw === 'CANCELLED' || raw === 'EXPIRED') {
    return <Badge variant="destructive">{label}</Badge>
  }
  if (isFuture) {
    return <Badge className="bg-success/15 text-success">{label}</Badge>
  }
  return <Badge variant="secondary">{label}</Badge>
}

function bookingCode(booking: ProfileBooking): string {
  return String(booking.code || booking.id || '')
}

function BookingCard({
  booking,
  isFuture,
  onShowQr,
}: {
  booking: ProfileBooking
  isFuture: boolean
  onShowQr: (booking: ProfileBooking) => void
}) {
  const seats = booking.seats?.length ? booking.seats.join(', ') : 'Chưa có'
  return (
    <div className="flex gap-4 rounded-xl border border-border bg-card p-4 transition hover:border-primary/40">
      <img
        src={booking.posterUrl || POSTER_FALLBACK}
        alt={booking.movieTitle ?? 'Poster phim'}
        className="h-36 w-24 shrink-0 rounded-lg object-cover"
        onError={(e) => {
          e.currentTarget.src = POSTER_FALLBACK
        }}
      />
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate font-display font-bold">{booking.movieTitle || 'Phim'}</span>
          {statusBadge(booking, isFuture)}
        </div>
        {booking.theaterName && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="size-3.5 shrink-0" /> {booking.theaterName}
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="size-3.5 shrink-0" />
          {formatDate(booking.date)}
          {booking.time ? ` • ${booking.time}` : ''}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Armchair className="size-3.5 shrink-0" /> Ghế: {seats}
        </div>
        <div className="pt-1 text-sm font-bold text-gold">
          Tổng: {formatVnd(booking.totalAmount)}
        </div>
        <div className="pt-1">
          <Button size="sm" variant="outline" onClick={() => onShowQr(booking)}>
            <QrCode /> Xem QR
          </Button>
        </div>
      </div>
    </div>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card/50 py-10 text-center text-sm text-muted-foreground">
      {message}
    </div>
  )
}

function TicketsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="flex gap-4 rounded-xl border border-border bg-card p-4">
          <Skeleton className="h-36 w-24 rounded-lg" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-5 w-1/2" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-8 w-24" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function TicketsTab({
  bookings,
  isLoading,
  errorMessage,
}: {
  bookings: ProfileBooking[]
  isLoading: boolean
  errorMessage?: string
}) {
  const [qrBooking, setQrBooking] = useState<ProfileBooking | null>(null)
  const [qrSrc, setQrSrc] = useState<string | null>(null)

  useEffect(() => {
    if (!qrBooking) {
      setQrSrc(null)
      return
    }
    const raw = qrBooking.qrCode
    if (raw && raw.length > 50) {
      setQrSrc(raw.startsWith('data:') ? raw : `data:image/png;base64,${raw}`)
      return
    }
    const code = bookingCode(qrBooking)
    if (!code) {
      setQrSrc(null)
      return
    }
    let cancelled = false
    QRCode.toDataURL(code, { width: 250, margin: 1 })
      .then((url) => {
        if (!cancelled) setQrSrc(url)
      })
      .catch(() => {
        if (!cancelled) {
          setQrSrc(null)
          toast.error('Không thể tạo mã QR cho vé này.')
        }
      })
    return () => {
      cancelled = true
    }
  }, [qrBooking])

  const handleDownload = () => {
    if (!qrSrc || !qrBooking) return
    const link = document.createElement('a')
    link.href = qrSrc
    link.download = `Ve_DCINE_${bookingCode(qrBooking) || 'QR'}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (isLoading) return <TicketsSkeleton />
  if (errorMessage) return <EmptyState message={errorMessage} />

  const today = new Date().toISOString().slice(0, 10)
  const active = bookings.filter((b) => (b.date ?? '') >= today)
  const past = bookings.filter((b) => (b.date ?? '') < today)

  return (
    <div className="space-y-8">
      <section>
        <h3 className="mb-4 flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide">
          <span className="inline-block h-4 w-1 rounded bg-primary" aria-hidden />
          Vé sắp chiếu
        </h3>
        {active.length ? (
          <div className="space-y-4">
            {active.map((b) => (
              <BookingCard key={String(b.id)} booking={b} isFuture onShowQr={setQrBooking} />
            ))}
          </div>
        ) : (
          <EmptyState message="Hiện bạn chưa có vé sắp chiếu." />
        )}
      </section>

      <section>
        <h3 className="mb-4 flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wide">
          <span className="inline-block h-4 w-1 rounded bg-muted-foreground" aria-hidden />
          Lịch sử
        </h3>
        {past.length ? (
          <div className="space-y-4">
            {past.map((b) => (
              <BookingCard
                key={String(b.id)}
                booking={b}
                isFuture={false}
                onShowQr={setQrBooking}
              />
            ))}
          </div>
        ) : (
          <EmptyState message="Chưa có lịch sử vé đã sử dụng." />
        )}
      </section>

      <Dialog open={!!qrBooking} onOpenChange={(open) => !open && setQrBooking(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="text-center font-display uppercase">
              Mã vé vào rạp
            </DialogTitle>
            <DialogDescription className="text-center">
              Đưa mã QR này cho nhân viên soát vé tại rạp.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4">
            {qrSrc ? (
              <img
                src={qrSrc}
                alt="Mã QR vé"
                className="size-[250px] rounded-lg bg-white object-contain p-2"
              />
            ) : (
              <Skeleton className="size-[250px] rounded-lg" />
            )}
            {qrBooking && (
              <p className="flex items-center gap-2 font-mono text-sm font-semibold tracking-widest">
                <Ticket className="size-4 text-primary" />
                {bookingCode(qrBooking) || '—'}
              </p>
            )}
            <Button onClick={handleDownload} disabled={!qrSrc} className="w-full">
              <Download /> Tải mã QR
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
