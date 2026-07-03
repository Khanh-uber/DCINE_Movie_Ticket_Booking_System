import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { CalendarDays, Clock, Play, Popcorn, Star, Ticket, TriangleAlert } from 'lucide-react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate } from '@/lib/format'
import { getApiErrorMessage } from '@/lib/http'
import { moviesApi } from '@/services/movies'
import type { Movie } from '@/types'
import { MovieComments } from './movie-comments'

/** Backend variants not covered by the shared Movie type. */
type MovieDetail = Omit<Movie, 'director' | 'cast'> & {
  director?: string | Array<string | { name?: string; fullName?: string }>
  cast?: Array<string | { name?: string; fullName?: string; avatarUrl?: string; castUrl?: string }>
  duration?: number | string
  synopsis?: string
}

function personName(p: string | { name?: string; fullName?: string } | null | undefined): string {
  if (!p) return ''
  if (typeof p === 'string') return p
  return p.name || p.fullName || ''
}

function directorNames(m: MovieDetail): string {
  if (Array.isArray(m.director)) return m.director.map(personName).filter(Boolean).join(', ')
  return m.director || ''
}

function formatDuration(m: MovieDetail): string {
  const raw = m.durationMinutes ?? m.duration
  if (raw == null || raw === '') return ''
  const s = String(raw).trim()
  if (!/^\d+$/.test(s)) return s
  const mins = Number(s)
  const h = Math.floor(mins / 60)
  const rest = mins % 60
  if (h && rest) return `${h}h ${rest}m`
  if (h) return `${h}h`
  return `${rest}m`
}

function statusLabel(status?: string): string {
  if (status === 'now') return 'Đang chiếu'
  if (status === 'soon') return 'Sắp chiếu'
  if (status === 'ended') return 'Ngừng chiếu'
  return status || ''
}

/** Convert youtube watch?v= / youtu.be links to an embeddable URL. */
function toEmbedUrl(url: string): string {
  try {
    const u = new URL(url)
    if (u.hostname.includes('youtu.be')) {
      return `https://www.youtube.com/embed${u.pathname}?autoplay=1`
    }
    if (u.pathname.startsWith('/embed/')) return url
    const v = u.searchParams.get('v')
    if (v) return `https://www.youtube.com/embed/${v}?autoplay=1`
  } catch {
    // not a valid URL, fall through
  }
  return url
}

function initials(name?: string): string {
  if (!name) return '?'
  return name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
}

function DetailSkeleton() {
  return (
    <div>
      <div className="relative overflow-hidden border-b border-border/60 bg-card">
        <div className="container mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 md:flex-row md:items-end">
          <Skeleton className="aspect-[2/3] w-44 shrink-0 rounded-xl md:w-56" />
          <div className="flex-1 space-y-4">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-5 w-1/2" />
            <div className="flex gap-3">
              <Skeleton className="h-11 w-36" />
              <Skeleton className="h-11 w-36" />
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto max-w-7xl space-y-4 px-4 py-10">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  )
}

export default function MovieDetailPage() {
  const { id = '' } = useParams<{ id: string }>()
  const [trailerOpen, setTrailerOpen] = useState(false)

  const movieQuery = useQuery({
    queryKey: ['movie', id],
    queryFn: () => moviesApi.byId(id),
    enabled: !!id,
  })

  if (movieQuery.isLoading) return <DetailSkeleton />

  if (movieQuery.isError || !movieQuery.data) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-16">
        <div className="rounded-xl border border-border bg-card py-16 text-center text-muted-foreground">
          {getApiErrorMessage(movieQuery.error, 'Không tìm thấy thông tin phim.')}
        </div>
        <div className="mt-6 text-center">
          <Button variant="outline" asChild>
            <Link to="/movies">Quay lại danh sách phim</Link>
          </Button>
        </div>
      </div>
    )
  }

  const movie = movieQuery.data as MovieDetail
  const backdrop = movie.backdropUrl || movie.posterUrl || ''
  const year = (movie.releaseDate || '').slice(0, 4)
  const genres = Array.isArray(movie.genres) ? movie.genres.join(', ') : ''
  const duration = formatDuration(movie)
  const description = movie.description || movie.synopsis || ''
  const director = directorNames(movie)
  const cast = Array.isArray(movie.cast) ? movie.cast.slice(0, 12) : []

  const facts: Array<{ label: string; value: string }> = [
    { label: 'Tên gốc', value: movie.originalTitle || '' },
    { label: 'Ngày khởi chiếu', value: movie.releaseDate ? formatDate(movie.releaseDate) : '' },
    { label: 'Trạng thái', value: statusLabel(movie.status) },
    { label: 'Thời lượng', value: duration },
    { label: 'Thể loại', value: genres },
    { label: 'Phân loại', value: movie.rated || '' },
    { label: 'Đánh giá', value: movie.rating != null ? `${Number(movie.rating).toFixed(1)}/10` : '' },
  ]

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border/60">
        {backdrop && (
          <div
            className="absolute inset-0 scale-110 bg-cover bg-center blur-md"
            style={{ backgroundImage: `url('${backdrop}')` }}
            aria-hidden
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/85 to-background/60" aria-hidden />

        <div className="container relative mx-auto max-w-7xl px-4 py-10">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
            <Link to="/" className="transition hover:text-primary">
              Trang chủ
            </Link>
            <span>/</span>
            <Link to="/movies" className="transition hover:text-primary">
              Phim
            </Link>
            <span>/</span>
            <span className="line-clamp-1 text-foreground">{movie.title}</span>
          </nav>

          <div className="flex flex-col gap-8 md:flex-row md:items-end">
            <img
              src={movie.posterUrl || '/images/poster-placeholder.svg'}
              alt={movie.title}
              className="aspect-[2/3] w-44 shrink-0 rounded-xl border border-border/60 object-cover shadow-elevated md:w-56"
            />
            <div className="flex-1">
              <h1 className="font-display text-3xl font-bold uppercase md:text-4xl">{movie.title}</h1>
              {movie.originalTitle && movie.originalTitle !== movie.title && (
                <p className="mt-1 text-muted-foreground">{movie.originalTitle}</p>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-foreground/90">
                {year && (
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="size-4 text-primary" /> {year}
                  </span>
                )}
                {genres && (
                  <span className="flex items-center gap-1.5">
                    <Popcorn className="size-4 text-primary" /> {genres}
                  </span>
                )}
                {duration && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="size-4 text-primary" /> {duration}
                  </span>
                )}
                {movie.rated && (
                  <Badge className="bg-primary font-semibold">
                    <TriangleAlert className="size-3" /> {movie.rated}
                  </Badge>
                )}
                {movie.rating != null && (
                  <span className="flex items-center gap-1.5 font-semibold">
                    <Star className="size-4 fill-gold text-gold" /> {Number(movie.rating).toFixed(1)}
                  </span>
                )}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button size="lg" className="font-semibold uppercase shadow-red" asChild>
                  <Link to={`/showtimes?movie=${movie.id}`}>
                    <Ticket className="size-5" /> Mua vé
                  </Link>
                </Button>
                {movie.trailerUrl && (
                  <Button size="lg" variant="outline" onClick={() => setTrailerOpen(true)}>
                    <Play className="size-5" /> Xem trailer
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INFO */}
      <div className="container mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-10 lg:grid-cols-[2fr_1fr]">
          <div>
            <section>
              <h2 className="mb-4 font-display text-xl font-bold uppercase">
                <span className="mr-2 inline-block h-5 w-1 translate-y-0.5 rounded bg-primary" aria-hidden />
                Nội dung phim
              </h2>
              <p className="whitespace-pre-line leading-relaxed text-foreground/90">{description || '—'}</p>

              <ul className="mt-6 space-y-2 text-sm">
                <li>
                  <span className="font-semibold">Ngôn ngữ:</span>{' '}
                  <span className="text-muted-foreground">{movie.language || '—'}</span>
                </li>
                <li>
                  <span className="font-semibold">Đạo diễn:</span>{' '}
                  <span className="text-muted-foreground">{director || '—'}</span>
                </li>
              </ul>
            </section>

            {cast.length > 0 && (
              <section className="mt-10">
                <h2 className="mb-4 font-display text-xl font-bold uppercase">
                  <span className="mr-2 inline-block h-5 w-1 translate-y-0.5 rounded bg-primary" aria-hidden />
                  Diễn viên
                </h2>
                <div className="flex flex-wrap gap-x-6 gap-y-4">
                  {cast.map((actor, i) => {
                    const name = personName(actor)
                    const avatar = typeof actor === 'string' ? undefined : actor.avatarUrl || actor.castUrl
                    return (
                      <div key={`${name}-${i}`} className="flex w-20 flex-col items-center gap-2 text-center">
                        <Avatar className="size-16 border border-border/60">
                          <AvatarImage src={avatar || undefined} alt={name} className="object-cover" />
                          <AvatarFallback>{initials(name)}</AvatarFallback>
                        </Avatar>
                        <span className="line-clamp-2 text-xs text-foreground/90">{name}</span>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}
          </div>

          <aside>
            <div className="rounded-xl border border-border/60 bg-card p-6">
              <h3 className="mb-4 font-display text-lg font-bold uppercase">Thông tin phim</h3>
              <dl className="space-y-3 text-sm">
                {facts.map(({ label, value }) => (
                  <div key={label} className="flex items-start justify-between gap-4 border-b border-border/40 pb-3 last:border-b-0 last:pb-0">
                    <dt className="shrink-0 text-muted-foreground">{label}</dt>
                    <dd className="text-right font-medium">{value || '—'}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </aside>
        </div>

        <MovieComments movieId={movie.id} />
      </div>

      {/* TRAILER DIALOG */}
      <Dialog open={trailerOpen} onOpenChange={setTrailerOpen}>
        <DialogContent className="max-w-3xl border-border/60 p-4 sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Trailer — {movie.title}</DialogTitle>
          </DialogHeader>
          {trailerOpen && movie.trailerUrl && (
            <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
              <iframe
                src={toEmbedUrl(movie.trailerUrl)}
                title={`Trailer ${movie.title}`}
                className="size-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
