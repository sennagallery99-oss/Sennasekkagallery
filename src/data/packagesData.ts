import { PackageItem, ServiceItem, Testimonial } from '../types';

const getStoredSettings = () => {
  try {
    const saved = localStorage.getItem('senna_sewa_web_settings_v2');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {}
  return null;
};

const settings = getStoredSettings();

export const ADMIN_WA_NUMBER = settings?.contactWhatsapp || '6282279672876';

export const INSTAGRAM_ACCOUNTS = {
  mua: {
    name: settings?.webName || 'Senna MUA Gallery',
    handle: settings?.contactInstagram || '@senna_mua_gallery',
    url: settings?.contactInstagramUrl || 'https://instagram.com/senna_mua_gallery',
    role: 'Makeup Pengantin, Siger & Hijabdo',
    category: 'mua'
  },
  decor: {
    name: 'Sekka Design Decoration',
    handle: '@sekka_designdecoration',
    url: 'https://instagram.com/sekka_designdecoration',
    role: 'Dekorasi Pelaminan & Wedding Venue',
    category: 'decor'
  },
  attire: {
    name: 'Senna Wedding Attire',
    handle: '@senna_weddingattire',
    url: 'https://instagram.com/senna_weddingattire',
    role: 'Koleksi Gaun, Kebaya & Beskap Pengantin',
    category: 'attire'
  }
};

export const STUDIO_INFO = {
  name: settings?.webName ? `${settings.webName} & Sekka Design Decoration` : 'Senna MUA Gallery & Sekka Design Decoration',
  address: settings?.contactAddress || 'Jl. RA basyid, Gg Kemuning 2 No 28, Labuhan Dalam, Tanjung Senang, Kota Bandar Lampung',
  street: settings?.contactAddressSnippet || 'Jl. RA basyid, Gg Kemuning 2 No 28',
  subdistrict: 'Labuhan Dalam, Tanjung Senang',
  city: 'Kota Bandar Lampung',
  province: 'Lampung',
  openingHours: 'Buka Setiap Hari: 09.00 - 16.30 WIB',
  phone: settings?.contactWhatsapp ? `+62 ${settings.contactWhatsapp.replace(/^62/, '')}` : '+62 822-7967-2876',
  phoneRaw: settings?.contactWhatsapp || '0822-7967-2876',
  instagram: settings?.contactInstagram || '@senna_mua_gallery',
  instagramUrl: settings?.contactInstagramUrl || 'https://instagram.com/senna_mua_gallery',
  instagramMua: settings?.contactInstagram || '@senna_mua_gallery',
  instagramMuaUrl: settings?.contactInstagramUrl || 'https://instagram.com/senna_mua_gallery',
  instagramDecor: '@sekka_designdecoration',
  instagramDecorUrl: 'https://instagram.com/sekka_designdecoration',
  instagramAttire: '@senna_weddingattire',
  instagramAttireUrl: 'https://instagram.com/senna_weddingattire',
  email: 'sennagallery99@gmail.com',
  mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings?.contactAddress || 'Jl. RA basyid, Gg Kemuning 2 No 28, Labuhan Dalam, Tanjung Senang, Kota Bandar Lampung')}`
};

export const PACKAGES_DATA: PackageItem[] = [];

export const SERVICES_DATA: ServiceItem[] = [
  {
    id: 'service-mua',
    title: 'Senna MUA Gallery',
    subtitle: 'Bridal & Commercial Makeup Artistry',
    description: 'Menghadirkan riasan pengantin yang elegan, flawless, tahan lama, dan menonjolkan kecantikan alami tanpa mengubah karakter wajah Anda.',
    icon: 'Sparkles',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    highlights: [
      'Flawless HD & Complexion Tahan Lama 12+ Jam',
      'Koleksi Produk Kosmetik High-End Dunia',
      'Spesialis Adat Modern, Sunda Siger, Jawa, & Internasional',
      'Konsultasi Skin Prep & Moodboard Personal'
    ]
  },
  {
    id: 'service-decor',
    title: 'Sekka Design Decoration',
    subtitle: 'Aesthetic Wedding & Event Decoration',
    description: 'Merancang tata ruang dan dekorasi pelaminan tematik yang memadukan keindahan flora, pencahayaan dramatis, dan komposisi modern yang tak lekang oleh waktu.',
    icon: 'Palette',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    highlights: [
      'Desain Pelaminan Custom 3D Moodboard',
      'Fresh & Artificial Flower Styling Berkualitas',
      'Tata Cahaya Ambience Warm & Romantis',
      'Photo Booth Interaktif & Welcome Gate Megah'
    ]
  },
  {
    id: 'service-attire',
    title: 'Bridal Gown & Kebaya Rental',
    subtitle: 'Busana Pengantin Mewah & Busana Keluarga',
    description: 'Pilihan busana pengantin eksklusif dari gaun ballgown internasional, kebaya modern berpayet kristal, hingga busana adat lengkap dengan aksesoris.',
    icon: 'Crown',
    image: 'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=800&q=80',
    highlights: [
      'Fitting & Penyesuaian Ukuran Custom',
      'Koleksi Gaun Pengantin Internasional & Tradisional',
      'Busana Lengkap untuk Orang Tua & Besan',
      'Aksesoris Suntiang, Siger, Headpiece Kristal'
    ]
  }
];

export const TESTIMONIALS_DATA: Testimonial[] = [
  {
    id: 'testi-1',
    clientName: 'Annisa & Dimas',
    role: 'Pengantin Akad & Resepsi',
    event: 'Paket Wedding Intimate 17.5 JT',
    category: 'wedding',
    rating: 5,
    comment: 'Puas banget pakai Senna MUA & Sekka Design! Makeup-nya flawless seharian nggak luntur walau sempat gerah, dan dekorasi Sekka bikin venue gedung kelihatan mewah banget seperti wedding puluhan juta!',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    date: 'Januari 2026',
    location: 'Bandar Lampung',
    isVerified: true,
    likesCount: 24,
    createdAt: '2026-01-15T10:30:00Z'
  },
  {
    id: 'testi-2',
    clientName: 'dr. Sarah & Kapten Revan',
    role: 'Pengantin Resepsi Gedung',
    event: 'Paket Wedding Royal Luxury 28 JT',
    category: 'wedding',
    rating: 5,
    comment: 'Kak Senna dan tim Sekka Design bener-bener ramah dan solutif. Permintaan tema warna sage & champagne gold terealisasi melebihi ekspektasi kami. Semua tamu memuji pelaminannya!',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    date: 'Desember 2025',
    location: 'Bandar Lampung',
    isVerified: true,
    likesCount: 19,
    createdAt: '2025-12-20T14:15:00Z'
  },
  {
    id: 'testi-3',
    clientName: 'Nadia & Farhan',
    role: 'Pengantin Intimate Home Wedding',
    event: 'Paket Wedding Ekonomis 15.5 JT',
    category: 'mua',
    rating: 5,
    comment: 'Harga sangat bersahabat tapi kualitas kelas atas. Tim datang tepat waktu subuh jam 4, hasil makeup manglingi tapi tetap natural. Sangat recommended untuk calon pengantin!',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    date: 'Februari 2026',
    location: 'Metro, Lampung',
    isVerified: true,
    likesCount: 15,
    createdAt: '2026-02-10T09:00:00Z'
  },
  {
    id: 'testi-4',
    clientName: 'Clarissa Rahmawati, S.Ked',
    role: 'Penyewa Busana Wisuda',
    event: 'Sewa Kebaya Brokat Modern Sage Green',
    category: 'sewa',
    rating: 5,
    comment: 'Kebaya-nya wangi banget, bersih, dan ukurannya pas sekali setelah fitting di studio. Detail payetnya super rapi dan berkilau di foto studio maupun outdoor. Pengembaliannya pun praktis tanpa biaya cuci!',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80',
    date: 'Maret 2026',
    location: 'Bandar Lampung',
    isVerified: true,
    likesCount: 31,
    createdAt: '2026-03-05T16:20:00Z'
  },
  {
    id: 'testi-5',
    clientName: 'Reza & Maya',
    role: 'Penyewa Jas & Gaun Prewedding',
    event: 'Sewa Tuxedo Modern & Gaun Silk Ekor',
    category: 'sewa',
    rating: 5,
    comment: 'Sangat puas dengan pelayanan rental Senna Gallery. Busana jas pria sangat gagah dengan potongan pas, gaun wanita jatuh dan bahannya mewah. Bikin hasil photoshoot prewedding kami kelihatan sangat sinematik!',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    date: 'Maret 2026',
    location: 'Lampung Selatan',
    isVerified: true,
    likesCount: 22,
    createdAt: '2026-03-12T11:45:00Z'
  }
];

export const CINEMATIC_VIDEOS = [
  {
    title: 'The Romantic Bride & Gown',
    subtitle: 'Keanggunan busana & riasan pengantin berkelas',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-bride-putting-on-her-wedding-dress-41857-large.mp4',
    poster: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1920&q=80'
  },
  {
    title: 'Eternal Love & Ceremony',
    subtitle: 'Langkah sakral penuh cinta & kebahagiaan',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-newlywed-couple-walking-and-holding-hands-41856-large.mp4',
    poster: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1920&q=80'
  },
  {
    title: 'Sacred Veil & Golden Vows',
    subtitle: 'Momen janji suci berlatar pelaminan megah',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-groom-adjusting-a-brides-veil-41855-large.mp4',
    poster: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1920&q=80'
  }
];
