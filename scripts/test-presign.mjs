import 'dotenv/config';

const base = process.env.BUILT_IN_FORGE_API_URL.replace(/\/+$/, '') + '/';
const key = process.env.BUILT_IN_FORGE_API_KEY;
const objKey = 'invoices/ESCROW TAX-29_c21ab3ac.pdf';

// Variant 1: URLSearchParams (encodes space as +)
const u1 = new URL('v1/storage/presign/get', base);
u1.searchParams.set('path', objKey);

// Variant 2: manual %20 encoding
const u2 = new URL('v1/storage/presign/get?path=' + encodeURIComponent(objKey), base);

for (const [name, u] of [['plus', u1], ['pct20', u2]]) {
  const r = await fetch(u, { headers: { Authorization: 'Bearer ' + key } });
  const j = await r.json().catch(() => null);
  const url = j?.url;
  let dl = 'n/a';
  if (url) {
    const r2 = await fetch(url);
    dl = r2.status + ' ' + r2.headers.get('content-type');
  }
  console.log(name, r.status, 'signedURL?', !!url, 'download:', dl);
  if (url) console.log('  url path:', new URL(url).pathname);
}
