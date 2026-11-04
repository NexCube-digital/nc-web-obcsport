import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowRight, Check, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import NavbarDashboard from '../../components/layout/Navbar'
import DeferredFooter from '../../components/layout/DeferredFooter'
import DeferredSection from '../../components/layout/DeferredSection'
import {
  changePassword,
  getAccountErrorMessage,
  getProfile,
  updateProfile,
  uploadAvatar,
} from '../../services/accountService'
import { useAuth } from '../../hooks/useAuth'
import { getImageUrl } from '../../utils/imageUrl'

const PhotoCropModal = lazy(() => import('./Photocropmodal'))

/* -------------------------------------------------------------------------
   Tipe data
   ------------------------------------------------------------------------- */
interface HelpLink {
  id: string
  label: string
  href?: string // rute internal
  external?: string // tautan luar (mis. WhatsApp)
}

const CS_WHATSAPP_URL = 'https://wa.me/628123456789'

const HELP_LINKS: HelpLink[] = [
  { id: 'panduan', label: 'account.helpBooking', href: '/bantuan' },
  { id: 'syarat', label: 'account.helpTerms', href: '/syarat-ketentuan' },
  { id: 'admin', label: 'account.helpContact', external: CS_WHATSAPP_URL },
]

const MAX_PHOTO_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/gif']
const MIN_PASSWORD_LENGTH = 12

// Kelas bersama supaya semua kolom form seragam
const LABEL_CLASS = 'block text-sm font-heading font-medium text-[#121212] mb-2'
const INPUT_CLASS =
  'w-full h-[39px] rounded-lg border border-[#E5E5E5] bg-white px-4 text-sm text-[#121212] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#404F14]'
const CARD_CLASS = 'rounded-xl border border-[#E5E5E5] bg-white px-6 pt-6 pb-6'
const CARD_TITLE_CLASS =
  'font-heading font-semibold text-lg text-[#004000] pb-3 border-b border-[#E5E5E5]'

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('')
}

function SettingsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // State profil
  const [fullName, setFullName] = useState(user?.name ?? '')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState(user?.email ?? '')
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [cropSource, setCropSource] = useState<File | null>(null)
  const [photoError, setPhotoError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)
  const [hasPassword, setHasPassword] = useState(true)

  // State sandi
  const [passwordError, setPasswordError] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const currentPasswordRef = useRef<HTMLInputElement>(null)
  const newPasswordRef = useRef<HTMLInputElement>(null)
  const confirmPasswordRef = useRef<HTMLInputElement>(null)

  // Ambil data profil awal
  useEffect(() => {
    let isMounted = true
    const loadProfile = async () => {
      try {
        const profile = await getProfile()
        if (isMounted && profile) {
          if (profile.name) setFullName(profile.name)
          if (profile.phone) setPhone(profile.phone)
          if (profile.email) setEmail(profile.email)
          if (profile.avatarUrl) setPhotoPreview(getImageUrl(profile.avatarUrl))
          if (profile.hasPassword !== undefined) setHasPassword(profile.hasPassword)
        }
      } catch (err) {
        console.error('Gagal memuat profil:', err)
      }
    }
    loadProfile()
    return () => {
      isMounted = false
    }
  }, [])

  const handlePickPhoto = () => fileInputRef.current?.click()

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      setPhotoError(t('account.photoFormatError'))
      return
    }
    if (file.size > MAX_PHOTO_SIZE) {
      setPhotoError(t('account.photoSizeError'))
      return
    }

    setPhotoError('')
    setCropSource(file)
  }

  const handleCropApply = async (blob: Blob) => {
    setCropSource(null)
    const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' })
    try {
      const res = await uploadAvatar(file)
      if (res?.avatarUrl) {
        setPhotoPreview(getImageUrl(res.avatarUrl))
      } else {
        setPhotoPreview(URL.createObjectURL(blob))
      }
      toast.success(t('account.profilePhotoUpdated'))
    } catch (err) {
      toast.error(getAccountErrorMessage(err, t('account.uploadPhotoFailed')))
    }
  }

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
      setHasPassword(true)
      toast.success(hasPassword ? t('account.passwordUpdated') : t('account.passwordCreated'))
      if (currentPasswordRef.current) currentPasswordRef.current.value = ''
      if (newPasswordRef.current) newPasswordRef.current.value = ''
      if (confirmPasswordRef.current) confirmPasswordRef.current.value = ''
    } catch (err) {
      const msg = getAccountErrorMessage(err, t('account.updatePasswordFailed'))
      setPasswordError(msg)
      toast.error(msg)
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  const handleSaveChanges = async () => {
    setIsSaving(true)
    try {
      await updateProfile({
        name: fullName,
        phone: phone || undefined,
      })
      toast.success(t('account.profileSaved'))
    } catch (err) {
      toast.error(getAccountErrorMessage(err, t('account.saveProfileFailed')))
    } finally {
      setIsSaving(false)
    }
  }

  const handleHelpLink = (link: HelpLink) => {
    if (link.external) {
      window.open(link.external, '_blank')
      return
    }
    if (link.href) navigate(link.href)
  }

  return (
    <div className="min-h-screen bg-white font-body text-[#343133]">
      <NavbarDashboard userName={fullName || t('common.myAccount')} profileImage={photoPreview || undefined} />

      {/* Lebar konten 1200px sesuai desain */}
      <main className="max-w-[1248px] mx-auto px-6 pt-8 pb-16">
        {/* ================= Judul halaman ================= */}
        <h1 className="font-heading font-bold text-3xl text-[#121212]">{t('account.settingsTitle')}</h1>
        <p className="mt-1 text-sm text-[#6F6B6E]">
          {t('account.settingsDescription')}
        </p>

        <div className="mt-6 space-y-6">
          {/* ================= Informasi profil & foto ================= */}
          <section className={`${CARD_CLASS} pb-12`}>
            <h2 className={CARD_TITLE_CLASS}>{t('account.profileInfo')}</h2>

            {/* Foto profil */}
            <div className="mt-5 flex items-start gap-4 pb-5 border-b border-dashed border-[#E5E5E5]">
              <div className="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-full border-2 border-[#C7C7D9]">
                {photoPreview ? (
                  <img src={photoPreview} alt={t('account.profilePhotoAlt')} className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center bg-[#9AAD3E] font-heading font-bold text-xl text-white">
                    {getInitials(fullName || 'User')}
                  </span>
                )}
              </div>

              <div>
                <p className="font-heading font-medium text-base text-[#121212]">{t('account.profilePhoto')}</p>
                <p className="mt-1 text-xs text-[#6F6B6E]">
                  {t('account.photoRequirements')}
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={handlePickPhoto}
                  className="mt-2 rounded-md bg-[#F3F4F6] border border-[#E5E5E5] px-4 py-1.5 text-sm font-heading font-medium text-[#121212] hover:bg-[#E5E7EB] transition-colors cursor-pointer"
                >
                  {t('account.changePhoto')}
                </button>
                {photoError && <p className="mt-1 text-xs text-[#C00000]">{photoError}</p>}
              </div>
            </div>

            {/* Nama, telepon, dan email akun */}
            <div className="mt-5 grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="fullName" className={LABEL_CLASS}>
                  {t('account.name')}
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label htmlFor="phone" className={LABEL_CLASS}>
                  {t('account.phoneOptional')}
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+62812345678"
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label htmlFor="email" className={LABEL_CLASS}>
                  {t('account.email')}
                </label>
                <div className="flex items-center gap-2.5">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    readOnly
                    className={`${INPUT_CLASS} flex-1 bg-gray-50`}
                  />
                  <span className="inline-flex h-[39px] shrink-0 items-center gap-1.5 rounded-lg border border-[#DCEFE0] bg-[#EEF8F0] px-4 text-sm font-heading font-semibold text-[#004000]">
                    <Check size={12} strokeWidth={3} />
                    {t('account.verified')}
                  </span>
                </div>
              </div>
            </div>

            {/* Tombol simpan profil */}
            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleSaveChanges}
                disabled={isSaving}
                className="h-9 rounded-lg bg-[#CDF178] px-6 text-sm font-heading font-semibold text-[#404F14] hover:bg-[#9AAD3E] transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSaving ? t('account.saving') : t('account.saveProfile')}
              </button>
            </div>
          </section>

          {/* ================= Keamanan sandi ================= */}
          <DeferredSection placeholderClassName="min-h-[270px]">
          <section className={CARD_CLASS}>
            <h2 className={CARD_TITLE_CLASS}>{t('account.passwordSecurity')}</h2>

            <div className={`mt-5 grid ${hasPassword ? 'md:grid-cols-3' : 'md:grid-cols-2'} gap-4`}>
              {hasPassword ? (
                <div>
                  <label htmlFor="currentPassword" className={LABEL_CLASS}>
                    {t('account.currentPassword')}
                  </label>
                  <div className="relative">
                    <input
                      id="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      ref={currentPasswordRef}
                      className={INPUT_CLASS}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      aria-label={showCurrentPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6F6B6E] hover:text-[#121212] cursor-pointer"
                    >
                      {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              ) : null}
              <div>
                <label htmlFor="newPassword" className={LABEL_CLASS}>
                  {t('account.newPassword')}
                </label>
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
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    aria-label={showNewPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6F6B6E] hover:text-[#121212] cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="confirmPassword" className={LABEL_CLASS}>
                  {t('account.confirmNewPassword')}
                </label>
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
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6F6B6E] hover:text-[#121212] cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {!hasPassword && (
              <p className="mt-3 text-sm text-[#6F6B6E]">
                {t('account.googlePasswordHint')}
              </p>
            )}

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
          </DeferredSection>

          {/* ================= Pusat bantuan & dukungan ================= */}
          <DeferredSection placeholderClassName="min-h-[180px]">
          <section className={`${CARD_CLASS} pb-3`}>
            <h2 className={CARD_TITLE_CLASS}>{t('account.helpCenter')}</h2>

            <ul className="mt-1">
              {HELP_LINKS.map((link) => (
                <li key={link.id} className="border-b border-dashed border-[#E5E5E5] last:border-b-0">
                  <button
                    type="button"
                    onClick={() => handleHelpLink(link)}
                    className="flex w-full items-center justify-between py-4 text-left text-sm text-[#121212] hover:text-[#004000] transition-colors cursor-pointer"
                  >
                    <span>{t(link.label)}</span>
                    <ArrowRight size={14} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
          </DeferredSection>
        </div>
      </main>

      <DeferredFooter />

      {/* Modal atur ukuran & posisi foto, muncul setelah user memilih file */}
      {cropSource && (
        <Suspense fallback={null}>
          <PhotoCropModal
            file={cropSource}
            onCancel={() => setCropSource(null)}
            onApply={handleCropApply}
          />
        </Suspense>
      )}
    </div>
  )
}

export default SettingsPage