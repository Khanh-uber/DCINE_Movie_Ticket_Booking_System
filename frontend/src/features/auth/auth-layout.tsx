import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export function AuthLogo({ className = '' }: { className?: string }) {
  return (
    <Link
      to="/"
      aria-label="D-CINE — về trang chủ"
      className={`inline-flex items-baseline font-display text-2xl font-bold uppercase tracking-wide ${className}`}
    >
      <span className="text-primary">D</span>
      <span className="text-foreground">-CINE</span>
    </Link>
  )
}

interface AuthLayoutProps {
  /** Ảnh banner cho panel hero (bên trái trên desktop, nền mờ trên mobile). */
  heroImage: string
  children: ReactNode
}

/**
 * Bố cục màn hình đôi cho các trang auth (không có header/footer app):
 * trái là hero điện ảnh với overlay gradient tối, phải là thẻ form.
 * Trên mobile, hero trở thành nền phía sau thẻ form.
 */
export function AuthLayout({ heroImage, children }: AuthLayoutProps) {
  return (
    <main className="relative flex min-h-screen bg-background">
      {/* Hero trái (desktop) */}
      <section className="relative hidden flex-1 overflow-hidden lg:block" aria-hidden="true">
        <img src={heroImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/40 to-background" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/50" />
        <div className="relative z-10 flex h-full flex-col justify-between p-10">
          <AuthLogo />
          <div className="max-w-xl pb-6">
            <h2 className="font-display text-4xl font-bold uppercase leading-tight text-white">
              Đắm chìm cùng <span className="text-primary">D-CINE</span>
            </h2>
            <p className="mt-4 text-base text-white/80">
              Đặt vé nhanh • Chọn ghế trực quan • Nhận QR tức thì. Hỗ trợ <b>IMAX</b>, <b>3D</b>, phụ đề / lồng tiếng đa
              dạng.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {['Suất tối nay gần bạn', 'Ưu đãi thành viên', '2.000+ suất/tuần'].map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white/90 backdrop-blur"
                >
                  {chip}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Panel phải: thẻ form */}
      <section className="relative flex w-full items-center justify-center px-4 py-10 lg:w-[560px] lg:shrink-0">
        {/* Nền hero (mobile) */}
        <div className="absolute inset-0 lg:hidden" aria-hidden="true">
          <img src={heroImage} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-black/75" />
        </div>
        <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-elevated sm:p-8">
          <div className="mb-6 lg:hidden">
            <AuthLogo />
          </div>
          {children}
        </div>
      </section>
    </main>
  )
}
