import React, { useState } from 'react';
import {
  X,
  Sparkles,
  CloudDownload,
  FolderOpen,
  CheckCircle2,
  AlertCircle,
  Loader2,
  CheckSquare,
  Square,
  Filter,
  Layers,
  Tag,
  DollarSign,
  Eye,
  RefreshCw,
  FolderSync
} from 'lucide-react';
import { useSewaStore } from '../../store/sewaStore';
import {
  parseDriveFolder,
  parseDirectDriveLinks,
  DriveParsedItem,
  DriveParsedFolder,
  cleanFileNameToTitle,
} from '../../services/googleDriveService';

interface DriveBulkImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORY_OPTIONS = [
  { value: 'kebaya', label: 'Kebaya Pengantin' },
  { value: 'gaun', label: 'Gaun Resepsi & Pesta' },
  { value: 'jas', label: 'Jas Pria & Tuxedo' },
  { value: 'adat', label: 'Baju Adat Tradisional' },
  { value: 'aksesoris', label: 'Aksesoris & Tiara' },
];

export const DriveBulkImportModal: React.FC<DriveBulkImportModalProps> = ({ isOpen, onClose }) => {
  const { addProductsBatch, showToast, products } = useSewaStore();

  // Input states
  const [folderUrl, setFolderUrl] = useState(
    'https://drive.google.com/drive/folders/1JNKKzxHUwf1kfjJMZX3tfJ2ESXg4SLJG?usp=sharing'
  );
  const [manualLinksText, setManualLinksText] = useState('');
  const [inputMode, setInputMode] = useState<'folder' | 'manual'>('folder');

  // Scanning & loading states
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // Scanned results
  const [scannedItems, setScannedItems] = useState<DriveParsedItem[]>([]);
  const [scannedFolders, setScannedFolders] = useState<DriveParsedFolder[]>([]);
  const [activeFolderFilter, setActiveFolderFilter] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Bulk configuration defaults
  const [defaultCategory, setDefaultCategory] = useState<string>('kebaya');
  const [defaultPrice, setDefaultPrice] = useState<number>(250000);
  const [defaultOriginalPrice, setDefaultOriginalPrice] = useState<number>(350000);
  const [defaultDiscount, setDefaultDiscount] = useState<number>(28);
  const [defaultSizes, setDefaultSizes] = useState<string[]>(['S', 'M', 'L', 'XL', 'XXL']);
  const [defaultLocation, setDefaultLocation] = useState<string>('Bandar Lampung');
  const [namePrefix, setNamePrefix] = useState<string>('Koleksi Busana Senna');

  // Preview zoom image
  const [previewZoomUrl, setPreviewZoomUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  // 1. Scan folder handler
  const handleScanFolder = async () => {
    if (!folderUrl.trim()) {
      setScanError('Masukkan link atau ID folder Google Drive terlebih dahulu.');
      return;
    }

    setIsScanning(true);
    setScanError(null);

    try {
      const result = await parseDriveFolder(folderUrl);
      if (result.images.length === 0) {
        setScanError('Tidak ada file foto/gambar yang ditemukan di folder Google Drive ini. Pastikan folder disetel Publik ("Siapa saja yang memiliki link").');
      } else {
        setScannedItems(result.images);
        setScannedFolders(result.folders);
        setActiveFolderFilter('all');
        showToast(`Ditemukan ${result.images.length} foto dari Google Drive!`, 'success');
      }
    } catch (err: any) {
      setScanError(
        err?.message || 'Gagal memindai Google Drive. Pastikan link benar dan folder berstatus Publik.'
      );
    } finally {
      setIsScanning(false);
    }
  };

  // 2. Parse manual links
  const handleParseManualLinks = () => {
    if (!manualLinksText.trim()) {
      setScanError('Masukkan daftar link atau ID file Google Drive.');
      return;
    }

    const items = parseDirectDriveLinks(manualLinksText);
    if (items.length === 0) {
      setScanError('Tidak ada link Google Drive yang valid terdeteksi.');
    } else {
      setScannedItems(items);
      setScannedFolders([{ id: 'manual', name: 'Manual Links', count: items.length }]);
      setActiveFolderFilter('all');
      setScanError(null);
      showToast(`Ditemukan ${items.length} link foto Google Drive!`, 'success');
    }
  };

  // 3. Selection toggles
  const handleToggleSelectAll = (select: boolean) => {
    setScannedItems((prev) =>
      prev.map((item) => {
        if (activeFolderFilter === 'all' || item.folderName === activeFolderFilter) {
          return { ...item, selected: select };
        }
        return item;
      })
    );
  };

  const handleToggleItem = (id: string) => {
    setScannedItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const handleUpdateItemTitle = (id: string, newTitle: string) => {
    setScannedItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, cleanTitle: newTitle } : item))
    );
  };

  // Apply Prefix to all titles
  const handleApplyPrefixToAll = () => {
    if (!namePrefix.trim()) return;
    setScannedItems((prev) =>
      prev.map((item, idx) => ({
        ...item,
        cleanTitle: `${namePrefix} #${idx + 1}`,
      }))
    );
    showToast('Nama judul semua busana berhasil diperbarui!', 'info');
  };

  // Filtered scanned items
  const visibleItems = scannedItems.filter((item) => {
    const matchesFolder = activeFolderFilter === 'all' || item.folderName === activeFolderFilter;
    const matchesSearch =
      !searchFilter.trim() ||
      item.cleanTitle.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.name.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  const selectedCount = scannedItems.filter((item) => item.selected).length;

  // 4. Batch Import Execution
  const handleExecuteImport = async () => {
    const selectedItems = scannedItems.filter((item) => item.selected);
    if (selectedItems.length === 0) {
      showToast('Pilih setidaknya 1 item foto untuk diimpor ke katalog.', 'info');
      return;
    }

    setIsImporting(true);

    try {
      const selectedCategoryObj =
        CATEGORY_OPTIONS.find((c) => c.value === defaultCategory) || CATEGORY_OPTIONS[0];

      const newProductsPayload = selectedItems.map((item, index) => {
        const cleanName =
          item.cleanTitle.trim() ||
          cleanFileNameToTitle(item.name, index, item.folderName, namePrefix);

        return {
          name: cleanName,
          category: defaultCategory as 'kebaya' | 'jas' | 'gaun' | 'aksesoris',
          categoryLabel: selectedCategoryObj.label,
          price: defaultPrice,
          originalPrice: defaultOriginalPrice,
          discountPercent: defaultDiscount,
          priceFormatted: `Rp ${defaultPrice.toLocaleString('id-ID')} / 3 hari`,
          sizes: defaultSizes,
          sizeStock: { S: 2, M: 3, L: 2, XL: 1, XXL: 1 },
          colors: ['Pilihan Standar'],
          imageUrl: item.directUrl,
          additionalImages: [item.directUrl],
          description: `Koleksi busana eksklusif dari Senna Gallery Bandar Lampung. Dibuat dengan material premium pilihan untuk menunjang penampilan istimewa di hari spesial Anda.`,
          material: 'Premium Fabrics & Embellishments',
          inclusions: [
            'Free fitting studio di Bandar Lampung',
            'Bebas cuci & dry clean steril',
            'Aksesoris pelengkap standar',
          ],
          fittingNotes: 'Dapat disesuaikan di studio fitting Senna Gallery Bandar Lampung.',
          cashbackPill: 'Free Fitting',
          location: defaultLocation,
          rating: 5.0,
          reviewCount: 1,
          totalRented: 0,
        };
      });

      const added = await addProductsBatch(newProductsPayload);

      showToast(
        `Sukses! ${added.length} busana dari Google Drive telah ditambahkan ke katalog.`,
        'success'
      );
      onClose();
    } catch (err: any) {
      showToast(`Gagal menambahkan katalog: ${err.message || 'Kesalahan sistem'}`, 'info');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-stone-200 bg-gradient-to-r from-stone-900 via-stone-800 to-orange-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center shadow-md">
              <FolderSync className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight">
                  Impor Massal Katalog dari Google Drive
                </h2>
                <span className="bg-orange-500/20 text-orange-300 border border-orange-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  Auto High-Res CDN
                </span>
              </div>
              <p className="text-xs text-stone-300">
                Masukkan link folder Google Drive untuk membuat puluhan/ratusan item katalog sekaligus
                dalam hitungan detik.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">
          {/* Step 1: Input URL Source */}
          <div className="bg-stone-50 rounded-2xl p-4 sm:p-5 border border-stone-200 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="text-xs font-bold text-stone-900 flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-orange-600" />
                <span>Link Folder Google Drive (Folder Publik):</span>
              </label>
              <div className="flex items-center gap-1 bg-stone-200 p-0.5 rounded-lg text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => setInputMode('folder')}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                    inputMode === 'folder'
                      ? 'bg-white text-stone-900 shadow-2xs font-bold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Link Folder Drive
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('manual')}
                  className={`px-2.5 py-1 rounded-md transition cursor-pointer ${
                    inputMode === 'manual'
                      ? 'bg-white text-stone-900 shadow-2xs font-bold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Tempel Banyak Link File
                </button>
              </div>
            </div>

            {inputMode === 'folder' ? (
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="url"
                  value={folderUrl}
                  onChange={(e) => setFolderUrl(e.target.value)}
                  placeholder="https://drive.google.com/drive/folders/1JNKKzxHUwf1kfjJMZX3tfJ2ESXg4SLJG?usp=sharing"
                  className="flex-1 bg-white border border-stone-300 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-hidden font-mono"
                />
                <button
                  type="button"
                  onClick={handleScanFolder}
                  disabled={isScanning}
                  className="bg-gradient-to-r from-stone-900 to-stone-800 hover:from-black hover:to-stone-900 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50 shrink-0"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-orange-400" />
                      <span>Memindai Google Drive...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Pindai Folder & Sub-Folder</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <textarea
                  rows={3}
                  value={manualLinksText}
                  onChange={(e) => setManualLinksText(e.target.value)}
                  placeholder="Tempel link Google Drive atau link gambar di sini (satu link per baris)...&#10;https://drive.google.com/file/d/1rTmW19fHNHd0ipCHqDSRwAicj-jqVgu0/view&#10;https://drive.google.com/file/d/13GMRGRwjUP2_aZH5Y4ZkMIfUVacPgyO3/view"
                  className="w-full bg-white border border-stone-300 rounded-xl p-3 text-xs text-stone-900 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-hidden font-mono"
                />
                <button
                  type="button"
                  onClick={handleParseManualLinks}
                  className="bg-stone-900 hover:bg-black text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Ekstrak Foto dari Link</span>
                </button>
              </div>
            )}

            {scanError && (
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start gap-2 text-xs text-rose-800">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Gagal memindai folder:</strong>
                  <span>{scanError}</span>
                </div>
              </div>
            )}
          </div>

          {/* Step 2: Global Batch Attributes Config (Only when items are scanned) */}
          {scannedItems.length > 0 && (
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h3 className="text-xs font-bold text-stone-900 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-orange-600" />
                  <span>Atribut Default untuk Semua Busana Baru:</span>
                </h3>
                <span className="text-[11px] text-stone-400">
                  (Bisa diedit individual setelah diimpor)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Default Category */}
                <div>
                  <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                    Kategori Utama:
                  </label>
                  <select
                    value={defaultCategory}
                    onChange={(e) => setDefaultCategory(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-800 outline-hidden font-medium"
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Default Rent Price */}
                <div>
                  <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                    Harga Sewa (/ 3 Hari):
                  </label>
                  <div className="relative">
                    <span className="text-xs text-stone-400 absolute left-3 top-2.5 font-bold">
                      Rp
                    </span>
                    <input
                      type="number"
                      step={10000}
                      value={defaultPrice}
                      onChange={(e) => {
                        const p = Number(e.target.value);
                        setDefaultPrice(p);
                        setDefaultOriginalPrice(Math.round(p * 1.35));
                      }}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-800 outline-hidden font-bold"
                    />
                  </div>
                </div>

                {/* Default Original / Strikethrough Price */}
                <div>
                  <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                    Harga Coret (Sebelum Diskon):
                  </label>
                  <div className="relative">
                    <span className="text-xs text-stone-400 absolute left-3 top-2.5 font-bold">
                      Rp
                    </span>
                    <input
                      type="number"
                      step={10000}
                      value={defaultOriginalPrice}
                      onChange={(e) => setDefaultOriginalPrice(Number(e.target.value))}
                      className="w-full bg-stone-50 border border-stone-300 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-800 outline-hidden"
                    />
                  </div>
                </div>

                {/* Name Prefix */}
                <div>
                  <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                    Awalan Nama Busana:
                  </label>
                  <div className="flex gap-1.5">
                    <input
                      type="text"
                      value={namePrefix}
                      onChange={(e) => setNamePrefix(e.target.value)}
                      placeholder="Contoh: Busana Senna"
                      className="flex-1 bg-stone-50 border border-stone-300 rounded-xl px-3 py-2 text-xs text-stone-800 outline-hidden font-medium"
                    />
                    <button
                      type="button"
                      onClick={handleApplyPrefixToAll}
                      title="Terapkan awalan nama ke semua item"
                      className="bg-stone-200 hover:bg-stone-300 text-stone-800 text-[11px] font-bold px-2.5 py-2 rounded-xl transition cursor-pointer shrink-0"
                    >
                      Terapkan
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Scanned Items Preview Grid */}
          {scannedItems.length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-stone-100 p-3 rounded-2xl">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-black text-stone-900">
                    {scannedItems.length} Foto Ditemukan
                  </span>
                  <span className="text-xs text-stone-500 font-medium">
                    ({selectedCount} dipilih untuk diimpor)
                  </span>

                  <div className="flex items-center gap-1.5 ml-2">
                    <button
                      type="button"
                      onClick={() => handleToggleSelectAll(true)}
                      className="text-[11px] font-bold text-orange-600 hover:underline cursor-pointer"
                    >
                      Pilih Semua
                    </button>
                    <span className="text-stone-300">•</span>
                    <button
                      type="button"
                      onClick={() => handleToggleSelectAll(false)}
                      className="text-[11px] font-semibold text-stone-500 hover:underline cursor-pointer"
                    >
                      Batal Pilih
                    </button>
                  </div>
                </div>

                {/* Subfolder Filter Tabs */}
                {scannedFolders.length > 1 && (
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                    <button
                      type="button"
                      onClick={() => setActiveFolderFilter('all')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer shrink-0 ${
                        activeFolderFilter === 'all'
                          ? 'bg-orange-600 text-white shadow-2xs'
                          : 'bg-white text-stone-600 hover:bg-stone-200'
                      }`}
                    >
                      Semua ({scannedItems.length})
                    </button>
                    {scannedFolders.map((sf) => (
                      <button
                        key={sf.id}
                        type="button"
                        onClick={() => setActiveFolderFilter(sf.name)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer shrink-0 ${
                          activeFolderFilter === sf.name
                            ? 'bg-orange-600 text-white shadow-2xs'
                            : 'bg-white text-stone-600 hover:bg-stone-200'
                        }`}
                      >
                        {sf.name} ({sf.count})
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Items Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[380px] overflow-y-auto p-1">
                {visibleItems.map((item, idx) => (
                  <div
                    key={item.id}
                    onClick={() => handleToggleItem(item.id)}
                    className={`group relative bg-white rounded-2xl border p-2.5 transition cursor-pointer flex flex-col justify-between select-none ${
                      item.selected
                        ? 'border-orange-500 ring-2 ring-orange-200 shadow-sm'
                        : 'border-stone-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    {/* Checkbox Icon */}
                    <div className="absolute top-4 left-4 z-10">
                      {item.selected ? (
                        <div className="w-5 h-5 rounded bg-orange-600 text-white flex items-center justify-center shadow-sm">
                          <CheckSquare className="w-3.5 h-3.5" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded bg-white/90 border border-stone-400 text-stone-400 flex items-center justify-center">
                          <Square className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>

                    {/* Image Thumbnail */}
                    <div className="relative aspect-3/4 rounded-xl overflow-hidden bg-stone-100 mb-2">
                      <img
                        src={item.directUrl}
                        alt={item.cleanTitle}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        loading="lazy"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            'https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=400&q=80';
                        }}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewZoomUrl(item.directUrl);
                        }}
                        className="absolute bottom-2 right-2 w-6 h-6 rounded-lg bg-black/60 hover:bg-black text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Editable Title */}
                    <div className="space-y-1" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={item.cleanTitle}
                        onChange={(e) => handleUpdateItemTitle(item.id, e.target.value)}
                        className="w-full bg-stone-50 hover:bg-white focus:bg-white border border-transparent focus:border-orange-400 rounded-lg px-2 py-1 text-[11px] font-bold text-stone-900 outline-hidden truncate"
                        title={item.cleanTitle}
                      />
                      <div className="flex items-center justify-between text-[10px] text-stone-400 px-1">
                        <span className="truncate max-w-[80px]">{item.folderName}</span>
                        <span className="font-mono text-orange-600 font-bold">
                          Rp {(defaultPrice / 1000).toFixed(0)}k
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-5 sm:px-6 py-4 border-t border-stone-200 bg-stone-50 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-stone-500">
            {scannedItems.length > 0 ? (
              <span>
                Siap mengimpor{' '}
                <strong className="text-stone-900 font-bold">{selectedCount} busana</strong> ke
                katalog Senna Gallery.
              </span>
            ) : (
              <span>Klik tombol "Pindai Folder" untuk memulai.</span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-bold transition cursor-pointer"
            >
              Batal
            </button>

            <button
              type="button"
              disabled={selectedCount === 0 || isImporting}
              onClick={handleExecuteImport}
              className="flex-1 sm:flex-none bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl transition flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isImporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan ke Katalog...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Impor {selectedCount} Busana Sekarang</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox / Zoom Preview Modal */}
      {previewZoomUrl && (
        <div
          className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setPreviewZoomUrl(null)}
        >
          <div className="relative max-w-3xl max-h-[85vh] p-2">
            <img
              src={previewZoomUrl}
              alt="Preview Besar"
              className="max-h-[80vh] w-auto mx-auto rounded-2xl shadow-2xl object-contain"
            />
            <button
              type="button"
              onClick={() => setPreviewZoomUrl(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 hover:bg-white text-stone-900 flex items-center justify-center transition"
            >
              <X className="w-5 h-5 text-white hover:text-black" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
