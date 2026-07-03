/**
 * Normalization helpers mirroring frontend_2/assets/js/showtime.js.
 * The backend may answer with camelCase, snake_case or the legacy nested
 * `dates -> formats -> times` shape — everything is flattened here.
 */

import type { CinemaLocation, Province, ShowtimeSlot, Theater } from '@/types'

// ---------- date utils ----------

export const DAY_NAMES = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'] as const

export function pad(n: number): string {
  return String(n).padStart(2, '0')
}

export function toLocalYmd(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function todayYmd(): string {
  return toLocalYmd(new Date())
}

/** dd/MM/yyyy for the summary panel. */
export function formatYmdVn(ymd: string): string {
  const [y, m, d] = ymd.split('-')
  if (!y || !m || !d) return ymd
  return `${d}/${m}/${y}`
}

// ---------- flat showtime slots ----------

export interface FlatSlot {
  id: string
  theaterId: string
  theaterName?: string
  movieId: string
  /** yyyy-MM-dd (local) */
  date: string
  /** HH:mm */
  time: string
  /** HH:mm or null */
  endTime: string | null
  /** ISO start (passed to /seat-map) */
  startAt: string
  endAt: string | null
  format: string
}

interface RawTimeObj {
  id?: string | number
  time?: string
}

interface RawFormatBlock {
  label?: string
  format?: string
  times?: (string | RawTimeObj)[]
}

interface RawDateBlock {
  date?: string
  formats?: RawFormatBlock[]
}

/** Superset of ShowtimeSlot covering every shape the old app handled. */
interface RawSlot {
  id?: string | number
  showtime_id?: string | number
  movieId?: string | number
  movie?: string | number
  movie_id?: string | number
  theaterId?: string | number
  theater?: string | number
  theater_id?: string | number
  theaterName?: string
  startAt?: string
  start_at?: string
  endAt?: string
  end_at?: string
  format?: string
  roomType?: string
  room_type?: string
  dates?: RawDateBlock[]
}

export function normalizeShowtimes(raw: ShowtimeSlot[], movieId?: string | null): FlatSlot[] {
  const out: FlatSlot[] = []

  for (const item of raw as unknown as RawSlot[]) {
    const mId = String(item.movieId ?? item.movie ?? item.movie_id ?? '').trim()
    // Filter by movie up-front, like the old normalizer.
    if (movieId && mId && String(movieId) !== mId) continue

    const tId = String(item.theaterId ?? item.theater ?? item.theater_id ?? '').trim()
    if (!tId) continue
    const theaterName = item.theaterName

    const nested = item.dates
    if (Array.isArray(nested) && nested.length) {
      // Legacy nested JSON: dates -> formats -> times
      for (const block of nested) {
        const date = String(block.date ?? '').slice(0, 10)
        if (!date) continue
        for (const fmt of block.formats ?? []) {
          const label = fmt.label ?? fmt.format ?? '2D'
          for (const t of fmt.times ?? []) {
            const time = typeof t === 'object' ? String(t.time ?? '') : String(t)
            if (!time) continue
            const id =
              typeof t === 'object' && t.id != null
                ? String(t.id)
                : `mock-${tId}-${date}-${time.replace(':', '')}`
            out.push({
              id,
              theaterId: tId,
              theaterName,
              movieId: mId,
              date,
              time,
              endTime: null,
              startAt: `${date}T${time}:00`,
              endAt: null,
              format: label,
            })
          }
        }
      }
    } else if (item.startAt || item.start_at) {
      // Flat DB rows with ISO start/end
      const startAt = (item.startAt ?? item.start_at)!
      const start = new Date(startAt)
      if (Number.isNaN(start.getTime())) continue
      const endAt = item.endAt ?? item.end_at ?? null
      const end = endAt ? new Date(endAt) : null
      const endValid = end != null && !Number.isNaN(end.getTime())
      out.push({
        id: String(item.id ?? item.showtime_id ?? ''),
        theaterId: tId,
        theaterName,
        movieId: mId,
        date: toLocalYmd(start),
        time: `${pad(start.getHours())}:${pad(start.getMinutes())}`,
        endTime: endValid ? `${pad(end.getHours())}:${pad(end.getMinutes())}` : null,
        startAt,
        endAt: endValid ? endAt : null,
        format: item.format ?? item.roomType ?? item.room_type ?? '2D',
      })
    }
  }

  return out.filter((s) => s.id)
}

/** A slot today whose start time is within now + 10 minutes is not sellable. */
export function isPastSlot(slot: FlatSlot, bufferMinutes = 10): boolean {
  if (slot.date !== todayYmd()) return false
  const [h, m] = slot.time.split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return false
  const now = new Date()
  return h * 60 + m < now.getHours() * 60 + now.getMinutes() + bufferMinutes
}

// ---------- provinces / locations / theaters ----------

interface RawProvince {
  id?: string | number
  province_id?: string | number
  name?: string
  province_name?: string
}

interface RawLocation {
  id?: string | number
  location_id?: string | number
  name?: string
  city_name?: string
  provinceId?: string | number
  province_id?: string | number
  pid?: string | number
  address?: string
}

interface RawTheater {
  id?: string | number
  theater_id?: string | number
  name?: string
  address?: string
  locationId?: string | number
  location_id?: string | number
}

export function provIdOf(p: Province): string {
  const r = p as RawProvince
  return String(r.id ?? r.province_id ?? '')
}

export function provNameOf(p: Province): string {
  const r = p as RawProvince
  return r.name ?? r.province_name ?? 'Khác'
}

export function locIdOf(l: CinemaLocation): string {
  const r = l as RawLocation
  return String(r.id ?? r.location_id ?? '')
}

export function locNameOf(l: CinemaLocation): string {
  const r = l as RawLocation
  return r.name ?? r.city_name ?? 'Khác'
}

export function locProvinceIdOf(l: CinemaLocation): string {
  const r = l as RawLocation
  const v = r.provinceId ?? r.province_id ?? r.pid
  return v != null ? String(v) : ''
}

export interface NormTheater {
  id: string
  name: string
  address: string
  locationId: string | null
  provinceId: string | null
  locationName: string
}

/** Map theaters to their location + province, mirroring normTheaters(). */
export function normalizeTheaters(theaters: Theater[], locations: CinemaLocation[]): NormTheater[] {
  return (theaters as unknown as RawTheater[])
    .map((t) => {
      const locId = t.locationId ?? t.location_id
      const loc = locations.find((l) => locIdOf(l) === String(locId ?? ''))
      return {
        id: String(t.id ?? t.theater_id ?? ''),
        name: t.name ?? 'Rạp DCINE',
        address: t.address ?? (loc as RawLocation | undefined)?.address ?? '',
        locationId: locId != null ? String(locId) : null,
        provinceId: loc ? locProvinceIdOf(loc) || null : null,
        locationName: loc ? locNameOf(loc) : 'Khác',
      }
    })
    .filter((t) => t.id)
}
