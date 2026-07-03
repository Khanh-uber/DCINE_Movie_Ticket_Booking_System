import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

const POSTER_FALLBACK = '/images/poster-placeholder.svg'

interface MovieInfoCardProps {
  posterUrl?: string
  title: string
  metaLine?: string
  theater: string
  dateLabel: string
  timeLabel: string
  format: string
  backHref: string
}

/** Cột trái: thẻ thông tin phim + suất chiếu. */
export function MovieInfoCard({
  posterUrl,
  title,
  metaLine,
  theater,
  dateLabel,
  timeLabel,
  format,
  backHref,
}: MovieInfoCardProps) {
  return (
    <aside className="h-fit overflow-hidden rounded-lg border border-border bg-card shadow-elevated">
      <div className="aspect-[2/3] w-full bg-black">
        <img
          src={posterUrl || POSTER_FALLBACK}
          alt={`Poster phim ${title}`}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.src = POSTER_FALLBACK
          }}
        />
      </div>

      <div className="grid gap-3 p-4">
        <h1 className="font-display line-clamp-2 text-center text-xl font-black text-primary uppercase">
          {title || '—'}
        </h1>
        {metaLine && <p className="text-center text-sm font-semibold text-[#DADDE2]">{metaLine}</p>}

        <div className="grid gap-2 rounded-md border border-border bg-background/60 p-3 text-sm">
          <div className="grid grid-cols-[90px_1fr] items-center">
            <span className="text-muted-foreground">Rạp:</span>
            <strong className="text-foreground">{theater || 'D-Cine'}</strong>
          </div>
          <div className="grid grid-cols-[90px_1fr] items-center">
            <span className="text-muted-foreground">Ngày:</span>
            <strong className="text-foreground">{dateLabel || '--/--/----'}</strong>
          </div>
          <div className="grid grid-cols-[90px_1fr] items-center">
            <span className="text-muted-foreground">Suất:</span>
            <strong className="text-foreground">{timeLabel || '--:--'}</strong>
          </div>
          <div className="grid grid-cols-[90px_1fr] items-center">
            <span className="text-muted-foreground">Định dạng:</span>
            <span>
              <Badge variant="outline" className="border-primary/60 font-bold text-primary">
                {format || '2D'}
              </Badge>
            </span>
          </div>
        </div>

        <Link
          to={backHref}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-primary/70 bg-black/40 px-4 text-xs font-semibold tracking-wider text-muted-foreground uppercase transition hover:bg-primary/10 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại lịch chiếu
        </Link>
      </div>
    </aside>
  )
}
