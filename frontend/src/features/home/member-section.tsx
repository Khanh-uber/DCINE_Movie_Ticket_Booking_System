import { Link } from 'react-router-dom'
import { Check, Crown } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { formatVnd } from '@/lib/format'
import { useAuth } from '@/features/auth/auth-store'

type TierKey = 'STANDARD' | 'SILVER' | 'GOLD'

interface TierInfo {
  key: TierKey
  label: string
  min: number
  discountPercent: number
  perks: string[]
  accent: string
  cardBg: string
}

const TIERS: TierInfo[] = [
  {
    key: 'STANDARD',
    label: 'Standard',
    min: 0,
    discountPercent: 0,
    perks: ['Hạng thành viên mặc định', 'Tích lũy điểm chi tiêu để thăng hạng'],
    accent: 'text-muted-foreground',
    cardBg: 'from-zinc-800/60 to-zinc-900/60',
  },
  {
    key: 'SILVER',
    label: 'Silver',
    min: 1_000_000,
    discountPercent: 5,
    perks: ['Đạt mốc chi tiêu 1.000.000đ', 'GIẢM 5% trên tổng hóa đơn'],
    accent: 'text-slate-300',
    cardBg: 'from-slate-500/25 to-zinc-900/70',
  },
  {
    key: 'GOLD',
    label: 'Gold',
    min: 3_000_000,
    discountPercent: 10,
    perks: ['Đạt mốc chi tiêu 3.000.000đ', 'GIẢM 10% trên tổng hóa đơn'],
    accent: 'text-gold',
    cardBg: 'from-tier-gold-1/25 to-zinc-900/70',
  },
]

function resolveTierKey(tierName: string | undefined, totalSpending: number): TierKey {
  const normalized = (tierName ?? '').trim().toUpperCase()
  if (normalized === 'SILVER' || normalized === 'GOLD' || normalized === 'STANDARD') return normalized
  if (totalSpending >= 3_000_000) return 'GOLD'
  if (totalSpending >= 1_000_000) return 'SILVER'
  return 'STANDARD'
}

function LoyaltyProgress({ tierKey, totalSpending }: { tierKey: TierKey; totalSpending: number }) {
  const nextTier = tierKey === 'STANDARD' ? TIERS[1] : tierKey === 'SILVER' ? TIERS[2] : null

  if (!nextTier) {
    return (
      <div className="space-y-2">
        <Progress value={100} />
        <p className="text-sm text-muted-foreground">
          Bạn đang hưởng mức giảm giá cao nhất (<b className="text-gold">10%</b>)!
        </p>
      </div>
    )
  }

  const percent = Math.min(100, (totalSpending / nextTier.min) * 100)
  const remain = Math.max(0, nextTier.min - totalSpending)

  return (
    <div className="space-y-2">
      <Progress value={percent} />
      <p className="text-sm text-muted-foreground">
        Bạn cần chi thêm <b className="text-gold">{formatVnd(remain)}</b> để lên hạng{' '}
        <b className="text-foreground">{nextTier.label}</b> (Giảm {nextTier.discountPercent}%)
      </p>
    </div>
  )
}

export function MemberSection() {
  const { isAuthenticated, user } = useAuth()
  const totalSpending = user?.totalSpending ?? 0
  const currentTierKey = isAuthenticated ? resolveTierKey(user?.membershipTierName, totalSpending) : null
  const currentTier = TIERS.find((t) => t.key === currentTierKey)

  return (
    <section id="member" className="scroll-mt-20 py-10">
      <div className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-primary">D-cine Loyalty</div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <h2 className="border-l-4 border-primary pl-3 font-display text-xl font-bold uppercase tracking-wide md:text-2xl">
          Thành viên D-cine
        </h2>
      </div>
      <p className="mb-8 max-w-2xl text-sm text-muted-foreground md:text-base">
        Tích lũy chi tiêu để lên hạng và được giảm trực tiếp trên tổng hóa đơn. Hạng càng cao, ưu đãi càng lớn.
      </p>

      {/* Loyalty summary / CTA */}
      <Card className="mb-8 border-border/60 bg-card p-5 md:p-6">
        {isAuthenticated && currentTier ? (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Hạng hiện tại</div>
                <div className={`font-display text-2xl font-bold ${currentTier.accent}`}>{currentTier.label}</div>
              </div>
              <div className="text-right">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Chi tiêu tích lũy</div>
                <div className="font-display text-2xl font-bold text-foreground">{formatVnd(totalSpending)}</div>
              </div>
            </div>
            <LoyaltyProgress tierKey={currentTier.key} totalSpending={totalSpending} />
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="font-display text-lg font-semibold">Trở thành thành viên D-cine ngay hôm nay</div>
              <p className="mt-1 text-sm text-muted-foreground">
                Đăng ký để tích điểm, lên hạng và nhận ưu đãi giảm giá trên mỗi hóa đơn.
              </p>
            </div>
            <Button asChild className="font-display font-semibold uppercase tracking-wide shadow-red">
              <Link to="/signup">Đăng ký thành viên</Link>
            </Button>
          </div>
        )}
      </Card>

      {/* Tier cards */}
      <div className="grid gap-5 md:grid-cols-3">
        {TIERS.map((tier) => {
          const isCurrent = tier.key === currentTierKey
          return (
            <Card
              key={tier.key}
              className={`relative gap-0 overflow-hidden border-border/60 bg-gradient-to-br p-6 transition duration-300 hover:-translate-y-1 hover:shadow-elevated ${tier.cardBg} ${
                isCurrent ? 'border-primary/70 shadow-red' : ''
              }`}
            >
              {isCurrent && (
                <Badge className="absolute right-4 top-4 bg-primary font-semibold">Hạng của bạn</Badge>
              )}
              <Crown className={`mb-4 size-8 ${tier.accent}`} />
              <h3 className={`font-display text-2xl font-bold uppercase ${tier.accent}`}>{tier.label}</h3>
              <div className="mt-1 text-sm text-muted-foreground">
                {tier.min === 0 ? 'Mức khởi điểm' : `Cần tích lũy ${formatVnd(tier.min)}`}
              </div>
              <ul className="mt-5 space-y-2.5">
                {tier.perks.map((perk) => (
                  <li key={perk} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-success" />
                    <span>{perk}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )
        })}
      </div>
    </section>
  )
}
