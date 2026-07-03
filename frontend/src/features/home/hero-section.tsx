import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Ticket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { moviesApi } from '@/services/movies'

const FALLBACK_BACKDROP = '/images/banners/aespa-dirty-work-5120x2880-32584.jpg'
const FALLBACK_TITLE = 'Trải nghiệm điện ảnh\nđỉnh cao & khác biệt'
const FALLBACK_DESCRIPTION =
  'D-cine không chỉ là rạp chiếu phim, đó là nơi cảm xúc thăng hoa cùng công nghệ hình ảnh sắc nét và âm thanh sống động. Hòa mình vào thế giới điện ảnh chân thực nhất ngay hôm nay.'

export function HeroSection() {
  const { data: slide, isLoading } = useQuery({
    queryKey: ['home', 'hero'],
    queryFn: () => moviesApi.hero(),
    retry: 1,
  })

  if (isLoading) {
    return (
      <section className="relative h-[70vh] min-h-[420px] w-full overflow-hidden bg-card">
        <div className="container mx-auto flex h-full max-w-7xl flex-col justify-center gap-4 px-4">
          <Skeleton className="h-4 w-52" />
          <Skeleton className="h-14 w-full max-w-xl" />
          <Skeleton className="h-14 w-full max-w-md" />
          <Skeleton className="h-4 w-full max-w-lg" />
          <Skeleton className="mt-2 h-11 w-40" />
        </div>
      </section>
    )
  }

  const backdrop = slide?.backdropUrl || FALLBACK_BACKDROP
  const title = slide?.title || FALLBACK_TITLE
  const description = slide?.description || FALLBACK_DESCRIPTION
  const eyebrow = slide?.eyebrow || 'Chào mừng đến với D-cine'

  return (
    <section className="relative h-[70vh] min-h-[420px] w-full overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url('${backdrop}')` }}
        aria-hidden
      />
      {/* Dark gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-black/20" aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/40" aria-hidden />

      <div className="relative z-10 flex h-full items-center">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="max-w-2xl space-y-5">
            <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-primary">
              <span className="h-px w-8 bg-primary" aria-hidden />
              {eyebrow}
            </span>
            <h1 className="whitespace-pre-line font-display text-4xl font-bold uppercase leading-tight text-white drop-shadow-lg md:text-5xl lg:text-6xl">
              {title}
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-white/80 md:text-base">{description}</p>
            <Button asChild size="lg" className="mt-2 gap-2 font-display font-semibold uppercase tracking-wide shadow-red">
              <Link to="/movies?status=now">
                <Ticket className="size-5" />
                Đặt vé ngay
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
