/**
 * Service to communicate with MySQL Hostinger backend via api.php
 * Optimized with fast timeouts to ensure ultra-fast app load time.
 */

export const getApiUrl = (): string => {
  if (typeof window === 'undefined') return '/api.php';
  const custom = localStorage.getItem('senna_mysql_api_url');
  if (custom && custom.trim().length > 0) {
    return custom.trim();
  }
  // Default to relative path /api.php which seamlessly routes in production (sennagallery.com)
  // and in all preview/multi-device environments.
  return '/api.php';
};

export const setCustomApiUrl = (url: string) => {
  if (typeof window !== 'undefined') {
    if (url.trim()) {
      localStorage.setItem('senna_mysql_api_url', url.trim());
    } else {
      localStorage.removeItem('senna_mysql_api_url');
    }
  }
};

export interface MysqlTestResult {
  success: boolean;
  message: string;
  database?: string;
  debugError?: string;
  latencyMs?: number;
  productCount?: number;
  bannerCount?: number;
  packageCount?: number;
  galleryCount?: number;
  orderCount?: number;
  allSyncOk?: boolean;
  versionHash?: string;
  latestTimestamp?: string;
}

export interface DatabaseVersionInfo {
  status: string;
  version: string;
  latest_timestamp: string;
  server_time: string;
  tables: Record<string, { updated_at: string; count: number }>;
}

/**
 * Standard headers with aggressive anti-cache instructions
 */
const ANTI_CACHE_HEADERS: Record<string, string> = {
  'Accept': 'application/json',
  'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0',
};

/**
 * Helper to fetch with an abort timeout so slow backend never blocks the page.
 */
const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeoutMs = 6000): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...ANTI_CACHE_HEADERS,
        ...(options.headers || {}),
      },
      signal: controller.signal,
    });
    return res;
  } finally {
    clearTimeout(timeoutId);
  }
};

/**
 * Lightweight version & timestamp check from MySQL Hostinger (<300 bytes, <10ms execution).
 * Essential for Smart Version Timestamp Polling without eating quotas or bandwidth.
 */
export const fetchDatabaseVersionFromMysql = async (): Promise<DatabaseVersionInfo | null> => {
  try {
    const url = `${getApiUrl()}?action=get_version&_t=${Date.now()}`;
    const res = await fetchWithTimeout(url, {
      method: 'GET',
    }, 4500);

    if (!res.ok) return null;
    const json = await res.json();
    if (json && json.status === 'success' && json.version) {
      return json as DatabaseVersionInfo;
    }
    return null;
  } catch (err) {
    return null;
  }
};

/**
 * Tests connection to MySQL Hostinger API with full latency diagnostics
 */
export const testMysqlConnection = async (): Promise<MysqlTestResult> => {
  const startTime = Date.now();
  try {
    const url = `${getApiUrl()}?action=test&_t=${Date.now()}`;
    const res = await fetchWithTimeout(url, {
      method: 'GET',
    }, 4000);

    const latencyMs = Date.now() - startTime;

    if (!res.ok) {
      return {
        success: false,
        latencyMs,
        message: `HTTP Error ${res.status}: ${res.statusText}. Pastikan file api.php versi terbaru sudah di-upload ke public_html Hostinger.`,
      };
    }

    const data = await res.json();
    if (data.status === 'success') {
      // Also try fetching version info for diagnostics
      let versionInfo: DatabaseVersionInfo | null = null;
      try {
        versionInfo = await fetchDatabaseVersionFromMysql();
      } catch (e) {}

      return {
        success: true,
        latencyMs,
        message: data.message || 'Koneksi MySQL Hostinger Aktif & Tersambung!',
        database: data.database,
        productCount: versionInfo?.tables?.products?.count,
        bannerCount: versionInfo?.tables?.banners?.count,
        packageCount: versionInfo?.tables?.packages?.count,
        galleryCount: versionInfo?.tables?.gallery?.count,
        orderCount: versionInfo?.tables?.orders?.count,
        versionHash: versionInfo?.version,
        latestTimestamp: versionInfo?.latest_timestamp,
      };
    } else {
      return {
        success: false,
        latencyMs,
        message: data.message || 'Gagal tersambung ke database MySQL.',
        debugError: data.debug_error,
      };
    }
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    return {
      success: false,
      latencyMs,
      message: `Tidak dapat mengakses api.php (${err.message || 'Network / Timeout error'}). Pastikan file api.php sudah di-upload ke public_html Hostinger.`,
    };
  }
};

/**
 * Fetch a single collection from MySQL Hostinger
 */
export const fetchCollectionFromMysql = async (collection: string): Promise<any[] | null> => {
  try {
    const url = `${getApiUrl()}?action=get&collection=${encodeURIComponent(collection)}&_t=${Date.now()}`;
    const res = await fetchWithTimeout(url, {
      method: 'GET',
    }, 7000);

    if (!res.ok) return null;
    const json = await res.json();
    if (json.status === 'success' && Array.isArray(json.data)) {
      return json.data;
    }
    return null;
  } catch (err) {
    return null;
  }
};

let inFlightFetchAll: Promise<any | null> | null = null;

/**
 * Fetch all collections at once from MySQL Hostinger with deduplication & resilient fallback
 */
export const fetchAllFromMysql = async (): Promise<any | null> => {
  if (inFlightFetchAll) {
    return inFlightFetchAll;
  }

  inFlightFetchAll = (async () => {
    try {
      const url = `${getApiUrl()}?action=get_all&_t=${Date.now()}`;
      const res = await fetchWithTimeout(url, {
        method: 'GET',
      }, 7000);

      if (res.ok) {
        const json = await res.json();
        if (json.status === 'success' && json.data) {
          return json.data;
        }
      }
    } catch (err) {
      // Continue to individual collection fetch fallback
    }

    // Resilient fallback: fetch collections individually in parallel
    try {
      const [products, banners, packages, gallery, orders, registeredUsers] = await Promise.all([
        fetchCollectionFromMysql('products'),
        fetchCollectionFromMysql('banners'),
        fetchCollectionFromMysql('packages'),
        fetchCollectionFromMysql('gallery'),
        fetchCollectionFromMysql('orders'),
        fetchCollectionFromMysql('registeredUsers'),
      ]);

      if (products !== null || banners !== null || packages !== null || gallery !== null) {
        return {
          products: products || [],
          banners: banners || [],
          packages: packages || [],
          gallery: gallery || [],
          orders: orders || [],
          registeredUsers: registeredUsers || [],
        };
      }
    } catch (e) {}

    return null;
  })();

  try {
    return await inFlightFetchAll;
  } finally {
    inFlightFetchAll = null;
  }
};

/**
 * Save or update a single document to MySQL Hostinger
 */
export const saveDocToMysql = async (
  collection: string,
  id: string,
  data: any
): Promise<boolean> => {
  try {
    const url = `${getApiUrl()}?action=save&_t=${Date.now()}`;
    const res = await fetchWithTimeout(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collection, id, data }),
    }, 15000);
    if (!res.ok) return false;
    const json = await res.json();
    return json.status === 'success';
  } catch (err) {
    return false;
  }
};

/**
 * Batch save multiple items to MySQL Hostinger
 */
export const saveBatchToMysql = async (
  collection: string,
  items: any[]
): Promise<boolean> => {
  try {
    const url = `${getApiUrl()}?action=save_batch&_t=${Date.now()}`;
    const res = await fetchWithTimeout(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collection, items }),
    }, 20000);
    if (!res.ok) return false;
    const json = await res.json();
    return json.status === 'success';
  } catch (err) {
    return false;
  }
};

/**
 * Delete a document from MySQL Hostinger
 */
export const deleteDocFromMysql = async (
  collection: string,
  id: string
): Promise<boolean> => {
  try {
    const url = `${getApiUrl()}?action=delete&_t=${Date.now()}`;
    const res = await fetchWithTimeout(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collection, id }),
    }, 8000);
    if (!res.ok) return false;
    const json = await res.json();
    return json.status === 'success';
  } catch (err) {
    return false;
  }
};

/**
 * Clear all catalogs in MySQL Hostinger (products, banners, packages, gallery)
 */
export const clearAllCatalogsInMysql = async (): Promise<boolean> => {
  try {
    const url = `${getApiUrl()}?action=clear_all_catalogs&_t=${Date.now()}`;
    const res = await fetchWithTimeout(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    }, 10000);
    if (!res.ok) return false;
    const json = await res.json();
    return json.status === 'success';
  } catch (err) {
    return false;
  }
};

/**
 * Clear a specific collection in MySQL Hostinger
 */
export const clearCollectionInMysql = async (collection: string): Promise<boolean> => {
  try {
    const url = `${getApiUrl()}?action=clear_collection&_t=${Date.now()}`;
    const res = await fetchWithTimeout(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collection }),
    }, 3000);
    if (!res.ok) return false;
    const json = await res.json();
    return json.status === 'success';
  } catch (err) {
    return false;
  }
};

