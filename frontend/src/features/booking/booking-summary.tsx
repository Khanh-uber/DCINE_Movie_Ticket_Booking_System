import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, CreditCard, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { formatVnd } from '@/lib/format'
import type { PricedSeat, SeatZone, TicketType } from '@/types'
import { couplePairLabel, normalizeZone, rowOf } from './pricing'

interface BookingSummaryProps {
  items: PricedSeat[]
  totalAmount: number
  priceOf: (zone: SeatZone, type: TicketType) => number
  onRemove: (code: string) => void
  onContinue: () => void
  onPay: () => void
  submitting: boolean
  backMovieHref: string
}

interface SummaryChip {
  key: string
  label: string
  code: string
  zone: SeatZone
  type: TicketType
  price: number
}

const CHIP_ZONE_CLASS: Record<SeatZone, string> = {
  vip: 'border-[#F7C948] text-[#FFF4C2]',
  standard: 'border-[#7EB8FF] text-[#D6E9FF]',
  couple: 'border-[#FF5C8D] text-[#FFC2D6]',
}

const ZONE_DOT_CLASS: Record<SeatZone, string> = {
  vip: 'bg-gradient-to-b from-[#FFF4C2] to-[#FFD351]',
  standard: 'bg-gradient-to-b from-[#D6E9FF] to-[#9CCBFF]',
  couple: 'bg-gradient-to-b from-[#FFC2D6] to-[#FF5C8D]',
}

/** Cột phải: panel sticky tổng hợp ghế đã chọn, bảng giá và CTA. */
export function BookingSummary({
  items,
  totalAmount,
  priceOf,
  onRemove,
  onContinue,
  onPay,
  submitting,
  backMovieHref,
}: BookingSummaryProps) {
  // Gom ghế đôi thành 1 chip theo cặp (giá = tổng 2 ghế).
  const chips = useMemo<SummaryChip[]>(() => {
    const result: SummaryChip[] = []
    const seenPairs = new Set<string>()
    for (const it of items) {
      const zone = normalizeZone(it.zone, rowOf(it.code))
      if (zone !== 'couple') {
        result.push({ key: it.code, label: it.code, code: it.code, zone, type: it.type, price: it.price })
        continue
      }
      const pairLabel = couplePairLabel(it.code)
      if (seenPairs.has(pairLabel)) continue
      seenPairs.add(pairLabel)
      const pairPrice = items
        .filter((other) => normalizeZone(other.zone, rowOf(other.code)) === 'couple' && couplePairLabel(other.code) === pairLabel)
        .reduce((sum, other) => sum + (other.price || 0), 0)
      result.push({ key: pairLabel, label: pairLabel, code: it.code, zone, type: it.type, price: pairPrice })
    }
    return result
  }, [items])

  const counts = useMemo(() => {
    const count: Record<TicketType, Record<SeatZone, number>> = {
      adult: { vip: 0, standard: 0, couple: 0 },
      child: { vip: 0, standard: 0, couple: 0 },
    }
    let adultTotal = 0
    let childTotal = 0
    for (const it of items) {
      const zone = normalizeZone(it.zone, rowOf(it.code))
      const who: TicketType = it.type === 'child' ? 'child' : 'adult'
      count[who][zone]++
      if (who === 'child') childTotal += it.price || 0
      else adultTotal += it.price || 0
    }
    return { count, adultTotal, childTotal }
  }, [items])

  const adultCount = counts.count.adult.vip + counts.count.adult.standard + counts.count.adult.couple
  const childCount = counts.count.child.vip + counts.count.child.standard + counts.count.child.couple
  const disabled = items.length === 0 || submitting

  const matrixCell = (type: TicketType, zone: SeatZone) => (
    <div className="flex items-center justify-between rounded-md border border-border bg-background/60 px-2 py-1.5 text-xs font-bold">
      <span className="text-muted-foreground">x{counts.count[type][zone]}</span>
      <span>{formatVnd(priceOf(zone, type))}</span>
    </div>
  )

  return (
    <section
      aria-live="polite"
      className="sticky top-20 grid h-fit gap-3 rounded-lg border border-border border-t-[3px] border-t-primary bg-[#101010] p-4 shadow-elevated"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base font-bold uppercase">Chọn loại vé</h2>
        <span className="text-xs text-muted-foreground">{items.length} ghế được chọn</span>
      </div>

      {chips.length > 0 && (
        <div className="flex min-h-3 flex-wrap gap-2">
          {chips.map((chip) => (
            <span
              key={chip.key}
              className={`inline-flex items-center gap-1.5 rounded-full border bg-[#0F1013] px-2.5 py-1 text-xs font-extrabold ${CHIP_ZONE_CLASS[chip.zone]}`}
            >
              {chip.label}
              <small className="font-semibold opacity-80">
                {chip.type === 'child' ? 'Trẻ em' : 'Người lớn'} · {formatVnd(chip.price)}
              </small>
              <button
                type="button"
                aria-label={`Bỏ ghế ${chip.label}`}
                className="ml-0.5 rounded-full p-0.5 transition hover:bg-white/10"
                onClick={() => onRemove(chip.code)}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Bảng giá theo vùng */}
      <div className="grid grid-cols-[72px_repeat(3,1fr)] items-center gap-x-2 gap-y-1.5 text-xs">
        <div />
        {(['vip', 'standard', 'couple'] as const).map((zone) => (
          <div key={zone} className="flex items-center gap-1.5 font-extrabold text-[#C9CED7]">
            <span className={`inline-block h-3 w-3 rounded-sm border border-border ${ZONE_DOT_CLASS[zone]}`} />
            {zone === 'vip' ? 'VIP' : zone === 'standard' ? 'Standard' : 'Couple'}
          </div>
        ))}

        <div className="font-extrabold text-[#C9CED7]">Người lớn</div>
        {matrixCell('adult', 'vip')}
        {matrixCell('adult', 'standard')}
        {matrixCell('adult', 'couple')}

        <div className="font-extrabold text-[#C9CED7]">Trẻ em</div>
        {matrixCell('child', 'vip')}
        {matrixCell('child', 'standard')}
        {matrixCell('child', 'couple')}
      </div>

      <div className="grid gap-2 text-sm">
        <div className="flex items-center justify-between">
          <span>
            Người lớn <span className="text-muted-foreground">(x{adultCount})</span>
          </span>
          <span>{formatVnd(counts.adultTotal)}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>
            Trẻ em <span className="text-muted-foreground">(x{childCount})</span>
          </span>
          <span>{formatVnd(counts.childTotal)}</span>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <span className="font-bold uppercase">Tổng</span>
          <strong className="text-xl text-primary">{formatVnd(totalAmount)}</strong>
        </div>
      </div>

      <p className="min-h-5 text-xs text-muted-foreground">
        {items.length === 0 ? 'Hãy chọn ghế để tiếp tục.' : ''}
      </p>

      <div className="flex flex-wrap justify-end gap-2">
        <Button asChild variant="outline" size="sm" className="border-primary/70 text-muted-foreground hover:text-white">
          <Link to={backMovieHref}>
            <ChevronLeft className="h-4 w-4" />
            Quay lại phim
          </Link>
        </Button>
        <Button size="sm" disabled={disabled} onClick={onContinue}>
          <ChevronRight className="h-4 w-4" />
          Tiếp tục
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="border-primary/70"
          disabled={disabled}
          onClick={onPay}
        >
          <CreditCard className="h-4 w-4" />
          Thanh toán ngay
        </Button>
      </div>
    </section>
  )
}
