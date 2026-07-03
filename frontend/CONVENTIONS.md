# DCINE React Frontend — Conventions (for page implementers)

Migration of `frontend_2` (vanilla HTML/CSS/JS) → React 19 + Vite + TypeScript + Tailwind CSS v4 + shadcn/ui.
Project root: `frontend/`. All paths below are relative to `frontend/`.

## Stack & rules

- React 19, react-router-dom v7 (`createBrowserRouter`), TanStack Query v5, axios, Tailwind v4 (CSS-first config in `src/index.css`), shadcn/ui (new-york).
- **TypeScript strict**: `noUnusedLocals` and `noUnusedParameters` are ON — remove unused imports/vars or the build fails.
- Import alias `@/` → `src/`.
- **Do NOT install new npm packages.** Already available: `qrcode` (+types), `lucide-react`, `sonner` (via `import { toast } from 'sonner'`).
- **Do NOT edit shared files**: `src/app/router.tsx`, `src/index.css`, `src/lib/*`, `src/services/*`, `src/types/index.ts`, `src/components/layout/*`, `src/components/ui/*`, `src/components/shared/movie-card.tsx`, `package.json`, `vite.config.ts`. Only create files inside YOUR assigned feature folder. If a service/type lacks a field you need, extend locally in your feature folder (e.g. cast to a local interface) — do not edit shared files.
- UI text is **Vietnamese** (match the old pages). Currency via `formatVnd`.
- Pages are default exports: `export default function XxxPage() {...}` (router lazy-imports them).
- Data fetching: TanStack Query (`useQuery`/`useMutation`) with the services below. Show `Skeleton` while loading, and a friendly empty/error state. No local-JSON fallbacks (backend only).
- Errors from API: `getApiErrorMessage(error)` from `@/lib/http` → show via `toast.error(...)` or inline.

## Shared infra (already implemented — import, don't recreate)

- `@/lib/http`: `http` (axios instance, baseURL = env `VITE_API_BASE_URL` = `http://localhost:8080/api`, `withCredentials` + Bearer token interceptor; dispatches `dcine:unauthorized` on 401), `getApiErrorMessage(err, fallback?)`.
- `@/lib/storage`: `STORAGE_KEYS`, `readJson<T>(key, storages?)`, `writeJson(key, value, storages?)`, `removeJson(key)`, `clearBookingState()`. Default storages: session+local (both).
  Keys: `accessToken, fullName, username, avatarUrl, loyaltyPoints, totalSpending, membershipTierName, st_provId (showtimeProvince), st_locId (showtimeLocation), orderConfirmed, booking_cart (bookingCart), concessions_cart (concessionsCart), seatmap:selected:<showtimeId> (seatSelectedPrefix)`.
- `@/lib/format`: `formatVnd`, `formatDate`, `formatTime`, `removeAccents`.
- `@/features/auth/auth-store`: `useAuth()` → `{ isAuthenticated, token, user }`; `authStore.setSession(token, user)`, `authStore.updateUser(partial)`, `authStore.clearSession()`.
- Services (all typed, all unwrap `{data:...}` envelopes):
  - `@/services/auth`: `authApi.login({emailOrPhone,password})→{accessToken,user}`, `.register({fullName,username,email?,phone?,password,confirmPassword})`, `.session()`, `.logout()`, `.sendOtp({channelType:'email'|'phone',identifier})→requestId`, `.verifyOtp({requestId,code})`, `.resetPassword({requestId,newPassword,confirmPassword})`.
  - `@/services/movies`: `moviesApi.all() .nowShowing() .comingSoon() .byId(id) .hero() .promotions() .memberships()`; `commentsApi.list(movieId) .create(movieId,content) .update(id,content) .remove(id)`.
  - `@/services/showtimes`: `catalogApi.provinces() .locations() .theaters()`; `showtimesApi.search({movie,province}) .byId(id) .seats(id) .holdSeats(id,seats[],'hold'|'release') .pricingPreview(id,[{code,type}])`.
  - `@/services/booking`: `bookingApi.create(showtimeId,[{code,type}])→BookingCart`; `concessionsApi.menu() .summary() .updateCart(items)`; `checkoutApi.summary() .applyVoucher(code,order) .lastConfirmed() .createPaymentUrl(bookingId)→url`.
  - `@/services/profile`: `profileApi.me() .update(partial) .changePassword({oldPassword,newPassword}) .bookings()`.
- Types in `@/types`: `Movie, HeroSlide, Promotion, MembershipTier, Province, CinemaLocation, Theater, ShowtimeSlot, ShowtimeDetail, Seat, SeatMapData, PricedSeat, TicketType, BookingCart, BookingCartMeta, Concession, ConcessionCartItem, ConcessionsCart, OrderSummary, Comment, UserProfile, ProfileBooking`.
- Shared components: `MovieCard` (`@/components/shared/movie-card`, prop `movie: Movie`), `PageLoader` (`@/components/shared/page-loader`).
- shadcn/ui installed: `button, card, input, label, tabs, dialog, dropdown-menu, select, badge, skeleton, separator, avatar, progress, textarea, sonner`. Import from `@/components/ui/<name>`.

## Routes (already wired in router — create your page at the exact file path)

| Route | File | Guard |
|---|---|---|
| `/` | `src/features/home/home-page.tsx` | – |
| `/movies` (`?q=`, `?status=now\|soon`) | `src/features/movies/movies-page.tsx` | – |
| `/movies/:id` | `src/features/movies/movie-detail-page.tsx` | – |
| `/showtimes` (`?movie=`) | `src/features/showtimes/showtime-page.tsx` | – |
| `/seat-map` (`?showtimeId=&movie=&start=&end=&format=`) | `src/features/booking/seat-map-page.tsx` | auth |
| `/concessions` | `src/features/concessions/concessions-page.tsx` | auth |
| `/payment` | `src/features/checkout/payment-page.tsx` | auth |
| `/payment/result` (`?vnp_ResponseCode=`) | `src/features/checkout/payment-result-page.tsx` | – |
| `/confirmation` | `src/features/checkout/confirmation-page.tsx` | – |
| `/profile` (`?tab=`) | `src/features/profile/profile-page.tsx` | auth |
| `/login` (`?next=`), `/signup`, `/forgot-password` | `src/features/auth/{login,signup,forgot-password}-page.tsx` | – (fullscreen, no AppShell) |

Old→new URL mapping for links: `movie-detail.html?movie=X` → `/movies/X`; `showtime.html?movie=X` → `/showtimes?movie=X`; `seat-map.html?...` → `/seat-map?...`; `D_cine_login.html?next=` → `/login?next=<new route>`.

## Design language (dark cinema, shadcn tokens in `src/index.css`)

- Palette: background `#050505`, card `#0B0B0D`, primary/brand red `#E50914`, border `#2A2A2A`, muted-foreground `#A0A0A0`. Extra Tailwind colors available: `gold`, `success`, `warning`, `info`, `brand-dark`, `tier-gold-1/2`, `tier-plat-1/2`, `tier-dmnd-1/2`. Shadows: `shadow-elevated`, `shadow-red`. Font utilities: `font-sans` (Inter), `font-display` (Poppins).
- Dark-only theme (`:root` is dark; `<html class="dark">`).
- Page container: `container mx-auto max-w-7xl px-4`. Content sits below fixed 64px header (AppShell already adds `pt-16`).
- Headings: `font-display font-bold uppercase` with red accent, e.g. section head `ĐANG CÔNG CHIẾU` + "Xem tất cả" link — mirror the old site's look with Tailwind, no custom CSS files. Keep hover transitions subtle (`transition`, `hover:-translate-y-1`, red glow `hover:shadow-red`).
- Images: static banners under `/images/banners/...` (copied from old app, same filenames); poster fallback `/images/poster-placeholder.svg`.
- Old CSS files (for visual reference only) live in `../frontend_2/assets/css/`.

## Verification

When done, run `npx tsc -b` in `frontend/` and fix ALL type errors in YOUR files. Do not run `npm run dev` or `npm run build`.
