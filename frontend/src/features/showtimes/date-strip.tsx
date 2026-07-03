import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { DAY_NAMES, pad, todayYmd } from './normalize'

const PAGE_SIZE = 7

interface DateStripProps {
  dates: string[]
  selectedDate: string
  onSelect: (ymd: string) => void
}

export function DateStrip({ dates, selectedDate, onSelect }: DateStripProps) {
  const [page, setPage] = useState(0)
  const today = todayYmd()
  const maxPage = Math.max(0, Math.ceil(dates.length / PAGE_SIZE) - 1)
  const pageDates = dates.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)

  const navClass =
    'flex h-16 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-foreground transition hover:border-primary hover:text-primary'

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label="7 ngày trước"
        className={cn(navClass, page === 0 && 'invisible')}
        onClick={() => setPage((p) => Math.max(0, p - 1))}
      >
        <ChevronLeft className="size-5" />
      </button>

      <div className="flex flex-1 gap-2 overflow-x-auto pb-1 pt-1">
        {pageDates.map((ymd) => {
          const [y, m, d] = ymd.split('-').map(Number)
          const day = new Date(y, m - 1, d)
          const active = ymd === selectedDate
          return (
            <button
              key={ymd}
              type="button"
              onClick={() => onSelect(ymd)}
              className={cn(
                'flex h-16 min-w-[88px] flex-1 flex-col items-center justify-center gap-0.5 rounded-lg border transition',
                active
                  ? 'border-primary bg-primary text-white shadow-red'
                  : 'border-border bg-card hover:-translate-y-0.5 hover:border-primary',
              )}
            >
              <span className="text-xs uppercase opacity-80">{ymd === today ? 'Hôm nay' : DAY_NAMES[day.getDay()]}</span>
              <span className="font-display text-lg font-extrabold">
                {pad(day.getDate())}/{pad(day.getMonth() + 1)}
              </span>
            </button>
          )
        })}
      </div>

      <button
        type="button"
        aria-label="7 ngày sau"
        className={cn(navClass, page >= maxPage && 'invisible')}
        onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
      >
        <ChevronRight className="size-5" />
      </button>
    </div>
  )
}
