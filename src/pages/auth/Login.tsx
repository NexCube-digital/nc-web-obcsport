import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, House } from 'lucide-react'
import { toast } from 'sonner'
import loginIllustration from '../../assets/images/login.webp'
import logo from '../../assets/logo/unit bisnis/sport.webp'
import { useIsMobile } from '../../hooks/useIsMobile'
import ScrollReveal from '../../components/animation/ScrollReveal'
import { getApiErrorMessage } from '../../services/apiService'
import { loginAutomatically, loginGoogleCustomer, type StaffAuthSession } from '../../services/authService'

const COMPRO_APP_URL = (import.meta.env.VITE_COMPRO_APP_URL || 'http://localhost:5174').replace(/\/+$/, '')

function handoffStaffSession(
  session: StaffAuthSession,
  rememberMe: boolean,
  bridgeWindow: Window,
  messages: { sessionFailed: string; timeout: string },
): Promise<void> {
  const comproOrigin = new URL(COMPRO_APP_URL).origin

  return new Promise((resolve, reject) => {
    let bridgeReady = false
    let sessionSent = false

    const cleanup = () => {
      window.removeEventListener('message', handleMessage)
      window.clearTimeout(timeoutId)
    }

    const sendSession = () => {
      if (!bridgeReady || sessionSent) return
      sessionSent = true
      bridgeWindow.postMessage({ type: 'OBC_STAFF_SESSION', session, rememberMe }, comproOrigin)
    }

    const handleMessage = (event: MessageEvent<{ type?: string }>) => {
      if (event.source !== bridgeWindow || event.origin !== comproOrigin) return

      if (event.data?.type === 'OBC_STAFF_BRIDGE_READY') {
        bridgeReady = true
        sendSession()
      } else if (event.data?.type === 'OBC_STAFF_SESSION_STORED') {
        cleanup()
        bridgeWindow.close()
        resolve()
      } else if (event.data?.type === 'OBC_STAFF_BRIDGE_ERROR') {
        cleanup()
        bridgeWindow.close()
        reject(new Error(messages.sessionFailed))
      }
    }

    const timeoutId = window.setTimeout(() => {
      cleanup()
      bridgeWindow.close()
      reject(new Error(messages.timeout))
    }, 20_000)

    window.addEventListener('message', handleMessage)
    bridgeWindow.location.replace(`${COMPRO_APP_URL}/auth/bridge`)
  })
}

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

function PasswordVisibilityIcon({ visible }: { visible: boolean }) {
  const Icon = visible ? EyeOff : Eye
  return <Icon size={22} aria-hidden="true" />
}

function LoginPage() {
  const { t } = useTranslation()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  const navigateAfterLogin = () => {
    const from = location.state?.from
    const destination = from?.pathname
      ? `${from.pathname}${from.search ?? ''}${from.hash ?? ''}`
      : '/home'
    navigate(destination, { replace: true })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error(t('auth.missingCredentials'))
      return
    }

    const bridgeWindow = window.open('about:blank', '_blank')
    setIsSubmitting(true)
    try {
      const result = await loginAutomatically(email.trim(), password, rememberMe)
      if (result.principalType === 'staff') {
        if (!bridgeWindow) {
          throw new Error('Izinkan pop-up untuk melanjutkan login staff.')
        }
        await handoffStaffSession(result.session, rememberMe, bridgeWindow, {
          sessionFailed: t('auth.staffSessionFailed'),
          timeout: t('auth.staffHandoffTimeout'),
        })
        window.location.assign(`${COMPRO_APP_URL}/dashboard`)
      } else {
        bridgeWindow?.close()
        toast.success(t('auth.loginSuccess'))
        await new Promise(resolve => setTimeout(resolve, 100))
        navigateAfterLogin()
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('auth.loginFailed')))
      bridgeWindow?.close()
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleGoogleLogin = () => {
    if (typeof window !== 'undefined' && (window as any).google?.accounts?.id) {
      const google = (window as any).google
      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
      if (!clientId) {
        toast.info(t('auth.googleClientMissing'))
        return
      }

      google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: any) => {
          setIsSubmitting(true)
          try {
            await loginGoogleCustomer(response.credential, rememberMe)
            toast.success(t('auth.googleSuccess'))
            // Navigate immediately - user should be in storage by now
            navigateAfterLogin()
          } catch (err: any) {
            toast.error(getApiErrorMessage(err, t('auth.googleFailed')))
          } finally {
            setIsSubmitting(false)
          }
        },
      })
      google.accounts.id.prompt()
    } else {
      toast.info(t('auth.googleLoading'))
    }
  }

  return (
    <>
      {/* ===================== MOBILE (< md) — satu layar, tanpa scroll ===================== */}
      {isMobile && (
      <ScrollReveal className="h-[100dvh]">
      <div className="relative flex h-full flex-col justify-center overflow-hidden bg-[#FDFCF7] px-6 py-[clamp(8px,2.5vh,40px)] font-heading text-[#343133]">
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
          {t('auth.welcomeBack')}
        </h1>
        <p className="mt-1.5 font-body text-[clamp(12px,2vh,15px)] leading-snug text-[#6F6B6E]">
          {t('auth.loginDescription')}
        </p>

        <form onSubmit={handleSubmit} className="mt-[clamp(10px,2.6vh,28px)]">
          <Link to="/" aria-label={t('common.backToHome')} className="-mt-4 mb-1 ml-auto flex w-fit items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-[#404F14] transition-colors hover:bg-[#E8EDE3]">
            <House size={17} aria-hidden="true" />
            {t('common.home')}
          </Link>
          <label htmlFor="m-email" className="mb-[clamp(3px,0.9vh,8px)] block text-xs font-bold text-[#121212]">
            {t('auth.email')}
          </label>
          <input
            id="m-email"
            type="email"
            inputMode="email"
            autoComplete="username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('auth.emailPlaceholder')}
            disabled={isSubmitting}
            className="h-[clamp(40px,6.8vh,54px)] w-full rounded-xl border border-[#E5E5E5] bg-white px-4 font-body text-sm text-[#343133] placeholder:text-[#8A8688] focus:outline-none focus:border-[#404F14]"
          />

          <label htmlFor="m-password" className="mb-[clamp(3px,0.9vh,8px)] mt-[clamp(8px,2.2vh,20px)] block text-xs font-bold text-[#121212]">
            {t('auth.password')}
          </label>
          <div className="relative">
            <input
              id="m-password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('auth.passwordPlaceholder')}
              disabled={isSubmitting}
              className="h-[clamp(40px,6.8vh,54px)] w-full rounded-xl border border-[#E5E5E5] bg-white pl-4 pr-12 font-body text-sm text-[#343133] placeholder:text-[#8A8688] focus:outline-none focus:border-[#404F14]"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#343133] cursor-pointer"
            >
              <PasswordVisibilityIcon visible={showPassword} />
            </button>
          </div>

          <div className="mt-[clamp(6px,1.8vh,20px)] flex items-center justify-between gap-3">
            <label htmlFor="m-remember" className="inline-flex items-center gap-2 text-xs text-[#343133]">
              <input
                id="m-remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 accent-[#404F14]"
              />
              {t('auth.rememberMe')}
            </label>
            <Link
              to="/forgot-password"
              className="shrink-0 text-xs font-bold text-[#404F14] underline underline-offset-2"
            >
              {t('auth.forgotPassword')}
            </Link>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-[clamp(8px,1.8vh,20px)] h-[clamp(40px,6.8vh,54px)] w-full rounded-xl bg-[#CDF178] text-base font-bold text-[#343133] shadow-[0_6px_16px_rgba(154,173,62,0.35)] active:bg-[#9AAD3E] transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSubmitting ? t('auth.processing') : t('auth.loginNow')}
          </button>
        </form>
        <div className="mt-[clamp(8px,1.8vh,20px)] flex items-center gap-3">
          <span className="h-px flex-1 bg-[#D4D4D4]" />
          <span className="font-body text-xs text-[#343133]">{t('auth.or')}</span>
          <span className="h-px flex-1 bg-[#D4D4D4]" />
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className="mt-[clamp(8px,1.8vh,20px)] flex h-[clamp(40px,6.8vh,54px)] w-full items-center justify-center gap-2 rounded-xl border border-[#D4D4D4] bg-white text-sm font-bold text-[#121212] active:bg-[#FDFCF7] transition-colors cursor-pointer"
        >
          <GoogleIcon />
          {t('auth.loginGoogle')}
        </button>

        <p className="mt-[clamp(10px,2.4vh,28px)] text-center font-body text-sm text-[#343133]">
          {t('auth.noAccount')}{' '}
          <Link
            to="/register"
            className="font-heading font-bold text-[#404F14] underline underline-offset-2"
          >
            {t('auth.registerNow')}
          </Link>
        </p>
      </div>
      </ScrollReveal>
      )}

      {/*  DESKTOP / TABLET (>= md) — satu layar, TANPA scroll  */}
      {!isMobile && (
      <div className="flex h-[100dvh] flex-col overflow-hidden bg-white font-body text-[#343133]">
        <main className="min-h-0 flex-1">
          {/* Tablet: kolom flex setinggi main. Desktop (lg): grid 2 kolom */}
          <section className="mx-auto flex h-full w-full max-w-[1400px] flex-col gap-[clamp(12px,2.2vh,32px)] px-8 pb-[clamp(12px,2.5vh,32px)] pt-[clamp(4px,1vh,16px)] md:px-12 lg:grid lg:grid-cols-[1fr_clamp(460px,34vw,560px)] lg:items-center lg:gap-[clamp(40px,6vw,96px)] lg:px-8 lg:py-[clamp(8px,2vh,32px)]">
            {/* Kolom kiri */}
            <ScrollReveal delay={0} className="flex min-h-0 flex-1 flex-col lg:block lg:flex-none">
            <div className="mx-auto flex min-h-0 w-full max-w-[560px] flex-1 flex-col text-center lg:mx-0 lg:block lg:max-w-none lg:flex-none lg:text-left">
              <h1 className="shrink-0 font-heading text-[clamp(24px,3.6vh,48px)] font-bold leading-tight text-[#343133] lg:text-[clamp(28px,4.8vh,48px)]">
                {t('auth.desktopTitle')}
              </h1>
              <p className="mx-auto mt-[clamp(8px,1.5vh,20px)] max-w-xl shrink-0 text-[clamp(13px,1.8vh,18px)] leading-relaxed text-[#6F6B6E] lg:mx-0 lg:text-[clamp(14px,2vh,18px)]">
                {t('auth.desktopDescription')}
              </p>

              {/* Tablet: ilustrasi mengisi sisa tinggi (flex-1), disembunyikan jika layar pendek.
                  Desktop: tinggi tetap berbasis vh */}
              <div className="relative mt-[clamp(12px,2.4vh,32px)] min-h-0 flex-1 overflow-hidden rounded-2xl bg-[#A9AD86] max-lg:max-h-[42vh] max-lg:[@media(max-height:820px)]:hidden lg:h-[clamp(140px,36vh,400px)] lg:flex-none">
                <img
                  src={loginIllustration}
                  alt={t('auth.illustrationAlt')}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
            </div>
            </ScrollReveal>

            {/* Kolom kanan: kartu form */}
            <ScrollReveal className="w-full shrink-0" delay={140}>
            <div className="mx-auto w-full max-w-[560px] rounded-2xl border border-[#D4D4D4] bg-white p-[clamp(16px,3.2vh,40px)] shadow-[0_4px_20px_rgba(0,0,0,0.08)] lg:mx-0 lg:max-w-none lg:p-[clamp(16px,3.6vh,40px)]">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-heading text-[clamp(20px,3.2vh,30px)] font-bold text-[#343133]">
                  {t('auth.welcomeBack')}
                </h2>
                <Link to="/" aria-label={t('common.backToHome')} className="flex shrink-0 items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-semibold leading-none text-[#404F14] transition-colors hover:bg-[#F5FAF3]">
                  <House size={18} className="shrink-0" aria-hidden="true" />
                  <span>{t('common.home')}</span>
                </Link>
              </div>
              <p className="mt-1 text-[clamp(13px,1.9vh,17px)] text-[#343133]">
                {t('auth.loginDescription')}
              </p>

              <form
                onSubmit={handleSubmit}
                className="mt-[clamp(10px,2.2vh,28px)] space-y-[clamp(8px,1.8vh,20px)]"
              >
                <div>
                  <label
                    htmlFor="email"
                    className="mb-[clamp(4px,0.8vh,8px)] block text-[clamp(12px,1.7vh,15px)] font-heading font-bold text-[#343133]"
                  >
                    {t('auth.email')}
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('auth.emailPlaceholder')}
                    disabled={isSubmitting}
                    className="w-full rounded-lg border border-[#D4D4D4] bg-[#FDFCF7] px-4 py-[clamp(9px,1.8vh,18px)] text-[clamp(13px,1.9vh,17px)] placeholder:text-[#343133] focus:outline-none focus:border-[#404F14]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-[clamp(4px,0.8vh,8px)] block text-[clamp(12px,1.7vh,15px)] font-heading font-bold text-[#343133]"
                  >
                    {t('auth.password')}
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={t('auth.passwordPlaceholder')}
                      disabled={isSubmitting}
                      className="w-full rounded-lg border border-[#D4D4D4] bg-[#FDFCF7] px-4 py-[clamp(9px,1.8vh,18px)] pr-12 text-[clamp(13px,1.9vh,17px)] placeholder:text-[#343133] focus:outline-none focus:border-[#404F14]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer p-2 text-[#404F14]"
                    >
                      <PasswordVisibilityIcon visible={showPassword} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <label htmlFor="remember" className="inline-flex items-center gap-2 text-[clamp(12px,1.7vh,15px)] text-[#343133]">
                    <input
                      id="remember"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 accent-[#404F14]"
                    />
                    {t('auth.rememberMe')}
                  </label>
                  <Link to="/forgot-password" className="shrink-0 text-[clamp(12px,1.7vh,15px)] font-bold text-[#404F14] underline underline-offset-2">
                    {t('auth.forgotPassword')}
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-lg bg-[#CDF178] py-[clamp(10px,1.9vh,18px)] text-[clamp(14px,2vh,17px)] font-heading font-bold text-[#404F14] shadow-[0_2px_6px_rgba(0,0,0,0.15)] hover:bg-[#9AAD3E] transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? t('auth.processing') : t('auth.loginNow')}
                </button>
              </form>
              <p className="mt-[clamp(8px,1.6vh,20px)] text-center text-[clamp(13px,1.8vh,16px)] text-[#343133]">
                {t('auth.noAccount')}{' '}
                <Link to="/register" className="font-heading font-bold text-[#404F14]">
                  {t('auth.registerNow')}
                </Link>
              </p>

              <p className="mt-[clamp(4px,0.9vh,12px)] text-center text-[clamp(12px,1.6vh,14px)] text-[#343133]">
                {t('auth.or')}
              </p>

              <button
                type="button"
                onClick={handleGoogleLogin}
                className="mx-auto mt-[clamp(6px,1.1vh,12px)] flex w-full max-w-[300px] items-center justify-center gap-2 rounded-md border border-[#D4D4D4] bg-white py-[clamp(7px,1.3vh,12px)] font-heading text-[clamp(13px,1.8vh,16px)] font-bold text-[#121212] hover:bg-[#FDFCF7] transition-colors cursor-pointer"
              >
                <GoogleIcon />
                {t('auth.loginGoogle')}
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

export default LoginPage
