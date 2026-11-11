import type { FormEventHandler } from 'react'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, House } from 'lucide-react'
import { Link } from 'react-router-dom'
import logo from '../../assets/logo/unit bisnis/sport.webp'
import ScrollReveal from '../../components/animation/ScrollReveal'

type LoginMobileViewProps = {
  email: string
  password: string
  showPassword: boolean
  rememberMe: boolean
  isSubmitting: boolean
  onEmailChange: (email: string) => void
  onPasswordChange: (password: string) => void
  onTogglePassword: () => void
  onRememberMeChange: (rememberMe: boolean) => void
  onSubmit: FormEventHandler<HTMLFormElement>
  onGoogleLogin: () => void
}

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

function LoginMobileView({
  email,
  password,
  showPassword,
  rememberMe,
  isSubmitting,
  onEmailChange,
  onPasswordChange,
  onTogglePassword,
  onRememberMeChange,
  onSubmit,
  onGoogleLogin,
}: LoginMobileViewProps) {
  const { t } = useTranslation()
  const PasswordIcon = showPassword ? EyeOff : Eye

  return (
    <ScrollReveal className="h-[100dvh]">
      <div className="relative flex h-full flex-col justify-center overflow-hidden bg-[#FDFCF7] px-6 py-[clamp(8px,2.5vh,40px)] font-heading text-[#343133]">
        <div className="-mt-6 flex justify-end">
          <Link to="/" aria-label={t('common.backToHome')} className="flex w-fit items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-[#404F14] transition-colors hover:bg-[#E8EDE3]">
            <House size={17} aria-hidden="true" />
            {t('common.home')}
          </Link>
        </div>
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

        <form onSubmit={onSubmit} className="mt-[clamp(10px,2.6vh,28px)]">
          <label htmlFor="m-email" className="mb-[clamp(3px,0.9vh,8px)] block text-xs font-bold text-[#121212]">
            {t('auth.email')}
          </label>
          <input
            id="m-email"
            type="email"
            inputMode="email"
            autoComplete="username"
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
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
              onChange={(event) => onPasswordChange(event.target.value)}
              placeholder={t('auth.passwordPlaceholder')}
              disabled={isSubmitting}
              className="h-[clamp(40px,6.8vh,54px)] w-full rounded-xl border border-[#E5E5E5] bg-white pl-4 pr-12 font-body text-sm text-[#343133] placeholder:text-[#8A8688] focus:outline-none focus:border-[#404F14]"
            />
            <button
              type="button"
              onClick={onTogglePassword}
              aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[#343133] cursor-pointer"
            >
              <PasswordIcon size={22} aria-hidden="true" />
            </button>
          </div>

          <div className="mt-[clamp(6px,1.8vh,20px)] flex items-center justify-between gap-3">
            <label htmlFor="m-remember" className="inline-flex items-center gap-2 text-xs text-[#343133]">
              <input
                id="m-remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => onRememberMeChange(event.target.checked)}
                className="h-4 w-4 accent-[#404F14]"
              />
              {t('auth.rememberMe')}
            </label>
            <Link to="/forgot-password" className="shrink-0 text-xs font-bold text-[#404F14] underline underline-offset-2">
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
          onClick={onGoogleLogin}
          className="mt-[clamp(8px,1.8vh,20px)] flex h-[clamp(40px,6.8vh,54px)] w-full items-center justify-center gap-2 rounded-xl border border-[#D4D4D4] bg-white text-sm font-bold text-[#121212] active:bg-[#FDFCF7] transition-colors cursor-pointer"
        >
          <GoogleIcon />
          {t('auth.loginGoogle')}
        </button>

        <p className="mt-[clamp(10px,2.4vh,28px)] text-center font-body text-sm text-[#343133]">
          {t('auth.noAccount')}{' '}
          <Link to="/register" className="font-heading font-bold text-[#404F14] underline underline-offset-2">
            {t('auth.registerNow')}
          </Link>
        </p>
      </div>
    </ScrollReveal>
  )
}

export default LoginMobileView