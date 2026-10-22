import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  { id: 'panduan', label: 'Panduan Pemesanan Lapangan & Membership', href: '/bantuan' },
  { id: 'syarat', label: 'Syarat & Ketentuan Layanan', href: '/syarat-ketentuan' },
  { id: 'admin', label: 'Hubungi Admin / Customer Support (WhatsApp)', external: CS_WHATSAPP_URL },
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
  const navigate = useNavigate()
  const { user } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // State profil
  const [fullName, setFullName] = useState(user?.name ?? '')
  const [username, setUsername] = useState(user?.email?.split('@')[0] ?? '')
  const [phone, setPhone] = useState('')
  const [bio, setBio] = useState('')
  const [email, setEmail] = useState(user?.email ?? '')
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [cropSource, setCropSource] = useState<File | null>(null)
  const [photoError, setPhotoError] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)

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
          if (profile.username) setUsername(profile.username)
          if (profile.phone) setPhone(profile.phone)
          if (profile.bio) setBio(profile.bio)
          if (profile.email) setEmail(profile.email)
          if (profile.avatarUrl) setPhotoPreview(getImageUrl(profile.avatarUrl))
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
      setPhotoError('Format foto harus JPG, GIF, atau PNG.')
      return
    }
    if (file.size > MAX_PHOTO_SIZE) {
      setPhotoError('Ukuran foto maksimal 2MB.')
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
      toast.success('Foto profil berhasil diperbarui!')
    } catch (err) {
      toast.error(getAccountErrorMessage(err, 'Gagal mengunggah foto profil.'))
    }
  }

  const handleUpdatePassword = async () => {
    const currentPassword = currentPasswordRef.current?.value ?? ''
    const newPassword = newPasswordRef.current?.value ?? ''
    const confirmPassword = confirmPasswordRef.current?.value ?? ''

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Semua kolom sandi wajib diisi.')
      return
    }
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setPasswordError(`Sandi baru minimal ${MIN_PASSWORD_LENGTH} karakter.`)
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Konfirmasi sandi baru tidak sama.')
      return
    }

    setPasswordError('')
    setIsUpdatingPassword(true)
    try {
      await changePassword(currentPassword, newPassword)
      toast.success('Kata sandi berhasil diperbarui!')
      if (currentPasswordRef.current) currentPasswordRef.current.value = ''
      if (newPasswordRef.current) newPasswordRef.current.value = ''
      if (confirmPasswordRef.current) confirmPasswordRef.current.value = ''
    } catch (err) {
      const msg = getAccountErrorMessage(err, 'Gagal memperbarui sandi.')
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
        username: username || undefined,
        phone: phone || undefined,
        bio: bio || undefined,
      })
      toast.success('Perubahan profil berhasil disimpan!')
    } catch (err) {
      toast.error(getAccountErrorMessage(err, 'Gagal menyimpan profil.'))
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
      <NavbarDashboard userName={fullName || 'Pengguna'} profileImage={photoPreview || undefined} />

      {/* Lebar konten 1200px sesuai desain */}
      <main className="max-w-[1248px] mx-auto px-6 pt-8 pb-16">
        {/* ================= Judul halaman ================= */}
        <h1 className="font-heading font-bold text-3xl text-[#121212]">Pengaturan Akun</h1>
        <p className="mt-1 text-sm text-[#6F6B6E]">
          Kelola informasi profil, foto, keamanan akun, dan preferensi Anda.
        </p>

        <div className="mt-6 space-y-6">
          {/* ================= Informasi profil & foto ================= */}
          <section className={`${CARD_CLASS} pb-12`}>
            <h2 className={CARD_TITLE_CLASS}>Informasi Profil &amp; Foto</h2>

            {/* Foto profil */}
            <div className="mt-5 flex items-start gap-4 pb-5 border-b border-dashed border-[#E5E5E5]">
              <div className="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-full border-2 border-[#C7C7D9]">
                {photoPreview ? (
                  <img src={photoPreview} alt="Foto profil" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center bg-[#9AAD3E] font-heading font-bold text-xl text-white">
                    {getInitials(fullName || 'User')}
                  </span>
                )}
              </div>

              <div>
                <p className="font-heading font-medium text-base text-[#121212]">Foto Profil</p>
                <p className="mt-1 text-xs text-[#6F6B6E]">
                  Format JPG, GIF atau PNG. Maksimal ukuran 2MB.
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
                  Ganti Foto Baru
                </button>
                {photoError && <p className="mt-1 text-xs text-[#C00000]">{photoError}</p>}
              </div>
            </div>

            {/* Nama & username */}
            <div className="mt-5 grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="fullName" className={LABEL_CLASS}>
                  Nama Lengkap
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
                <label htmlFor="username" className={LABEL_CLASS}>
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>
            </div>

            {/* Phone */}
            <div className="mt-6">
              <label htmlFor="phone" className={LABEL_CLASS}>
                Nomor Telepon (Opsional)
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+62812345678 atau 08123456789"
                className={INPUT_CLASS}
              />
            </div>

            {/* Bio */}
            <div className="mt-6">
              <label htmlFor="bio" className={LABEL_CLASS}>
                Bio Singkat (Opsional)
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full h-20 resize-none rounded-lg border border-[#E5E5E5] bg-white px-4 py-3 text-sm text-[#121212] focus:outline-none focus:border-[#404F14]"
              />
            </div>

            {/* Tombol simpan profil */}
            <div className="mt-8 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleSaveChanges}
                disabled={isSaving}
                className="h-9 rounded-lg bg-[#CDF178] px-6 text-sm font-heading font-semibold text-[#404F14] hover:bg-[#9AAD3E] transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSaving ? 'Menyimpan...' : 'Simpan Profil'}
              </button>
            </div>
          </section>

          {/* ================= Email akun ================= */}
          <DeferredSection placeholderClassName="min-h-[112px]">
          <section className={CARD_CLASS}>
            <h2 className={CARD_TITLE_CLASS}>Email Akun</h2>

            <div className="mt-5">
              <label htmlFor="email" className={LABEL_CLASS}>
                Alamat Email
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
                  Terverifikasi
                </span>
              </div>
            </div>
          </section>
          </DeferredSection>

          {/* ================= Keamanan sandi ================= */}
          <DeferredSection placeholderClassName="min-h-[270px]">
          <section className={CARD_CLASS}>
            <h2 className={CARD_TITLE_CLASS}>Keamanan Sandi</h2>

            <div className="mt-5 grid md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="currentPassword" className={LABEL_CLASS}>
                  Sandi Saat Ini
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
                    aria-label={showCurrentPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6F6B6E] hover:text-[#121212] cursor-pointer"
                  >
                    {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="newPassword" className={LABEL_CLASS}>
                  Sandi Baru
                </label>
                <div className="relative">
                  <input
                    id="newPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    ref={newPasswordRef}
                    placeholder="Minimal 8 karakter"
                    className={INPUT_CLASS}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    aria-label={showNewPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6F6B6E] hover:text-[#121212] cursor-pointer"
                  >
                    {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="confirmPassword" className={LABEL_CLASS}>
                  Konfirmasi Sandi Baru
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    ref={confirmPasswordRef}
                    placeholder="Minimal 8 karakter"
                    className={INPUT_CLASS}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={showConfirmPassword ? 'Sembunyikan sandi' : 'Tampilkan sandi'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6F6B6E] hover:text-[#121212] cursor-pointer"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            {passwordError && <p className="mt-3 text-xs text-[#C00000]">{passwordError}</p>}

            <button
              type="button"
              onClick={handleUpdatePassword}
              disabled={isUpdatingPassword}
              className="mt-5 h-9 rounded-lg bg-[#CDF178] px-4 text-sm font-heading font-semibold text-[#404F14] hover:bg-[#9AAD3E] transition-colors cursor-pointer disabled:opacity-50"
            >
              {isUpdatingPassword ? 'Memperbarui...' : 'Perbarui Sandi'}
            </button>
          </section>
          </DeferredSection>

          {/* ================= Pusat bantuan & dukungan ================= */}
          <DeferredSection placeholderClassName="min-h-[180px]">
          <section className={`${CARD_CLASS} pb-3`}>
            <h2 className={CARD_TITLE_CLASS}>Pusat Bantuan &amp; Dukungan</h2>

            <ul className="mt-1">
              {HELP_LINKS.map((link) => (
                <li key={link.id} className="border-b border-dashed border-[#E5E5E5] last:border-b-0">
                  <button
                    type="button"
                    onClick={() => handleHelpLink(link)}
                    className="flex w-full items-center justify-between py-4 text-left text-sm text-[#121212] hover:text-[#004000] transition-colors cursor-pointer"
                  >
                    <span>{link.label}</span>
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