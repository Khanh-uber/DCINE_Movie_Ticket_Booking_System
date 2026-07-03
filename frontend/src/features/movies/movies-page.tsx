import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MovieCard } from '@/components/shared/movie-card'
import { getApiErrorMessage } from '@/lib/http'
import { removeAccents } from '@/lib/format'
import { moviesApi } from '@/services/movies'
import type { Movie } from '@/types'

const PER_PAGE = 12

/** Backend sometimes returns director as a list of people and extra title fields. */
type LooseMovie = Movie & {
  director?: string | Array<string | { name?: string; fullName?: string }>
  cast?: Array<string | { name?: string; fullName?: string; avatarUrl?: string }>
}

function personName(p: string | { name?: string; fullName?: string } | null | undefined): string {
  if (!p) return ''
  if (typeof p === 'string') return p
  return p.name || p.fullName || ''
}

function matchesQuery(movie: Movie, keyword: string): boolean {
  const m = movie as LooseMovie
  const director = Array.isArray(m.director)
    ? m.director.map(personName).join(' ')
    : m.director
  const cast = Array.isArray(m.cast) ? m.cast.map(personName).join(' ') : ''
  const bag = [
    m.title,
    m.originalTitle,
    director,
    cast,
    Array.isArray(m.genres) ? m.genres.join(' ') : '',
    Array.isArray(m.tags) ? m.tags.join(' ') : '',
  ]
    .filter(Boolean)
    .join(' ')
    .trim()
  if (!bag) return false
  return removeAccents(bag).includes(keyword)
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number
  totalPages: number
  onChange: (page: number) => void
}) {
  if (totalPages <= 1) return null
  return (
    <nav className="mt-10 flex flex-wrap items-center justify-center gap-2" aria-label="Phân trang">
      <Button
        variant="outline"
        size="icon"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        aria-label="Trang trước"
      >
        <ChevronLeft />
      </Button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
        <Button
          key={n}
          variant={n === page ? 'default' : 'outline'}
          size="icon"
          onClick={() => onChange(n)}
          aria-current={n === page ? 'page' : undefined}
        >
          {n}
        </Button>
      ))}
      <Button
        variant="outline"
        size="icon"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        aria-label="Trang sau"
      >
        <ChevronRight />
      </Button>
    </nav>
  )
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="aspect-[2/3] w-full rounded-xl" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-8 w-full" />
        </div>
      ))}
    </div>
  )
}

export default function MoviesPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const q = (searchParams.get('q') ?? '').trim()
  const status: 'now' | 'soon' = searchParams.get('status') === 'soon' ? 'soon' : 'now'
  const isSearch = q.length > 0

  const nowQuery = useQuery({ queryKey: ['movies', 'now'], queryFn: moviesApi.nowShowing })
  const soonQuery = useQuery({ queryKey: ['movies', 'soon'], queryFn: moviesApi.comingSoon })

  const [page, setPage] = useState(1)
  useEffect(() => {
    setPage(1)
  }, [q, status])

  const list = useMemo(() => {
    const now = nowQuery.data ?? []
    const soon = soonQuery.data ?? []
    if (isSearch) {
      const keyword = removeAccents(q)
      return [...now, ...soon].filter((m) => matchesQuery(m, keyword))
    }
    return status === 'soon' ? soon : now
  }, [isSearch, q, status, nowQuery.data, soonQuery.data])

  const totalPages = Math.max(1, Math.ceil(list.length / PER_PAGE))
  const safePage = Math.min(page, totalPages)
  const pageItems = list.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE)

  const isLoading = nowQuery.isLoading || soonQuery.isLoading
  const isError = isSearch
    ? nowQuery.isError && soonQuery.isError
    : status === 'soon'
      ? soonQuery.isError
      : nowQuery.isError
  const errorMessage = getApiErrorMessage(
    (status === 'soon' ? soonQuery.error : nowQuery.error) ?? soonQuery.error ?? nowQuery.error,
    'Không tải được danh sách phim.',
  )

  const handleTabChange = (value: string) => {
    const next = new URLSearchParams(searchParams)
    next.set('status', value === 'soon' ? 'soon' : 'now')
    setSearchParams(next)
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-2 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link to="/" className="transition hover:text-primary">
          Trang chủ
        </Link>
        <span>/</span>
        <span className="text-foreground">Phim</span>
      </nav>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-2xl font-bold uppercase md:text-3xl">
          {isSearch ? (
            <>
              Kết quả tìm kiếm cho <span className="text-primary">“{q}”</span>
            </>
          ) : (
            <>
              <span className="mr-2 inline-block h-6 w-1.5 translate-y-0.5 rounded bg-primary" aria-hidden />
              Phim
            </>
          )}
        </h1>

        {!isSearch && (
          <Tabs value={status} onValueChange={handleTabChange}>
            <TabsList>
              <TabsTrigger value="now">Đang chiếu</TabsTrigger>
              <TabsTrigger value="soon">Sắp chiếu</TabsTrigger>
            </TabsList>
          </Tabs>
        )}
      </div>

      {isLoading ? (
        <GridSkeleton />
      ) : isError ? (
        <div className="rounded-xl border border-border bg-card py-16 text-center text-muted-foreground">
          {errorMessage}
        </div>
      ) : pageItems.length === 0 ? (
        <div className="rounded-xl border border-border bg-card py-16 text-center text-muted-foreground">
          Không tìm thấy phim phù hợp.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {pageItems.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
          <Pagination
            page={safePage}
            totalPages={totalPages}
            onChange={(p) => {
              setPage(p)
              window.scrollTo({ top: 0, behavior: 'smooth' })
            }}
          />
        </>
      )}
    </div>
  )
}
