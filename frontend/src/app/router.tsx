import { lazy, Suspense } from 'react'
import { createBrowserRouter, Outlet } from 'react-router-dom'
import { AppShell } from '@/components/layout/app-shell'
import { RequireAuth } from '@/features/auth/require-auth'
import { PageLoader } from '@/components/shared/page-loader'

const HomePage = lazy(() => import('@/features/home/home-page'))
const MoviesPage = lazy(() => import('@/features/movies/movies-page'))
const MovieDetailPage = lazy(() => import('@/features/movies/movie-detail-page'))
const ShowtimePage = lazy(() => import('@/features/showtimes/showtime-page'))
const SeatMapPage = lazy(() => import('@/features/booking/seat-map-page'))
const ConcessionsPage = lazy(() => import('@/features/concessions/concessions-page'))
const PaymentPage = lazy(() => import('@/features/checkout/payment-page'))
const PaymentResultPage = lazy(() => import('@/features/checkout/payment-result-page'))
const ConfirmationPage = lazy(() => import('@/features/checkout/confirmation-page'))
const ProfilePage = lazy(() => import('@/features/profile/profile-page'))
const LoginPage = lazy(() => import('@/features/auth/login-page'))
const SignupPage = lazy(() => import('@/features/auth/signup-page'))
const ForgotPasswordPage = lazy(() => import('@/features/auth/forgot-password-page'))
const NotFoundPage = lazy(() => import('@/components/shared/not-found-page'))

function Lazy({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>
}

export const router = createBrowserRouter([
  {
    element: (
      <AppShell>
        <Lazy>
          <Outlet />
        </Lazy>
      </AppShell>
    ),
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/movies', element: <MoviesPage /> },
      { path: '/movies/:id', element: <MovieDetailPage /> },
      { path: '/showtimes', element: <ShowtimePage /> },
      {
        element: <RequireAuth />,
        children: [
          { path: '/seat-map', element: <SeatMapPage /> },
          { path: '/concessions', element: <ConcessionsPage /> },
          { path: '/payment', element: <PaymentPage /> },
          { path: '/profile', element: <ProfilePage /> },
        ],
      },
      { path: '/payment/result', element: <PaymentResultPage /> },
      { path: '/confirmation', element: <ConfirmationPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  // Auth pages render full-screen without the app header/footer.
  {
    element: (
      <Lazy>
        <Outlet />
      </Lazy>
    ),
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/signup', element: <SignupPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
    ],
  },
])
