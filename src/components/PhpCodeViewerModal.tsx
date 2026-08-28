import React, { useState } from 'react';
import { 
  X, 
  Code2, 
  Copy, 
  Check, 
  Download, 
  Folder, 
  FileText, 
  Database, 
  ShieldCheck, 
  ExternalLink,
  Terminal,
  HelpCircle,
  FileCode
} from 'lucide-react';
import JSZip from 'jszip';
import { PHP_PROJECT_FILES } from '../data/phpCodebase';
import { PhpFileItem } from '../types';

interface PhpCodeViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PhpCodeViewerModal: React.FC<PhpCodeViewerModalProps> = ({
  isOpen,
  onClose
}) => {
  const [selectedFile, setSelectedFile] = useState<PhpFileItem>(PHP_PROJECT_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);
  const [activeTab, setActiveTab] = useState<'files' | 'guide'>('files');

  if (!isOpen) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();

      // Add all files according to their paths
      PHP_PROJECT_FILES.forEach((file) => {
        zip.file(file.path, file.content);
      });

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'senna-mua-sekka-hostinger-php.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to generate ZIP', err);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div
      id="php-code-viewer-modal-overlay"
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-6xl bg-[#141312] rounded-2xl shadow-2xl border border-white/10 text-stone-200 overflow-hidden flex flex-col h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Modal Header */}
        <div className="p-4 sm:p-6 border-b border-white/10 bg-[#0E0D0C] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 text-[#E5E1DA] flex items-center justify-center shadow-xs">
              <Code2 className="w-5 h-5 text-[#8E8271]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg sm:text-xl font-normal text-white tracking-wide">
                  Source Code PHP Native &amp; Hostinger Deployment
                </h3>
                <span className="bg-white/10 text-stone-300 border border-white/20 text-[10px] font-light uppercase tracking-wider px-2 py-0.5 rounded-full">
                  Hostinger Ready
                </span>
              </div>
              <p className="text-xs text-stone-400 font-light">
                Senna MUA Gallery &amp; Sekka Design Decoration (PHP, MySQL PDO, Tailwind CDN, Session &amp; Redirect)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Download ZIP button */}
            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className="bg-white text-[#1A1A1A] hover:bg-stone-100 font-semibold text-xs uppercase tracking-wider px-4 py-2.5 rounded-full shadow-xs transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4 text-[#8E8271]" />
              <span>{isZipping ? 'Membuat ZIP...' : 'Download Full ZIP'}</span>
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-white hover:bg-white/10 rounded-full transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="bg-[#141312] px-6 border-b border-white/10 flex items-center gap-6 text-xs font-light tracking-wider uppercase">
          <button
            onClick={() => setActiveTab('files')}
            className={`py-3 border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'files'
                ? 'border-white text-white font-medium'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <FileCode className="w-4 h-4 text-[#8E8271]" />
            <span>Explorer File ({PHP_PROJECT_FILES.length} Files)</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`py-3 border-b-2 transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'guide'
                ? 'border-white text-white font-medium'
                : 'border-transparent text-stone-400 hover:text-stone-200'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-[#8E8271]" />
            <span>Panduan Upload Hostinger</span>
          </button>
        </div>

        {/* Main Content Area */}
        {activeTab === 'files' ? (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            
            {/* Sidebar File Tree */}
            <div className="w-full md:w-72 bg-[#11100F] border-r border-white/10 p-4 overflow-y-auto shrink-0">
              <span className="text-[9px] uppercase font-light text-stone-400 tracking-[0.25em] block mb-3 px-2">
                Struktur Proyek PHP:
              </span>

              <div className="space-y-1">
                {PHP_PROJECT_FILES.map((file) => {
                  const isSelected = selectedFile.path === file.path;
                  return (
                    <button
                      key={file.path}
                      onClick={() => setSelectedFile(file)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs transition flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-white/10 border border-white/15 text-white font-medium'
                          : 'text-stone-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        {file.filename.endsWith('.sql') ? (
                          <Database className="w-3.5 h-3.5 text-[#8E8271] shrink-0" />
                        ) : file.filename.endsWith('.md') ? (
                          <FileText className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        ) : (
                          <FileCode className="w-3.5 h-3.5 text-[#8E8271] shrink-0" />
                        )}
                        <span className="truncate font-light text-[11px]">{file.path}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Security Badges */}
              <div className="mt-6 p-3 rounded-xl bg-white/5 border border-white/10 text-[11px] text-stone-400 space-y-2">
                <div className="flex items-center gap-1.5 text-stone-300 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#8E8271]" />
                  <span>Fitur Keamanan Aktif</span>
                </div>
                <p className="text-[10px] font-light leading-relaxed">
                  ✓ Prepared Statements PDO (Anti SQL Injection)<br/>
                  ✓ password_hash() Bcrypt<br/>
                  ✓ $_SESSION Redirect Preservation<br/>
                  ✓ Sanitasi filter_var()
                </p>
              </div>
            </div>

            {/* Code Viewer Panel */}
            <div className="flex-1 flex flex-col overflow-hidden bg-[#0A0A0A]">
              
              {/* File Info Bar */}
              <div className="p-3 sm:px-6 bg-[#11100F] border-b border-white/10 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-[#E5E1DA] font-semibold">
                      {selectedFile.path}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider bg-white/10 text-stone-300 px-2 py-0.5 rounded">
                      {selectedFile.language.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400 font-light mt-0.5">
                    {selectedFile.description}
                  </p>
                </div>

                <button
                  onClick={handleCopyCode}
                  className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-light transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-stone-200" />
                      <span className="text-stone-200 font-medium">Tersalin!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-stone-300" />
                      <span>Salin Kode</span>
                    </>
                  )}
                </button>
              </div>

              {/* Code Pre Box */}
              <div className="flex-1 overflow-auto p-4 sm:p-6 font-mono text-xs leading-relaxed text-stone-300 selection:bg-white/20 selection:text-white">
                <pre className="whitespace-pre">{selectedFile.content}</pre>
              </div>

            </div>
          </div>
        ) : (
          /* Hostinger Deployment Guide Tab */
          <div className="flex-1 overflow-y-auto p-6 sm:p-10 space-y-8 max-w-4xl mx-auto text-xs text-stone-300">
            <div>
              <span className="text-[#8E8271] font-semibold uppercase tracking-[0.35em] text-[10px]">
                Deployment Guide
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-normal text-white mt-1">
                Panduan Memasang Website di Shared Hosting Hostinger
              </h2>
              <p className="text-stone-400 font-light mt-1 text-xs">
                Ikuti 4 langkah mudah berikut untuk mempublikasikan website Senna MUA Gallery &amp; Sekka Design Decoration.
              </p>
            </div>

            {/* Step 1 */}
            <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white text-[#1A1A1A] font-serif font-normal flex items-center justify-center">
                  1
                </div>
                <h3 className="font-serif text-lg font-normal text-white">
                  Buat Database MySQL di hPanel Hostinger
                </h3>
              </div>
              <p className="leading-relaxed text-stone-300 font-light">
                1. Masuk ke <strong>Hostinger hPanel</strong> &gt; Menu <strong>Databases</strong> &gt; <strong>Management</strong>.<br/>
                2. Buat database baru (misal: <code>u12345_senna</code>) dan user database.<br/>
                3. Buka <strong>phpMyAdmin</strong> pada database tersebut.<br/>
                4. Klik tab <strong>Import</strong>, lalu unggah file <code>database.sql</code> (atau salin query SQL dari explorer di tab sebelah).
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white text-[#1A1A1A] font-serif font-normal flex items-center justify-center">
                  2
                </div>
                <h3 className="font-serif text-lg font-normal text-white">
                  Sesuaikan File Konfigurasi Database (<code>config/db.php</code>)
                </h3>
              </div>
              <p className="leading-relaxed text-stone-300 font-light">
                Buka file <code>config/db.php</code> dan masukkan kredensial yang dibuat pada Langkah 1:
              </p>
              <div className="p-3 rounded-lg bg-black/60 font-mono text-[11px] text-stone-200 border border-white/10">
                $host = "localhost";<br/>
                $dbname = "u12345_senna"; // Nama database di Hostinger<br/>
                $username = "u12345_user"; // User database di Hostinger<br/>
                $password = "PasswordRahasiaAnda";
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white text-[#1A1A1A] font-serif font-normal flex items-center justify-center">
                  3
                </div>
                <h3 className="font-serif text-lg font-normal text-white">
                  Upload Seluruh File ke Folder <code>public_html</code>
                </h3>
              </div>
              <p className="leading-relaxed text-stone-300 font-light">
                1. Klik tombol <strong>"Download Full ZIP"</strong> di bagian atas.<br/>
                2. Buka <strong>File Manager</strong> di Hostinger hPanel.<br/>
                3. Masuk ke direktori <code>public_html</code>.<br/>
                4. Upload file ZIP dan ekstrak seluruh isinya ke dalam <code>public_html</code>.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-xl bg-white/5 border border-white/10 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white text-[#1A1A1A] font-serif font-normal flex items-center justify-center">
                  4
                </div>
                <h3 className="font-serif text-lg font-normal text-white">
                  Uji Coba Alur Booking &amp; WhatsApp
                </h3>
              </div>
              <p className="leading-relaxed text-stone-300 font-light">
                Buka domain Anda di browser. Coba klik <strong>"Booking Sekarang"</strong> pada paket <em>Paket Wedding Intimate 17.5 JT</em>. Anda akan diminta login/register terlebih dahulu, lalu secara otomatis sistem mengembalikan sesi dan membuka WhatsApp Admin dengan link pre-filled!
              </p>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
