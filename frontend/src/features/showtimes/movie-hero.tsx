import { Link } from 'react-router-dom'
import { Clock, Film, Info, Play } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import type { Movie } from '@/types'

const POSTER_FALLBACK = '/images/poster-placeholder.svg'

function toYouTubeEmbed(url: string): string {
  try {
    const u = new URL(url)
    let id = ''
    if (u.hostname.includes('youtu.be')) id = u.pathname.slice(1).split('/')[0] ?? ''
    else if (u.pathname.startsWith('/embed/')) return url
    else if (u.pathname.startsWith('/shorts/')) id = u.pathname.split('/')[2] ?? ''
    else id = u.searchParams.get('v') ?? ''
    if (!id) return url
    return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`
  } catch {
    return url
  }
}

export function MovieHeroSkeleton() {
  return (
    <section className="border-b-2 border-primary">
      <div className="container mx-auto flex max-w-7xl items-end gap-8 px-4 pb-6 pt-10">
        <Skeleton className="hidden h-[255px] w-[170px] rounded-md md:block" />
        <div className="flex-1 space-y-4">
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-9 w-2/3" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-12" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-40" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-9 w-32 rounded-full" />
            <Skeleton className="h-9 w-36 rounded-full" />
          </div>
        </div>
      </div>
    </section>
  )
}

export function MovieHero({ movie }: { movie: Movie }) {
  const poster = movie.posterUrl || POSTER_FALLBACK
  const backdrop = movie.backdropUrl || movie.posterUrl
  const genres = movie.genres ?? []

  return (
    <section className="relative overflow-hidden border-b-2 border-primary">
      {/* Blurred backdrop */}
      <div className="absolute inset-0">
        {backdrop && (
          <div
            className="absolute inset-0 scale-110 bg-cover blur-[5px] brightness-[0.3]"
            style={{ backgroundImage: `url('${backdrop}')`, backgroundPosition: 'center 20%' }}
            aria-hidden="true"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" aria-hidden="true" />
      </div>

      <div className="container relative mx-auto flex max-w-7xl items-end gap-8 px-4 pb-6 pt-10">
        <img
          src={poster}
          alt={`Poster ${movie.title}`}
          className="hidden h-[255px] w-[170px] shrink-0 rounded-md border-2 border-gold object-cover shadow-elevated md:block"
          onError={(e) => {
            const img = e.currentTarget
            if (!img.src.endsWith(POSTER_FALLBACK)) img.src = POSTER_FALLBACK
          }}
        />

        <div className="min-w-0 flex-1">
          <nav aria-label="Breadcrumb" className="mb-2 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
            <Link to="/" className="transition hover:text-foreground">Trang chủ</Link>
            <span>/</span>
            <Link to="/movies" className="transition hover:text-foreground">Phim</Link>
            <span>/</span>
            <Link to={`/movies/${movie.id}`} className="max-w-48 truncate transition hover:text-foreground">
              {movie.title}
            </Link>
            <span>/</span>
            <span className="text-foreground">Lịch chiếu</span>
          </nav>

          <h1 className="font-display text-3xl font-extrabold uppercase leading-tight drop-shadow-[2px_2px_0_#000] md:text-4xl">
            {movie.title}
          </h1>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge className="bg-primary font-extrabold text-white">{movie.rated || 'T13'}</Badge>
            <Badge variant="outline" className="gap-1.5 border-white/20 bg-white/10 text-foreground">
              <Clock className="size-3.5" />
              {movie.durationMinutes ? `${movie.durationMinutes} phút` : '--'}
            </Badge>
            <Badge variant="outline" className="gap-1.5 border-white/20 bg-white/10 text-foreground">
              <Film className="size-3.5" />
              {genres.length ? genres.join(', ') : '--'}
            </Badge>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {movie.trailerUrl && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="rounded-full border-white/60 bg-transparent hover:bg-white hover:text-black">
                    <Play className="size-4" />
                    Xem trailer
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl border-border bg-black p-0 sm:max-w-3xl">
                  <DialogTitle className="sr-only">Trailer {movie.title}</DialogTitle>
                  <div className="aspect-video w-full overflow-hidden rounded-lg">
                    <iframe
                      src={toYouTubeEmbed(movie.trailerUrl)}
                      title={`Trailer ${movie.title}`}
                      className="h-full w-full"
                      allow="autoplay; encrypted-media; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </DialogContent>
              </Dialog>
            )}
            <Button
              asChild
              variant="outline"
              className="rounded-full border-white/30 bg-transparent text-muted-foreground hover:border-primary hover:bg-primary/10 hover:text-primary"
            >
              <Link to={`/movies/${movie.id}`}>
                <Info className="size-4" />
                Chi tiết phim
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
