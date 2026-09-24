import { SewaProduct } from '../types/sewa';

export const SEWA_PRODUCTS_DATA: SewaProduct[] = [];

export const SEWA_STORE_INFO = {
  name: 'Senna Gallery Sewa Official',
  slug: 'sennagallery-official',
  city: 'Kota Bandar Lampung',
  province: 'Lampung',
  rating: 4.9,
  totalRatingCount: '1.4rb',
  totalItemsRented: '2.8rb+',
  badge: 'Official Store',
  processSpeed: '± 1 jam proses',
  responseRate: '100% dibalas cepat',
  studioAddress: 'Jl. RA basyid, Gg Kemuning 2 No 28, Labuhan Dalam, Tanjung Senang, Kota Bandar Lampung',
  operatingHours: 'Setiap Hari 09.00 - 16.30 WIB',
  verified: true
};

export const TOKOPEDIA_PROMO_VOUCHERS: any[] = [];

export const SEWA_CATEGORIES = [
  { id: 'all', label: 'Semua Koleksi', count: 0 },
  { id: 'kebaya', label: 'Kebaya Modern', count: 0, iconName: 'Sparkles' },
  { id: 'jas', label: 'Jas & Beskap Pria', count: 0, iconName: 'Award' },
  { id: 'gaun', label: 'Gaun Pesta', count: 0, iconName: 'Heart' },
  { id: 'aksesoris', label: 'Aksesoris & Perhiasan', count: 0, iconName: 'Tag' }
];

export const SEWA_SIZES = ['All', 'S', 'M', 'L', 'XL', 'XXL', 'All Size'];

export const SEWA_COLORS = [
  'All',
  'Sage Green',
  'Gold Muted',
  'Broken White',
  'Terracotta',
  'Black Velvet',
  'Midnight Navy',
  'Black Tuxedo',
  'Emerald Green',
  'Champagne Rose',
  'Ruby Red'
];
