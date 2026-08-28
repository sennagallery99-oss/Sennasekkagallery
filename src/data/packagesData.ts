import { PackageItem, ServiceItem, Testimonial } from '../types';

export const ADMIN_WA_NUMBER = '6282279672876';

export const STUDIO_INFO = {
  name: 'Senna MUA Gallery & Sekka Design Decoration',
  address: 'Jl. RA basyid, Gg Kemuning 2 No 28, Labuhan Dalam, Tanjung Senang, Kota Bandar Lampung',
  street: 'Jl. RA basyid, Gg Kemuning 2 No 28',
  subdistrict: 'Labuhan Dalam, Tanjung Senang',
  city: 'Kota Bandar Lampung',
  province: 'Lampung',
  openingHours: 'Buka Setiap Hari: 09.00 - 20.00 WIB',
  phone: '+62 822-7967-2876',
  phoneRaw: '0822-7967-2876',
  instagram: '@senna_mua_gallery',
  instagramUrl: 'https://instagram.com/senna_mua_gallery',
  email: 'sennagallery99@gmail.com',
  mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Jl.+RA+basyid,+Gg+Kemuning+2+No+28,+Labuhan+Dalam,+Tanjung+Senang,+Kota+Bandar+Lampung'
};

export const PACKAGES_DATA: PackageItem[] = [
  {
    id: 'wedding-ekonomis-15-5jt',
    name: 'Paket Wedding Ekonomis',
    category: 'wedding',
    categoryLabel: 'Paket Wedding Lengkap',
    priceNumber: 15500000,
    priceFormatted: 'Rp 15.500.000',
    originalPrice: 'Rp 18.000.000',
    tagline: 'Solusi lengkap & hemat untuk akad dan resepsi berkesan tanpa kompromi kualitas.',
    isPopular: false,
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    features: [
      'Makeup Pengantin Akad & Resepsi (Flawless Premium by Team Senna)',
      'Dekorasi Pelaminan 4-6 Meter Minimalis Modern by Sekka Design',
      '1 Pasang Busana Pengantin Akad & 1 Pasang Resepsi',
      'Makeup & Hairdo / Hijabdo 2 Ibu Pengantin',
      'Standing Flower 2 Unit & Karpet Jalan',
      'Pundi Uang & Meja Tamu Lengkap'
    ],
    includes: [
      {
        title: 'Layanan Senna MUA Gallery',
        items: [
          'Makeup Pengantin Akad & Resepsi (1 kali look / touch up)',
          'Softlens & Fake Eyelashes Premium',
          'Hairdo atau Hijab Styling + Aksesoris/Melati',
          'Rias & Busana 2 Ibu (Termasuk Hijab/Hairdo)',
          'Beskap & Kain 2 Bapak'
        ]
      },
      {
        title: 'Dekorasi Sekka Design',
        items: [
          'Pelaminan Modern Fresh / Artificial Flowers (4-6 meter)',
          'Mini Garden Pelaminan & Karpet Rumput Sintetis/Permadani',
          'Lighting Pelaminan (Spotlight & Warm Ambience)',
          'Meja & Kursi Akad Nikah Lengkap dengan Centerpiece',
          'Gate / Gazebo Pintu Masuk Minimalis',
          '2 Kotak Angpao / Pundi Uang Eksklusif'
        ]
      }
    ],
    bonus: [
      'Hand Bouquet Fresh Flowers',
      'Buku Tamu 2 Buah + Spidol Khusus',
      'Gratis Konsultasi Konsep & Moodboard Warna'
    ]
  },
  {
    id: 'wedding-intimate-17-5jt',
    name: 'Paket Wedding Intimate',
    category: 'wedding',
    categoryLabel: 'Best Seller Intimate',
    priceNumber: 17500000,
    priceFormatted: 'Rp 17.500.000',
    originalPrice: 'Rp 21.000.000',
    tagline: 'Pilihan favorit pasangan modern untuk perayaan sakral, hangat, dan estetik.',
    isPopular: true,
    image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80',
    features: [
      'Makeup Pengantin Spesial Flawless Glam by Senior Artist',
      'Dekorasi Pelaminan Intimate Aesthetic 6-8 Meter (Mix Fresh Flowers)',
      '2 Pasang Busana Pengantin Premium (Akad + Resepsi Modern)',
      'Rias & Busana 2 Pasang Orang Tua + 4 Pagar Ayu / Bridesmaids',
      'Dekorasi Meja Akad & Backdrop Photo Booth Instagramable',
      'Lighting Ambience Warm Romantic Full Setup'
    ],
    includes: [
      {
        title: 'Layanan Senna MUA Gallery',
        items: [
          'Makeup Pengantin Wanita & Groom Touch Up',
          'Flawless HD/Airbrush Look Tahan 12+ Jam',
          'Custom Headpiece / Tiara / Suntiang Modern / Solo Basahan',
          'Rias 2 Ibu + Busana Kebaya Modern',
          'Rias 4 Bridesmaids / Pagar Ayu',
          'Busana Lengkap 2 Pasang Orang Tua'
        ]
      },
      {
        title: 'Dekorasi Sekka Design',
        items: [
          'Pelaminan Intimate Rustic / Modern Bohemian / Glam Gold 6-8m',
          'Kombinasi 60% Fresh Flowers Import & Lokal',
          'Photo Booth Khusus Tamu dengan Signage Akrilik Custom',
          'Lorong Masuk Welcome Signboard Kayu / Akrilik & Standing Mirror',
          'Set Meja Akad Nikah + Bunga Meja Mewah',
          'Dekorasi Meja Buffet & VIP Table 1 Set'
        ]
      }
    ],
    bonus: [
      'Free Sewa Ring Box Akrilik Terrarium',
      'Free 1 Hand Bouquet Bunga Mawar Import',
      'Free Voucher Diskon Sewa Gaun Prewedding 30%'
    ]
  },
  {
    id: 'wedding-royal-luxury-28jt',
    name: 'Paket Wedding Royal Luxury',
    category: 'wedding',
    categoryLabel: 'Luxury All In',
    priceNumber: 28000000,
    priceFormatted: 'Rp 28.000.000',
    originalPrice: 'Rp 34.000.000',
    tagline: 'Kemewahan paripurna dengan sentuhan artistik eksklusif untuk pesta pernikahan impian.',
    isPopular: false,
    image: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
    features: [
      'Makeup Pengantin Direct by Founder (Kak Senna)',
      'Dekorasi Pelaminan Megah 10-12 Meter Full Fresh Flowers',
      'Busana Pengantin Haute Couture & Gaun Resepsi Internasional/Adat',
      'Rias & Busana Lengkap: 2 Orang Tua + 6 Bridesmaids + 6 Groomsmen',
      'Dekorasi Stage Musik, VIP Area, Gazebo Mewah & Photo Gallery',
      'Special Effect: Dry Ice Fog Machine + Sparkular Fountain 4 Titik'
    ],
    includes: [
      {
        title: 'Layanan Eksklusif Senna MUA',
        items: [
          'Makeup Direct by Kak Senna (Founder)',
          'Pre-wedding Makeup Trial & Skincare Prep Guidance',
          '2 Look Makeup Berbeda (Akad Tradisional & Resepsi Glamour)',
          'Rias 2 Pasang Orang Tua + 6 Pasang Penerima Tamu/Pagar Ayu',
          'Busana Pengantin Premium Custom Fitting'
        ]
      },
      {
        title: 'Dekorasi Sekka Design Masterpiece',
        items: [
          'Pelaminan Megah 10-12m Custom Design 3D',
          'Full Fresh Flower Arrangement Eksklusif',
          'Tunnel / Lorong Masuk Bertabur Bunga & Lampu Fairy',
          'Photo Booth Interaktif & Gallery Foto Prewedding 6 Frame',
          'Lighting Moving Beam, Par LED, & Warm Wash Light',
          'Dekorasi Meja VIP 4 Meja & Area Dessert Corner'
        ]
      }
    ],
    bonus: [
      'Efek Asap Panggung (Dry Ice) saat First Dance / Kirab',
      'Cold Sparkular Fountain 4 Titik saat Masuk Pelaminan',
      'Hand Bouquet Bunga Import Calla Lily / Peony',
      'Free Sewa 2 Set Gaun Bridesmaid'
    ]
  },
  {
    id: 'mua-jasmine-3jt',
    name: 'Paket MUA Jasmine',
    category: 'mua',
    categoryLabel: 'Makeup Only',
    priceNumber: 3000000,
    priceFormatted: 'Rp 3.000.000',
    tagline: 'Riasan pengantin natural glowing berkarakter untuk akad nikah atau resepsi sederhana.',
    isPopular: false,
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80',
    features: [
      'Makeup Pengantin Wanita 1 Look (Akad / Pemberkatan)',
      'Retouch Groom / Pengantin Pria',
      'Hairdo Pengantin atau Hijab Styling Elegan',
      'Softlens Premium & Aksesoris Rambut/Hijab Standar',
      'Free Rias 1 Orang Ibu'
    ],
    includes: [
      {
        title: 'Detail Layanan',
        items: [
          'Complexion tahan keringat dan tidak cakey',
          'High quality makeup brands (Dior, MAC, Make Up For Ever, Charlotte Tilbury)',
          'Pemasangan melati ronce / slayer / mahkota mini',
          'Free Touch-up kit mini (Lip cream & Blotting paper)'
        ]
      }
    ],
    bonus: [
      'Free Softlens Natural Look',
      'Free Pasang Melati Akad'
    ]
  },
  {
    id: 'mua-orchid-4jt',
    name: 'Paket MUA Orchid',
    category: 'mua',
    categoryLabel: 'Best Value Makeup',
    priceNumber: 4000000,
    priceFormatted: 'Rp 4.000.000',
    originalPrice: 'Rp 4.800.000',
    tagline: 'Paket rias 2 sesi (Akad & Resepsi) dengan perubahan look & touch-up standby.',
    isPopular: true,
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
    features: [
      'Makeup Pengantin Wanita 2 Look (Akad + Resepsi)',
      'Retouch Groom / Pengantin Pria 2 Sesi',
      'Standby MUA untuk Retouch saat Pergantian Baju',
      'Rias 2 Orang Ibu (Akad & Resepsi)',
      'Rias 2 Orang Saudara Kandung / Bridesmaids',
      'Aksesoris Hijab / Hairdo Eksklusif & Melati Ronce Asli'
    ],
    includes: [
      {
        title: 'Detail Layanan',
        items: [
          '2x Pergantian Look Makeup & Hairdo / Hijabdo',
          'Standby tim Senna MUA hingga prosesi selesai',
          'Aksesoris mahkota/headpiece kristal premium',
          'Koreksi bentuk wajah (Shading & Contouring 3D)'
        ]
      }
    ],
    bonus: [
      '2 Pasang Softlens Premium untuk Bride',
      'Free Nail Art Fake Nails Press-on Elegant'
    ]
  },
  {
    id: 'decor-pelaminan-sekka-8-5jt',
    name: 'Paket Dekorasi Pelaminan Modern',
    category: 'decor',
    categoryLabel: 'Dekorasi Only',
    priceNumber: 8500000,
    priceFormatted: 'Rp 8.500.000',
    tagline: 'Karya dekorasi estetik by Sekka Design untuk menyulap venue menjadi panggung megah.',
    isPopular: false,
    image: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80',
    features: [
      'Backdrop Pelaminan 6 Meter (Pilihan: Rustic, Modern White & Gold, Pastel Romantic)',
      'Set Kursi Pengantin & Kursi Orang Tua Mewah',
      'Kombinasi Bunga Artificial High Grade & Fresh Flowers Accent',
      'Lighting System: Spotlight & Warm Fairy Lights',
      'Dekorasi Pintu Masuk / Welcome Gate',
      'Welcome Signboard Kayu / Akrilik Custom Nama Pengantin'
    ],
    includes: [
      {
        title: 'Komponen Dekorasi',
        items: [
          'Pelaminan 6 meter x tinggi 3 meter',
          'Karpet pelaminan permadani / rumput sintetis',
          '2 Standing Flower jalan masuk',
          'Kotak Angpao 2 unit bergembok',
          'Meja Akad Nikah + 6 Kursi Futura Cover Pita'
        ]
      }
    ],
    bonus: [
      'Free Welcome Sign Acrylic Calligraphy',
      'Free Dekorasi Meja Foto Galeri Mini'
    ]
  }
];

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
    rating: 5,
    comment: 'Puas banget pakai Senna MUA & Sekka Design! Makeup-nya flawless seharian nggak luntur walau sempat gerah, dan dekorasi Sekka bikin venue gedung kelihatan mewah banget seperti wedding puluhan juta!',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    date: 'Januari 2026'
  },
  {
    id: 'testi-2',
    clientName: 'dr. Sarah & Kapten Revan',
    role: 'Pengantin Resepsi Gedung',
    event: 'Paket Wedding Royal Luxury 28 JT',
    rating: 5,
    comment: 'Kak Senna dan tim Sekka Design bener-bener ramah dan solutif. Permintaan tema warna sage & champagne gold terealisasi melebihi ekspektasi kami. Semua tamu memuji pelaminannya!',
    image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
    date: 'Desember 2025'
  },
  {
    id: 'testi-3',
    clientName: 'Nadia & Farhan',
    role: 'Pengantin Intimate Home Wedding',
    event: 'Paket Wedding Ekonomis 15.5 JT',
    rating: 5,
    comment: 'Harga sangat bersahabat tapi kualitas kelas atas. Tim datang tepat waktu subuh jam 4, hasil makeup manglingi tapi tetap natural. Sangat recommended untuk calon pengantin!',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    date: 'Februari 2026'
  }
];

export const CINEMATIC_VIDEOS = [
  {
    title: 'Luxury Wedding Highlight (Main)',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-bride-putting-on-her-wedding-dress-41857-large.mp4',
    poster: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1920&q=80'
  },
  {
    title: 'Romantic Ceremony Moments',
    url: 'https://assets.mixkit.co/videos/preview/mixkit-newlywed-couple-walking-and-holding-hands-41856-large.mp4',
    poster: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1920&q=80'
  }
];
