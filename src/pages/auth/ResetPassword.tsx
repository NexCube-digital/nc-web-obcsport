import { useState, type FormEvent, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CircleCheck, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import loginIllustration from '../../assets/figma/login.jpg'
import logo from '../../assets/logo/unit bisnis/LOGO OBC SPORT CENTER.png'
import { resetPasswordCustomer } from '../../services/authService'

function PasswordVisibilityIcon({ visible }: { visible: boolean }) {
  const Icon = visible ? EyeOff : Eye
  return <Icon size={18} aria-hidden="true" />
}

function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!token) {
      toast.error('Token reset password tidak ditemukan.')
      navigate('/forgot-password')
    }
  }, [token, navigate])

  const validatePasswords = (): boolean => {
    if (!password.trim()) {
      toast.error('Kata sandi baru wajib diisi.')
      return false
    }
    if (password.length < 6) {
      toast.error('Kata sandi minimal 6 karakter.')
      return false
    }
    if (password !== confirmPassword) {
      toast.error('Kata sandi tidak cocok.')
      return false
    }
    return true
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!validatePasswords() || !token) return

    setIsLoading(true)
    try {
      await resetPasswordCustomer(token, password)
      setIsSubmitted(true)
      toast.success('Kata sandi berhasil diperbarui. Silakan login kembali.')
      setTimeout(() => navigate('/login'), 2000)
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.message || 'Gagal mengatur ulang kata sandi.'
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) return null

  return (
    <div className="min-h-[100dvh] bg-[#FDFCF7] font-body text-[#343133] md:grid md:grid-cols-[minmax(0,1fr)_minmax(420px,42%)] md:bg-white">
      <aside className="hidden min-h-[100dvh] flex-col justify-center bg-[#FDFCF7] px-12 lg:px-20 md:flex">
        <Link to="/" className="flex items-center gap-3">
          <img src={logo} alt="OBC Sport Center" className="h-12 w-12 rounded-full object-contain" />
          <span className="font-['Montserrat',sans-serif] text-lg font-extrabold italic text-[#121212]">
            OBC SPORT Center
          </span>
        </Link>

        <div className="mt-12">
          <span className="font-heading text-xs font-bold uppercase tracking-wide text-[#404F14]">
            Pengaturan Ulang Kata Sandi
          </span>
          <h1 className="mt-3 max-w-xl font-heading text-4xl font-bold leading-tight text-[#343133]">
            Buat Kata Sandi Baru untuk Akun Anda
          </h1>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-[#6F6B6E]">
            Masukkan kata sandi baru yang kuat. Pastikan berbeda dengan kata sandi sebelumnya.
          </p>
          <div className="mt-8 h-[clamp(220px,42vh,400px)] overflow-hidden rounded-2xl bg-[#A9AD86]">
            <img
              src={loginIllustration}
              alt="Fasilitas OBC Sport Center"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </aside>

      <main className="flex min-h-[100dvh] items-center justify-center px-6 py-10 md:px-10 lg:px-16">
        <div className="w-full max-w-[440px]">
          <Link to="/" className="mx-auto mb-8 flex w-fit items-center gap-3 md:hidden">
            <img src={logo} alt="OBC Sport Center" className="h-14 w-14 rounded-full object-contain" />
            <span className="font-['Montserrat',sans-serif] text-lg font-extrabold italic text-[#121212]">
              OBC SPORT Center
            </span>
          </Link>

          <h2 className="font-heading text-2xl font-bold text-[#343133] md:text-3xl">
            Atur Ulang Kata Sandi
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[#6F6B6E] md:text-base">
            Masukkan kata sandi baru untuk melanjutkan login ke akun Anda.
          </p>

          {isSubmitted ? (
            <div role="status" className="mt-8 rounded-xl border border-[#D4D4D4] bg-white p-5">
              <CircleCheck size={28} className="text-[#404F14]" aria-hidden="true" />
              <p className="mt-3 font-heading font-bold text-[#343133]">Kata Sandi Berhasil Diperbarui</p>
              <p className="mt-1 text-sm leading-relaxed text-[#6F6B6E]">
                Kata sandi Anda telah berhasil diperbarui. Anda akan diarahkan ke halaman login dalam beberapa saat.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8">
              <div>
                <label htmlFor="new-password" className="mb-2 block text-sm font-heading font-bold text-[#343133]">
                  Kata Sandi Baru
                </label>
                <div className="relative">
                  <input
                    id="new-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Masukan kata sandi baru"
                    autoComplete="new-password"
                    disabled={isLoading}
                    className="h-12 w-full rounded-lg border border-[#D4D4D4] bg-white px-4 pr-12 text-sm text-[#343133] placeholder:text-[#8A8688] focus:border-[#404F14] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer p-2 text-[#404F14]"
                  >
                    <PasswordVisibilityIcon visible={showPassword} />
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <label htmlFor="confirm-password" className="mb-2 block text-sm font-heading font-bold text-[#343133]">
                  Konfirmasi Kata Sandi
                </label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Masukan ulang kata sandi baru"
                    autoComplete="new-password"
                    disabled={isLoading}
                    className="h-12 w-full rounded-lg border border-[#D4D4D4] bg-white px-4 pr-12 text-sm text-[#343133] placeholder:text-[#8A8688] focus:border-[#404F14] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={showConfirmPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer p-2 text-[#404F14]"
                  >
                    <PasswordVisibilityIcon visible={showConfirmPassword} />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="mt-6 h-12 w-full cursor-pointer rounded-lg bg-[#CDF178] font-heading text-sm font-bold text-[#404F14] shadow-[0_2px_6px_rgba(0,0,0,0.15)] transition-colors hover:bg-[#BDE35F] disabled:opacity-50"
              >
                {isLoading ? 'Memproses...' : 'Atur Ulang Kata Sandi'}
              </button>
            </form>
          )}

          <Link
            to="/login"
            className="mt-6 inline-flex items-center gap-2 font-heading text-sm font-bold text-[#404F14] hover:underline"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Kembali ke Login
          </Link>
        </div>
      </main>
    </div>
  )
}

export default ResetPassword
