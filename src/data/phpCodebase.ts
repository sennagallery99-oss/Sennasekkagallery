import { PhpFileItem } from '../types';

export const PHP_PROJECT_FILES: PhpFileItem[] = [
  {
    filename: 'database.sql',
    path: 'database.sql',
    language: 'sql',
    description: 'Skema Database MySQL untuk Hostinger phpMyAdmin (Tabel Users & Bookings)',
    content: `-- ==========================================================
-- DATABASE: Senna MUA Gallery & Sekka Design Decoration
-- Hostinger phpMyAdmin SQL Dump
-- ==========================================================

CREATE DATABASE IF NOT EXISTS \`senna_gallery_db\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`senna_gallery_db\`;

-- --------------------------------------------------------
-- 1. Struktur Tabel \`users\`
-- Menyimpan data akun pengguna dengan password ter-hash (Bcrypt)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`users\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`email_hp\` VARCHAR(100) NOT NULL UNIQUE,
  \`password\` VARCHAR(255) NOT NULL,
  \`nama_lengkap\` VARCHAR(150) NULL DEFAULT 'Calon Pengantin',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- 2. (Opsional) Struktur Tabel \`bookings\`
-- Menyimpan log history riwayat klik booking paket ke WhatsApp
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS \`bookings\` (
  \`id\` INT(11) NOT NULL AUTO_INCREMENT,
  \`user_id\` INT(11) NOT NULL,
  \`package_id\` VARCHAR(100) NOT NULL,
  \`package_name\` VARCHAR(200) NOT NULL,
  \`price\` VARCHAR(100) NOT NULL,
  \`status\` VARCHAR(50) DEFAULT 'Menghubungi Admin WA',
  \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`id\`),
  CONSTRAINT \`fk_bookings_users\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\` (\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Data Dummy Pengguna Contoh (Password: admin1234)
-- Hash generated using password_hash('admin1234', PASSWORD_BCRYPT)
-- --------------------------------------------------------
INSERT INTO \`users\` (\`id\`, \`email_hp\`, \`password\`, \`nama_lengkap\`) VALUES
(1, 'sennagallery99@gmail.com', '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm', 'Senna Admin'),
(2, '081234567890', '$2y$10$TKh8H1.PfQx37YgCzwiKb.KjNyWgaHb9cbcoQgdIVFlYg7B77UdFm', 'Calon Pengantin Bahagia')
ON DUPLICATE KEY UPDATE \`email_hp\`=\`email_hp\`;
`
  },
  {
    filename: 'db.php',
    path: 'config/db.php',
    language: 'php',
    description: 'Koneksi Database PDO dengan Proteksi SQL Injection & Error Handling',
    content: `<?php
/**
 * Konfigurasi Koneksi Database MySQL (PDO)
 * File: config/db.php
 * Sesuai untuk Shared Hosting Hostinger (cPanel / hPanel)
 */

$host     = "localhost"; // Pada Hostinger biasanya 'localhost'
$dbname   = "senna_gallery_db"; // Ganti dengan nama database di hPanel
$username = "root"; // Ganti dengan database user di hPanel
$password = ""; // Ganti dengan database password di hPanel

try {
    // Menggunakan PDO untuk keamanan ekstra dan prepared statements anti SQL Injection
    $pdo = new PDO(
        "mysql:host={$host};dbname={$dbname};charset=utf8mb4",
        $username,
        $password,
        [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ]
    );
} catch (PDOException $e) {
    // Jika koneksi gagal, hentikan proses dan tampilkan pesan error ramah
    die("Koneksi database gagal: " . htmlspecialchars($e->getMessage()));
}
?>`
  },
  {
    filename: 'auth.php',
    path: 'auth.php',
    language: 'php',
    description: 'Logika Login & Register Native PHP dengan Password Hashing & Redirect Memory',
    content: `<?php
/**
 * File: auth.php
 * Memproses pendaftaran (Register) dan Masuk (Login) secara aman
 * Menggunakan session PHP, password_hash(), filter_var(), dan prepared statements
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/config/db.php';

// Ambil parameter redirect jika ada (misal redirect ke packages.php?package=wedding-ekonomis-15-5jt)
$redirect_url = isset($_POST['redirect']) && !empty($_POST['redirect']) 
    ? filter_var($_POST['redirect'], FILTER_SANITIZE_URL) 
    : 'packages.php';

// Cek action: apakah 'login' atau 'register'
$action = isset($_POST['action']) ? trim($_POST['action']) : '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    
    // Tangkap & bersihkan input untuk mencegah XSS dan SQL Injection
    $email_hp = isset($_POST['email_hp']) ? trim($_POST['email_hp']) : '';
    $password = isset($_POST['password']) ? trim($_POST['password']) : '';
    $nama_lengkap = isset($_POST['nama_lengkap']) ? trim($_POST['nama_lengkap']) : 'Pengantin';

    // Validasi dasar
    if (empty($email_hp) || empty($password)) {
        $_SESSION['error_msg'] = "Email/No HP dan Password wajib diisi!";
        header("Location: login.php?redirect=" . urlencode($redirect_url));
        exit;
    }

    // ----------------------------------------------------
    // PROSES REGISTER (PENDAFTARAN)
    // ----------------------------------------------------
    if ($action === 'register') {
        if (strlen($password) < 6) {
            $_SESSION['error_msg'] = "Password minimal 6 karakter demi keamanan!";
            header("Location: login.php?action=register&redirect=" . urlencode($redirect_url));
            exit;
        }

        // Cek apakah Email / No HP sudah terdaftar
        $stmt_check = $pdo->prepare("SELECT id FROM users WHERE email_hp = :email_hp LIMIT 1");
        $stmt_check->execute([':email_hp' => $email_hp]);
        
        if ($stmt_check->rowCount() > 0) {
            $_SESSION['error_msg'] = "Email atau Nomor HP sudah terdaftar. Silakan login langsung.";
            header("Location: login.php?redirect=" . urlencode($redirect_url));
            exit;
        }

        // Hash password menggunakan BCRYPT standar industri
        $hashed_password = password_hash($password, PASSWORD_BCRYPT);

        // Simpan ke database dengan Prepared Statements (Anti SQL Injection)
        $stmt_insert = $pdo->prepare("INSERT INTO users (email_hp, password, nama_lengkap) VALUES (:email_hp, :password, :nama)");
        $saved = $stmt_insert->execute([
            ':email_hp' => $email_hp,
            ':password' => $hashed_password,
            ':nama'     => $nama_lengkap
        ]);

        if ($saved) {
            $user_id = $pdo->lastInsertId();
            
            // Set Sesi Pengguna
            $_SESSION['user'] = [
                'id'          => $user_id,
                'email_hp'    => $email_hp,
                'nama_lengkap'=> $nama_lengkap
            ];

            $_SESSION['success_msg'] = "Pendaftaran berhasil! Selamat datang di Senna Gallery.";
            
            // REDIRECT OTOMATIS ke halaman paket yang dituju sebelumnya!
            header("Location: " . $redirect_url);
            exit;
        } else {
            $_SESSION['error_msg'] = "Terjadi kesalahan saat pendaftaran. Silakan coba lagi.";
            header("Location: login.php?action=register&redirect=" . urlencode($redirect_url));
            exit;
        }
    }

    // ----------------------------------------------------
    // PROSES LOGIN (MASUK)
    // ----------------------------------------------------
    if ($action === 'login') {
        // Ambil data user berdasarkan email_hp
        $stmt_login = $pdo->prepare("SELECT id, email_hp, password, nama_lengkap FROM users WHERE email_hp = :email_hp LIMIT 1");
        $stmt_login->execute([':email_hp' => $email_hp]);
        $user = $stmt_login->fetch();

        // Verifikasi password hash menggunakan password_verify()
        if ($user && password_verify($password, $user['password'])) {
            // Set Sesi Login
            $_SESSION['user'] = [
                'id'          => $user['id'],
                'email_hp'    => $user['email_hp'],
                'nama_lengkap'=> $user['nama_lengkap'] ?: 'Pengantin'
            ];

            $_SESSION['success_msg'] = "Login berhasil! Melanjutkan booking...";

            // REDIRECT OTOMATIS ke halaman paket yang disimpan
            header("Location: " . $redirect_url);
            exit;
        } else {
            $_SESSION['error_msg'] = "Email/No HP atau Password salah!";
            header("Location: login.php?redirect=" . urlencode($redirect_url));
            exit;
        }
    }
}

// Default fallback jika diakses langsung tanpa POST
header("Location: index.php");
exit;
?>`
  },
  {
    filename: 'logout.php',
    path: 'logout.php',
    language: 'php',
    description: 'Menghapus Sesi Login dan Redirect ke Beranda',
    content: `<?php
/**
 * File: logout.php
 * Mengakhiri sesi login pengguna dan membersihkan cookies sesi
 */
session_start();
$_SESSION = array();

if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000,
        $params["path"], $params["domain"],
        $params["secure"], $params["httponly"]
    );
}

session_destroy();
header("Location: index.php?msg=logout_success");
exit;
?>`
  },
  {
    filename: 'header.php',
    path: 'includes/header.php',
    language: 'php',
    description: 'Header Navigasi Elegan & Responsive dengan Status Login Pengguna',
    content: `<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
$isLoggedIn = isset($_SESSION['user']);
$currentUser = $isLoggedIn ? $_SESSION['user'] : null;
$currentPage = basename($_SERVER['PHP_SELF']);
?>
<!DOCTYPE html>
<html lang="id" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo isset($pageTitle) ? $pageTitle . " | " : ""; ?>Senna MUA Gallery & Sekka Design Decoration</title>
    
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
      tailwind.config = {
        theme: {
          extend: {
            colors: {
              gold: {
                50: '#FDFBF7',
                100: '#FAF5EA',
                200: '#F4E7CC',
                300: '#EAD3A3',
                400: '#DFBD75',
                500: '#D4AF37',
                600: '#B8860B',
                700: '#8C6608',
                800: '#664B07',
                900: '#402E04',
              },
              luxury: {
                dark: '#1C1917',
                creme: '#FAF8F5',
                gold: '#D4AF37'
              }
            },
            fontFamily: {
              serif: ['Cormorant Garamond', 'Georgia', 'serif'],
              sans: ['Plus Jakarta Sans', 'Helvetica Neue', 'Helvetica', 'Arial', 'sans-serif'],
            }
          }
        }
      }
    </script>
    
    <!-- Google Fonts: Cormorant Garamond & Plus Jakarta Sans -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Lucide Icons -->
    <script src="https://unpkg.com/lucide@latest"></script>

    <style>
      .gold-gradient-text {
        background: linear-gradient(135deg, #B8860B 0%, #D4AF37 50%, #C5A059 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      .gold-gradient-bg {
        background: linear-gradient(135deg, #B8860B 0%, #D4AF37 50%, #C5A059 100%);
      }
    </style>
</head>
<body class="bg-[#FAF8F5] text-[#2C2724] font-sans antialiased selection:bg-gold-500/20 selection:text-gold-700">

<!-- TOP NOTIFICATION BAR -->
<div class="bg-[#1C1917] text-white/80 text-xs py-2 px-4 border-b border-white/10 text-center flex items-center justify-between">
    <div class="hidden sm:block container mx-auto text-xs text-stone-300">
        ✨ Promo Spesial Wedding 2026: Free Ring Box Terrarium & Hand Bouquet Fresh Rose!
    </div>
    <div class="container mx-auto flex justify-between sm:justify-end items-center gap-6">
        <a href="https://wa.me/6282122030072" target="_blank" class="hover:text-gold-400 flex items-center gap-1.5 transition">
            <i data-lucide="phone" class="w-3.5 h-3.5 text-gold-400"></i> Hotline Admin: +62 821-2203-0072
        </a>
        <a href="https://instagram.com" target="_blank" class="hover:text-gold-400 flex items-center gap-1 transition">
            <i data-lucide="instagram" class="w-3.5 h-3.5 text-gold-400"></i> @sennamuagallery
        </a>
    </div>
</div>

<!-- MAIN NAVBAR -->
<nav class="sticky top-0 z-50 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#EAD3A3]/40 transition-all duration-300">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-20">
            <!-- BRAND LOGO -->
            <a href="index.php" class="flex flex-col group">
                <span class="font-serif text-2xl sm:text-3xl font-bold tracking-wider text-[#1C1917] group-hover:text-gold-600 transition">
                    SENNA <span class="font-light italic text-gold-600">&</span> SEKKA
                </span>
                <span class="text-[10px] tracking-[0.25em] uppercase text-stone-500 font-medium">
                    MUA Gallery & Design Decoration
                </span>
            </a>

            <!-- DESKTOP MENU -->
            <div class="hidden md:flex items-center space-x-8 text-sm font-medium">
                <a href="index.php" class="<?php echo ($currentPage == 'index.php') ? 'text-gold-600 font-semibold border-b-2 border-gold-500 pb-1' : 'text-stone-700 hover:text-gold-600 transition'; ?>">Beranda</a>
                <a href="index.php#about" class="text-stone-700 hover:text-gold-600 transition">Tentang Kami</a>
                <a href="index.php#services" class="text-stone-700 hover:text-gold-600 transition">Layanan</a>
                <a href="index.php#gallery" class="text-stone-700 hover:text-gold-600 transition">Galeri</a>
                <a href="packages.php" class="<?php echo ($currentPage == 'packages.php') ? 'text-gold-600 font-semibold border-b-2 border-gold-500 pb-1' : 'text-stone-700 hover:text-gold-600 transition'; ?>">Daftar Paket</a>
            </div>

            <!-- AUTH & CTA BUTTONS -->
            <div class="hidden md:flex items-center space-x-4">
                <?php if ($isLoggedIn): ?>
                    <a href="dashboard.php" class="flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-full border border-gold-300 text-stone-800 bg-gold-50 hover:bg-gold-100 transition">
                        <i data-lucide="user-check" class="w-4 h-4 text-gold-600"></i>
                        <span>Halo, <?php echo htmlspecialchars($currentUser['nama_lengkap'] ?: $currentUser['email_hp']); ?></span>
                    </a>
                    <a href="logout.php" class="text-xs text-stone-500 hover:text-red-600 transition flex items-center gap-1">
                        <i data-lucide="log-out" class="w-3.5 h-3.5"></i> Keluar
                    </a>
                <?php else: ?>
                    <a href="login.php?redirect=<?php echo urlencode($_SERVER['REQUEST_URI']); ?>" class="text-xs font-semibold px-4 py-2.5 rounded-full border border-stone-300 text-stone-700 hover:border-gold-500 hover:text-gold-600 transition">
                        Masuk / Daftar
                    </a>
                <?php endif; ?>

                <a href="packages.php" class="gold-gradient-bg text-white text-xs font-semibold px-5 py-2.5 rounded-full shadow-md hover:shadow-lg hover:opacity-95 transition flex items-center gap-2">
                    <i data-lucide="calendar" class="w-4 h-4"></i>
                    <span>Booking Paket</span>
                </a>
            </div>

            <!-- MOBILE MENU TOGGLE -->
            <div class="md:hidden flex items-center">
                <button id="mobileMenuBtn" type="button" class="p-2 rounded-md text-stone-700 hover:text-gold-600 focus:outline-none">
                    <i data-lucide="menu" class="w-6 h-6"></i>
                </button>
            </div>
        </div>
    </div>

    <!-- MOBILE DROPDOWN -->
    <div id="mobileMenu" class="hidden md:hidden bg-[#FAF8F5] border-t border-gold-200 px-4 pt-3 pb-6 space-y-3">
        <a href="index.php" class="block py-2 text-stone-700 font-medium hover:text-gold-600">Beranda</a>
        <a href="index.php#about" class="block py-2 text-stone-700 font-medium hover:text-gold-600">Tentang Kami</a>
        <a href="index.php#services" class="block py-2 text-stone-700 font-medium hover:text-gold-600">Layanan</a>
        <a href="index.php#gallery" class="block py-2 text-stone-700 font-medium hover:text-gold-600">Galeri</a>
        <a href="packages.php" class="block py-2 text-gold-600 font-semibold">Daftar Paket & Harga</a>
        <div class="pt-3 border-t border-stone-200">
            <?php if ($isLoggedIn): ?>
                <a href="dashboard.php" class="block py-2 text-sm text-stone-800 font-medium">Dashboard Akun (<?php echo htmlspecialchars($currentUser['nama_lengkap']); ?>)</a>
                <a href="logout.php" class="block py-2 text-sm text-red-600">Keluar Sesi</a>
            <?php else: ?>
                <a href="login.php?redirect=<?php echo urlencode($_SERVER['REQUEST_URI']); ?>" class="block py-2 text-gold-700 font-semibold">Masuk / Daftar Akun</a>
            <?php endif; ?>
        </div>
    </div>
</nav>

<script>
  // Script Toggle Mobile Menu
  document.addEventListener('DOMContentLoaded', function() {
    const btn = document.getElementById('mobileMenuBtn');
    const menu = document.getElementById('mobileMenu');
    if(btn && menu) {
      btn.addEventListener('click', function() {
        menu.classList.toggle('hidden');
      });
    }
  });
</script>
`
  },
  {
    filename: 'footer.php',
    path: 'includes/footer.php',
    language: 'php',
    description: 'Footer Mewah dengan Informasi Kontak, Jam Buka, dan Tautan Cepat',
    content: `<?php
/**
 * File: includes/footer.php
 */
?>
<!-- FOOTER -->
<footer class="bg-[#1C1917] text-stone-300 pt-16 pb-12 border-t border-white/10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <!-- Brand & Bio -->
            <div class="md:col-span-1 space-y-4">
                <h3 class="font-serif text-2xl font-bold text-white tracking-wide">
                    SENNA <span class="text-gold-400 font-light italic">&</span> SEKKA
                </h3>
                <p class="text-xs leading-relaxed text-stone-400">
                    Vendor pernikahan profesional terkemuka yang menghadirkan sentuhan makeup pengantin bernilai seni tinggi serta dekorasi pelaminan modern yang sakral & megah.
                </p>
                <div class="flex items-center space-x-3 pt-2">
                    <a href="https://instagram.com/senna_mua_gallery" target="_blank" class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gold-400 hover:bg-gold-500 hover:text-white transition">
                        <i data-lucide="instagram" class="w-4 h-4"></i>
                    </a>
                    <a href="https://wa.me/6282279672876" target="_blank" class="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gold-400 hover:bg-gold-500 hover:text-white transition">
                        <i data-lucide="phone" class="w-4 h-4"></i>
                    </a>
                </div>
            </div>

            <!-- Quick Links -->
            <div>
                <h4 class="font-serif text-lg text-white font-semibold mb-4 border-b border-gold-500/30 pb-2 inline-block">Navigasi Utama</h4>
                <ul class="space-y-2 text-xs text-stone-400">
                    <li><a href="index.php" class="hover:text-gold-400 transition">Beranda Utama</a></li>
                    <li><a href="index.php#about" class="hover:text-gold-400 transition">Tentang Senna & Sekka</a></li>
                    <li><a href="index.php#services" class="hover:text-gold-400 transition">Layanan Wedding</a></li>
                    <li><a href="index.php#gallery" class="hover:text-gold-400 transition">Galeri Portofolio</a></li>
                    <li><a href="packages.php" class="hover:text-gold-400 transition">Daftar Paket & Promo</a></li>
                </ul>
            </div>

            <!-- Layanan Kami -->
            <div>
                <h4 class="font-serif text-lg text-white font-semibold mb-4 border-b border-gold-500/30 pb-2 inline-block">Layanan Kami</h4>
                <ul class="space-y-2 text-xs text-stone-400">
                    <li>Makeup Pengantin (Akad & Resepsi)</li>
                    <li>Dekorasi Pelaminan & Wedding Stage</li>
                    <li>Sewa Gaun & Kebaya Pengantin</li>
                    <li>Paket All-in-One Intimate Wedding</li>
                    <li>Make Up Wisuda & Prewedding</li>
                </ul>
            </div>

            <!-- Kontak & Alamat -->
            <div>
                <h4 class="font-serif text-lg text-white font-semibold mb-4 border-b border-gold-500/30 pb-2 inline-block">Galeri & Studio</h4>
                <p class="text-xs text-stone-400 mb-3 flex items-start gap-2">
                    <i data-lucide="map-pin" class="w-4 h-4 text-gold-400 shrink-0 mt-0.5"></i>
                    <span>Studio Senna Gallery, Jl. RA basyid, Gg Kemuning 2 No 28, Labuhan Dalam, Tanjung Senang, Kota Bandar Lampung (Buka Setiap Hari: 09.00 - 20.00 WIB)</span>
                </p>
                <p class="text-xs text-stone-400 mb-4 flex items-center gap-2">
                    <i data-lucide="message-circle" class="w-4 h-4 text-gold-400 shrink-0"></i>
                    <span>WhatsApp Admin: 0822-7967-2876</span>
                </p>
                <a href="https://wa.me/6282279672876" target="_blank" class="inline-block gold-gradient-bg text-white text-xs font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition">
                    Chat WhatsApp Admin Sekarang
                </a>
            </div>
        </div>

        <div class="pt-8 border-t border-white/10 text-center text-xs text-stone-500 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p>&copy; <?php echo date('Y'); ?> Senna MUA Gallery & Sekka Design Decoration. All rights reserved.</p>
            <p class="text-stone-400">Crafted for High-End Wedding Experiences.</p>
        </div>
    </div>
</footer>

<!-- Inisialisasi Ikon Lucide -->
<script>
    lucide.createIcons();
</script>
</body>
</html>
`
  },
  {
    filename: 'index.php',
    path: 'index.php',
    language: 'php',
    description: 'Halaman Utama dengan Background Video Cinematic, Hero, About, Galeri, dan CTA',
    content: `<?php
/**
 * File: index.php
 * Halaman Utama (Home) Senna MUA Gallery & Sekka Design Decoration
 */
$pageTitle = "Beranda | Vendor Pernikahan Mewah";
require_once __DIR__ . '/includes/header.php';
?>

<!-- 1. HERO SECTION DENGAN CINEMATIC VIDEO BACKGROUND -->
<section class="relative h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-black">
    <!-- Video Background Cinematic Pendek -->
    <video autoplay muted loop playsinline poster="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1920&q=80" class="absolute inset-0 w-full h-full object-cover opacity-60">
        <source src="https://assets.mixkit.co/videos/preview/mixkit-bride-putting-on-her-wedding-dress-41857-large.mp4" type="video/mp4">
        Your browser does not support the video tag.
    </video>

    <!-- Dark & Gold Gradient Overlay -->
    <div class="absolute inset-0 bg-gradient-to-t from-[#1C1917] via-black/50 to-black/60"></div>

    <!-- Hero Content -->
    <div class="relative z-10 max-w-4xl mx-auto px-4 text-center text-white">
        <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-gold-400/40 text-gold-300 text-xs font-semibold uppercase tracking-widest mb-6">
            <i data-lucide="sparkles" class="w-3.5 h-3.5 text-gold-400"></i>
            <span>Exclusive Wedding Vendor 2026</span>
        </div>

        <h1 class="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
            Wujudkan Pernikahan Impian <br/>
            <span class="gold-gradient-text italic font-normal">Penuh Keanggunan & Kemegahan</span>
        </h1>

        <p class="text-stone-200 text-sm sm:text-lg max-w-2xl mx-auto font-light leading-relaxed mb-10">
            Perpaduan harmonis riasan makeup pengantin flawless berkelas dunia oleh <strong class="text-gold-300">Senna MUA</strong> serta dekorasi pelaminan megah & estetik oleh <strong class="text-gold-300">Sekka Design</strong>.
        </p>

        <div class="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="packages.php" class="w-full sm:w-auto gold-gradient-bg text-white font-semibold text-sm px-8 py-4 rounded-full shadow-lg hover:shadow-gold-500/30 hover:scale-105 transition-all flex items-center justify-center gap-2">
                <span>Lihat Daftar Paket</span>
                <i data-lucide="arrow-right" class="w-4 h-4"></i>
            </a>
            
            <a href="https://wa.me/6282279672876?text=Halo%20Admin,%20saya%20tertarik%20konsultasi%20paket%20wedding%20Senna%20MUA%20dan%20Sekka%20Design" target="_blank" class="w-full sm:w-auto bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white font-semibold text-sm px-8 py-4 rounded-full transition-all flex items-center justify-center gap-2">
                <i data-lucide="message-circle" class="w-4 h-4 text-gold-400"></i>
                <span>Konsultasi WhatsApp</span>
            </a>
        </div>
    </div>

    <!-- Scroll Down Indicator -->
    <div class="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/60 animate-bounce flex flex-col items-center">
        <span class="text-[10px] tracking-widest uppercase mb-1">Scroll</span>
        <i data-lucide="chevron-down" class="w-4 h-4"></i>
    </div>
</section>

<!-- 2. ABOUT US SECTION -->
<section id="about" class="py-24 bg-[#FAF8F5]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <!-- Image Montage -->
            <div class="relative">
                <div class="relative z-10 rounded-2xl overflow-hidden shadow-2xl border-4 border-white">
                    <img src="https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80" alt="Senna MUA & Sekka Design" class="w-full h-[450px] object-cover">
                </div>
                <div class="absolute -bottom-8 -right-6 z-20 w-48 sm:w-64 rounded-xl overflow-hidden shadow-xl border-4 border-white hidden sm:block">
                    <img src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=500&q=80" alt="Makeup Detail" class="w-full h-48 object-cover">
                </div>
                <div class="absolute -top-6 -left-6 w-32 h-32 bg-gold-200/50 rounded-full blur-2xl"></div>
            </div>

            <!-- Text Content -->
            <div class="space-y-6">
                <div class="inline-block text-gold-600 font-semibold text-xs tracking-widest uppercase border-b border-gold-500 pb-1">
                    Tentang Kami
                </div>
                
                <h2 class="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1C1917] leading-tight">
                    Seni Rias Wajah & Keindahan Tata Ruang yang Tak Terlupakan
                </h2>

                <p class="text-stone-600 text-sm sm:text-base leading-relaxed">
                    <strong>Senna MUA Gallery & Sekka Design Decoration</strong> adalah kolaborasi dua maestro pernikahan yang berdedikasi menciptakan momen sakral terindah dalam hidup Anda.
                </p>

                <p class="text-stone-600 text-sm sm:text-base leading-relaxed">
                    Dengan pengalaman lebih dari 8 tahun, kami memahami bahwa setiap pasangan memiliki keunikan tersendiri. Kami menggabungkan riasan wajah yang tahan 12+ jam, tata busana adat dan modern yang presisi, serta dekorasi pelaminan tematik yang memukau tamu undangan.
                </p>

                <!-- Key Metrics Grid -->
                <div class="grid grid-cols-3 gap-4 pt-4 border-t border-stone-200">
                    <div>
                        <span class="font-serif text-3xl font-bold text-gold-600">500+</span>
                        <p class="text-xs text-stone-500 mt-1">Pengantin Bahagia</p>
                    </div>
                    <div>
                        <span class="font-serif text-3xl font-bold text-gold-600">8+</span>
                        <p class="text-xs text-stone-500 mt-1">Tahun Pengalaman</p>
                    </div>
                    <div>
                        <span class="font-serif text-3xl font-bold text-gold-600">100%</span>
                        <p class="text-xs text-stone-500 mt-1">Kepuasan Klien</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- 3. SERVICES HIGHLIGHT SECTION -->
<section id="services" class="py-24 bg-white border-y border-stone-200">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-2xl mx-auto mb-16">
            <span class="text-gold-600 text-xs font-semibold uppercase tracking-widest">Layanan Unggulan</span>
            <h2 class="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mt-2">Harmoni Sempurna untuk Hari Bahagia Anda</h2>
            <p class="text-stone-500 text-sm mt-3">Layanan terintegrasi mulai dari riasan, dekorasi pelaminan, hingga penyewaan busana pengantin.</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <!-- Service 1: MUA -->
            <div class="bg-[#FAF8F5] rounded-2xl p-8 border border-stone-200 hover:shadow-xl transition-all duration-300 group">
                <div class="w-14 h-14 rounded-xl gold-gradient-bg text-white flex items-center justify-center mb-6 group-hover:scale-110 transition">
                    <i data-lucide="sparkles" class="w-7 h-7"></i>
                </div>
                <h3 class="font-serif text-2xl font-bold text-stone-900 mb-3">Senna MUA Gallery</h3>
                <p class="text-stone-600 text-xs leading-relaxed mb-6">
                    Riasan pengantin flawless, tahan lama, dan menonjolkan kecantikan alami Anda. Spesialis Tradisional Adat (Sunda Siger, Solo Basahan) & Modern Soft Glam.
                </p>
                <ul class="text-xs text-stone-500 space-y-2 mb-6">
                    <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-gold-500"></i> Complexion Tahan 12+ Jam</li>
                    <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-gold-500"></i> Kosmetik High-End Dunia</li>
                    <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-gold-500"></i> Free Touch-up Standby</li>
                </ul>
                <a href="packages.php?cat=mua" class="text-gold-600 font-semibold text-xs flex items-center gap-1 hover:gap-2 transition">
                    Lihat Paket MUA <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
                </a>
            </div>

            <!-- Service 2: Decoration -->
            <div class="bg-[#FAF8F5] rounded-2xl p-8 border border-stone-200 hover:shadow-xl transition-all duration-300 group">
                <div class="w-14 h-14 rounded-xl gold-gradient-bg text-white flex items-center justify-center mb-6 group-hover:scale-110 transition">
                    <i data-lucide="palette" class="w-7 h-7"></i>
                </div>
                <h3 class="font-serif text-2xl font-bold text-stone-900 mb-3">Sekka Design Decoration</h3>
                <p class="text-stone-600 text-xs leading-relaxed mb-6">
                    Dekorasi pelaminan eksklusif dengan sentuhan seni tata bunga fresh & artificial bermutu tinggi, tata lampu warm ambience, serta photo booth yang estetik.
                </p>
                <ul class="text-xs text-stone-500 space-y-2 mb-6">
                    <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-gold-500"></i> Pelaminan Custom 3D Theme</li>
                    <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-gold-500"></i> Lighting Ambience Mewah</li>
                    <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-gold-500"></i> Fresh & Artificial Floral</li>
                </ul>
                <a href="packages.php?cat=decor" class="text-gold-600 font-semibold text-xs flex items-center gap-1 hover:gap-2 transition">
                    Lihat Paket Dekorasi <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
                </a>
            </div>

            <!-- Service 3: Wedding Package -->
            <div class="bg-[#FAF8F5] rounded-2xl p-8 border border-stone-200 hover:shadow-xl transition-all duration-300 group">
                <div class="w-14 h-14 rounded-xl gold-gradient-bg text-white flex items-center justify-center mb-6 group-hover:scale-110 transition">
                    <i data-lucide="crown" class="w-7 h-7"></i>
                </div>
                <h3 class="font-serif text-2xl font-bold text-stone-900 mb-3">Paket All-in-One Wedding</h3>
                <p class="text-stone-600 text-xs leading-relaxed mb-6">
                    Solusi komplit tanpa pusing! Sudah mencakup riasan pengantin, dekorasi pelaminan, sewa gaun pengantin, rias orang tua, dan pernak-pernik pendukung.
                </p>
                <ul class="text-xs text-stone-500 space-y-2 mb-6">
                    <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-gold-500"></i> Hemat Hingga Jutaan Rupiah</li>
                    <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-gold-500"></i> Koordinasi Satu Pintu</li>
                    <li class="flex items-center gap-2"><i data-lucide="check" class="w-4 h-4 text-gold-500"></i> Free Bonus Hand Bouquet & Ring Box</li>
                </ul>
                <a href="packages.php" class="text-gold-600 font-semibold text-xs flex items-center gap-1 hover:gap-2 transition">
                    Eksplor Semua Paket <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
                </a>
            </div>
        </div>
    </div>
</section>

<!-- 4. GALLERY HIGHLIGHT -->
<section id="gallery" class="py-24 bg-[#FAF8F5]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
                <span class="text-gold-600 text-xs font-semibold uppercase tracking-widest">Portofolio Karya</span>
                <h2 class="font-serif text-3xl sm:text-4xl font-bold text-stone-900 mt-2">Momen Magis Pasangan Kami</h2>
            </div>
            <a href="packages.php" class="mt-4 md:mt-0 text-sm text-gold-600 font-semibold hover:underline flex items-center gap-1">
                Pilih Paket Wedding Sekarang <i data-lucide="arrow-right" class="w-4 h-4"></i>
            </a>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="group relative rounded-xl overflow-hidden aspect-[3/4] shadow-md">
                <img src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80" alt="MUA Portofolio" class="w-full h-full object-cover group-hover:scale-110 transition duration-500">
                <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition p-4 flex flex-col justify-end text-white">
                    <span class="text-[10px] text-gold-300 font-medium">Senna MUA</span>
                    <h4 class="font-serif text-sm font-bold">Sunda Siger Flawless</h4>
                </div>
            </div>

            <div class="group relative rounded-xl overflow-hidden aspect-[3/4] shadow-md">
                <img src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80" alt="Dekorasi Portofolio" class="w-full h-full object-cover group-hover:scale-110 transition duration-500">
                <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition p-4 flex flex-col justify-end text-white">
                    <span class="text-[10px] text-gold-300 font-medium">Sekka Design</span>
                    <h4 class="font-serif text-sm font-bold">Pelaminan Champagne Gold</h4>
                </div>
            </div>

            <div class="group relative rounded-xl overflow-hidden aspect-[3/4] shadow-md">
                <img src="https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=600&q=80" alt="Intimate Wedding" class="w-full h-full object-cover group-hover:scale-110 transition duration-500">
                <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition p-4 flex flex-col justify-end text-white">
                    <span class="text-[10px] text-gold-300 font-medium">Intimate Package</span>
                    <h4 class="font-serif text-sm font-bold">Akad Nikah Glasshouse</h4>
                </div>
            </div>

            <div class="group relative rounded-xl overflow-hidden aspect-[3/4] shadow-md">
                <img src="https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=600&q=80" alt="Gaun Pengantin" class="w-full h-full object-cover group-hover:scale-110 transition duration-500">
                <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition p-4 flex flex-col justify-end text-white">
                    <span class="text-[10px] text-gold-300 font-medium">Bridal Gown</span>
                    <h4 class="font-serif text-sm font-bold">Ballgown Haute Couture</h4>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- 5. CALL TO ACTION BANNER -->
<section class="py-20 bg-[#1C1917] text-white relative overflow-hidden">
    <div class="max-w-4xl mx-auto px-4 text-center relative z-10">
        <h2 class="font-serif text-3xl sm:text-5xl font-bold mb-6">Konsultasikan Konsep Pernikahan Impian Anda</h2>
        <p class="text-stone-300 text-sm sm:text-base mb-8 max-w-2xl mx-auto">
            Jadwalkan sesi konsultasi dan fitting gratis bersama tim Senna MUA & Sekka Design. Slot tanggal pernikahan 2026 terbatas!
        </p>
        <div class="flex flex-col sm:flex-row justify-center items-center gap-4">
            <a href="packages.php" class="gold-gradient-bg text-white font-semibold text-sm px-8 py-3.5 rounded-full shadow-lg hover:opacity-90 transition">
                Pilih Paket & Booking
            </a>
            <a href="https://wa.me/6282122030072" target="_blank" class="bg-white/10 hover:bg-white/20 border border-white/30 text-white font-semibold text-sm px-8 py-3.5 rounded-full transition flex items-center gap-2">
                <i data-lucide="phone" class="w-4 h-4 text-gold-400"></i>
                <span>Chat Admin WhatsApp</span>
            </a>
        </div>
    </div>
</section>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
`
  },
  {
    filename: 'packages.php',
    path: 'packages.php',
    language: 'php',
    description: 'Halaman Paket & Alur Booking WhatsApp Terautentikasi dengan Redirect Otomatis',
    content: `<?php
/**
 * File: packages.php
 * Menampilkan daftar paket wedding, MUA, dan dekorasi
 * LOGIKA BOOKING PENTING:
 * - Jika sudah login: Tombol "Booking Sekarang" mengarah langsung ke WhatsApp Admin
 * - Jika belum login: Tombol "Booking Sekarang" mengarah ke login.php?redirect=packages.php&package=...
 */
$pageTitle = "Daftar Paket & Harga";
require_once __DIR__ . '/includes/header.php';

// Nomor WhatsApp Admin
$admin_wa = "6282122030072";

// Daftar Dummy Paket
$packages = [
    [
        'id' => 'wedding-ekonomis-15-5jt',
        'name' => 'Paket Wedding Ekonomis',
        'category' => 'wedding',
        'category_label' => 'Paket Lengkap',
        'price' => 'Rp 15.500.000',
        'original_price' => 'Rp 18.000.000',
        'badge' => 'Hemat',
        'tagline' => 'Solusi lengkap & hemat untuk akad dan resepsi berkesan tanpa kompromi kualitas.',
        'image' => 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
        'features' => [
            'Makeup Pengantin Akad & Resepsi (Flawless Premium by Senna Team)',
            'Dekorasi Pelaminan 4-6 Meter Minimalis Modern by Sekka Design',
            '1 Pasang Busana Pengantin Akad & 1 Pasang Resepsi',
            'Makeup & Hijabdo 2 Ibu Pengantin',
            'Standing Flower 2 Unit & Karpet Jalan Permadani',
            'Pundi Uang & Meja Penerima Tamu Lengkap'
        ],
        'bonus' => 'Free Hand Bouquet Fresh & Buku Tamu'
    ],
    [
        'id' => 'wedding-intimate-17-5jt',
        'name' => 'Paket Wedding Intimate',
        'category' => 'wedding',
        'category_label' => 'Best Seller Intimate',
        'price' => 'Rp 17.500.000',
        'original_price' => 'Rp 21.000.000',
        'badge' => 'Paling Populer',
        'tagline' => 'Pilihan favorit pasangan modern untuk perayaan sakral, hangat, dan estetik.',
        'image' => 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=800&q=80',
        'features' => [
            'Makeup Pengantin Spesial Flawless Glam by Senior Artist',
            'Dekorasi Pelaminan Intimate Aesthetic 6-8 Meter (Mix Fresh Flowers)',
            '2 Pasang Busana Pengantin Premium (Akad + Resepsi Modern)',
            'Rias & Busana 2 Pasang Orang Tua + 4 Pagar Ayu',
            'Dekorasi Meja Akad & Backdrop Photo Booth Instagramable',
            'Lighting Ambience Warm Romantic Full Setup'
        ],
        'bonus' => 'Free Sewa Ring Box Akrilik Terrarium & Hand Bouquet Mawar'
    ],
    [
        'id' => 'wedding-royal-luxury-28jt',
        'name' => 'Paket Wedding Royal Luxury',
        'category' => 'wedding',
        'category_label' => 'Luxury Royal',
        'price' => 'Rp 28.000.000',
        'original_price' => 'Rp 34.000.000',
        'badge' => 'Eksklusif VIP',
        'tagline' => 'Kemewahan paripurna dengan sentuhan artistik eksklusif untuk pesta pernikahan megah.',
        'image' => 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=800&q=80',
        'features' => [
            'Makeup Pengantin Direct by Founder (Kak Senna)',
            'Dekorasi Pelaminan Megah 10-12 Meter Full Fresh Flowers',
            'Busana Pengantin Haute Couture & Gaun Resepsi Internasional/Adat',
            'Rias & Busana Lengkap: 2 Orang Tua + 6 Bridesmaids + 6 Groomsmen',
            'Dekorasi Stage Musik, VIP Area, Gazebo Mewah & Photo Gallery',
            'Special Effect: Dry Ice Fog Machine + Sparkular Fountain 4 Titik'
        ],
        'bonus' => 'Free Special Effect Dry Ice Kirab & Sparkular Fountain'
    ],
    [
        'id' => 'mua-jasmine-3jt',
        'name' => 'Paket MUA Jasmine',
        'category' => 'mua',
        'category_label' => 'Rias Pengantin Saja',
        'price' => 'Rp 3.000.000',
        'original_price' => 'Rp 3.500.000',
        'badge' => 'Favorit Akad',
        'tagline' => 'Riasan pengantin natural glowing berkarakter untuk akad nikah atau resepsi sederhana.',
        'image' => 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=800&q=80',
        'features' => [
            'Makeup Pengantin Wanita 1 Look (Akad / Pemberkatan)',
            'Retouch Groom / Pengantin Pria',
            'Hairdo Pengantin atau Hijab Styling Elegan',
            'Softlens Premium & Aksesoris Rambut/Hijab Standar',
            'Free Rias 1 Orang Ibu'
        ],
        'bonus' => 'Free Softlens Natural & Melati Ronce Asli'
    ],
    [
        'id' => 'mua-orchid-4jt',
        'name' => 'Paket MUA Orchid',
        'category' => 'mua',
        'category_label' => 'Rias 2 Sesi',
        'price' => 'Rp 4.000.000',
        'original_price' => 'Rp 4.800.000',
        'badge' => '2 Look Akad & Resepsi',
        'tagline' => 'Paket rias 2 sesi (Akad & Resepsi) dengan perubahan look & touch-up standby.',
        'image' => 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
        'features' => [
            'Makeup Pengantin Wanita 2 Look (Akad + Resepsi)',
            'Retouch Groom / Pengantin Pria 2 Sesi',
            'Standby Tim MUA saat Pergantian Baju',
            'Rias 2 Orang Ibu (Akad & Resepsi)',
            'Rias 2 Orang Saudara Kandung / Bridesmaids',
            'Aksesoris Hijab / Hairdo Eksklusif & Melati Ronce Asli'
        ],
        'bonus' => 'Free 2 Softlens & Nail Art Fake Nails Press-on'
    ],
    [
        'id' => 'decor-pelaminan-sekka-8-5jt',
        'name' => 'Paket Dekorasi Pelaminan Modern',
        'category' => 'decor',
        'category_label' => 'Dekorasi Saja',
        'price' => 'Rp 8.500.000',
        'original_price' => 'Rp 10.000.000',
        'badge' => 'Karya Sekka',
        'tagline' => 'Karya dekorasi estetik by Sekka Design untuk menyulap venue menjadi panggung megah.',
        'image' => 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=800&q=80',
        'features' => [
            'Backdrop Pelaminan 6 Meter (Rustic / White Gold / Pastel)',
            'Set Kursi Pengantin & Kursi Orang Tua Mewah',
            'Kombinasi Bunga Artificial High Grade & Fresh Flowers Accent',
            'Lighting System: Spotlight & Warm Fairy Lights',
            'Dekorasi Pintu Masuk / Welcome Gate',
            'Welcome Signboard Kayu / Akrilik Custom Nama Pengantin'
        ],
        'bonus' => 'Free Welcome Sign Akrilik & Dekor Meja Galeri'
    ]
];
?>

<div class="py-16 bg-[#FAF8F5]">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Flash Alert Sukses Login / Redirect -->
        <?php if(isset($_SESSION['success_msg'])): ?>
            <div class="mb-8 p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-sm flex items-center gap-3">
                <i data-lucide="check-circle" class="w-5 h-5 text-emerald-600 shrink-0"></i>
                <span><?php echo htmlspecialchars($_SESSION['success_msg']); unset($_SESSION['success_msg']); ?></span>
            </div>
        <?php endif; ?>

        <!-- Heading -->
        <div class="text-center max-w-3xl mx-auto mb-14">
            <span class="text-gold-600 text-xs font-semibold tracking-widest uppercase">Paket & Investasi Pernikahan</span>
            <h1 class="font-serif text-3xl sm:text-5xl font-bold text-stone-900 mt-2 mb-4">Pilihan Paket Senna & Sekka</h1>
            <p class="text-stone-600 text-sm sm:text-base leading-relaxed">
                Pilih paket terbaik sesuai kebutuhan dan anggaran Anda. Seluruh paket dapat disesuaikan (customized) saat sesi konsultasi bersama tim kami.
            </p>
        </div>

        <!-- Grid Cards Paket -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <?php foreach ($packages as $pkg): ?>
                <?php
                    // Logika Text WhatsApp
                    $user_name = $isLoggedIn ? $currentUser['nama_lengkap'] : 'Tamu';
                    $wa_text = "Halo Admin Senna MUA & Sekka Design, saya {$user_name} mau booking {$pkg['name']} ({$pkg['price']}). Mohon info ketersediaan tanggal pernikahan kami.";
                    $wa_url = "https://wa.me/{$admin_wa}?text=" . rawurlencode($wa_text);

                    // Logika Redirect jika belum login
                    $current_url = "packages.php?booked=" . urlencode($pkg['id']);
                    $login_redirect_url = "login.php?redirect=" . urlencode($current_url) . "&pkg_name=" . urlencode($pkg['name']);
                ?>
                <div class="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl border border-stone-200 flex flex-col transition-all duration-300 group">
                    <!-- Image with Badge -->
                    <div class="relative h-56 overflow-hidden">
                        <img src="<?php echo $pkg['image']; ?>" alt="<?php echo htmlspecialchars($pkg['name']); ?>" class="w-full h-full object-cover group-hover:scale-105 transition duration-500">
                        <div class="absolute top-4 left-4 bg-[#1C1917]/80 backdrop-blur-md text-gold-300 text-[11px] font-semibold px-3 py-1 rounded-full border border-gold-400/30">
                            <?php echo htmlspecialchars($pkg['category_label']); ?>
                        </div>
                        <?php if(!empty($pkg['badge'])): ?>
                            <div class="absolute top-4 right-4 gold-gradient-bg text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-md">
                                <?php echo htmlspecialchars($pkg['badge']); ?>
                            </div>
                        <?php endif; ?>
                    </div>

                    <!-- Body Content -->
                    <div class="p-6 flex-1 flex flex-col">
                        <h3 class="font-serif text-2xl font-bold text-stone-900 mb-1"><?php echo htmlspecialchars($pkg['name']); ?></h3>
                        <p class="text-xs text-stone-500 mb-4 line-clamp-2"><?php echo htmlspecialchars($pkg['tagline']); ?></p>

                        <!-- Price Section -->
                        <div class="mb-6 p-4 rounded-xl bg-[#FAF8F5] border border-gold-200/60">
                            <span class="text-[11px] text-stone-400 block line-through">Harga Normal: <?php echo $pkg['original_price']; ?></span>
                            <span class="font-serif text-2xl font-bold text-gold-700"><?php echo $pkg['price']; ?></span>
                            <span class="text-[11px] text-stone-500 block mt-0.5">*Sudah termasuk konsultasi & fitting</span>
                        </div>

                        <!-- Feature List -->
                        <div class="space-y-2.5 mb-6 flex-1 text-xs text-stone-600">
                            <p class="font-semibold text-stone-800 uppercase tracking-wider text-[10px]">Fasilitas Termasuk:</p>
                            <?php foreach ($pkg['features'] as $feat): ?>
                                <div class="flex items-start gap-2">
                                    <i data-lucide="check-circle-2" class="w-4 h-4 text-gold-600 shrink-0 mt-0.5"></i>
                                    <span><?php echo htmlspecialchars($feat); ?></span>
                                </div>
                            <?php endforeach; ?>
                        </div>

                        <!-- Bonus Tag -->
                        <?php if(!empty($pkg['bonus'])): ?>
                            <div class="mb-6 p-2.5 rounded-lg bg-gold-50 border border-gold-300 text-[11px] text-gold-800 flex items-center gap-2">
                                <i data-lucide="gift" class="w-4 h-4 text-gold-600 shrink-0"></i>
                                <span><strong>Bonus:</strong> <?php echo htmlspecialchars($pkg['bonus']); ?></span>
                            </div>
                        <?php endif; ?>

                        <!-- Tombol Booking Sekarang (Disesuaikan Sesi Login) -->
                        <?php if ($isLoggedIn): ?>
                            <!-- JIKA SUDAH LOGIN: LANGSUNG KE WHATSAPP ADMIN -->
                            <a href="<?php echo $wa_url; ?>" target="_blank" class="w-full gold-gradient-bg text-white text-center font-semibold text-xs sm:text-sm py-3.5 px-4 rounded-xl shadow hover:shadow-lg hover:opacity-95 transition flex items-center justify-center gap-2">
                                <i data-lucide="message-circle" class="w-4 h-4"></i>
                                <span>Booking Sekarang (via WhatsApp)</span>
                            </a>
                        <?php else: ?>
                            <!-- JIKA BELUM LOGIN: ARAHKAN KE LOGIN.PHP DENGAN URL REDIRECT -->
                            <a href="<?php echo $login_redirect_url; ?>" class="w-full bg-[#1C1917] hover:bg-stone-800 text-white text-center font-semibold text-xs sm:text-sm py-3.5 px-4 rounded-xl shadow transition flex items-center justify-center gap-2">
                                <i data-lucide="lock" class="w-4 h-4 text-gold-400"></i>
                                <span>Login untuk Booking</span>
                            </a>
                        <?php endif; ?>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
`
  },
  {
    filename: 'login.php',
    path: 'login.php',
    language: 'php',
    description: 'Halaman Login & Registrasi Elegan dengan Form Switcher dan Penjaga Redirect',
    content: `<?php
/**
 * File: login.php
 * Halaman Login & Registrasi Simpel
 * Menerima parameter $_GET['redirect'] untuk mengembalikan pengunjung ke paket yang ingin di-booking
 */
$pageTitle = "Masuk / Pendaftaran";
require_once __DIR__ . '/includes/header.php';

// Jika pengguna sudah login, langsung lempar ke redirect atau dashboard
if ($isLoggedIn) {
    $redirect = isset($_GET['redirect']) && !empty($_GET['redirect']) ? $_GET['redirect'] : 'dashboard.php';
    header("Location: " . $redirect);
    exit;
}

$redirect_target = isset($_GET['redirect']) ? htmlspecialchars($_GET['redirect']) : 'packages.php';
$active_tab = isset($_GET['action']) && $_GET['action'] === 'register' ? 'register' : 'login';
?>

<div class="min-h-[80vh] flex items-center justify-center py-16 px-4 bg-[#FAF8F5]">
    <div class="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gold-200/80 p-8 sm:p-10 relative overflow-hidden">
        <!-- Decorative subtle aura -->
        <div class="absolute -top-12 -right-12 w-36 h-36 bg-gold-200/40 rounded-full blur-2xl pointer-events-none"></div>

        <!-- Header -->
        <div class="text-center mb-8">
            <span class="text-gold-600 text-xs font-semibold uppercase tracking-widest">Akun Calon Pengantin</span>
            <h1 class="font-serif text-3xl font-bold text-stone-900 mt-1">Senna & Sekka</h1>
            <p class="text-xs text-stone-500 mt-2">
                Silakan masuk atau daftar untuk melanjutkan proses booking paket pernikahan impian Anda.
            </p>
        </div>

        <!-- Flash Messages (Error / Sukses) -->
        <?php if(isset($_SESSION['error_msg'])): ?>
            <div class="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                <i data-lucide="alert-circle" class="w-4 h-4 text-red-500 shrink-0"></i>
                <span><?php echo htmlspecialchars($_SESSION['error_msg']); unset($_SESSION['error_msg']); ?></span>
            </div>
        <?php endif; ?>

        <!-- Tab Selector: Login vs Register -->
        <div class="flex rounded-xl bg-stone-100 p-1 mb-6 text-xs font-semibold">
            <button type="button" id="tabLoginBtn" class="flex-1 py-2 rounded-lg transition-all text-center <?php echo ($active_tab === 'login') ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-900'; ?>" onclick="switchAuthTab('login')">
                Masuk (Login)
            </button>
            <button type="button" id="tabRegisterBtn" class="flex-1 py-2 rounded-lg transition-all text-center <?php echo ($active_tab === 'register') ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-900'; ?>" onclick="switchAuthTab('register')">
                Daftar Baru
            </button>
        </div>

        <!-- FORM 1: LOGIN -->
        <form id="formLogin" action="auth.php" method="POST" class="space-y-4 <?php echo ($active_tab === 'register') ? 'hidden' : ''; ?>">
            <input type="hidden" name="action" value="login">
            <input type="hidden" name="redirect" value="<?php echo $redirect_target; ?>">

            <div>
                <label class="block text-xs font-medium text-stone-700 mb-1.5">Email atau Nomor WhatsApp / HP</label>
                <div class="relative">
                    <input type="text" name="email_hp" required placeholder="contoh: sennagallery99@gmail.com / 08123456789" class="w-full px-4 py-3 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-gold-500 focus:outline-none">
                </div>
            </div>

            <div>
                <label class="block text-xs font-medium text-stone-700 mb-1.5">Password</label>
                <div class="relative">
                    <input type="password" name="password" required placeholder="Masukkan password Anda" class="w-full px-4 py-3 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-gold-500 focus:outline-none">
                </div>
            </div>

            <button type="submit" class="w-full gold-gradient-bg text-white font-semibold text-xs py-3.5 rounded-xl shadow hover:opacity-95 transition flex items-center justify-center gap-2 mt-2">
                <i data-lucide="log-in" class="w-4 h-4"></i>
                <span>Masuk & Lanjutkan Booking</span>
            </button>
        </form>

        <!-- FORM 2: REGISTER -->
        <form id="formRegister" action="auth.php" method="POST" class="space-y-4 <?php echo ($active_tab === 'login') ? 'hidden' : ''; ?>">
            <input type="hidden" name="action" value="register">
            <input type="hidden" name="redirect" value="<?php echo $redirect_target; ?>">

            <div>
                <label class="block text-xs font-medium text-stone-700 mb-1.5">Nama Lengkap Pasangan / Pengantin</label>
                <input type="text" name="nama_lengkap" required placeholder="contoh: Sarah & Dimas" class="w-full px-4 py-3 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-gold-500 focus:outline-none">
            </div>

            <div>
                <label class="block text-xs font-medium text-stone-700 mb-1.5">Email atau Nomor WhatsApp / HP</label>
                <input type="text" name="email_hp" required placeholder="contoh: 082122030072" class="w-full px-4 py-3 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-gold-500 focus:outline-none">
            </div>

            <div>
                <label class="block text-xs font-medium text-stone-700 mb-1.5">Password (Minimal 6 karakter)</label>
                <input type="password" name="password" minlength="6" required placeholder="Buat password aman" class="w-full px-4 py-3 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-gold-500 focus:outline-none">
            </div>

            <button type="submit" class="w-full bg-[#1C1917] hover:bg-stone-800 text-white font-semibold text-xs py-3.5 rounded-xl shadow transition flex items-center justify-center gap-2 mt-2">
                <i data-lucide="user-plus" class="w-4 h-4 text-gold-400"></i>
                <span>Daftar Akun Sekarang</span>
            </button>
        </form>

        <div class="mt-6 pt-4 border-t border-stone-200 text-center">
            <a href="index.php" class="text-xs text-stone-500 hover:text-gold-600 transition flex items-center justify-center gap-1">
                <i data-lucide="arrow-left" class="w-3.5 h-3.5"></i> Kembali ke Beranda
            </a>
        </div>
    </div>
</div>

<script>
function switchAuthTab(tab) {
    const loginForm = document.getElementById('formLogin');
    const registerForm = document.getElementById('formRegister');
    const tabLoginBtn = document.getElementById('tabLoginBtn');
    const tabRegisterBtn = document.getElementById('tabRegisterBtn');

    if (tab === 'login') {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        tabLoginBtn.className = 'flex-1 py-2 rounded-lg transition-all text-center bg-white text-stone-900 shadow-sm';
        tabRegisterBtn.className = 'flex-1 py-2 rounded-lg transition-all text-center text-stone-500 hover:text-stone-900';
    } else {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        tabRegisterBtn.className = 'flex-1 py-2 rounded-lg transition-all text-center bg-white text-stone-900 shadow-sm';
        tabLoginBtn.className = 'flex-1 py-2 rounded-lg transition-all text-center text-stone-500 hover:text-stone-900';
    }
}
</script>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
`
  },
  {
    filename: 'dashboard.php',
    path: 'dashboard.php',
    language: 'php',
    description: 'Halaman Dashboard Pengguna Terproteksi Sesi (Aman dari Akses Tanpa Login)',
    content: `<?php
/**
 * File: dashboard.php
 * Halaman Dashboard User Terproteksi Sesi PHP
 * Jika pengguna belum login, akan langsung di-redirect ke login.php
 */
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// PROTEKSI SESI: Jika belum login, tolak akses dan arahkan ke login.php
if (!isset($_SESSION['user'])) {
    $_SESSION['error_msg'] = "Silakan login terlebih dahulu untuk mengakses dashboard Anda.";
    header("Location: login.php?redirect=dashboard.php");
    exit;
}

$pageTitle = "Dashboard Calon Pengantin";
require_once __DIR__ . '/includes/header.php';
?>

<div class="py-16 bg-[#FAF8F5]">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Welcome Banner -->
        <div class="bg-[#1C1917] text-white rounded-3xl p-8 sm:p-10 mb-10 shadow-xl relative overflow-hidden">
            <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <span class="text-gold-400 text-xs font-semibold uppercase tracking-widest">Portal Calon Pengantin</span>
                    <h1 class="font-serif text-3xl sm:text-4xl font-bold mt-1">
                        Selamat Datang, <?php echo htmlspecialchars($currentUser['nama_lengkap'] ?: 'Pengantin'); ?>!
                    </h1>
                    <p class="text-stone-400 text-xs sm:text-sm mt-2">
                        Akun terhubung: <span class="text-stone-200"><?php echo htmlspecialchars($currentUser['email_hp']); ?></span>
                    </p>
                </div>

                <div class="flex items-center gap-3">
                    <a href="packages.php" class="gold-gradient-bg text-white text-xs font-semibold px-6 py-3 rounded-full hover:opacity-90 transition flex items-center gap-2">
                        <i data-lucide="shopping-bag" class="w-4 h-4"></i>
                        <span>Pilih & Booking Paket</span>
                    </a>
                    <a href="logout.php" class="bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold px-4 py-3 rounded-full transition flex items-center gap-1.5">
                        <i data-lucide="log-out" class="w-3.5 h-3.5"></i>
                        <span>Keluar</span>
                    </a>
                </div>
            </div>
            <!-- Decorative circle -->
            <div class="absolute -bottom-10 -right-10 w-48 h-48 bg-gold-500/20 rounded-full blur-3xl"></div>
        </div>

        <!-- Dashboard Cards Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <!-- Card 1 -->
            <div class="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
                <div class="w-10 h-10 rounded-xl bg-gold-100 text-gold-700 flex items-center justify-center mb-4">
                    <i data-lucide="heart" class="w-5 h-5"></i>
                </div>
                <h3 class="font-serif text-lg font-bold text-stone-900 mb-1">Status Booking WhatsApp</h3>
                <p class="text-xs text-stone-500 mb-4">Akun Anda siap melakukan direct checkout konsultasi ke WhatsApp Admin tanpa hambatan.</p>
                <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-semibold">
                    <i data-lucide="check" class="w-3 h-3"></i> Akun Aktif & Terverifikasi
                </span>
            </div>

            <!-- Card 2 -->
            <div class="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
                <div class="w-10 h-10 rounded-xl bg-gold-100 text-gold-700 flex items-center justify-center mb-4">
                    <i data-lucide="phone-call" class="w-5 h-5"></i>
                </div>
                <h3 class="font-serif text-lg font-bold text-stone-900 mb-1">Hotline Personal Admin</h3>
                <p class="text-xs text-stone-500 mb-4">Butuh panduan pemilihan adat, budget fitting, atau custom dekorasi?</p>
                <a href="https://wa.me/6282122030072" target="_blank" class="text-xs text-gold-600 font-semibold hover:underline flex items-center gap-1">
                    Hubungi +62 821-2203-0072 <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
                </a>
            </div>

            <!-- Card 3 -->
            <div class="bg-white rounded-2xl p-6 border border-stone-200 shadow-sm">
                <div class="w-10 h-10 rounded-xl bg-gold-100 text-gold-700 flex items-center justify-center mb-4">
                    <i data-lucide="sparkles" class="w-5 h-5"></i>
                </div>
                <h3 class="font-serif text-lg font-bold text-stone-900 mb-1">Voucher Spesial 2026</h3>
                <p class="text-xs text-stone-500 mb-4">Klaim bonus Free Ring Box Akrilik Terrarium untuk setiap pemesanan Paket Intimate / Luxury.</p>
                <span class="text-xs text-gold-700 font-bold">KODE: SENNAWED2026</span>
            </div>
        </div>

        <!-- Rekomendasi Paket Cepat -->
        <div class="bg-white rounded-2xl p-8 border border-stone-200 shadow-sm">
            <div class="flex items-center justify-between mb-6">
                <div>
                    <h2 class="font-serif text-2xl font-bold text-stone-900">Rekomendasi Paket Pernikahan Populer</h2>
                    <p class="text-xs text-stone-500">Klik tombol booking untuk langsung terhubung dengan Admin WhatsApp dengan format otomatis.</p>
                </div>
                <a href="packages.php" class="text-xs text-gold-600 font-semibold hover:underline">Lihat Semua Paket</a>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="p-4 rounded-xl bg-[#FAF8F5] border border-gold-200 flex items-center justify-between">
                    <div>
                        <h4 class="font-serif font-bold text-stone-900 text-base">Paket Wedding Intimate 17.5 JT</h4>
                        <p class="text-xs text-stone-500">Makeup Senior + Pelaminan 6-8m + 2 Pasang Busana</p>
                    </div>
                    <a href="https://wa.me/6282122030072?text=Halo%20Admin,%20saya%20<?php echo urlencode($currentUser['nama_lengkap']); ?>%20ingin%20booking%20Paket%20Wedding%20Intimate%2017.5%20JT" target="_blank" class="gold-gradient-bg text-white text-xs font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition">
                        Booking WA
                    </a>
                </div>

                <div class="p-4 rounded-xl bg-[#FAF8F5] border border-gold-200 flex items-center justify-between">
                    <div>
                        <h4 class="font-serif font-bold text-stone-900 text-base">Paket Wedding Ekonomis 15.5 JT</h4>
                        <p class="text-xs text-stone-500">Makeup Flawless + Pelaminan 4-6m + Rias Ibu</p>
                    </div>
                    <a href="https://wa.me/6282122030072?text=Halo%20Admin,%20saya%20<?php echo urlencode($currentUser['nama_lengkap']); ?>%20ingin%20booking%20Paket%20Wedding%20Ekonomis%2015.5%20JT" target="_blank" class="gold-gradient-bg text-white text-xs font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition">
                        Booking WA
                    </a>
                </div>
            </div>
        </div>
    </div>
</div>

<?php require_once __DIR__ . '/includes/footer.php'; ?>
`
  },
  {
    filename: '.htaccess',
    path: '.htaccess',
    language: 'apache',
    description: 'Konfigurasi Apache Web Server untuk Hostinger (Security & Performance)',
    content: `# ==========================================================
# .htaccess Konfigurasi Shared Hosting Hostinger
# Senna MUA Gallery & Sekka Design Decoration
# ==========================================================

# 1. Mengaktifkan Rewrite Engine
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteBase /

    # Mencegah Directory Browsing
    Options -Indexes

    # Memastikan HTTPS aktif otomatis
    # RewriteCond %{HTTPS} off
    # RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>

# 2. Proteksi Akses Langsung ke File Konfigurasi Sensitif
<FilesMatch "^(config\.php|db\.php|\.env|database\.sql)$">
    Order allow,deny
    Deny from all
</FilesMatch>

# 3. Gzip Compression untuk Kecepatan Maksimal
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>
`
  },
  {
    filename: 'README.md',
    path: 'README.md',
    language: 'markdown',
    description: 'Panduan Lengkap Langkah demi Langkah Upload ke Hostinger (hPanel / cPanel)',
    content: `# Panduan Upload Website ke Hostinger (Shared Hosting)
## Senna MUA Gallery & Sekka Design Decoration

Berikut panduan praktis untuk memasang source code website ini di Hostinger:

### Langkah 1: Buat Database MySQL di Hostinger
1. Login ke **Hostinger hPanel** (atau cPanel).
2. Buka menu **Databases** -> **MySQL Databases**.
3. Buat database baru, contoh:
   - Nama Database: \`u123456789_senna\`
   - Username: \`u123456789_admin\`
   - Password: Buat password aman dan catat.
4. Buka **phpMyAdmin** pada database tersebut.
5. Klik menu **Import**, pilih file \`database.sql\` yang ada dalam paket ini, lalu klik **Go**.

### Langkah 2: Sesuaikan File Koneksi Database
Buka file \`config/db.php\` dan sesuaikan kredensial database Anda:
\`\`\`php
$host     = "localhost";
$dbname   = "u123456789_senna";    // Nama database Hostinger Anda
$username = "u123456789_admin";    // Username database
$password = "PasswordRahasiaAnda"; // Password database
\`\`\`

### Langkah 3: Upload File ke Hostinger File Manager
1. Buka **File Manager** di hPanel.
2. Masuk ke folder \`public_html\`.
3. Upload seluruh file dan folder:
   - \`index.php\`
   - \`packages.php\`
   - \`login.php\`
   - \`auth.php\`
   - \`dashboard.php\`
   - \`logout.php\`
   - \`.htaccess\`
   - Folder \`config/\` (berisi \`db.php\`)
   - Folder \`includes/\` (berisi \`header.php\` & \`footer.php\`)

### Langkah 4: Selesai & Uji Coba
Buka nama domain Anda (misal \`https://namadomainanda.com\`).
- Coba klik **Booking Sekarang** pada salah satu paket.
- Anda akan diarahkan ke form Login/Register.
- Setelah berhasil daftar/login, sistem akan otomatis mengembalikan Anda ke paket yang dipilih dan membuka WhatsApp admin (+62 821-2203-0072).
`
  }
];
