import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowRight, MapPin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { getApiErrorMessage } from '@/lib/http'
import { STORAGE_KEYS, readJson, writeJson } from '@/lib/storage'
import { cn } from '@/lib/utils'
import { useAuth } from '@/features/auth/auth-store'
import { catalogApi, showtimesApi } from '@/services/showtimes'
import { moviesApi } from '@/services/movies'
import { DateStrip } from './date-strip'
import { MovieHero, MovieHeroSkeleton } from './movie-hero'
import {
  formatYmdVn,
  isPastSlot,
  locIdOf,
  locNameOf,
  locProvinceIdOf,
  normalizeShowtimes,
  normalizeTheaters,
  provIdOf,
  provNameOf,
  toLocalYmd,
  todayYmd,
  type FlatSlot,
  type NormTheater,
} from './normalize'

const DAYS_RANGE = 21 // 3 weeks of day-cards, 7 per view

interface SelectedShowtime {
  slot: FlatSlot
  theaterName: string
  movieTitle: string
}

interface TheaterGroup {
  theaterId: string
  name: string
  address: string
  formats: { format: string; slots: FlatSlot[] }[]
}

function buildTheaterGroups(slots: FlatSlot[], theaterById: Map<string, NormTheater>): TheaterGroup[] {
  const byTheater = new Map<string, FlatSlot[]>()
  for (const slot of slots) {
    const list = byTheater.get(slot.theaterId) ?? []
    list.push(slot)
    byTheater.set(slot.theaterId, list)
  }

  return [...byTheater.entries()]
    .map(([theaterId, list]) => {
      const theater = theaterById.get(theaterId)
      const byFormat = new Map<string, FlatSlot[]>()
      for (const slot of list) {
        const key = slot.format || '2D'
        const fmtList = byFormat.get(key) ?? []
        fmtList.push(slot)
        byFormat.set(key, fmtList)
      }
      const formats = [...byFormat.entries()]
        .map(([format, fmtSlots]) => ({
          format,
          slots: [...fmtSlots].sort((a, b) => a.time.localeCompare(b.time)),
        }))
        .sort((a, b) => a.format.localeCompare(b.format))
      return {
        theaterId,
        name: theater?.name ?? list[0].theaterName ?? `Rạp #${theaterId}`,
        address: theater?.address ?? '',
        formats,
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name, 'vi'))
}

export default function ShowtimePage() {
  const [searchParams] = useSearchParams()
  const movieId = searchParams.get('movie')
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const [provinceId, setProvinceId] = useState<string | null>(() =>
    readJson<string>(STORAGE_KEYS.showtimeProvince),
  )
  const [locationId, setLocationId] = useState<string>(
    () => readJson<string>(STORAGE_KEYS.showtimeLocation) ?? 'all',
  )
  const [selectedDate, setSelectedDate] = useState(() => todayYmd())
  const [selected, setSelected] = useState<SelectedShowtime | null>(null)

  const provincesQuery = useQuery({ queryKey: ['provinces'], queryFn: catalogApi.provinces })
  const locationsQuery = useQuery({ queryKey: ['locations'], queryFn: catalogApi.locations })
  const theatersQuery = useQuery({ queryKey: ['theaters'], queryFn: catalogApi.theaters })

  const movieQuery = useQuery({
    queryKey: ['movie', movieId],
    queryFn: () => moviesApi.byId(movieId!),
    enabled: !!movieId,
  })
  const moviesQuery = useQuery({
    queryKey: ['movies'],
    queryFn: moviesApi.all,
    enabled: !movieId,
  })

  const showtimesQuery = useQuery({
    queryKey: ['showtimes', movieId ?? 'all', provinceId ?? ''],
    queryFn: () =>
      showtimesApi.search({
        ...(movieId ? { movie: movieId } : {}),
        ...(provinceId ? { province: provinceId } : {}),
      }),
    enabled: provinceId != null || provincesQuery.isError,
  })

  // Default province: "Hồ Chí Minh" if found, otherwise the first one.
  useEffect(() => {
    const provinces = provincesQuery.data
    if (provinceId || !provinces?.length) return
    const hcm = provinces.find((p) => provNameOf(p).includes('Hồ Chí Minh'))
    setProvinceId(provIdOf(hcm ?? provinces[0]))
  }, [provincesQuery.data, provinceId])

  const filteredLocations = useMemo(() => {
    if (!provinceId || !locationsQuery.data) return []
    return locationsQuery.data.filter((l) => locProvinceIdOf(l) === provinceId)
  }, [locationsQuery.data, provinceId])

  // A stale stored location that no longer belongs to the province falls back to "Tất cả".
  useEffect(() => {
    if (locationId === 'all' || !locationsQuery.data || !provinceId) return
    if (!filteredLocations.some((l) => locIdOf(l) === locationId)) setLocationId('all')
  }, [filteredLocations, locationId, locationsQuery.data, provinceId])

  const slots = useMemo(
    () => normalizeShowtimes(showtimesQuery.data ?? [], movieId),
    [showtimesQuery.data, movieId],
  )
  const theaters = useMemo(
    () => normalizeTheaters(theatersQuery.data ?? [], locationsQuery.data ?? []),
    [theatersQuery.data, locationsQuery.data],
  )
  const theaterById = useMemo(() => new Map(theaters.map((t) => [t.id, t])), [theaters])
  const movieTitleById = useMemo(() => {
    const map = new Map<string, string>()
    for (const m of moviesQuery.data ?? []) map.set(String(m.id), m.title)
    return map
  }, [moviesQuery.data])

  const dates = useMemo(() => {
    const start = new Date()
    return Array.from({ length: DAYS_RANGE }, (_, i) => {
      const d = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)
      return toLocalYmd(d)
    })
  }, [])

  // Slots for the selected date, restricted to the chosen province/location.
  const daySlots = useMemo(() => {
    return slots.filter((s) => {
      if (s.date !== selectedDate) return false
      const theater = theaterById.get(s.theaterId)
      if (locationId !== 'all') return theater?.locationId === locationId
      // Province filter (server already filters; only drop confirmed mismatches).
      if (provinceId && theater?.provinceId && theater.provinceId !== provinceId) return false
      return true
    })
  }, [slots, selectedDate, theaterById, locationId, provinceId])

  // Group by movie (all-movies mode) then by theater; single movie -> one group.
  const movieGroups = useMemo(() => {
    if (movieId) {
      return [{ movieId, title: '', groups: buildTheaterGroups(daySlots, theaterById) }]
    }
    const byMovie = new Map<string, FlatSlot[]>()
    for (const slot of daySlots) {
      const key = slot.movieId || '?'
      const list = byMovie.get(key) ?? []
      list.push(slot)
      byMovie.set(key, list)
    }
    return [...byMovie.entries()]
      .map(([id, list]) => ({
        movieId: id,
        title: movieTitleById.get(id) ?? `Phim #${id}`,
        groups: buildTheaterGroups(list, theaterById),
      }))
      .sort((a, b) => a.title.localeCompare(b.title, 'vi'))
  }, [daySlots, movieId, movieTitleById, theaterById])

  const scheduleLoading =
    showtimesQuery.isLoading ||
    theatersQuery.isLoading ||
    locationsQuery.isLoading ||
    provincesQuery.isLoading ||
    (!movieId && moviesQuery.isLoading)

  function handleProvinceChange(id: string) {
    if (id === provinceId) return
    setProvinceId(id)
    setLocationId('all')
    writeJson(STORAGE_KEYS.showtimeProvince, id)
    writeJson(STORAGE_KEYS.showtimeLocation, 'all')
    setSelected(null)
  }

  function handleLocationChange(id: string) {
    if (id === locationId) return
    setLocationId(id)
    writeJson(STORAGE_KEYS.showtimeLocation, id)
    setSelected(null)
  }

  function handleDateChange(ymd: string) {
    setSelectedDate(ymd)
    setSelected(null)
  }

  function handlePickSlot(slot: FlatSlot, theaterName: string, movieTitle: string) {
    setSelected({ slot, theaterName, movieTitle })
  }

  function handleContinue() {
    if (!selected) return
    const s = selected.slot
    const params = new URLSearchParams({ showtimeId: s.id })
    const mv = movieId ?? s.movieId
    if (mv) params.set('movie', String(mv))
    params.set('start', s.startAt)
    params.set('end', s.endAt ?? '')
    if (s.format) params.set('format', s.format)
    const target = `/seat-map?${params.toString()}`
    if (!isAuthenticated) {
      navigate(`/login?next=${encodeURIComponent(target)}`)
      return
    }
    navigate(target)
  }

  const summaryMovie = movieId
    ? movieQuery.data?.title ?? '...'
    : selected?.movieTitle ?? '...'

  return (
    <div className="pb-16">
      {/* ===== Hero (movie mode) / simple breadcrumb ===== */}
      {movieId ? (
        movieQuery.isLoading ? (
          <MovieHeroSkeleton />
        ) : movieQuery.data ? (
          <MovieHero movie={movieQuery.data} />
        ) : (
          <div className="container mx-auto max-w-7xl px-4 pt-6">
            <p className="text-sm text-destructive">
              {getApiErrorMessage(movieQuery.error, 'Không tải được thông tin phim.')}
            </p>
          </div>
        )
      ) : (
        <div className="container mx-auto max-w-7xl px-4 pt-6">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Link to="/" className="transition hover:text-foreground">Trang chủ</Link>
            <span>/</span>
            <span className="text-foreground">Lịch chiếu</span>
          </nav>
          <h1 className="mt-3 font-display text-3xl font-bold uppercase">
            LỊCH <span className="text-primary">CHIẾU</span>
          </h1>
        </div>
      )}

      {/* ===== Layout ===== */}
      <div className="container mx-auto mt-8 grid max-w-7xl gap-8 px-4 lg:grid-cols-[1fr_340px]">
        <div className="min-w-0">
          {/* Toolbar */}
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <h2 className="border-l-4 border-primary pl-3 font-display text-xl font-bold uppercase">
              Lịch chiếu
            </h2>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Khu vực:</span>
                {provincesQuery.isLoading ? (
                  <Skeleton className="h-9 w-44" />
                ) : (
                  <Select value={provinceId ?? undefined} onValueChange={handleProvinceChange}>
                    <SelectTrigger className="w-44">
                      <SelectValue placeholder="Chọn khu vực" />
                    </SelectTrigger>
                    <SelectContent>
                      {(provincesQuery.data ?? []).map((p) => (
                        <SelectItem key={provIdOf(p)} value={provIdOf(p)}>
                          {provNameOf(p)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Vị trí:</span>
                {locationsQuery.isLoading ? (
                  <Skeleton className="h-9 w-44" />
                ) : (
                  <Select value={locationId} onValueChange={handleLocationChange}>
                    <SelectTrigger className="w-44">
                      <SelectValue placeholder="Tất cả" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      {filteredLocations.map((l) => (
                        <SelectItem key={locIdOf(l)} value={locIdOf(l)}>
                          {locNameOf(l)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </div>

          {/* Date strip */}
          <div className="mb-6">
            <DateStrip dates={dates} selectedDate={selectedDate} onSelect={handleDateChange} />
          </div>

          {/* Schedule */}
          {scheduleLoading ? (
            <div className="space-y-5">
              {[0, 1, 2].map((i) => (
                <div key={i} className="rounded-xl border border-border bg-card p-5">
                  <Skeleton className="mb-2 h-5 w-56" />
                  <Skeleton className="mb-5 h-4 w-80" />
                  <div className="flex flex-wrap gap-2.5">
                    {[0, 1, 2, 3].map((j) => (
                      <Skeleton key={j} className="h-9 w-32 rounded-md" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : showtimesQuery.isError ? (
            <div className="rounded-lg border border-dashed border-border p-10 text-center text-sm text-destructive">
              {getApiErrorMessage(showtimesQuery.error, 'Không tải được lịch chiếu.')}
            </div>
          ) : !daySlots.length ? (
            <div className="rounded-lg border border-dashed border-border p-10 text-center italic text-muted-foreground">
              Không có suất chiếu cho ngày này.
            </div>
          ) : (
            <div className="space-y-8">
              {movieGroups.map((mg) => (
                <div key={mg.movieId}>
                  {!movieId && (
                    <Link
                      to={`/showtimes?movie=${mg.movieId}`}
                      className="mb-3 inline-block font-display text-lg font-bold uppercase text-gold transition hover:text-primary"
                    >
                      {mg.title}
                    </Link>
                  )}
                  <div className="space-y-5">
                    {mg.groups.map((th) => (
                      <div key={th.theaterId} className="rounded-xl border border-border bg-card p-5">
                        <div className="mb-4 border-b border-dashed border-border pb-3">
                          <div className="font-semibold text-gold">{th.name}</div>
                          {th.address && (
                            <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                              <MapPin className="size-3.5 text-primary" />
                              {th.address}
                            </div>
                          )}
                        </div>
                        <div className="space-y-3.5">
                          {th.formats.map((fmt) => (
                            <div
                              key={fmt.format}
                              className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[110px_2px_1fr] sm:gap-4"
                            >
                              <div className="w-fit rounded border border-border bg-secondary px-2.5 py-1 text-center text-xs font-semibold sm:w-auto">
                                {fmt.format}
                              </div>
                              <div className="hidden h-8 w-0.5 justify-self-center rounded bg-white/25 sm:block" />
                              <div className="flex flex-wrap gap-2.5">
                                {fmt.slots.map((slot) => {
                                  const past = isPastSlot(slot)
                                  const active = selected?.slot.id === slot.id
                                  const movieTitle = movieId
                                    ? movieQuery.data?.title ?? ''
                                    : mg.title
                                  return (
                                    <button
                                      key={slot.id}
                                      type="button"
                                      disabled={past}
                                      onClick={() => handlePickSlot(slot, th.name, movieTitle)}
                                      className={cn(
                                        'rounded-md border px-4 py-1.5 text-sm font-semibold transition',
                                        active
                                          ? 'border-primary bg-white font-extrabold text-primary shadow-red'
                                          : past
                                            ? 'cursor-not-allowed border-border bg-secondary text-muted-foreground/50 line-through opacity-60'
                                            : 'border-input text-foreground hover:scale-105 hover:border-primary hover:text-primary',
                                      )}
                                    >
                                      {slot.time}
                                      {slot.endTime ? ` - ${slot.endTime}` : ''}
                                    </button>
                                  )
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ===== Summary sidebar ===== */}
        <aside>
          <div className="rounded-xl border border-border border-t-4 border-t-primary bg-card p-6 shadow-elevated lg:sticky lg:top-20">
            <div className="mb-5 border-b border-border pb-3 font-display font-bold uppercase tracking-wide">
              Thông tin đặt vé
            </div>
            <dl className="space-y-4 text-sm">
              <div className="flex items-start justify-between gap-4">
                <dt className="text-muted-foreground">Phim</dt>
                <dd className="max-w-[60%] text-right font-semibold text-gold">{summaryMovie}</dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-muted-foreground">Rạp</dt>
                <dd className="max-w-[60%] text-right font-semibold">{selected?.theaterName ?? '...'}</dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-muted-foreground">Ngày chiếu</dt>
                <dd className="text-right font-semibold">
                  {selected ? formatYmdVn(selected.slot.date) : '...'}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-muted-foreground">Suất chiếu</dt>
                <dd className="text-right font-semibold text-gold">
                  {selected
                    ? selected.slot.endTime
                      ? `${selected.slot.time} - ${selected.slot.endTime}`
                      : selected.slot.time
                    : '...'}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-4">
                <dt className="text-muted-foreground">Định dạng</dt>
                <dd className="text-right font-semibold">{selected?.slot.format ?? '...'}</dd>
              </div>
            </dl>
            <Button
              className="mt-6 w-full font-bold uppercase"
              size="lg"
              disabled={!selected}
              onClick={handleContinue}
            >
              {selected ? (
                <>
                  Tiếp tục
                  <ArrowRight className="size-4" />
                </>
              ) : (
                'Vui lòng chọn suất chiếu'
              )}
            </Button>
          </div>
        </aside>
      </div>
    </div>
  )
}
