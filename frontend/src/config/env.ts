export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api',
  wsBaseUrl: import.meta.env.VITE_WS_BASE_URL ?? window.location.origin,
} as const
