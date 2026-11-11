import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __cashappDirname = path.dirname(fileURLToPath(import.meta.url));
import bwipjs from 'bwip-js';
import fetch from 'node-fetch';
import { format } from 'date-fns';
import { storageGetSignedUrl } from './storage';

// Resolve relative /cdn/media/... or /manus-storage/... URLs to real fetchable URLs
async function resolveImageUrl(url: string): Promise<string> {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;
  let key = url;
  if (key.startsWith('/cdn/media/')) key = key.slice('/cdn/media/'.length);
  else if (key.startsWith('/manus-storage/')) key = key.slice('/manus-storage/'.length);
  else if (key.startsWith('/')) key = key.slice(1);
  try {
    return await storageGetSignedUrl(key);
  } catch (e) {
    console.error('Failed to presign image URL, falling back to localhost fetch:', e);
    const port = process.env.PORT || 3000;
    return `http://localhost:${port}${url.startsWith('/') ? url : '/' + url}`;
  }
}

export async function generateCashAppInvoicePdf(invoice: any): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4', autoFirstPage: false });
      doc.addPage();
      const buffers: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      const pageWidth = doc.page.width;
      const centerX = pageWidth / 2;

      // Helper to draw an image from URL
      const drawImage = async (url: string, x: number, y: number, opts: any) => {
        try {
          const resolved = await resolveImageUrl(url);
          const response = await fetch(resolved);
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const arrayBuf = await response.arrayBuffer();
          const buffer = Buffer.from(arrayBuf);
          doc.image(buffer, x, y, opts);
        } catch (err) {
          console.error('Failed to load image:', url, err);
        }
      };

      // Format currency
      const fmt = (val: string | number) => {
        const n = typeof val === 'string' ? parseFloat(val) : val;
        return `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      };

      const cashGreen = '#00D632';
      const darkText = '#1A1A1A';
      const grayText = '#6B7280';
      const lightGray = '#E5E7EB';

      // ============= HEADER =============
      // Cash App Logo - official logo image (user-provided), fallback to drawn version
      const logoSize = 50;
      const logoX = centerX - logoSize / 2;
      const logoY = 35;
      const logoPath = path.join(__cashappDirname, 'assets', 'cashapp-logo.png');
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, logoX, logoY, { width: logoSize, height: logoSize });
      } else {
        // Fallback: draw green rounded rectangle with white $ sign
        const logoR = 12;
        doc.save();
        doc.roundedRect(logoX, logoY, logoSize, logoSize, logoR).fill(cashGreen);
        doc.fontSize(30).font('Helvetica-Bold').fillColor('#FFFFFF')
           .text('$', logoX, logoY + 10, { width: logoSize, align: 'center' });
        doc.restore();
      }

      // "Cash App" text
      doc.fontSize(16).font('Helvetica-Bold').fillColor(darkText)
         .text('Cash App', 0, 95, { align: 'center', width: pageWidth });

      // Date/time
      const dateStr = format(new Date(invoice.createdAt || new Date()), 'MM/dd/yyyy, h:mm:ss a');
      doc.fontSize(10).font('Helvetica').fillColor(grayText)
         .text(dateStr, 0, 115, { align: 'center', width: pageWidth });

      // ============= AVATAR + CLIENT INFO =============
      const avatarY = 140;
      if (invoice.avatarUrl) {
        // Draw uploaded avatar image clipped to a circle
        doc.save();
        doc.circle(centerX, avatarY + 25, 25).clip();
        await drawImage(invoice.avatarUrl, centerX - 25, avatarY, { width: 50, height: 50 });
        doc.restore();
      } else {
        // Draw default initial circle (green background with white letter)
        // Extract first and last alphabetic letters from cashtag (e.g. $SarahJ2026 -> SJ)
      const tagLetters = (invoice.cashtag || invoice.clientName || 'CA').replace(/[^a-zA-Z]/g, '');
      const initial = tagLetters.length >= 2
        ? (tagLetters.charAt(0) + tagLetters.charAt(tagLetters.length - 1)).toUpperCase()
        : tagLetters.charAt(0).toUpperCase() || 'CA';
        doc.circle(centerX, avatarY + 25, 25).fill(cashGreen);
        doc.fontSize(initial.length > 1 ? 16 : 20).font('Helvetica-Bold').fillColor('#FFFFFF')
           .text(initial, centerX - 15, avatarY + (initial.length > 1 ? 16 : 14), { width: 30, align: 'center' });
      }

      // Client name below avatar
      doc.fontSize(12).font('Helvetica-Bold').fillColor(darkText)
         .text(invoice.clientName || '', 0, avatarY + 55, { align: 'center', width: pageWidth });

      // Cashtag below name
      const displayTag = invoice.cashtag || (invoice.senderName ? '$' + invoice.senderName.replace(/\s/g, '') : '');
      if (displayTag) {
        doc.fontSize(10).font('Helvetica').fillColor(grayText)
           .text('Payment to ' + displayTag, 0, avatarY + 72, { align: 'center', width: pageWidth });
      }

      // ============= DASHED SEPARATOR =============
      let y = 250;
      doc.moveTo(50, y).lineTo(pageWidth - 50, y).dash(3, { space: 3 }).lineWidth(0.5).strokeColor(grayText).stroke();
      doc.undash();

      // ============= TRANSACTION INFO =============
      y = 135;
      const leftCol = 60;
      const rightCol = pageWidth - 60;

      doc.fontSize(10).font('Helvetica').fillColor(darkText)
         .text('Transaction Type', leftCol, y);
      doc.fontSize(10).font('Helvetica-Bold').fillColor(darkText)
         .text('Payment Request', leftCol, y, { align: 'right', width: rightCol - leftCol });

      y += 25;
      doc.fontSize(10).font('Helvetica').fillColor(darkText)
         .text('From', leftCol, y);
      // From = the custom sender name typed in the admin form
      const fromName = invoice.senderName || invoice.clientName || 'Cash App';
      doc.fontSize(10).font('Helvetica-Bold').fillColor(darkText)
         .text(fromName, leftCol, y, { align: 'right', width: rightCol - leftCol });

      y += 25;
      doc.fontSize(10).font('Helvetica').fillColor(darkText)
         .text('To', leftCol, y);
      // To = the recipient's cashtag
      const toTag = invoice.cashtag ? (invoice.cashtag.startsWith('$') ? invoice.cashtag : `$${invoice.cashtag}`) : invoice.clientName;
      doc.fontSize(10).font('Helvetica-Bold').fillColor(darkText)
         .text(toTag, leftCol, y, { align: 'right', width: rightCol - leftCol });

      y += 25;
      // Only show Account/Bank if provided (not used for Cash App)
      if (invoice.accountNumber) {
        doc.fontSize(10).font('Helvetica').fillColor(darkText)
           .text('Account', leftCol, y);
        doc.fontSize(10).font('Helvetica-Bold').fillColor(darkText)
           .text(invoice.accountNumber, leftCol, y, { align: 'right', width: rightCol - leftCol });
        y += 20;
      }
      if (invoice.bankName) {
        doc.fontSize(10).font('Helvetica').fillColor(darkText)
           .text('Bank', leftCol, y);
        doc.fontSize(10).font('Helvetica-Bold').fillColor(darkText)
           .text(invoice.bankName, leftCol, y, { align: 'right', width: rightCol - leftCol });
        y += 20;
      }

      // ============= DASHED SEPARATOR =============
      y += 25;
      doc.moveTo(50, y).lineTo(pageWidth - 50, y).dash(3, { space: 3 }).lineWidth(0.5).strokeColor(grayText).stroke();
      doc.undash();

      // ============= NOTE / DESCRIPTION =============
      y += 15;
      doc.fontSize(10).font('Helvetica').fillColor(darkText)
         .text(`Note: ${invoice.description || ''}`, leftCol, y, { width: rightCol - leftCol });
      y = doc.y + 15;

      // ============= AMOUNT BREAKDOWN =============
      const amount = parseFloat(invoice.amount) || 0;
      const fee = invoice.feeAmount ? parseFloat(invoice.feeAmount) : 0;
      const total = amount + fee;

      doc.fontSize(10).font('Helvetica').fillColor(darkText)
         .text('Amount Sent', leftCol + 80, y);
      doc.fontSize(10).font('Helvetica-Bold').fillColor(darkText)
         .text(fmt(amount), leftCol, y, { align: 'right', width: rightCol - leftCol });

      y += 20;
      doc.fontSize(10).font('Helvetica').fillColor(darkText)
         .text('Fee', leftCol + 80, y);
      doc.fontSize(10).font('Helvetica-Bold').fillColor(darkText)
         .text(fmt(fee), leftCol, y, { align: 'right', width: rightCol - leftCol });

      y += 20;
      doc.fontSize(10).font('Helvetica-Bold').fillColor(darkText)
         .text('Total', leftCol + 80, y);
      doc.fontSize(10).font('Helvetica-Bold').fillColor(darkText)
         .text(fmt(total), leftCol, y, { align: 'right', width: rightCol - leftCol });

      // ============= DASHED LINE SEPARATOR =============
      y += 30;
      doc.moveTo(50, y).lineTo(pageWidth - 50, y).dash(3, { space: 3 }).lineWidth(0.5).strokeColor(grayText).stroke();
      doc.undash();

      // ============= PAYMENT METHOD & BALANCE =============
      y += 15;
      doc.fontSize(10).font('Helvetica').fillColor(darkText)
         .text('Payment Method', leftCol, y);
      const paymentMethodText = (invoice as any).paymentMethod || 'Held Cash App Balance';
      doc.fontSize(10).font('Helvetica-Bold').fillColor(darkText)
         .text(paymentMethodText, leftCol, y, { align: 'right', width: rightCol - leftCol });

      y += 20;
      const remaining = invoice.remainingBalance ? parseFloat(invoice.remainingBalance) : total;
      doc.fontSize(10).font('Helvetica').fillColor(darkText)
         .text('Restricted Balance', leftCol, y);
      doc.fontSize(10).font('Helvetica-Bold').fillColor(darkText)
         .text(fmt(remaining), leftCol, y, { align: 'right', width: rightCol - leftCol });

      // ============= STATUS =============
      y += 20;
      const txStatus = (invoice as any).txStatus || '';
      if (txStatus) {
        doc.fontSize(10).font('Helvetica').fillColor(darkText)
           .text('Status', leftCol, y);
        const statusColor = txStatus.toLowerCase() === 'held' ? '#CC0000' : '#E67E22';
        // Draw a small colored circle icon before the status text on the right
        const statusTextWidth = doc.widthOfString(txStatus);
        const statusIconX = rightCol - statusTextWidth - 14;
        doc.circle(statusIconX, y + 5, 4).fill(statusColor);
        doc.fontSize(10).font('Helvetica-Bold').fillColor(statusColor)
           .text(txStatus, leftCol, y, { align: 'right', width: rightCol - leftCol });
        y += 20;
      }

      // ============= DASHED SEPARATOR =============
      y += 30;
      doc.moveTo(50, y).lineTo(pageWidth - 50, y).dash(3, { space: 3 }).lineWidth(0.5).strokeColor(grayText).stroke();
      doc.undash();

      // ============= DUE DATE =============
      y += 15;
      doc.fontSize(10).font('Helvetica').fillColor(darkText)
         .text('Due Date', leftCol, y);
      doc.fontSize(10).font('Helvetica-Bold').fillColor(darkText)
         .text(format(new Date(invoice.dueDate), 'MMM d, yyyy'), leftCol, y, { align: 'right', width: rightCol - leftCol });

      // ============= CUSTOM MESSAGE / NOTES =============
      if (invoice.customMessage) {
        y += 30;
        doc.fontSize(9).font('Helvetica-Bold').fillColor(darkText)
           .text('Message:', leftCol, y);
        y += 14;
        const msg = String(invoice.customMessage);
        const fontSize = msg.length > 1500 ? 7 : (msg.length > 800 ? 8 : 9);
        doc.fontSize(fontSize).font('Helvetica').fillColor(darkText)
           .text(msg, leftCol, y, { width: rightCol - leftCol - 20, lineGap: 1.5 });
        y = doc.y + 10;
      } else {
        y += 15;
      }

      // ============= THANK YOU MESSAGE (GREEN) =============
      // Check if we need a new page
      if (y > doc.page.height - 200) {
        doc.addPage();
        y = 50;
      }

      y += 10;
      doc.fontSize(11).font('Helvetica-Bold').fillColor(cashGreen)
         .text('Thank you for using Cash App!', 0, y, { align: 'center', width: pageWidth });

      y += 30;
      doc.fontSize(9).font('Helvetica').fillColor(grayText)
         .text('Questions? Visit cash.app/help', 0, y, { align: 'center', width: pageWidth });
      y += 14;
      doc.fontSize(9).font('Helvetica').fillColor(grayText)
         .text('or email support@cash.app', 0, y, { align: 'center', width: pageWidth });

      // ============= DOUBLE LINE SEPARATOR =============
      y += 25;
      doc.moveTo(50, y).lineTo(pageWidth - 50, y).lineWidth(1).strokeColor(darkText).stroke();
      doc.moveTo(50, y + 3).lineTo(pageWidth - 50, y + 3).lineWidth(0.5).strokeColor(darkText).stroke();

      // ============= QR CODE / BARCODE =============
      y += 20;
      try {
        const barcodeBuffer = await bwipjs.toBuffer({
          bcid: 'qrcode',
          text: `cashapp://pay?ref=${invoice.reference}&amount=${amount}`,
          scale: 4,
          height: 14,
          width: 14,
        });
        doc.image(barcodeBuffer, centerX - 40, y, { width: 80, height: 80 });
        y += 70;
      } catch (err) {
        console.error('QR code generation failed:', err);
      }

      // ============= FOOTER =============
      // Ensure footer fits on current page (need ~60px)
      const footerHeight = 60;
      if (y + footerHeight > doc.page.height - 40) {
        doc.addPage();
        y = 50;
      } else {
        y += 10;
      }
      doc.fontSize(8).font('Helvetica').fillColor(grayText)
         .text('Block Inc.', 50, y, { align: 'center', width: pageWidth - 100 });
      doc.fontSize(8).font('Helvetica').fillColor(grayText)
         .text('1455 Market St, Suite 600', 50, y + 12, { align: 'center', width: pageWidth - 100 });
      doc.fontSize(8).font('Helvetica').fillColor(grayText)
         .text('San Francisco, CA 94103', 50, y + 24, { align: 'center', width: pageWidth - 100 });
      doc.fontSize(8).font('Helvetica').fillColor('#2563EB')
         .text('(855) 351-2274', 50, y + 36, { align: 'center', width: pageWidth - 100 });

      // ============= RED CIRCULAR 'HELD' STAMP OVERLAY =============
      if (invoice.stampText) {
        const orgName = invoice.stampText.toUpperCase();
        doc.save();
        // Position stamp over the amounts section, slightly rotated like a real stamp
        const stampX = pageWidth / 2;
        const stampY = 380;
        const R = 78; // outer radius
        doc.translate(stampX, stampY);
        doc.rotate(-18);
        doc.strokeOpacity(0.75).fillOpacity(0.75);
        // Outer thick circle
        doc.lineWidth(4).strokeColor('#CC0000').circle(0, 0, R).stroke();
        // Inner thin circle (double-ring stamp look)
        doc.lineWidth(1.5).circle(0, 0, R - 7).stroke();
        // Organization name curved along the top arc of the ring
        doc.font('Helvetica-Bold').fillColor('#CC0000');
        const orgChars = orgName.split('');
        const orgFontSize = orgName.length > 14 ? 10 : 12;
        doc.fontSize(orgFontSize);
        const textRadius = R - 17;
        // Compute total arc so text is centered at the top (-90deg)
        const charWidths = orgChars.map((c: string) => doc.widthOfString(c));
        const totalWidth = charWidths.reduce((a: number, b: number) => a + b, 0);
        const totalArc = totalWidth / textRadius; // radians
        let angle = -Math.PI / 2 - totalArc / 2;
        for (let ci = 0; ci < orgChars.length; ci++) {
          const w = charWidths[ci];
          const charArc = w / textRadius;
          const midAngle = angle + charArc / 2;
          const cx = Math.cos(midAngle) * textRadius;
          const cy = Math.sin(midAngle) * textRadius;
          doc.save();
          doc.translate(cx, cy);
          doc.rotate(((midAngle + Math.PI / 2) * 180) / Math.PI);
          doc.text(orgChars[ci], -w / 2, -orgFontSize / 2, { lineBreak: false });
          doc.restore();
          angle += charArc;
        }
        // Small decorative dots on the bottom arc
        const starAngles = [Math.PI / 2 - 0.55, Math.PI / 2, Math.PI / 2 + 0.55];
        for (const sa of starAngles) {
          const sx = Math.cos(sa) * textRadius;
          const sy = Math.sin(sa) * textRadius;
          doc.save();
          doc.translate(sx, sy);
          doc.rotate(((sa - Math.PI / 2) * 180) / Math.PI);
          doc.circle(0, 0, 2.5).fill('#CC0000');
          doc.restore();
        }
        // Horizontal rule lines above/below the central HELD word
        doc.lineWidth(2);
        doc.moveTo(-R + 26, -20).lineTo(R - 26, -20).stroke();
        doc.moveTo(-R + 26, 20).lineTo(R - 26, 20).stroke();
        // Central prominent HELD text
        doc.fontSize(30).font('Helvetica-Bold');
        const heldW = doc.widthOfString('HELD');
        doc.text('HELD', -heldW / 2, -15, { lineBreak: false });
        doc.restore();
      }

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}
