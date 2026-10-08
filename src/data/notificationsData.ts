export interface PromoNotification {
  id: string
  title: string
  time: string
  description: string
  isUnread: boolean
}

export const INITIAL_NOTIFICATIONS: PromoNotification[] = [
  {
    id: 'promo-gajian',
    title: 'Promo Gajian Februari',
    time: 'Baru saja',
    description:
      'Dapatkan potongan instan sebesar Rp 25.000 untuk setiap booking lapangan Futsal atau Badminton menggunakan QRIS Bank apapun!',
    isUnread: true,
  },
  {
    id: 'turnamen-badminton',
    title: 'Turnamen Badminton Cup 2026',
    time: '1 hari yang lalu',
    description:
      'Segera daftarkan klub kesayangan Anda di kejuaraan tahunan OBC Sport Center. Slot terbatas untuk 32 tim pertama.',
    isUnread: false,
  },
]