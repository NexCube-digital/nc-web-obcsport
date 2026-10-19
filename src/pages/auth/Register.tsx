import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CircleCheck, Eye, EyeOff, House } from 'lucide-react'
import { toast } from 'sonner'
import logo from '../../assets/logo/unit bisnis/LOGO OBC SPORT CENTER.png'
import { useIsMobile } from '../../hooks/useIsMobile'
import ScrollReveal from '../../components/animation/ScrollReveal'
import { getApiErrorMessage } from '../../services/apiService'
import { registerCustomer } from '../../services/authService'

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

const BENEFITS: string[] = [
  'Booking 100% Instan & QRIS Otomatis',
  'Akses Premium Court Booking & Member Club',
  'Tracking Sesi Akademi & Modul Pelatihan',
]

/* Desktop: padding input fluid mengikuti tinggi layar */
const INPUT_CLASS =
  'w-full rounded-lg border border-[#D4D4D4] bg-[#FDFCF7] px-3 py-[clamp(6px,1.1vh,10px)] text-sm placeholder:text-[#343133] focus:outline-none focus:border-[#404F14]'
const LABEL_CLASS = 'mb-[clamp(2px,0.4vh,4px)] block text-xs font-heading font-bold text-[#343133]'

/* Mobile: tinggi input fluid (36px - 48px) */
const M_INPUT_CLASS =
  'h-[clamp(36px,6vh,48px)] w-full rounded-xl border border-[#D4D4D4] bg-[#FDFCF7] px-4 font-body text-sm text-[#343133] placeholder:text-[#343133] focus:outline-none focus:border-[#404F14]'
const M_LABEL_CLASS =
  'mb-[clamp(2px,0.6vh,6px)] block text-xs font-heading font-bold text-[#343133]'

function Register() {
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  const submitRegistration = async (e: React.FormEvent, includePhone: boolean, requireAgreement: boolean) => {
    e.preventDefault()
    if (fullName.trim().length < 3) {
      toast.error('Nama harus terdiri dari minimal 3 karakter.')
      return
    }
    if (password.length < 12 || password.length > 128 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
      toast.error('Password harus 12-128 karakter dan mengandung huruf kecil, huruf besar, serta angka.')
      return
    }
    if (password !== confirmPassword) {
      toast.error('Konfirmasi password tidak sama.')
      return
    }
    if (includePhone && phone && !/^(\+62|62|0)[0-9]{8,14}$/.test(phone.trim())) {
      toast.error('Format nomor telepon Indonesia tidak valid.')
      return
    }
    if (requireAgreement && !agreed) {
      toast.error('Harap setujui syarat dan ketentuan terlebih dahulu.')
      return
    }

    setIsSubmitting(true)
    try {
      await registerCustomer({
        name: fullName.trim(),
        email: email.trim(),
        password,
        ...(includePhone && phone.trim() ? { phone: phone.trim() } : {}),
      })
      toast.success('Pendaftaran berhasil.')
      navigate('/home', { replace: true })
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Pendaftaran gagal. Periksa koneksi dan coba lagi.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    void submitRegistration(e, true, true)
  }

  const handleSubmitMobile = (e: React.FormEvent<HTMLFormElement>) => {
    void submitRegistration(e, false, false)
  }

  const handleGoogleLogin = () => {
    // TODO: sambungkan ke alur OAuth Google (services/authService.js)
    navigate('/auth/google')
  }

  return (
    <>
      {/* ===================== MOBILE (< md) — satu layar, tanpa scroll ===================== */}
      {isMobile && (
      <ScrollReveal className="h-dvh">
      <div className="relative flex h-full flex-col justify-center overflow-hidden bg-white px-5 py-[clamp(8px,2vh,24px)] font-heading text-[#343133]">
        <Link
          to="/"
          aria-label="Kembali ke Home"
          className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-[#404F14] transition-colors hover:bg-[#F5FAF3]"
        >
          <House size={17} aria-hidden="true" />
          Home
        </Link>
        <Link to="/" className="mx-auto flex shrink-0 items-center gap-3">
          <img
            src={logo}
            alt="OBC Sport Center"
            className="h-[clamp(40px,8vh,68px)] w-[clamp(40px,8vh,68px)] rounded-full object-contain"
          />
          <span className="flex flex-col font-['Montserrat',sans-serif] text-[clamp(14px,2.5vh,18px)] font-extrabold italic leading-[1.05] text-[#343133]">
            <span className="uppercase">OBC SPORT</span>
            <span>Center</span>
          </span>
        </Link>

        <h1 className="mt-[clamp(8px,2vh,24px)] text-[clamp(18px,3vh,22px)] font-bold leading-tight text-[#343133]">
          Daftar Akun Baru
        </h1>
        <p className="mt-1 font-body text-[clamp(11px,1.9vh,14px)] leading-snug text-[#6F6B6E]">
          Bergabunglah dan nikmati kemudahan akses olahraga
        </p>

        <form onSubmit={handleSubmitMobile} className="mt-[clamp(8px,1.8vh,20px)] space-y-[clamp(6px,1.4vh,12px)]">
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
            disabled={isSubmitting}
            className="mt-1 h-[clamp(36px,6vh,48px)] w-full rounded-xl bg-[#CDF178] text-sm font-heading font-bold text-[#404F14] hover:bg-[#9AAD3E] active:bg-[#9AAD3E] transition-colors cursor-pointer"
          >
            {isSubmitting ? 'Memproses...' : 'Daftar Sekarang'}
          </button>
        </form>
        <div className="mt-[clamp(6px,1.4vh,14px)] flex items-center gap-3">
          <span className="h-px flex-1 bg-[#D4D4D4]" />
          <span className="font-body text-xs text-[#343133]">Atau</span>
          <span className="h-px flex-1 bg-[#D4D4D4]" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="mt-[clamp(6px,1.4vh,14px)] flex h-[clamp(36px,6vh,48px)] w-full items-center justify-center gap-2 rounded-xl border border-[#D4D4D4] bg-white text-sm font-heading font-bold text-[#121212] active:bg-[#FDFCF7] transition-colors cursor-pointer"
        >
          <GoogleIcon />
          Masuk dengan Google
        </button>

        <p className="mt-[clamp(8px,2vh,20px)] text-center font-body text-sm text-[#343133]">
          Sudah memiliki akun?{' '}
          <Link
            to="/login"
            className="font-heading font-bold text-[#404F14] underline underline-offset-2"
          >
            Masuk
          </Link>
        </p>
      </div>
      </ScrollReveal>
      )}

      {/* ===================== DESKTOP (>= md) — satu layar, tanpa scroll ===================== */}
      {!isMobile && (
      <div className="relative h-[100dvh] flex flex-col overflow-hidden bg-white font-body text-[#343133]">
        <Link
          to="/"
          aria-label="Kembali ke Home"
          className="absolute left-8 top-6 z-10 inline-flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-semibold text-[#404F14] transition-colors hover:bg-[#F5FAF3]"
        >
          <House size={18} aria-hidden="true" />
          Home
        </Link>
        <main className="flex min-h-0 flex-1 items-center">
          <section className="mx-auto grid w-full max-w-[1120px] items-center gap-8 px-6 py-[clamp(8px,2vh,20px)] lg:grid-cols-[1fr_420px] lg:gap-14">
            {/* Kolom kiri */}
            <ScrollReveal>
            <div>
              <h1 className="font-heading text-2xl font-bold leading-tight text-[#343133] lg:text-3xl">
                Buat Akun OBC Anda
              </h1>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-[#6F6B6E]">
                Bergabunglah sekarang untuk menikmati seluruh keuntungan sewa lapangan
                instan dan pendaftaran akademi. Satu akun untuk Futsal, Badminton,
                Basket, dan Billiard.
              </p>

              <ul className="mt-4 space-y-2">
                {BENEFITS.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-1.5 text-sm text-[#6F6B6E]">
                    <CircleCheck size={16} className="shrink-0 text-[#404F14]" aria-hidden="true" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            </ScrollReveal>

            {/* Kolom kanan: kartu form */}
            <ScrollReveal className="w-full" delay={140}>
            <div className="w-full rounded-2xl border border-[#D4D4D4] bg-white p-[clamp(14px,2.6vh,24px)] shadow-[0_4px_16px_rgba(0,0,0,0.08)]">
              <h2 className="font-heading text-xl font-bold text-[#343133]">
                Daftar Akun Baru
              </h2>
              <p className="mt-1 text-sm text-[#343133]">
                Mulai rasakan kemudahan pemesanan instan
              </p>

              <form onSubmit={handleSubmit} className="mt-[clamp(8px,1.8vh,16px)] space-y-[clamp(6px,1.3vh,12px)]">
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
                      className={`${INPUT_CLASS} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                      className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center text-[#404F14] cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={14} aria-hidden="true" /> : <Eye size={14} aria-hidden="true" />}
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
                      className={`${INPUT_CLASS} pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      aria-label={showConfirmPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                      className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center text-[#404F14] cursor-pointer"
                    >
                      {showConfirmPassword ? <EyeOff size={14} aria-hidden="true" /> : <Eye size={14} aria-hidden="true" />}
                    </button>
                  </div>
                  {/* TODO: tampilkan pesan error jika password & confirmPassword tidak sama */}
                </div>

                <label className="flex items-start gap-2 pt-1 text-xs text-[#343133]">
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
                  disabled={isSubmitting}
                  className="w-full rounded-lg bg-[#CDF178] py-[clamp(7px,1.3vh,10px)] text-sm font-heading font-bold text-[#404F14] hover:bg-[#9AAD3E] transition-colors cursor-pointer"
                >
                  {isSubmitting ? 'Memproses...' : 'Daftar Sekarang'}
                </button>
              </form>
              <p className="mt-[clamp(6px,1.4vh,12px)] text-center text-xs text-[#343133]">
                Sudah punya akun?{' '}
                <Link to="/login" className="font-heading font-bold text-[#404F14]">
                  Masuk Disini
                </Link>
              </p>

              <p className="mt-[clamp(4px,1vh,12px)] text-center text-xs text-[#343133]">Atau</p>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="mx-auto mt-2 flex w-full max-w-[248px] items-center justify-center gap-2 rounded-md border border-[#D4D4D4] bg-white py-[clamp(5px,1vh,8px)] font-heading font-bold text-sm text-[#121212] hover:bg-[#FDFCF7] transition-colors cursor-pointer"
              >
                <GoogleIcon />
                Masuk dengan Google
              </button>
            </div>
            </ScrollReveal>
          </section>
        </main>
      </div>
      )}
    </>
  )
}

export default Register