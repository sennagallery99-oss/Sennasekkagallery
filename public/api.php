<?php
/**
 * ============================================================================
 * SENNA GALLERY - REST API BACKEND UNTUK MYSQL HOSTINGER
 * ============================================================================
 * 
 * File ini bertindak sebagai jembatan (API) antara aplikasi web React Senna Gallery
 * dan Database MySQL bawaan hosting Anda di Hostinger.
 * 
 * PANDUAN PENGISIAN:
 * Cukup ganti 4 baris konfigurasi di bawah ini sesuai informasi Database yang Anda buat di Hostinger hPanel.
 */

// ==========================================
// 1. KONFIGURASI DATABASE MYSQL HOSTINGER
// ==========================================
$db_host = 'localhost';                 // Hostinger default localhost
$db_name = 'u689965173_sennadb';        // Database MySQL Senna Gallery
$db_user = 'u689965173_usersenna';      // Username MySQL Hostinger
$db_pass = '22Des2017@';                // Password Database Hostinger

// ==========================================
// 2. HEADER CORS, KEAMANAN & ANTI-CACHE
// ==========================================
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-cache, no-store, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');

// Tangani Preflight Request OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ==========================================
// 3. KONEKSI KE DATABASE (PDO)
// ==========================================
try {
    $dsn = "mysql:host={$db_host};dbname={$db_name};charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];
    $pdo = new PDO($dsn, $db_user, $db_pass, $options);
} catch (PDOException $e) {
    // Jika koneksi belum dikonfigurasi / salah password
    echo json_encode([
        'status' => 'error',
        'code' => 'DB_CONNECTION_FAILED',
        'message' => 'Koneksi ke database MySQL Hostinger gagal. Pastikan $db_name, $db_user, dan $db_pass di file api.php sudah diisi dengan benar.',
        'debug_error' => $e->getMessage()
    ]);
    exit;
}

// ==========================================
// 4. PEMBUATAN TABEL & MIGRATION OTOMATIS (AUTO-MIGRATE)
// ==========================================
// Sistem secara otomatis membuat tabel-tabel yang dibutuhkan jika belum ada
$collections = ['products', 'orders', 'banners', 'packages', 'gallery', 'settings', 'registered_users', 'testimonials'];
foreach ($collections as $col) {
    $tableName = "senna_" . preg_replace('/[^a-zA-Z0-9_]/', '', $col);
    $sql = "CREATE TABLE IF NOT EXISTS `{$tableName}` (
        `id` VARCHAR(120) NOT NULL PRIMARY KEY,
        `data` LONGTEXT NOT NULL,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";
    $pdo->exec($sql);
}

// Tabel pencatatan ID yang telah dihapus permanen agar tidak pernah bangkit / muncul kembali
$pdo->exec("CREATE TABLE IF NOT EXISTS `senna_deleted_records` (
    `id` VARCHAR(120) NOT NULL PRIMARY KEY,
    `collection` VARCHAR(60) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;");

// Upgrade tabel senna_products agar memiliki kolom terstruktur yang mudah dibaca & diedit di phpMyAdmin
try {
    $colStmt = $pdo->query("SHOW COLUMNS FROM `senna_products`");
    $existingCols = [];
    while ($c = $colStmt->fetch()) {
        $existingCols[] = $c['Field'];
    }
    if (!in_array('code', $existingCols)) {
        $pdo->exec("ALTER TABLE `senna_products` ADD COLUMN `code` VARCHAR(50) NULL AFTER `id`");
    }
    if (!in_array('name', $existingCols)) {
        $pdo->exec("ALTER TABLE `senna_products` ADD COLUMN `name` VARCHAR(255) NULL AFTER `code`");
    }
    if (!in_array('category', $existingCols)) {
        $pdo->exec("ALTER TABLE `senna_products` ADD COLUMN `category` VARCHAR(100) NULL AFTER `name`");
    }
    if (!in_array('price', $existingCols)) {
        $pdo->exec("ALTER TABLE `senna_products` ADD COLUMN `price` INT NULL AFTER `category`");
    }
    if (!in_array('original_price', $existingCols)) {
        $pdo->exec("ALTER TABLE `senna_products` ADD COLUMN `original_price` INT NULL AFTER `price`");
    }
    if (!in_array('image_url', $existingCols)) {
        $pdo->exec("ALTER TABLE `senna_products` ADD COLUMN `image_url` TEXT NULL AFTER `original_price`");
    }
    if (!in_array('location', $existingCols)) {
        $pdo->exec("ALTER TABLE `senna_products` ADD COLUMN `location` VARCHAR(100) NULL AFTER `image_url`");
    }
} catch (Exception $e) {
    // Ignore migration warning if already exists
}

// Upgrade tabel senna_orders agar memiliki kolom terstruktur di phpMyAdmin
try {
    $colStmt = $pdo->query("SHOW COLUMNS FROM `senna_orders`");
    $existingOrderCols = [];
    while ($c = $colStmt->fetch()) {
        $existingOrderCols[] = $c['Field'];
    }
    if (!in_array('order_code', $existingOrderCols)) {
        $pdo->exec("ALTER TABLE `senna_orders` ADD COLUMN `order_code` VARCHAR(50) NULL AFTER `id`");
    }
    if (!in_array('customer_name', $existingOrderCols)) {
        $pdo->exec("ALTER TABLE `senna_orders` ADD COLUMN `customer_name` VARCHAR(255) NULL AFTER `order_code`");
    }
    if (!in_array('customer_phone', $existingOrderCols)) {
        $pdo->exec("ALTER TABLE `senna_orders` ADD COLUMN `customer_phone` VARCHAR(50) NULL AFTER `customer_name`");
    }
    if (!in_array('product_name', $existingOrderCols)) {
        $pdo->exec("ALTER TABLE `senna_orders` ADD COLUMN `product_name` VARCHAR(255) NULL AFTER `customer_phone`");
    }
    if (!in_array('total_price', $existingOrderCols)) {
        $pdo->exec("ALTER TABLE `senna_orders` ADD COLUMN `total_price` INT NULL AFTER `product_name`");
    }
    if (!in_array('status', $existingOrderCols)) {
        $pdo->exec("ALTER TABLE `senna_orders` ADD COLUMN `status` VARCHAR(50) NULL AFTER `total_price`");
    }
} catch (Exception $e) {
    // Ignore migration warning
}

// ==========================================
// 5. HELPER FUNCTIONS (TOP LEVEL DECLARATION)
// ==========================================

// Helper untuk baca input JSON body
function getJsonInput() {
    $raw = file_get_contents('php://input');
    $decoded = json_decode($raw, true);
    return is_array($decoded) ? $decoded : [];
}

// Helper sanitasi nama tabel
function getValidTable($collection) {
    $allowed = [
        'products' => 'senna_products',
        'orders' => 'senna_orders',
        'banners' => 'senna_banners',
        'packages' => 'senna_packages',
        'gallery' => 'senna_gallery',
        'testimonials' => 'senna_testimonials',
        'settings' => 'senna_settings',
        'webSettings' => 'senna_settings',
        'registeredUsers' => 'senna_registered_users',
        'registered_users' => 'senna_registered_users'
    ];
    return isset($allowed[$collection]) ? $allowed[$collection] : null;
}

// Helper fungsi format item dari baris database
function parseDatabaseRow($col, $row) {
    $decoded = !empty($row['data']) ? json_decode($row['data'], true) : [];
    if (!is_array($decoded)) $decoded = [];

    $id = isset($row['id']) ? $row['id'] : (!empty($decoded['id']) ? $decoded['id'] : '');
    $decoded['id'] = $id;

    if ($col === 'products') {
        if (!empty($row['code'])) $decoded['code'] = $row['code'];
        if (!empty($row['name'])) $decoded['name'] = $row['name'];
        if (!empty($row['category'])) $decoded['category'] = $row['category'];
        if (isset($row['price']) && $row['price'] !== null && $row['price'] !== '') $decoded['price'] = (int)$row['price'];
        if (isset($row['original_price']) && $row['original_price'] !== null && $row['original_price'] !== '') $decoded['originalPrice'] = (int)$row['original_price'];
        if (!empty($row['image_url'])) $decoded['imageUrl'] = $row['image_url'];
        if (!empty($row['location'])) $decoded['location'] = $row['location'];

        // Pastikan fallback nilai default
        if (empty($decoded['name'])) $decoded['name'] = "Busana Senna #{$id}";
        if (empty($decoded['code'])) $decoded['code'] = "SNA-" . substr(abs(crc32($id)), 0, 4);
        if (empty($decoded['price'])) $decoded['price'] = 250000;
        if (empty($decoded['originalPrice'])) $decoded['originalPrice'] = round($decoded['price'] * 1.3);
        if (empty($decoded['priceFormatted'])) $decoded['priceFormatted'] = "Rp " . number_format($decoded['price'], 0, ',', '.') . " / 3 hari";
        if (empty($decoded['sizes'])) $decoded['sizes'] = ['S', 'M', 'L', 'XL', 'XXL'];
        if (empty($decoded['sizeStock'])) $decoded['sizeStock'] = ['S' => 2, 'M' => 3, 'L' => 2, 'XL' => 1, 'XXL' => 1];
        if (empty($decoded['category'])) $decoded['category'] = 'kebaya';
        if (empty($decoded['categoryLabel'])) {
            $c = $decoded['category'];
            $decoded['categoryLabel'] = ($c === 'kebaya' ? 'Kebaya Pengantin' : ($c === 'gaun' ? 'Gaun Resepsi & Pesta' : ($c === 'jas' ? 'Jas Pria & Tuxedo' : ($c === 'adat' ? 'Baju Adat Tradisional' : 'Aksesoris & Tiara'))));
        }
    } elseif ($col === 'orders') {
        if (!empty($row['order_code'])) $decoded['orderCode'] = $row['order_code'];
        if (!empty($row['customer_name'])) $decoded['customerName'] = $row['customer_name'];
        if (!empty($row['customer_phone'])) $decoded['customerPhone'] = $row['customer_phone'];
        if (!empty($row['product_name'])) $decoded['productName'] = $row['product_name'];
        if (isset($row['total_price']) && $row['total_price'] !== null) $decoded['totalPrice'] = (int)$row['total_price'];
        if (!empty($row['status'])) $decoded['status'] = $row['status'];
    }

    if (!empty($row['created_at'])) $decoded['createdAt'] = $row['created_at'];
    if (!empty($row['updated_at'])) $decoded['updatedAt'] = $row['updated_at'];

    return $decoded;
}

// Helper Google Drive
function fetchGoogleDriveFolderHtml($fid) {
    $url = "https://drive.google.com/drive/folders/" . $fid;
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    curl_setopt($ch, CURLOPT_USERAGENT, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36');
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Accept-Language: en-US,en;q=0.9']);
    $html = curl_exec($ch);
    curl_close($ch);
    return $html;
}

function extractItemsFromDriveHtml($html) {
    $images = [];
    $folders = [];
    
    if (preg_match('/AF_initDataCallback\([^)]*?key:\s*\'ds:4\'[^)]*?data:\s*(\[.*?\])\s*,\s*sideChannel/s', $html, $m)) {
        $rawJson = $m[1];
        $data = json_decode($rawJson, true);
        $items = isset($data[27][7][0][0]) && is_array($data[27][7][0][0]) ? $data[27][7][0][0] : [];
        foreach ($items as $it) {
            $fileId = isset($it[0][1]) ? $it[0][1] : null;
            $mimeType = isset($it[4]) ? $it[4] : '';
            $encodedStr = json_encode($it);
            
            $name = '';
            if (preg_match('/\[\"([^\"]+\.(?:jpg|jpeg|png|webp|JPG|JPEG|PNG|heic|HEIC))\"/i', $encodedStr, $nm)) {
                $name = $nm[1];
            } elseif (preg_match('/\[16,null,\[null,\[\[\[\"([^\"]+)\"/', $encodedStr, $nm)) {
                $name = $nm[1];
            } else {
                $name = $fileId ? "Foto_{$fileId}" : "Item";
            }

            if (strpos($mimeType, 'folder') !== false || strpos($encodedStr, 'application/vnd.google-apps.folder') !== false) {
                if ($fileId) {
                    $folders[] = ['id' => $fileId, 'name' => $name, 'type' => 'folder'];
                }
            } elseif ($fileId) {
                $images[] = [
                    'id' => $fileId,
                    'name' => $name,
                    'mimeType' => $mimeType ?: 'image/jpeg',
                    'directUrl' => "https://lh3.googleusercontent.com/d/{$fileId}",
                    'driveUrl' => "https://drive.google.com/file/d/{$fileId}/view"
                ];
            }
        }
    }
    return ['images' => $images, 'folders' => $folders];
}

// ==========================================
// 6. PENANGANAN REQUEST API DENGAN ERROR WRAPPER
// ==========================================
$action = isset($_GET['action']) ? trim($_GET['action']) : '';
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($action) {
        // -------------------------------------------------------------
        // Tes Koneksi
        // -------------------------------------------------------------
        case 'test':
            echo json_encode([
                'status' => 'success',
                'message' => 'Koneksi ke Database MySQL Hostinger Berhasil!',
                'database' => $db_name,
                'version' => '2.2.0',
                'timestamp' => date('Y-m-d H:i:s')
            ], JSON_UNESCAPED_UNICODE);
            break;

        // -------------------------------------------------------------
        // Smart Version Check: Cek Versi / Timestamp Data Terkini (Ringan & Cepat)
        // -------------------------------------------------------------
        case 'get_version':
        case 'version_check':
        case 'version':
            $mapping = [
                'products' => 'senna_products',
                'orders' => 'senna_orders',
                'banners' => 'senna_banners',
                'packages' => 'senna_packages',
                'gallery' => 'senna_gallery',
                'settings' => 'senna_settings',
                'registeredUsers' => 'senna_registered_users',
                'deletedRecords' => 'senna_deleted_records'
            ];

            $tablesInfo = [];
            $compositeParts = [];
            $maxTimestamp = '2000-01-01 00:00:00';

            foreach ($mapping as $key => $table) {
                try {
                    $stmt = $pdo->query("SELECT MAX(updated_at) AS last_updated, COUNT(*) AS total_count FROM `{$table}`");
                    $res = $stmt->fetch();
                    $lastUpdated = !empty($res['last_updated']) ? $res['last_updated'] : '2000-01-01 00:00:00';
                    $count = isset($res['total_count']) ? (int)$res['total_count'] : 0;
                    
                    $tablesInfo[$key] = [
                        'updated_at' => $lastUpdated,
                        'count' => $count
                    ];
                    $compositeParts[] = "{$key}:{$lastUpdated}:{$count}";
                    if ($lastUpdated > $maxTimestamp) {
                        $maxTimestamp = $lastUpdated;
                    }
                } catch (Exception $e) {
                    try {
                        // Fallback for tables without updated_at (e.g. senna_deleted_records)
                        $stmt = $pdo->query("SELECT MAX(created_at) AS last_updated, COUNT(*) AS total_count FROM `{$table}`");
                        $res = $stmt->fetch();
                        $lastUpdated = !empty($res['last_updated']) ? $res['last_updated'] : '2000-01-01 00:00:00';
                        $count = isset($res['total_count']) ? (int)$res['total_count'] : 0;
                        $tablesInfo[$key] = [
                            'updated_at' => $lastUpdated,
                            'count' => $count
                        ];
                        $compositeParts[] = "{$key}:{$lastUpdated}:{$count}";
                    } catch (Exception $e2) {
                        $tablesInfo[$key] = [
                            'updated_at' => '2000-01-01 00:00:00',
                            'count' => 0
                        ];
                    }
                }
            }

            $versionHash = md5(implode('|', $compositeParts));

            echo json_encode([
                'status' => 'success',
                'version' => $versionHash,
                'latest_timestamp' => $maxTimestamp,
                'server_time' => date('Y-m-d H:i:s'),
                'tables' => $tablesInfo
            ], JSON_UNESCAPED_UNICODE);
            break;

        // -------------------------------------------------------------
        // Ambil Seluruh Data Sekaligus (Untuk sinkronisasi instan awal)
        // -------------------------------------------------------------
        case 'get_all':
            $allData = [];

            // 1. Ambil daftar ID yang telah dihapus permanen
            $deletedStmt = $pdo->query("SELECT `id`, `collection` FROM `senna_deleted_records`");
            $deletedRows = $deletedStmt->fetchAll();
            $deletedIds = [];
            $deletedSet = [];
            foreach ($deletedRows as $dRow) {
                $delId = $dRow['id'];
                $deletedIds[] = $delId;
                $deletedSet[$delId] = true;
            }
            $allData['deletedRecords'] = $deletedIds;

            $mapping = [
                'products' => 'senna_products',
                'orders' => 'senna_orders',
                'banners' => 'senna_banners',
                'packages' => 'senna_packages',
                'gallery' => 'senna_gallery',
                'testimonials' => 'senna_testimonials',
                'registeredUsers' => 'senna_registered_users'
            ];

            foreach ($mapping as $key => $table) {
                try {
                    $stmt = $pdo->query("SELECT * FROM `{$table}` ORDER BY `created_at` DESC, `id` DESC");
                } catch (Exception $e) {
                    $stmt = $pdo->query("SELECT * FROM `{$table}`");
                }
                $rows = $stmt->fetchAll();
                $items = [];
                foreach ($rows as $row) {
                    $rowId = isset($row['id']) ? $row['id'] : '';
                    if (!empty($rowId) && isset($deletedSet[$rowId])) {
                        continue; // Lewati item yang sudah dihapus
                    }
                    $items[] = parseDatabaseRow($key, $row);
                }
                $allData[$key] = $items;
            }

            // Ambil webSettings
            $stmt = $pdo->query("SELECT `data` FROM `senna_settings` WHERE `id` = 'global' LIMIT 1");
            $settingRow = $stmt->fetch();
            $allData['webSettings'] = $settingRow && !empty($settingRow['data']) ? json_decode($settingRow['data'], true) : null;

            echo json_encode([
                'status' => 'success',
                'data' => $allData
            ], JSON_UNESCAPED_UNICODE);
            break;

        // -------------------------------------------------------------
        // Ambil Data Koleksi Tertentu (GET ?action=get&collection=products)
        // -------------------------------------------------------------
        case 'get':
            $collection = isset($_GET['collection']) ? trim($_GET['collection']) : '';
            $table = getValidTable($collection);

            if (!$table) {
                echo json_encode(['status' => 'error', 'message' => 'Koleksi tidak valid.'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            try {
                $stmt = $pdo->query("SELECT * FROM `{$table}` ORDER BY `created_at` DESC, `id` DESC");
            } catch (Exception $e) {
                $stmt = $pdo->query("SELECT * FROM `{$table}`");
            }
            $rows = $stmt->fetchAll();
            $items = [];
            foreach ($rows as $row) {
                $items[] = parseDatabaseRow($collection, $row);
            }

            echo json_encode([
                'status' => 'success',
                'collection' => $collection,
                'count' => count($items),
                'data' => $items
            ], JSON_UNESCAPED_UNICODE);
            break;

        // -------------------------------------------------------------
        // Simpan / Update Satu Item (POST ?action=save)
        // -------------------------------------------------------------
        case 'save':
            $input = getJsonInput();
            $collection = isset($input['collection']) ? trim($input['collection']) : '';
            $id = isset($input['id']) ? trim($input['id']) : '';
            $data = isset($input['data']) ? $input['data'] : null;

            $table = getValidTable($collection);
            if (!$table || empty($id) || $data === null) {
                echo json_encode(['status' => 'error', 'message' => 'Data input tidak lengkap.'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $jsonData = json_encode($data, JSON_UNESCAPED_UNICODE);

            if ($collection === 'products') {
                $code = isset($data['code']) ? $data['code'] : '';
                $name = isset($data['name']) ? $data['name'] : '';
                $category = isset($data['category']) ? $data['category'] : 'kebaya';
                $price = isset($data['price']) ? (int)$data['price'] : 0;
                $originalPrice = isset($data['originalPrice']) ? (int)$data['originalPrice'] : round($price * 1.3);
                $imageUrl = isset($data['imageUrl']) ? $data['imageUrl'] : '';
                $location = isset($data['location']) ? $data['location'] : 'Bandar Lampung';

                $stmt = $pdo->prepare("INSERT INTO `senna_products` (`id`, `code`, `name`, `category`, `price`, `original_price`, `image_url`, `location`, `data`) 
                                       VALUES (:id, :code, :name, :category, :price, :original_price, :image_url, :location, :data)
                                       ON DUPLICATE KEY UPDATE 
                                           `code` = :code_u,
                                           `name` = :name_u,
                                           `category` = :category_u,
                                           `price` = :price_u,
                                           `original_price` = :original_price_u,
                                           `image_url` = :image_url_u,
                                           `location` = :location_u,
                                           `data` = :data_u,
                                           `updated_at` = CURRENT_TIMESTAMP");
                $stmt->execute([
                    ':id' => $id,
                    ':code' => $code,
                    ':name' => $name,
                    ':category' => $category,
                    ':price' => $price,
                    ':original_price' => $originalPrice,
                    ':image_url' => $imageUrl,
                    ':location' => $location,
                    ':data' => $jsonData,
                    ':code_u' => $code,
                    ':name_u' => $name,
                    ':category_u' => $category,
                    ':price_u' => $price,
                    ':original_price_u' => $originalPrice,
                    ':image_url_u' => $imageUrl,
                    ':location_u' => $location,
                    ':data_u' => $jsonData
                ]);
            } elseif ($collection === 'orders') {
                $orderCode = isset($data['orderCode']) ? $data['orderCode'] : '';
                $customerName = isset($data['customerName']) ? $data['customerName'] : '';
                $customerPhone = isset($data['customerPhone']) ? $data['customerPhone'] : '';
                $productName = isset($data['productName']) ? $data['productName'] : '';
                $totalPrice = isset($data['totalPrice']) ? (int)$data['totalPrice'] : 0;
                $status = isset($data['status']) ? $data['status'] : 'pending';

                $stmt = $pdo->prepare("INSERT INTO `senna_orders` (`id`, `order_code`, `customer_name`, `customer_phone`, `product_name`, `total_price`, `status`, `data`) 
                                       VALUES (:id, :order_code, :customer_name, :customer_phone, :product_name, :total_price, :status, :data)
                                       ON DUPLICATE KEY UPDATE 
                                           `order_code` = :order_code_u,
                                           `customer_name` = :customer_name_u,
                                           `customer_phone` = :customer_phone_u,
                                           `product_name` = :product_name_u,
                                           `total_price` = :total_price_u,
                                           `status` = :status_u,
                                           `data` = :data_u,
                                           `updated_at` = CURRENT_TIMESTAMP");
                $stmt->execute([
                    ':id' => $id,
                    ':order_code' => $orderCode,
                    ':customer_name' => $customerName,
                    ':customer_phone' => $customerPhone,
                    ':product_name' => $productName,
                    ':total_price' => $totalPrice,
                    ':status' => $status,
                    ':data' => $jsonData,
                    ':order_code_u' => $orderCode,
                    ':customer_name_u' => $customerName,
                    ':customer_phone_u' => $customerPhone,
                    ':product_name_u' => $productName,
                    ':total_price_u' => $totalPrice,
                    ':status_u' => $status,
                    ':data_u' => $jsonData
                ]);
            } else {
                $stmt = $pdo->prepare("INSERT INTO `{$table}` (`id`, `data`) VALUES (:id, :data) 
                                       ON DUPLICATE KEY UPDATE `data` = :data_update, `updated_at` = CURRENT_TIMESTAMP");
                $stmt->execute([
                    ':id' => $id,
                    ':data' => $jsonData,
                    ':data_update' => $jsonData
                ]);
            }

            echo json_encode([
                'status' => 'success',
                'message' => 'Item berhasil disimpan ke MySQL Hostinger',
                'id' => $id
            ], JSON_UNESCAPED_UNICODE);
            break;

        // -------------------------------------------------------------
        // Simpan Banyak Item Sekaligus (Batch Save) (POST ?action=save_batch)
        // -------------------------------------------------------------
        case 'save_batch':
            $input = getJsonInput();
            $collection = isset($input['collection']) ? trim($input['collection']) : '';
            $items = isset($input['items']) && is_array($input['items']) ? $input['items'] : [];

            $table = getValidTable($collection);
            if (!$table || empty($items)) {
                echo json_encode(['status' => 'error', 'message' => 'Items kosong atau koleksi tidak valid.'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $pdo->beginTransaction();
            try {
                $savedCount = 0;
                if ($collection === 'products') {
                    $stmt = $pdo->prepare("INSERT INTO `senna_products` (`id`, `code`, `name`, `category`, `price`, `original_price`, `image_url`, `location`, `data`) 
                                           VALUES (:id, :code, :name, :category, :price, :original_price, :image_url, :location, :data)
                                           ON DUPLICATE KEY UPDATE 
                                               `code` = :code_u,
                                               `name` = :name_u,
                                               `category` = :category_u,
                                               `price` = :price_u,
                                               `original_price` = :original_price_u,
                                               `image_url` = :image_url_u,
                                               `location` = :location_u,
                                               `data` = :data_u,
                                               `updated_at` = CURRENT_TIMESTAMP");
                    foreach ($items as $data) {
                        if (isset($data['id'])) {
                            $id = $data['id'];
                            $code = isset($data['code']) ? $data['code'] : '';
                            $name = isset($data['name']) ? $data['name'] : '';
                            $category = isset($data['category']) ? $data['category'] : 'kebaya';
                            $price = isset($data['price']) ? (int)$data['price'] : 0;
                            $originalPrice = isset($data['originalPrice']) ? (int)$data['originalPrice'] : round($price * 1.3);
                            $imageUrl = isset($data['imageUrl']) ? $data['imageUrl'] : '';
                            $location = isset($data['location']) ? $data['location'] : 'Bandar Lampung';
                            $jsonData = json_encode($data, JSON_UNESCAPED_UNICODE);

                            $stmt->execute([
                                ':id' => $id,
                                ':code' => $code,
                                ':name' => $name,
                                ':category' => $category,
                                ':price' => $price,
                                ':original_price' => $originalPrice,
                                ':image_url' => $imageUrl,
                                ':location' => $location,
                                ':data' => $jsonData,
                                ':code_u' => $code,
                                ':name_u' => $name,
                                ':category_u' => $category,
                                ':price_u' => $price,
                                ':original_price_u' => $originalPrice,
                                ':image_url_u' => $imageUrl,
                                ':location_u' => $location,
                                ':data_u' => $jsonData
                            ]);
                            $savedCount++;
                        }
                    }
                } else {
                    $stmt = $pdo->prepare("INSERT INTO `{$table}` (`id`, `data`) VALUES (:id, :data) 
                                           ON DUPLICATE KEY UPDATE `data` = :data_update, `updated_at` = CURRENT_TIMESTAMP");
                    foreach ($items as $item) {
                        if (isset($item['id'])) {
                            $json = json_encode($item, JSON_UNESCAPED_UNICODE);
                            $stmt->execute([
                                ':id' => $item['id'],
                                ':data' => $json,
                                ':data_update' => $json
                            ]);
                            $savedCount++;
                        }
                    }
                }
                $pdo->commit();
                echo json_encode([
                    'status' => 'success',
                    'message' => "Berhasil menyimpan {$savedCount} item ke MySQL Hostinger."
                ], JSON_UNESCAPED_UNICODE);
            } catch (Exception $e) {
                $pdo->rollBack();
                echo json_encode(['status' => 'error', 'message' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
            }
            break;

        // -------------------------------------------------------------
        // Hapus Item (POST ?action=delete)
        // -------------------------------------------------------------
        case 'delete':
            $input = getJsonInput();
            $collection = isset($input['collection']) ? trim($input['collection']) : '';
            $id = isset($input['id']) ? trim($input['id']) : '';

            $table = getValidTable($collection);
            if (!$table || empty($id)) {
                echo json_encode(['status' => 'error', 'message' => 'Koleksi atau ID tidak valid.'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            // Hapus dari tabel sumber
            $stmt = $pdo->prepare("DELETE FROM `{$table}` WHERE `id` = :id");
            $stmt->execute([':id' => $id]);

            // Catat ke tabel deleted_records agar tidak pernah bangkit kembali
            try {
                $delStmt = $pdo->prepare("INSERT INTO `senna_deleted_records` (`id`, `collection`, `created_at`) VALUES (:id, :col, CURRENT_TIMESTAMP) ON DUPLICATE KEY UPDATE `created_at` = CURRENT_TIMESTAMP");
                $delStmt->execute([':id' => $id, ':col' => $collection]);
            } catch (Exception $e) {}

            echo json_encode([
                'status' => 'success',
                'message' => 'Item berhasil dihapus permanen dari MySQL Hostinger',
                'id' => $id
            ], JSON_UNESCAPED_UNICODE);
            break;

        // -------------------------------------------------------------
        // Kosongkan Seluruh Katalog Bawaan (POST ?action=clear_all_catalogs)
        // -------------------------------------------------------------
        case 'clear_all_catalogs':
            // Catat seluruh ID saat ini ke deleted_records sebelum dihapus
            try {
                $pIds = $pdo->query("SELECT `id` FROM `senna_products`")->fetchAll();
                $bIds = $pdo->query("SELECT `id` FROM `senna_banners`")->fetchAll();
                $pkgIds = $pdo->query("SELECT `id` FROM `senna_packages`")->fetchAll();
                $gIds = $pdo->query("SELECT `id` FROM `senna_gallery`")->fetchAll();

                $delStmt = $pdo->prepare("INSERT INTO `senna_deleted_records` (`id`, `collection`, `created_at`) VALUES (:id, :col, CURRENT_TIMESTAMP) ON DUPLICATE KEY UPDATE `created_at` = CURRENT_TIMESTAMP");
                foreach ($pIds as $r) { $delStmt->execute([':id' => $r['id'], ':col' => 'products']); }
                foreach ($bIds as $r) { $delStmt->execute([':id' => $r['id'], ':col' => 'banners']); }
                foreach ($pkgIds as $r) { $delStmt->execute([':id' => $r['id'], ':col' => 'packages']); }
                foreach ($gIds as $r) { $delStmt->execute([':id' => $r['id'], ':col' => 'gallery']); }
            } catch (Exception $e) {}

            $pdo->exec("DELETE FROM `senna_products`");
            $pdo->exec("DELETE FROM `senna_banners`");
            $pdo->exec("DELETE FROM `senna_packages`");
            $pdo->exec("DELETE FROM `senna_gallery`");
            echo json_encode([
                'status' => 'success',
                'message' => 'Seluruh data katalog di MySQL Hostinger berhasil dikosongkan.'
            ], JSON_UNESCAPED_UNICODE);
            break;

        // -------------------------------------------------------------
        // Kosongkan Satu Tabel Koleksi (POST ?action=clear_collection)
        // -------------------------------------------------------------
        case 'clear_collection':
            $input = getJsonInput();
            $collection = isset($input['collection']) ? trim($input['collection']) : '';
            $table = getValidTable($collection);
            if (!$table) {
                echo json_encode(['status' => 'error', 'message' => 'Koleksi tidak valid.'], JSON_UNESCAPED_UNICODE);
                exit;
            }
            $pdo->exec("DELETE FROM `{$table}`");
            echo json_encode([
                'status' => 'success',
                'message' => "Koleksi {$collection} di MySQL Hostinger berhasil dikosongkan."
            ], JSON_UNESCAPED_UNICODE);
            break;

        // -------------------------------------------------------------
        // Pindai Folder Google Drive (POST / GET ?action=parse_drive_folder)
        // -------------------------------------------------------------
        case 'parse_drive_folder':
            $folderUrl = isset($_GET['folder_url']) ? trim($_GET['folder_url']) : '';
            if (empty($folderUrl)) {
                $input = getJsonInput();
                $folderUrl = isset($input['folder_url']) ? trim($input['folder_url']) : (isset($input['url']) ? trim($input['url']) : '');
            }

            if (empty($folderUrl)) {
                echo json_encode(['status' => 'error', 'message' => 'Link folder Google Drive diperlukan.'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            // Extract folder ID
            $folderId = '';
            if (preg_match('/\/folders\/([a-zA-Z0-9_-]+)/', $folderUrl, $matches)) {
                $folderId = $matches[1];
            } elseif (preg_match('/[?&]id=([a-zA-Z0-9_-]+)/', $folderUrl, $matches)) {
                $folderId = $matches[1];
            } elseif (preg_match('/^[a-zA-Z0-9_-]{20,}$/', $folderUrl)) {
                $folderId = $folderUrl;
            }

            if (empty($folderId)) {
                echo json_encode(['status' => 'error', 'message' => 'ID folder Google Drive tidak ditemukan dari URL.'], JSON_UNESCAPED_UNICODE);
                exit;
            }

            $allImages = [];
            $scannedFolders = [];

            $rootHtml = fetchGoogleDriveFolderHtml($folderId);
            $rootResult = extractItemsFromDriveHtml($rootHtml);

            foreach ($rootResult['images'] as $img) {
                $img['folderName'] = 'Utama (Root)';
                $allImages[] = $img;
            }

            $scannedFolders[] = ['id' => $folderId, 'name' => 'Utama (Root)', 'count' => count($rootResult['images'])];

            // Also scan subfolders
            foreach ($rootResult['folders'] as $sub) {
                if (!empty($sub['id'])) {
                    $subHtml = fetchGoogleDriveFolderHtml($sub['id']);
                    $subResult = extractItemsFromDriveHtml($subHtml);
                    foreach ($subResult['images'] as $img) {
                        $img['folderName'] = $sub['name'];
                        $allImages[] = $img;
                    }
                    $scannedFolders[] = ['id' => $sub['id'], 'name' => $sub['name'], 'count' => count($subResult['images'])];
                }
            }

            echo json_encode([
                'status' => 'success',
                'folderId' => $folderId,
                'totalImages' => count($allImages),
                'folders' => $scannedFolders,
                'images' => $allImages
            ], JSON_UNESCAPED_UNICODE);
            break;

        // -------------------------------------------------------------
        // Default: Info Endpoint
        // -------------------------------------------------------------
        default:
            echo json_encode([
                'status' => 'online',
                'service' => 'Senna Gallery MySQL Hostinger API',
                'version' => '2.2.0',
                'endpoints' => [
                    'GET ?action=test' => 'Uji koneksi database',
                    'GET ?action=get_version' => 'Cek versi timestamp data terbaru (Smart Live Sync)',
                    'GET ?action=get_all' => 'Ambil seluruh data toko',
                    'GET ?action=get&collection={nama}' => 'Ambil data koleksi (products, orders, dll)',
                    'POST ?action=save' => 'Simpan/update data { collection, id, data }',
                    'POST ?action=save_batch' => 'Simpan banyak data sekaligus',
                    'POST ?action=delete' => 'Hapus data { collection, id }'
                ]
            ], JSON_UNESCAPED_UNICODE);
            break;
    }
} catch (Throwable $e) {
    http_response_code(200); // Return 200 with JSON error details so browser frontend does not freeze or block
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage(),
        'file' => basename($e->getFile()),
        'line' => $e->getLine()
    ], JSON_UNESCAPED_UNICODE);
}
