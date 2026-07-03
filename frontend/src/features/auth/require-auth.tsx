import { useEffect } from 'react'
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuth, authStore } from '@/features/auth/auth-store'

/**
 * Route guard — replacement for frontend_2's guardAuth().
 * Also reacts to 401s surfaced by the HTTP client mid-session.
 */
export function RequireAuth() {
  const { isAuthenticated } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    function onUnauthorized() {
      authStore.clearSession()
      navigate(`/login?next=${encodeURIComponent(location.pathname + location.search)}`, { replace: true })
    }
    window.addEventListener('dcine:unauthorized', onUnauthorized)
    return () => window.removeEventListener('dcine:unauthorized', onUnauthorized)
  }, [navigate, location])

  if (!isAuthenticated) {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`} replace />
  }
  return <Outlet />
}
