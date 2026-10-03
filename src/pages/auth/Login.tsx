import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../../components/layout/LandingNavbar'
import Footer from '../../components/layout/Footer'
import loginIllustration from '../../assets/figma/login.jpg'

/* -------------------------------------------------------------------------
   Ikon Google (dipakai pada tombol "Masuk dengan Google")
   ------------------------------------------------------------------------- */
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" />
      <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" />
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58z" />
    </svg>
  )
}

function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: sambungkan ke services/authService.js (POST /login)
    console.log({ email, password })
  }

  return (
    <div className="flex min-h-screen flex-col bg-white font-body text-[#343133]">
      <Navbar />

      {/* ================= Konten login (mengisi sisa tinggi layar, dipusatkan) ================= */}
      <main className="flex flex-1 items-center min-h-0">
        <section className="w-full max-w-[1248px] mx-auto px-6 py-6 grid lg:grid-cols-[1fr_460px] gap-10 lg:gap-20 items-center">
          {/* Kolom kiri: teks & ilustrasi */}
          <div>
            <h1 className="font-heading font-bold text-3xl leading-tight text-[#343133]">
              Kembali Berolahraga Bersama Komunitas OBC
            </h1>
            <p className="mt-3 text-[#6F6B6E] text-sm leading-relaxed max-w-lg">
              Kelola jadwal sewa lapangan, pantau status membership akademi Anda, dan
              dapatkan penawaran diskon khusus pengguna terdaftar secara instan.
            </p>

            {/* Tinggi gambar menyesuaikan tinggi layar (160px - 260px) */}
            <div className="mt-5 overflow-hidden rounded-xl bg-[#A9AD86] h-[clamp(160px,28vh,260px)]">
              <img
                src={loginIllustration}
                alt="Ilustrasi olahraga OBC Sport Center"
                className="h-full w-full object-cover"
              />
            </div>
          </div>

          {/* Kolom kanan: kartu form login */}
          <div className="w-full rounded-2xl border border-[#D4D4D4] bg-white p-6 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
            <h2 className="font-heading font-bold text-xl text-[#343133]">
              Selamat Datang Kembali
            </h2>
            <p className="mt-1 text-sm text-[#343133]">
              Masukkan akun Anda untuk melanjutkan booking
            </p>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div>
                <label htmlFor="email" className="block text-xs font-heading font-bold text-[#343133] mb-1.5">
                  Email / Username
                </label>
                <input
                  id="email"
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukan email Anda"
                  className="w-full rounded-lg border border-[#D4D4D4] bg-[#FDFCF7] px-3 py-2.5 text-sm placeholder:text-[#343133] focus:outline-none focus:border-[#404F14]"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-heading font-bold text-[#343133] mb-1.5">
                  Kata Sandi
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukan kata sandi Anda"
                    className="w-full rounded-lg border border-[#D4D4D4] bg-[#FDFCF7] px-3 py-2.5 pr-24 text-sm placeholder:text-[#343133] focus:outline-none focus:border-[#404F14]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-heading font-bold text-[#404F14] cursor-pointer"
                  >
                    {showPassword ? 'Sembunyikan' : 'Tampilkan'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-[#CDF178] py-2.5 text-sm font-heading font-bold text-[#404F14] shadow-[0_2px_6px_rgba(0,0,0,0.15)] hover:bg-[#9AAD3E] transition-colors cursor-pointer"
              >
                Masuk Ke Akun
              </button>
            </form>

            <p className="mt-3 text-center text-sm text-[#343133]">
              Belum punya akun?{' '}
              <Link to="/register" className="font-heading font-bold text-[#404F14]">
                Daftar Sekarang
              </Link>
            </p>

            <p className="mt-2 text-center text-xs text-[#343133]">Atau</p>

            <button
              type="button"
              onClick={() => {
                // TODO: sambungkan ke alur OAuth Google (services/authService.js)
                navigate('/auth/google')
              }}
              className="mx-auto mt-2 flex w-full max-w-[248px] items-center justify-center gap-2 rounded-md border border-[#D4D4D4] bg-white py-2 font-heading font-bold text-sm text-[#121212] hover:bg-[#FDFCF7] transition-colors cursor-pointer"
            >
              <GoogleIcon />
              Masuk dengan Google
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default LoginPage