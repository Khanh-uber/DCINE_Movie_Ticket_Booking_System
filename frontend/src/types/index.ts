// Domain types mirrored from the Spring Boot DTOs / observed API responses.
// Many backend fields are optional in practice, so most are nullable here.

export interface Movie {
  id: number | string
  title: string
  originalTitle?: string
  posterUrl?: string
  backdropUrl?: string
  trailerUrl?: string
  description?: string
  releaseDate?: string
  durationMinutes?: number
  rated?: string
  rating?: number
  status?: string // 'now' | 'soon' | backend enum
  language?: string
  director?: string
  genres?: string[]
  cast?: { name: string; avatarUrl?: string }[]
  tags?: string[]
}

export interface HeroSlide {
  title?: string
  description?: string
  eyebrow?: string
  backdropUrl?: string
  videoUrl?: string
  movieId?: number | string
}

export interface Promotion {
  id: number | string
  code?: string
  title?: string
  description?: string
  imageUrl?: string
  discountType?: 'percent' | 'amount' | string
  discountValue?: number
  minTier?: string
  expiredAt?: string
}

export interface MembershipTier {
  name: string
  threshold?: number
  discountPercent?: number
  benefits?: string[]
}

export interface Province {
  id: number | string
  name: string
}

export interface CinemaLocation {
  id: number | string
  name: string
  provinceId?: number | string
  address?: string
}

export interface Theater {
  id: number | string
  name: string
  locationId?: number | string
}

export interface ShowtimeSlot {
  id: number | string
  startAt?: string
  endAt?: string
  format?: string // 2D / 3D / IMAX...
  theaterId?: number | string
  theaterName?: string
  movieId?: number | string
  date?: string
}

export interface ShowtimeDetail {
  id: number | string
  movieId?: number | string
  movieTitle?: string
  posterUrl?: string
  theaterName?: string
  date?: string
  startAt?: string
  endAt?: string
  format?: string
  pricing?: {
    byZone?: Record<string, { adult?: number; child?: number }>
  }
}

export type SeatZone = 'vip' | 'standard' | 'couple'
export type SeatStatus = 'available' | 'selected' | 'held' | 'booked'
export type TicketType = 'adult' | 'child'

export interface Seat {
  code: string
  row: string
  col: number
  status?: string
  zone?: string
  booked?: boolean
}

export interface SeatMapData {
  rows: string[]
  cols: number
  aislesAfter?: number[]
  seats: Seat[]
}

export interface PricedSeat {
  code: string
  zone?: string
  type: TicketType
  price: number
}

export interface BookingCartMeta {
  bookingId?: number
  theater?: string
  date?: string
  time?: string
  endTime?: string
  movieId?: number | string
  movieTitle?: string
  format?: string
}

export interface BookingCart {
  bookingId?: number
  showtimeId: number | string
  items: PricedSeat[]
  selectedSeats: string[]
  totalAmount: number
  status?: string
  meta?: BookingCartMeta
}

export interface ComboVariant {
  key?: string
  label?: string
  priceDiff?: number
}

export interface Concession {
  id: number | string
  code?: string
  title: string
  description?: string
  imageUrl?: string
  price: number
  category?: string
  variants?: ComboVariant[]
}

export interface ConcessionCartItem {
  key: string
  id: number | string
  code?: string
  title: string
  imageUrl?: string
  variant?: string
  variantLabel?: string
  unitPrice: number
  qty: number
  lineTotal: number
}

export interface ConcessionsCart {
  bookingId?: number
  showtimeId?: number | string
  ticket?: BookingCartMeta & { seats?: string[]; totalAmount?: number }
  combos: ConcessionCartItem[]
  totals: { ticketAmount: number; combosAmount: number; grandTotal: number }
  grandTotal: number
}

export interface OrderSummary {
  orderId?: string | number
  bookingId?: number
  ticket?: {
    movieTitle?: string
    theaterName?: string
    date?: string
    time?: string
    seats?: string[]
    amount?: number
  }
  combos?: ConcessionCartItem[]
  totals?: {
    ticketAmount?: number
    combosAmount?: number
    discount?: number
    grandTotal?: number
  }
  voucherCode?: string
  paymentMethod?: string
  createdAt?: string
  ticketQr?: string
  qrCode?: string
}

export interface Comment {
  id: number
  fullName?: string
  avatarUrl?: string
  createdAt?: string
  content: string
  myComment?: boolean
}

export interface UserProfile {
  fullName?: string
  username?: string
  email?: string
  phone?: string
  dob?: string
  gender?: string
  address?: string
  joinedAt?: string
  avatarUrl?: string
  loyaltyPoints?: number
  totalSpending?: number
  membershipTierName?: string
}

export interface ProfileBooking {
  id: number | string
  code?: string
  movieTitle?: string
  posterUrl?: string
  theaterName?: string
  date?: string
  time?: string
  seats?: string[]
  totalAmount?: number
  qrCode?: string
  status?: string
}
