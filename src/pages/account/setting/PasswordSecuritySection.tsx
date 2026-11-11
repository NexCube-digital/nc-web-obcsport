import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { changePassword, getAccountErrorMessage } from '../../../services/accountService'
import { CARD_CLASS, CARD_TITLE_CLASS, INPUT_CLASS, LABEL_CLASS } from '../../../utils/settingsStyles'

type PasswordSecuritySectionProps = {
  hasPassword: boolean
  onPasswordCreated: () => void
}

const MIN_PASSWORD_LENGTH = 12

function PasswordSecuritySection({ hasPassword, onPasswordCreated }: PasswordSecuritySectionProps) {
  const { t } = useTranslation()
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const currentPasswordRef = useRef<HTMLInputElement>(null)
  const newPasswordRef = useRef<HTMLInputElement>(null)
  const confirmPasswordRef = useRef<HTMLInputElement>(null)

  const handleUpdatePassword = async () => {
    const currentPassword = currentPasswordRef.current?.value ?? ''
    const newPassword = newPasswordRef.current?.value ?? ''
    const confirmPassword = confirmPasswordRef.current?.value ?? ''

    if ((hasPassword && !currentPassword) || !newPassword || !confirmPassword) {
      setPasswordError(t('account.passwordsRequired'))
      return
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setPasswordError(t('account.passwordMin', { count: MIN_PASSWORD_LENGTH }))
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(t('account.passwordMismatch'))
      return
    }

    setPasswordError('')
    setIsUpdatingPassword(true)
    try {
      await changePassword(hasPassword ? currentPassword : undefined, newPassword)
      onPasswordCreated()
      toast.success(hasPassword ? t('account.passwordUpdated') : t('account.passwordCreated'))
      if (currentPasswordRef.current) currentPasswordRef.current.value = ''
      if (newPasswordRef.current) newPasswordRef.current.value = ''
      if (confirmPasswordRef.current) confirmPasswordRef.current.value = ''
    } catch (error) {
      const message = getAccountErrorMessage(error, t('account.updatePasswordFailed'))
      setPasswordError(message)
      toast.error(message)
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  return (
    <section className={CARD_CLASS}>
      <h2 className={CARD_TITLE_CLASS}>{t('account.passwordSecurity')}</h2>

      <div className={`mt-5 grid ${hasPassword ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4`}>
        {hasPassword && (
          <div>
            <label htmlFor="currentPassword" className={LABEL_CLASS}>{t('account.currentPassword')}</label>
            <div className="relative">
              <input
                id="currentPassword"
                type={showCurrentPassword ? 'text' : 'password'}
                ref={currentPasswordRef}
                className={INPUT_CLASS}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword((visible) => !visible)}
                aria-label={showCurrentPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6F6B6E] hover:text-[#121212] cursor-pointer"
              >
                {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        )}
        <div>
          <label htmlFor="newPassword" className={LABEL_CLASS}>{t('account.newPassword')}</label>
          <div className="relative">
            <input
              id="newPassword"
              type={showNewPassword ? 'text' : 'password'}
              ref={newPasswordRef}
              placeholder={t('account.passwordPlaceholder', { count: MIN_PASSWORD_LENGTH })}
              className={INPUT_CLASS}
            />
            <button
              type="button"
              onClick={() => setShowNewPassword((visible) => !visible)}
              aria-label={showNewPassword ? t('auth.hidePassword') : t('auth.showPassword')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6F6B6E] hover:text-[#121212] cursor-pointer"
            >
              {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <div>
          <label htmlFor="confirmPassword" className={LABEL_CLASS}>{t('account.confirmNewPassword')}</label>
          <div className="relative">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              ref={confirmPasswordRef}
              placeholder={t('account.passwordPlaceholder', { count: MIN_PASSWORD_LENGTH })}
              className={INPUT_CLASS}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((visible) => !visible)}
              aria-label={showConfirmPassword ? t('auth.hidePassword') : t('auth.showPassword')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6F6B6E] hover:text-[#121212] cursor-pointer"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
      </div>

      {!hasPassword && <p className="mt-3 text-sm text-[#6F6B6E]">{t('account.googlePasswordHint')}</p>}
      {passwordError && <p className="mt-3 text-xs text-[#C00000]">{passwordError}</p>}

      <button
        type="button"
        onClick={handleUpdatePassword}
        disabled={isUpdatingPassword}
        className="mt-5 h-9 rounded-lg bg-[#CDF178] px-4 text-sm font-heading font-semibold text-[#404F14] hover:bg-[#9AAD3E] transition-colors cursor-pointer disabled:opacity-50"
      >
        {isUpdatingPassword ? t('account.saving') : hasPassword ? t('account.updatePassword') : t('account.createPassword')}
      </button>
    </section>
  )
}

export default PasswordSecuritySection