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
  return (
    <>
      <div className="min-h-screen overflow-x-clip bg-[#FDFCF7] font-body text-[#343133]">
        <Navbar />

        <Hero />

        <Promo />

        <Highlight />

        <Booking />

        <Testimoni />

        {/* ================= Unit bisnis ================= */}
        <div className="pb-6 pt-10 sm:pb-10 sm:pt-14 lg:pt-16">
          <UnitBisnis />
        </div>

        {/* Footer + spacer setinggi tombol sticky (mobile) supaya footer tidak tertutup */}
        <div className="bg-gradient-to-r from-[#004000] to-[#404F14] md:bg-none">
          <Footer />
          <div className="h-20 md:hidden" aria-hidden="true" />
        </div>

        <BtnStart />
        
      </div>
    </>
  )
}

export default LandingPage