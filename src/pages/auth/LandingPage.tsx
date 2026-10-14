import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import Navbar from '../../components/layout/LandingNavbar'
import Footer from '../../components/layout/LandingFooter'
import BtnStart from '../../components/ui/BtnStart'
import Hero from './sections/Hero'

const Promo = lazy(() => import('./sections/Promo'))
const Highlight = lazy(() => import('./sections/Highlight'))
const Booking = lazy(() => import('./sections/Booking'))
const Testimoni = lazy(() => import('./sections/Testimoni'))
const UnitBisnis = lazy(() => import('./sections/UnitBisnis'))

interface DeferredSectionProps {
  children: ReactNode
  placeholderClassName: string
  id?: string
}

function DeferredSection({ children, placeholderClassName, id }: DeferredSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [isNearViewport, setIsNearViewport] = useState(false)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setIsNearViewport(true)
        observer.disconnect()
      },
      { rootMargin: '300px 0px' },
    )

    observer.observe(section)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={sectionRef} id={id}>
      {isNearViewport ? (
        <Suspense fallback={<div aria-hidden="true" className={placeholderClassName} />}>
          {children}
        </Suspense>
      ) : (
        <div aria-hidden="true" className={placeholderClassName} />
      )}
    </div>
  )
}

function LandingPage() {
  const [hasScrolled, setHasScrolled] = useState(false)
  const [isFooterVisible, setIsFooterVisible] = useState(false)

  useEffect(() => {
    const updateScrollState = () => setHasScrolled(window.scrollY > 0)
    const footer = document.getElementById('landing-footer')
    const footerObserver = footer
      ? new IntersectionObserver(([entry]) => setIsFooterVisible(entry.isIntersecting))
      : null

    updateScrollState()
    if (footer) footerObserver?.observe(footer)
    window.addEventListener('scroll', updateScrollState, { passive: true })
    return () => {
      window.removeEventListener('scroll', updateScrollState)
      footerObserver?.disconnect()
    }
  }, [])

  return (
    <>
      <div className="min-h-screen overflow-x-clip bg-[#FDFCF7] font-body text-[#343133]">
        <Navbar />

        <Hero />

        <DeferredSection placeholderClassName="min-h-[280px] sm:min-h-[320px]">
          <Promo />
        </DeferredSection>

        <DeferredSection placeholderClassName="min-h-[150px] sm:min-h-[180px]">
          <Highlight />
        </DeferredSection>

        <DeferredSection placeholderClassName="min-h-[540px] lg:min-h-[640px]">
          <Booking />
        </DeferredSection>

        <DeferredSection placeholderClassName="min-h-[420px] md:min-h-[480px] lg:min-h-[500px]">
          <Testimoni />
        </DeferredSection>

        <DeferredSection
          id="layanan"
          placeholderClassName="min-h-[620px] md:min-h-[700px]"
        >
          <UnitBisnis />
        </DeferredSection>

        {/* Footer + spacer setinggi tombol sticky (mobile) supaya footer tidak tertutup */}
        <Footer />

        <BtnStart isVisible={hasScrolled && !isFooterVisible} />
      </div>
    </>
  )
}

export default LandingPage