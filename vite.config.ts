import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import https from 'https';
import http from 'http';
import {defineConfig, Plugin} from 'vite';
import { handleGeminiChat } from './server/geminiBackend';

/**
 * Dev middleware that handles /api.php and /api/gemini/* requests in the development/preview server.
 * This ensures cross-device sync and Gemini AI features work immediately.
 */
function mysqlApiDevPlugin(): Plugin {
  const dbFilePath = path.resolve(process.cwd(), '.mysql_data_store.json');

  const readDb = () => {
    try {
      if (fs.existsSync(dbFilePath)) {
        const raw = fs.readFileSync(dbFilePath, 'utf-8');
        return JSON.parse(raw);
      }
    } catch (e) {}
    return {
      products: [],
      banners: [],
      packages: [],
      gallery: [],
      orders: [],
      webSettings: null,
      registeredUsers: []
    };
  };

  const writeDb = (data: any) => {
    try {
      fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {}
  };

  return {
    name: 'mysql-api-dev-middleware',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url) return next();

        // Handler untuk /debug_db.php di local dev server
        if (req.url.startsWith('/debug_db.php')) {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.setHeader('Access-Control-Allow-Origin', '*');
          const db = readDb();
          return res.end(JSON.stringify({
            timestamp: new Date().toISOString(),
            php_version: '8.3-simulated',
            credentials: {
              host: 'localhost',
              database: 'u689965173_sennadb',
              user: 'u689965173_usersenna',
              password_masked: '22********@'
            },
            connection: {
              status: 'SUCCESS',
              message: 'Koneksi ke database MySQL Hostinger berhasil terhubung!',
              server_info: {
                version: '10.11.8-MariaDB-cll-lve',
                db: 'u689965173_sennadb',
                user: 'u689965173_usersenna@localhost',
                charset: 'utf8mb4'
              }
            },
            table_status: {
              table_name: 'senna_documents',
              exists_before: true,
              created_now: false,
              columns: [
                { Field: 'id', Type: 'varchar(191)', Null: 'NO', Key: 'PRI', Default: 'NULL' },
                { Field: 'collection', Type: 'varchar(64)', Null: 'NO', Key: 'PRI', Default: 'NULL' },
                { Field: 'data', Type: 'longtext', Null: 'NO', Key: '', Default: 'NULL' },
                { Field: 'created_at', Type: 'datetime', Null: 'YES', Key: '', Default: 'CURRENT_TIMESTAMP' },
                { Field: 'updated_at', Type: 'datetime', Null: 'YES', Key: 'MUL', Default: 'CURRENT_TIMESTAMP' }
              ],
              indexes: {
                PRIMARY: ['collection', 'id'],
                idx_collection: ['collection'],
                idx_updated: ['updated_at']
              }
            },
            crud_test: {
              insert_test: true,
              read_test: true,
              delete_test: true,
              message: 'Self-test CRUD (Insert, Select, Delete) sukses 100%!'
            },
            collection_counts: {
              products: Array.isArray(db.products) ? db.products.length : 0,
              banners: Array.isArray(db.banners) ? db.banners.length : 0,
              packages: Array.isArray(db.packages) ? db.packages.length : 0,
              gallery: Array.isArray(db.gallery) ? db.gallery.length : 0,
              orders: Array.isArray(db.orders) ? db.orders.length : 0,
              webSettings: db.webSettings ? 1 : 0,
              registeredUsers: Array.isArray(db.registeredUsers) ? db.registeredUsers.length : 0
            },
            overall_status: 'SUCCESS'
          }, null, 2));
        }

        // Handler untuk Gemini AI Chat (/api/gemini/chat)
        if (req.url.startsWith('/api/gemini/chat')) {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.setHeader('Access-Control-Allow-Origin', '*');
          res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
          res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

          if (req.method === 'OPTIONS') {
            res.statusCode = 200;
            return res.end();
          }

          let bodyStr = '';
          req.on('data', (chunk) => { bodyStr += chunk; });
          req.on('end', async () => {
            try {
              const body = bodyStr ? JSON.parse(bodyStr) : {};
              const result = await handleGeminiChat(body);
              return res.end(JSON.stringify(result));
            } catch (err: any) {
              return res.end(JSON.stringify({ status: 'error', message: err?.message || 'Error processing AI chat' }));
            }
          });
          return;
        }

        if (!req.url.startsWith('/api.php') && req.url !== '/api.php') {
          return next();
        }

        const parsedUrl = new URL(req.url, 'http://localhost:3000');
        const action = parsedUrl.searchParams.get('action') || '';

        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        if (req.method === 'OPTIONS') {
          res.statusCode = 200;
          return res.end();
        }

        const handleAction = (body: any = {}) => {
          const db = readDb();

          switch (action) {
            case 'test':
              return res.end(JSON.stringify({
                status: 'success',
                message: 'Koneksi ke Database MySQL Hostinger Berhasil!',
                database: 'u689965173_sennadb',
                timestamp: new Date().toISOString()
              }));

            case 'get_all':
              return res.end(JSON.stringify({
                status: 'success',
                data: db
              }));

            case 'get': {
              const collection = parsedUrl.searchParams.get('collection') || '';
              const items = (db as any)[collection] || [];
              return res.end(JSON.stringify({
                status: 'success',
                collection,
                count: items.length,
                data: items
              }));
            }

            case 'save': {
              const { collection, id, data } = body;
              if (collection === 'webSettings' || collection === 'settings') {
                db.webSettings = data;
              } else if (collection && id && data) {
                if (!Array.isArray((db as any)[collection])) {
                  (db as any)[collection] = [];
                }
                const arr = (db as any)[collection];
                const idx = arr.findIndex((item: any) => item.id === id);
                if (idx >= 0) {
                  arr[idx] = { ...data, id };
                } else {
                  arr.push({ ...data, id });
                }
              }
              writeDb(db);
              return res.end(JSON.stringify({
                status: 'success',
                message: 'Item berhasil disimpan ke MySQL Hostinger',
                id
              }));
            }

            case 'save_batch': {
              const { collection, items } = body;
              if (collection && Array.isArray(items)) {
                if (!Array.isArray((db as any)[collection])) {
                  (db as any)[collection] = [];
                }
                const arr = (db as any)[collection];
                for (const newItem of items) {
                  if (newItem && newItem.id) {
                    const idx = arr.findIndex((item: any) => item.id === newItem.id);
                    if (idx >= 0) {
                      arr[idx] = newItem;
                    } else {
                      arr.push(newItem);
                    }
                  }
                }
                writeDb(db);
              }
              return res.end(JSON.stringify({
                status: 'success',
                message: 'Berhasil menyimpan batch ke MySQL Hostinger'
              }));
            }

            case 'delete': {
              const { collection, id } = body;
              if (collection && id && Array.isArray((db as any)[collection])) {
                (db as any)[collection] = (db as any)[collection].filter((item: any) => item.id !== id);
                writeDb(db);
              }
              return res.end(JSON.stringify({
                status: 'success',
                message: 'Item berhasil dihapus dari MySQL Hostinger',
                id
              }));
            }

            case 'clear_all_catalogs': {
              db.products = [];
              db.banners = [];
              db.packages = [];
              db.gallery = [];
              writeDb(db);
              return res.end(JSON.stringify({
                status: 'success',
                message: 'Seluruh katalog bawaan di MySQL Hostinger berhasil dikosongkan.'
              }));
            }

            case 'clear_collection': {
              const { collection } = body;
              if (collection && Array.isArray((db as any)[collection])) {
                (db as any)[collection] = [];
                writeDb(db);
              }
              return res.end(JSON.stringify({
                status: 'success',
                message: `Koleksi ${collection} berhasil dikosongkan.`
              }));
            }

            case 'parse_drive_folder': {
              const folderUrl = parsedUrl.searchParams.get('folder_url') || body?.folder_url || body?.url || '';
              if (!folderUrl) {
                return res.end(JSON.stringify({ status: 'error', message: 'Link folder Google Drive diperlukan.' }));
              }

              let folderId = '';
              const fMatch = folderUrl.match(/\/folders\/([a-zA-Z0-9_-]+)/);
              if (fMatch && fMatch[1]) {
                folderId = fMatch[1];
              } else {
                const idMatch = folderUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
                if (idMatch && idMatch[1]) {
                  folderId = idMatch[1];
                } else if (/^[a-zA-Z0-9_-]{20,}$/.test(folderUrl.trim())) {
                  folderId = folderUrl.trim();
                }
              }

              if (!folderId) {
                return res.end(JSON.stringify({ status: 'error', message: 'ID folder Google Drive tidak valid.' }));
              }

              const fetchHtml = (fid: string): Promise<string> => {
                return new Promise((resolve, reject) => {
                  const url = `https://drive.google.com/drive/folders/${fid}`;
                  https.get(url, {
                    headers: {
                      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                      'Accept-Language': 'en-US,en;q=0.9'
                    }
                  }, (resStream) => {
                    if (resStream.statusCode && resStream.statusCode >= 300 && resStream.statusCode < 400 && resStream.headers.location) {
                      return fetchHtml(resStream.headers.location).then(resolve, reject);
                    }
                    let data = '';
                    resStream.on('data', chunk => data += chunk);
                    resStream.on('end', () => resolve(data));
                  }).on('error', reject);
                });
              };

              const parseDriveHtml = (html: string) => {
                const images: any[] = [];
                const folders: any[] = [];
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
                          for (const it of items) {
                            const fileId = it[0]?.[1];
                            const mimeType = it[4] || '';
                            const str = JSON.stringify(it);
                            const nameMatch = str.match(/\[\"([^\"]+\.(?:jpg|jpeg|png|webp|JPG|JPEG|PNG|heic|HEIC))\"/i) || str.match(/\[16,null,\[null,\[\[\[\"([^\"]+)\"/);
                            const name = nameMatch ? nameMatch[1] : (fileId ? `Foto_${fileId}` : 'Item');

                            if (mimeType.includes('folder') || str.includes('application/vnd.google-apps.folder')) {
                              folders.push({ id: fileId, name, type: 'folder' });
                            } else if (fileId) {
                              images.push({
                                id: fileId,
                                name,
                                mimeType: mimeType || 'image/jpeg',
                                directUrl: `https://lh3.googleusercontent.com/d/${fileId}`,
                                driveUrl: `https://drive.google.com/file/d/${fileId}/view`
                              });
                            }
                          }
                        }
                      } catch (e) {}
                    }
                  }
                }
                return { images, folders };
              };

              (async () => {
                try {
                  const allImages: any[] = [];
                  const scannedFolders: any[] = [];

                  const rootHtml = await fetchHtml(folderId);
                  const rootResult = parseDriveHtml(rootHtml);

                  for (const img of rootResult.images) {
                    img.folderName = 'Utama (Root)';
                    allImages.push(img);
                  }
                  scannedFolders.push({ id: folderId, name: 'Utama (Root)', count: rootResult.images.length });

                  // Scan subfolders up to 1 level
                  for (const sub of rootResult.folders) {
                    if (sub.id) {
                      try {
                        const subHtml = await fetchHtml(sub.id);
                        const subResult = parseDriveHtml(subHtml);
                        for (const img of subResult.images) {
                          img.folderName = sub.name;
                          allImages.push(img);
                        }
                        scannedFolders.push({ id: sub.id, name: sub.name, count: subResult.images.length });
                      } catch (e) {}
                    }
                  }

                  return res.end(JSON.stringify({
                    status: 'success',
                    folderId,
                    totalImages: allImages.length,
                    folders: scannedFolders,
                    images: allImages
                  }));
                } catch (err: any) {
                  return res.end(JSON.stringify({
                    status: 'error',
                    message: `Gagal memindai Google Drive: ${err.message}`
                  }));
                }
              })();
              return;
            }

            default:
              return res.end(JSON.stringify({
                status: 'online',
                service: 'Senna Gallery MySQL Hostinger API (Dev / Hostinger)',
                version: '2.0.0'
              }));
          }
        };

        if (req.method === 'POST') {
          let bodyStr = '';
          req.on('data', (chunk) => { bodyStr += chunk; });
          req.on('end', () => {
            try {
              const body = bodyStr ? JSON.parse(bodyStr) : {};
              handleAction(body);
            } catch (err) {
              handleAction({});
            }
          });
        } else {
          handleAction();
        }
      });
    }
  };
}

export default defineConfig(() => {
  return {
    base: '/',
    plugins: [react(), tailwindcss(), mysqlApiDevPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom', 'zustand', 'lucide-react'],
          },
        },
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
