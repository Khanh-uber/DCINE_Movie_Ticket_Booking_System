/**
 * Typed storage helpers — replacement for frontend_2 storage-helper.js.
 * Booking snapshots are written to both session and local storage so a
 * refresh mid-flow (or the VNPAY redirect round-trip) never loses the cart.
 */

export const STORAGE_KEYS = {
  accessToken: 'accessToken',
  fullName: 'fullName',
  username: 'username',
  avatarUrl: 'avatarUrl',
  loyaltyPoints: 'loyaltyPoints',
  totalSpending: 'totalSpending',
  membershipTierName: 'membershipTierName',
  showtimeProvince: 'st_provId',
  showtimeLocation: 'st_locId',
  orderConfirmed: 'orderConfirmed',
  bookingCart: 'booking_cart',
  concessionsCart: 'concessions_cart',
  seatSelectedPrefix: 'seatmap:selected:',
} as const

const DEFAULT_STORAGES: Storage[] = [sessionStorage, localStorage]

export function readJson<T>(key: string, storages: Storage[] = DEFAULT_STORAGES): T | null {
  for (const storage of storages) {
    try {
      const raw = storage.getItem(key)
      if (raw) return JSON.parse(raw) as T
    } catch {
      // corrupted entry — ignore and try the next storage
    }
  }
  return null
}

export function writeJson(key: string, value: unknown, storages: Storage[] = DEFAULT_STORAGES): void {
  const raw = JSON.stringify(value)
  for (const storage of storages) {
    try {
      storage.setItem(key, raw)
    } catch {
      // quota exceeded — keep going, the other storage may still work
    }
  }
}

export function removeJson(key: string, storages: Storage[] = DEFAULT_STORAGES): void {
  for (const storage of storages) {
    storage.removeItem(key)
  }
}

export function clearBookingState(): void {
  removeJson(STORAGE_KEYS.bookingCart)
  removeJson(STORAGE_KEYS.concessionsCart)
  localStorage.removeItem('orderCombos')
}
