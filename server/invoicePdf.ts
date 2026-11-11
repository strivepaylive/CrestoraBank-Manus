import PDFDocument from 'pdfkit';
import bwipjs from 'bwip-js';
import fetch from 'node-fetch';
import { format } from 'date-fns';
import { storageGetSignedUrl } from './storage';

// Resolve relative /cdn/media/... or /manus-storage/... URLs to real fetchable URLs
async function resolveImageUrl(url: string): Promise<string> {
  if (!url) return url;
  if (/^https?:\/\//i.test(url)) return url;
  // relative path served by our storage proxy — presign directly from S3
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

export async function generateInvoicePdf(invoice: any): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 50, size: 'A4', autoFirstPage: false });
      doc.addPage();
      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      const fmt = (val: any) => `${invoice.currency} ${parseFloat(val || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
      const amountStr = fmt(invoice.amount);
      const dueNowStr = fmt(invoice.feeAmount || invoice.amount);

      // Helper to draw image
      const drawImage = async (url: string, x: number, y: number, options: any) => {
        try {
          const resolvedUrl = await resolveImageUrl(url);
          if (!resolvedUrl) return;
          const res = await fetch(resolvedUrl);
          if (!res.ok) throw new Error(`Failed to fetch image: ${res.statusText}`);
          const buffer = await res.buffer();
          doc.image(buffer, x, y, options);
        } catch (err) {
          console.error('Error drawing image:', err);
        }
      };

      // 1. Top Left Logo
      if (invoice.topLogoUrl) {
        await drawImage(invoice.topLogoUrl, 50, 45, { fit: [140, 90] });
      }

      // 2. Company Details (Middle)
      doc.fontSize(12).font('Helvetica-Bold').text('Escrow.com', 200, 50);
      doc.fontSize(10).font('Helvetica').text('180 Montgomery Street suite 650, San', 200, 65);
      doc.text('Francisco, CA, USA', 200, 77);
      doc.text('8886911900', 200, 92);
      doc.text('no-reply@escrow.com', 200, 107);

      // 3. Header Details (Right)
      doc.fontSize(8).font('Helvetica').text('INVOICE', 400, 50, { align: 'right' });
      doc.fontSize(10).font('Helvetica').text(invoice.reference, { align: 'right' });
      doc.moveDown(0.5);
      doc.fontSize(8).font('Helvetica').text('DATE', { align: 'right' });
      doc.fontSize(10).font('Helvetica').text(format(new Date(), 'd MMM yyyy'), { align: 'right' });
      doc.moveDown(0.5);
      doc.fontSize(8).font('Helvetica').text('DUE', { align: 'right' });
      doc.fontSize(10).font('Helvetica').text('On Receipt', { align: 'right' });
      doc.moveDown(0.5);
      doc.fontSize(8).font('Helvetica').text('PAYMENT DUE', { align: 'right' });
      doc.fontSize(10).font('Helvetica').text(dueNowStr, { align: 'right' });

      // 4. Bill To (Left)
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#333333').text('BILL TO', 50, 180);
      doc.fontSize(12).font('Helvetica').fillColor('#000000').text(invoice.clientName, 50, 195);
      doc.fontSize(10).font('Helvetica').text(invoice.clientEmail, 50, 215);
      let billToY = 230;
      if (invoice.accountNumber) {
        doc.fontSize(10).font('Helvetica').text(`Account No: ${invoice.accountNumber}`, 50, billToY);
        billToY += 13;
      }
      if (invoice.bankName) {
        doc.fontSize(10).font('Helvetica').text(`Bank: ${invoice.bankName}`, 50, billToY);
      }

      // 5. Line Items Table
      const tableTop = 275;
      doc.moveTo(50, tableTop - 10).lineTo(550, tableTop - 10).lineWidth(1).strokeColor('#000000').stroke();
      
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#333333');
      doc.text('DESCRIPTION', 50, tableTop);
      doc.text('RATE', 320, tableTop, { width: 90, align: 'right' });
      doc.text('QTY', 430, tableTop, { width: 30, align: 'right' });
      doc.text('AMOUNT', 470, tableTop, { width: 80, align: 'right' });
      
      doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).lineWidth(0.5).strokeColor('#cccccc').stroke();
      
      doc.fontSize(10).font('Helvetica').fillColor('#000000');
      const itemY = tableTop + 25;
      doc.text(invoice.description, 50, itemY);
      doc.text(amountStr, 320, itemY, { width: 90, align: 'right' });
      doc.text('1', 430, itemY, { width: 30, align: 'right' });
      doc.text(amountStr, 470, itemY, { width: 80, align: 'right' });
      
      doc.moveTo(50, itemY + 20).lineTo(550, itemY + 20).lineWidth(0.5).strokeColor('#cccccc').stroke();

      // 6. Totals Section (Right)
      const totalY = itemY + 35;
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#333333').text('TOTAL', 280, totalY);
      doc.fontSize(10).font('Helvetica').fillColor('#000000').text(amountStr, 470, totalY, { width: 80, align: 'right' });
      
      doc.moveTo(280, totalY + 15).lineTo(550, totalY + 15).lineWidth(0.5).strokeColor('#cccccc').stroke();
      
      const paymentDueY = totalY + 25;
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#333333').text('PAYMENT DUE', 280, paymentDueY, { align: 'right' });
      doc.fontSize(16).font('Helvetica-Bold').fillColor('#000000').text(dueNowStr, 280, paymentDueY + 12, { align: 'right' });
      
      doc.moveTo(280, paymentDueY + 35).lineTo(550, paymentDueY + 35).lineWidth(0.5).strokeColor('#cccccc').stroke();

      // 7. Upcoming Payments
      const upcomingY = paymentDueY + 55;
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#333333').text('UPCOMING PAYMENTS', 280, upcomingY);
      
      doc.fontSize(10).font('Helvetica').fillColor('#000000').text('Payment', 280, upcomingY + 15);
      doc.fontSize(9).font('Helvetica').fillColor('#666666').text(`Due ${format(new Date(invoice.dueDate), 'd MMM yyyy')}`, 280, upcomingY + 28);
      doc.fontSize(10).font('Helvetica').fillColor('#000000').text(dueNowStr, 470, upcomingY + 15, { width: 80, align: 'right' });
      
      doc.moveTo(280, upcomingY + 45).lineTo(550, upcomingY + 45).lineWidth(0.5).strokeColor('#cccccc').stroke();

      // 8. Balance Remaining
      const balanceY = upcomingY + 55;
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#333333').text('BALANCE REMAINING', 280, balanceY);
      doc.fontSize(10).font('Helvetica').fillColor('#000000').text(fmt(invoice.remainingBalance || invoice.amount), 470, balanceY, { width: 80, align: 'right' });

      // 9. Barcode and Date Signed
      const barcodeY = balanceY + 40;
      try {
        const barcodeBuffer = await bwipjs.toBuffer({
          bcid: 'code128',
          text: invoice.reference,
          scale: 4,
          height: 14,
          includetext: false,
        });
        doc.image(barcodeBuffer, 280, barcodeY, { width: 150, height: 45 });
      } catch (err) {
        console.error('Barcode generation failed:', err);
      }
      
      doc.fontSize(9).font('Helvetica-Bold').fillColor('#333333').text('DATE SIGNED', 280, barcodeY + 55);
      doc.fontSize(10).font('Helvetica').fillColor('#000000').text(format(new Date(), 'd MMM yyyy'), 280, barcodeY + 68);

      // 9b. Custom message / write-up (left side, aligned with barcode block)
      // Track how far the left column extends so the footer never overlaps it
      let leftColumnBottom = barcodeY;
      if (invoice.customMessage) {
        const message = String(invoice.customMessage);
        // Short notes sit beside the barcode; long notes flow below the
        // barcode block at full page width so they stay compact and readable.
        const isLong = message.length > 260;
        const isVeryLong = message.length > 1000;
        const isExtremelyLong = message.length > 1500;
        const notesTop = isLong ? barcodeY + 90 : barcodeY;
        const notesWidth = isLong ? 500 : 210;
        const fontSize = isExtremelyLong ? 6.5 : (isVeryLong ? 7.5 : (isLong ? 8.5 : 9));
        doc.fontSize(9).font('Helvetica-Bold').fillColor('#333333').text('NOTES', 50, notesTop);
        doc.fontSize(fontSize).font('Helvetica').fillColor('#000000').text(message, 50, notesTop + 12, { width: notesWidth, lineGap: 1 });
        // doc.y is where the text flow ended after rendering the notes
        leftColumnBottom = Math.max(leftColumnBottom, doc.y);
      }
      if (invoice.senderName) {
        const fromY = Math.max(barcodeY + 68, leftColumnBottom + 8);
        doc.fontSize(8.5).font('Helvetica').fillColor('#666666').text(`From: ${invoice.senderName}`, 50, fromY, { width: 500 });
        leftColumnBottom = Math.max(leftColumnBottom, doc.y);
      }


      // 10. Footer Logo and Text (bottom-left, like a letter sign-off)
      const footerBlockHeight = 60 + 15 + 18 + 14 + 12; // logo + gap + text lines
      let footerY = Math.max(barcodeY + 120, leftColumnBottom + 18);
      if (footerY + footerBlockHeight > doc.page.height - 40) {
        doc.addPage();
        footerY = 50;
      }
      const logoSize = 60;
      const leftX = 50; // Left margin

      // Draw the escrow logo at the left
      await drawImage('/manus-storage/escrow-hold-logo_d25e84e0.png', leftX, footerY, { width: logoSize, height: logoSize });

      // Draw the text below the logo, left-aligned
      const textY = footerY + logoSize + 15;
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#000000').text('PAYMENT SUCCESSFUL', leftX, textY);
      doc.fontSize(10).font('Helvetica-Bold').text('WITHHELD BY ESCROW TAX', leftX, textY + 18);

      // Draw a padlock icon before the last line
      const padY = textY + 32;
      const padX = leftX;

      // Draw padlock body
      doc.roundedRect(padX, padY + 3, 8, 6, 1).fillColor('#000000').fill();

      // Draw padlock shackle
      doc.path(`M ${padX + 2} ${padY + 3} V ${padY + 1} A 2 2 0 0 1 ${padX + 6} ${padY + 1} V ${padY + 3}`)
         .lineWidth(1.5).strokeColor('#000000').stroke();

      doc.fontSize(10).font('Helvetica-Bold').fillColor('#000000').text('3D SESCURED/PAYROLL', padX + 13, padY + 1);

      doc.end();

    } catch (error) {
      reject(error);
    }
  });
}
