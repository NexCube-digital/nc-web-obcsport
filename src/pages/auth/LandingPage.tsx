import { useEffect, useState } from 'react'
import Navbar from '../../components/layout/LandingNavbar'
import Footer from '../../components/layout/LandingFooter'
import BtnStart from '../../components/ui/BtnStart'
import Hero from './sections/Hero'
import Promo from './sections/Promo'
import Highlight from './sections/Highlight'
import Booking from './sections/Booking'
import Testimoni from './sections/Testimoni'
import UnitBisnis from './sections/UnitBisnis'

function LandingPage() {
  const [hasScrolled, setHasScrolled] = useState(false)

  useEffect(() => {
    const updateScrollState = () => setHasScrolled(window.scrollY > 0)

    updateScrollState()
    window.addEventListener('scroll', updateScrollState, { passive: true })
    return () => window.removeEventListener('scroll', updateScrollState)
  }, [])

  return (
    <>
      <div className="min-h-screen overflow-x-clip bg-[#FDFCF7] font-body text-[#343133]">
        <Navbar />

        <Hero />

        <Promo />

        <Highlight />

        <Booking />

        <Testimoni />

        
        <UnitBisnis />

        {/* Footer + spacer setinggi tombol sticky (mobile) supaya footer tidak tertutup */}
        <Footer />
          

        <BtnStart isVisible={hasScrolled} />
        
      </div>
    </>
  )
}

export default LandingPage