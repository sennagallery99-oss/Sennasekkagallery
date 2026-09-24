import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  collection, 
  onSnapshot, 
  deleteDoc, 
  writeBatch,
  getDocs,
  getDocFromServer,
  Unsubscribe 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');

let quotaExceededState = (() => {
  try {
    return sessionStorage.getItem('senna_firestore_quota_exhausted') === 'true';
  } catch (_) {
    return false;
  }
})();

export const isFirestoreQuotaExceeded = (): boolean => quotaExceededState;

export const setFirestoreQuotaExceeded = (exhausted: boolean = true) => {
  quotaExceededState = exhausted;
  try {
    if (exhausted) {
      sessionStorage.setItem('senna_firestore_quota_exhausted', 'true');
    } else {
      sessionStorage.removeItem('senna_firestore_quota_exhausted');
    }
  } catch (_) {}
};

/**
 * Tests connection to Firestore server
 */
export const testFirestoreConnection = async (): Promise<boolean> => {
  if (quotaExceededState) return false;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error: any) {
    if (isQuotaError(error)) {
      setFirestoreQuotaExceeded(true);
      console.warn('[Firebase] Kuota gratis harian Firestore tercapai. Menggunakan MySQL Hostinger sebagai basis data utama.');
      return false;
    }
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('[Firebase] Client is offline or Firestore initializing.');
      return false;
    }
    return true;
  }
};

/**
 * Checks if an error is due to Firebase free-tier quota limits (e.g., daily read/write limit)
 */
const isQuotaError = (error: any): boolean => {
  if (!error) return false;
  const msg = (error.message || error.toString() || '').toLowerCase();
  const code = (error.code || '').toLowerCase();
  return (
    code.includes('resource-exhausted') ||
    code.includes('unavailable') ||
    msg.includes('quota limit exceeded') ||
    msg.includes('quota exceeded') ||
    msg.includes('resource-exhausted') ||
    msg.includes('resource exhausted') ||
    msg.includes('free daily read units') ||
    msg.includes('free daily write units') ||
    msg.includes('free tier database')
  );
};

/**
 * Sets up a real-time subscription to a Firestore collection with quota protection
 */
export const syncCollectionFromFirestore = <T extends { id: string }>(
  collectionName: string,
  onUpdate: (data: T[]) => void
): Unsubscribe | (() => void) => {
  if (quotaExceededState) {
    return () => {};
  }

  const colRef = collection(db, collectionName);
  let unsub: Unsubscribe | null = null;

  try {
    unsub = onSnapshot(
      colRef,
      (snapshot) => {
        quotaExceededState = false;
        const items: T[] = [];
        snapshot.forEach((doc) => {
          items.push({ id: doc.id, ...doc.data() } as unknown as T);
        });
        onUpdate(items);
      },
      (error) => {
        if (isQuotaError(error)) {
          setFirestoreQuotaExceeded(true);
          console.warn(
            `[Firebase] Kuota gratis harian tercapai untuk '${collectionName}'. Sistem beralih ke penyimpanan lokal & MySQL Hostinger.`
          );
          if (unsub) {
            try {
              unsub();
            } catch (_) {}
          }
          return;
        }
        console.warn(`[Firebase] Info sinkronisasi '${collectionName}':`, error?.message || error);
      }
    );
  } catch (err: any) {
    if (isQuotaError(err)) {
      setFirestoreQuotaExceeded(true);
    }
  }

  return () => {
    if (unsub) {
      try {
        unsub();
      } catch (_) {}
    }
  };
};

/**
 * Sets up a real-time subscription to a single Firestore document with quota protection
 */
export const syncDocumentFromFirestore = <T>(
  collectionName: string,
  docId: string,
  onUpdate: (data: T | null) => void
): Unsubscribe | (() => void) => {
  if (quotaExceededState) {
    return () => {};
  }

  const docRef = doc(db, collectionName, docId);
  let unsub: Unsubscribe | null = null;

  try {
    unsub = onSnapshot(
      docRef,
      (docSnap) => {
        quotaExceededState = false;
        if (docSnap.exists()) {
          onUpdate(docSnap.data() as T);
        } else {
          onUpdate(null);
        }
      },
      (error) => {
        if (isQuotaError(error)) {
          setFirestoreQuotaExceeded(true);
          console.warn(
            `[Firebase] Kuota gratis harian tercapai untuk '${collectionName}/${docId}'. Sistem beralih ke penyimpanan lokal & MySQL Hostinger.`
          );
          if (unsub) {
            try {
              unsub();
            } catch (_) {}
          }
          return;
        }
        console.warn(`[Firebase] Info sinkronisasi '${collectionName}/${docId}':`, error?.message || error);
      }
    );
  } catch (err: any) {
    if (isQuotaError(err)) {
      setFirestoreQuotaExceeded(true);
    }
  }

  return () => {
    if (unsub) {
      try {
        unsub();
      } catch (_) {}
    }
  };
};

/**
 * Recursively removes any undefined values from an object to prevent Firebase validation errors
 */
const cleanUndefined = (obj: any): any => {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(cleanUndefined);
  }

  const cleaned: any = {};
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (value !== undefined) {
      cleaned[key] = cleanUndefined(value);
    }
  }
  return cleaned;
};

/**
 * Saves or updates a document in Firestore
 */
export const saveDocToFirestore = async (
  collectionName: string,
  docId: string,
  data: any
) => {
  if (quotaExceededState) {
    // Gracefully skip Firestore write when quota is reached; MySQL & Local Storage handle persistence
    return;
  }
  try {
    const cleanedData = cleanUndefined(data);
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, cleanedData, { merge: true });
  } catch (error: any) {
    if (isQuotaError(error)) {
      setFirestoreQuotaExceeded(true);
      console.warn(
        `[Firebase] Kuota gratis tercapai saat menyimpan '${collectionName}/${docId}'. Data tetap aman di penyimpanan lokal & MySQL Hostinger.`
      );
      return;
    }
    console.warn(`[Firebase] Gagal menyimpan '${collectionName}/${docId}':`, error?.message || error);
  }
};

/**
 * Deletes a document from Firestore
 */
export const deleteDocFromFirestore = async (
  collectionName: string,
  docId: string
) => {
  if (quotaExceededState) {
    return;
  }
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error: any) {
    if (isQuotaError(error)) {
      setFirestoreQuotaExceeded(true);
      return;
    }
    console.warn(`[Firebase] Gagal menghapus '${collectionName}/${docId}':`, error?.message || error);
  }
};

/**
 * Batch saves or updates multiple documents in Firestore in chunks of up to 400
 */
export const saveBatchToFirestore = async <T extends { id: string }>(
  collectionName: string,
  items: T[]
): Promise<boolean> => {
  if (quotaExceededState || !items || items.length === 0) {
    return false;
  }
  try {
    const CHUNK_SIZE = 400;
    for (let i = 0; i < items.length; i += CHUNK_SIZE) {
      const chunk = items.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(db);
      for (const item of chunk) {
        if (!item || !item.id) continue;
        const cleanedData = cleanUndefined(item);
        const docRef = doc(db, collectionName, item.id);
        batch.set(docRef, cleanedData, { merge: true });
      }
      await batch.commit();
    }
    return true;
  } catch (error: any) {
    if (isQuotaError(error)) {
      setFirestoreQuotaExceeded(true);
      console.warn(`[Firebase] Kuota gratis tercapai saat batch save '${collectionName}'.`);
      return false;
    }
    console.warn(`[Firebase] Gagal batch save '${collectionName}':`, error?.message || error);
    return false;
  }
};

/**
 * One-time fetch of all items from a Firestore collection
 */
export const getCollectionFromFirestore = async <T extends { id: string }>(
  collectionName: string
): Promise<T[]> => {
  if (quotaExceededState) return [];
  try {
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);
    const items: T[] = [];
    snapshot.forEach((d) => {
      items.push({ id: d.id, ...d.data() } as unknown as T);
    });
    return items;
  } catch (error: any) {
    if (isQuotaError(error)) {
      setFirestoreQuotaExceeded(true);
    }
    return [];
  }
};


