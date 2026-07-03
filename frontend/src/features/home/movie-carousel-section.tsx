import { useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { MovieCard } from '@/components/shared/movie-card'
import { moviesApi } from '@/services/movies'
import type { Movie } from '@/types'

interface MovieCarouselSectionProps {
  id?: string
  title: string
  viewAllHref: string
  queryKey: string
  fetcher: () => Promise<Movie[]>
}

// 2 cards visible on mobile → up to 6 on large screens (gap-4 = 1rem).
const ITEM_WIDTH =
  'w-[calc((100%-1rem)/2)] sm:w-[calc((100%-2rem)/3)] md:w-[calc((100%-3rem)/4)] lg:w-[calc((100%-4rem)/5)] xl:w-[calc((100%-5rem)/6)]'

export function MovieCarouselSection({ id, title, viewAllHref, queryKey, fetcher }: MovieCarouselSectionProps) {
  const railRef = useRef<HTMLDivElement>(null)

  const { data: movies, isLoading, isError } = useQuery({
    queryKey: ['home', queryKey],
    queryFn: fetcher,
    retry: 1,
  })

  function scrollByDir(dir: -1 | 1) {
    const rail = railRef.current
    if (!rail) return
    rail.scrollBy({ left: dir * rail.clientWidth * 0.8, behavior: 'smooth' })
  }

  return (
    <section id={id} className="scroll-mt-20 py-10">
      <div className="mb-6 flex items-center justify-between gap-4">
        <h2 className="border-l-4 border-primary pl-3 font-display text-xl font-bold uppercase tracking-wide md:text-2xl">
          {title}
        </h2>
        <Link
          to={viewAllHref}
          className="shrink-0 text-sm font-medium text-muted-foreground transition hover:text-primary"
        >
          Xem tất cả phim →
        </Link>
      </div>

      {isLoading ? (
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className={`shrink-0 ${ITEM_WIDTH}`}>
              <Skeleton className="aspect-[2/3] w-full rounded-xl" />
              <Skeleton className="mt-3 h-4 w-3/4" />
              <Skeleton className="mt-2 h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Không tải được dữ liệu</p>
      ) : !movies || movies.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">Chưa có phim nào.</p>
      ) : (
        <div className="group/carousel relative">
          <div
            ref={railRef}
            className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {movies.map((movie) => (
              <div key={movie.id} className={`shrink-0 snap-start ${ITEM_WIDTH}`}>
                <MovieCard movie={movie} />
              </div>
            ))}
          </div>

          <Button
            variant="secondary"
            size="icon"
            aria-label="Cuộn sang trái"
            onClick={() => scrollByDir(-1)}
            className="absolute -left-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-border bg-black/70 shadow-elevated backdrop-blur transition hover:bg-primary"
          >
            <ChevronLeft className="size-5" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            aria-label="Cuộn sang phải"
            onClick={() => scrollByDir(1)}
            className="absolute -right-3 top-1/2 z-10 -translate-y-1/2 rounded-full border border-border bg-black/70 shadow-elevated backdrop-blur transition hover:bg-primary"
          >
            <ChevronRight className="size-5" />
          </Button>
        </div>
      )}
    </section>
  )
}

export function NowShowingSection() {
  return (
    <MovieCarouselSection
      id="bigscreen"
      title="Đang công chiếu"
      viewAllHref="/movies?status=now"
      queryKey="now-showing"
      fetcher={() => moviesApi.nowShowing()}
    />
  )
}

export function ComingSoonSection() {
  return (
    <MovieCarouselSection
      id="coming"
      title="Sắp ra mắt"
      viewAllHref="/movies?status=soon"
      queryKey="coming-soon"
      fetcher={() => moviesApi.comingSoon()}
    />
  )
}
