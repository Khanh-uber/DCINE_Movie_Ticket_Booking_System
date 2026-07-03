import { ArrowLeft, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { formatVnd } from '@/lib/format'
import type { ConcessionCartItem } from '@/types'

import type { Totals } from './types'

interface CartPanelProps {
  cart: ConcessionCartItem[]
  totals: Totals
  onRemove: (key: string) => void
  onBack: () => void
  onCheckout: () => void
}

export function CartPanel({ cart, totals, onRemove, onBack, onCheckout }: CartPanelProps) {
  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="font-display uppercase">Tổng cộng</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="mb-2 text-sm font-semibold text-muted-foreground">Món đã chọn</p>
          {cart.length === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa chọn món nào.</p>
          ) : (
            <ul className="space-y-3">
              {cart.map((item) => (
                <li key={item.key} className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="truncate text-sm font-medium">{item.title}</span>
                      {item.variantLabel ? (
                        <Badge variant="secondary" className="text-[10px]">
                          {item.variantLabel}
                        </Badge>
                      ) : null}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {item.qty} × {formatVnd(item.unitPrice)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <span className="text-sm font-semibold">{formatVnd(item.lineTotal)}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-xs"
                      aria-label={`Xoá ${item.title}`}
                      className="text-muted-foreground hover:text-primary"
                      onClick={() => onRemove(item.key)}
                    >
                      <Trash2 />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <Separator />

        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Tiền vé</span>
            <span className="font-medium">{formatVnd(totals.ticketAmount)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Bắp nước & combo</span>
            <span className="font-medium">{formatVnd(totals.combosAmount)}</span>
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <span className="font-semibold">Tổng cộng (vé + bắp nước)</span>
          <span className="text-lg font-bold text-primary">{formatVnd(totals.grandTotal)}</span>
        </div>

        <div className="space-y-2 pt-1">
          <Button type="button" size="lg" className="w-full" onClick={onCheckout}>
            Tiếp tục thanh toán
          </Button>
          <Button type="button" size="lg" variant="outline" className="w-full" onClick={onBack}>
            <ArrowLeft />
            Quay lại chọn ghế
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
