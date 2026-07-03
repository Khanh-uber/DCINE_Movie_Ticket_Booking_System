import { CalendarClock, Copy, TicketPercent } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate, formatVnd } from '@/lib/format'
import type { Promotion } from '@/types'
import { TIER_RANK, tierThemeOf, type TierTheme } from './tier'

function discountText(promo: Promotion): string {
  if (!promo.discountValue) return ''
  const type = (promo.discountType ?? '').toString().toLowerCase()
  const isPercent = type === 'percent' || type === '%'
  return `Giảm ${isPercent ? `${promo.discountValue}%` : formatVnd(promo.discountValue)}`
}

async function copyCode(code: string) {
  try {
    await navigator.clipboard.writeText(code)
    toast.success(`Đã sao chép mã: ${code}`)
  } catch {
    toast.error('Không thể sao chép mã. Vui lòng thử lại.')
  }
}

function VouchersSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-3 rounded-xl border border-border bg-card p-5">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-9 w-full" />
        </div>
      ))}
    </div>
  )
}

export function VouchersTab({
  promotions,
  userTier,
  isLoading,
  errorMessage,
}: {
  promotions: Promotion[]
  userTier: TierTheme
  isLoading: boolean
  errorMessage?: string
}) {
  if (isLoading) return <VouchersSkeleton />
  if (errorMessage) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/50 py-10 text-center text-sm text-muted-foreground">
        {errorMessage}
      </div>
    )
  }

  const userRank = TIER_RANK[userTier]
  // Missing minTier → available to everyone (rank Standard = 0).
  const available = promotions.filter(
    (p) => TIER_RANK[tierThemeOf(p.minTier)] <= userRank,
  )

  if (!available.length) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/50 py-10 text-center text-sm text-muted-foreground">
        Hiện bạn chưa có ưu đãi nào khả dụng.
      </div>
    )
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {available.map((promo) => {
        const code = promo.code ?? ''
        const discount = discountText(promo)
        return (
          <div
            key={String(promo.id)}
            className="flex flex-col rounded-xl border border-border bg-card p-5 transition hover:-translate-y-1 hover:border-primary/40"
          >
            <div className="flex items-center gap-2 font-display font-bold text-primary">
              <TicketPercent className="size-4 shrink-0" />
              {code || promo.title || 'Ưu đãi'}
            </div>
            {promo.title && <div className="mt-1 font-semibold">{promo.title}</div>}
            {discount && <div className="mt-1 text-lg font-bold text-gold">{discount}</div>}
            {promo.description && (
              <p className="mt-1 text-sm text-muted-foreground">{promo.description}</p>
            )}
            {promo.expiredAt && (
              <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarClock className="size-3.5" /> HSD: {formatDate(promo.expiredAt)}
              </div>
            )}
            {code && (
              <div className="mt-3 flex items-center justify-between gap-2 rounded-lg border border-dashed border-border bg-background/60 px-3 py-2">
                <span className="font-mono text-sm font-semibold tracking-widest">{code}</span>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => copyCode(code)}
                  aria-label={`Sao chép mã ${code}`}
                >
                  <Copy />
                </Button>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
