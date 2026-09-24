# 🚀 Panduan Otomatisasi Deployment GitHub Actions ke Hostinger (Senna Gallery)

Dengan konfigurasi ini, Anda **TIDAK PERLU LAGI**:
- ❌ Download ZIP dari AI Studio / VS Code
- ❌ Ekstrak file secara manual
- ❌ Buka File Manager Hostinger dan upload zip satu per satu

Setiap kali Anda melakukan **`git push origin main`**, server GitHub Actions akan otomatis:
1. Menjalankan `npm run build`
2. Mengompilasi seluruh file React, Tailwind CSS, TypeScript, `.htaccess`, dan `api.php`
3. Mengunggah secara otomatis hanya file yang berubah ke direktori `public_html/` di Hostinger via FTP!

---

## 📋 Langkah 1: Dapatkan Kredensial Akun FTP di Hostinger (hPanel)

1. Masuk ke dashboard **[Hostinger hPanel](https://hpanel.hostinger.com)**.
2. Pilih hosting/domain website Anda (`sennagallery.com` atau domain aktif Anda).
3. Pada bilah pencarian atau menu samping, cari menu **"Akun FTP" (FTP Accounts)**.
4. Di halaman Akun FTP, Anda akan melihat informasi berikut:
   - **FTP IP / Host Name**: (Contoh: `ftp.sennagallery.com` atau alamat IP Hostinger seperti `153.92.xx.xx`)
   - **Username FTP**: (Contoh: `u123456789` atau `senna@sennagallery.com`)
   - **Password FTP**: (Password yang Anda buat untuk akun FTP tersebut)
   - **Port**: `21`
   - **Direktori Utama**: Pastikan mengarah ke `public_html` atau root hosting Anda.

---

## 🔐 Langkah 2: Tambahkan Kredensial ke GitHub Repository Secrets

Agar kredensial FTP Anda tetap **aman dan terlindungi (tidak terlihat oleh publik)**:

1. Buka repository GitHub proyek Senna Gallery Anda di browser.
2. Klik tab **Settings** (di menu atas sebelah kanan).
3. Di panel sebelah kiri, pilih menu **Secrets and variables** ➔ **Actions**.
4. Klik tombol hijau **New repository secret**.
5. Tambahkan 3 Secret berikut (wajib):

| Nama Secret | Nilai / Value | Keterangan |
| :--- | :--- | :--- |
| `FTP_SERVER` | `ftp.domain-anda.com` / `153.92.xx.xx` | IP atau Hostname FTP dari Hostinger |
| `FTP_USERNAME` | `u123456789` | Username Akun FTP Hostinger |
| `FTP_PASSWORD` | `Password_FTP_Anda` | Password Akun FTP Hostinger |

*(Opsional jika menggunakan subfolder atau port khusus)*:
- `FTP_SERVER_DIR` = `public_html/`
- `FTP_PORT` = `21`

---

## ⚡ Langkah 3: Cara Menggunakannya (Workflow Otomatis)

File workflow sudah terpasang di dalam proyek Anda pada path:
`.github/workflows/deploy.yml`

Sekarang, setiap kali Anda selesai melakukan perubahan kode:
```bash
git add .
git commit -m "Update fitur katalog dan tampilan website"
git push origin main
```

### 🔍 Cara Melihat Proses Deployment:
1. Buka tab **Actions** di GitHub repository Anda.
2. Anda akan melihat workflow **"🚀 Auto Deploy Senna Gallery to Hostinger"** sedang berjalan.
3. Dalam kurun waktu **± 1 sampai 2 menit**, workflow akan centang hijau ✅.
4. Buka website Anda di browser, perubahan langsung online secara instan!

---

## 💡 Tips & Keuntungan
- **Smart Delta Sync**: Tindakan FTP ini hanya mengunggah file yang mengalami perubahan (tidak mengupload ulang file yang sama), sehingga proses update sangat cepat (hitungan detik).
- **Semua Aset Siap Pakai**: File `.htaccess` dan endpoint sinkronisasi `api.php` otomatis ikut terdistribusi dengan benar.
