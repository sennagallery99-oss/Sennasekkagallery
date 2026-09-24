import { GoogleGenAI } from '@google/genai';

// Initialize Gemini Client safely
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY || '';
  if (!apiKey) {
    return null;
  }
  try {
    return new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (e) {
    return null;
  }
};

const SENNA_BOT_SYSTEM_INSTRUCTION = `
Anda adalah "Senna AI Stylist & Wedding Consultant", asisten virtual pintar dan ramah dari Senna Gallery & Sekka Decoration (website: sennagallery.com / sennagallery.com/sewa).
Lokasi Studio: Bandar Lampung, Lampung. WhatsApp Hotline: 0812-7883-9990.

TUGAS & PENGETAHUAN ANDA:
1. Menjawab seluruh pertanyaan seputar:
   - Koleksi Sewa Busana Premium Senna Gallery: Kebaya Pengantin Adat & Modern (Sunda Siger, Solo Putri, Jawa, Padang/Minang, Melayu, Modern Luxury), Jas & Tuxedo Pria Premium (Italian Cut, Slim Fit), Gaun Resepsi Mewah (Ballroom Gown, Mermaid Gown, A-Line), Aksesoris Pengantin (Siger Sunda, Sunting, Mahkota, Kalung).
   - Layanan Senna MUA Gallery: Rias pengantin flawless dewy-matte tahan 16 jam, MUA wisuda, prewedding, photoshoot.
   - Layanan Sekka Design Decoration: Dekorasi pelaminan luxury, backdrop akad/siraman, photobooth floral, table setting VIP.
   - Paket Wedding All-In Studio (Senna MUA + Sekka Decoration + Busana Lengkap).
   - Prosedur & Syarat Sewa Busana: Durasi standar 3 hari (H-1 ambil/kirim, Hari H acara, H+1 kembalikan), deposit jaminan Rp 200.000 (dikembalikan utuh), gratis cuci/dry-clean & sterilisasi UV oleh studio, jadwal fitting langsung di studio.
   - Lokasi Studio & Jadwal Fitting: Studio berlokasi di Jl. Pangeran Antasari, Bandar Lampung, buka setiap hari 09.00 - 20.00 WIB. Konsultasi dan jadwal fitting dapat langsung diatur melalui WhatsApp 0812-7883-9990.

ATURAN KETAT (GUARDRAIL BATASAN TOPIK):
- Anda HANYA diperbolehkan menjawab pertanyaan yang berkaitan dengan produk, katalog, harga, layanan sewa busana, paket pernikahan, MUA, dekorasi, jadwal fitting, dan informasi sennagallery.com.
- Jika pengguna menanyakan hal di luar topik sennagallery.com (contoh: coding programming, rumus matematika, politik dunia, selebriti acak, resep makanan umum, atau topik di luar Senna Gallery), dengan sopan dan ramah tolak dengan gaya bahasa:
  "Maaf, saya adalah asisten virtual khusus Senna Gallery & Sekka Decoration. Saya hanya dapat membantu Anda seputar koleksi sewa busana (kebaya, jas, gaun), paket pernikahan, makeup MUA, dekorasi, dan booking di sennagallery.com. Ada yang bisa saya bantu terkait kebutuhan busana atau pernikahan Anda?"
- Gunakan bahasa Indonesia yang santun, hangat, profesional, elegan, dan solutif layaknya konsultan pernikahan bintang lima.
- Selalu berikan rekomendasi busana atau paket yang relevan dengan kebutuhan pengguna jika mereka bertanya saran.
`;

/**
 * Helper to check if text contains exact word or phrase
 */
function hasWord(text: string, ...wordsOrPatterns: (string | RegExp)[]): boolean {
  for (const item of wordsOrPatterns) {
    if (typeof item === 'string') {
      const escaped = item.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      const regex = new RegExp(`(^|[^a-zA-Z0-9])${escaped}([^a-zA-Z0-9]|$)`, 'i');
      if (regex.test(text)) return true;
    } else if (item.test(text)) {
      return true;
    }
  }
  return false;
}

/**
 * Intelligent Senna Gallery Domain Knowledge Engine
 */
function generateSennaDomainResponse(query: string, currentProductContext?: any): string {
  const rawQuery = (query || '').trim();
  const q = rawQuery.toLowerCase();

  // 1. Guardrail check
  if (
    hasWord(q,
      'coding', 'javascript', 'python', 'html', 'css', 'react', 'program', 'function', 'class',
      'politik', 'presiden', 'pemilu', 'menteri', 'dpr', 'partai',
      'matematika', 'fisika', 'kimia', 'kalkulus', 'rumus',
      'resep', 'memasak', 'bitcoin', 'crypto', 'saham', 'investasi',
      'game', 'mobile legends', 'anime', 'manga', 'cuaca'
    )
  ) {
    return `Maaf, saya adalah asisten virtual khusus **Senna Gallery & Sekka Decoration**.\n\nSaya hanya dapat membantu Anda seputar koleksi sewa busana (kebaya pengantin, jas pria, gaun resepsi), paket pernikahan All-In, rias Senna MUA, dekorasi pelaminan Sekka Design, serta informasi dan booking di *sennagallery.com*.\n\nAda yang bisa saya bantu terkait busana atau acara pernikahan Anda? ✨`;
  }

  // 2. Cara Menyewa / Prosedur Sewa / Syarat Sewa
  if (
    hasWord(q,
      'cara menyewa', 'cara sewa', 'bagaimana menyewa', 'bagaimana cara sewa', 'gimana cara sewa',
      'alur sewa', 'prosedur sewa', 'tata cara sewa', 'langkah sewa', 'syarat sewa', 'syaratnya',
      'aturan sewa', 'durasi sewa', 'berapa hari', 'lama sewa', 'deposit', 'uang jaminan',
      'jaminan sewa', 'cuci', 'laundry', 'dry clean', 'pengembalian', 'denda', 'keterlambatan'
    ) ||
    (hasWord(q, 'cara', 'bagaimana', 'gimana', 'prosedur', 'alur', 'tata cara') && hasWord(q, 'sewa', 'menyewa', 'rental', 'booking', 'order', 'pesan'))
  ) {
    return `📋 **Cara & Syarat Sewa Busana di Senna Gallery:**\n\n` +
      `✨ **Alur Pemesanan & Sewa Sangat Mudah:**\n` +
      `1. **Pilih Busana**: Cari busana idaman di katalog online kami (*sennagallery.com/sewa/katalog*).\n` +
      `2. **Fitting Studio**: Lakukan fitting langsung di studio kami di Bandar Lampung untuk memastikan ukuran pas sempurna.\n` +
      `3. **Booking & DP**: Kunci tanggal acara Anda dengan DP untuk memastikan busana tidak dipesan orang lain.\n` +
      `4. **Pengambilan (H-1)**: Busana diambil dalam kondisi siap pakai, sudah disetrika rapi, dan steril.\n` +
      `5. **Pengembalian (H+1)**: Busana dikembalikan setelah acara selesai.\n\n` +
      `✨ **Ketentuan & Fasilitas:**\n` +
      `• **Durasi Sewa Standar**: **3 Hari** (H-1 Pengambilan, Hari H Acara, H+1 Pengembalian).\n` +
      `• **Deposit Jaminan**: KTP/SIM asli atau deposit jaminan yang **dikembalikan penuh 100%** saat busana kembali utuh.\n` +
      `• **Bebas Biaya Laundry**: Anda **tidak perlu mencuci busana** setelah acara; perawatan dry-cleaning & sterilisasi UV ditangani penuh oleh tim studio kami secara GRATIS!\n\n` +
      `Ingin konsultasi atau booking jadwal sewa sekarang? Hubungi Admin WhatsApp kami di **0812-7883-9990**!`;
  }

  // 3. Lokasi Studio / Alamat / Jam Buka / Jadwal Fitting
  if (
    hasWord(q,
      'lokasi', 'alamat', 'dimana', 'studio', 'bandar lampung', 'lampung',
      'jadwal fitting', 'jam buka', 'jam operasional', 'buka jam', 'tutup jam',
      'kontak', 'whatsapp', 'nomor wa', 'no wa', 'admin', 'telepon', 'call'
    ) ||
    (hasWord(q, 'cara', 'bagaimana', 'jadwal', 'booking', 'daftar') && hasWord(q, 'fitting', 'datang', 'kunjungan'))
  ) {
    return `📍 **Lokasi Studio & Jadwal Fitting Senna Gallery:**\n\n` +
      `• **Alamat Studio**: Jl. Pangeran Antasari, Bandar Lampung, Lampung.\n` +
      `• **Jam Operasional**: Buka Setiap Hari (Senin – Minggu) pukul **09.00 – 20.00 WIB**.\n` +
      `• **Hotline WhatsApp**: **0812-7883-9990** *(Konsultasi & Reservasi Jadwal)*.\n` +
      `• **Instagram Portofolio**: @sennamua_gallery & @sekkadecoration\n\n` +
      `📋 **Cara Menjadwalkan Fitting di Studio:**\n` +
      `1. Hubungi WhatsApp Admin di **0812-7883-9990**.\n` +
      `2. Sebutkan nama busana yang ingin dicoba dan rencana tanggal acara Anda.\n` +
      `3. Datang sesuai waktu yang disepakati untuk fitting langsung bersama fashion stylist kami! ✨`;
  }

  // 4. Specific Product Context
  const hasValidProduct = currentProductContext && typeof currentProductContext.name === 'string' && currentProductContext.name.trim().length > 0;
  if (
    hasValidProduct && 
    (hasWord(q, 'produk ini', 'baju ini', 'busana ini', 'kebaya ini', 'jas ini', 'gaun ini', 'harga ini', 'ukuran ini', 'stok ini', 'ready ini') ||
     (q.length < 15 && hasWord(q, 'ini', 'harga', 'ukuran', 'ready', 'bahan')))
  ) {
    return `Mengenai busana **${currentProductContext.name}**:\n\n` +
      `• **Kategori**: ${currentProductContext.categoryLabel || currentProductContext.category || 'Koleksi Busana'}\n` +
      `• **Harga Sewa**: ${currentProductContext.priceFormatted || (currentProductContext.price ? `Rp ${currentProductContext.price.toLocaleString('id-ID')}` : 'Tersedia di Katalog')} *(untuk durasi 3 hari sewa)*\n` +
      `• **Bahan/Material**: ${currentProductContext.material || 'Material premium dengan bordir & payet kristal mewah'}\n` +
      `• **Fasilitas**: Sudah termasuk *Bebas Biaya Laundry & Dry Clean* serta sterilisasi UV.\n\n` +
      `Tertarik dengan busana ini? Hubungi Admin WhatsApp kami di **0812-7883-9990** untuk reservasi jadwal fitting di studio!`;
  }

  // 5. Kebaya & Gaun Pengantin Wanita
  if (
    hasWord(q,
      'kebaya', 'sunda siger', 'siger', 'solo putri', 'basahan', 'adat jawa',
      'padang', 'minang', 'sunting', 'melayu', 'adat', 'gaun', 'dress',
      'ballroom', 'mermaid', 'resepsi', 'akad', 'pengantin wanita', 'mempelai wanita'
    )
  ) {
    return `✨ **Koleksi Busana Pengantin Wanita Senna Gallery:**\n\n` +
      `1. **Kebaya Pengantin Adat & Tradisional Modern**:\n` +
      `   • *Sunda Siger Luxury*: Kebaya brokat payet kristal lengkap mahkota siger & ronce melati.\n` +
      `   • *Solo Putri / Basahan*: Beludru halus berhias motif prada emas mewah.\n` +
      `   • *Adat Minang / Padang*: Baju kurung songket lengkap dengan Sunting bertingkat megah.\n` +
      `2. **Gaun Resepsi Modern (Ballroom & Mermaid Gown)**:\n` +
      `   • Gaun berekor panjang dengan detail taburan mutiara dan payet swarovski.\n\n` +
      `💡 *Seluruh sewa sudah termasuk aksesoris lengkap, gratis penyesuaian ukuran (custom fit), dan free dry cleaning!*\n\n` +
      `Lihat katalog lengkap di *sennagallery.com/sewa/katalog* atau konsultasi via WhatsApp di **0812-7883-9990**.`;
  }

  // 6. Jas & Tuxedo Pria
  if (
    hasWord(q,
      'jas', 'tuxedo', 'pria', 'groom', 'beskap', 'blazer', 'pengantin pria', 'suit'
    )
  ) {
    return `🤵 **Koleksi Jas & Beskap Pria Senna Gallery:**\n\n` +
      `• **Italian Cut Slim-Fit Suit**: Pilihan warna Black Classic, Navy Blue, Charcoal Grey, Khaki Beige, & Emerald Green.\n` +
      `• **Beskap Adat Pengantin**: Beskap Jawa Sikepan, Beskap Sunda, dan Melayu lengkap dengan kain songket & blangkon.\n` +
      `• **Kelengkapan Sewa**: Jas, rompi (vest), kemeja putih formal, celana panjang, dasi kupu-kupu/dasi panjang, dan pocket square.\n\n` +
      `Harga sewa mulai dari **Rp 175.000 – Rp 350.000 / 3 hari**. Hubungi WhatsApp **0812-7883-9990** untuk cek ukuran dan jadwal fitting!`;
  }

  // 7. Paket Wedding All-In
  if (
    hasWord(q,
      'paket', 'wedding', 'paket pernikahan', 'mua', 'rias', 'makeup',
      'dekorasi', 'sekka', 'pelaminan', 'backdrop', 'akad nikah', 'resepsi'
    )
  ) {
    return `💍 **Layanan Paket Pernikahan Senna Gallery & Sekka Decoration:**\n\n` +
      `1. **Layanan Senna MUA Gallery**:\n` +
      `   • Rias Pengantin Flawless Dewy-Matte (Tahan hingga 16 Jam tanpa crack).\n` +
      `   • Rias Ibu Mempelai, Bridesmaids, Prewedding, & MUA Wisuda.\n` +
      `2. **Layanan Sekka Design Decoration**:\n` +
      `   • Pelaminan Modern Minimalis / Luxury Floral (Lebar 6 – 12 meter).\n` +
      `   • Backdrop Akad Nikah, Gazebo Masuk, Karpet Jalan, Photobooth Floral VIP.\n` +
      `3. **Paket Bundling One-Stop Wedding**:\n` +
      `   • Kombinasi Busana Lengkap + Senna MUA + Dekorasi Sekka dengan penawaran harga spesial bundling!\n\n` +
      `Konsultasikan konsep pernikahan impian Anda bersama kami di WhatsApp **0812-7883-9990**.`;
  }

  // 8. Default Warm Greeting
  return `Halo! Terima kasih sudah menghubungi **Senna Gallery & Sekka Decoration** ✨\n\n` +
    `Saya dapat membantu Anda seputar:\n` +
    `• **Koleksi Sewa Busana** (Kebaya Pengantin, Jas Pria, Gaun Resepsi)\n` +
    `• **Cara & Syarat Sewa Busana** (Durasi 3 Hari, Free Dry Cleaning)\n` +
    `• **Paket Pernikahan & Rias Senna MUA**\n` +
    `• **Dekorasi Pelaminan Sekka Design**\n` +
    `• **Lokasi Studio & Reservasi Fitting di Bandar Lampung**\n\n` +
    `Silakan ketik pertanyaan Anda, atau hubungi konsultan kami langsung di WhatsApp **0812-7883-9990**!`;
}

/**
 * Handle Gemini Chat endpoint (/api/gemini/chat)
 */
export async function handleGeminiChat(reqBody: any): Promise<any> {
  const { messages, currentProductContext } = reqBody || {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return {
      status: 'error',
      message: 'Pesan chat tidak boleh kosong.',
    };
  }

  const lastUserMessage = [...messages].reverse().find((m: any) => m.role === 'user')?.text || '';

  const ai = getGeminiClient();

  if (!ai) {
    const fallbackReply = generateSennaDomainResponse(lastUserMessage, currentProductContext);
    return {
      status: 'success',
      reply: fallbackReply,
    };
  }

  try {
    let systemPrompt = SENNA_BOT_SYSTEM_INSTRUCTION;
    if (currentProductContext && currentProductContext.name) {
      systemPrompt += `\n\nKONTEKS PRODUK SAAT INI YANG SEDANG DILIHAT PENGGUNA:\n- Nama: ${currentProductContext.name}\n- Kategori: ${currentProductContext.categoryLabel || currentProductContext.category}\n- Harga: ${currentProductContext.priceFormatted || currentProductContext.price}\n- Deskripsi: ${currentProductContext.description || '-'}\n- Bahan: ${currentProductContext.material || '-'}\n- Kelengkapan: ${(currentProductContext.inclusions || []).join(', ')}`;
    }

    const contents = messages.map((m: any) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.text || '' }],
    }));

    let response: any = null;
    const modelCandidates = ['gemini-2.5-flash', 'gemini-1.5-flash'];

    for (const modelName of modelCandidates) {
      try {
        response = await ai.models.generateContent({
          model: modelName,
          contents: contents,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.7,
          },
        });
        if (response && response.text) break;
      } catch (err) {
        // Fallback silently
      }
    }

    const replyText = response?.text || generateSennaDomainResponse(lastUserMessage, currentProductContext);

    return {
      status: 'success',
      reply: replyText,
    };
  } catch (error) {
    const fallbackReply = generateSennaDomainResponse(lastUserMessage, currentProductContext);
    return {
      status: 'success',
      reply: fallbackReply,
    };
  }
}
