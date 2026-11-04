import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CircleCheck, Eye, EyeOff, House, X } from 'lucide-react'
import { toast } from 'sonner'
import logo from '../../assets/logo/unit bisnis/sport.webp'
import { useIsMobile } from '../../hooks/useIsMobile'
import ScrollReveal from '../../components/animation/ScrollReveal'
import { getApiErrorMessage } from '../../services/apiService'
import { registerCustomer, loginGoogleCustomer } from '../../services/authService'

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
  const { t } = useTranslation()
  const benefits = t('register.benefits', { returnObjects: true }) as string[]
  const registrationPolicies = t('register.policies', { returnObjects: true }) as Array<{ title: string; items: string[] }>
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false)
  const [hasReadPolicy, setHasReadPolicy] = useState(false)
  const [policyAccepted, setPolicyAccepted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const policyContentRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  useEffect(() => {
    if (!isPolicyModalOpen) return
    const previousOverflow = document.body.style.overflow
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsPolicyModalOpen(false)
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isPolicyModalOpen])

  const openPolicyModal = () => {
    setHasReadPolicy(false)
    setIsPolicyModalOpen(true)
  }

  const handleAgreementChange = (checked: boolean) => {
    if (!checked) {
      setAgreed(false)
      setPolicyAccepted(false)
      return
    }
    if (!policyAccepted) {
      openPolicyModal()
      return
    }
    setAgreed(true)
  }

  const acceptPolicies = () => {
    setPolicyAccepted(true)
    setAgreed(true)
    setIsPolicyModalOpen(false)
  }

  const submitRegistration = async (e: React.FormEvent, includePhone: boolean, requireAgreement: boolean) => {
    e.preventDefault()
    if (fullName.trim().length < 3) {
      toast.error(t('register.nameMinError'))
      return
    }
    if (password.length < 8) {
      toast.error(t('register.passwordMinError'))
      return
    }
    if (password !== confirmPassword) {
      toast.error(t('register.passwordMismatchError'))
      return
    }
    if (includePhone && phone && !/^(\+62|62|0)[0-9]{8,14}$/.test(phone.trim())) {
      toast.error(t('register.phoneFormatError'))
      return
    }
    if (requireAgreement && !agreed) {
      toast.error(t('register.agreementError'))
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
      toast.success(t('register.success'))
      navigate('/home', { replace: true })
    } catch (error) {
      toast.error(getApiErrorMessage(error, t('register.failed')))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    void submitRegistration(e, true, true)
  }

  const handleSubmitMobile = (e: React.FormEvent<HTMLFormElement>) => {
  void submitRegistration(e, false, true)
  }

  const handleGoogleLogin = () => {
  if (!policyAccepted) {
    openPolicyModal()
    return
  }

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
            await loginGoogleCustomer(response.credential)
            toast.success(t('register.googleSuccess'))
            navigate('/home', { replace: true })
          } catch (err: any) {
            toast.error(getApiErrorMessage(err, t('register.googleFailed')))
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
      {/* ===================== MOBILE (< md) ===================== */}
      {isMobile && (
        <ScrollReveal className="min-h-screen">
          <div className="flex min-h-screen flex-col justify-center bg-[#FDFCF7] px-6 py-8 font-heading text-[#343133]">
            <div className="mt-4 flex items-center justify-center gap-3">
              <img
                src={logo}
                alt="OBC Sport Center"
                className="h-[clamp(44px,8vh,64px)] w-[clamp(44px,8vh,64px)] rounded-full object-contain"
              />
              <span className="flex flex-col font-['Montserrat',sans-serif] text-xl font-extrabold italic leading-tight text-[#121212]">
                <span className="uppercase">OBC SPORT</span>
                <span>Center</span>
              </span>
            </div>

            <h1 className="mt-6 text-center text-2xl font-bold text-[#404F14]">
              {t('register.title')}
            </h1>
            <p className="mt-1 text-center font-body text-xs text-[#6F6B6E]">
              {t('register.description')}
            </p>

            <form onSubmit={handleSubmitMobile} className="mt-6 space-y-3">
              <Link to="/" aria-label={t('common.home')} className="-mt-4 ml-auto flex w-fit items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-[#404F14] transition-colors hover:bg-[#E8EDE3]">
                <House size={17} aria-hidden="true" />
                {t('common.home')}
              </Link>
              <div>
                <label htmlFor="m-name" className={M_LABEL_CLASS}>
                  {t('register.fullName')}
                </label>
                <input
                  id="m-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t('register.fullNamePlaceholder')}
                  disabled={isSubmitting}
                  className={M_INPUT_CLASS}
                />
              </div>

              <div>
                <label htmlFor="m-email" className={M_LABEL_CLASS}>
                  {t('register.email')}
                </label>
                <input
                  id="m-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  disabled={isSubmitting}
                  className={M_INPUT_CLASS}
                />
              </div>

              <div>
                <label htmlFor="m-password" className={M_LABEL_CLASS}>
                  {t('register.password')}
                </label>
                <div className="relative">
                  <input
                    id="m-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t('register.passwordPlaceholder')}
                    disabled={isSubmitting}
                    className={`${M_INPUT_CLASS} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#404F14] cursor-pointer"
                  >
                    <EyeIcon visible={showPassword} />
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="m-confirm-password" className={M_LABEL_CLASS}>
                  {t('register.confirmPassword')}
                </label>
                <div className="relative">
                  <input
                    id="m-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t('register.confirmPasswordPlaceholder')}
                    disabled={isSubmitting}
                    className={`${M_INPUT_CLASS} pr-12`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={showConfirmPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#404F14] cursor-pointer"
                  >
                    <EyeIcon visible={showConfirmPassword} />
                  </button>
                </div>
              </div>

              <div className="pt-1">
                <label htmlFor="m-agreed" className="flex items-start gap-2 text-xs leading-5 text-[#343133]">
                  <input
                    id="m-agreed"
                    type="checkbox"
                    checked={agreed}
                    onChange={(event) => handleAgreementChange(event.target.checked)}
                    disabled={isSubmitting}
                    className="mt-1 h-4 w-4 shrink-0 accent-[#404F14]"
                  />
                  <span>{t('register.acceptPolicies')}</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-1 h-[clamp(36px,6vh,48px)] w-full rounded-xl bg-[#CDF178] text-sm font-heading font-bold text-[#404F14] hover:bg-[#9AAD3E] active:bg-[#9AAD3E] transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? t('register.processing') : t('register.submit')}
              </button>
            </form>

            <div className="mt-[clamp(6px,1.4vh,14px)] flex items-center gap-3">
              <span className="h-px flex-1 bg-[#D4D4D4]" />
              <span className="font-body text-xs text-[#343133]">{t('register.or')}</span>
              <span className="h-px flex-1 bg-[#D4D4D4]" />
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              className="mt-3 flex h-[clamp(36px,6vh,48px)] w-full items-center justify-center gap-2 rounded-xl border border-[#D4D4D4] bg-white text-sm font-bold text-[#121212] active:bg-[#FDFCF7] transition-colors cursor-pointer"
            >
              <GoogleIcon />
              {t('register.registerGoogle')}
            </button>

            <p className="mt-4 text-center font-body text-sm text-[#343133]">
              {t('register.alreadyHaveAccount')}{' '}
              <Link
                to="/login"
                className="font-heading font-bold text-[#404F14] underline underline-offset-2"
              >
                {t('register.signIn')}
              </Link>
            </p>
          </div>
        </ScrollReveal>
      )}

      {/* ===================== DESKTOP / TABLET (>= md) ===================== */}
      {!isMobile && (
        <div className="flex h-[100dvh] flex-col overflow-hidden bg-white font-body text-[#343133]">
          <main className="min-h-0 flex-1">
            <section className="mx-auto flex h-full w-full max-w-[1400px] flex-col gap-6 px-8 pb-6 pt-2 md:px-12 lg:grid lg:grid-cols-[1fr_clamp(460px,36vw,560px)] lg:items-center lg:gap-12 lg:px-8">
              {/* Kolom Kiri */}
              <ScrollReveal delay={0} className="hidden lg:block">
                <div className="max-w-lg">
                  <h1 className="font-heading text-3xl font-extrabold leading-tight text-[#343133] lg:text-4xl">
                    {t('register.desktopTitle')}
                  </h1>
                  <p className="mt-3 text-sm leading-relaxed text-[#6F6B6E]">
                    {t('register.desktopDescription')}
                  </p>

                  <ul className="mt-6 space-y-3">
                    {benefits.map((benefit, index) => (
                      <li key={index} className="flex items-center gap-2.5 text-sm font-medium text-[#404F14]">
                        <CircleCheck size={18} className="shrink-0 text-[#404F14]" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </ScrollReveal>

              {/* Kolom Kanan: Kartu Form */}
              <ScrollReveal delay={120}>
                <div className="mx-auto w-full max-w-[520px] rounded-2xl border border-[#D4D4D4] bg-white p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="font-heading text-xl font-bold text-[#343133]">
                      {t('register.formTitle')}
                    </h2>
                    <Link to="/" aria-label={t('common.backToHome')} className="flex shrink-0 items-center gap-2 rounded-lg px-2.5 py-1.5 text-sm font-semibold leading-none text-[#404F14] transition-colors hover:bg-[#F5FAF3]">
                      <House size={18} className="shrink-0" aria-hidden="true" />
                      <span>Home</span>
                    </Link>
                  </div>
                  <p className="mt-0.5 text-xs text-[#6F6B6E]">
                    {t('register.formDescription')}
                  </p>

                  <form onSubmit={handleSubmit} className="mt-4 space-y-2.5">
                    <div>
                      <label htmlFor="fullName" className={LABEL_CLASS}>
                        {t('register.fullName')}
                      </label>
                      <input
                        id="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={t('register.fullNamePlaceholder')}
                        disabled={isSubmitting}
                        className={INPUT_CLASS}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="email" className={LABEL_CLASS}>
                          {t('register.email')}
                        </label>
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="nama@email.com"
                          disabled={isSubmitting}
                          className={INPUT_CLASS}
                        />
                      </div>
                      <div>
                        <label htmlFor="phone" className={LABEL_CLASS}>
                          {t('register.phone')}
                        </label>
                        <input
                          id="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="08123456789"
                          disabled={isSubmitting}
                          className={INPUT_CLASS}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="password" className={LABEL_CLASS}>
                          {t('register.password')}
                        </label>
                        <div className="relative">
                          <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder={t('register.passwordPlaceholder')}
                            disabled={isSubmitting}
                            className={`${INPUT_CLASS} pr-10`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((p) => !p)}
                            aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#404F14] cursor-pointer"
                          >
                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="confirmPassword" className={LABEL_CLASS}>
                          {t('register.confirmPassword')}
                        </label>
                        <div className="relative">
                          <input
                            id="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder={t('register.confirmPasswordPlaceholder')}
                            disabled={isSubmitting}
                            className={`${INPUT_CLASS} pr-10`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword((p) => !p)}
                            aria-label={showConfirmPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#404F14] cursor-pointer"
                          >
                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <label className="flex items-start gap-2 pt-1 text-xs text-[#343133]">
                      <input
                        type="checkbox"
                        checked={agreed}
                        onChange={(e) => handleAgreementChange(e.target.checked)}
                        disabled={isSubmitting}
                        className="mt-0.5 h-4 w-4 shrink-0 rounded border-[#404F14] accent-[#404F14] cursor-pointer"
                      />
                      <span>
                        {t('register.acceptPolicies')}
                      </span>
                    </label>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full rounded-lg bg-[#CDF178] py-[clamp(7px,1.3vh,10px)] text-sm font-heading font-bold text-[#404F14] hover:bg-[#9AAD3E] transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {isSubmitting ? t('register.processing') : t('register.submit')}
                    </button>
                  </form>
                  <p className="mt-[clamp(6px,1.4vh,12px)] text-center text-xs text-[#343133]">
                    {t('register.alreadyHaveAccount')}{' '}
                    <Link to="/login" className="font-heading font-bold text-[#404F14]">
                      {t('register.signInHere')}
                    </Link>
                  </p>

                  <p className="mt-2 text-center text-xs text-[#343133]">{t('register.or')}</p>

                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="mx-auto mt-2 flex w-full max-w-[280px] items-center justify-center gap-2 rounded-md border border-[#D4D4D4] bg-white py-1.5 font-heading text-xs font-bold text-[#121212] hover:bg-[#FDFCF7] transition-colors cursor-pointer"
                  >
                    <GoogleIcon />
                    {t('register.registerGoogle')}
                  </button>
                </div>
              </ScrollReveal>
            </section>
          </main>
        </div>
      )}

      {isPolicyModalOpen && (
        <div
          className="fixed inset-0 z-[100] grid place-items-center bg-black/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setIsPolicyModalOpen(false)
          }}
        >
          <section role="dialog" aria-modal="true" aria-labelledby="registration-policy-title" className="flex max-h-[90dvh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
            <header className="flex items-start justify-between gap-4 border-b border-[#E5E5E5] px-5 py-4 sm:px-6">
              <div>
                <h2 id="registration-policy-title" className="font-heading text-lg font-bold text-[#343133]">{t('register.policyModalTitle')}</h2>
                <p className="mt-1 text-sm text-[#6F6B6E]">{t('register.policyModalHint')}</p>
              </div>
              <button type="button" onClick={() => setIsPolicyModalOpen(false)} aria-label={t('common.close')} className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-[#D4D4D4] text-[#343133] hover:bg-[#FDFCF7]">
                <X size={18} aria-hidden="true" />
              </button>
            </header>
            <div
              ref={policyContentRef}
              onScroll={(event) => {
                const element = event.currentTarget
                if (element.scrollTop + element.clientHeight >= element.scrollHeight - 8) setHasReadPolicy(true)
              }}
              className="min-h-0 max-h-[min(60dvh,560px)] flex-1 space-y-6 overflow-y-auto px-5 py-5 text-sm leading-6 text-[#343133] sm:px-6"
            >
              {registrationPolicies.map((section) => (
                <section key={section.title}>
                  <h3 className="font-heading text-base font-bold text-[#265021]">{section.title}</h3>
                  <ol className="mt-3 list-decimal space-y-3 pl-5">
                    {section.items.map((item) => <li key={item}>{item}</li>)}
                  </ol>
                </section>
              ))}
            </div>
            <footer className="flex flex-col-reverse gap-2 border-t border-[#E5E5E5] px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
              <button type="button" onClick={() => setIsPolicyModalOpen(false)} className="h-10 rounded-lg border border-[#D4D4D4] px-4 text-sm font-semibold text-[#343133] hover:bg-[#FDFCF7]">
                {t('common.close')}
              </button>
              <button type="button" onClick={acceptPolicies} disabled={!hasReadPolicy} className="h-10 rounded-lg bg-[#CDF178] px-4 text-sm font-bold text-[#404F14] hover:bg-[#9AAD3E] disabled:cursor-not-allowed disabled:opacity-50">
                {hasReadPolicy ? t('register.policyReadAndAgree') : t('register.policyScrollToAgree')}
              </button>
            </footer>
          </section>
        </div>
      )}
    </>
  )
}

export default Register
