import 'dotenv/config';

const base = process.env.BUILT_IN_FORGE_API_URL.replace(/\/+$/, '') + '/';
const key = process.env.BUILT_IN_FORGE_API_KEY;

// Maybe the file was stored under a different literal key. Test possibilities:
const candidates = [
  'invoices/ESCROW TAX-29_c21ab3ac.pdf',
  'invoices/ESCROW+TAX-29_c21ab3ac.pdf',
  'invoices/ESCROW%20TAX-29_c21ab3ac.pdf',
];

for (const objKey of candidates) {
  const u = new URL('v1/storage/presign/get?path=' + encodeURIComponent(objKey), base);
  const r = await fetch(u, { headers: { Authorization: 'Bearer ' + key } });
  const j = await r.json().catch(() => null);
  const url = j?.url;
  let dl = 'n/a';
  if (url) {
    const r2 = await fetch(url);
    dl = String(r2.status);
  }
  console.log(JSON.stringify(objKey), '->', dl);
}
