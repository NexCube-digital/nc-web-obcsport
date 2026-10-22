const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

// Mengambil origin server (tanpa /api/v1) untuk file statis seperti /uploads
function getAssetOrigin(): string {
  try {
    return new URL(API_BASE_URL, window.location.origin).origin
  } catch {
    return window.location.origin
  }
}

export function getImageUrl(path: string | undefined | null): string | null {
  if (!path) return null

  // URL penuh, preview lokal (blob), atau data URI dipakai apa adanya
  if (/^(https?:|blob:|data:)/i.test(path)) return path

  const origin = getAssetOrigin()
  return path.startsWith('/') ? `${origin}${path}` : `${origin}/${path}`
}