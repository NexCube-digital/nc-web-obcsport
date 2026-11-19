export const formatRupiah = (value: number) =>
  `Rp ${value.toLocaleString('id-ID')}`

export const getInitials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('')
