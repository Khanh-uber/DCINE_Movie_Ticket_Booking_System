import { useQuery } from '@tanstack/react-query'
import { Copy, TicketPercent } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate } from '@/lib/format'
import { moviesApi } from '@/services/movies'
import type { Promotion } from '@/types'

async function copyCode(code: string) {
  try {
    await navigator.clipboard.writeText(code)
    toast.success('Đã sao chép mã')
  } catch {
    toast.error('Không thể sao chép mã')
  }
}

function PromoCard({ promo }: { promo: Promotion }) {
  return (
    <Card className="group gap-0 overflow-hidden border-border/60 bg-card py-0 transition duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-red">
      {promo.imageUrl ? (
        <div className="relative aspect-[16/7] overflow-hidden">
          <img
            src={promo.imageUrl}
            alt={promo.title || 'Ưu đãi'}
            loading="lazy"
            className="size-full object-cover transition duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" aria-hidden />
        </div>
      ) : (
        <div className="flex aspect-[16/7] items-center justify-center bg-gradient-to-br from-primary/25 via-card to-card">
          <TicketPercent className="size-12 text-primary/70" />
        </div>
      )}

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <Badge variant="secondary" className="shrink-0 bg-primary/15 text-primary">
            Voucher thành viên
          </Badge>
          {promo.expiredAt && (
            <span className="text-xs text-muted-foreground">HSD: {formatDate(promo.expiredAt)}</span>
          )}
        </div>

        <h3 className="line-clamp-2 font-display font-semibold leading-snug">{promo.title || 'Ưu đãi D-cine'}</h3>
        {promo.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{promo.description}</p>
        )}

        {promo.code && (
          <div className="mt-auto flex items-center justify-between gap-2 rounded-lg border border-dashed border-primary/50 bg-primary/5 px-3 py-2">
            <code className="font-mono text-sm font-bold tracking-widest text-primary">{promo.code}</code>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-primary"
              onClick={() => void copyCode(promo.code!)}
            >
              <Copy className="size-3.5" />
              Sao chép
            </Button>
          </div>
        )}
      </div>
    </Card>
  )
}

export function DealsSection() {
  const { data: promotions, isLoading, isError } = useQuery({
    queryKey: ['home', 'promotions'],
    queryFn: () => moviesApi.promotions(),
    retry: 1,
  })

  return (
    <section id="deals" className="scroll-mt-20 py-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="border-l-4 border-primary pl-3 font-display text-xl font-bold uppercase tracking-wide md:text-2xl">
          Ưu đãi hấp dẫn
        </h2>
      </div>

      {isLoading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[16/7] w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Không tải được dữ liệu</p>
      ) : !promotions || promotions.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Hiện chưa có ưu đãi nào.</p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {promotions.map((promo) => (
            <PromoCard key={promo.id} promo={promo} />
          ))}
        </div>
      )}
    </section>
  )
}
