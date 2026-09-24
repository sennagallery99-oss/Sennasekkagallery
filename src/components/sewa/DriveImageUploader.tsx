import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  CheckCircle2,
  FolderOpen,
  ExternalLink,
  Loader2,
  Image as ImageIcon,
  AlertCircle,
  RefreshCw,
  LogOut,
  Sparkles,
  Plus
} from 'lucide-react';
import {
  connectGoogleDrive,
  disconnectGoogleDrive,
  getDriveAccessToken,
  uploadCatalogImageToDrive,
  listDriveFolderFiles,
  formatDriveImageUrl,
  SENNA_DRIVE_FOLDER_ID,
  SENNA_DRIVE_FOLDER_URL,
  DriveUploadedFile,
  auth
} from '../../services/googleDriveService';
import { onAuthStateChanged, User } from 'firebase/auth';

interface DriveImageUploaderProps {
  onImageUploaded: (directUrl: string, fileInfo?: DriveUploadedFile) => void;
  onMultipleImagesUploaded?: (urls: string[]) => void;
  existingImages?: string[];
  mainImageUrl?: string;
  onSetMainImage?: (url: string) => void;
  onRemoveImage?: (url: string) => void;
}

export const DriveImageUploader: React.FC<DriveImageUploaderProps> = ({
  onImageUploaded,
  onMultipleImagesUploaded,
  existingImages = [],
  mainImageUrl = '',
  onSetMainImage,
  onRemoveImage,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);
  const [hasToken, setHasToken] = useState<boolean>(Boolean(getDriveAccessToken()));
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Folder Explorer state
  const [showFolderBrowser, setShowFolderBrowser] = useState(false);
  const [folderFiles, setFolderFiles] = useState<DriveUploadedFile[]>([]);
  const [isLoadingFolder, setIsLoadingFolder] = useState(false);

  // Fallback manual URL input
  const [manualUrl, setManualUrl] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [uploadMode, setUploadMode] = useState<'drive' | 'local'>('drive');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setHasToken(Boolean(getDriveAccessToken()));
    });
    return () => unsubscribe();
  }, []);

  const handleConnect = async () => {
    setIsAuthenticating(true);
    setUploadError(null);
    try {
      const res = await connectGoogleDrive();
      if (res) {
        setCurrentUser(res.user);
        setHasToken(true);
        setSuccessMessage(`Berhasil terhubung dengan Google Drive: ${res.user.email}`);
        setTimeout(() => setSuccessMessage(null), 4000);
      }
    } catch (err: any) {
      setUploadError(err?.message || 'Gagal menyambungkan Google Drive.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleDisconnect = async () => {
    await disconnectGoogleDrive();
    setCurrentUser(null);
    setHasToken(false);
    setFolderFiles([]);
    setShowFolderBrowser(false);
  };

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadError(null);
    setSuccessMessage(null);

    // MODE 1: Google Drive Upload
    if (uploadMode === 'drive') {
      // If not connected, prompt login
      if (!hasToken || !getDriveAccessToken()) {
        try {
          setIsAuthenticating(true);
          const authRes = await connectGoogleDrive();
          if (!authRes) return;
          setCurrentUser(authRes.user);
          setHasToken(true);
        } catch (err: any) {
          // If login fails/cancelled, inform & fallback to local base64 upload
          console.warn('Drive authentication bypassed or failed, falling back to local base64:', err);
          setUploadError('Gagal menyambung ke Google Drive. Otomatis beralih ke upload langsung (Base64) agar foto tetap bisa masuk katalog.');
          // Fall through to local upload below after a brief pause
          await new Promise(resolve => setTimeout(resolve, 1500));
        } finally {
          setIsAuthenticating(false);
        }
      }

      // If we now have a token, proceed with Drive upload
      if (getDriveAccessToken()) {
        setIsUploading(true);
        const uploadedUrls: string[] = [];

        try {
          const total = files.length;
          for (let i = 0; i < total; i++) {
            const file = files[i];
            setUploadProgress(`Mengunggah ke Drive (${i + 1}/${total}): ${file.name}...`);
            
            const result = await uploadCatalogImageToDrive(file, SENNA_DRIVE_FOLDER_ID);
            uploadedUrls.push(result.directUrl);
            onImageUploaded(result.directUrl, result);
          }

          if (onMultipleImagesUploaded && uploadedUrls.length > 0) {
            onMultipleImagesUploaded(uploadedUrls);
          }

          setSuccessMessage(
            `${uploadedUrls.length} foto berhasil tersimpan di Google Drive Senna Gallery!`
          );
          setTimeout(() => setSuccessMessage(null), 5000);
          setIsUploading(false);
          setUploadProgress('');
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
          return;
        } catch (err: any) {
          console.error('Failed uploading to drive, falling back to local:', err);
          setUploadError('Terjadi kesalahan saat mengunggah ke Google Drive. Beralih ke upload langsung (Base64)...');
          await new Promise(resolve => setTimeout(resolve, 1000));
        } finally {
          setIsUploading(false);
          setUploadProgress('');
        }
      }
    }

    // MODE 2: Local Direct Device Upload (Base64 data URL fallback or main)
    setIsUploading(true);
    setUploadProgress('Membaca file dari perangkat...');
    try {
      const total = files.length;
      const base64Urls: string[] = [];

      for (let i = 0; i < total; i++) {
        const file = files[i];
        setUploadProgress(`Memuat file (${i + 1}/${total}): ${file.name}...`);

        const base64Url = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(file);
        });

        base64Urls.push(base64Url);
        onImageUploaded(base64Url);
      }

      if (onMultipleImagesUploaded && base64Urls.length > 0) {
        onMultipleImagesUploaded(base64Urls);
      }

      setSuccessMessage(`${total} foto berhasil diunggah langsung dari perangkat Anda & disimpan di katalog!`);
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err: any) {
      setUploadError('Gagal memproses file gambar dari perangkat Anda.');
    } finally {
      setIsUploading(false);
      setUploadProgress('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleLoadFolderFiles = async () => {
    if (!hasToken) {
      await handleConnect();
    }
    setIsLoadingFolder(true);
    setUploadError(null);
    try {
      const files = await listDriveFolderFiles(SENNA_DRIVE_FOLDER_ID);
      setFolderFiles(files);
      setShowFolderBrowser(true);
    } catch (err: any) {
      setUploadError(err?.message || 'Gagal memuat isi folder Google Drive.');
    } finally {
      setIsLoadingFolder(false);
    }
  };

  const handleAddManualUrl = () => {
    if (!manualUrl.trim()) return;
    const formatted = formatDriveImageUrl(manualUrl.trim());
    onImageUploaded(formatted);
    setManualUrl('');
    setSuccessMessage('URL foto berhasil ditambahkan ke katalog!');
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  return (
    <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
      
      {/* 1. DRIVE FOLDER DESTINATION HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0">
            <FolderOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-stone-900">
                Penyimpanan Google Drive Katalog
              </span>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-1.5 py-0.2 rounded-md">
                Folder ID: {SENNA_DRIVE_FOLDER_ID.slice(0, 8)}...
              </span>
            </div>
            <p className="text-[11px] text-stone-500">
              Foto yang diunggah otomatis tersimpan di folder Drive Senna &amp; langsung tampil di katalog pembeli.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href={SENNA_DRIVE_FOLDER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1.5 rounded-lg transition"
            title="Buka Folder Drive Senna Gallery"
          >
            <span>Buka di Drive</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* 2. AUTH STATUS & GOOGLE SIGN-IN BUTTON */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 bg-stone-50 p-2.5 rounded-xl border border-stone-200/80">
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full shrink-0 ${
              hasToken ? 'bg-emerald-500 animate-pulse' : 'bg-stone-300'
            }`}
          />
          {hasToken && currentUser ? (
            <div className="text-xs text-stone-700">
              <span className="font-semibold text-emerald-800">Akun Terhubung: </span>
              <span className="font-medium text-stone-600">{currentUser.email || 'Admin'}</span>
            </div>
          ) : (
            <div className="text-xs text-stone-600">
              <span>Status: </span>
              <span className="text-amber-800 font-semibold">Belum terhubung ke Google Drive</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {hasToken ? (
            <button
              type="button"
              onClick={handleDisconnect}
              className="text-[11px] text-stone-500 hover:text-red-600 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white transition cursor-pointer"
            >
              <LogOut className="w-3 h-3" />
              <span>Ganti Akun</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleConnect}
              disabled={isAuthenticating}
              className="w-full sm:w-auto bg-white hover:bg-slate-50 border border-slate-300 text-stone-800 text-xs font-semibold px-3 py-1.5 rounded-xl shadow-2xs flex items-center justify-center gap-2 transition active:scale-[0.98] cursor-pointer"
            >
              {isAuthenticating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-600" />
                  <span>Menghubungkan...</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>Hubungkan Google Drive (sennagallery99@gmail.com)</span>
                </>
              )}
            </button>
          )}

          <button
            type="button"
            onClick={handleLoadFolderFiles}
            disabled={isLoadingFolder}
            className="text-[11px] font-bold text-stone-700 bg-white hover:bg-stone-100 border border-stone-200 px-2.5 py-1.5 rounded-lg flex items-center gap-1 transition cursor-pointer"
            title="Lihat file foto yang sudah ada di folder ini"
          >
            {isLoadingFolder ? (
              <Loader2 className="w-3 h-3 animate-spin text-orange-600" />
            ) : (
              <RefreshCw className="w-3 h-3 text-stone-500" />
            )}
            <span>Jelajahi Isi Folder Drive</span>
          </button>
        </div>
      </div>

      {/* 3. ALERTS & NOTIFICATIONS */}
      {uploadError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold">Gagal Mengunggah ke Google Drive</p>
            <p className="text-[11px] mt-0.5">{uploadError}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Upload Mode Selector */}
      <div className="p-2 rounded-xl bg-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
        <span className="font-bold text-stone-700 pl-1">Opsi Metode Upload Gambar:</span>
        <div className="flex gap-1.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setUploadMode('drive')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer text-center ${
              uploadMode === 'drive'
                ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-2xs'
                : 'bg-white hover:bg-slate-50 border border-slate-200 text-stone-600'
            }`}
          >
            Simpan ke Google Drive
          </button>
          <button
            type="button"
            onClick={() => setUploadMode('local')}
            className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-[11px] font-bold transition cursor-pointer text-center ${
              uploadMode === 'local'
                ? 'bg-gradient-to-r from-red-600 to-orange-500 text-white shadow-2xs'
                : 'bg-white hover:bg-slate-50 border border-slate-200 text-stone-600'
            }`}
          >
            Upload Langsung (Base64)
          </button>
        </div>
      </div>

      {/* 4. DRAG & DROP UPLOAD BOX */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleFilesSelected(e.dataTransfer.files);
        }}
        className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 ${
          isUploading
            ? 'border-orange-400 bg-orange-50/50'
            : 'border-slate-300 hover:border-orange-500 hover:bg-orange-50/20 bg-slate-50/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFilesSelected(e.target.files)}
        />

        {isUploading ? (
          <div className="space-y-2 py-2">
            <Loader2 className="w-8 h-8 text-orange-600 animate-spin mx-auto" />
            <p className="text-xs font-bold text-orange-950">{uploadProgress || (uploadMode === 'drive' ? 'Mengunggah ke Google Drive...' : 'Memproses file gambar...')}</p>
            <p className="text-[10px] text-stone-500">
              {uploadMode === 'drive' 
                ? 'File langsung disimpan di folder Senna Gallery & disetel izin publik' 
                : 'Gambar dikonversi menjadi data URL & langsung dapat disimpan di katalog'}
            </p>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-xs">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-stone-800">
                Klik atau Tarik Foto Busana ke Sini
              </p>
              <p className="text-[11px] text-stone-500 mt-0.5">
                Mendukung JPG, PNG, WEBP. Dapat memilih beberapa foto sekaligus (Tampak Depan, Belakang, Detail).
              </p>
            </div>
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-orange-700 bg-orange-100/70 px-3 py-1 rounded-full mt-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>
                {uploadMode === 'drive' 
                  ? 'Otomatis Tersimpan di Google Drive Senna' 
                  : 'Sangat Praktis - Langsung Diproses Secara Lokal (Base64)'}
              </span>
            </div>
          </>
        )}
      </div>

      {/* 5. FOLDER BROWSER DRAWER (IF OPENED) */}
      {showFolderBrowser && (
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
              <FolderOpen className="w-3.5 h-3.5 text-amber-600" />
              File di Folder Google Drive ({folderFiles.length} foto)
            </span>
            <button
              type="button"
              onClick={() => setShowFolderBrowser(false)}
              className="text-[11px] text-stone-400 hover:text-stone-700"
            >
              Tutup
            </button>
          </div>

          {folderFiles.length === 0 ? (
            <p className="text-xs text-stone-400 py-3 text-center">
              Belum ada foto lain di folder ini atau sedang memuat...
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-56 overflow-y-auto pr-1">
              {folderFiles.map((f) => (
                <div
                  key={f.id}
                  className="bg-white border border-stone-200 rounded-xl p-1.5 flex flex-col justify-between group hover:border-orange-400 transition"
                >
                  <div className="aspect-square bg-slate-100 rounded-lg overflow-hidden relative">
                    <img
                      src={f.directUrl}
                      alt={f.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <p className="text-[10px] text-stone-600 line-clamp-1 mt-1 font-medium" title={f.name}>
                    {f.name}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onImageUploaded(f.directUrl, f);
                      setSuccessMessage(`Foto "${f.name}" ditambahkan ke katalog.`);
                      setTimeout(() => setSuccessMessage(null), 3000);
                    }}
                    className="w-full mt-1 bg-amber-50 hover:bg-amber-100 text-amber-900 text-[10px] font-bold py-1 rounded-md transition flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Gunakan Foto</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 6. CURRENT CATALOG IMAGES PREVIEW */}
      {existingImages.length > 0 && (
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-800 flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5 text-stone-600" />
              Foto Katalog Terpilih ({existingImages.length} Foto):
            </span>
            <span className="text-[10px] text-stone-400">
              Klik "Set Utama" untuk menentukan cover katalog
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {existingImages.map((imgUrl, idx) => {
              const isMain = imgUrl === mainImageUrl || (!mainImageUrl && idx === 0);
              const isDriveImg = imgUrl.includes('googleusercontent.com') || imgUrl.includes('drive.google.com');

              return (
                <div
                  key={idx}
                  className={`relative rounded-xl overflow-hidden border p-1 bg-white flex flex-col justify-between ${
                    isMain ? 'border-orange-500 ring-2 ring-orange-500/20' : 'border-slate-200'
                  }`}
                >
                  <div className="aspect-square w-full rounded-lg overflow-hidden bg-slate-100 relative">
                    <img
                      src={formatDriveImageUrl(imgUrl)}
                      alt={`Foto Katalog ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />

                    {isMain && (
                      <span className="absolute top-1 left-1 bg-gradient-to-r from-red-600 to-orange-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded shadow-xs">
                        Cover Utama
                      </span>
                    )}

                    {isDriveImg && (
                      <span className="absolute bottom-1 right-1 bg-black/75 backdrop-blur-xs text-amber-300 text-[8.5px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-xs">
                        Drive File
                      </span>
                    )}
                  </div>

                  <div className="pt-1.5 flex items-center justify-between gap-1 text-[10px]">
                    {!isMain && onSetMainImage ? (
                      <button
                        type="button"
                        onClick={() => onSetMainImage(imgUrl)}
                        className="text-orange-600 hover:text-orange-800 font-bold cursor-pointer"
                      >
                        Set Utama
                      </button>
                    ) : (
                      <span className="text-stone-400 font-medium">Cover</span>
                    )}

                    {onRemoveImage && (
                      <button
                        type="button"
                        onClick={() => onRemoveImage(imgUrl)}
                        className="text-rose-500 hover:text-rose-700 font-bold cursor-pointer"
                        title="Hapus foto dari katalog"
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 7. OPTIONAL FALLBACK: MANUAL LINK OR DRIVE URL */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setShowManualInput(!showManualInput)}
          className="text-[11px] text-stone-500 hover:text-stone-800 font-medium flex items-center gap-1 cursor-pointer"
        >
          <span>{showManualInput ? '− Sembunyikan' : '+ Atau masukkan link foto / link Google Drive manual'}</span>
        </button>

        {showManualInput && (
          <div className="flex gap-2 mt-2">
            <input
              type="text"
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              placeholder="Contoh: https://drive.google.com/file/d/... atau https://..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:bg-white focus:border-orange-500 outline-hidden"
            />
            <button
              type="button"
              onClick={handleAddManualUrl}
              className="bg-stone-800 hover:bg-black text-white text-xs font-bold px-3 py-2 rounded-xl transition cursor-pointer shrink-0"
            >
              Tambah Link
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
