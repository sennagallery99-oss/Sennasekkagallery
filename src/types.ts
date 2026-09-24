export interface PackageItem {
  id: string;
  name: string;
  category: 'wedding' | 'mua' | 'decor' | 'attire';
  categoryLabel: string;
  priceNumber: number;
  priceFormatted: string;
  originalPrice?: string;
  tagline: string;
  isPopular?: boolean;
  image: string;
  features: string[];
  includes: {
    title: string;
    items: string[];
  }[];
  bonus?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  image: string;
  highlights: string[];
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'all' | 'mua' | 'decor' | 'attire' | 'intimate';
  categoryLabel: string;
  image: string;
  coupleName?: string;
  location?: string;
  description?: string;
  specs?: string;
  tags?: string[];
  availableColors?: string[];
  isAvailableInStudio?: boolean;
  styleNote?: string;
  instagramHandle?: string;
  instagramUrl?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Testimonial {
  id: string;
  clientName: string;
  role?: string;
  event: string;
  category?: 'all' | 'wedding' | 'mua' | 'decor' | 'sewa';
  rating: number;
  comment: string;
  image?: string;
  date: string;
  location?: string;
  isVerified?: boolean;
  likesCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface WebSettings {
  // Identitas & Logo
  webLogoUrl?: string;
  webIconUrl?: string;
  webName: string;
  webTagline: string;
  
  // Hero Section
  heroTitleLine1: string;
  heroTitleLine2: string;
  heroSubtitle: string;
  heroTaglineText: string;
  heroBackgroundImage?: string;
  heroVideoUrl?: string;
  
  // About Section
  aboutTitle: string;
  aboutSubtitle: string;
  aboutDescription1: string;
  aboutDescription2: string;
  aboutImage1: string;
  aboutImage2: string;
  
  // Kontak & Media Sosial
  contactWhatsapp: string;
  contactInstagram: string;
  contactInstagramUrl: string;
  contactAddress: string;
  contactAddressSnippet: string;
  contactMapsEmbedUrl?: string;

  // Tiga Lini Layanan (About Section & Global)
  service1Title?: string;
  service1Subtitle?: string;
  service1Desc?: string;
  service1Instagram?: string;
  service1InstagramUrl?: string;

  service2Title?: string;
  service2Subtitle?: string;
  service2Desc?: string;
  service2Instagram?: string;
  service2InstagramUrl?: string;

  service3Title?: string;
  service3Subtitle?: string;
  service3Desc?: string;
  service3Instagram?: string;
  service3InstagramUrl?: string;
}

