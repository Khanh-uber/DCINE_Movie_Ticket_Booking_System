import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { HeroSection } from './hero-section'
import { ComingSoonSection, NowShowingSection } from './movie-carousel-section'
import { DealsSection } from './deals-section'
import { MemberSection } from './member-section'

export default function HomePage() {
  const { hash } = useLocation()

  // Anchor scrolling for /#deals and /#member (on mount and hash change).
  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0 })
      return
    }
    const id = hash.slice(1)
    const timer = window.setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
    return () => window.clearTimeout(timer)
  }, [hash])

  return (
    <div>
      <HeroSection />
      <main className="container mx-auto max-w-7xl px-4">
        <NowShowingSection />
        <ComingSoonSection />
        <DealsSection />
        <MemberSection />
      </main>
    </div>
  )
}
