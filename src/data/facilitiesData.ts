import lapangF1 from '../assets/layanan/Lapang F1.png'
import lapangF2 from '../assets/layanan/Lapang F2.png'
import futsalF2 from '../assets/layanan/Futsal F2.png'
import mejaBilliard from '../assets/layanan/Meja Billiard.png'
import tenisMeja from '../assets/layanan/tenis-meja-mockup.png'
import pickleball from '../assets/layanan/pickleball-mockup.png'
import sepakBola from '../assets/layanan/sepak-bola-mockup.png'

export interface SportStory {
  id: string
  title: string
  subtitle: string
  image: string
  category: string
}

export interface PricingTier {
  timeRange: string
  price: string
}

export interface CourtFacility {
  id: string
  name: string
  category: string
  courtName: string
  priceFormatted: string
  rawPrice: number
  unit: string
  image: string
  description: string
  includes: string[]
  operatingHours: string
  isEventCapable?: boolean
  pricingTiers?: PricingTier[]
}

export const SPORT_STORIES: SportStory[] = [
  {
    id: 'futsal',
    title: 'Futsal',
    subtitle: 'Lapang F1 & F2',
    image: lapangF1,
    category: 'futsal',
  },
  {
    id: 'badminton',
    title: 'Badminton',
    subtitle: 'Free Raket & Kok',
    image: lapangF1,
    category: 'badminton',
  },
  {
    id: 'biliard',
    title: 'Biliard',
    subtitle: '2 Meja Standar',
    image: mejaBilliard,
    category: 'biliard',
  },
  {
    id: 'tenis-meja',
    title: 'Tenis Meja',
    subtitle: 'Free Bet & Bola',
    image: tenisMeja,
    category: 'tenis-meja',
  },
  {
    id: 'basket',
    title: 'Basket',
    subtitle: 'Lapang F1',
    image: lapangF1,
    category: 'basket',
  },
  {
    id: 'pickleball',
    title: 'Pickleball',
    subtitle: 'Trend Terkini',
    image: pickleball,
    category: 'pickleball',
  },
  {
    id: 'event-space',
    title: 'Event Hall',
    subtitle: 'Wedding & Gathering',
    image: lapangF2,
    category: 'event',
  },
]

export const COURT_FACILITIES: CourtFacility[] = [
  {
    id: 'futsal-f1',
    name: 'Futsal',
    courtName: 'Lapang F1 (Utama)',
    category: 'futsal',
    priceFormatted: 'Rp. 150.000.00',
    rawPrice: 150000,
    unit: '/ jam',
    image: lapangF1,
    description: 'Lapangan futsal rumput sintetis standar kompetisi dengan pencahayaan LED optimal dan sirkulasi udara terbuka.',
    includes: ['Rompi tanding', 'Bola futsal standar', 'Papan skor digital', 'Kamar bilas & toilet'],
    operatingHours: '07.00 – 24.00 WIB',
    isEventCapable: true,
    pricingTiers: [
      { timeRange: '07.00 – 15.00', price: 'Rp 125.000 / jam' },
      { timeRange: '15.00 – 18.00', price: 'Rp 150.000 / jam' },
      { timeRange: '18.00 – 24.00', price: 'Rp 175.000 / jam' },
    ],
  },
  {
    id: 'futsal-f2',
    name: 'Futsal',
    courtName: 'Lapang F2',
    category: 'futsal',
    priceFormatted: 'Rp. 150.000.00',
    rawPrice: 150000,
    unit: '/ jam',
    image: futsalF2,
    description: 'Lapangan futsal semi-outdoor dengan lantai vinyl interlock nyaman untuk perlindungan sendi lutut.',
    includes: ['Rompi pertandingan', 'Bola futsal', 'Air minum galon', 'Parkir luas'],
    operatingHours: '07.00 – 24.00 WIB',
    isEventCapable: true,
    pricingTiers: [
      { timeRange: '07.00 – 15.00', price: 'Rp 100.000 / jam' },
      { timeRange: '15.00 – 18.00', price: 'Rp 125.000 / jam' },
      { timeRange: '18.00 – 24.00', price: 'Rp 150.000 / jam' },
    ],
  },
  {
    id: 'badminton-f1',
    name: 'Badminton',
    courtName: 'Lapang F1',
    category: 'badminton',
    priceFormatted: 'Rp. 80.000.00',
    rawPrice: 80000,
    unit: '/ jam',
    image: lapangF1,
    description: 'Lapangan bulutangkis dengan karpet vinyl standar PBSI dan net presisi tinggi.',
    includes: ['2 Raket badminton gratis', '1 Kok tanding', 'Net badminton standar PBSI'],
    operatingHours: '07.00 – 24.00 WIB',
    pricingTiers: [
      { timeRange: '07.00 – 16.00', price: 'Rp 65.000 / jam' },
      { timeRange: '16.00 – 24.00', price: 'Rp 80.000 / jam' },
    ],
  },
  {
    id: 'basket-f1',
    name: 'Basket',
    courtName: 'Lapang F1',
    category: 'basket',
    priceFormatted: 'Rp. 150.000.00',
    rawPrice: 150000,
    unit: '/ jam',
    image: lapangF1,
    description: 'Lapangan basket semi-indoor dengan ring hidrolik kokoh dan garis 3-point resmi.',
    includes: ['Bola basket Molten', 'Papan skor', 'Kamar ganti'],
    operatingHours: '07.00 – 24.00 WIB',
    pricingTiers: [
      { timeRange: '07.00 – 15.00', price: 'Rp 125.000 / jam' },
      { timeRange: '15.00 – 18.00', price: 'Rp 150.000 / jam' },
      { timeRange: '18.00 – 24.00', price: 'Rp 175.000 / jam' },
    ],
  },
  {
    id: 'tenis-meja-1',
    name: 'Tenis Meja',
    courtName: 'Ruang Tenis Meja (Meja 1)',
    category: 'tenis-meja',
    priceFormatted: 'Rp. 20.000.00',
    rawPrice: 20000,
    unit: '/ jam',
    image: tenisMeja,
    description: 'Meja tenis meja berkualitas tinggi dengan pantulan konsisten di ruangan nyaman ber-AC.',
    includes: ['Gratis 2 Bet tenis meja', 'Bola pingpong', 'AC & ruang santai'],
    operatingHours: '07.00 – 24.00 WIB',
    pricingTiers: [
      { timeRange: 'Paket Normal', price: 'Rp 20.000 / jam' },
      { timeRange: 'Paket 2 Jam', price: 'Rp 30.000 / 2 jam' },
    ],
  },
  {
    id: 'tenis-meja-2',
    name: 'Tenis Meja',
    courtName: 'Ruang Tenis Meja (Meja 2)',
    category: 'tenis-meja',
    priceFormatted: 'Rp. 20.000.00',
    rawPrice: 20000,
    unit: '/ jam',
    image: tenisMeja,
    description: 'Meja tenis meja meja 2 untuk latihan solo maupun sparring ganda seru bersama teman.',
    includes: ['Gratis 2 Bet tenis meja', 'Bola pingpong', 'AC & dispenser air'],
    operatingHours: '07.00 – 24.00 WIB',
    pricingTiers: [
      { timeRange: 'Paket Normal', price: 'Rp 20.000 / jam' },
      { timeRange: 'Paket 2 Jam', price: 'Rp 30.000 / 2 jam' },
    ],
  },
  {
    id: 'biliard-1',
    name: 'Biliard',
    courtName: 'Ruang Biliard (Meja 1)',
    category: 'biliard',
    priceFormatted: 'Rp. 35.000.00',
    rawPrice: 35000,
    unit: '/ jam',
    image: mejaBilliard,
    description: 'Meja biliard 9-feet laken import halus, stick lurus berkualitas, dan pencahayaan studio fokus.',
    includes: ['Stick biliard pilihan', 'Chalk / kapur', 'Ruang dingin & sound system'],
    operatingHours: '07.00 – 24.00 WIB',
    pricingTiers: [
      { timeRange: 'Paket Normal', price: 'Rp 35.000 / jam' },
      { timeRange: 'Paket Rame', price: 'Rp 50.000 / 2 jam' },
    ],
  },
  {
    id: 'biliard-2',
    name: 'Biliard',
    courtName: 'Ruang Biliard (Meja 2)',
    category: 'biliard',
    priceFormatted: 'Rp. 35.000.00',
    rawPrice: 35000,
    unit: '/ jam',
    image: mejaBilliard,
    description: 'Meja biliard meja 2 dengan ambience eksklusif dan santai untuk nongkrong dan bermain.',
    includes: ['Stick biliard lengkap', 'Rest stick', 'Chalk', 'Area sofa tunggu'],
    operatingHours: '07.00 – 24.00 WIB',
    pricingTiers: [
      { timeRange: 'Paket Normal', price: 'Rp 35.000 / jam' },
      { timeRange: 'Paket Rame', price: 'Rp 50.000 / 2 jam' },
    ],
  },
  {
    id: 'pickleball-f1',
    name: 'Pickleball',
    courtName: 'Lapang F1',
    category: 'pickleball',
    priceFormatted: 'Rp. 75.000.00',
    rawPrice: 75000,
    unit: '/ jam',
    image: pickleball,
    description: 'Cabang olahraga seru perpaduan tenis dan badminton yang mudah dimainkan semua usia.',
    includes: ['Net pickleball portable resmi', 'Penerangan malam hari', 'Kamar bilas'],
    operatingHours: '07.00 – 24.00 WIB',
    pricingTiers: [
      { timeRange: 'Weekday 07.00–18.00', price: 'Rp 50.000 / jam' },
      { timeRange: 'Weekday 18.00–24.00', price: 'Rp 75.000 / jam' },
      { timeRange: 'Weekend 07.00–18.00', price: 'Rp 75.000 / jam' },
      { timeRange: 'Weekend 18.00–24.00', price: 'Rp 50.000 / jam' },
    ],
  },
  {
    id: 'sepakbola-f2',
    name: 'Sepak Bola',
    courtName: 'Lapang F2 (Paket Flat)',
    category: 'sepakbola',
    priceFormatted: 'Rp. 250.000.00',
    rawPrice: 250000,
    unit: '/ 2 jam',
    image: sepakBola,
    description: 'Paket tanding mini soccer lapang F2 dengan durasi fixed 2 jam untuk pertandingan komunitas.',
    includes: ['Paket langsung 2 jam', 'Rompi 2 tim', 'Wasit/Operator bantuan', 'Gawang standar'],
    operatingHours: '07.00 – 24.00 WIB',
    pricingTiers: [
      { timeRange: 'Paket Flat Hemat', price: 'Rp 250.000 / 2 jam' },
    ],
  },
  {
    id: 'event-hall',
    name: 'Event Space',
    courtName: 'Lapang F1 & F2 Multifungsi',
    category: 'event',
    priceFormatted: 'Nego Event',
    rawPrice: 0,
    unit: 'sesuai durasi',
    image: lapangF2,
    description: 'Sewa aula serbaguna Lapang F1 & F2 untuk wedding, gathering komunitas, pentas musik, atau pameran.',
    includes: ['Kapasitas hingga 500+ orang', 'Kelistrikan daya besar', 'Akses parkir luas', 'Kunci slot otomatis'],
    operatingHours: 'Fleksibel sesuai kesepakatan',
    isEventCapable: true,
    pricingTiers: [
      { timeRange: 'Tarif Dasar + Tambahan', price: 'Nego manual per acara' },
    ],
  },
]

