import { Link } from 'react-router-dom'
import { Clock, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

import type { Movie } from '@/types'

export function MovieCard({ movie }: { movie: Movie }) {
  return (
    <Card className="group gap-0 overflow-hidden border-border/60 bg-card py-0 transition duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-red">
      <Link to={`/movies/${movie.id}`} className="relative block aspect-[2/3] overflow-hidden">
        <img
          src={movie.posterUrl || '/images/poster-placeholder.svg'}
          alt={movie.title}
          loading="lazy"
          className="size-full object-cover transition duration-500 group-hover:scale-105"
        />
        {movie.rated && (
          <Badge className="absolute left-2 top-2 bg-primary font-semibold" variant="default">
            {movie.rated}
          </Badge>
        )}
        {movie.rating != null && movie.rating > 0 && (
          <Badge variant="secondary" className="absolute right-2 top-2 gap-1 bg-black/70 backdrop-blur">
            <Star className="size-3 fill-gold text-gold" />
            {Number(movie.rating).toFixed(1)}
          </Badge>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
      </Link>
      <div className="space-y-2 p-3">
        <Link to={`/movies/${movie.id}`}>
          <h3 className="line-clamp-1 font-semibold transition group-hover:text-primary">{movie.title}</h3>
        </Link>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {movie.genres && movie.genres.length > 0 && <span className="line-clamp-1">{movie.genres.slice(0, 2).join(', ')}</span>}
          {movie.durationMinutes ? (
            <span className="flex shrink-0 items-center gap-1">
              <Clock className="size-3" /> {movie.durationMinutes}′
            </span>
          ) : null}
        </div>
        <Button size="sm" className="w-full" asChild>
          <Link to={`/showtimes?movie=${movie.id}`}>Đặt vé</Link>
        </Button>
      </div>
    </Card>
  )
}
