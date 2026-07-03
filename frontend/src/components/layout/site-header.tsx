import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ChevronDown, Search, Ticket } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth, authStore } from '@/features/auth/auth-store'
import { authApi } from '@/services/auth'

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [query, setQuery] = useState('')
  const { isAuthenticated, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function onSearch(e: React.FormEvent) {
    e.preventDefault()
    const q = query.trim()
    navigate(q ? `/movies?q=${encodeURIComponent(q)}` : '/movies')
  }

  async function onLogout() {
    try {
      await authApi.logout()
    } catch {
      // best-effort — clear the client session regardless
    }
    authStore.clearSession()
    navigate('/')
  }

  const next = encodeURIComponent(location.pathname + location.search)

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 border-b transition-all duration-300',
        scrolled
          ? 'border-white/10 bg-background/95 shadow-elevated backdrop-blur-md'
          : 'border-white/10 bg-background/20 backdrop-blur-sm',
      )}
    >
      <div className="container mx-auto flex h-16 max-w-7xl items-center gap-6 px-4">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold tracking-wide">
          <Ticket className="size-6 text-primary" />
          <span>
            D<span className="text-primary">-</span>CINE
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-1 text-sm font-medium">
                Phim <ChevronDown className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem asChild>
                <Link to="/movies?status=now">Đang công chiếu</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/movies?status=soon">Sắp ra mắt</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="ghost" className="text-sm font-medium" asChild>
            <Link to="/#deals">Voucher</Link>
          </Button>
          <Button variant="ghost" className="text-sm font-medium" asChild>
            <Link to="/#member">Thành viên</Link>
          </Button>
        </nav>

        <form onSubmit={onSearch} className="ml-auto hidden max-w-sm flex-1 sm:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm phim, diễn viên, thể loại…"
              className="h-9 rounded-full bg-secondary/60 pl-9"
            />
          </div>
        </form>

        {isAuthenticated && user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 rounded-full border border-border bg-secondary/60 py-1 pl-1 pr-3 transition hover:border-primary/60">
                <Avatar className="size-7">
                  <AvatarImage src={user.avatarUrl || undefined} alt={user.fullName} />
                  <AvatarFallback className="bg-primary text-xs font-semibold">
                    {(user.fullName || user.username || '?').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="max-w-32 truncate text-sm font-medium">{user.fullName || user.username}</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link to="/profile">Tài khoản của tôi</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/profile?tab=tickets">Vé của tôi</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem variant="destructive" onClick={onLogout}>
                Đăng xuất
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to={`/login?next=${next}`}>Đăng nhập</Link>
            </Button>
            <Button size="sm" asChild>
              <Link to="/signup">Đăng ký</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
