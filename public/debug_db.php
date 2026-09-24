<?php
/**
 * ============================================================================
 * SENNA GALLERY - SKRIP DEBUG & VERIFIKASI KONEKSI DATABASE MYSQL HOSTINGER
 * ============================================================================
 * 
 * Skrip ini digunakan untuk:
 * 1. Memeriksa detail koneksi PDO & kredensial ke MySQL Hostinger.
 * 2. Memastikan pembuatan tabel `senna_documents` terbuat otomatis (auto-migrate).
 * 3. Menjalankan Self-Test tulis, baca, dan hapus (CRUD) pada database.
 * 4. Menampilkan statistik jumlah dokumen per kategori (koleksi).
 * 
 * Akses melalui browser:
 * https://sennagallery.com/debug_db.php
 * atau format JSON:
 * https://sennagallery.com/debug_db.php?format=json
 */

// ==========================================
// 1. KREDENSIAL DATABASE MYSQL HOSTINGER
// ==========================================
$db_host = 'localhost';                 // Hostinger default localhost
$db_name = 'u689965173_sennadb';        // Database MySQL Senna Gallery
$db_user = 'u689965173_usersenna';      // Username MySQL Hostinger
$db_pass = '22Des2017@';                // Password Database Hostinger

// Deteksi format output (JSON atau HTML)
$is_json = (isset($_GET['format']) && $_GET['format'] === 'json') || 
           (isset($_SERVER['HTTP_ACCEPT']) && strpos($_SERVER['HTTP_ACCEPT'], 'application/json') !== false);

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$results = [
    'timestamp' => date('Y-m-d H:i:s T'),
    'php_version' => PHP_VERSION,
    'pdo_available' => extension_loaded('pdo'),
    'pdo_mysql_available' => extension_loaded('pdo_mysql'),
    'credentials' => [
        'host' => $db_host,
        'database' => $db_name,
        'user' => $db_user,
        'password_masked' => substr($db_pass, 0, 2) . str_repeat('*', max(0, strlen($db_pass) - 4)) . substr($db_pass, -2),
    ],
    'connection' => [
        'status' => 'PENDING',
        'message' => '',
        'server_info' => null
    ],
    'table_status' => [
        'table_name' => 'senna_documents',
        'exists_before' => false,
        'created_now' => false,
        'columns' => [],
        'indexes' => []
    ],
    'crud_test' => [
        'insert_test' => false,
        'read_test' => false,
        'delete_test' => false,
        'message' => ''
    ],
    'collection_counts' => [],
    'overall_status' => 'FAILED'
];

$pdo = null;

// ==========================================
// 2. TES KONEKSI DATABASE
// ==========================================
try {
    $dsn = "mysql:host={$db_host};dbname={$db_name};charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
        PDO::ATTR_TIMEOUT            => 5
    ];
    $pdo = new PDO($dsn, $db_user, $db_pass, $options);
    
    // Ambil info server
    $versionStmt = $pdo->query("SELECT VERSION() as version, DATABASE() as db, CURRENT_USER() as user, @@character_set_database as charset");
    $serverInfo = $versionStmt->fetch();
    
    $results['connection']['status'] = 'SUCCESS';
    $results['connection']['message'] = 'Koneksi ke database MySQL Hostinger berhasil terhubung!';
    $results['connection']['server_info'] = $serverInfo;
} catch (PDOException $e) {
    $results['connection']['status'] = 'FAILED';
    $results['connection']['message'] = 'Koneksi gagal: ' . $e->getMessage();
    $results['connection']['error_code'] = $e->getCode();
}

// ==========================================
// 3. PEMERIKSAAN & AUTO-MIGRATE TABEL
// ==========================================
if ($pdo) {
    try {
        // Cek apakah tabel sudah ada sebelum migrasi
        $checkTableStmt = $pdo->prepare("
            SELECT COUNT(*) 
            FROM information_schema.tables 
            WHERE table_schema = :db AND table_name = 'senna_documents'
        ");
        $checkTableStmt->execute([':db' => $db_name]);
        $tableExists = (bool) $checkTableStmt->fetchColumn();
        $results['table_status']['exists_before'] = $tableExists;

        // Auto-create tabel jika belum ada
        $sqlCreate = "CREATE TABLE IF NOT EXISTS `senna_documents` (
            `id` VARCHAR(191) NOT NULL,
            `collection` VARCHAR(64) NOT NULL,
            `data` LONGTEXT NOT NULL,
            `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
            `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`collection`, `id`),
            INDEX `idx_collection` (`collection`),
            INDEX `idx_updated` (`updated_at`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";
        
        $pdo->exec($sqlCreate);

        if (!$tableExists) {
            $results['table_status']['created_now'] = true;
        }

        // Ambil daftar kolom tabel
        $colStmt = $pdo->query("DESCRIBE `senna_documents`");
        $results['table_status']['columns'] = $colStmt->fetchAll();

        // Ambil index tabel
        $idxStmt = $pdo->query("SHOW INDEX FROM `senna_documents`");
        $rawIndexes = $idxStmt->fetchAll();
        $indexedKeys = [];
        foreach ($rawIndexes as $idx) {
            $indexedKeys[$idx['Key_name']][] = $idx['Column_name'];
        }
        $results['table_status']['indexes'] = $indexedKeys;

        // ==========================================
        // 4. SELF-TEST TULIS, BACA, DAN HAPUS (CRUD)
        // ==========================================
        $testId = '__test_debug_' . time();
        $testCollection = '__system_test';
        $testPayload = json_encode(['test' => true, 'timestamp' => date('c'), 'message' => 'Self test ping']);

        // A. Insert test
        $insertStmt = $pdo->prepare("
            INSERT INTO `senna_documents` (`collection`, `id`, `data`, `updated_at`) 
            VALUES (:collection, :id, :data, NOW())
            ON DUPLICATE KEY UPDATE `data` = VALUES(`data`), `updated_at` = NOW()
        ");
        $insertStmt->execute([
            ':collection' => $testCollection,
            ':id' => $testId,
            ':data' => $testPayload
        ]);
        $results['crud_test']['insert_test'] = true;

        // B. Read test
        $readStmt = $pdo->prepare("SELECT `data` FROM `senna_documents` WHERE `collection` = :collection AND `id` = :id LIMIT 1");
        $readStmt->execute([':collection' => $testCollection, ':id' => $testId]);
        $readResult = $readStmt->fetch();
        if ($readResult && !empty($readResult['data'])) {
            $results['crud_test']['read_test'] = true;
        }

        // C. Delete test
        $delStmt = $pdo->prepare("DELETE FROM `senna_documents` WHERE `collection` = :collection AND `id` = :id");
        $delStmt->execute([':collection' => $testCollection, ':id' => $testId]);
        $results['crud_test']['delete_test'] = true;
        $results['crud_test']['message'] = 'Self-test CRUD (Insert, Select, Delete) sukses 100%!';

        // ==========================================
        // 5. STATISTIK KOLEKSI DATA
        // ==========================================
        $statsStmt = $pdo->query("SELECT `collection`, COUNT(*) as total FROM `senna_documents` GROUP BY `collection`");
        $rawStats = $statsStmt->fetchAll();
        $collectionMap = [];
        foreach ($rawStats as $stat) {
            $collectionMap[$stat['collection']] = (int) $stat['total'];
        }

        $standardCollections = ['products', 'banners', 'packages', 'gallery', 'orders', 'webSettings', 'registeredUsers'];
        foreach ($standardCollections as $sc) {
            $results['collection_counts'][$sc] = $collectionMap[$sc] ?? 0;
        }

        $results['overall_status'] = 'SUCCESS';

    } catch (PDOException $e) {
        $results['table_status']['error'] = $e->getMessage();
        $results['crud_test']['message'] = 'Pengujian tabel / CRUD gagal: ' . $e->getMessage();
    }
}

// ==========================================
// 6. OUTPUT FORMAT: JSON
// ==========================================
if ($is_json) {
    header('Content-Type: application/json; charset=UTF-8');
    echo json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit;
}

// ==========================================
// 7. OUTPUT FORMAT: TAMPILAN HTML LENGKAP
// ==========================================
header('Content-Type: text/html; charset=UTF-8');
$isSuccess = ($results['overall_status'] === 'SUCCESS');
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Debug Database MySQL Hostinger - Senna Gallery</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; }
        body { background: #0f172a; color: #f8fafc; padding: 24px; min-height: 100vh; display: flex; justify-content: center; }
        .container { max-width: 860px; width: 100%; }
        .header { background: #1e293b; border-radius: 16px; padding: 24px; margin-bottom: 20px; border: 1px solid #334155; }
        .badge { display: inline-block; padding: 6px 14px; border-radius: 9999px; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
        .badge-success { background: #10b981; color: #064e3b; }
        .badge-failed { background: #ef4444; color: #7f1d1d; }
        .badge-info { background: #3b82f6; color: #1e3a8a; }
        .card { background: #1e293b; border-radius: 14px; padding: 20px; margin-bottom: 18px; border: 1px solid #334155; }
        .card h2 { font-size: 16px; font-weight: 700; color: #94a3b8; margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; }
        .stat-box { background: #0f172a; padding: 14px; border-radius: 10px; border: 1px solid #334155; }
        .stat-label { font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase; }
        .stat-value { font-size: 18px; font-weight: 700; color: #f1f5f9; margin-top: 4px; word-break: break-all; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 13px; }
        th { text-align: left; background: #0f172a; padding: 10px 12px; color: #94a3b8; border-bottom: 1px solid #334155; }
        td { padding: 10px 12px; border-bottom: 1px solid #1e293b; color: #cbd5e1; }
        tr:hover td { background: rgba(255,255,255,0.02); }
        .code { font-family: monospace; background: #0f172a; padding: 3px 6px; border-radius: 4px; color: #38bdf8; font-size: 12px; }
        .btn { display: inline-flex; align-items: center; gap: 8px; background: #2563eb; color: #fff; padding: 10px 18px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 13px; transition: background 0.2s; border: none; cursor: pointer; }
        .btn:hover { background: #1d4ed8; }
        .btn-outline { background: transparent; border: 1px solid #475569; color: #94a3b8; }
        .btn-outline:hover { background: #334155; color: #fff; }
        .actions { display: flex; gap: 10px; margin-top: 20px; flex-wrap: wrap; }
    </style>
</head>
<body>
    <div class="container">
        <!-- HEADER -->
        <div class="header">
            <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 16px;">
                <div>
                    <h1 style="font-size: 22px; font-weight: 800; color: #fff; margin-bottom: 6px;">
                        Diagnostik Database MySQL Hostinger
                    </h1>
                    <p style="font-size: 14px; color: #94a3b8;">
                        Senna Gallery &amp; Wedding Attire (u689965173_sennadb)
                    </p>
                </div>
                <div>
                    <span class="badge <?php echo $isSuccess ? 'badge-success' : 'badge-failed'; ?>">
                        <?php echo $results['overall_status']; ?>
                    </span>
                </div>
            </div>
            <div style="margin-top: 16px; font-size: 12px; color: #64748b;">
                Pemeriksaan selesai pada: <strong><?php echo htmlspecialchars($results['timestamp']); ?></strong>
            </div>
        </div>

        <!-- STATUS KONEKSI -->
        <div class="card">
            <h2>
                <span>1. Status Koneksi &amp; Kredensial MySQL</span>
                <span class="badge <?php echo ($results['connection']['status'] === 'SUCCESS') ? 'badge-success' : 'badge-failed'; ?>">
                    <?php echo $results['connection']['status']; ?>
                </span>
            </h2>
            <p style="font-size: 14px; margin-bottom: 14px; color: <?php echo ($results['connection']['status'] === 'SUCCESS') ? '#34d399' : '#f87171'; ?>;">
                <?php echo htmlspecialchars($results['connection']['message']); ?>
            </p>
            <div class="grid">
                <div class="stat-box">
                    <div class="stat-label">Host</div>
                    <div class="stat-value"><span class="code"><?php echo htmlspecialchars($results['credentials']['host']); ?></span></div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">Database</div>
                    <div class="stat-value"><span class="code"><?php echo htmlspecialchars($results['credentials']['database']); ?></span></div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">User</div>
                    <div class="stat-value"><span class="code"><?php echo htmlspecialchars($results['credentials']['user']); ?></span></div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">Password</div>
                    <div class="stat-value"><span class="code"><?php echo htmlspecialchars($results['credentials']['password_masked']); ?></span></div>
                </div>
            </div>

            <?php if (!empty($results['connection']['server_info'])): ?>
            <div style="margin-top: 14px; padding-top: 14px; border-top: 1px solid #334155;" class="grid">
                <div class="stat-box">
                    <div class="stat-label">MySQL Server Version</div>
                    <div class="stat-value" style="font-size: 14px;"><?php echo htmlspecialchars($results['connection']['server_info']['version'] ?? '-'); ?></div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">Database Aktif</div>
                    <div class="stat-value" style="font-size: 14px;"><?php echo htmlspecialchars($results['connection']['server_info']['db'] ?? '-'); ?></div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">Charset Default</div>
                    <div class="stat-value" style="font-size: 14px;"><?php echo htmlspecialchars($results['connection']['server_info']['charset'] ?? '-'); ?></div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">PHP Version</div>
                    <div class="stat-value" style="font-size: 14px;"><?php echo htmlspecialchars(PHP_VERSION); ?></div>
                </div>
            </div>
            <?php endif; ?>
        </div>

        <!-- STATUS TABEL SENNA_DOCUMENTS -->
        <div class="card">
            <h2>
                <span>2. Struktur Tabel `senna_documents` (Auto-Migrate)</span>
                <span class="badge badge-success">TERSEDIA</span>
            </h2>
            <div style="margin-bottom: 12px; font-size: 13px; color: #94a3b8;">
                Tabel sebelum skrip: <strong><?php echo $results['table_status']['exists_before'] ? 'Sudah Ada' : 'Belum Ada'; ?></strong> |
                Dibuat otomatis oleh skrip ini: <strong><?php echo $results['table_status']['created_now'] ? 'Ya, Berhasil Dibuat Sekarang' : 'Tidak (Sudah Ada)'; ?></strong>
            </div>

            <?php if (!empty($results['table_status']['columns'])): ?>
            <div style="overflow-x: auto;">
                <table>
                    <thead>
                        <tr>
                            <th>Kolom</th>
                            <th>Tipe Data</th>
                            <th>Null</th>
                            <th>Key</th>
                            <th>Default</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($results['table_status']['columns'] as $col): ?>
                        <tr>
                            <td><strong style="color: #f8fafc;"><?php echo htmlspecialchars($col['Field']); ?></strong></td>
                            <td><span class="code"><?php echo htmlspecialchars($col['Type']); ?></span></td>
                            <td><?php echo htmlspecialchars($col['Null']); ?></td>
                            <td><span class="code" style="color: #fbbf24;"><?php echo htmlspecialchars($col['Key']); ?></span></td>
                            <td><?php echo htmlspecialchars($col['Default'] ?? 'NULL'); ?></td>
                        </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
            <?php endif; ?>
        </div>

        <!-- SELF TEST CRUD -->
        <div class="card">
            <h2>
                <span>3. Self-Test Operasi CRUD (Tulis, Baca, Hapus)</span>
                <span class="badge <?php echo ($results['crud_test']['delete_test']) ? 'badge-success' : 'badge-failed'; ?>">
                    <?php echo ($results['crud_test']['delete_test']) ? 'LULUS 100%' : 'GAGAL'; ?>
                </span>
            </h2>
            <p style="font-size: 13px; color: #34d399; margin-bottom: 12px;">
                <?php echo htmlspecialchars($results['crud_test']['message']); ?>
            </p>
            <div class="grid">
                <div class="stat-box">
                    <div class="stat-label">Insert / Tulis Data</div>
                    <div class="stat-value" style="color: #34d399; font-size: 14px;">
                        <?php echo $results['crud_test']['insert_test'] ? '✓ Berhasil' : '✗ Gagal'; ?>
                    </div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">Select / Baca Data</div>
                    <div class="stat-value" style="color: #34d399; font-size: 14px;">
                        <?php echo $results['crud_test']['read_test'] ? '✓ Berhasil' : '✗ Gagal'; ?>
                    </div>
                </div>
                <div class="stat-box">
                    <div class="stat-label">Delete / Hapus Data</div>
                    <div class="stat-value" style="color: #34d399; font-size: 14px;">
                        <?php echo $results['crud_test']['delete_test'] ? '✓ Berhasil' : '✗ Gagal'; ?>
                    </div>
                </div>
            </div>
        </div>

        <!-- JUMLAH DOKUMEN PER KATEGORI -->
        <div class="card">
            <h2>
                <span>4. Data Tersimpan di MySQL Saat Ini</span>
                <span class="badge badge-info">DATABASE AKTIF</span>
            </h2>
            <div class="grid">
                <?php foreach ($results['collection_counts'] as $collection => $count): ?>
                <div class="stat-box">
                    <div class="stat-label"><?php echo htmlspecialchars($collection); ?></div>
                    <div class="stat-value" style="color: <?php echo $count > 0 ? '#38bdf8' : '#64748b'; ?>;">
                        <?php echo number_format($count); ?> item
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
        </div>

        <!-- TOMBOL AKSI -->
        <div class="actions">
            <a href="debug_db.php?format=json" class="btn" target="_blank">
                Tampilkan Output JSON Mentah
            </a>
            <a href="api.php?action=test" class="btn btn-outline" target="_blank">
                Uji Endpoint api.php?action=test
            </a>
            <a href="api.php?action=get_all" class="btn btn-outline" target="_blank">
                Uji Endpoint api.php?action=get_all
            </a>
            <a href="javascript:location.reload();" class="btn btn-outline">
                Muat Ulang Diagnostik
            </a>
        </div>
    </div>
</body>
</html>
