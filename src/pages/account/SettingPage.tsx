import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import NavbarDashboard from '../../components/layout/Navbar'
import DeferredFooter from '../../components/layout/DeferredFooter'
import DeferredSection from '../../components/layout/DeferredSection'
import { getProfile } from '../../services/accountService'
import { useAuth } from '../../hooks/useAuth'
import usePublicSiteContact from '../../hooks/usePublicSiteContact'
import { getWhatsAppHref } from '../../services/siteContactService'
import { getImageUrl } from '../../utils/imageUrl'
import ProfileSettingsSection from './setting/ProfileSettingsSection'
import PasswordSecuritySection from './setting/PasswordSecuritySection'
import HelpCenterSection from './setting/HelpCenterSection'

function SettingsPage() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const contact = usePublicSiteContact()
  const contactWhatsAppUrl = getWhatsAppHref(contact.whatsapp)

  const [fullName, setFullName] = useState(user?.name ?? '')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState(user?.email ?? '')
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [hasPassword, setHasPassword] = useState(true)

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

  return (
    <div className="min-h-screen bg-white font-body text-[#343133]">
      <NavbarDashboard userName={fullName || t('common.myAccount')} profileImage={photoPreview || undefined} />

      <main className="max-w-[1248px] mx-auto px-6 pt-8 pb-16">
        {/* Judul halaman */}
        <h1 className="font-heading font-bold text-3xl text-[#121212]">{t('account.settingsTitle')}</h1>
        <p className="mt-1 text-sm text-[#6F6B6E]">
          {t('account.settingsDescription')}
        </p>

        <div className="mt-6 space-y-6">
          <ProfileSettingsSection
            fullName={fullName}
            phone={phone}
            email={email}
            photoPreview={photoPreview}
            onFullNameChange={setFullName}
            onPhoneChange={setPhone}
            onPhotoPreviewChange={setPhotoPreview}
          />

          {/* Keamanan sandi */}
          <DeferredSection placeholderClassName="min-h-[270px]">
            <PasswordSecuritySection
              hasPassword={hasPassword}
              onPasswordCreated={() => setHasPassword(true)}
            />
          </DeferredSection>

          {/* Pusat bantuan & dukungan */}
          <DeferredSection placeholderClassName="min-h-[180px]">
            <HelpCenterSection contactWhatsAppUrl={contactWhatsAppUrl} />
          </DeferredSection>
        </div>
      </main>

      <DeferredFooter />
    </div>
  )
}

export default SettingsPage