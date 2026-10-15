import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Check } from 'lucide-react'
import NavbarDashboard from '../../components/layout/Navbar'
import DeferredFooter from '../../components/layout/DeferredFooter'

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

/* -------------------------------------------------------------------------
   Data (ganti dengan data dari auth context / services/profileService.js)
   ------------------------------------------------------------------------- */
// TODO: data profil sementara hardcode, ganti dari auth context / API
const USER_NAME = 'Budiman Santoso'
const INITIAL_USERNAME = 'budimansantoso'
const INITIAL_BIO = 'Kapten tim futsal rutin setiap hari Selasa & Kamis.'
const USER_EMAIL = 'budiman.santoso@email.com'

// TODO: ganti dengan nomor WhatsApp customer support yang sebenarnya
const CS_WHATSAPP_URL = 'https://wa.me/628123456789'

// TODO: sesuaikan rute halaman panduan dan syarat & ketentuan
const HELP_LINKS: HelpLink[] = [
  { id: 'panduan', label: 'Panduan Pemesanan Lapangan & Membership', href: '/bantuan' },
  { id: 'syarat', label: 'Syarat & Ketentuan Layanan', href: '/syarat-ketentuan' },
  { id: 'admin', label: 'Hubungi Admin / Customer Support (WhatsApp)', external: CS_WHATSAPP_URL },
]

const MAX_PHOTO_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/gif']
const MIN_PASSWORD_LENGTH = 8

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
  const fileInputRef = useRef<HTMLInputElement>(null)

  // State profil
  const [fullName, setFullName] = useState(USER_NAME)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [cropSource, setCropSource] = useState<File | null>(null) // file yang sedang diatur di modal
  const [photoError, setPhotoError] = useState('')

  const usernameRef = useRef<HTMLInputElement>(null)
  const bioRef = useRef<HTMLTextAreaElement>(null)
  const photoBlobRef = useRef<Blob | null>(null)

  // State sandi
  const [passwordError, setPasswordError] = useState('')
  const oldPasswordRef = useRef<HTMLInputElement>(null)
  const newPasswordRef = useRef<HTMLInputElement>(null)
  const confirmPasswordRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview)
    }
  }, [photoPreview])

  const handlePickPhoto = () => fileInputRef.current?.click()

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    // Reset input supaya file yang sama bisa dipilih ulang
    e.target.value = ''
    if (!file) return

    // Validasi format dan ukuran sesuai teks bantuan di bawah foto
    if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
      setPhotoError('Format foto harus JPG, GIF, atau PNG.')
      return
    }
    if (file.size > MAX_PHOTO_SIZE) {
      setPhotoError('Ukuran foto maksimal 2MB.')
      return
    }

    // Foto valid: buka modal agar user menentukan ukuran & posisi foto
    setPhotoError('')
    setCropSource(file)
  }

  const handleCropApply = (blob: Blob) => {
    // Bersihkan URL pratinjau lama agar tidak bocor memori
    if (photoPreview) URL.revokeObjectURL(photoPreview)

    photoBlobRef.current = blob
    setPhotoPreview(URL.createObjectURL(blob))
    setCropSource(null)
    // TODO: unggah photoBlob ke services/profileService.js (POST /profile/photo, FormData field "photo")
  }

  const handleUpdatePassword = () => {
    const oldPassword = oldPasswordRef.current?.value ?? ''
    const newPassword = newPasswordRef.current?.value ?? ''
    const confirmPassword = confirmPasswordRef.current?.value ?? ''

    if (!oldPassword || !newPassword || !confirmPassword) {
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
    // TODO: sambungkan ke services/authService.js (PUT /password)
    console.log({ oldPassword, newPassword })
  }

  const handleSaveChanges = () => {
    // TODO: sambungkan ke services/profileService.js (PUT /profile)
    console.log({
      fullName,
      username: usernameRef.current?.value ?? '',
      bio: bioRef.current?.value ?? '',
      photoBlob: photoBlobRef.current,
    })
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
      <NavbarDashboard userName={USER_NAME} />

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
              {/* TODO: ganti inisial dengan foto profil asli dari API */}
              <div className="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-full border-2 border-[#C7C7D9]">
                {photoPreview ? (
                  <img src={photoPreview} alt="Foto profil" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center bg-[#9AAD3E] font-heading font-bold text-xl text-white">
                    {getInitials(fullName)}
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
                  ref={usernameRef}
                  defaultValue={INITIAL_USERNAME}
                  className={INPUT_CLASS}
                />
              </div>
            </div>

            {/* Bio */}
            <div className="mt-6">
              <label htmlFor="bio" className={LABEL_CLASS}>
                Bio Singkat (Opsional)
              </label>
              <textarea
                id="bio"
                ref={bioRef}
                defaultValue={INITIAL_BIO}
                className="w-full h-20 resize-none rounded-lg border border-[#E5E5E5] bg-white px-4 py-3 text-sm text-[#121212] focus:outline-none focus:border-[#404F14]"
              />
            </div>
          </section>

          {/* ================= Email akun ================= */}
          <section className={CARD_CLASS}>
            <h2 className={CARD_TITLE_CLASS}>Email Akun</h2>

            <div className="mt-5">
              <label htmlFor="email" className={LABEL_CLASS}>
                Alamat Email
              </label>
              <div className="flex items-center gap-2.5">
                {/* Email hanya ditampilkan, perubahan email belum ada di desain */}
                <input
                  id="email"
                  type="email"
                  value={USER_EMAIL}
                  readOnly
                  className={`${INPUT_CLASS} flex-1`}
                />
                <span className="inline-flex h-[39px] shrink-0 items-center gap-1.5 rounded-lg border border-[#DCEFE0] bg-[#EEF8F0] px-4 text-sm font-heading font-semibold text-[#004000]">
                  <Check size={12} strokeWidth={3} />
                  Terverifikasi
                </span>
              </div>
            </div>
          </section>

          {/* ================= Keamanan sandi ================= */}
          <section className={CARD_CLASS}>
            <h2 className={CARD_TITLE_CLASS}>Keamanan Sandi</h2>

            <div className="mt-5 grid md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="oldPassword" className={LABEL_CLASS}>
                  Sandi Lama
                </label>
                <input
                  id="oldPassword"
                  type="password"
                  ref={oldPasswordRef}
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label htmlFor="newPassword" className={LABEL_CLASS}>
                  Sandi Baru
                </label>
                <input
                  id="newPassword"
                  type="password"
                  ref={newPasswordRef}
                  placeholder="Minimal 8 karakter"
                  className={INPUT_CLASS}
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className={LABEL_CLASS}>
                  Konfirmasi Sandi Baru
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  ref={confirmPasswordRef}
                  placeholder="Minimal 8 karakter"
                  className={INPUT_CLASS}
                />
              </div>
            </div>

            {passwordError && <p className="mt-3 text-xs text-[#C00000]">{passwordError}</p>}

            <button
              type="button"
              onClick={handleUpdatePassword}
              className="mt-5 h-9 rounded-lg bg-[#CDF178] px-4 text-sm font-heading font-semibold text-[#404F14] hover:bg-[#9AAD3E] transition-colors cursor-pointer"
            >
              Perbarui Sandi
            </button>
          </section>

          {/* ================= Pusat bantuan & dukungan ================= */}
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
        </div>

        {/* ================= Tombol simpan ================= */}
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={handleSaveChanges}
            className="w-full max-w-[486px] h-[42px] rounded-lg bg-[#CDF178] text-base font-heading font-bold text-[#404F14] hover:bg-[#9AAD3E] transition-colors cursor-pointer"
          >
            Simpan Perubahan
          </button>
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