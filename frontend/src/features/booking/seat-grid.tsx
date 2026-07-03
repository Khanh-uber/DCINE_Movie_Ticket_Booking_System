import { useMemo, type ReactNode } from 'react'
import type { SeatZone, TicketType } from '@/types'
import { formatVnd } from '@/lib/format'
import { couplePairLabel } from './pricing'
import type { SeatCell, SeatWarn } from './use-seat-selection'

type SeatVisual = 'available' | 'selected' | 'held' | 'booked'

interface SeatGridProps {
  rows: string[]
  cols: number[]
  aislesAfter: number[]
  seats: Record<string, SeatCell>
  selection: Map<string, TicketType>
  warn: SeatWarn | null
  onSeatClick: (code: string, rect: DOMRect) => void
  priceOf: (zone: SeatZone, type: TicketType) => number
}

const ZONE_AVAILABLE: Record<SeatZone, string> = {
  vip: 'bg-gradient-to-b from-[#FFF4C2] to-[#FFD351] border-[#F7C948] text-[#3D2E00]',
  standard: 'bg-gradient-to-b from-[#D6E9FF] to-[#9CCBFF] border-[#7EB8FF] text-[#0E1116]',
  couple: 'bg-gradient-to-b from-[#FFC2D6] to-[#FF5C8D] border-[#FF9EB9] text-[#581C30]',
}

const VISUAL_STATE: Record<Exclude<SeatVisual, 'available'>, string> = {
  selected: 'bg-primary border-[#FF4D57] text-white shadow-[0_6px_18px_rgba(229,9,20,0.4)]',
  held: 'bg-gradient-to-br from-[#F59E0B] to-[#B45309] border-[#9A4F00] text-[#1C1204] cursor-not-allowed',
  booked: 'bg-gradient-to-b from-[#2B2E33] to-[#1C1F24] border-[#101216] text-[#6B7280] cursor-not-allowed',
}

const SEAT_BASE =
  'h-6 w-full rounded-md border text-[10px] font-extrabold tabular-nums transition select-none ' +
  'hover:brightness-110 active:translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ' +
  'disabled:active:translate-y-0 disabled:hover:brightness-100'

export function SeatGrid({ rows, cols, aislesAfter, seats, selection, warn, onSeatClick, priceOf }: SeatGridProps) {
  const templateColumns = useMemo(() => {
    const parts: string[] = ['28px']
    cols.forEach((c) => {
      parts.push('38px')
      if (aislesAfter.includes(c)) parts.push('26px')
    })
    parts.push('28px')
    return parts.join(' ')
  }, [cols, aislesAfter])

  const visualOf = (cell: SeatCell | undefined): SeatVisual => {
    if (!cell) return 'available'
    if (selection.has(cell.code)) return 'selected'
    return cell.status
  }

  const seatClassName = (zone: SeatZone, visual: SeatVisual) =>
    `${SEAT_BASE} ${visual === 'available' ? ZONE_AVAILABLE[zone] : VISUAL_STATE[visual]}`

  const renderWarn = (code: string): ReactNode =>
    warn?.code === code ? (
      <div
        key={`warn-${warn.key}`}
        className="absolute bottom-full left-1/2 z-50 mb-2 -translate-x-1/2 rounded-lg border border-primary bg-[#0E0F12] px-2.5 py-1.5 text-xs font-bold whitespace-nowrap text-white shadow-elevated"
        role="alert"
      >
        {warn.message}
      </div>
    ) : null

  const shakeStyle = (code: string) =>
    warn?.code === code ? { animation: 'dcine-seat-shake .25s' } : undefined

  const headerCells = (key: string): ReactNode[] => {
    const cells: ReactNode[] = [<div key={`${key}-sl`} aria-hidden="true" />]
    cols.forEach((c) => {
      cells.push(
        <div key={`${key}-c${c}`} className="flex h-6 items-center justify-center text-xs font-extrabold text-[#CFCFCF]">
          {c}
        </div>,
      )
      if (aislesAfter.includes(c)) {
        cells.push(
          <div key={`${key}-a${c}`} className="flex items-center justify-center text-[8px] tracking-widest text-[#8b949e]">
            {key === 'head' ? 'AISLE' : ''}
          </div>,
        )
      }
    })
    cells.push(<div key={`${key}-sr`} aria-hidden="true" />)
    return cells
  }

  const rowLabel = (r: string, side: string): ReactNode => (
    <div key={`${r}-lbl-${side}`} className="flex items-center justify-center text-xs font-black text-[#CFCFCF]">
      {r}
    </div>
  )

  const aisleCell = (r: string, c: number): ReactNode => <div key={`${r}-aisle-${c}`} aria-hidden="true" />

  const renderRow = (r: string): ReactNode[] => {
    const cells: ReactNode[] = [rowLabel(r, 'l')]

    for (let i = 0; i < cols.length; i++) {
      const col = cols[i]
      const code = `${r}${col}`
      const cell = seats[code]
      const zone = cell?.zone ?? 'standard'

      // Ghế đôi: cột lẻ ghép với cột chẵn kế tiếp, render thành 1 nút rộng gấp đôi.
      const pairCode = `${r}${col + 1}`
      const pairCell = seats[pairCode]
      const canJoinPair =
        zone === 'couple' && col % 2 === 1 && !aislesAfter.includes(col) && pairCell?.zone === 'couple'

      if (canJoinPair && cell && pairCell) {
        const visuals = [visualOf(cell), visualOf(pairCell)]
        const visual: SeatVisual = visuals.includes('booked')
          ? 'booked'
          : visuals.includes('selected')
            ? 'selected'
            : visuals.includes('held')
              ? 'held'
              : 'available'
        const label = couplePairLabel(code)
        cells.push(
          <div key={code} className="relative" style={{ gridColumn: 'span 2' }}>
            {renderWarn(code)}
            <button
              type="button"
              className={seatClassName('couple', visual)}
              style={shakeStyle(code)}
              disabled={visual === 'booked'}
              aria-selected={visual === 'selected'}
              aria-label={`Ghế đôi ${label}`}
              title={`${label} • Ghế đôi (Couple) • ${formatVnd(priceOf('couple', 'adult'))}/ghế`}
              onClick={(e) => onSeatClick(code, e.currentTarget.getBoundingClientRect())}
            >
              {`${col}-${col + 1}`}
            </button>
          </div>,
        )
        i++ // bỏ qua ghế bên phải của cặp
        if (aislesAfter.includes(col + 1)) cells.push(aisleCell(r, col + 1))
        continue
      }

      const visual = visualOf(cell)
      cells.push(
        <div key={code} className="relative">
          {renderWarn(code)}
          <button
            type="button"
            className={seatClassName(zone, visual)}
            style={shakeStyle(code)}
            disabled={visual === 'booked' || visual === 'held'}
            aria-selected={visual === 'selected'}
            aria-label={`Ghế ${code} — ${zone}`}
            title={`${code} • ${zone.toUpperCase()} • Người lớn ${formatVnd(priceOf(zone, 'adult'))} / Trẻ em ${formatVnd(priceOf(zone, 'child'))}`}
            onClick={(e) => onSeatClick(code, e.currentTarget.getBoundingClientRect())}
          >
            {col}
          </button>
        </div>,
      )
      if (aislesAfter.includes(col)) cells.push(aisleCell(r, col))
    }

    cells.push(rowLabel(r, 'r'))
    return cells
  }

  return (
    <div className="overflow-x-auto pb-2">
      <style>{`@keyframes dcine-seat-shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-3px)}50%{transform:translateX(3px)}75%{transform:translateX(-2px)}}`}</style>
      <div
        role="grid"
        aria-label="Sơ đồ ghế"
        className="mx-auto grid w-fit gap-2 px-2"
        style={{ gridTemplateColumns: templateColumns }}
      >
        {headerCells('head')}
        {rows.map((r) => renderRow(r))}
        {headerCells('foot')}
      </div>
    </div>
  )
}
