import { Link } from 'react-router-dom'
import { Ticket } from 'lucide-react'

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12Z" />
    </svg>
  )
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

function YoutubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </svg>
  )
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-card">
      <div className="container mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-3">
          <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold">
            <Ticket className="size-5 text-primary" />
            D<span className="text-primary">-</span>CINE
          </Link>
          <p className="text-sm text-muted-foreground">
            Trải nghiệm điện ảnh đỉnh cao với công nghệ hình ảnh sắc nét và âm thanh sống động.
          </p>
          <div className="flex gap-3 text-muted-foreground">
            <a href="#" aria-label="Facebook" className="transition hover:text-primary">
              <FacebookIcon className="size-5" />
            </a>
            <a href="#" aria-label="Instagram" className="transition hover:text-primary">
              <InstagramIcon className="size-5" />
            </a>
            <a href="#" aria-label="Youtube" className="transition hover:text-primary">
              <YoutubeIcon className="size-5" />
            </a>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Phim</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/movies?status=now" className="transition hover:text-primary">
                Đang công chiếu
              </Link>
            </li>
            <li>
              <Link to="/movies?status=soon" className="transition hover:text-primary">
                Sắp ra mắt
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Dịch vụ</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/showtimes" className="transition hover:text-primary">
                Đặt vé
              </Link>
            </li>
            <li>
              <Link to="/#deals" className="transition hover:text-primary">
                Ưu đãi
              </Link>
            </li>
            <li>
              <Link to="/#member" className="transition hover:text-primary">
                Thành viên
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">Hỗ trợ</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Hotline: 1900 0000</li>
            <li>Email: support@dcine.vn</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} D-CINE. All rights reserved.
      </div>
    </footer>
  )
}
