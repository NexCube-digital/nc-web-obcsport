import type { FormEventHandler } from 'react'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff, House } from 'lucide-react'
import { Link } from 'react-router-dom'
import logo from '../../assets/logo/unit bisnis/sport.webp'
import ScrollReveal from '../../components/animation/ScrollReveal'

type RegisterMobileViewProps = {
  fullName: string
  email: string
  password: string
  confirmPassword: string
  showPassword: boolean
  showConfirmPassword: boolean
  agreed: boolean
  isSubmitting: boolean
  onFullNameChange: (fullName: string) => void
  onEmailChange: (email: string) => void
  onPasswordChange: (password: string) => void
  onConfirmPasswordChange: (password: string) => void
  onTogglePassword: () => void
  onToggleConfirmPassword: () => void
  onAgreementChange: (agreed: boolean) => void
  onSubmit: FormEventHandler<HTMLFormElement>
  onGoogleLogin: () => void
}

const INPUT_CLASS =
  'h-[clamp(36px,6vh,48px)] w-full rounded-xl border border-[#D4D4D4] bg-[#FDFCF7] px-4 font-body text-sm text-[#343133] placeholder:text-[#343133] focus:outline-none focus:border-[#404F14]'
const LABEL_CLASS =
  'mb-[clamp(2px,0.6vh,6px)] block text-xs font-heading font-bold text-[#343133]'

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

function RegisterMobileView({
  fullName,
  email,
  password,
  confirmPassword,
  showPassword,
  showConfirmPassword,
  agreed,
  isSubmitting,
  onFullNameChange,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onTogglePassword,
  onToggleConfirmPassword,
  onAgreementChange,
  onSubmit,
  onGoogleLogin,
}: RegisterMobileViewProps) {
  const { t } = useTranslation()
  const PasswordIcon = showPassword ? EyeOff : Eye
  const ConfirmPasswordIcon = showConfirmPassword ? EyeOff : Eye

  return (
    <ScrollReveal className="min-h-screen">
      <div className="flex min-h-screen flex-col justify-center bg-[#FDFCF7] px-6 py-8 font-heading text-[#343133]">
        <div className="-mt-6 flex justify-end">
          <Link to="/" aria-label={t('common.home')} className="flex w-fit items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-semibold text-[#404F14] transition-colors hover:bg-[#E8EDE3]">
            <House size={17} aria-hidden="true" />
            {t('common.home')}
          </Link>
        </div>
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

        <form onSubmit={onSubmit} className="mt-6 space-y-3">
          <div>
            <label htmlFor="m-name" className={LABEL_CLASS}>{t('register.fullName')}</label>
            <input
              id="m-name"
              type="text"
              value={fullName}
              onChange={(event) => onFullNameChange(event.target.value)}
              placeholder={t('register.fullNamePlaceholder')}
              disabled={isSubmitting}
              className={INPUT_CLASS}
            />
          </div>

          <div>
            <label htmlFor="m-email" className={LABEL_CLASS}>{t('register.email')}</label>
            <input
              id="m-email"
              type="email"
              value={email}
              onChange={(event) => onEmailChange(event.target.value)}
              placeholder="nama@email.com"
              disabled={isSubmitting}
              className={INPUT_CLASS}
            />
          </div>

          <div>
            <label htmlFor="m-password" className={LABEL_CLASS}>{t('register.password')}</label>
            <div className="relative">
              <input
                id="m-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => onPasswordChange(event.target.value)}
                placeholder={t('register.passwordPlaceholder')}
                disabled={isSubmitting}
                className={`${INPUT_CLASS} pr-12`}
              />
              <button
                type="button"
                onClick={onTogglePassword}
                aria-label={showPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#404F14] cursor-pointer"
              >
                <PasswordIcon size={22} aria-hidden="true" />
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="m-confirm-password" className={LABEL_CLASS}>{t('register.confirmPassword')}</label>
            <div className="relative">
              <input
                id="m-confirm-password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(event) => onConfirmPasswordChange(event.target.value)}
                placeholder={t('register.confirmPasswordPlaceholder')}
                disabled={isSubmitting}
                className={`${INPUT_CLASS} pr-12`}
              />
              <button
                type="button"
                onClick={onToggleConfirmPassword}
                aria-label={showConfirmPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#404F14] cursor-pointer"
              >
                <ConfirmPasswordIcon size={22} aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="pt-1">
            <label htmlFor="m-agreed" className="flex items-start gap-2 text-xs leading-5 text-[#343133]">
              <input
                id="m-agreed"
                type="checkbox"
                checked={agreed}
                onChange={(event) => onAgreementChange(event.target.checked)}
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
          onClick={onGoogleLogin}
          className="mt-3 flex h-[clamp(36px,6vh,48px)] w-full items-center justify-center gap-2 rounded-xl border border-[#D4D4D4] bg-white text-sm font-bold text-[#121212] active:bg-[#FDFCF7] transition-colors cursor-pointer"
        >
          <GoogleIcon />
          {t('register.registerGoogle')}
        </button>

        <p className="mt-4 text-center font-body text-sm text-[#343133]">
          {t('register.alreadyHaveAccount')}{' '}
          <Link to="/login" className="font-heading font-bold text-[#404F14] underline underline-offset-2">
            {t('register.signIn')}
          </Link>
        </p>
      </div>
    </ScrollReveal>
  )
}

export default RegisterMobileView