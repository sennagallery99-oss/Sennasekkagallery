/**
 * Auto-Clear Cache & Instant Live Updater Service for Senna Gallery
 * Automatically purges stale browser caches, unregisters old service workers,
 * clears legacy cache storage, and triggers immediate live data synchronization
 * when a user or visitor opens or returns to the website on any device.
 */

const APP_CACHE_VERSION = 'senna_v4_live_' + new Date().toISOString().slice(0, 10);
const LAST_CACHE_PURGE_KEY = 'senna_last_cache_purge_version';

/**
 * Perform deep browser cache cleanup:
 * 1. Unregister any obsolete Service Workers
 * 2. Clear window.caches (CacheStorage API)
 * 3. Clear obsolete localStorage keys while preserving active user cart & admin credentials
 */
export const autoClearBrowserCache = async (): Promise<boolean> => {
  if (typeof window === 'undefined') return false;

  let clearedAnything = false;

  try {
    // 1. Unregister old Service Workers if present
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
          clearedAnything = true;
        }
      } catch (swErr) {}
    }

    // 2. Clear CacheStorage (HTTP response caches)
    if ('caches' in window) {
      try {
        const cacheNames = await caches.keys();
        for (const cacheName of cacheNames) {
          await caches.delete(cacheName);
          clearedAnything = true;
        }
      } catch (cacheErr) {}
    }

    // 3. Clear legacy & stale localStorage keys (Preserve: cart & admin credentials)
    const preservedKeys = new Set([
      'senna_sewa_cart_v2',
      'senna_sewa_user_v2',
      'senna_admin_token',
      'senna_admin_auth',
      'senna_sewa_rental_date_v2',
      'senna_sewa_rental_duration_v2',
      'senna_sewa_renter_details_v2',
      'senna_mysql_api_url',
    ]);

    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !preservedKeys.has(key)) {
        // Clear old v1, v2 temp, or obsolete cached entries
        if (
          key.startsWith('senna_v1_') ||
          key.startsWith('senna_cache_') ||
          key.includes('_temp_') ||
          key.includes('workbox') ||
          key.includes('vite') ||
          key === 'senna_sewa_custom_products_v2' // Remove redundant custom products registry to avoid resurrecting deleted items
        ) {
          keysToRemove.push(key);
        }
      }
    }

    keysToRemove.forEach((k) => localStorage.removeItem(k));

    // Record purge version
    localStorage.setItem(LAST_CACHE_PURGE_KEY, APP_CACHE_VERSION);
    sessionStorage.setItem('senna_session_cache_purged', 'true');

    return clearedAnything;
  } catch (err) {
    return false;
  }
};

/**
 * Initialize auto-clear and auto-update listeners:
 * - Runs instantly on initial page load
 * - Runs when tab becomes visible or user returns (pageshow / visibilitychange / window focus)
 */
export const initAutoCacheUpdater = (onFreshUpdateTriggered?: () => void) => {
  if (typeof window === 'undefined') return;

  // Run initial cache purge
  autoClearBrowserCache().then(() => {
    if (onFreshUpdateTriggered) {
      onFreshUpdateTriggered();
    }
  });

  // Re-verify and trigger live refresh when user returns to tab
  if (typeof document !== 'undefined') {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        if (onFreshUpdateTriggered) {
          onFreshUpdateTriggered();
        }
      }
    });
  }

  if (typeof window !== 'undefined') {
    window.addEventListener('focus', () => {
      if (onFreshUpdateTriggered) {
        onFreshUpdateTriggered();
      }
    });

    // Handle mobile browser back-forward cache (bfcache) navigation
    window.addEventListener('pageshow', (event) => {
      autoClearBrowserCache().then(() => {
        if (onFreshUpdateTriggered) {
          onFreshUpdateTriggered();
        }
      });
    });
  }
};
