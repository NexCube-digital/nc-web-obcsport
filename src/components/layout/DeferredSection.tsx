import { Suspense, useEffect, useRef, useState, type ReactNode } from 'react'
import ScrollReveal from '../animation/ScrollReveal'

type DeferredSectionProps = {
  children: ReactNode
  placeholderClassName: string
  startAfterScroll?: boolean
  id?: string
}

function DeferredSection({
  children,
  placeholderClassName,
  startAfterScroll = false,
  id,
}: DeferredSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [isEnabled, setIsEnabled] = useState(
    () => !startAfterScroll || (typeof window !== 'undefined' && window.scrollY > 0),
  )
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (!startAfterScroll || isEnabled) return

    const handleScroll = () => {
      if (window.scrollY === 0) return
      setIsEnabled(true)
      window.removeEventListener('scroll', handleScroll)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isEnabled, startAfterScroll])

  useEffect(() => {
    if (!isEnabled || isVisible) return

    const section = sectionRef.current
    if (!section) return

    const preloadDistance = Math.min(Math.max(window.innerHeight * 0.25, 300), 520)
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setIsVisible(true)
        observer.disconnect()
      },
      { rootMargin: `${preloadDistance}px 0px` },
    )

    observer.observe(section)
    return () => observer.disconnect()
  }, [isEnabled, isVisible])

  return (
    <div ref={sectionRef} id={id}>
      {isVisible ? (
        <Suspense fallback={<div aria-hidden="true" className={placeholderClassName} />}>
          <ScrollReveal>{children}</ScrollReveal>
        </Suspense>
      ) : (
        <div aria-hidden="true" className={placeholderClassName} />
      )}
    </div>
  )
}

export default DeferredSection
