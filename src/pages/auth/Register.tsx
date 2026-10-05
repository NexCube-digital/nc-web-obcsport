import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../../components/layout/LandingNavbar'
import Footer from '../../components/layout/Footer'
import logo from '../../assets/logo/unit bisnis/LOGO OBC SPORT CENTER.png'

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

/* -------------------------------------------------------------------------
   Ikon mata (toggle tampilkan / sembunyikan kata sandi) - versi mobile
   ------------------------------------------------------------------------- */
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

/* -------------------------------------------------------------------------
   Data poin keuntungan (kolom kiri, desktop)
   ------------------------------------------------------------------------- */
const BENEFITS: string[] = [
  'Booking 100% Instan & QRIS Otomatis',
  'Akses Premium Court Booking & Member Club',
  'Tracking Sesi Akademi & Modul Pelatihan',
]

// Kelas input desktop dipakai ulang supaya semua kolom form seragam
const INPUT_CLASS =
  'w-full rounded-lg border border-[#D4D4D4] bg-[#FDFCF7] px-3 py-2.5 text-sm placeholder:text-[#343133] focus:outline-none focus:border-[#404F14]'
const LABEL_CLASS = 'block text-xs font-heading font-bold text-[#343133] mb-1.5'

// Kelas input & label mobile: warna disamakan dengan desktop, hanya ukuran yang berbeda
const M_INPUT_CLASS =
  'h-12 w-full rounded-xl border border-[#D4D4D4] bg-[#FDFCF7] px-4 font-body text-sm text-[#343133] placeholder:text-[#343133] focus:outline-none focus:border-[#404F14]'
const M_LABEL_CLASS = 'block text-xs font-heading font-bold text-[#343133] mb-2'

function Register() {
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreed) return // TODO: tampilkan validasi "harap setujui syarat & ketentuan"
    // TODO: sambungkan ke services/authService.js (POST /register)
    console.log({ fullName, phone, email, password, confirmPassword })
  }

  const handleSubmitMobile = (e: React.FormEvent) => {
    e.preventDefault()
    // Catatan: desain mobile tidak memiliki field No. Telepon & checkbox syarat/ketentuan.
    // Jika backend mewajibkan phone, tambahkan field-nya di form mobile atau jadikan opsional di API.
    // TODO: validasi password min. 8 karakter & password === confirmPassword
    // TODO: sambungkan ke services/authService.js (POST /register)
    console.log({ fullName, email, password, confirmPassword })
  }

  const handleGoogleLogin = () => {
    // TODO: sambungkan ke alur OAuth Google (services/authService.js)
    navigate('/auth/google')
  }

  return (
    <>
      {/* ===================================================================
          TAMPILAN MOBILE (< md): tanpa navbar & footer, konten di tengah layar
          Catatan: id input diberi prefix "m-" agar tidak bentrok dengan versi desktop
          =================================================================== */}
      <div className="md:hidden flex min-h-[100dvh] flex-col justify-center bg-white px-6 py-10 font-heading text-[#343133]">
        {/* Logo brand di tengah */}
        <Link to="/" className="mx-auto flex items-center gap-3">
          <img
            src={logo}
            alt="OBC Sport Center"
            className="h-20 w-20 rounded-full object-contain"
          />
          {/* Catatan: font brand di desain terlihat seperti Montserrat/Poppins, pastikan sudah di-load */}
          <span className="flex flex-col font-['Montserrat',sans-serif] text-[22px] font-extrabold italic leading-[1.05] text-[#343133]">
            <span className="uppercase">OBC SPORT</span>
            <span>Center</span>
          </span>
        </Link>

        {/* Judul & deskripsi */}
        <h1 className="mt-8 text-2xl font-bold leading-tight text-[#343133]">
          Daftar Akun Baru
        </h1>
        <p className="mt-2 font-body text-sm leading-snug text-[#6F6B6E]">
          Bergabunglah dan nikmati kemudahan akses olahraga
        </p>

        {/* Form */}
        <form onSubmit={handleSubmitMobile} className="mt-6 space-y-4">
          <div>
            <label htmlFor="m-fullName" className={M_LABEL_CLASS}>
              Nama Lengkap
            </label>
            <input
              id="m-fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Masukkan nama lengkap Anda"
              className={M_INPUT_CLASS}
            />
          </div>

          <div>
            <label htmlFor="m-email" className={M_LABEL_CLASS}>
              Alamat Email
            </label>
            <input
              id="m-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              className={M_INPUT_CLASS}
            />
          </div>

          <div>
            <label htmlFor="m-password" className={M_LABEL_CLASS}>
              Kata Sandi
            </label>
            <div className="relative">
              <input
                id="m-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 karakter"
                className={`${M_INPUT_CLASS} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#404F14] cursor-pointer"
              >
                <EyeIcon visible={showPassword} />
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="m-confirmPassword" className={M_LABEL_CLASS}>
              Konfirmasi Kata Sandi
            </label>
            <div className="relative">
              <input
                id="m-confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Ulangi kata sandi"
                className={`${M_INPUT_CLASS} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={showConfirmPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#404F14] cursor-pointer"
              >
                <EyeIcon visible={showConfirmPassword} />
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="mt-2 h-12 w-full rounded-xl bg-[#CDF178] text-base font-heading font-bold text-[#404F14] hover:bg-[#9AAD3E] active:bg-[#9AAD3E] transition-colors cursor-pointer"
          >
            Daftar Sekarang
          </button>
        </form>

        {/* Pemisah "Atau" + tombol Google */}
        <div className="mt-4 flex items-center gap-3">
          <span className="h-px flex-1 bg-[#D4D4D4]" />
          <span className="font-body text-xs text-[#343133]">Atau</span>
          <span className="h-px flex-1 bg-[#D4D4D4]" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#D4D4D4] bg-white text-sm font-heading font-bold text-[#121212] active:bg-[#FDFCF7] transition-colors cursor-pointer"
        >
          <GoogleIcon />
          Masuk dengan Google
        </button>

        {/* Link masuk */}
        <p className="mt-6 text-center font-body text-sm text-[#343133]">
          Sudah memiliki akun?{' '}
          <Link
            to="/login"
            className="font-heading font-bold text-[#404F14] underline underline-offset-2"
          >
            Masuk
          </Link>
        </p>
      </div>

      {/* ===================================================================
          TAMPILAN DESKTOP (>= md): tampilan asli
          =================================================================== */}
      {/* Tinggi halaman mengikuti isi (tidak dikunci satu layar), jadi form tidak akan terpotong */}
      <div className="hidden md:flex min-h-screen flex-col bg-white font-body text-[#343133]">
        <div className="shrink-0">
          <Navbar />
        </div>

        {/* ================= Konten register ================= */}
        <main className="flex flex-1 items-center">
          <section className="w-full max-w-[1248px] mx-auto px-6 py-8 grid lg:grid-cols-[1fr_480px] gap-10 lg:gap-20 items-center">
            {/* Kolom kiri: teks & daftar keuntungan */}
            <div>
              <h1 className="font-heading font-bold text-3xl lg:text-4xl leading-tight text-[#343133]">
                Buat Akun OBC Anda
              </h1>
              <p className="mt-4 text-[#6F6B6E] text-base leading-relaxed max-w-lg">
                Bergabunglah sekarang untuk menikmati seluruh keuntungan sewa lapangan
                instan dan pendaftaran akademi. Satu akun untuk Futsal, Badminton,
                Basket, dan Billiard.
              </p>

              <ul className="mt-5 space-y-3">
                {BENEFITS.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-1.5 text-sm text-[#6F6B6E]">
                    <span aria-hidden="true">✅</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Kolom kanan: kartu form register */}
            <div className="w-full rounded-2xl border border-[#D4D4D4] bg-white p-8 shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
              <h2 className="font-heading font-bold text-2xl text-[#343133]">
                Daftar Akun Baru
              </h2>
              <p className="mt-1 text-sm text-[#343133]">
                Mulai rasakan kemudahan pemesanan instan
              </p>

              <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                <div>
                  <label htmlFor="fullName" className={LABEL_CLASS}>
                    Nama Lengkap
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Contoh: Budiman Santoso"
                    className={INPUT_CLASS}
                  />
                </div>

                <div>
                  <label htmlFor="phone" className={LABEL_CLASS}>
                    No. Telepon / WhatsApp
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Contoh: 08123456789"
                    className={INPUT_CLASS}
                  />
                </div>

                <div>
                  <label htmlFor="email" className={LABEL_CLASS}>
                    Alamat Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="budiman@email.com"
                    className={INPUT_CLASS}
                  />
                </div>

                <div>
                  <label htmlFor="password" className={LABEL_CLASS}>
                    Kata Sandi
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`${INPUT_CLASS} pr-24`}
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

                <div>
                  <label htmlFor="confirmPassword" className={LABEL_CLASS}>
                    Konfirmasi Kata Sandi
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`${INPUT_CLASS} pr-24`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-heading font-bold text-[#404F14] cursor-pointer"
                    >
                      {showConfirmPassword ? 'Sembunyikan' : 'Tampilkan'}
                    </button>
                  </div>
                  {/* TODO: tampilkan pesan error di sini jika password & confirmPassword tidak sama */}
                </div>

                <label className="flex items-start gap-2 pt-2 text-xs text-[#343133]">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#404F14] accent-[#404F14] cursor-pointer"
                  />
                  <span>
                    Saya menyetujui Syarat dan Ketentuan serta Kebijakan Privasi OBC Sport Center.
                  </span>
                </label>

                <button
                  type="submit"
                  className="w-full rounded-lg bg-[#CDF178] py-3 text-sm font-heading font-bold text-[#404F14] hover:bg-[#9AAD3E] transition-colors cursor-pointer"
                >
                  Daftar Sekarang
                </button>
              </form>

              <p className="mt-3 text-center text-xs text-[#343133]">
                Sudah punya akun?{' '}
                <Link to="/login" className="font-heading font-bold text-[#404F14]">
                  Masuk Disini
                </Link>
              </p>

              <p className="mt-4 text-center text-xs text-[#343133]">Atau</p>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="mx-auto mt-3 flex w-full max-w-[248px] items-center justify-center gap-2 rounded-md border border-[#D4D4D4] bg-white py-2 font-heading font-bold text-sm text-[#121212] hover:bg-[#FDFCF7] transition-colors cursor-pointer"
              >
                <GoogleIcon />
                Masuk dengan Google
              </button>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  )
}

export default Register