import 'dotenv/config';
import fs from 'fs';

async function main() {
  const { storagePut, storageGetSignedUrl } = await import('./server/storage.ts');
  const png = fs.readFileSync('/tmp/test-logo.png');
  const { key, url } = await storagePut('invoices/logos/test-logo.png', png, 'image/png');
  console.log('Uploaded:', key, url);
  const signed = await storageGetSignedUrl(key);
  const resp = await fetch(signed);
  console.log('Fetch status:', resp.status, resp.headers.get('content-type'));
  const { generateInvoicePdf } = await import('./server/invoicePdf.ts');
  const pdf = await generateInvoicePdf({
    reference: 'INV-TEST-0001',
    clientName: 'John Doe',
    clientEmail: 'john@example.com',
    accountNumber: '123456789',
    bankName: 'Test Bank',
    amount: '5000.00',
    currency: 'USD',
    description: 'Consulting services',
    dueDate: new Date(Date.now() + 7 * 86400000),
    createdAt: new Date(),
    customMessage: 'Thank you for your business.',
    topLogoUrl: url,
    bottomLogoUrl: url,
    feeAmount: '500.00',
    remainingBalance: '4500.00',
    invoiceType: 'due',
    senderName: 'Financial Institute',
  });
  fs.writeFileSync('/tmp/test-invoice.pdf', pdf);
  console.log('PDF written:', pdf.length, 'bytes');
}

main().catch((e) => { console.error('TEST FAILED:', e); process.exit(1); });
