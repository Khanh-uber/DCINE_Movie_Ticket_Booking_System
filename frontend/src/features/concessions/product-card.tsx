import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatVnd } from '@/lib/format'
import type { ComboVariant } from '@/types'

import { MAX_QTY, type MenuItem, type SetQtyPayload } from './types'

const POSTER_FALLBACK = '/images/poster-placeholder.svg'

export function variantValueOf(variant: ComboVariant | undefined): string {
  if (!variant) return ''
  return String(variant.key ?? variant.label ?? '')
}

interface ProductCardProps {
  item: MenuItem
  getQty: (key: string) => number
  onSetQty: (payload: SetQtyPayload) => void
}

export function ProductCard({ item, getQty, onSetQty }: ProductCardProps) {
  const variants = (item.variants ?? []).filter((v) => variantValueOf(v) !== '')
  const [variantValue, setVariantValue] = useState<string>(() => variantValueOf(variants[0]))

  const activeVariant = variants.find((v) => variantValueOf(v) === variantValue)
  const unitPrice = Number(item.price ?? 0) + Number(activeVariant?.priceDiff ?? 0)
  const variantLabel = activeVariant ? (activeVariant.label ?? variantValue) : ''
  const key = `${item.id}__${variantValue}`
  const qty = getQty(key)

  const setQty = (next: number) => {
    onSetQty({
      item,
      variantValue,
      variantLabel,
      unitPrice,
      qty: Math.max(0, Math.min(MAX_QTY, next)),
    })
  }

  return (
    <Card className="group gap-0 overflow-hidden border-border bg-card py-0 transition hover:-translate-y-1 hover:shadow-red">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <img
          src={item.imageUrl || POSTER_FALLBACK}
          alt={item.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          onError={(e) => {
            e.currentTarget.src = POSTER_FALLBACK
          }}
        />
        {item.tag ? (
          <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground uppercase">
            {item.tag}
          </Badge>
        ) : null}
      </div>

      <CardContent className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="font-display font-semibold leading-snug">{item.title}</h3>
          {item.description ? (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.description}</p>
          ) : null}
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-lg font-bold text-primary">{formatVnd(unitPrice)}</span>
          {item.oldPrice != null && item.oldPrice > 0 ? (
            <span className="text-sm text-muted-foreground line-through">
              {formatVnd(Number(item.oldPrice))}
            </span>
          ) : null}
        </div>

        {variants.length > 0 ? (
          <Select value={variantValue} onValueChange={setVariantValue}>
            <SelectTrigger size="sm" className="w-full" aria-label="Chọn size">
              <SelectValue placeholder="Chọn size" />
            </SelectTrigger>
            <SelectContent>
              {variants.map((v) => {
                const value = variantValueOf(v)
                const diff = Number(v.priceDiff ?? 0)
                return (
                  <SelectItem key={value} value={value}>
                    {v.label ?? value}
                    {diff > 0 ? ` (+${formatVnd(diff)})` : ''}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        ) : null}

        <div className="mt-auto flex items-center justify-between pt-1">
          <span className="text-xs text-muted-foreground">Số lượng</span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label="Giảm"
              disabled={qty <= 0}
              onClick={() => setQty(qty - 1)}
            >
              <Minus />
            </Button>
            <span className="w-8 text-center font-semibold tabular-nums">{qty}</span>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              aria-label="Tăng"
              disabled={qty >= MAX_QTY}
              onClick={() => setQty(qty + 1)}
            >
              <Plus />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
