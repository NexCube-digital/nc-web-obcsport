import { lazy, Suspense, useRef, useState, type ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Check } from 'lucide-react'
import { toast } from 'sonner'
import {
  getAccountErrorMessage,
  updateProfile,
  uploadAvatar,
} from '../../../services/accountService'
import { getImageUrl } from '../../../utils/imageUrl'
import { CARD_CLASS, CARD_TITLE_CLASS, INPUT_CLASS, LABEL_CLASS } from '../../../utils/settingsStyles'

const PhotoCropModal = lazy(() => import('../Photocropmodal'))

type ProfileSettingsSectionProps = {
  fullName: string
  phone: string
  email: string
  photoPreview: string | null
  onFullNameChange: (name: string) => void
  onPhoneChange: (phone: string) => void
  onPhotoPreviewChange: (photoPreview: string) => void
}

const MAX_PHOTO_SIZE = 1 * 1024 * 1024
const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/gif']

function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('')
}

function ProfileSettingsSection({
  fullName,
  phone,
  email,
  photoPreview,
  onFullNameChange,
  onPhoneChange,
  onPhotoPreviewChange,
}: ProfileSettingsSectionProps) {
  const { t } = useTranslation()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [cropSource, setCropSource] = useState<File | null>(null)
  const [photoError, setPhotoError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
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
      const response = await uploadAvatar(file)
      onPhotoPreviewChange(response?.avatarUrl ? getImageUrl(response.avatarUrl) : URL.createObjectURL(blob))
      toast.success(t('account.profilePhotoUpdated'))
    } catch (error) {
      toast.error(getAccountErrorMessage(error, t('account.uploadPhotoFailed')))
    }
  }

  const handleSaveChanges = async () => {
    setIsSaving(true)
    try {
      await updateProfile({ name: fullName, phone: phone || undefined })
      toast.success(t('account.profileSaved'))
    } catch (error) {
      toast.error(getAccountErrorMessage(error, t('account.saveProfileFailed')))
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      <section className={`${CARD_CLASS} pb-12`}>
        <h2 className={CARD_TITLE_CLASS}>{t('account.profileInfo')}</h2>

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
            <p className="mt-1 text-xs text-[#6F6B6E]">{t('account.photoRequirements')}</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif"
              onChange={handlePhotoChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 rounded-md bg-[#F3F4F6] border border-[#E5E5E5] px-4 py-1.5 text-sm font-heading font-medium text-[#121212] hover:bg-[#E5E7EB] transition-colors cursor-pointer"
            >
              {t('account.changePhoto')}
            </button>
            {photoError && <p className="mt-1 text-xs text-[#C00000]">{photoError}</p>}
          </div>
        </div>

        <div className="mt-5 grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="fullName" className={LABEL_CLASS}>{t('account.name')}</label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(event) => onFullNameChange(event.target.value)}
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label htmlFor="phone" className={LABEL_CLASS}>{t('account.phoneOptional')}</label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(event) => onPhoneChange(event.target.value)}
              placeholder="+62812345678"
              className={INPUT_CLASS}
            />
          </div>
          <div>
            <label htmlFor="email" className={LABEL_CLASS}>{t('account.email')}</label>
            <div className="flex items-center gap-2.5">
              <input id="email" type="email" value={email} readOnly className={`${INPUT_CLASS} flex-1 bg-gray-50`} />
              <span className="inline-flex h-[39px] shrink-0 items-center gap-1.5 rounded-lg border border-[#DCEFE0] bg-[#EEF8F0] px-4 text-sm font-heading font-semibold text-[#004000]">
                <Check size={12} strokeWidth={3} />
                {t('account.verified')}
              </span>
            </div>
          </div>
        </div>

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

      {cropSource && (
        <Suspense fallback={null}>
          <PhotoCropModal file={cropSource} onCancel={() => setCropSource(null)} onApply={handleCropApply} />
        </Suspense>
      )}
    </>
  )
}

export default ProfileSettingsSection