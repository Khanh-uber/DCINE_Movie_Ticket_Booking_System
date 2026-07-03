// Tier helpers mirrored from frontend_2/assets/js/profile.js (3 hạng: Standard, Silver, Gold).

export type TierTheme = 'STANDARD' | 'SILVER' | 'GOLD'

export function tierThemeOf(name?: string | null): TierTheme {
  const raw = (name || 'Standard').toUpperCase()
  if (raw.includes('GOLD')) return 'GOLD'
  if (raw.includes('SILVER')) return 'SILVER'
  return 'STANDARD'
}

export const TIER_LABELS: Record<TierTheme, string> = {
  STANDARD: 'Standard',
  SILVER: 'Silver',
  GOLD: 'Gold',
}

export const TIER_RANK: Record<TierTheme, number> = {
  STANDARD: 0,
  SILVER: 1,
  GOLD: 2,
}

export const TIER_CONFIG: Record<
  TierTheme,
  { min: number; next: TierTheme | null; target: number | null }
> = {
  STANDARD: { min: 0, next: 'SILVER', target: 1_000_000 },
  SILVER: { min: 1_000_000, next: 'GOLD', target: 3_000_000 },
  GOLD: { min: 3_000_000, next: null, target: null },
}

/** Badge classes per tier: Standard gray, Silver plat gradient, Gold gold gradient. */
export const TIER_BADGE_CLASS: Record<TierTheme, string> = {
  STANDARD: 'bg-secondary text-secondary-foreground',
  SILVER: 'bg-gradient-to-r from-tier-plat-1 to-tier-plat-2 text-black',
  GOLD: 'bg-gradient-to-r from-tier-gold-1 to-tier-gold-2 text-black',
}

/** Overrides the shadcn Progress indicator color per tier. */
export const TIER_PROGRESS_CLASS: Record<TierTheme, string> = {
  STANDARD: '[&>[data-slot=progress-indicator]]:bg-muted-foreground',
  SILVER: '[&>[data-slot=progress-indicator]]:bg-tier-plat-1',
  GOLD: '[&>[data-slot=progress-indicator]]:bg-tier-gold-1',
}

export const TIER_TEXT_CLASS: Record<TierTheme, string> = {
  STANDARD: 'text-muted-foreground',
  SILVER: 'text-tier-plat-1',
  GOLD: 'text-tier-gold-1',
}

export const TIER_AVATAR_RING_CLASS: Record<TierTheme, string> = {
  STANDARD: 'ring-muted-foreground/60',
  SILVER: 'ring-tier-plat-1',
  GOLD: 'ring-tier-gold-1',
}
