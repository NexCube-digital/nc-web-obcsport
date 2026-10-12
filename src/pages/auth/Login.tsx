import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import loginIllustration from '../../assets/figma/login.jpg'
import logo from '../../assets/logo/unit bisnis/LOGO OBC SPORT CENTER.png'

/* Ikon Google */
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

/* Ikon mata (toggle kata sandi) - versi mobile */
function EyeIcon({ visible }: { visible: boolean }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {visible ? (
        <>
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
          <circle cx="12" cy="12" r="3" />
        </>
      ) : (
        <>
          <path d="M9.9 4.24A9.1 9.1 0 0 1 12 4c6.5 0 10 8 10 8a17.5 17.5 0 0 1-2.16 3.19" />
          <path d="M6.61 6.61A17.1 17.1 0 0 0 2 12s3.5 8 10 8a9.7 9.7 0 0 0 5.39-1.61" />
          <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
          <path d="m2 2 20 20" />
        </>
      )}
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

  const handleGoogleLogin = () => {
    // TODO: sambungkan ke alur OAuth Google (services/authService.js)
    navigate('/auth/google')
  }

  return (
    <>
      {/* ===================== MOBILE (< md) — satu layar, tanpa scroll ===================== */}
      <div className="md:hidden flex h-[100dvh] flex-col justify-center overflow-hidden bg-[#FDFCF7] px-6 py-[clamp(8px,2.5vh,40px)] font-heading text-[#343133]">
        <Link to="/" className="mx-auto flex shrink-0 items-center gap-3">
          <img
            src={logo}
            alt="OBC Sport Center"
            className="h-[clamp(52px,11vh,88px)] w-[clamp(52px,11vh,88px)] rounded-full object-contain"
          />
          <span className="flex flex-col font-['Montserrat',sans-serif] text-[clamp(16px,3.3vh,24px)] font-extrabold italic leading-[1.05] text-[#121212]">
            <span className="uppercase">OBC SPORT</span>
            <span>Center</span>
          </span>
        </Link>

        <h1 className="mt-[clamp(10px,3.5vh,40px)] text-[clamp(20px,3.6vh,28px)] font-bold leading-tight text-[#404F14]">
          Selamat Datang Kembali
        </h1>
        <p className="mt-1.5 font-body text-[clamp(12px,2vh,15px)] leading-snug text-[#6F6B6E]">
          Masuk dengan akun Anda untuk mulai memesan lapangan
        </p>

        <form onSubmit={handleSubmit} className="mt-[clamp(10px,2.6vh,28px)]">
          <label htmlFor="m-email" className="mb-[clamp(3px,0.9vh,8px)] block text-xs font-bold text-[#121212]">
            Alamat Email
          </label>
          <input
            id="m-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@email.com"
            className="h-[clamp(40px,6.8vh,54px)] w-full rounded-xl border border-[#E5E5E5] bg-white px-4 font-body text-sm text-[#343133] placeholder:text-[#8A8688] focus:outline-none focus:border-[#404F14]"
          />

          <label htmlFor="m-password" className="mb-[clamp(3px,0.9vh,8px)] mt-[clamp(8px,2.2vh,20px)] block text-xs font-bold text-[#121212]">
            Kata Sandi
          </label>
          <div className="relative">
            <input
              id="m-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-[clamp(40px,6.8vh,54px)] w-full rounded-xl border border-[#E5E5E5] bg-white pl-4 pr-12 font-body text-sm text-[#343133] placeholder:text-[#8A8688] focus:outline-none focus:border-[#404F14]"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#343133] cursor-pointer"
            >
              <EyeIcon visible={showPassword} />
            </button>
          </div>

          {/* TODO: pastikan route /forgot-password sudah ada */}
          <div className="mt-[clamp(6px,1.8vh,20px)] text-right">
            <Link
              to="/forgot-password"
              className="text-xs font-bold text-[#404F14] underline underline-offset-2"
            >
              Lupa Kata Sandi?
            </Link>
          </div>

          <button
            type="submit"
            className="mt-[clamp(8px,1.8vh,20px)] h-[clamp(40px,6.8vh,54px)] w-full rounded-xl bg-[#CDF178] text-base font-bold text-[#343133] shadow-[0_6px_16px_rgba(154,173,62,0.35)] active:bg-[#9AAD3E] transition-colors cursor-pointer"
          >
            Masuk Sekarang
          </button>
        </form>

        <div className="mt-[clamp(8px,1.8vh,20px)] flex items-center gap-3">
          <span className="h-px flex-1 bg-[#D4D4D4]" />
          <span className="font-body text-xs text-[#343133]">Atau</span>
          <span className="h-px flex-1 bg-[#D4D4D4]" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="mt-[clamp(8px,1.8vh,20px)] flex h-[clamp(40px,6.8vh,54px)] w-full items-center justify-center gap-2 rounded-xl border border-[#D4D4D4] bg-white text-sm font-bold text-[#121212] active:bg-[#FDFCF7] transition-colors cursor-pointer"
        >
          <GoogleIcon />
          Masuk dengan Google
        </button>

        <p className="mt-[clamp(10px,2.4vh,28px)] text-center font-body text-sm text-[#343133]">
          Belum punya akun?{' '}
          <Link
            to="/register"
            className="font-heading font-bold text-[#404F14] underline underline-offset-2"
          >
            Daftar Sekarang
          </Link>
        </p>
      </div>

        {/* ===================== DESKTOP (>= md) — satu layar, tanpa scroll ===================== */}
      <div className="hidden md:flex h-[100dvh] flex-col overflow-hidden bg-white font-body text-[#343133]">
        <main className="flex min-h-0 flex-1 items-center">
          <section className="mx-auto grid w-full max-w-[1400px] items-center gap-10 px-8 py-[clamp(8px,2vh,32px)] lg:grid-cols-[1fr_clamp(460px,34vw,560px)] lg:gap-[clamp(40px,6vw,96px)]">
            {/* Kolom kiri */}
            <div>
              <h1 className="font-heading text-[clamp(28px,4.8vh,48px)] font-bold leading-tight text-[#343133]">
                Kembali Berolahraga Bersama Komunitas OBC
              </h1>
              <p className="mt-[clamp(10px,1.8vh,20px)] max-w-xl text-[clamp(14px,2vh,18px)] leading-relaxed text-[#6F6B6E]">
                Kelola jadwal sewa lapangan, pantau status membership akademi Anda, dan
                dapatkan penawaran diskon khusus pengguna terdaftar secara instan.
              </p>

              <div className="mt-[clamp(14px,3vh,32px)] h-[clamp(140px,36vh,400px)] overflow-hidden rounded-2xl bg-[#A9AD86]">
                <img
                  src={loginIllustration}
                  alt="Ilustrasi olahraga OBC Sport Center"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            {/* Kolom kanan: kartu form */}
            <div className="w-full rounded-2xl border border-[#D4D4D4] bg-white p-[clamp(16px,3.6vh,40px)] shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
              <h2 className="font-heading text-[clamp(20px,3.2vh,30px)] font-bold text-[#343133]">
                Selamat Datang Kembali
              </h2>
              <p className="mt-1 text-[clamp(13px,1.9vh,17px)] text-[#343133]">
                Masukkan akun Anda untuk melanjutkan booking
              </p>

              <form
                onSubmit={handleSubmit}
                className="mt-[clamp(10px,2.4vh,28px)] space-y-[clamp(8px,2vh,20px)]"
              >
                <div>
                  <label
                    htmlFor="email"
                    className="mb-[clamp(4px,0.8vh,8px)] block text-[clamp(12px,1.7vh,15px)] font-heading font-bold text-[#343133]"
                  >
                    Email / Username
                  </label>
                  <input
                    id="email"
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Masukan email Anda"
                    className="w-full rounded-lg border border-[#D4D4D4] bg-[#FDFCF7] px-4 py-[clamp(9px,1.9vh,18px)] text-[clamp(13px,1.9vh,17px)] placeholder:text-[#343133] focus:outline-none focus:border-[#404F14]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-[clamp(4px,0.8vh,8px)] block text-[clamp(12px,1.7vh,15px)] font-heading font-bold text-[#343133]"
                  >
                    Kata Sandi
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Masukan kata sandi Anda"
                      className="w-full rounded-lg border border-[#D4D4D4] bg-[#FDFCF7] px-4 py-[clamp(9px,1.9vh,18px)] pr-28 text-[clamp(13px,1.9vh,17px)] placeholder:text-[#343133] focus:outline-none focus:border-[#404F14]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[clamp(12px,1.6vh,14px)] font-heading font-bold text-[#404F14] cursor-pointer"
                    >
                      {showPassword ? 'Sembunyikan' : 'Tampilkan'}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-lg bg-[#CDF178] py-[clamp(10px,2vh,18px)] text-[clamp(14px,2vh,17px)] font-heading font-bold text-[#404F14] shadow-[0_2px_6px_rgba(0,0,0,0.15)] hover:bg-[#9AAD3E] transition-colors cursor-pointer"
                >
                  Masuk Ke Akun
                </button>
              </form>

              <p className="mt-[clamp(8px,1.8vh,20px)] text-center text-[clamp(13px,1.8vh,16px)] text-[#343133]">
                Belum punya akun?{' '}
                <Link to="/register" className="font-heading font-bold text-[#404F14]">
                  Daftar Sekarang
                </Link>
              </p>

              <p className="mt-[clamp(4px,1vh,12px)] text-center text-[clamp(12px,1.6vh,14px)] text-[#343133]">
                Atau
              </p>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="mx-auto mt-[clamp(6px,1.2vh,12px)] flex w-full max-w-[300px] items-center justify-center gap-2 rounded-md border border-[#D4D4D4] bg-white py-[clamp(7px,1.4vh,12px)] font-heading text-[clamp(13px,1.8vh,16px)] font-bold text-[#121212] hover:bg-[#FDFCF7] transition-colors cursor-pointer"
              >
                <GoogleIcon />
                Masuk dengan Google
              </button>
            </div>
          </section>
        </main>
      </div>

    </>
  )
}

export default LoginPage