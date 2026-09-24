export const STANDARD_SIZES = ['S', 'M', 'L', 'XL', 'XXL'] as const;

export interface SewaProduct {
  id: string;
  code?: string; // Item code (e.g., KBYM001) required for catalog
  name: string;
  category: 'kebaya' | 'jas' | 'gaun' | 'aksesoris';
  categoryLabel: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  priceFormatted: string;
  sizes: string[];
  sizeStock?: Record<string, number>; // Stock per size e.g. { S: 2, M: 3, L: 2, XL: 1, XXL: 1 }
  colors: string[];
  imageUrl: string;
  additionalImages: string[];
  description: string;
  material: string;
  inclusions: string[];
  fittingNotes: string;
  isNewArrival?: boolean;
  isFeatured?: boolean;
  rating?: number;
  reviewCount?: number;
  totalRented?: number;
  location?: string;
  isOfficialStore?: boolean;
  cashbackPill?: string;
  rentalDurationDays?: number;
  createdAt?: string;
  updatedAt?: string;
}

export function getProductStockForSize(product: SewaProduct, size: string): number {
  if (product.sizeStock && typeof product.sizeStock[size] === 'number') {
    return Math.max(0, product.sizeStock[size]);
  }
  // Default fallback if sizeStock is not explicitly set: 2 sets per available size
  return 2;
}

export function getTotalProductStock(product: SewaProduct): number {
  if (product.sizeStock && Object.keys(product.sizeStock).length > 0) {
    return Object.values(product.sizeStock).reduce((acc, val) => acc + (typeof val === 'number' ? val : 0), 0);
  }
  return (product.sizes?.length || 1) * 2;
}

export interface CartItem {
  id: string; // unique key combining productId-size-color
  product: SewaProduct;
  selectedSize: string;
  selectedColor: string;
  quantity: number;
}

export interface SewaFilterState {
  search: string;
  category: string;
  size: string;
  color: string;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'newest';
}

export interface RenterDetails {
  name: string;
  phone: string;
  address: string;
  notes: string;
  deliveryMethod?: 'pickup_studio' | 'ojol_delivery';
}

export interface SewaUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  username?: string; // e.g. "Rina#X8Y2D"
  loginCode?: string; // e.g. "8D4K9"
  avatar?: string;
  authProvider: 'google' | 'phone' | 'simple';
  createdAt: string;
}

export type OrderStatus = 
  | 'pending' 
  | 'dikonfirmasi' 
  | 'diproses' 
  | 'selesai' 
  | 'dibatalkan'
  | 'menunggu_pembayaran' 
  | 'menunggu_konfirmasi' 
  | 'disetujui';

export interface SewaOrder {
  id: string; // e.g. ORD-SNA-2026-0901
  userId: string;
  userName: string;
  userPhone: string;
  userEmail?: string;
  items: CartItem[];
  rentalDate: string;
  rentalDurationDays: number;
  deliveryMethod: 'pickup_studio' | 'ojol_delivery';
  renterAddress: string;
  renterNotes: string;
  subtotal: number;
  deposit: number;
  totalAmount: number;
  appliedPromo?: string | null;
  paymentMethod: 'bca' | 'mandiri' | 'bri' | 'qris';
  paymentProofUrl?: string;
  status: OrderStatus;
  agreedToTerms: boolean;
  createdAt: string;
  confirmedAt?: string;
  adminNotes?: string;
}

export interface SewaBanner {
  id: string;
  title: string;
  headline: string;
  subtext: string;
  tag: string;
  bgGradient: string;
  image: string;
  ctaText: string;
  ctaLink: string;
  createdAt?: string;
  updatedAt?: string;
}

