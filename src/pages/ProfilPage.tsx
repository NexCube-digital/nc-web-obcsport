import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import { toast } from 'sonner'
import NavbarDashboard from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import { sportApi } from '../services/api'

// Kelas bersama supaya semua kolom form seragam
const LABEL_CLASS = 'block text-sm font-heading font-medium text-[#121212] mb-2'
const INPUT_CLASS =
  'w-full h-[39px] rounded-lg border border-[#E5E5E5] bg-white px-4 text-sm text-[#121212] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#404F14]'
const CARD_CLASS =
  'rounded-xl border border-[#E5E5E5] bg-white px-6 pt-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)]'
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

function maskEmail(email: string): string {
  if (!email) return ''
  const [local, domain] = email.split('@')
  if (!local || !domain) return email
  if (local.length <= 2) return `${local.charAt(0)}*@${domain}`
  const hidden = '*'.repeat(Math.max(local.length - 2, 4))
  return `${local.charAt(0)}${hidden}${local.charAt(local.length - 1)}@${domain}`
}

function ProfilePage() {
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [email, setEmail] = useState('')
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    let isMounted = true
    const loadProfile = async () => {
      try {
        const res = await sportApi.getProfile()
        const profile = res.data?.data || res.data
        if (isMounted && profile) {
          setFullName(profile.name || '')
          setUsername(profile.username || '')
          setBio(profile.bio || '')
          setEmail(profile.email || '')
          setPhotoUrl(profile.avatarUrl || null)
        }
      } catch (err: any) {
        console.error('Failed to load profile:', err)
      }
    }
    loadProfile()
    return () => {
      isMounted = false
    }
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await sportApi.updateProfile({
        name: fullName,
        username: username || undefined,
        bio: bio || undefined,
      })
      toast.success('Profil berhasil diperbarui!')
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || err.message || 'Gagal memperbarui profil.'
      toast.error(msg)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#FDFCF8] font-body text-[#343133]">
      <NavbarDashboard userName={fullName || 'Pengguna'} />

      {/* Lebar konten 1200px sesuai desain */}
      <main className="mx-auto w-full max-w-[1248px] flex-1 px-6 pt-8 pb-16">
        {/* ================= Judul halaman ================= */}
        <h1 className="font-heading text-[28px] font-bold leading-9 text-[#121212]">Profile</h1>

        <div className="mt-14 space-y-6">
          {/* ================= Informasi profil & foto ================= */}
          <section className={`${CARD_CLASS} pb-12`}>
            <h2 className={CARD_TITLE_CLASS}>Informasi Profil &amp; Foto</h2>

            {/* Foto di kiri, nama & username bertumpuk di kanan */}
            <div className="mt-[72px] flex items-start gap-5 border-b border-dashed border-[#E5E5E5] pb-4">
              <div className="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-full border-2 border-[#C7C7D9]">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt="Foto profil"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center bg-[#9AAD3E] font-heading text-xl font-bold text-white">
                    {getInitials(fullName || 'User')}
                  </span>
                )}
              </div>

              <div className="w-full max-w-[744px] space-y-2">
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
            </div>

            {/* Bio */}
            <div className="mt-4">
              <label htmlFor="bio" className={LABEL_CLASS}>
                Bio Singkat
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="h-20 w-full resize-none rounded-lg border border-[#E5E5E5] bg-white px-4 py-3 text-sm text-[#121212] focus:border-[#404F14] focus:outline-none"
              />
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="rounded-lg bg-[#CDF178] px-6 py-2 text-sm font-heading font-bold text-[#404F14] hover:bg-[#9AAD3E] transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSaving ? 'Menyimpan...' : 'Simpan Profil'}
              </button>
            </div>
          </section>

          {/* ================= Email ================= */}
          <section className={`${CARD_CLASS} pb-6`}>
            <h2 className={CARD_TITLE_CLASS}>Email</h2>

            <div className="mt-4 flex items-center gap-2.5">
              <input
                id="email"
                type="text"
                value={maskEmail(email)}
                readOnly
                aria-label="Alamat email"
                className={`${INPUT_CLASS} flex-1 bg-gray-50`}
              />
              <span className="inline-flex h-[39px] shrink-0 items-center gap-1.5 rounded-lg border border-[#DCEFE0] bg-[#EEF8F0] px-4 font-heading text-sm font-semibold text-[#004000]">
                <Check size={12} strokeWidth={3} />
                Terverifikasi
              </span>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default ProfilePage
