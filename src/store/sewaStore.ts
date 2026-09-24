import { create } from 'zustand';
import { SewaProduct, CartItem, RenterDetails, SewaUser, SewaOrder, OrderStatus, getProductStockForSize, SewaBanner } from '../types/sewa';
import { PackageItem, GalleryItem, WebSettings, Testimonial } from '../types';
import { TESTIMONIALS_DATA } from '../data/packagesData';
import { compressBase64IfNeeded } from '../services/imageUtils';
import {
  saveDocToMysql,
  deleteDocFromMysql,
  saveBatchToMysql,
  fetchAllFromMysql,
  clearAllCatalogsInMysql,
  testMysqlConnection,
  getApiUrl,
  fetchDatabaseVersionFromMysql,
  DatabaseVersionInfo
} from '../services/mysqlService';
import {
  saveDocToFirestore,
  deleteDocFromFirestore,
  saveBatchToFirestore,
  syncCollectionFromFirestore,
  syncDocumentFromFirestore,
  testFirestoreConnection,
  isFirestoreQuotaExceeded,
} from '../services/firebaseFirestoreService';

interface SewaStoreState {
  // Catalog products (for CRUD by Admin)
  products: SewaProduct[];
  addProduct: (product: Omit<SewaProduct, 'id'> & { id?: string }) => Promise<SewaProduct>;
  addProductsBatch: (products: Array<Omit<SewaProduct, 'id'> & { id?: string }>) => Promise<SewaProduct[]>;
  updateProduct: (id: string, updatedFields: Partial<SewaProduct>) => Promise<void>;
  deleteProduct: (id: string) => void;
  resetDefaultProducts: () => void;
  clearAllCatalogs: () => Promise<void>;

  // Banners (for CRUD by Admin)
  banners: SewaBanner[];
  addBanner: (banner: Omit<SewaBanner, 'id'> & { id?: string }) => Promise<SewaBanner>;
  updateBanner: (id: string, updatedFields: Partial<SewaBanner>) => Promise<void>;
  deleteBanner: (id: string) => void;
  resetDefaultBanners: () => void;

  // Website Content Management (Packages & Gallery)
  packages: PackageItem[];
  addPackage: (pkg: Omit<PackageItem, 'id'> & { id?: string }) => Promise<PackageItem>;
  updatePackage: (id: string, updatedFields: Partial<PackageItem>) => Promise<void>;
  deletePackage: (id: string) => void;
  resetDefaultPackages: () => void;

  gallery: GalleryItem[];
  addGallery: (item: Omit<GalleryItem, 'id'> & { id?: string }) => Promise<GalleryItem>;
  updateGallery: (id: string, updatedFields: Partial<GalleryItem>) => Promise<void>;
  deleteGallery: (id: string) => void;
  resetDefaultGallery: () => void;

  // Testimonials & User Reviews (Directly connected to DB)
  testimonials: Testimonial[];
  addTestimonial: (item: Omit<Testimonial, 'id'> & { id?: string }) => Promise<Testimonial>;
  updateTestimonial: (id: string, updatedFields: Partial<Testimonial>) => Promise<void>;
  deleteTestimonial: (id: string) => Promise<void>;
  likeTestimonial: (id: string) => void;
  resetDefaultTestimonials: () => void;

  // Web Settings (CMS)
  webSettings: WebSettings;
  updateWebSettings: (updatedFields: Partial<WebSettings>) => void;
  resetDefaultWebSettings: () => void;

  // Cart & Rental Parameters
  cart: CartItem[];
  rentalDate: string;
  rentalDurationDays: number;
  renterDetails: RenterDetails;
  isCartDrawerOpen: boolean;
  toast: { message: string; type: 'success' | 'info' } | null;

  // User Authentication
  currentUser: SewaUser | null;
  registeredUsers: SewaUser[];
  isAuthModalOpen: boolean;
  authRedirectAction?: (() => void) | null;
  openAuthModal: (onSuccessCallback?: () => void) => void;
  closeAuthModal: () => void;
  loginWithGoogle: (name?: string, email?: string) => void;
  loginWithPhone: (phone: string, name: string) => void;
  registerSimpleUser: (name: string, phone: string) => SewaUser;
  loginSimpleUser: (username: string, loginCode: string) => boolean;
  logout: () => void;

  // Orders & Payment
  orders: SewaOrder[];
  currentOrderId: string | null;
  createOrder: (paymentMethod?: 'bca' | 'mandiri' | 'bri' | 'qris', promoCode?: string | null) => SewaOrder;
  submitPaymentProof: (orderId: string, proofUrl?: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus, adminNotes?: string) => Promise<void>;
  approveOrder: (orderId: string, adminNotes?: string) => void;
  rejectOrder: (orderId: string, adminNotes?: string) => void;
  deleteOrder: (orderId: string) => Promise<void>;
  setCurrentOrderId: (orderId: string | null) => void;
  getOrderById: (orderId: string) => SewaOrder | undefined;
  getUserOrders: () => SewaOrder[];

  // Admin Auth & Cloud/Database Sync Status
  isAdminLoggedIn: boolean;
  isCloudConnected: boolean;
  isMysqlConnected: boolean;
  mysqlStatusMessage: string;
  lastDbVersion?: string;
  lastDbTimestamp?: string;
  checkMysqlStatus: () => Promise<{ success: boolean; message: string; database?: string }>;
  checkMysqlVersionNow: (force?: boolean) => Promise<boolean>;
  syncAllToMysql: () => Promise<boolean>;
  refreshDataLive: (force?: boolean) => Promise<void>;
  loginAdmin: () => void;
  logoutAdmin: () => void;

  // Cart Actions
  addToCart: (product: SewaProduct, size: string, color: string, quantity?: number) => void;
  removeFromCart: (cartItemId: string) => void;
  updateQuantity: (cartItemId: string, newQuantity: number) => void;
  clearCart: () => void;
  setRentalDate: (date: string) => void;
  setRentalDurationDays: (days: number) => void;
  setRenterDetails: (details: Partial<RenterDetails>) => void;
  setIsCartDrawerOpen: (isOpen: boolean) => void;
  showToast: (message: string, type?: 'success' | 'info') => void;

  // Computations
  getTotalItemsCount: () => number;
  getSubtotal: () => number;
  getSecurityDeposit: () => number;
  getTotalAmount: () => number;
}

// Clean initial orders
const INITIAL_DEMO_ORDERS: SewaOrder[] = [];

// Helper to load localStorage safely
const generateUniqueSuffix = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const generateSimpleAccountDetails = (fullName: string) => {
  const cleanName = fullName.replace(/[^a-zA-Z0-9]/g, '');
  const suffix = generateUniqueSuffix();
  const username = `${cleanName}#${suffix}`;
  const loginCode = generateUniqueSuffix();
  return { username, loginCode };
};

// Persistent tracker for deleted item IDs to prevent accidental resurrection by cache or sync loops
const getDeletedIds = (storageKey: string): Set<string> => {
  try {
    if (typeof window === 'undefined') return new Set();
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return new Set(arr);
    }
  } catch (e) {}
  return new Set();
};

const markIdDeleted = (storageKey: string, id: string) => {
  try {
    if (typeof window === 'undefined') return;
    const deleted = getDeletedIds(storageKey);
    deleted.add(id);
    localStorage.setItem(storageKey, JSON.stringify(Array.from(deleted)));
  } catch (e) {}
};

const unmarkIdDeleted = (storageKey: string, id: string) => {
  try {
    if (typeof window === 'undefined') return;
    const deleted = getDeletedIds(storageKey);
    if (deleted.has(id)) {
      deleted.delete(id);
      localStorage.setItem(storageKey, JSON.stringify(Array.from(deleted)));
    }
  } catch (e) {}
};

const clearDeletedIds = (storageKey: string) => {
  try {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(storageKey);
  } catch (e) {}
};

// Legacy default IDs to filter out so old cached templates are never restored
const LEGACY_DEFAULT_PRODUCT_IDS = new Set([
  'sewa-1', 'sewa-2', 'sewa-3', 'sewa-4', 'sewa-5', 'sewa-6', 'sewa-7', 'sewa-8', 'sewa-9', 'sewa-10', 'sewa-11', 'sewa-12'
]);

const LEGACY_DEFAULT_BANNER_IDS = new Set([
  'banner-1', 'banner-2', 'banner-3'
]);

const LEGACY_DEFAULT_PACKAGE_IDS = new Set([
  'pkg-1', 'pkg-2', 'pkg-3', 'pkg-4', 'pkg-5', 'pkg-6', 'pkg-7', 'pkg-8', 'pkg-9', 'pkg-10', 'pkg-11', 'pkg-12'
]);

const LEGACY_DEFAULT_GALLERY_IDS = new Set([
  'gal-1', 'gal-2', 'gal-3', 'gal-4', 'gal-5', 'gal-6', 'gal-7', 'gal-8', 'gal-9', 'gal-10', 'gal-11', 'gal-12'
]);

// Local pending creations registry to prevent background polling race conditions
const pendingLocalCreations = new Map<string, { collection: string; data: any; timestamp: number }>();

const trackPendingCreation = (collection: string, id: string, data: any) => {
  pendingLocalCreations.set(id, { collection, data, timestamp: Date.now() });
};

const clearPendingCreation = (id: string) => {
  pendingLocalCreations.delete(id);
};

/**
 * Universal helper to extract high-precision timestamp from an item (createdAt, updatedAt, or ID timestamp)
 */
export const getItemTimestamp = (item: any): number => {
  if (!item) return 0;
  if (item.createdAt) {
    const t = new Date(item.createdAt).getTime();
    if (!isNaN(t) && t > 0) return t;
  }
  if (item.updatedAt) {
    const t = new Date(item.updatedAt).getTime();
    if (!isNaN(t) && t > 0) return t;
  }
  if (item.id && typeof item.id === 'string') {
    // Check if ID contains millisecond timestamp (e.g. sewa-drive-1726880000000-1-xxx or sewa-custom-1726880000000)
    const m = item.id.match(/(\d{10,14})/);
    if (m && m[1]) {
      const num = parseInt(m[1], 10);
      if (!isNaN(num) && num > 1000000000) return num;
    }
  }
  return 0;
};

/**
 * Sorts an array of products so that the newest additions appear at the very top.
 */
export const sortProductsByNewestFirst = (prods: SewaProduct[]): SewaProduct[] => {
  return [...prods].sort((a, b) => {
    const timeA = getItemTimestamp(a);
    const timeB = getItemTimestamp(b);
    if (timeB !== timeA) return timeB - timeA;
    // Secondary tie-breaker by ID
    return (b.id || '').localeCompare(a.id || '');
  });
};

const loadStoredProducts = (): SewaProduct[] => {
  try {
    const deletedIds = getDeletedIds('senna_sewa_deleted_product_ids_v2');
    const saved = localStorage.getItem('senna_sewa_products_v2');
    const customSaved = localStorage.getItem('senna_sewa_custom_products_v2');
    let customList: SewaProduct[] = [];
    if (customSaved) {
      try {
        const parsedCustom = JSON.parse(customSaved);
        if (Array.isArray(parsedCustom)) {
          customList = parsedCustom.filter((c: any) => !deletedIds.has(c.id) && !LEGACY_DEFAULT_PRODUCT_IDS.has(c.id));
        }
      } catch (e) {}
    }

    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const existingIds = new Set(parsed.map((p: any) => p.id));
        const combined = [...parsed, ...customList.filter((c) => !existingIds.has(c.id))]
          .filter((p) => !deletedIds.has(p.id) && !LEGACY_DEFAULT_PRODUCT_IDS.has(p.id));
        const formatted = combined.map((p) => ({
          ...p,
          colors: Array.isArray(p.colors) && p.colors.length > 0 ? p.colors : ['Pilihan Standar'],
          sizes: Array.isArray(p.sizes) && p.sizes.length > 0 ? p.sizes : ['S', 'M', 'L', 'XL', 'XXL'],
          sizeStock: p.sizeStock && Object.keys(p.sizeStock).length > 0 ? p.sizeStock : { S: 2, M: 3, L: 2, XL: 1, XXL: 1 },
          additionalImages: Array.isArray(p.additionalImages) && p.additionalImages.length > 0 ? p.additionalImages : [p.imageUrl],
        }));
        return sortProductsByNewestFirst(formatted);
      }
    }

    if (customList.length > 0) {
      return sortProductsByNewestFirst(customList);
    }
    return [];
  } catch (e) {}
  return [];
};

const loadStoredUser = (): SewaUser | null => {
  try {
    const saved = localStorage.getItem('senna_sewa_user_v2');
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return null;
};

const loadStoredRegisteredUsers = (): SewaUser[] => {
  try {
    const saved = localStorage.getItem('senna_sewa_registered_users_v2');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
};

const loadStoredOrders = (): SewaOrder[] => {
  try {
    const saved = localStorage.getItem('senna_sewa_orders_v2');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return INITIAL_DEMO_ORDERS;
};

const DEFAULT_BANNERS: SewaBanner[] = [];

const loadStoredBanners = (): SewaBanner[] => {
  try {
    const deletedIds = getDeletedIds('senna_sewa_deleted_banner_ids_v2');
    const saved = localStorage.getItem('senna_sewa_banners_v2');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        const filtered = parsed.filter((b: any) => !deletedIds.has(b.id) && !LEGACY_DEFAULT_BANNER_IDS.has(b.id));
        return filtered.sort((a, b) => getItemTimestamp(b) - getItemTimestamp(a));
      }
    }
    return [];
  } catch (e) {}
  return [];
};

const loadStoredPackages = (): PackageItem[] => {
  try {
    const deletedIds = getDeletedIds('senna_sewa_deleted_package_ids_v2');
    const saved = localStorage.getItem('senna_sewa_packages_v2');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        const filtered = parsed.filter((p: any) => !deletedIds.has(p.id) && !LEGACY_DEFAULT_PACKAGE_IDS.has(p.id));
        return filtered.sort((a, b) => getItemTimestamp(b) - getItemTimestamp(a));
      }
    }
    return [];
  } catch (e) {}
  return [];
};

const loadStoredGallery = (): GalleryItem[] => {
  try {
    const deletedIds = getDeletedIds('senna_sewa_deleted_gallery_ids_v2');
    const saved = localStorage.getItem('senna_sewa_gallery_v2');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        const filtered = parsed.filter((g: any) => !deletedIds.has(g.id) && !LEGACY_DEFAULT_GALLERY_IDS.has(g.id));
        return filtered.sort((a, b) => getItemTimestamp(b) - getItemTimestamp(a));
      }
    }
    return [];
  } catch (e) {}
  return [];
};

const loadStoredTestimonials = (): Testimonial[] => {
  try {
    const deletedIds = getDeletedIds('senna_sewa_deleted_testimonial_ids_v2');
    const saved = localStorage.getItem('senna_sewa_testimonials_v2');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const filtered = parsed.filter((t: any) => !deletedIds.has(t.id));
        return filtered.sort((a, b) => getItemTimestamp(b) - getItemTimestamp(a));
      }
    }
    return (TESTIMONIALS_DATA || []).filter((t) => !deletedIds.has(t.id));
  } catch (e) {}
  return TESTIMONIALS_DATA || [];
};

const DEFAULT_WEB_SETTINGS: WebSettings = {
  webLogoUrl: '',
  webIconUrl: '',
  webName: 'Senna Gallery',
  webTagline: 'Professional Bridal Makeup, Atelier, & Decoration',
  
  heroTitleLine1: 'Wujudkan Momen Sakral',
  heroTitleLine2: 'Penuh Keanggunan & Cinta',
  heroSubtitle: 'Sentuhan mahakarya riasan pengantin flawless berkelas dunia oleh Senna MUA Gallery, dekorasi pelaminan estetik & megah oleh Sekka Design, serta koleksi gaun & kebaya pengantin siap fitting di studio.',
  heroTaglineText: 'Vendor Pernikahan Mewah & Elegan Lampung',
  heroBackgroundImage: '',
  heroVideoUrl: '',
  
  aboutTitle: 'Tentang Senna Gallery',
  aboutSubtitle: 'The Epitome of Elegance & Luxury',
  aboutDescription1: 'Berdiri di Bandar Lampung, Senna Gallery & Sekka Decoration berkomitmen menghadirkan keanggunan, estetika, dan layanan premium terbaik untuk setiap hari bahagia pernikahan Anda.',
  aboutDescription2: 'Kami mengerti bahwa hari pernikahan Anda adalah babak baru yang begitu sakral. Itulah mengapa setiap sapuan kuas makeup, susunan kelopak bunga dekorasi, hingga detail jahitan kebaya dikerjakan dengan dedikasi tinggi demi memancarkan pesona terbaik diri Anda.',
  aboutImage1: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200',
  aboutImage2: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=1200',
  
  contactWhatsapp: '6282279672876',
  contactInstagram: '@senna_mua_gallery',
  contactInstagramUrl: 'https://instagram.com/senna_mua_gallery',
  contactAddress: 'Jl. RA basyid, Gg Kemuning 2 No 28, Labuhan Dalam, Tanjung Senang, Kota Bandar Lampung',
  contactAddressSnippet: 'Jl. RA basyid, Gg Kemuning 2 No 28',
  contactMapsEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3972.333857508605!2d105.286392!3d-5.365112!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNcKwMjEnNTQuNCJTIDEwNcKwMTcnMTEuMCJF!5e0!3m2!1sid!2sid!4v1625000000000!5m2!1sid!2sid',

  service1Title: 'Senna MUA Gallery',
  service1Subtitle: 'Bridal Makeup Artist & Hijabdo Specialist',
  service1Desc: 'Dikelola dengan standar rias haute couture, Senna MUA mengutamakan teknik complexion yang tipis, glowing, namun tahan hingga lebih dari 16 jam. Menggunakan produk premium (Dior, MAC, Charlotte Tilbury) untuk hasil sempurna di depan kamera.',
  service1Instagram: '@senna_mua_gallery',
  service1InstagramUrl: 'https://instagram.com/senna_mua_gallery',

  service2Title: 'Sekka Design Decoration',
  service2Subtitle: 'Modern Aesthetic Pelaminan & Venue',
  service2Desc: 'Sekka Design menciptakan panggung pelaminan tematik mulai dari Classic Romance, Modern Botanical Glasshouse, hingga Megah Adat Kontemporer dengan bunga segar melimpah dan pencahayaan dramatis.',
  service2Instagram: '@sekka_designdecoration',
  service2InstagramUrl: 'https://instagram.com/sekka_designdecoration',

  service3Title: 'Senna Wedding Attire',
  service3Subtitle: 'Koleksi Gaun, Kebaya & Beskap Pengantin',
  service3Desc: 'Koleksi busana pengantin eksklusif: Royal Ballgown ekor panjang, Kebaya Brokat Prancis, dan Beskap Adat Beludru Jerman dengan jahitan payet mutiara detail yang siap di-fitting langsung di studio kami.',
  service3Instagram: '@senna_weddingattire',
  service3InstagramUrl: 'https://instagram.com/senna_weddingattire'
};

const loadStoredWebSettings = (): WebSettings => {
  try {
    const saved = localStorage.getItem('senna_sewa_web_settings_v2');
    if (saved) return { ...DEFAULT_WEB_SETTINGS, ...JSON.parse(saved) };
  } catch (e) {}
  return DEFAULT_WEB_SETTINGS;
};

let activeSyncFromMysqlRef: ((force?: boolean) => Promise<void>) | null = null;

export const forceRefreshAllLiveStores = async () => {
  if (activeSyncFromMysqlRef) {
    await activeSyncFromMysqlRef(true);
  }
};

export const useSewaStore = create<SewaStoreState>((set, get) => {
  const initialProducts = loadStoredProducts();
  const initialUser = loadStoredUser();
  const initialRegisteredUsers = loadStoredRegisteredUsers();
  const initialOrders = loadStoredOrders();
  const initialBanners = loadStoredBanners();
  const initialPackages = loadStoredPackages();
  const initialGallery = loadStoredGallery();
  const initialTestimonials = loadStoredTestimonials();
  const initialAdminLogged = typeof window !== 'undefined' && sessionStorage.getItem('senna_admin_auth') === 'true';

  // Initialize real-time synchronization with Firestore and throttled MySQL Hostinger bridge
  if (typeof window !== 'undefined') {
    setTimeout(async () => {
      // 1. Verify Firestore Connection as per Firebase integration rules
      try {
        await testFirestoreConnection();
      } catch (_) {}

      // 1B. Real-time Subscription to Deleted Records Tombstones (Anti-Resurrection)
      syncCollectionFromFirestore<{ id: string; collection?: string }>('deleted_records', (records) => {
        if (Array.isArray(records) && records.length > 0) {
          records.forEach((rec) => {
            const rawId = rec.id || '';
            const cleanId = rawId.includes('_') ? rawId.split('_').slice(1).join('_') : rawId;
            if (cleanId) {
              markIdDeleted('senna_sewa_deleted_product_ids_v2', cleanId);
              markIdDeleted('senna_sewa_deleted_banner_ids_v2', cleanId);
              markIdDeleted('senna_sewa_deleted_package_ids_v2', cleanId);
              markIdDeleted('senna_sewa_deleted_gallery_ids_v2', cleanId);
            }
          });

          // Immediate in-memory purge
          const deletedP = getDeletedIds('senna_sewa_deleted_product_ids_v2');
          const deletedB = getDeletedIds('senna_sewa_deleted_banner_ids_v2');
          const deletedPkg = getDeletedIds('senna_sewa_deleted_package_ids_v2');
          const deletedG = getDeletedIds('senna_sewa_deleted_gallery_ids_v2');

          set((state) => ({
            products: state.products.filter((p) => !deletedP.has(p.id)),
            banners: state.banners.filter((b) => !deletedB.has(b.id)),
            packages: state.packages.filter((pkg) => !deletedPkg.has(pkg.id)),
            gallery: state.gallery.filter((g) => !deletedG.has(g.id)),
          }));
        }
      });

      // 2. Real-time Subscriptions with Firestore (only if quota is active)
      if (!isFirestoreQuotaExceeded()) {
        syncCollectionFromFirestore<SewaProduct>('products', (firestoreProducts) => {
          if (Array.isArray(firestoreProducts)) {
            const deletedIds = getDeletedIds('senna_sewa_deleted_product_ids_v2');
            const valid = firestoreProducts.filter(
              (p) => !deletedIds.has(p.id) && !LEGACY_DEFAULT_PRODUCT_IDS.has(p.id)
            );
            const current = get().products;
            const firestoreIds = new Set(valid.map((p) => p.id));
            // Only keep local creations that were actively added in current session
            const localPending = current.filter(
              (p) => pendingLocalCreations.has(p.id) && !firestoreIds.has(p.id) && !deletedIds.has(p.id) && !LEGACY_DEFAULT_PRODUCT_IDS.has(p.id)
            );
            const merged = [...localPending, ...valid];
            set({ products: merged, isCloudConnected: true });
            try {
              localStorage.setItem('senna_sewa_products_v2', JSON.stringify(merged));
            } catch (e) {}
          }
        });

        syncCollectionFromFirestore<SewaBanner>('banners', (banners) => {
          if (Array.isArray(banners)) {
            const deletedIds = getDeletedIds('senna_sewa_deleted_banner_ids_v2');
            const valid = banners.filter((b) => !deletedIds.has(b.id) && !LEGACY_DEFAULT_BANNER_IDS.has(b.id));
            const current = get().banners;
            const remoteIds = new Set(valid.map((b) => b.id));
            const localPending = current.filter(
              (b) => pendingLocalCreations.has(b.id) && !remoteIds.has(b.id) && !deletedIds.has(b.id) && !LEGACY_DEFAULT_BANNER_IDS.has(b.id)
            );
            const merged = [...localPending, ...valid];
            set({ banners: merged, isCloudConnected: true });
            try {
              localStorage.setItem('senna_sewa_banners_v2', JSON.stringify(merged));
            } catch (e) {}
          }
        });

        syncCollectionFromFirestore<PackageItem>('packages', (pkgs) => {
          if (Array.isArray(pkgs)) {
            const deletedIds = getDeletedIds('senna_sewa_deleted_package_ids_v2');
            const valid = pkgs.filter((p) => !deletedIds.has(p.id) && !LEGACY_DEFAULT_PACKAGE_IDS.has(p.id));
            const current = get().packages;
            const remoteIds = new Set(valid.map((p) => p.id));
            const localPending = current.filter(
              (p) => pendingLocalCreations.has(p.id) && !remoteIds.has(p.id) && !deletedIds.has(p.id) && !LEGACY_DEFAULT_PACKAGE_IDS.has(p.id)
            );
            const merged = [...localPending, ...valid];
            set({ packages: merged, isCloudConnected: true });
            try {
              localStorage.setItem('senna_sewa_packages_v2', JSON.stringify(merged));
            } catch (e) {}
          }
        });

        syncCollectionFromFirestore<GalleryItem>('gallery', (gallery) => {
          if (Array.isArray(gallery)) {
            const deletedIds = getDeletedIds('senna_sewa_deleted_gallery_ids_v2');
            const valid = gallery.filter((g) => !deletedIds.has(g.id) && !LEGACY_DEFAULT_GALLERY_IDS.has(g.id));
            const current = get().gallery;
            const remoteIds = new Set(valid.map((g) => g.id));
            const localPending = current.filter(
              (g) => pendingLocalCreations.has(g.id) && !remoteIds.has(g.id) && !deletedIds.has(g.id) && !LEGACY_DEFAULT_GALLERY_IDS.has(g.id)
            );
            const merged = [...localPending, ...valid];
            set({ gallery: merged, isCloudConnected: true });
            try {
              localStorage.setItem('senna_sewa_gallery_v2', JSON.stringify(merged));
            } catch (e) {}
          }
        });

        syncCollectionFromFirestore<Testimonial>('testimonials', (testimonials) => {
          if (Array.isArray(testimonials)) {
            const deletedIds = getDeletedIds('senna_sewa_deleted_testimonial_ids_v2');
            const valid = testimonials.filter((t) => !deletedIds.has(t.id));
            const current = get().testimonials;
            const remoteIds = new Set(valid.map((t) => t.id));
            const localPending = current.filter(
              (t) => pendingLocalCreations.has(t.id) && !remoteIds.has(t.id) && !deletedIds.has(t.id)
            );
            const merged = [...localPending, ...valid];
            set({ testimonials: merged, isCloudConnected: true });
            try {
              localStorage.setItem('senna_sewa_testimonials_v2', JSON.stringify(merged));
            } catch (e) {}
          }
        });

        syncDocumentFromFirestore<WebSettings>('settings', 'global', (settings) => {
          if (settings) {
            const merged = { ...DEFAULT_WEB_SETTINGS, ...settings };
            set({ webSettings: merged, isCloudConnected: true });
            try {
              localStorage.setItem('senna_sewa_web_settings_v2', JSON.stringify(merged));
            } catch (e) {}
          }
        });

        syncCollectionFromFirestore<SewaOrder>('orders', (orders) => {
          if (Array.isArray(orders)) {
            const sorted = [...orders].sort(
              (a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            set({ orders: sorted, isCloudConnected: true });
            try {
              localStorage.setItem('senna_sewa_orders_v2', JSON.stringify(sorted));
            } catch (e) {}
          }
        });

        syncCollectionFromFirestore<SewaUser>('registered_users', (users) => {
          if (Array.isArray(users)) {
            set({ registeredUsers: users, isCloudConnected: true });
            try {
              localStorage.setItem('senna_sewa_registered_users_v2', JSON.stringify(users));
            } catch (e) {}
          }
        });
      }

      // 3. Resilient MySQL Hostinger Smart Versioning Synchronization Bridge (Recommendation #1)
      let isSyncingMysql = false;
      let lastMysqlSyncTime = 0;
      let lastKnownVersionHash = '';
      let isCheckingVersion = false;

      const syncFromMysqlBackend = async (force = false, versionInfo?: DatabaseVersionInfo | null) => {
        const now = Date.now();
        if (!force && isSyncingMysql) return;
        if (!force && now - lastMysqlSyncTime < 8000) return; // 8s minimum cooldown between full syncs
        isSyncingMysql = true;

        try {
          const allMysql = await fetchAllFromMysql();
          if (allMysql) {
            lastMysqlSyncTime = Date.now();
            
            // Clean up stale pending creations (> 20s old)
            for (const [pId, pData] of pendingLocalCreations.entries()) {
              if (now - pData.timestamp > 20000) {
                pendingLocalCreations.delete(pId);
              }
            }
            
            // If versionInfo not passed, fetch it now so we lock in current version
            if (!versionInfo) {
              try {
                versionInfo = await fetchDatabaseVersionFromMysql();
              } catch (e) {}
            }

            if (versionInfo && versionInfo.version) {
              lastKnownVersionHash = versionInfo.version;
            }

            set({
              isMysqlConnected: true,
              isCloudConnected: true,
              mysqlStatusMessage: 'Terhubung ke MySQL Hostinger (Smart Versioning Aktif)',
              lastDbVersion: versionInfo?.version || lastKnownVersionHash || 'synced',
              lastDbTimestamp: versionInfo?.latest_timestamp || new Date().toISOString(),
            });

            // 0. Process Deleted Records from MySQL
            if (Array.isArray(allMysql.deletedRecords) && allMysql.deletedRecords.length > 0) {
              allMysql.deletedRecords.forEach((delId: string) => {
                if (delId) {
                  markIdDeleted('senna_sewa_deleted_product_ids_v2', delId);
                  markIdDeleted('senna_sewa_deleted_banner_ids_v2', delId);
                  markIdDeleted('senna_sewa_deleted_package_ids_v2', delId);
                  markIdDeleted('senna_sewa_deleted_gallery_ids_v2', delId);
                  clearPendingCreation(delId);
                }
              });
            }

            // 1. PRODUCTS: sync to state with Newest-First ordering
            if (Array.isArray(allMysql.products)) {
              const remoteProducts: SewaProduct[] = allMysql.products;
              const remoteIds = new Set(remoteProducts.map((p) => p.id));
              const deletedIds = getDeletedIds('senna_sewa_deleted_product_ids_v2');

              const validRemote = remoteProducts.filter(
                (p) => !deletedIds.has(p.id) && !LEGACY_DEFAULT_PRODUCT_IDS.has(p.id)
              );

              const currentLocal = get().products;
              const pendingItems = currentLocal.filter(
                (p) => pendingLocalCreations.has(p.id) && !remoteIds.has(p.id) && !deletedIds.has(p.id) && !LEGACY_DEFAULT_PRODUCT_IDS.has(p.id)
              );

              const combinedProducts = sortProductsByNewestFirst([
                ...pendingItems,
                ...validRemote.filter((rp) => !pendingItems.some((pi) => pi.id === rp.id)),
              ]);

              set({ products: combinedProducts });
              try {
                localStorage.setItem('senna_sewa_products_v2', JSON.stringify(combinedProducts));
                localStorage.removeItem('senna_sewa_custom_products_v2'); // Purge legacy cache to prevent resurrection
              } catch (e) {}
            }

            // 2. BANNERS: sync to state with Newest-First ordering
            if (Array.isArray(allMysql.banners)) {
              const deletedIds = getDeletedIds('senna_sewa_deleted_banner_ids_v2');
              const valid = allMysql.banners.filter(
                (b: any) => !deletedIds.has(b.id) && !LEGACY_DEFAULT_BANNER_IDS.has(b.id)
              );
              const currentLocal = get().banners;
              const remoteIds = new Set(valid.map((b: any) => b.id));
              const pendingItems = currentLocal.filter(
                (b) => pendingLocalCreations.has(b.id) && !remoteIds.has(b.id) && !deletedIds.has(b.id) && !LEGACY_DEFAULT_BANNER_IDS.has(b.id)
              );
              const combinedBanners = [...pendingItems, ...valid.filter((vb: any) => !pendingItems.some((pi) => pi.id === vb.id))]
                .sort((a, b) => getItemTimestamp(b) - getItemTimestamp(a));

              set({ banners: combinedBanners });
              try {
                localStorage.setItem('senna_sewa_banners_v2', JSON.stringify(combinedBanners));
              } catch (e) {}
            }

            // 3. PACKAGES: sync to state with Newest-First ordering
            if (Array.isArray(allMysql.packages)) {
              const deletedIds = getDeletedIds('senna_sewa_deleted_package_ids_v2');
              const valid = allMysql.packages.filter(
                (p: any) => !deletedIds.has(p.id) && !LEGACY_DEFAULT_PACKAGE_IDS.has(p.id)
              );
              const currentLocal = get().packages;
              const remoteIds = new Set(valid.map((p) => p.id));
              const pendingItems = currentLocal.filter(
                (p) => pendingLocalCreations.has(p.id) && !remoteIds.has(p.id) && !deletedIds.has(p.id) && !LEGACY_DEFAULT_PACKAGE_IDS.has(p.id)
              );
              const combinedPackages = [...pendingItems, ...valid.filter((vp: any) => !pendingItems.some((pi) => pi.id === vp.id))]
                .sort((a, b) => getItemTimestamp(b) - getItemTimestamp(a));

              set({ packages: combinedPackages });
              try {
                localStorage.setItem('senna_sewa_packages_v2', JSON.stringify(combinedPackages));
              } catch (e) {}
            }

            // 4. GALLERY: sync to state with Newest-First ordering
            if (Array.isArray(allMysql.gallery)) {
              const deletedIds = getDeletedIds('senna_sewa_deleted_gallery_ids_v2');
              const valid = allMysql.gallery.filter(
                (g: any) => !deletedIds.has(g.id) && !LEGACY_DEFAULT_GALLERY_IDS.has(g.id)
              );
              const currentLocal = get().gallery;
              const remoteIds = new Set(valid.map((g) => g.id));
              const pendingItems = currentLocal.filter(
                (g) => pendingLocalCreations.has(g.id) && !remoteIds.has(g.id) && !deletedIds.has(g.id) && !LEGACY_DEFAULT_GALLERY_IDS.has(g.id)
              );
              const combinedGallery = [...pendingItems, ...valid.filter((vg: any) => !pendingItems.some((pi) => pi.id === vg.id))]
                .sort((a, b) => getItemTimestamp(b) - getItemTimestamp(a));

              set({ gallery: combinedGallery });
              try {
                localStorage.setItem('senna_sewa_gallery_v2', JSON.stringify(combinedGallery));
              } catch (e) {}
            }

            // 5. WEB SETTINGS
            if (allMysql.webSettings) {
              const merged = { ...DEFAULT_WEB_SETTINGS, ...allMysql.webSettings };
              set({ webSettings: merged });
              try {
                localStorage.setItem('senna_sewa_web_settings_v2', JSON.stringify(merged));
              } catch (e) {}
            }

            // 6. ORDERS
            if (Array.isArray(allMysql.orders)) {
              const sorted = [...allMysql.orders].sort(
                (a: any, b: any) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
              );
              set({ orders: sorted });
              try {
                localStorage.setItem('senna_sewa_orders_v2', JSON.stringify(sorted));
              } catch (e) {}
            }

            // 7. REGISTERED USERS
            if (Array.isArray(allMysql.registeredUsers)) {
              set({ registeredUsers: allMysql.registeredUsers });
              try {
                localStorage.setItem('senna_sewa_registered_users_v2', JSON.stringify(allMysql.registeredUsers));
              } catch (e) {}
            }

            // 8. TESTIMONIALS & USER REVIEWS
            if (Array.isArray(allMysql.testimonials)) {
              const deletedIds = getDeletedIds('senna_sewa_deleted_testimonial_ids_v2');
              const valid = allMysql.testimonials.filter((t: any) => !deletedIds.has(t.id));
              const currentLocal = get().testimonials;
              const remoteIds = new Set(valid.map((t: any) => t.id));
              const pendingItems = currentLocal.filter(
                (t) => pendingLocalCreations.has(t.id) && !remoteIds.has(t.id) && !deletedIds.has(t.id)
              );
              const combinedTestimonials = [...pendingItems, ...valid.filter((vt: any) => !pendingItems.some((pi) => pi.id === vt.id))]
                .sort((a, b) => getItemTimestamp(b) - getItemTimestamp(a));

              set({ testimonials: combinedTestimonials });
              try {
                localStorage.setItem('senna_sewa_testimonials_v2', JSON.stringify(combinedTestimonials));
              } catch (e) {}
            }
          }
        } catch (mysqlErr) {
          // Silent catch
        } finally {
          isSyncingMysql = false;
        }
      };

      /**
       * Smart Version Timestamp Polling Check:
       * Queries the lightweight get_version endpoint (<300 bytes, <10ms).
       * Only triggers full data synchronization if MySQL data was actually modified.
       */
      const smartCheckMysqlVersion = async (force = false): Promise<boolean> => {
        if (isCheckingVersion) return false;
        isCheckingVersion = true;

        try {
          const versionInfo = await fetchDatabaseVersionFromMysql();
          if (versionInfo && versionInfo.version) {
            const hasChanged = !lastKnownVersionHash || lastKnownVersionHash !== versionInfo.version;
            if (hasChanged || force) {
              await syncFromMysqlBackend(true, versionInfo);
              return true;
            }
            return false;
          } else {
            // Fallback for older api.php or timeout
            if (force) {
              await syncFromMysqlBackend(true);
              return true;
            }
            return false;
          }
        } catch (e) {
          return false;
        } finally {
          isCheckingVersion = false;
        }
      };

      activeSyncFromMysqlRef = async (force = true) => {
        await smartCheckMysqlVersion(force);
      };

      // Initial Sync from MySQL (Smart Versioned)
      smartCheckMysqlVersion(true);

      // Smart Polling Loop: Checks lightweight version every 15 seconds when tab is active
      setInterval(() => {
        if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
          smartCheckMysqlVersion(false);
        }
      }, 15000);

      // Window Focus & Visibility Change: Instantly check version when user switches back to tab or device
      if (typeof document !== 'undefined') {
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            smartCheckMysqlVersion(false);
          }
        });
      }
      if (typeof window !== 'undefined') {
        window.addEventListener('focus', () => {
          smartCheckMysqlVersion(false);
        });
      }

      // Cross-Tab BroadcastChannel: Instant sync across tabs on same device
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        try {
          const channel = new BroadcastChannel('senna_gallery_sync');
          channel.onmessage = (event) => {
            if (event.data === 'sync_now') {
              smartCheckMysqlVersion(true);
            }
          };
        } catch (e) {}
      }
    }, 100);
  }

  const notifyBroadcastSync = () => {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const ch = new BroadcastChannel('senna_gallery_sync');
        ch.postMessage('sync_now');
      } catch (e) {}
    }
  };

  return {
    // 1. PRODUCTS
    products: initialProducts,

    addProduct: async (newProd) => {
      const id = newProd.id || `sewa-custom-${Date.now()}`;
      
      // Auto compress large Base64 if needed
      let imageUrl = newProd.imageUrl;
      if (imageUrl && imageUrl.startsWith('data:image/')) {
        imageUrl = await compressBase64IfNeeded(imageUrl);
      }

      const fullProduct: SewaProduct = {
        ...newProd,
        id,
        imageUrl,
        code: newProd.code || `SNA-${Math.floor(100 + Math.random() * 900)}`,
        priceFormatted: newProd.priceFormatted || `Rp ${newProd.price.toLocaleString('id-ID')} / 3 hari`,
        sizes: newProd.sizes?.length ? newProd.sizes : ['S', 'M', 'L', 'XL', 'XXL'],
        sizeStock: newProd.sizeStock || { S: 2, M: 3, L: 2, XL: 1, XXL: 1 },
        colors: newProd.colors?.length ? newProd.colors : ['Pilihan Standar'],
        additionalImages: newProd.additionalImages?.length ? newProd.additionalImages : [imageUrl],
        rating: newProd.rating || 5.0,
        reviewCount: newProd.reviewCount || 1,
        totalRented: newProd.totalRented || 0,
        isOfficialStore: true,
        location: newProd.location || 'Bandar Lampung',
        inclusions: newProd.inclusions?.length ? newProd.inclusions : ['Free fitting studio di Bandar Lampung', 'Bebas cuci & dry clean steril'],
        material: newProd.material || 'Premium Fabrics & Embellishments',
        fittingNotes: newProd.fittingNotes || 'Dapat disesuaikan di studio fitting Senna Gallery.',
        isNewArrival: newProd.isNewArrival !== undefined ? newProd.isNewArrival : true,
        createdAt: newProd.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      unmarkIdDeleted('senna_sewa_deleted_product_ids_v2', fullProduct.id);
      trackPendingCreation('products', fullProduct.id, fullProduct);

      set((state) => {
        const updated = sortProductsByNewestFirst([fullProduct, ...state.products.filter((p) => p.id !== fullProduct.id)]);
        try {
          localStorage.setItem('senna_sewa_products_v2', JSON.stringify(updated));
          localStorage.removeItem('senna_sewa_custom_products_v2');
        } catch (e) {}
        return { products: updated };
      });

      // Save to Firestore & MySQL Hostinger
      saveDocToFirestore('products', fullProduct.id, fullProduct);
      const saved = await saveDocToMysql('products', fullProduct.id, fullProduct);
      if (!saved) {
        // Retry once after 500ms
        await new Promise((res) => setTimeout(res, 500));
        await saveDocToMysql('products', fullProduct.id, fullProduct);
      }
      notifyBroadcastSync();

      get().showToast(`Busana "${fullProduct.name}" berhasil disimpan ke katalog!`, 'success');
      return fullProduct;
    },

    addProductsBatch: async (newProds) => {
      if (!newProds || newProds.length === 0) return [];

      const timestamp = Date.now();
      const currentProducts = get().products;
      const existingCodes = new Set(currentProducts.map((p) => p.code).filter(Boolean));

      const processedProducts: SewaProduct[] = newProds.map((newProd, idx) => {
        const id = newProd.id || `sewa-drive-${timestamp}-${idx + 1}-${Math.random().toString(36).substring(2, 7)}`;
        
        let code = newProd.code;
        if (!code) {
          let codeNum = currentProducts.length + idx + 1;
          while (existingCodes.has(`SNA-${String(codeNum).padStart(3, '0')}`)) {
            codeNum++;
          }
          code = `SNA-${String(codeNum).padStart(3, '0')}`;
          existingCodes.add(code);
        }

        const fullProduct: SewaProduct = {
          ...newProd,
          id,
          code,
          price: typeof newProd.price === 'number' && newProd.price > 0 ? newProd.price : 250000,
          originalPrice: newProd.originalPrice || (typeof newProd.price === 'number' && newProd.price > 0 ? Math.round(newProd.price * 1.3) : 350000),
          priceFormatted: newProd.priceFormatted || `Rp ${(newProd.price || 250000).toLocaleString('id-ID')} / 3 hari`,
          sizes: newProd.sizes?.length ? newProd.sizes : ['S', 'M', 'L', 'XL', 'XXL'],
          sizeStock: newProd.sizeStock || { S: 2, M: 3, L: 2, XL: 1, XXL: 1 },
          colors: newProd.colors?.length ? newProd.colors : ['Pilihan Standar'],
          additionalImages: newProd.additionalImages?.length ? newProd.additionalImages : [newProd.imageUrl],
          rating: newProd.rating || 5.0,
          reviewCount: newProd.reviewCount || 1,
          totalRented: newProd.totalRented || 0,
          isOfficialStore: true,
          location: newProd.location || 'Bandar Lampung',
          inclusions: newProd.inclusions?.length ? newProd.inclusions : ['Free fitting studio di Bandar Lampung', 'Bebas cuci & dry clean steril'],
          material: newProd.material || 'Premium Fabrics & Embellishments',
          fittingNotes: newProd.fittingNotes || 'Dapat disesuaikan di studio fitting Senna Gallery.',
          isNewArrival: newProd.isNewArrival !== undefined ? newProd.isNewArrival : true,
          createdAt: newProd.createdAt || new Date(timestamp + idx * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
        };

        unmarkIdDeleted('senna_sewa_deleted_product_ids_v2', fullProduct.id);
        trackPendingCreation('products', fullProduct.id, fullProduct);
        return fullProduct;
      });

      set((state) => {
        const newIds = new Set(processedProducts.map((p) => p.id));
        const filteredOld = state.products.filter((p) => !newIds.has(p.id));
        const updated = sortProductsByNewestFirst([...processedProducts, ...filteredOld]);
        try {
          localStorage.setItem('senna_sewa_products_v2', JSON.stringify(updated));
          localStorage.removeItem('senna_sewa_custom_products_v2');
        } catch (e) {}
        return { products: updated };
      });

      // Save batch to Firestore & MySQL Hostinger
      saveBatchToFirestore('products', processedProducts);
      await saveBatchToMysql('products', processedProducts);
      notifyBroadcastSync();

      get().showToast(`${processedProducts.length} busana dari Google Drive berhasil ditambahkan ke katalog!`, 'success');
      return processedProducts;
    },

    updateProduct: async (id, updatedFields) => {
      let mergedProduct: SewaProduct | null = null;

      set((state) => {
        const updated = state.products.map((p) => {
          if (p.id === id) {
            const merged = { ...p, ...updatedFields, updatedAt: new Date().toISOString() };
            if (updatedFields.price && !updatedFields.priceFormatted) {
              merged.priceFormatted = `Rp ${updatedFields.price.toLocaleString('id-ID')} / 3 hari`;
            }
            mergedProduct = merged;
            return merged;
          }
          return p;
        });
        try {
          localStorage.setItem('senna_sewa_products_v2', JSON.stringify(updated));
          localStorage.removeItem('senna_sewa_custom_products_v2');
        } catch (e) {}
        return { products: updated };
      });

      // Save to Firestore & MySQL
      if (mergedProduct) {
        trackPendingCreation('products', id, mergedProduct);
        saveDocToFirestore('products', id, mergedProduct);
        await saveDocToMysql('products', id, mergedProduct);
        notifyBroadcastSync();
      }

      get().showToast('Katalog busana berhasil diperbarui!', 'success');
    },

    deleteProduct: (id) => {
      markIdDeleted('senna_sewa_deleted_product_ids_v2', id);
      clearPendingCreation(id);

      set((state) => {
        const updated = state.products.filter((p) => p.id !== id);
        try {
          localStorage.setItem('senna_sewa_products_v2', JSON.stringify(updated));
          localStorage.removeItem('senna_sewa_custom_products_v2');
        } catch (e) {}
        return { products: updated };
      });

      // Write tombstone to prevent resurrection across all devices
      saveDocToFirestore('deleted_records', `products_${id}`, { id, collection: 'products', deletedAt: new Date().toISOString() });
      // Delete from Firestore & MySQL
      deleteDocFromFirestore('products', id);
      deleteDocFromMysql('products', id);
      notifyBroadcastSync();

      get().showToast('Busana berhasil dihapus dari katalog sewa.', 'info');
    },

    resetDefaultProducts: () => {
      clearDeletedIds('senna_sewa_deleted_product_ids_v2');
      try {
        localStorage.removeItem('senna_sewa_products_v2');
        localStorage.removeItem('senna_sewa_custom_products_v2');
      } catch (e) {}
      set({ products: [] });
      get().showToast('Katalog busana berhasil dikosongkan.', 'info');
    },

    clearAllCatalogs: async () => {
      pendingLocalCreations.clear();
      try {
        localStorage.removeItem('senna_sewa_products_v2');
        localStorage.removeItem('senna_sewa_custom_products_v2');
        localStorage.removeItem('senna_sewa_banners_v2');
        localStorage.removeItem('senna_sewa_packages_v2');
        localStorage.removeItem('senna_sewa_gallery_v2');
        // Mark all legacy IDs as deleted
        LEGACY_DEFAULT_PRODUCT_IDS.forEach((id) => markIdDeleted('senna_sewa_deleted_product_ids_v2', id));
        LEGACY_DEFAULT_BANNER_IDS.forEach((id) => markIdDeleted('senna_sewa_deleted_banner_ids_v2', id));
        LEGACY_DEFAULT_PACKAGE_IDS.forEach((id) => markIdDeleted('senna_sewa_deleted_package_ids_v2', id));
        LEGACY_DEFAULT_GALLERY_IDS.forEach((id) => markIdDeleted('senna_sewa_deleted_gallery_ids_v2', id));
      } catch (e) {}
      set({
        products: [],
        banners: [],
        packages: [],
        gallery: []
      });
      await clearAllCatalogsInMysql();
      notifyBroadcastSync();
      get().showToast('Seluruh katalog (busana, banner, paket, galeri) telah dikosongkan dari MySQL!', 'success');
    },

    // 1B. BANNERS CRUD
    banners: initialBanners,

    addBanner: async (newBanner) => {
      const id = newBanner.id || `banner-custom-${Date.now()}`;
      const fullBanner: SewaBanner = {
        ...newBanner,
        id,
        createdAt: newBanner.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      unmarkIdDeleted('senna_sewa_deleted_banner_ids_v2', id);
      trackPendingCreation('banners', id, fullBanner);

      set((state) => {
        const updated = [fullBanner, ...state.banners.filter((b) => b.id !== id)];
        try {
          localStorage.setItem('senna_sewa_banners_v2', JSON.stringify(updated));
        } catch (e) {}
        return { banners: updated };
      });

      // Save to Firestore & MySQL
      saveDocToFirestore('banners', fullBanner.id, fullBanner);
      await saveDocToMysql('banners', fullBanner.id, fullBanner);
      notifyBroadcastSync();

      get().showToast(`Banner "${fullBanner.title}" berhasil ditambahkan!`, 'success');
      return fullBanner;
    },

    updateBanner: async (id, updatedFields) => {
      let mergedBanner: SewaBanner | null = null;

      set((state) => {
        const updated = state.banners.map((b) => {
          if (b.id === id) {
            const merged = { ...b, ...updatedFields, updatedAt: new Date().toISOString() };
            mergedBanner = merged;
            return merged;
          }
          return b;
        });
        try {
          localStorage.setItem('senna_sewa_banners_v2', JSON.stringify(updated));
        } catch (e) {}
        return { banners: updated };
      });

      // Save to Firestore & MySQL
      if (mergedBanner) {
        trackPendingCreation('banners', id, mergedBanner);
        saveDocToFirestore('banners', id, mergedBanner);
        await saveDocToMysql('banners', id, mergedBanner);
        notifyBroadcastSync();
      }

      get().showToast('Banner berhasil diperbarui!', 'success');
    },

    deleteBanner: (id) => {
      markIdDeleted('senna_sewa_deleted_banner_ids_v2', id);
      clearPendingCreation(id);

      set((state) => {
        const updated = state.banners.filter((b) => b.id !== id);
        try {
          localStorage.setItem('senna_sewa_banners_v2', JSON.stringify(updated));
        } catch (e) {}
        return { banners: updated };
      });

      // Write tombstone to prevent resurrection
      saveDocToFirestore('deleted_records', `banners_${id}`, { id, collection: 'banners', deletedAt: new Date().toISOString() });
      // Delete from Firestore & MySQL
      deleteDocFromFirestore('banners', id);
      deleteDocFromMysql('banners', id);
      notifyBroadcastSync();

      get().showToast('Banner berhasil dihapus.', 'info');
    },

    resetDefaultBanners: () => {
      clearDeletedIds('senna_sewa_deleted_banner_ids_v2');
      try {
        localStorage.removeItem('senna_sewa_banners_v2');
      } catch (e) {}
      set({ banners: [] });
      get().showToast('Daftar banner promo berhasil dikosongkan.', 'info');
    },

    // 1C. PACKAGES CRUD
    packages: initialPackages,

    addPackage: async (newPkg) => {
      const id = newPkg.id || `pkg-custom-${Date.now()}`;
      const priceFormatted = newPkg.priceFormatted || `Rp ${newPkg.priceNumber.toLocaleString('id-ID')}`;
      const fullPkg: PackageItem = {
        ...newPkg,
        id,
        priceFormatted,
        features: newPkg.features || [],
        includes: newPkg.includes || [],
        bonus: newPkg.bonus || [],
        createdAt: newPkg.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      unmarkIdDeleted('senna_sewa_deleted_package_ids_v2', id);
      trackPendingCreation('packages', id, fullPkg);

      set((state) => {
        const updated = [fullPkg, ...state.packages.filter((p) => p.id !== id)];
        try {
          localStorage.setItem('senna_sewa_packages_v2', JSON.stringify(updated));
        } catch (e) {}
        return { packages: updated };
      });

      // Save to Firestore & MySQL
      saveDocToFirestore('packages', fullPkg.id, fullPkg);
      await saveDocToMysql('packages', fullPkg.id, fullPkg);
      notifyBroadcastSync();

      get().showToast(`Paket "${fullPkg.name}" berhasil ditambahkan!`, 'success');
      return fullPkg;
    },

    updatePackage: async (id, updatedFields) => {
      let mergedPkg: PackageItem | null = null;

      set((state) => {
        const updated = state.packages.map((p) => {
          if (p.id === id) {
            const merged = { ...p, ...updatedFields, updatedAt: new Date().toISOString() };
            if (updatedFields.priceNumber && !updatedFields.priceFormatted) {
              merged.priceFormatted = `Rp ${updatedFields.priceNumber.toLocaleString('id-ID')}`;
            }
            mergedPkg = merged;
            return merged;
          }
          return p;
        });
        try {
          localStorage.setItem('senna_sewa_packages_v2', JSON.stringify(updated));
        } catch (e) {}
        return { packages: updated };
      });

      // Save to Firestore & MySQL
      if (mergedPkg) {
        trackPendingCreation('packages', id, mergedPkg);
        saveDocToFirestore('packages', id, mergedPkg);
        await saveDocToMysql('packages', id, mergedPkg);
        notifyBroadcastSync();
      }

      get().showToast('Paket studio berhasil diperbarui!', 'success');
    },

    deletePackage: (id) => {
      markIdDeleted('senna_sewa_deleted_package_ids_v2', id);
      clearPendingCreation(id);

      set((state) => {
        const updated = state.packages.filter((p) => p.id !== id);
        try {
          localStorage.setItem('senna_sewa_packages_v2', JSON.stringify(updated));
        } catch (e) {}
        return { packages: updated };
      });

      // Write tombstone to prevent resurrection
      saveDocToFirestore('deleted_records', `packages_${id}`, { id, collection: 'packages', deletedAt: new Date().toISOString() });
      // Delete from Firestore & MySQL
      deleteDocFromFirestore('packages', id);
      deleteDocFromMysql('packages', id);
      notifyBroadcastSync();

      get().showToast('Paket berhasil dihapus.', 'info');
    },

    resetDefaultPackages: () => {
      clearDeletedIds('senna_sewa_deleted_package_ids_v2');
      try {
        localStorage.removeItem('senna_sewa_packages_v2');
      } catch (e) {}
      set({ packages: [] });
      get().showToast('Daftar paket studio berhasil dikosongkan.', 'info');
    },

    // 1D. GALLERY CRUD
    gallery: initialGallery,

    addGallery: async (newGal) => {
      const id = newGal.id || `gal-custom-${Date.now()}`;
      const fullGal: GalleryItem = {
        ...newGal,
        id,
        tags: newGal.tags || [],
        availableColors: newGal.availableColors || [],
        createdAt: newGal.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      unmarkIdDeleted('senna_sewa_deleted_gallery_ids_v2', id);
      trackPendingCreation('gallery', id, fullGal);

      set((state) => {
        const updated = [fullGal, ...state.gallery.filter((g) => g.id !== id)];
        try {
          localStorage.setItem('senna_sewa_gallery_v2', JSON.stringify(updated));
        } catch (e) {}
        return { gallery: updated };
      });

      // Save to Firestore & MySQL
      saveDocToFirestore('gallery', fullGal.id, fullGal);
      await saveDocToMysql('gallery', fullGal.id, fullGal);
      notifyBroadcastSync();

      get().showToast(`Konten galeri "${fullGal.title}" berhasil ditambahkan!`, 'success');
      return fullGal;
    },

    updateGallery: async (id, updatedFields) => {
      let mergedGal: GalleryItem | null = null;

      set((state) => {
        const updated = state.gallery.map((g) => {
          if (g.id === id) {
            const merged = { ...g, ...updatedFields, updatedAt: new Date().toISOString() };
            mergedGal = merged;
            return merged;
          }
          return g;
        });
        try {
          localStorage.setItem('senna_sewa_gallery_v2', JSON.stringify(updated));
        } catch (e) {}
        return { gallery: updated };
      });

      // Save to Firestore & MySQL
      if (mergedGal) {
        trackPendingCreation('gallery', id, mergedGal);
        saveDocToFirestore('gallery', id, mergedGal);
        await saveDocToMysql('gallery', id, mergedGal);
        notifyBroadcastSync();
      }

      get().showToast('Konten galeri berhasil diperbarui!', 'success');
    },

    deleteGallery: (id) => {
      markIdDeleted('senna_sewa_deleted_gallery_ids_v2', id);
      clearPendingCreation(id);

      set((state) => {
        const updated = state.gallery.filter((g) => g.id !== id);
        try {
          localStorage.setItem('senna_sewa_gallery_v2', JSON.stringify(updated));
        } catch (e) {}
        return { gallery: updated };
      });

      // Write tombstone to prevent resurrection
      saveDocToFirestore('deleted_records', `gallery_${id}`, { id, collection: 'gallery', deletedAt: new Date().toISOString() });
      // Delete from Firestore & MySQL
      deleteDocFromFirestore('gallery', id);
      deleteDocFromMysql('gallery', id);
      notifyBroadcastSync();

      get().showToast('Item galeri berhasil dihapus.', 'info');
    },

    resetDefaultGallery: () => {
      clearDeletedIds('senna_sewa_deleted_gallery_ids_v2');
      try {
        localStorage.removeItem('senna_sewa_gallery_v2');
      } catch (e) {}
      set({ gallery: [] });
      get().showToast('Daftar galeri studio berhasil dikosongkan.', 'info');
    },

    // 1D2. TESTIMONIALS & USER REVIEWS CRUD
    testimonials: initialTestimonials,

    addTestimonial: async (testiData) => {
      const id = testiData.id || `testi-${Date.now()}-${generateUniqueSuffix().toLowerCase()}`;
      const timestamp = new Date().toISOString();
      let imageUrl = testiData.image;
      if (imageUrl && imageUrl.startsWith('data:image/')) {
        imageUrl = await compressBase64IfNeeded(imageUrl);
      }

      const fullTestimonial: Testimonial = {
        ...testiData,
        id,
        image: imageUrl || '',
        rating: Math.min(5, Math.max(1, testiData.rating || 5)),
        category: testiData.category || 'all',
        date: testiData.date || new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(new Date()),
        location: testiData.location || 'Bandar Lampung',
        isVerified: testiData.isVerified !== undefined ? testiData.isVerified : true,
        likesCount: testiData.likesCount || 0,
        createdAt: testiData.createdAt || timestamp,
        updatedAt: timestamp,
      };

      unmarkIdDeleted('senna_sewa_deleted_testimonial_ids_v2', id);
      trackPendingCreation('testimonials', id, fullTestimonial);

      set((state) => {
        const updated = [fullTestimonial, ...state.testimonials.filter((t) => t.id !== id)];
        try {
          localStorage.setItem('senna_sewa_testimonials_v2', JSON.stringify(updated));
        } catch (e) {}
        return { testimonials: updated };
      });

      // Save to Firestore & MySQL Hostinger
      saveDocToFirestore('testimonials', fullTestimonial.id, fullTestimonial);
      await saveDocToMysql('testimonials', fullTestimonial.id, fullTestimonial);
      notifyBroadcastSync();

      get().showToast(`Terima kasih! Ulasan dari ${fullTestimonial.clientName} berhasil dikirim.`, 'success');
      return fullTestimonial;
    },

    updateTestimonial: async (id, updatedFields) => {
      let mergedTesti: Testimonial | null = null;
      const timestamp = new Date().toISOString();

      set((state) => {
        const updated = state.testimonials.map((t) => {
          if (t.id === id) {
            const merged = { ...t, ...updatedFields, updatedAt: timestamp };
            mergedTesti = merged;
            return merged;
          }
          return t;
        });
        try {
          localStorage.setItem('senna_sewa_testimonials_v2', JSON.stringify(updated));
        } catch (e) {}
        return { testimonials: updated };
      });

      if (mergedTesti) {
        trackPendingCreation('testimonials', id, mergedTesti);
        saveDocToFirestore('testimonials', id, mergedTesti);
        await saveDocToMysql('testimonials', id, mergedTesti);
        notifyBroadcastSync();
      }

      get().showToast('Testimoni berhasil diperbarui!', 'success');
    },

    deleteTestimonial: async (id) => {
      markIdDeleted('senna_sewa_deleted_testimonial_ids_v2', id);
      clearPendingCreation(id);

      set((state) => {
        const updated = state.testimonials.filter((t) => t.id !== id);
        try {
          localStorage.setItem('senna_sewa_testimonials_v2', JSON.stringify(updated));
        } catch (e) {}
        return { testimonials: updated };
      });

      // Tombstone & delete
      saveDocToFirestore('deleted_records', `testimonials_${id}`, { id, collection: 'testimonials', deletedAt: new Date().toISOString() });
      deleteDocFromFirestore('testimonials', id);
      deleteDocFromMysql('testimonials', id);
      notifyBroadcastSync();

      get().showToast('Ulasan testimoni berhasil dihapus.', 'info');
    },

    likeTestimonial: (id) => {
      let updatedItem: Testimonial | null = null;
      set((state) => {
        const updated = state.testimonials.map((t) => {
          if (t.id === id) {
            const next = { ...t, likesCount: (t.likesCount || 0) + 1 };
            updatedItem = next;
            return next;
          }
          return t;
        });
        try {
          localStorage.setItem('senna_sewa_testimonials_v2', JSON.stringify(updated));
        } catch (e) {}
        return { testimonials: updated };
      });

      if (updatedItem) {
        saveDocToFirestore('testimonials', id, updatedItem);
        saveDocToMysql('testimonials', id, updatedItem);
      }
    },

    resetDefaultTestimonials: () => {
      clearDeletedIds('senna_sewa_deleted_testimonial_ids_v2');
      try {
        localStorage.setItem('senna_sewa_testimonials_v2', JSON.stringify(TESTIMONIALS_DATA));
      } catch (e) {}
      set({ testimonials: TESTIMONIALS_DATA });
      get().showToast('Daftar testimoni dikembalikan ke default.', 'info');
    },

    // 1E. WEB SETTINGS (CMS GENERAL)
    webSettings: loadStoredWebSettings(),

    updateWebSettings: (updatedFields) => {
      let nextSettings: any = null;
      set((state) => {
        const updated = { ...state.webSettings, ...updatedFields };
        nextSettings = updated;
        try {
          localStorage.setItem('senna_sewa_web_settings_v2', JSON.stringify(updated));
        } catch (e) {}
        return { webSettings: updated };
      });

      if (nextSettings) {
        saveDocToFirestore('settings', 'global', nextSettings);
        saveDocToMysql('settings', 'global', nextSettings);
        notifyBroadcastSync();
      }
      get().showToast('Pengaturan tampilan web berhasil diperbarui!', 'success');
    },

    resetDefaultWebSettings: () => {
      try {
        localStorage.removeItem('senna_sewa_web_settings_v2');
      } catch (e) {}
      saveDocToMysql('settings', 'global', DEFAULT_WEB_SETTINGS);
      set({ webSettings: DEFAULT_WEB_SETTINGS });
      get().showToast('Pengaturan tampilan web berhasil dikembalikan ke default.', 'success');
    },

    // 2. CART & RENTAL PARAMS
    cart: [],
    rentalDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    rentalDurationDays: 3,
    renterDetails: {
      name: initialUser?.name || '',
      phone: initialUser?.phone || '',
      address: '',
      notes: '',
      deliveryMethod: 'pickup_studio',
    },
    isCartDrawerOpen: false,
    toast: null,

    // 3. USER AUTHENTICATION
    currentUser: initialUser,
    registeredUsers: initialRegisteredUsers,
    isAuthModalOpen: false,
    authRedirectAction: null,

    openAuthModal: (onSuccessCallback) => {
      set({ isAuthModalOpen: true, authRedirectAction: onSuccessCallback || null });
    },

    closeAuthModal: () => {
      set({ isAuthModalOpen: false, authRedirectAction: null });
    },

    loginWithGoogle: (name = 'Penyewa Google', email = 'sennagallery99@gmail.com') => {
      const user: SewaUser = {
        id: `usr-google-${Date.now()}`,
        name: name || 'Penyewa Google',
        email: email || 'sennagallery99@gmail.com',
        phone: '081234567890',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        authProvider: 'google',
        createdAt: new Date().toISOString(),
      };
      try {
        localStorage.setItem('senna_sewa_user_v2', JSON.stringify(user));
      } catch (e) {}

      saveDocToFirestore('registered_users', user.id, user);
      saveDocToMysql('registeredUsers', user.id, user);

      const callback = get().authRedirectAction;
      set((state) => ({
        currentUser: user,
        isAuthModalOpen: false,
        authRedirectAction: null,
        renterDetails: {
          ...state.renterDetails,
          name: state.renterDetails.name || user.name,
          phone: state.renterDetails.phone || user.phone || '',
        },
      }));

      get().showToast(`Selamat datang kembali, ${user.name}! Masuk via Google berhasil.`, 'success');
      if (callback) {
        setTimeout(callback, 200);
      }
    },

    loginWithPhone: (phone: string, name: string) => {
      const cleanPhone = phone.trim();
      const user: SewaUser = {
        id: `usr-phone-${Date.now()}`,
        name: name.trim() || 'Penyewa Senna',
        phone: cleanPhone,
        authProvider: 'phone',
        createdAt: new Date().toISOString(),
      };
      try {
        localStorage.setItem('senna_sewa_user_v2', JSON.stringify(user));
      } catch (e) {}

      saveDocToFirestore('registered_users', user.id, user);
      saveDocToMysql('registeredUsers', user.id, user);

      const callback = get().authRedirectAction;
      set((state) => ({
        currentUser: user,
        isAuthModalOpen: false,
        authRedirectAction: null,
        renterDetails: {
          ...state.renterDetails,
          name: user.name,
          phone: user.phone || '',
        },
      }));

      get().showToast(`Pendaftaran berhasil! Selamat datang, ${user.name}.`, 'success');
      if (callback) {
        setTimeout(callback, 200);
      }
    },

    registerSimpleUser: (name: string, phone: string) => {
      const cleanName = name.trim();
      const cleanPhone = phone.trim();
      const { username, loginCode } = generateSimpleAccountDetails(cleanName || 'Penyewa Senna');
      
      const user: SewaUser = {
        id: `usr-simple-${Date.now()}`,
        name: cleanName || 'Penyewa Senna',
        phone: cleanPhone,
        username,
        loginCode,
        authProvider: 'simple',
        createdAt: new Date().toISOString(),
      };

      set((state) => {
        const updatedUsers = [...state.registeredUsers, user];
        try {
          localStorage.setItem('senna_sewa_user_v2', JSON.stringify(user));
          localStorage.setItem('senna_sewa_registered_users_v2', JSON.stringify(updatedUsers));
        } catch (e) {}

        return {
          currentUser: user,
          registeredUsers: updatedUsers,
          isAuthModalOpen: false,
          authRedirectAction: null,
          renterDetails: {
            ...state.renterDetails,
            name: user.name,
            phone: user.phone || '',
          },
        };
      });

      saveDocToFirestore('registered_users', user.id, user);
      saveDocToMysql('registeredUsers', user.id, user);

      get().showToast(`Akun penyewa berhasil dibuat! Selamat datang, ${user.name}.`, 'success');
      
      const callback = get().authRedirectAction;
      if (callback) {
        setTimeout(callback, 200);
      }

      return user;
    },

    loginSimpleUser: (username: string, loginCode: string) => {
      const cleanUsername = username.trim().toLowerCase();
      const cleanCode = loginCode.trim().toUpperCase();

      const matched = get().registeredUsers.find(
        (u) => 
          u.username?.toLowerCase() === cleanUsername && 
          u.loginCode?.toUpperCase() === cleanCode
      );

      if (matched) {
        try {
          localStorage.setItem('senna_sewa_user_v2', JSON.stringify(matched));
        } catch (e) {}

        set((state) => ({
          currentUser: matched,
          isAuthModalOpen: false,
          authRedirectAction: null,
          renterDetails: {
            ...state.renterDetails,
            name: matched.name,
            phone: matched.phone || '',
          },
        }));

        get().showToast(`Selamat datang kembali, ${matched.name}!`, 'success');
        
        const callback = get().authRedirectAction;
        if (callback) {
          setTimeout(callback, 200);
        }

        return true;
      }

      return false;
    },

    logout: () => {
      try {
        localStorage.removeItem('senna_sewa_user_v2');
      } catch (e) {}
      set({ currentUser: null });
      get().showToast('Anda telah keluar dari akun sewa.', 'info');
    },

    // 4. ORDERS & PAYMENT FLOW
    orders: initialOrders,
    currentOrderId: null,

    createOrder: (paymentMethod = 'bca', promoCode = null) => {
      const { cart, rentalDate, rentalDurationDays, renterDetails } = get();
      let activeUser = get().currentUser;

      // If user is not logged in, automatically register them as a simple user!
      if (!activeUser) {
        const cleanName = renterDetails.name.trim() || 'Penyewa Busana';
        const cleanPhone = renterDetails.phone.trim() || '081234567890';
        activeUser = get().registerSimpleUser(cleanName, cleanPhone);
      }

      const subtotal = get().getSubtotal();
      const deposit = 0;
      const totalAmount = subtotal;

      const newOrder: SewaOrder = {
        id: `ORD-SNA-${Date.now().toString().slice(-6)}`,
        userId: activeUser.id,
        userName: activeUser.name,
        userPhone: activeUser.phone || renterDetails.phone || '081234567890',
        userEmail: activeUser.email,
        items: [...cart],
        rentalDate,
        rentalDurationDays,
        deliveryMethod: renterDetails.deliveryMethod || 'pickup_studio',
        renterAddress: renterDetails.address || (renterDetails.deliveryMethod === 'ojol_delivery' ? 'Kirim via Ojek Online (Ongkir ditanggung penyewa)' : 'Ambil ke Studio Gallery Senna Gallery'),
        renterNotes: renterDetails.notes || '',
        subtotal,
        deposit: 0,
        totalAmount,
        appliedPromo: null,
        paymentMethod,
        status: 'menunggu_pembayaran',
        agreedToTerms: true,
        createdAt: new Date().toISOString(),
      };

      set((state) => {
        const updated = [newOrder, ...state.orders];
        try {
          localStorage.setItem('senna_sewa_orders_v2', JSON.stringify(updated));
        } catch (e) {}
        return {
          orders: updated,
          currentOrderId: newOrder.id,
          cart: [], // Clear cart after order is initiated
        };
      });

      // Save to Firestore & MySQL
      saveDocToFirestore('orders', newOrder.id, newOrder);
      saveDocToMysql('orders', newOrder.id, newOrder);
      notifyBroadcastSync();

      return newOrder;
    },

    submitPaymentProof: (orderId, proofUrl) => {
      let mergedOrder: SewaOrder | null = null;
      set((state) => {
        const updated = state.orders.map((ord) => {
          if (ord.id === orderId) {
            const merged = {
              ...ord,
              paymentProofUrl: proofUrl || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=600&q=80',
              status: 'menunggu_konfirmasi' as OrderStatus,
            };
            mergedOrder = merged;
            return merged;
          }
          return ord;
        });
        try {
          localStorage.setItem('senna_sewa_orders_v2', JSON.stringify(updated));
        } catch (e) {}
        return { orders: updated };
      });

      // Save to Firestore & MySQL
      if (mergedOrder) {
        saveDocToFirestore('orders', orderId, mergedOrder);
        saveDocToMysql('orders', orderId, mergedOrder);
        notifyBroadcastSync();
      }

      get().showToast('Bukti pembayaran telah dikirim! Status kini: Menunggu Konfirmasi Admin.', 'success');
    },

    updateOrderStatus: async (orderId, newStatus, adminNotes) => {
      let mergedOrder: SewaOrder | null = null;
      set((state) => {
        const updated = state.orders.map((ord) => {
          if (ord.id === orderId) {
            const isConfirmedOrBeyond = (
              newStatus === 'dikonfirmasi' || 
              newStatus === 'disetujui' || 
              newStatus === 'diproses' || 
              newStatus === 'selesai'
            );
            const merged: SewaOrder = {
              ...ord,
              status: newStatus,
              adminNotes: adminNotes !== undefined ? adminNotes : ord.adminNotes,
              confirmedAt: isConfirmedOrBeyond ? (ord.confirmedAt || new Date().toISOString()) : ord.confirmedAt,
            };
            mergedOrder = merged;
            return merged;
          }
          return ord;
        });
        try {
          localStorage.setItem('senna_sewa_orders_v2', JSON.stringify(updated));
        } catch (e) {}
        return { orders: updated };
      });

      // Save to Firestore & MySQL for automatic multi-device synchronization
      if (mergedOrder) {
        saveDocToFirestore('orders', orderId, mergedOrder);
        saveDocToMysql('orders', orderId, mergedOrder);
        notifyBroadcastSync();
      }

      const statusLabels: Record<string, string> = {
        pending: 'Pending / Menunggu',
        menunggu_pembayaran: 'Menunggu Pembayaran',
        menunggu_konfirmasi: 'Menunggu Konfirmasi',
        dikonfirmasi: 'Dikonfirmasi (Lunas)',
        disetujui: 'Dikonfirmasi (Lunas)',
        diproses: 'Sedang Diproses (Fitting / Kirim)',
        selesai: 'Selesai',
        dibatalkan: 'Dibatalkan',
      };

      const label = statusLabels[newStatus] || newStatus;
      get().showToast(`Status pesanan #${orderId} diubah ke '${label}'. Sinkronisasi multi-device diperbarui otomatis!`, 'success');
    },

    approveOrder: (orderId, adminNotes) => {
      get().updateOrderStatus(orderId, 'dikonfirmasi', adminNotes || 'Pembayaran telah dicek & diverifikasi lunas oleh Admin Senna Gallery.');
    },

    rejectOrder: (orderId, adminNotes) => {
      get().updateOrderStatus(orderId, 'dibatalkan', adminNotes || 'Pesanan dibatalkan / bukti pembayaran tidak sesuai.');
    },

    deleteOrder: async (orderId) => {
      set((state) => {
        const filtered = state.orders.filter((o) => o.id !== orderId);
        try {
          localStorage.setItem('senna_sewa_orders_v2', JSON.stringify(filtered));
        } catch (e) {}
        return { orders: filtered };
      });

      deleteDocFromFirestore('orders', orderId);
      deleteDocFromMysql('orders', orderId);
      notifyBroadcastSync();
      get().showToast(`Pesanan #${orderId} berhasil dihapus dari sistem.`, 'info');
    },

    setCurrentOrderId: (orderId) => {
      set({ currentOrderId: orderId });
    },

    getOrderById: (orderId) => {
      return get().orders.find((o) => o.id === orderId);
    },

    getUserOrders: () => {
      const { orders, currentUser } = get();
      if (!currentUser) {
        return [];
      }
      return orders.filter((o) => o.userId === currentUser.id || o.userPhone === currentUser.phone);
    },

    // 5. ADMIN AUTH & DATABASE SYNC
    isAdminLoggedIn: initialAdminLogged,
    isCloudConnected: false,
    isMysqlConnected: false,
    mysqlStatusMessage: 'Menunggu koneksi MySQL Hostinger',

    checkMysqlStatus: async () => {
      const res = await testMysqlConnection();
      set({
        isMysqlConnected: res.success,
        mysqlStatusMessage: res.message
      });
      return res;
    },

    syncAllToMysql: async () => {
      try {
        const { products, banners, packages, gallery, testimonials, webSettings, orders, registeredUsers } = get();

        // Ensure no giant base64 payloads block the batch save
        const sanitizedProducts = await Promise.all(
          products.map(async (p) => {
            if (p.imageUrl && p.imageUrl.startsWith('data:image/')) {
              const compressed = await compressBase64IfNeeded(p.imageUrl);
              return { ...p, imageUrl: compressed };
            }
            return p;
          })
        );

        await saveBatchToMysql('products', sanitizedProducts);
        await saveBatchToMysql('banners', banners);
        await saveBatchToMysql('packages', packages);
        await saveBatchToMysql('gallery', gallery);
        await saveBatchToMysql('testimonials', testimonials);
        await saveDocToMysql('settings', 'global', webSettings);
        await saveBatchToMysql('orders', orders);
        if (registeredUsers && registeredUsers.length > 0) {
          await saveBatchToMysql('registeredUsers', registeredUsers);
        }

        set({ isMysqlConnected: true, mysqlStatusMessage: 'Semua data tersinkron ke MySQL Hostinger' });
        get().showToast(`Seluruh katalog (${sanitizedProducts.length} busana) & data berhasil disinkronkan ke MySQL Hostinger!`, 'success');
        return true;
      } catch (e) {
        get().showToast('Gagal menyinkronkan data ke MySQL Hostinger.', 'info');
        return false;
      }
    },

    refreshDataLive: async (force = true) => {
      if (activeSyncFromMysqlRef) {
        await activeSyncFromMysqlRef(force);
      }
    },

    checkMysqlVersionNow: async (force = true) => {
      if (activeSyncFromMysqlRef) {
        await activeSyncFromMysqlRef(force);
        return true;
      }
      return false;
    },

    loginAdmin: async () => {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('senna_admin_auth', 'true');
      }
      set({ isAdminLoggedIn: true });
      get().showToast('Selamat datang Admin Senna Gallery Official! Sinkronisasi multi-device aktif otomatis.', 'success');
      // Automatic Multi-Device sync immediately upon login
      try {
        if (activeSyncFromMysqlRef) {
          await activeSyncFromMysqlRef(true);
        }
        await get().checkMysqlStatus();
      } catch (e) {}
    },

    logoutAdmin: () => {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('senna_admin_auth');
      }
      set({ isAdminLoggedIn: false });
      get().showToast('Admin berhasil logout.', 'info');
    },

    // 6. CART OPERATIONS
    addToCart: (product, size, color, quantity = 1) => {
      const cartItemId = `${product.id}-${size}-${color}`;
      const maxStock = getProductStockForSize(product, size);

      if (maxStock <= 0) {
        get().showToast(`Busana "${product.name}" ukuran ${size} saat ini stoknya sedang habis.`, 'info');
        return;
      }

      let addedQty = 0;
      let hitMax = false;

      set((state) => {
        const existingItemIndex = state.cart.findIndex((item) => item.id === cartItemId);
        if (existingItemIndex > -1) {
          const currentQty = state.cart[existingItemIndex].quantity;
          if (currentQty >= maxStock) {
            hitMax = true;
            return { cart: state.cart };
          }
          const allowedAdd = Math.min(quantity, maxStock - currentQty);
          addedQty = allowedAdd;
          const updatedCart = [...state.cart];
          updatedCart[existingItemIndex].quantity = currentQty + allowedAdd;
          return { cart: updatedCart };
        } else {
          const allowedAdd = Math.min(quantity, maxStock);
          addedQty = allowedAdd;
          return {
            cart: [
              ...state.cart,
              {
                id: cartItemId,
                product,
                selectedSize: size,
                selectedColor: color,
                quantity: allowedAdd,
              },
            ],
          };
        }
      });

      if (hitMax) {
        get().showToast(`Maksimal sewa ukuran ${size} adalah ${maxStock} set (sesuai stok barang tersedia). Silakan pilih ukuran lain jika ingin menambah set.`, 'info');
      } else if (addedQty > 0) {
        get().showToast(`"${product.name}" (${size}, ${addedQty} set) dimasukkan ke keranjang sewa!`, 'success');
      }
    },

    removeFromCart: (cartItemId) => {
      set((state) => ({
        cart: state.cart.filter((item) => item.id !== cartItemId),
      }));
      get().showToast('Item berhasil dihapus dari keranjang.', 'info');
    },

    updateQuantity: (cartItemId, newQuantity) => {
      if (newQuantity <= 0) {
        get().removeFromCart(cartItemId);
        return;
      }

      const item = get().cart.find((it) => it.id === cartItemId);
      if (!item) return;

      const maxStock = getProductStockForSize(item.product, item.selectedSize);

      if (newQuantity > maxStock) {
        get().showToast(`Maksimal sewa ukuran ${item.selectedSize} hanya ${maxStock} set sesuai jumlah barang tersedia. Pilih ukuran berbeda jika butuh set lain.`, 'info');
        newQuantity = maxStock;
      }

      set((state) => ({
        cart: state.cart.map((it) =>
          it.id === cartItemId ? { ...it, quantity: newQuantity } : it
        ),
      }));
    },

    clearCart: () => {
      set({ cart: [] });
    },

    setRentalDate: (date) => {
      set({ rentalDate: date });
    },

    setRentalDurationDays: (days) => {
      set({ rentalDurationDays: days });
    },

    setRenterDetails: (details) => {
      set((state) => ({
        renterDetails: { ...state.renterDetails, ...details },
      }));
    },

    setIsCartDrawerOpen: (isOpen) => {
      set({ isCartDrawerOpen: isOpen });
    },

    showToast: (message, type = 'success') => {
      set({ toast: { message, type } });
      setTimeout(() => {
        set({ toast: null });
      }, 4000);
    },

    getTotalItemsCount: () => {
      return get().cart.reduce((total, item) => total + item.quantity, 0);
    },

    getSubtotal: () => {
      const { cart, rentalDurationDays } = get();
      const baseDays = 3;
      const additionalDays = Math.max(0, rentalDurationDays - baseDays);
      const dayMultiplier = 1 + additionalDays * 0.15;

      return cart.reduce((total, item) => {
        return total + Math.round(item.product.price * item.quantity * dayMultiplier);
      }, 0);
    },

    getSecurityDeposit: () => {
      return 0;
    },

    getTotalAmount: () => {
      return get().getSubtotal();
    },
  };
});
