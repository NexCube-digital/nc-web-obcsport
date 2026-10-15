import { lazy, Suspense, useEffect, useRef, useState } from 'react'

const Footer = lazy(() => import('./Footer'))

function DeferredFooter() {
  const footerRef = useRef<HTMLDivElement>(null)
  const [isNearViewport, setIsNearViewport] = useState(false)

  useEffect(() => {
    const footer = footerRef.current
    if (!footer) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        setIsNearViewport(true)
        observer.disconnect()
      },
      { rootMargin: '300px 0px' },
    )

    observer.observe(footer)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={footerRef} className="min-h-[180px]">
      {isNearViewport ? (
        <Suspense fallback={<div aria-hidden="true" className="min-h-[180px]" />}>
          <Footer />
        </Suspense>
      ) : (
        <div aria-hidden="true" className="min-h-[180px]" />
      )}
    </div>
  )
}

export default DeferredFooter
