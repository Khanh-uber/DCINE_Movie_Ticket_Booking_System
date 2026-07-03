import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Camera, CheckCircle2, Crown, LogOut, Medal, User } from 'lucide-react'
import { toast } from 'sonner'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatVnd } from '@/lib/format'
import { getApiErrorMessage } from '@/lib/http'
import { authApi } from '@/services/auth'
import { moviesApi } from '@/services/movies'
import { profileApi } from '@/services/profile'
import { authStore } from '@/features/auth/auth-store'

import { InfoTab } from './info-tab'
import { PasswordTab } from './password-tab'
import { TicketsTab } from './tickets-tab'
import { VouchersTab } from './vouchers-tab'
import {
  TIER_AVATAR_RING_CLASS,
  TIER_BADGE_CLASS,
  TIER_CONFIG,
  TIER_PROGRESS_CLASS,
  TIER_TEXT_CLASS,
  tierThemeOf,
  type TierTheme,
} from './tier'

const TAB_VALUES = ['info', 'password', 'tickets', 'vouchers'] as const
type TabValue = (typeof TAB_VALUES)[number]

const TIER_ICONS: Record<TierTheme, typeof User> = {
  STANDARD: User,
  SILVER: Medal,
  GOLD: Crown,
}

function HeaderSkeleton() {
  return (
    <div className="flex flex-col items-center gap-6 rounded-2xl border border-border bg-card p-6 sm:flex-row sm:p-8">
      <Skeleton className="size-24 rounded-full" />
      <div className="w-full flex-1 space-y-3">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-4 w-56" />
      </div>
    </div>
  )
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab') as TabValue | null
  const tab: TabValue = tabParam && TAB_VALUES.includes(tabParam) ? tabParam : 'info'

  const profileQuery = useQuery({ queryKey: ['profile', 'me'], queryFn: profileApi.me })
  const bookingsQuery = useQuery({ queryKey: ['profile', 'bookings'], queryFn: profileApi.bookings })
  const promotionsQuery = useQuery({ queryKey: ['promotions'], queryFn: moviesApi.promotions })

  const profile = profileQuery.data

  // Sync the freshly loaded profile back into the auth store (header display fields).
  useEffect(() => {
    if (!profile) return
    authStore.updateUser({
      fullName: profile.fullName,
      avatarUrl: profile.avatarUrl,
      totalSpending: profile.totalSpending,
      membershipTierName: profile.membershipTierName,
      loyaltyPoints: profile.loyaltyPoints,
    })
  }, [profile])

  // Avatar: local preview only (no upload endpoint yet — mirrors the old page).
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const handleAvatarFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarPreview(URL.createObjectURL(file))
    toast.info('Tính năng tải ảnh sẽ sớm ra mắt')
  }

  const [loggingOut, setLoggingOut] = useState(false)
  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await authApi.logout()
    } catch {
      // best-effort — clear the session locally regardless
    }
    authStore.clearSession()
    navigate('/')
  }

  const handleTabChange = (value: string) => {
    const next = new URLSearchParams(searchParams)
    next.set('tab', value)
    setSearchParams(next, { replace: true })
  }

  const tier = tierThemeOf(profile?.membershipTierName)
  const TierIcon = TIER_ICONS[tier]
  const config = TIER_CONFIG[tier]
  const spend = profile?.totalSpending ?? 0

  let percent = 100
  let remain = 0
  if (config.next && config.target != null) {
    remain = Math.max(0, config.target - spend)
    percent = 0
    if (spend >= config.min) {
      const range = config.target - config.min
      percent = range > 0 ? Math.min(100, ((spend - config.min) / range) * 100) : 100
    }
  }

  const displayName = profile?.fullName || 'Chưa đặt tên'
  const avatarSrc = avatarPreview || profile?.avatarUrl || undefined
  const initial = (displayName.trim().charAt(0) || 'U').toUpperCase()

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      {/* ===== Header card ===== */}
      {profileQuery.isLoading ? (
        <HeaderSkeleton />
      ) : profileQuery.isError ? (
        <div className="rounded-2xl border border-border bg-card py-16 text-center text-muted-foreground">
          {getApiErrorMessage(profileQuery.error, 'Không tải được hồ sơ của bạn.')}
        </div>
      ) : (
        <div className="relative flex flex-col items-center gap-6 overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-elevated sm:flex-row sm:items-center sm:p-8">
          {/* Avatar */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className={`block rounded-full ring-3 ring-offset-2 ring-offset-card transition hover:opacity-90 ${TIER_AVATAR_RING_CLASS[tier]}`}
              aria-label="Đổi ảnh đại diện"
            >
              <Avatar className="size-24">
                <AvatarImage src={avatarSrc} alt={displayName} />
                <AvatarFallback className="bg-secondary text-3xl font-bold">
                  {initial}
                </AvatarFallback>
              </Avatar>
            </button>
            <span className="pointer-events-none absolute right-0 bottom-0 flex size-8 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground">
              <Camera className="size-4" />
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleAvatarFile}
            />
          </div>

          {/* Name + tier + progress */}
          <div className="w-full min-w-0 flex-1 text-center sm:text-left">
            <h1 className="truncate font-display text-2xl font-bold">{displayName}</h1>
            <div className="text-sm text-muted-foreground">@{profile?.username || 'user'}</div>
            <Badge className={`mt-2 uppercase ${TIER_BADGE_CLASS[tier]}`}>
              <TierIcon /> {tier} member
            </Badge>

            <div className="mt-4 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Chi tiêu:{' '}
                  <b className={TIER_TEXT_CLASS[tier]}>{formatVnd(spend)}</b>
                </span>
                <span>
                  Mục tiêu:{' '}
                  <b className="text-foreground">
                    {config.target != null ? formatVnd(config.target) : 'MAX'}
                  </b>
                </span>
              </div>
              <Progress value={percent} className={`bg-muted ${TIER_PROGRESS_CLASS[tier]}`} />
              <div className="text-xs text-muted-foreground">
                {config.next ? (
                  <>
                    Chi tiêu thêm{' '}
                    <b className={TIER_TEXT_CLASS[tier]}>{formatVnd(remain)}</b> để lên hạng{' '}
                    <b className="text-foreground capitalize">{config.next.toLowerCase()}</b>
                  </>
                ) : (
                  <span className="inline-flex items-center gap-1 text-success">
                    <CheckCircle2 className="size-3.5" /> Bạn đang ở hạng cao nhất
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Logout */}
          <Button
            variant="destructive"
            onClick={handleLogout}
            disabled={loggingOut}
            className="shrink-0"
          >
            <LogOut /> Đăng xuất
          </Button>
        </div>
      )}

      {/* ===== Tabs ===== */}
      <Tabs value={tab} onValueChange={handleTabChange} className="mt-8">
        <TabsList className="w-full justify-start overflow-x-auto sm:w-auto">
          <TabsTrigger value="info">Thông tin cá nhân</TabsTrigger>
          <TabsTrigger value="password">Đổi mật khẩu</TabsTrigger>
          <TabsTrigger value="tickets">Vé của tôi</TabsTrigger>
          <TabsTrigger value="vouchers">Voucher</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-6">
          {profileQuery.isLoading ? (
            <div className="space-y-4 rounded-xl border border-border bg-card p-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-9 w-full" />
              ))}
            </div>
          ) : profile ? (
            <InfoTab key={profileQuery.dataUpdatedAt} profile={profile} />
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-card/50 py-10 text-center text-sm text-muted-foreground">
              Không tải được thông tin cá nhân.
            </div>
          )}
        </TabsContent>

        <TabsContent value="password" className="mt-6">
          <PasswordTab />
        </TabsContent>

        <TabsContent value="tickets" className="mt-6">
          <TicketsTab
            bookings={bookingsQuery.data ?? []}
            isLoading={bookingsQuery.isLoading}
            errorMessage={
              bookingsQuery.isError
                ? getApiErrorMessage(bookingsQuery.error, 'Không tải được danh sách vé.')
                : undefined
            }
          />
        </TabsContent>

        <TabsContent value="vouchers" className="mt-6">
          <VouchersTab
            promotions={promotionsQuery.data ?? []}
            userTier={tier}
            isLoading={promotionsQuery.isLoading}
            errorMessage={
              promotionsQuery.isError
                ? getApiErrorMessage(promotionsQuery.error, 'Không tải được danh sách ưu đãi.')
                : undefined
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
