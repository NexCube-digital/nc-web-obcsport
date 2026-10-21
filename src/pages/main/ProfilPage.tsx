import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import { toast } from 'sonner'
import NavbarDashboard from '../../components/layout/Navbar'
import DeferredSection from '../../components/layout/DeferredSection'
import DeferredFooter from '../../components/layout/DeferredFooter'
import { sportApi } from '../../services/api'
import { useAuth } from '../../hooks/useAuth'

// Kelas bersama supaya semua kolom form seragam
const LABEL_CLASS = 'block text-sm font-heading font-medium text-[#121212] mb-2'
const INPUT_CLASS =
  'w-full h-[39px] rounded-lg border border-[#E5E5E5] bg-white px-4 text-sm text-[#121212] placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#404F14]'
const CARD_CLASS = 'rounded-xl border border-[#E5E5E5] bg-white px-6 pt-6'
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
  const [local, domain] = email.split('@')
  if (!domain) return email
  if (local.length <= 2) return `${local[0]}***@${domain}`
  return `${local.slice(0, 2)}***${local.slice(-1)}@${domain}`
}

function ProfilePage() {
  const { user } = useAuth()
  const [fullName, setFullName] = useState(user?.name ?? '')
  const [username, setUsername] = useState(user?.email?.split('@')[0] ?? '')
  const [bio, setBio] = useState('')
  const [email, setEmail] = useState(user?.email ?? '')
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    let isMounted = true
    const loadProfile = async () => {
      try {
        const res = await sportApi.getProfile()
        const profile = res.data?.data || res.data
        if (isMounted && profile) {
          if (profile.name) setFullName(profile.name)
          if (profile.username) setUsername(profile.username)
          if (profile.bio) setBio(profile.bio)
          if (profile.email) setEmail(profile.email)
          if (profile.avatarUrl) setPhotoUrl(profile.avatarUrl)
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
        <h1 className="font-heading text-3xl font-bold text-[#121212]">Profil Anda</h1>
        <p className="mt-1 text-sm text-[#6F6B6E]">
          Informasi akun Anda yang digunakan untuk reservasi lapangan dan membership.
        </p>

        <div className="mt-6 space-y-6">
          {/* ================= Informasi Profil ================= */}
          <section className={`${CARD_CLASS} pb-8`}>
            <h2 className={CARD_TITLE_CLASS}>Informasi Profil</h2>

            {/* Foto profil */}
            <div className="mt-5 flex items-center gap-4 pb-5 border-b border-dashed border-[#E5E5E5]">
              <div className="h-[72px] w-[72px] shrink-0 overflow-hidden rounded-full border-2 border-[#C7C7D9]">
                {photoUrl ? (
                  <img src={photoUrl} alt="Foto profil" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center bg-[#9AAD3E] font-heading text-xl font-bold text-white">
                    {getInitials(fullName || 'User')}
                  </span>
                )}
              </div>
              <div>
                <p className="font-heading text-base font-semibold text-[#121212]">
                  {fullName || 'Pengguna OBC'}
                </p>
                <p className="text-xs text-[#6F6B6E]">
                  Member OBC Sport Center
                </p>
              </div>
            </div>

            {/* Nama lengkap & username */}
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
          <DeferredSection startAfterScroll placeholderClassName="min-h-[100px]">
          <section className={`${CARD_CLASS} pb-6`}>
            <h2 className={CARD_TITLE_CLASS}>Email</h2>

            <div className="mt-4 flex items-center gap-2.5">
              <input
                id="email"
                type="text"
                value={maskEmail(email || user?.email || '')}
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
          </DeferredSection>
        </div>
      </main>

      <DeferredFooter />
    </div>
  )
}

export default ProfilePage
