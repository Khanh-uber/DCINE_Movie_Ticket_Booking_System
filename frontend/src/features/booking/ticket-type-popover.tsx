import { useEffect } from 'react'
import type { TicketType } from '@/types'
import { formatVnd } from '@/lib/format'
import { Button } from '@/components/ui/button'
import type { PopoverState } from './use-seat-selection'

interface TicketTypePopoverProps {
  popover: PopoverState
  adultPrice: number
  childPrice: number
  onPick: (type: TicketType) => void
  onClose: () => void
}

const POPOVER_WIDTH = 260

/** Popover nhỏ neo vào ghế vừa bấm để chọn loại vé (Người lớn / Trẻ em). */
export function TicketTypePopover({ popover, adultPrice, childPrice, onPick, onClose }: TicketTypePopoverProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const half = POPOVER_WIDTH / 2
  const left = Math.min(Math.max(popover.anchor.x, half + 12), window.innerWidth - half - 12)
  // Ưu tiên hiện phía trên ghế; nếu sát mép trên thì hiện phía dưới.
  const showBelow = popover.anchor.top < 220
  const positionStyle = showBelow
    ? { left, top: popover.anchor.bottom + 10, transform: 'translateX(-50%)' }
    : { left, top: popover.anchor.top - 10, transform: 'translate(-50%, -100%)' }

  return (
    <div className="fixed inset-0 z-[60]" role="presentation">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Chọn vé cho ghế ${popover.label}`}
        className="absolute grid gap-2 rounded-xl border border-border bg-card p-4 shadow-elevated"
        style={{ width: POPOVER_WIDTH, ...positionStyle }}
      >
        <h3 className="font-display text-sm font-bold text-foreground">
          Chọn vé cho ghế {popover.label}{' '}
          <span className="text-muted-foreground uppercase">({popover.zone})</span>
        </h3>
        {popover.codes.length > 1 && (
          <p className="text-xs text-muted-foreground">Ghế đôi — loại vé áp dụng cho cả 2 ghế.</p>
        )}
        <Button
          variant="outline"
          className="w-full justify-center border-primary text-primary hover:bg-primary hover:text-white"
          onClick={() => onPick('adult')}
        >
          Người lớn ({formatVnd(adultPrice)})
        </Button>
        <Button className="w-full justify-center" onClick={() => onPick('child')}>
          Trẻ em ({formatVnd(childPrice)})
        </Button>
        <Button variant="secondary" className="w-full justify-center" onClick={onClose}>
          Hủy
        </Button>
      </div>
    </div>
  )
}
