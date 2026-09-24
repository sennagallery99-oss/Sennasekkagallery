import { jsPDF } from 'jspdf';
import { SewaOrder } from '../types/sewa';

/**
 * Helper to load an image URL into an HTMLImageElement asynchronously.
 * Supports crossOrigin anonymous to avoid tainted canvas issues.
 */
const loadImg = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = url;
  });
};

/**
 * Generates and downloads a highly-polished, professional PDF invoice/receipt
 * for an approved Sewa Order at Senna Gallery.
 * Includes a professional header with QR code verification and attached payment proof.
 */
export async function generateSewaReceiptPDF(order: SewaOrder) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  // Base configurations
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  const margin = 15;
  let y = 15;

  // Colors
  const primaryColor = [185, 28, 28]; // Red 700 / Rose
  const darkStone = [28, 25, 23];    // Stone 900
  const lightGray = [241, 245, 249];  // Slate 100
  const mediumGray = [120, 113, 108]; // Stone 500

  // Helper functions
  const drawLine = (yPos: number) => {
    doc.setDrawColor(226, 232, 240); // Slate 200
    doc.setLineWidth(0.3);
    doc.line(margin, yPos, pageWidth - margin, yPos);
  };

  // 1. Try loading QR code image asynchronously
  let qrImg: HTMLImageElement | null = null;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
    `Invoice ID: ${order.id}\nNama: ${order.userName}\nTotal: ${order.totalAmount}\nStatus: LUNAS & DISETUJUI`
  )}`;
  
  try {
    qrImg = await loadImg(qrUrl);
  } catch (e) {
    console.warn('Gagal memuat QR Code untuk PDF, akan menggunakan bentuk cap manual:', e);
  }

  // Header Left
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('SENNA GALLERY', margin, y);
  
  doc.setFontSize(8.5);
  doc.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2]);
  doc.setFont('Helvetica', 'normal');
  doc.text('Kebaya, Jas & Gaun Rental Official', margin, y + 5);
  doc.text('Jl. RA basyid, Gg Kemuning 2 No 28, Bandar Lampung', margin, y + 9);
  
  // Header Right (QR Code or stamp)
  if (qrImg) {
    // Render dynamic QR Code next to invoice title
    doc.addImage(qrImg, 'PNG', pageWidth - margin - 22, y - 4, 22, 22);
    
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(darkStone[0], darkStone[1], darkStone[2]);
    doc.text('BUKTI PENYEWAAN RESMI', pageWidth - margin - 25, y, { align: 'right' });
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2]);
    doc.text(`ID: #${order.id}`, pageWidth - margin - 25, y + 4.5, { align: 'right' });
    doc.text(`LUNAS & DISETUJUI`, pageWidth - margin - 25, y + 8.5, { align: 'right' });
    doc.setFontSize(6.5);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('Scan untuk verifikasi', pageWidth - margin - 25, y + 12.5, { align: 'right' });
  } else {
    // Fallback static invoice title
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(darkStone[0], darkStone[1], darkStone[2]);
    doc.text('BUKTI PENYEWAAN RESMI', pageWidth - margin, y, { align: 'right' });
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2]);
    doc.text(`ID: #${order.id}`, pageWidth - margin, y + 5, { align: 'right' });
    doc.text(`Status: LUNAS & DISETUJUI`, pageWidth - margin, y + 9, { align: 'right' });
  }

  y += 20;
  drawLine(y);
  y += 6;

  // 2. Info Studio & Info Penyewa (Two columns)
  doc.setFontSize(9);
  doc.setFont('Helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('STUDIO SENNA GALLERY', margin, y);
  doc.text('INFO PENYEWA', margin + 95, y);

  y += 5;
  doc.setFontSize(8);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(darkStone[0], darkStone[1], darkStone[2]);
  
  // Studio Details (Left col)
  const addressLines = [
    'Fajar Baru, Kec. Jati Agung,',
    'Bandar Lampung, Lampung 35415',
    'WhatsApp: +62 821-2623-3519',
    'Instagram: @senna_weddinggallery'
  ];
  let studioY = y;
  addressLines.forEach(line => {
    doc.text(line, margin, studioY);
    studioY += 4;
  });

  // Renter Details (Right col)
  const renterLines = [
    `Nama: ${order.userName}`,
    `Telepon: ${order.userPhone}`,
    `Email: ${order.userEmail || '-'}`,
    `Tgl Acara: ${order.rentalDate} (${order.rentalDurationDays} hari)`,
    `Metode: ${order.deliveryMethod === 'pickup_studio' ? 'Ambil di Studio' : 'Kirim via Ojol'}`
  ];
  let renterY = y;
  renterLines.forEach(line => {
    doc.text(line, margin + 95, renterY);
    renterY += 4;
  });

  y = Math.max(studioY, renterY) + 4;
  drawLine(y);
  y += 6;

  // 3. Detail Item Table Header
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(margin, y, pageWidth - (margin * 2), 7, 'F');
  
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('NAMA BUSANA / ITEM', margin + 3, y + 5);
  doc.text('UKURAN', margin + 85, y + 5, { align: 'center' });
  doc.text('WARNA', margin + 105, y + 5, { align: 'center' });
  doc.text('QTY', margin + 125, y + 5, { align: 'center' });
  doc.text('HARGA', margin + 145, y + 5, { align: 'right' });
  doc.text('SUBTOTAL', pageWidth - margin - 3, y + 5, { align: 'right' });

  y += 7;

  // 4. Detail Item Rows
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  
  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  };

  order.items.forEach((item, index) => {
    // Zebra striping background
    if (index % 2 === 1) {
      doc.setFillColor(250, 250, 249); // Stone 50
      doc.rect(margin, y, pageWidth - (margin * 2), 8, 'F');
    }
    
    doc.setTextColor(darkStone[0], darkStone[1], darkStone[2]);
    doc.text(item.product.name, margin + 3, y + 5.5);
    doc.text(item.selectedSize, margin + 85, y + 5.5, { align: 'center' });
    doc.text(item.selectedColor, margin + 105, y + 5.5, { align: 'center' });
    doc.text(`${item.quantity}x`, margin + 125, y + 5.5, { align: 'center' });
    doc.text(formatIDR(item.product.price), margin + 145, y + 5.5, { align: 'right' });
    doc.text(formatIDR(item.product.price * item.quantity), pageWidth - margin - 3, y + 5.5, { align: 'right' });
    
    y += 8;
  });

  drawLine(y);
  y += 6;

  // 5. Pricing Summary Box (Right alignment)
  const summaryX = pageWidth - margin - 75;
  doc.setFillColor(254, 243, 199); // Amber 100 background for highlights
  doc.rect(summaryX, y, 75, 24, 'F');
  doc.setDrawColor(251, 191, 36); // Amber 400 border
  doc.setLineWidth(0.3);
  doc.rect(summaryX, y, 75, 24, 'S');

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(darkStone[0], darkStone[1], darkStone[2]);
  
  doc.text('Subtotal Penyewaan:', summaryX + 3, y + 5);
  doc.text(formatIDR(order.subtotal), pageWidth - margin - 3, y + 5, { align: 'right' });

  doc.text('Deposit Jaminan:', summaryX + 3, y + 10);
  doc.text(formatIDR(order.deposit || 0), pageWidth - margin - 3, y + 10, { align: 'right' });

  // Custom line separator in pricing box
  doc.setDrawColor(252, 211, 77); // Amber 300
  doc.line(summaryX + 3, y + 13, pageWidth - margin - 3, y + 13);

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('TOTAL TERBAYAR:', summaryX + 3, y + 19);
  doc.text(formatIDR(order.totalAmount), pageWidth - margin - 3, y + 19, { align: 'right' });

  // 6. Terms & Directions (Left Side at same Y level)
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('SYARAT & KETENTUAN SEWA:', margin, y + 2);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(darkStone[0], darkStone[1], darkStone[2]);
  const terms = [
    '1. Pengambilan busana dapat dilakukan H-1 acara di Studio Senna.',
    '2. Pengembalian maksimal H+1 setelah tanggal sewa berakhir.',
    '3. Harap menjaga kondisi busana dari noda membandel atau kerusakan.',
    '4. Pencucian dilakukan eksklusif oleh tim Senna Gallery (GRATIS).',
    '5. Tunjukkan bukti cetak PDF ini sebagai bukti sah saat fitting/pengambilan.'
  ];
  let termY = y + 7;
  terms.forEach(term => {
    doc.text(term, margin, termY);
    termY += 4;
  });

  y += 32;

  // 7. Footer / Thank You Note
  drawLine(y);
  y += 5;

  doc.setFont('Helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2]);
  doc.text('Terima kasih telah mempercayakan kebutuhan busana spesial Anda bersama Senna Gallery.', pageWidth / 2, y, { align: 'center' });
  doc.text('Semoga acara Anda berjalan dengan lancar dan penuh kebahagiaan!', pageWidth / 2, y + 4.5, { align: 'center' });

  // 8. ADD PAGE 2: BUKTI PEMBAYARAN ATTACHMENT (Only if uploaded proof exists)
  if (order.paymentProofUrl) {
    try {
      // Add Page Break
      doc.addPage();
      let py = 15;

      // Header Page 2
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text('LAMPIRAN BUKTI TRANSFER & PEMBAYARAN', margin, py);

      doc.setFontSize(8.5);
      doc.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2]);
      doc.setFont('Helvetica', 'normal');
      doc.text(`Lampiran Resmi Invoice #${order.id} | Penyewa: ${order.userName}`, margin, py + 5.5);

      py += 9;
      doc.setDrawColor(226, 232, 240); // Slate 200
      doc.setLineWidth(0.3);
      doc.line(margin, py, pageWidth - margin, py);

      py += 8;

      // Description Box
      doc.setFillColor(248, 250, 252); // Slate 50
      doc.rect(margin, py, pageWidth - (margin * 2), 16, 'F');
      doc.setDrawColor(203, 213, 225); // Slate 300
      doc.rect(margin, py, pageWidth - (margin * 2), 16, 'S');

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(darkStone[0], darkStone[1], darkStone[2]);
      doc.text('Informasi Dokumen Transfer:', margin + 4, py + 5);
      
      doc.setFont('Helvetica', 'normal');
      doc.text(`• Tanggal Pengunggahan: ${order.rentalDate}`, margin + 4, py + 9);
      doc.text(`• Total Nominal Invoice: ${formatIDR(order.totalAmount)}`, margin + 4, py + 13);
      
      doc.text(`• Pengirim Terdaftar: ${order.userName}`, margin + 100, py + 5);
      doc.text('• Validitas: VALID & DISETUJUI ADMIN', margin + 100, py + 9);

      py += 24;

      // Draw Framed Box for Proof Image
      const boxWidth = 120;
      const boxHeight = 140;
      const boxX = (pageWidth - boxWidth) / 2;

      doc.setDrawColor(226, 232, 240); // Slate 200
      doc.setFillColor(250, 250, 249); // Stone 50 background for proof
      doc.rect(boxX, py, boxWidth, boxHeight, 'F');
      doc.rect(boxX, py, boxWidth, boxHeight, 'S');

      // Load Proof Image
      const proofImg = await loadImg(order.paymentProofUrl);
      
      // Calculate aspect ratio so the image fits perfectly inside the box without distortion
      const imgWidth = proofImg.naturalWidth || proofImg.width;
      const imgHeight = proofImg.naturalHeight || proofImg.height;
      const ratio = imgWidth / imgHeight;

      let drawW = boxWidth - 10;
      let drawH = drawW / ratio;

      if (drawH > boxHeight - 10) {
        drawH = boxHeight - 10;
        drawW = drawH * ratio;
      }

      const drawX = boxX + (boxWidth - drawW) / 2;
      const drawY = py + (boxHeight - drawH) / 2;

      // Render actual payment proof image!
      doc.addImage(proofImg, 'JPEG', drawX, drawY, drawW, drawH);

      // Caption at bottom
      py += boxHeight + 6;
      doc.setFont('Helvetica', 'italic');
      doc.setFontSize(7.5);
      doc.setTextColor(mediumGray[0], mediumGray[1], mediumGray[2]);
      doc.text(
        'Gambar di atas adalah bukti transfer asli yang diunggah oleh penyewa pada sistem transaksi online Senna Gallery.',
        pageWidth / 2,
        py,
        { align: 'center' }
      );
    } catch (e) {
      console.warn('Gagal melampirkan gambar bukti transfer ke PDF:', e);
    }
  }

  // Save the PDF
  doc.save(`Invoice_SennaGallery_${order.id}.pdf`);
}
