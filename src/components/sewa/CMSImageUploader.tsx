import React, { useRef, useState } from 'react';
import { Loader2, Upload, Check, AlertCircle } from 'lucide-react';
import { getDriveAccessToken, uploadCatalogImageToDrive, SENNA_DRIVE_FOLDER_ID } from '../../services/googleDriveService';
import { compressImageFile } from '../../services/imageUtils';

interface CMSImageUploaderProps {
  onUploadSuccess: (url: string) => void;
  label?: string;
}

export const CMSImageUploader: React.FC<CMSImageUploaderProps> = ({
  onUploadSuccess,
  label = 'Upload'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError(null);
    setStatus('idle');

    try {
      const token = getDriveAccessToken();
      
      // If token exists and valid, upload to Google Drive
      if (token) {
        try {
          const result = await uploadCatalogImageToDrive(file, SENNA_DRIVE_FOLDER_ID);
          onUploadSuccess(result.directUrl);
          setStatus('success');
          setTimeout(() => setStatus('idle'), 3000);
          setIsUploading(false);
          return;
        } catch (driveErr) {
          console.warn('Google Drive token upload failed, falling back to local compressed image:', driveErr);
        }
      }

      // Automatic client-side compression: transforms 5-10MB phone camera images into crisp ~100KB JPEG
      const compressedDataUrl = await compressImageFile(file, 1200, 1200, 0.82);
      onUploadSuccess(compressedDataUrl);
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
      setIsUploading(false);
    } catch (err: any) {
      console.error('CMS upload error:', err);
      setUploadError(err?.message || 'Gagal memproses file foto');
      setStatus('error');
      setIsUploading(false);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="inline-flex items-center">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      
      <button
        type="button"
        disabled={isUploading}
        onClick={() => fileInputRef.current?.click()}
        className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
          isUploading
            ? 'bg-orange-50 border-orange-200 text-orange-600'
            : status === 'success'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
            : 'bg-white hover:bg-slate-50 border-slate-200 text-stone-700'
        }`}
        title="Pilih gambar untuk diunggah"
      >
        {isUploading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin text-orange-500" />
            <span>Memproses...</span>
          </>
        ) : status === 'success' ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>Selesai!</span>
          </>
        ) : (
          <>
            <Upload className="w-3.5 h-3.5" />
            <span>{label}</span>
          </>
        )}
      </button>

      {uploadError && (
        <span className="text-[10px] text-red-600 ml-2 max-w-40 truncate" title={uploadError}>
          {uploadError}
        </span>
      )}
    </div>
  );
};
