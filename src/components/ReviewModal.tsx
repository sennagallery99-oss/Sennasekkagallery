import React, { useState } from 'react';
import { X, Star, Upload, Check, Heart, Sparkles, Camera, MapPin, User, MessageSquare } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useSewaStore } from '../store/sewaStore';
import { Testimonial } from '../types';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: 'all' | 'wedding' | 'mua' | 'decor' | 'sewa';
  defaultEvent?: string;
}

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
];

const RATING_LABELS: Record<number, string> = {
  1: 'Kurang Puas ⭐',
  2: 'Cukup ⭐⭐',
  3: 'Bagus & Rapi ⭐⭐⭐',
  4: 'Sangat Memuaskan! ⭐⭐⭐⭐',
  5: 'Luar Biasa Sempurna! ⭐⭐⭐⭐⭐'
};

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  defaultCategory = 'sewa',
  defaultEvent = ''
}) => {
  const addTestimonial = useSewaStore((state) => state.addTestimonial);
  const currentUser = useSewaStore((state) => state.currentUser);

  const [clientName, setClientName] = useState(currentUser?.name || '');
  const [role, setRole] = useState(defaultCategory === 'sewa' ? 'Penyewa Busana' : 'Klien Pengantin');
  const [category, setCategory] = useState<'all' | 'wedding' | 'mua' | 'decor' | 'sewa'>(defaultCategory);
  const [event, setEvent] = useState(defaultEvent || '');
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [location, setLocation] = useState('Bandar Lampung');
  const [image, setImage] = useState(currentUser?.avatar || PRESET_AVATARS[0]);
  const [customImageBase64, setCustomImageBase64] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({ ...prev, image: 'Ukuran foto maksimal 5MB.' }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setCustomImageBase64(result);
      setImage(result);
    };
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!clientName.trim()) {
      errs.clientName = 'Nama lengkap / pasangan wajib diisi.';
    }
    if (!comment.trim()) {
      errs.comment = 'Silakan tulis ulasan atau testimoni pengalaman Anda.';
    } else if (comment.trim().length < 10) {
      errs.comment = 'Ulasan minimal 10 karakter.';
    }
    if (!event.trim()) {
      errs.event = 'Layanan / busana yang disewa wajib dipilih atau diisi.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const now = new Date();
      const monthNames = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
      ];
      const formattedDate = `${monthNames[now.getMonth()]} ${now.getFullYear()}`;

      await addTestimonial({
        clientName: clientName.trim(),
        role: role.trim() || 'Klien Terverifikasi',
        category,
        event: event.trim(),
        rating,
        comment: comment.trim(),
        image: image || PRESET_AVATARS[0],
        date: formattedDate,
        location: location.trim() || 'Bandar Lampung',
        isVerified: true,
        likesCount: 1
      });

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      onClose();
    } catch (err) {
      console.error('Gagal mengirim ulasan:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-8">
        
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-red-600 to-orange-500 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold tracking-tight">
                Tulis Testimoni &amp; Ulasan Klien
              </h3>
              <p className="text-[11px] text-stone-300">
                Bagikan pengalaman Anda bersama Senna Gallery &amp; Sekka Design
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Star Rating Interactive Picker */}
          <div className="bg-amber-50/60 border border-amber-200/70 rounded-2xl p-4 text-center space-y-2">
            <span className="text-xs font-bold text-stone-800 uppercase tracking-wider block">
              Beri Nilai Kepuasan Anda
            </span>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      (hoverRating || rating) >= star
                        ? 'fill-amber-400 text-amber-500 drop-shadow-sm'
                        : 'text-stone-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs font-semibold text-amber-800">
              {RATING_LABELS[hoverRating || rating]}
            </p>
          </div>

          {/* Name & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Nama Lengkap / Pasangan <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Contoh: Sarah &amp; Dimas"
                  className={`w-full pl-9 pr-3 py-2 text-xs rounded-xl border ${
                    errors.clientName ? 'border-red-500 bg-red-50' : 'border-stone-300 focus:border-red-500'
                  } focus:outline-none`}
                />
              </div>
              {errors.clientName && <p className="text-[10px] text-red-500 mt-0.5">{errors.clientName}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Peran / Status Klien
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:border-red-500 focus:outline-none bg-white"
              >
                <option value="Penyewa Busana">Penyewa Busana / Gaun</option>
                <option value="Pengantin Akad &amp; Resepsi">Pengantin Akad &amp; Resepsi</option>
                <option value="Klien Makeup (MUA)">Klien Makeup (MUA)</option>
                <option value="Klien Dekorasi Pelaminan">Klien Dekorasi Pelaminan</option>
                <option value="Wisudawati / Bridesmaid">Wisudawati / Bridesmaid</option>
                <option value="Klien Photoshoot Prewedding">Klien Photoshoot Prewedding</option>
              </select>
            </div>
          </div>

          {/* Category & Service Event */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Kategori Layanan <span className="text-red-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => {
                  const cat = e.target.value as any;
                  setCategory(cat);
                  if (cat === 'sewa' && !event) setEvent('Sewa Busana Kebaya Modern');
                  if (cat === 'wedding' && !event) setEvent('Paket Wedding Intimate');
                  if (cat === 'mua' && !event) setEvent('Bridal Makeup & Hijabdo');
                  if (cat === 'decor' && !event) setEvent('Dekorasi Pelaminan Sekka');
                }}
                className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:border-red-500 focus:outline-none bg-white"
              >
                <option value="sewa">Sewa Busana &amp; Kebaya (Atelier)</option>
                <option value="wedding">Paket Wedding All-In</option>
                <option value="mua">Makeup Pengantin (MUA)</option>
                <option value="decor">Dekorasi Pelaminan (Sekka)</option>
                <option value="all">Lainnya / Umum</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Nama Busana / Paket Layanan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={event}
                onChange={(e) => setEvent(e.target.value)}
                placeholder="Misal: Sewa Kebaya Brokat Sage / Paket Royal 28 JT"
                className={`w-full px-3 py-2 text-xs rounded-xl border ${
                  errors.event ? 'border-red-500 bg-red-50' : 'border-stone-300 focus:border-red-500'
                } focus:outline-none`}
              />
              {errors.event && <p className="text-[10px] text-red-500 mt-0.5">{errors.event}</p>}
            </div>
          </div>

          {/* City / Location */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Kota / Lokasi Acara
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Contoh: Bandar Lampung / Metro / Lampung Selatan"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 focus:border-red-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Comment / Review Textarea */}
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">
              Ulasan / Pengalaman Anda <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Ceritakan bagaimana hasil riasan, kualitas busana, kebersihan, fitting, atau pelayanan tim Senna Gallery & Sekka Design..."
                className={`w-full p-3 text-xs rounded-xl border ${
                  errors.comment ? 'border-red-500 bg-red-50' : 'border-stone-300 focus:border-red-500'
                } focus:outline-none leading-relaxed`}
              />
            </div>
            {errors.comment && <p className="text-[10px] text-red-500 mt-0.5">{errors.comment}</p>}
          </div>

          {/* Avatar / Photo Selection */}
          <div className="space-y-2 pt-1">
            <label className="block text-xs font-bold text-stone-700">
              Pilih Foto Profil / Upload Foto Anda
            </label>
            
            {/* Presets Grid */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {PRESET_AVATARS.map((avatarUrl, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => {
                    setImage(avatarUrl);
                    setCustomImageBase64('');
                  }}
                  className={`w-11 h-11 rounded-full overflow-hidden border-2 shrink-0 transition relative cursor-pointer ${
                    image === avatarUrl ? 'border-red-600 ring-2 ring-red-400' : 'border-stone-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={avatarUrl} alt="Avatar option" className="w-full h-full object-cover" />
                  {image === avatarUrl && (
                    <div className="absolute inset-0 bg-red-600/30 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                  )}
                </button>
              ))}

              {/* Upload Custom Photo */}
              <label className="w-11 h-11 rounded-full border-2 border-dashed border-stone-300 hover:border-red-500 flex flex-col items-center justify-center cursor-pointer shrink-0 bg-stone-50 hover:bg-red-50 transition">
                <Camera className="w-4 h-4 text-stone-500" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
            {customImageBase64 && (
              <p className="text-[10px] text-emerald-600 flex items-center gap-1 font-semibold">
                <Check className="w-3 h-3" /> Foto kustom Anda terpilih.
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100 transition cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white shadow-md transition active:scale-95 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
            >
              <Heart className="w-3.5 h-3.5 fill-white" />
              <span>{isSubmitting ? 'Menyimpan...' : 'Kirim Testimoni'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
