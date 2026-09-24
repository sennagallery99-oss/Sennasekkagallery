import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App singleton
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Target Google Drive Folder ID requested by user
export const SENNA_DRIVE_FOLDER_ID = '1UnCYXPsMHnV2kGglT18XC8PyUvuBCFs1';
export const SENNA_DRIVE_FOLDER_URL = `https://drive.google.com/drive/folders/${SENNA_DRIVE_FOLDER_ID}?usp=sharing`;

// OAuth Google Provider with Google Drive file scope
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.setCustomParameters({
  prompt: 'select_account',
});

// In-memory token cache (never stored in localStorage)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

/**
 * Initialize Auth listener
 */
export const initDriveAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user && cachedAccessToken) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else if (!isSigningIn) {
      if (onAuthFailure) onAuthFailure();
    }
  });
};

/**
 * Sign in with Google to obtain Drive access token
 */
export const connectGoogleDrive = async (): Promise<{
  user: User;
  accessToken: string;
} | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Gagal mendapatkan token akses Google Drive.');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Drive sign-in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Disconnect / Sign out
 */
export const disconnectGoogleDrive = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

/**
 * Get current in-memory access token
 */
export const getDriveAccessToken = (): string | null => {
  return cachedAccessToken;
};

/**
 * Set token manually if restored in session
 */
export const setDriveAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

/**
 * Helper to extract Google Drive file ID from various link formats
 */
export const extractGoogleDriveFileId = (urlOrId: string): string => {
  if (!urlOrId || typeof urlOrId !== 'string') return '';
  const trimmed = urlOrId.trim();

  // If it's already a raw ID
  if (/^[a-zA-Z0-9_-]{20,40}$/.test(trimmed) && !trimmed.startsWith('http')) {
    return trimmed;
  }

  // lh3.googleusercontent.com/d/{id} or lh3.googleusercontent.com/d/{id}=w...
  const lh3Match = trimmed.match(/lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/);
  if (lh3Match && lh3Match[1]) {
    return lh3Match[1];
  }

  // /file/d/{id}
  const fileMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch && fileMatch[1]) {
    return fileMatch[1];
  }

  // ?id={id} or &id={id}
  const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idParamMatch && idParamMatch[1]) {
    return idParamMatch[1];
  }

  // /folders/{id}
  const folderMatch = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (folderMatch && folderMatch[1]) {
    return folderMatch[1];
  }

  return '';
};

/**
 * Normalizes any Google Drive link or ID into a direct, ultra-fast CDN thumbnail URL.
 * Automatically resizes & compresses the image to optimize page load from multi-megabytes down to <60KB.
 */
export const formatDriveImageUrl = (urlOrId: string, size = 600): string => {
  if (!urlOrId || typeof urlOrId !== 'string') return urlOrId;
  const trimmed = urlOrId.trim();

  // If local asset, base64 data URI, blob or non-Google direct image URL, return directly
  if (
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('/') ||
    (trimmed.startsWith('http') && !trimmed.includes('google') && !trimmed.includes('drive'))
  ) {
    return trimmed;
  }

  const fileId = extractGoogleDriveFileId(trimmed);

  if (fileId) {
    // Google Drive Thumbnail API serves compressed, ultra-fast WebP/JPEG cached globally by Google Edge CDN
    return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`;
  }

  return trimmed;
};

/**
 * Generates an array of fallback URLs for an image in case one CDN endpoint experiences network issues
 */
export const getDriveImageFallbacks = (urlOrId: string, size = 600): string[] => {
  if (!urlOrId || typeof urlOrId !== 'string') return [];
  const fileId = extractGoogleDriveFileId(urlOrId);
  if (!fileId) return [urlOrId];

  return [
    `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`,
    `https://lh3.googleusercontent.com/d/${fileId}=w${size}`,
    `https://lh3.googleusercontent.com/d/${fileId}`,
    `https://drive.google.com/uc?id=${fileId}&export=view`,
  ];
};

/**
 * Generates a responsive srcset string with multiple width descriptors.
 * Supports Google Drive CDN thumbnail endpoints and Unsplash image parameters.
 */
export const generateResponsiveSrcSet = (
  urlOrId: string,
  widths: number[] = [320, 480, 640, 800, 1024, 1280]
): string | undefined => {
  if (!urlOrId || typeof urlOrId !== 'string') return undefined;
  const trimmed = urlOrId.trim();

  // If base64 or blob, srcset is not applicable
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return undefined;
  }

  // Google Drive Image
  const fileId = extractGoogleDriveFileId(trimmed);
  if (fileId) {
    return widths
      .map((w) => `https://drive.google.com/thumbnail?id=${fileId}&sz=w${w} ${w}w`)
      .join(', ');
  }

  // Unsplash Image
  if (trimmed.includes('images.unsplash.com')) {
    const baseUrl = trimmed.split('?')[0];
    return widths
      .map((w) => `${baseUrl}?auto=format&fit=crop&w=${w}&q=80 ${w}w`)
      .join(', ');
  }

  return undefined;
};

export interface DriveUploadedFile {
  id: string;
  name: string;
  directUrl: string;
  webViewLink: string;
  webContentLink?: string;
  thumbnailLink?: string;
}

/**
 * Uploads an image file to the Senna Google Drive catalog folder
 */
export const uploadCatalogImageToDrive = async (
  file: File,
  folderId = SENNA_DRIVE_FOLDER_ID
): Promise<DriveUploadedFile> => {
  const token = getDriveAccessToken();
  if (!token) {
    throw new Error('Belum terhubung ke Google Drive. Silakan klik tombol "Hubungkan Google Drive" terlebih dahulu.');
  }

  // 1. Sanitize file name
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const safeName = `senna_${timestamp}_${file.name.replace(/\s+/g, '_')}`;

  // 2. Build multipart/related upload payload
  const metadata = {
    name: safeName,
    mimeType: file.type || 'image/jpeg',
    parents: [folderId],
    description: 'Foto Katalog Busana Senna Sewa Gallery',
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const reader = new FileReader();
  const fileDataPromise = new Promise<ArrayBuffer>((resolve, reject) => {
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });

  const fileData = await fileDataPromise;

  const metadataPart = `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(
    metadata
  )}`;
  const mediaHeader = `${delimiter}Content-Type: ${file.type || 'image/jpeg'}\r\n\r\n`;

  // Combine into a single Uint8Array blob
  const textEncoder = new TextEncoder();
  const metadataBytes = textEncoder.encode(metadataPart);
  const mediaHeaderBytes = textEncoder.encode(mediaHeader);
  const closeDelimiterBytes = textEncoder.encode(closeDelimiter);

  const totalLength =
    metadataBytes.length +
    mediaHeaderBytes.length +
    fileData.byteLength +
    closeDelimiterBytes.length;

  const combined = new Uint8Array(totalLength);
  let offset = 0;

  combined.set(metadataBytes, offset);
  offset += metadataBytes.length;

  combined.set(mediaHeaderBytes, offset);
  offset += mediaHeaderBytes.length;

  combined.set(new Uint8Array(fileData), offset);
  offset += fileData.byteLength;

  combined.set(closeDelimiterBytes, offset);

  // 3. Send upload request to Google Drive API v3
  const uploadRes = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink,thumbnailLink',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: combined,
    }
  );

  if (!uploadRes.ok) {
    const errorJson = await uploadRes.json().catch(() => ({}));
    const message =
      errorJson?.error?.message ||
      `Gagal mengunggah file ke Google Drive (Status ${uploadRes.status}).`;
    throw new Error(message);
  }

  const uploadedData = await uploadRes.json();
  const fileId = uploadedData.id;

  // 4. Set permission to public read so catalog images can be seen by customers
  try {
    await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role: 'reader',
        type: 'anyone',
      }),
    });
  } catch (permErr) {
    console.warn('Could not set public permission on Drive file:', permErr);
  }

  const directUrl = `https://lh3.googleusercontent.com/d/${fileId}`;

  return {
    id: fileId,
    name: uploadedData.name || safeName,
    directUrl,
    webViewLink: uploadedData.webViewLink || `https://drive.google.com/file/d/${fileId}/view`,
    webContentLink: uploadedData.webContentLink,
    thumbnailLink: uploadedData.thumbnailLink,
  };
};

export interface DriveParsedItem {
  id: string;
  name: string;
  cleanTitle: string;
  mimeType: string;
  directUrl: string;
  driveUrl: string;
  folderName: string;
  selected?: boolean;
}

export interface DriveParsedFolder {
  id: string;
  name: string;
  count: number;
}

export interface DriveFolderParseResult {
  folderId: string;
  totalImages: number;
  folders: DriveParsedFolder[];
  images: DriveParsedItem[];
}

/**
 * Extracts a Google Drive folder ID from a URL or raw ID string
 */
export const extractDriveFolderId = (urlOrId: string): string | null => {
  if (!urlOrId || typeof urlOrId !== 'string') return null;
  const trimmed = urlOrId.trim();
  const fMatch = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
  if (fMatch && fMatch[1]) return fMatch[1];
  const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch && idMatch[1]) return idMatch[1];
  if (/^[a-zA-Z0-9_-]{20,}$/.test(trimmed) && !trimmed.startsWith('http')) return trimmed;
  return null;
};

/**
 * Clean up raw filenames (or UUID/iPhone camera strings) into human-readable catalog titles
 */
export const cleanFileNameToTitle = (
  rawName: string,
  index: number,
  folderName?: string,
  defaultPrefix = 'Busana Senna'
): string => {
  if (!rawName) return `${defaultPrefix} #${index + 1}`;
  
  // Remove file extension
  let base = rawName.replace(/\.(jpg|jpeg|png|webp|heic|heif|bmp|gif)$/i, '').trim();

  // If name is UUID or long hash like 5F4EFB0B-19B1-46D4-B187-6CC5CC82C19D-28698-00000367299A3D34
  const isHashOrUuid = /^[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}/.test(base) || base.length > 28;
  const isCameraRaw = /^(IMG|DSC|PHOTO|IMAGE|PXP|VID)[-_0-9]+/i.test(base);

  if (isHashOrUuid) {
    if (folderName && folderName !== 'Utama (Root)' && folderName !== 'Root') {
      return `${folderName} #${index + 1}`;
    }
    return `${defaultPrefix} Eksklusif #${index + 1}`;
  }

  if (isCameraRaw) {
    const numMatch = base.match(/\d+/);
    const num = numMatch ? numMatch[0] : `${index + 1}`;
    if (folderName && folderName !== 'Utama (Root)' && folderName !== 'Root') {
      return `${folderName} #${num}`;
    }
    return `${defaultPrefix} #${num}`;
  }

  // Clean dashes, underscores
  base = base.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
  // Capitalize words
  return base
    .split(' ')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Parses all images and subfolders from a public Google Drive folder URL
 */
export const parseDriveFolder = async (folderUrlOrId: string): Promise<DriveFolderParseResult> => {
  const folderId = extractDriveFolderId(folderUrlOrId) || folderUrlOrId.trim();
  if (!folderId) {
    throw new Error('Link folder Google Drive tidak valid.');
  }

  // 1. Try via API endpoint
  try {
    const apiBase = typeof window !== 'undefined' && window.location.hostname.includes('sennagallery.com')
      ? '/api.php'
      : (localStorage.getItem('senna_mysql_api_url')?.trim() || '/api.php');

    const res = await fetch(`${apiBase}?action=parse_drive_folder&folder_url=${encodeURIComponent(folderUrlOrId)}`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (res.ok) {
      const json = await res.json();
      if (json.status === 'success' && Array.isArray(json.images)) {
        const enrichedImages: DriveParsedItem[] = json.images.map((img: any, idx: number) => ({
          id: img.id,
          name: img.name,
          cleanTitle: cleanFileNameToTitle(img.name, idx, img.folderName),
          mimeType: img.mimeType || 'image/jpeg',
          directUrl: img.directUrl || `https://lh3.googleusercontent.com/d/${img.id}`,
          driveUrl: img.driveUrl || `https://drive.google.com/file/d/${img.id}/view`,
          folderName: img.folderName || 'Utama (Root)',
          selected: true,
        }));

        return {
          folderId: json.folderId || folderId,
          totalImages: enrichedImages.length,
          folders: json.folders || [{ id: folderId, name: 'Utama (Root)', count: enrichedImages.length }],
          images: enrichedImages,
        };
      }
    }
  } catch (err) {
    console.warn('API parse_drive_folder failed, trying direct public fallback:', err);
  }

  // 2. Direct client-side public parse fallback if API isn't available
  const directUrl = `https://drive.google.com/drive/folders/${folderId}`;
  const response = await fetch(directUrl).catch(() => null);
  if (!response || !response.ok) {
    throw new Error('Tidak dapat membuka folder Google Drive. Pastikan folder disetel "Siapa saja yang memiliki link dapat melihat" (Public).');
  }

  const html = await response.text();
  const images: DriveParsedItem[] = [];
  const folders: DriveParsedFolder[] = [{ id: folderId, name: 'Utama (Root)', count: 0 }];

  const regex = /AF_initDataCallback\((.*?)\);/gs;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const block = match[1];
    if (block.includes('ds:4')) {
      const dataMatch = block.match(/data:\s*(\[.*?\])\s*,\s*sideChannel/s);
      if (dataMatch) {
        try {
          const parsed = eval(dataMatch[1]);
          const items = parsed[27]?.[7]?.[0]?.[0];
          if (Array.isArray(items)) {
            for (let i = 0; i < items.length; i++) {
              const it = items[i];
              const fileId = it[0]?.[1];
              const mimeType = it[4] || '';
              const str = JSON.stringify(it);
              const nameMatch = str.match(/\[\"([^\"]+\.(?:jpg|jpeg|png|webp|JPG|JPEG|PNG|heic|HEIC))\"/i) || str.match(/\[16,null,\[null,\[\[\[\"([^\"]+)\"/);
              const rawName = nameMatch ? nameMatch[1] : (fileId ? `Foto_${fileId}` : `Item_${i + 1}`);

              if (mimeType.includes('folder') || str.includes('application/vnd.google-apps.folder')) {
                folders.push({ id: fileId, name: rawName, count: 0 });
              } else if (fileId) {
                images.push({
                  id: fileId,
                  name: rawName,
                  cleanTitle: cleanFileNameToTitle(rawName, images.length, 'Utama (Root)'),
                  mimeType: mimeType || 'image/jpeg',
                  directUrl: `https://lh3.googleusercontent.com/d/${fileId}`,
                  driveUrl: `https://drive.google.com/file/d/${fileId}/view`,
                  folderName: 'Utama (Root)',
                  selected: true,
                });
              }
            }
          }
        } catch (e) {}
      }
    }
  }

  folders[0].count = images.length;

  return {
    folderId,
    totalImages: images.length,
    folders,
    images,
  };
};

/**
 * Parses multiple direct Drive links or IDs pasted by admin in a textarea (one per line)
 */
export const parseDirectDriveLinks = (text: string): DriveParsedItem[] => {
  if (!text) return [];
  const lines = text.split(/[\n,;]+/).map((l) => l.trim()).filter(Boolean);
  const items: DriveParsedItem[] = [];

  lines.forEach((line, idx) => {
    let fileId = '';
    const fileMatch = line.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileMatch && fileMatch[1]) {
      fileId = fileMatch[1];
    } else {
      const idParamMatch = line.match(/[?&]id=([a-zA-Z0-9_-]+)/);
      if (idParamMatch && idParamMatch[1]) {
        fileId = idParamMatch[1];
      } else if (/^[a-zA-Z0-9_-]{25,}$/.test(line) && !line.startsWith('http')) {
        fileId = line;
      }
    }

    if (fileId) {
      items.push({
        id: fileId,
        name: `Foto Google Drive #${idx + 1}`,
        cleanTitle: `Busana Senna #${idx + 1}`,
        mimeType: 'image/jpeg',
        directUrl: `https://lh3.googleusercontent.com/d/${fileId}`,
        driveUrl: `https://drive.google.com/file/d/${fileId}/view`,
        folderName: 'Manual Link',
        selected: true,
      });
    }
  });

  return items;
};

/**
 * List files already in the target Google Drive catalog folder
 */
export const listDriveFolderFiles = async (
  folderId = SENNA_DRIVE_FOLDER_ID
): Promise<DriveUploadedFile[]> => {
  const token = getDriveAccessToken();
  if (!token) {
    throw new Error('Belum terhubung ke Google Drive.');
  }

  const q = encodeURIComponent(`'${folderId}' in parents and trashed = false`);
  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,mimeType,thumbnailLink,webContentLink,webViewLink)&pageSize=40&orderBy=createdTime desc`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!res.ok) {
    const errorJson = await res.json().catch(() => ({}));
    throw new Error(
      errorJson?.error?.message || `Gagal mengambil daftar file Drive (Status ${res.status}).`
    );
  }

  const data = await res.json();
  const files: any[] = data.files || [];

  return files.map((f) => ({
    id: f.id,
    name: f.name,
    directUrl: `https://lh3.googleusercontent.com/d/${f.id}`,
    webViewLink: f.webViewLink || `https://drive.google.com/file/d/${f.id}/view`,
    webContentLink: f.webContentLink,
    thumbnailLink: f.thumbnailLink,
  }));
};

