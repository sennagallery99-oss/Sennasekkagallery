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
}

export interface UserSession {
  id: number;
  email_hp: string;
  nama_lengkap: string;
  logged_at: string;
}

export interface BookingLog {
  id: string;
  packageId: string;
  packageName: string;
  price: string;
  eventDate?: string;
  createdAt: string;
  status: 'Pending WA' | 'Terkonfirmasi';
}

export interface Testimonial {
  id: string;
  clientName: string;
  role: string;
  event: string;
  rating: number;
  comment: string;
  image: string;
  date: string;
}

export interface PhpFileItem {
  filename: string;
  path: string;
  language: string;
  description: string;
  content: string;
}
