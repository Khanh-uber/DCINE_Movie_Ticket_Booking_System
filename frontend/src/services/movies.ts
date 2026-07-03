import { http } from '@/lib/http'
import type { Comment, HeroSlide, MembershipTier, Movie, Promotion } from '@/types'

function asArray<T>(raw: unknown): T[] {
  if (Array.isArray(raw)) return raw as T[]
  const obj = raw as { data?: T[]; content?: T[] }
  return obj?.data ?? obj?.content ?? []
}

export const moviesApi = {
  async all(): Promise<Movie[]> {
    const res = await http.get('/movies')
    return asArray<Movie>(res.data)
  },
  async nowShowing(): Promise<Movie[]> {
    const res = await http.get('/movies/now')
    return asArray<Movie>(res.data)
  },
  async comingSoon(): Promise<Movie[]> {
    const res = await http.get('/movies/soon')
    return asArray<Movie>(res.data)
  },
  async byId(id: string | number): Promise<Movie> {
    const res = await http.get(`/movies/${id}`)
    const obj = res.data as { data?: Movie }
    return obj?.data ?? (res.data as Movie)
  },
  async hero(): Promise<HeroSlide | null> {
    const res = await http.get('/home/hero')
    const obj = res.data as { data?: HeroSlide }
    return obj?.data ?? (res.data as HeroSlide) ?? null
  },
  async promotions(): Promise<Promotion[]> {
    const res = await http.get('/promotions')
    return asArray<Promotion>(res.data)
  },
  async memberships(): Promise<MembershipTier[]> {
    const res = await http.get('/memberships')
    return asArray<MembershipTier>(res.data)
  },
}

export const commentsApi = {
  async list(movieId: string | number): Promise<Comment[]> {
    const res = await http.get('/comments', { params: { movieId } })
    return asArray<Comment>(res.data)
  },
  async create(movieId: string | number, content: string) {
    const res = await http.post('/comments', { movieId, content })
    return res.data
  },
  async update(id: number, content: string) {
    const res = await http.put(`/comments/${id}`, { content })
    return res.data
  },
  async remove(id: number) {
    await http.delete(`/comments/${id}`)
  },
}
