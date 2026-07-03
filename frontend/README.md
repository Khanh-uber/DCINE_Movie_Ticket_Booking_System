# DCINE Frontend (React)

Frontend mới của hệ thống đặt vé xem phim D-CINE, migrate từ `frontend_2` (HTML/CSS/JS thuần) sang stack hiện đại:

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS v4** (config CSS-first trong `src/index.css`)
- **shadcn/ui** (style new-york, theme dark cinema)
- **react-router-dom v7** — routing + route guard
- **TanStack Query v5** — data fetching / caching
- **axios** — HTTP client (cookie session + Bearer token)

## Chạy dự án

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # build production vào dist/
npm run preview    # xem thử bản build
```

Yêu cầu backend Spring Boot chạy tại `http://localhost:8080` (cấu hình qua `.env.development` / biến `VITE_API_BASE_URL`). Dev server đã proxy sẵn `/api` và `/ws-payment` sang backend.

## Cấu trúc thư mục

```
src/
├── app/                    # Bootstrap: router, providers (React Query, Toaster)
├── components/
│   ├── ui/                 # shadcn/ui components (generated)
│   ├── layout/             # SiteHeader, SiteFooter, AppShell
│   └── shared/             # MovieCard, PageLoader, NotFound...
├── features/               # Mỗi domain một thư mục (page + hooks + components)
│   ├── home/
│   ├── movies/
│   ├── showtimes/
│   ├── booking/            # seat map
│   ├── concessions/
│   ├── checkout/           # payment, payment result, confirmation
│   ├── profile/
│   └── auth/               # login/signup/forgot + auth-store + route guard
├── services/               # API layer (axios) theo domain
├── lib/                    # http client, storage, format, utils
├── types/                  # Domain types (Movie, Showtime, BookingCart...)
├── config/                 # env
└── index.css               # Tailwind v4 + design tokens (dark cinema theme)
```

## Routes

| Route | Trang | Auth |
|---|---|---|
| `/` | Trang chủ | – |
| `/movies?q=&status=now\|soon` | Danh sách / tìm kiếm phim | – |
| `/movies/:id` | Chi tiết phim + bình luận | – |
| `/showtimes?movie=` | Chọn suất chiếu | – |
| `/seat-map?showtimeId=...` | Chọn ghế (realtime hold, poll 10s) | ✅ |
| `/concessions` | Bắp nước / combo | ✅ |
| `/payment` | Thanh toán (VNPAY + voucher) | ✅ |
| `/payment/result` | VNPAY return URL | – |
| `/confirmation` | Vé + QR sau thanh toán | – |
| `/profile?tab=` | Hồ sơ, đổi mật khẩu, vé, voucher | ✅ |
| `/login` `/signup` `/forgot-password` | Auth (fullscreen) | – |

Lưu ý: URL return của VNPAY ở backend cần trỏ về `/payment/result` (trước đây là `payment-result.html`).

## Quy ước

Xem `CONVENTIONS.md` — design tokens, storage keys (`booking_cart`, `concessions_cart`, `seatmap:selected:*`...), API services và quy tắc đặt file. UI text tiếng Việt, theme dark-only.
