export interface PromoNotification {
  id: string
  title: string
  titleKey?: string
  time: string
  timeKey?: string
  createdAt?: string
  description: string
  descriptionKey?: string
  isUnread: boolean
}

export const INITIAL_NOTIFICATIONS: PromoNotification[] = [
  {
    id: 'promo-gajian',
    title: 'Promo Gajian Februari',
    titleKey: 'notifications.paydayTitle',
    time: 'Baru saja',
    timeKey: 'notifications.paydayTime',
    description:
      'Dapatkan potongan instan sebesar Rp 25.000 untuk setiap booking lapangan Futsal atau Badminton menggunakan QRIS Bank apapun!',
    descriptionKey: 'notifications.paydayDescription',
    isUnread: true,
  },
  {
    id: 'turnamen-badminton',
    title: 'Turnamen Badminton Cup 2026',
    titleKey: 'notifications.tournamentTitle',
    time: '1 hari yang lalu',
    timeKey: 'notifications.tournamentTime',
    description:
      'Segera daftarkan klub kesayangan Anda di kejuaraan tahunan OBC Sport Center. Slot terbatas untuk 32 tim pertama.',
    descriptionKey: 'notifications.tournamentDescription',
    isUnread: false,
  },
]