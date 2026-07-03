import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { showtimesApi } from '@/services/showtimes'
import { bookingApi } from '@/services/booking'
import { getApiErrorMessage } from '@/lib/http'
import { STORAGE_KEYS, writeJson } from '@/lib/storage'
import { formatDate, formatTime } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import type { BookingCart, ShowtimeDetail } from '@/types'
import { useSeatSelection } from './use-seat-selection'
import { SeatGrid } from './seat-grid'
import { TicketTypePopover } from './ticket-type-popover'
import { MovieInfoCard } from './movie-info-card'
import { BookingSummary } from './booking-summary'

/**
 * BE trả nhiều biến thể tên trường cho chi tiết suất chiếu (giống frontend_2).
 * Mở rộng cục bộ thay vì sửa type dùng chung.
 */
interface ShowtimeDetailEx extends ShowtimeDetail {
  showtimeId?: number | string
  showDate?: string
  startTime?: string
  endTime?: string
  formatName?: string
  releaseYear?: number | string
  durationMin?: number
  genres?: string[]
}

function clockLabel(value?: string): string {
  if (!value) return ''
  if (/^\d{1,2}:\d{2}/.test(value)) return value.slice(0, 5)
  return formatTime(value)
}

export default function SeatMapPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const showtimeId =
    searchParams.get('showtimeId') || searchParams.get('st') || searchParams.get('showtime') || null

  const detailQuery = useQuery({
    queryKey: ['showtime-detail', showtimeId],
    queryFn: () => showtimesApi.byId(showtimeId!),
    enabled: !!showtimeId,
  })

  // Poll sơ đồ ghế mỗi 10s để đồng bộ ghế bị người khác giữ/đặt.
  const seatsQuery = useQuery({
    queryKey: ['showtime-seats', showtimeId],
    queryFn: () => showtimesApi.seats(showtimeId!),
    enabled: !!showtimeId,
    refetchInterval: 10_000,
  })

  const detail = detailQuery.data as ShowtimeDetailEx | undefined

  const info = useMemo(() => {
    const start = searchParams.get('start') || detail?.startAt || detail?.startTime || ''
    const end = searchParams.get('end') || detail?.endAt || detail?.endTime || ''
    const metaLine = [
      detail?.releaseYear != null ? String(detail.releaseYear) : '',
      (detail?.genres ?? []).join(', '),
      detail?.durationMin ? `${detail.durationMin} phút` : '',
    ]
      .filter(Boolean)
      .join(' • ')
    return {
      theater: detail?.theaterName || 'D-Cine',
      date: detail?.date || detail?.showDate || '',
      time: start,
      end,
      format: searchParams.get('format') || detail?.format || detail?.formatName || '2D',
      movieId: detail?.movieId ?? searchParams.get('movie') ?? '',
      movieTitle: detail?.movieTitle || '',
      posterUrl: detail?.posterUrl || '',
      metaLine,
    }
  }, [detail, searchParams])

  const {
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
  } = useSeatSelection({
    showtimeId,
    seatMap: seatsQuery.data,
    pricing: detail?.pricing,
  })

  const [submitting, setSubmitting] = useState(false)

  async function handleCheckout(destination: '/concessions' | '/payment') {
    if (!showtimeId || !items.length || submitting) return
    setSubmitting(true)
    try {
      const seatsPayload = [...selection.entries()].map(([code, type]) => ({ code, type }))
      const booking = await bookingApi.create(showtimeId, seatsPayload)

      const bookingItems = Array.isArray(booking.items) && booking.items.length ? booking.items : items
      const total =
        typeof booking.totalAmount === 'number'
          ? booking.totalAmount
          : bookingItems.reduce((sum, it) => sum + (it.price || 0), 0)
      const raw = booking as BookingCart & { id?: number; bookingCode?: number }
      const bookingId = booking.bookingId ?? raw.id ?? raw.bookingCode
      const selectedSeats =
        Array.isArray(booking.selectedSeats) && booking.selectedSeats.length
          ? booking.selectedSeats
          : bookingItems.map((it) => it.code)

      const cart: BookingCart = {
        bookingId,
        showtimeId,
        items: bookingItems,
        selectedSeats,
        totalAmount: total,
        status: booking.status ?? 'PENDING',
        meta: {
          bookingId,
          theater: info.theater,
          date: info.date,
          time: info.time,
          endTime: info.end,
          movieId: info.movieId,
          movieTitle: info.movieTitle,
          format: info.format,
        },
      }
      writeJson(STORAGE_KEYS.bookingCart, cart)
      navigate(destination)
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Không thể tiếp tục sang bước tiếp theo. Vui lòng thử lại.'))
    } finally {
      setSubmitting(false)
    }
  }

  const backShowtimeHref = info.movieId ? `/showtimes?movie=${encodeURIComponent(String(info.movieId))}` : '/showtimes'
  const backMovieHref = info.movieId ? `/movies/${encodeURIComponent(String(info.movieId))}` : '/'
  const timeLabel = info.end
    ? `${clockLabel(info.time)} - ${clockLabel(info.end)}`
    : clockLabel(info.time)

  if (!showtimeId) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-bold uppercase">Không xác định được suất chiếu</h1>
        <p className="mt-3 text-muted-foreground">Vui lòng chọn lại lịch chiếu để tiếp tục đặt vé.</p>
        <Button asChild className="mt-6">
          <Link to="/showtimes">Chọn lịch chiếu</Link>
        </Button>
      </div>
    )
  }

  if (seatsQuery.isLoading || detailQuery.isLoading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-6">
        <Skeleton className="h-5 w-72" />
        <div className="mt-4 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)_340px]">
          <Skeleton className="h-[560px] rounded-lg" />
          <Skeleton className="h-[560px] rounded-lg" />
          <Skeleton className="h-[480px] rounded-lg" />
        </div>
      </div>
    )
  }

  if (seatsQuery.isError) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-bold uppercase">Không tải được sơ đồ ghế</h1>
        <p className="mt-3 text-muted-foreground">
          {getApiErrorMessage(seatsQuery.error, 'Đã có lỗi xảy ra khi tải sơ đồ ghế.')}
        </p>
        <Button className="mt-6" onClick={() => seatsQuery.refetch()}>
          Thử lại
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-6">
      {/* Breadcrumb */}
      <nav aria-label="Bạn đang ở đây" className="text-sm text-muted-foreground">
        <Link to="/" className="transition hover:text-foreground">
          Trang chủ
        </Link>
        <span className="mx-2">/</span>
        <Link to="/movies" className="transition hover:text-foreground">
          Phim
        </Link>
        {info.movieTitle && (
          <>
            <span className="mx-2">/</span>
            <Link to={backMovieHref} className="transition hover:text-foreground">
              {info.movieTitle}
            </Link>
          </>
        )}
        <span className="mx-2">/</span>
        <Link to={backShowtimeHref} className="transition hover:text-foreground">
          Chọn lịch chiếu
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Chọn ghế</span>
      </nav>

      <div className="mt-4 grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)_340px]">
        {/* Cột trái: thông tin phim */}
        <MovieInfoCard
          posterUrl={info.posterUrl}
          title={info.movieTitle}
          metaLine={info.metaLine}
          theater={info.theater}
          dateLabel={info.date ? formatDate(info.date) : ''}
          timeLabel={timeLabel}
          format={info.format}
          backHref={backShowtimeHref}
        />

        {/* Cột giữa: màn hình + sơ đồ ghế + chú thích */}
        <section
          aria-label="Sơ đồ ghế"
          className="min-w-0 rounded-lg border border-border bg-[radial-gradient(900px_320px_at_50%_-80px,rgba(229,9,20,0.16),transparent_60%)] pt-2 pb-4"
        >
          <div className="mx-auto max-w-[860px] px-2">
            <svg className="block h-24 w-full" viewBox="0 0 1000 140" preserveAspectRatio="none" aria-hidden="true">
              <defs>
                <path id="dcine-screen-arc" d="M60,110 Q500,24 940,110" />
                <filter id="dcine-screen-glow">
                  <feGaussianBlur stdDeviation="4" result="b" />
                  <feMerge>
                    <feMergeNode in="b" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <use
                href="#dcine-screen-arc"
                fill="none"
                stroke="#fff"
                strokeWidth="2.2"
                opacity="0.9"
                filter="url(#dcine-screen-glow)"
              />
              <text fill="#fff" style={{ font: '800 18px Inter, system-ui, sans-serif', letterSpacing: 8 }}>
                <textPath href="#dcine-screen-arc" startOffset="50%" textAnchor="middle">
                  MÀN HÌNH
                </textPath>
              </text>
            </svg>
          </div>

          <div className="mb-3 flex justify-center gap-2" aria-hidden="true">
            <span className="rounded-full border border-[#4a1d22] bg-[#2B1618] px-2.5 py-1 text-xs font-bold text-[#FFD1D3]">
              VIP A–C
            </span>
            <span className="rounded-full border border-[#20303a] bg-[#172025] px-2.5 py-1 text-xs font-bold text-[#D6E8FF]">
              Standard D–I
            </span>
            <span className="rounded-full border border-[#5C2233] bg-[#290E16] px-2.5 py-1 text-xs font-bold text-[#FFC2D6]">
              Couple J
            </span>
          </div>

          <SeatGrid
            rows={rows}
            cols={cols}
            aislesAfter={aislesAfter}
            seats={seats}
            selection={selection}
            warn={warn}
            onSeatClick={handleSeatClick}
            priceOf={priceOf}
          />

          {/* Chú thích */}
          <ul className="mt-3 flex flex-wrap items-center justify-center gap-4 text-xs" aria-label="Chú thích ghế">
            <li className="inline-flex items-center gap-2">
              <span className="inline-block h-4 w-4 rounded border border-[#C7CED6] bg-white" />
              Trống
            </li>
            <li className="inline-flex items-center gap-2">
              <span className="inline-block h-4 w-4 rounded bg-primary" />
              Đang chọn
            </li>
            <li className="inline-flex items-center gap-2">
              <span className="inline-block h-4 w-4 rounded border border-[#9A4F00] bg-gradient-to-br from-[#F59E0B] to-[#B45309]" />
              Đang giữ
            </li>
            <li className="inline-flex items-center gap-2">
              <span className="inline-block h-4 w-4 rounded border border-[#101216] bg-gradient-to-b from-[#2B2E33] to-[#1C1F24]" />
              Đã bán
            </li>
            <li className="inline-flex items-center gap-2">
              <span className="inline-block h-4 w-4 rounded border border-[#F7C948] bg-gradient-to-b from-[#FFF4C2] to-[#FFD351]" />
              VIP
            </li>
            <li className="inline-flex items-center gap-2">
              <span className="inline-block h-4 w-4 rounded border border-[#FF9EB9] bg-gradient-to-b from-[#FFC2D6] to-[#FF5C8D]" />
              Couple
            </li>
          </ul>
        </section>

        {/* Cột phải: tổng hợp */}
        <BookingSummary
          items={items}
          totalAmount={totalAmount}
          priceOf={priceOf}
          onRemove={deselect}
          onContinue={() => handleCheckout('/concessions')}
          onPay={() => handleCheckout('/payment')}
          submitting={submitting}
          backMovieHref={backMovieHref}
        />
      </div>

      {popover && (
        <TicketTypePopover
          popover={popover}
          adultPrice={priceOf(popover.zone, 'adult')}
          childPrice={priceOf(popover.zone, 'child')}
          onPick={confirmTicketType}
          onClose={closePopover}
        />
      )}
    </div>
  )
}
