import 'dotenv/config';
import mysql from 'mysql2/promise';

const base = process.env.BUILT_IN_FORGE_API_URL.replace(/\/+$/, '') + '/';
const apiKey = process.env.BUILT_IN_FORGE_API_KEY;

async function presign(kind, objKey) {
  const u = new URL(`v1/storage/presign/${kind}?path=` + encodeURIComponent(objKey), base);
  const r = await fetch(u, { headers: { Authorization: 'Bearer ' + apiKey } });
  if (!r.ok) throw new Error(`presign ${kind} ${objKey}: ${r.status}`);
  const { url } = await r.json();
  return url;
}

const conn = await mysql.createConnection(process.env.DATABASE_URL);
const [rows] = await conn.execute("SELECT id, reference, pdfUrl FROM invoices WHERE pdfUrl LIKE '% %'");
console.log('Invoices with space in pdfUrl:', rows.length);

for (const row of rows) {
  // pdfUrl like /cdn/media/invoices/ESCROW TAX-29_c21ab3ac.pdf
  const oldKey = row.pdfUrl.replace(/^\/cdn\/media\//, '');
  // The bytes actually live under the '+'-substituted key (URLSearchParams encoded spaces as +)
  const actualKey = oldKey.replace(/ /g, '+');
  const newKey = oldKey.replace(/[^A-Za-z0-9._\/-]+/g, '-');
  console.log(`Invoice ${row.id} (${row.reference}): ${actualKey} -> ${newKey}`);

  // 1. Download from actual (plus) key
  const getUrl = await presign('get', actualKey);
  const dl = await fetch(getUrl);
  if (!dl.ok) { console.error('  download failed', dl.status); continue; }
  const buf = Buffer.from(await dl.arrayBuffer());
  console.log('  downloaded', buf.length, 'bytes');

  // 2. Upload to new clean key
  const putUrl = await presign('put', newKey);
  const up = await fetch(putUrl, { method: 'PUT', headers: { 'Content-Type': 'application/pdf' }, body: buf });
  if (!up.ok) { console.error('  upload failed', up.status); continue; }

  // 3. Verify new key downloads
  const verifyUrl = await presign('get', newKey);
  const v = await fetch(verifyUrl);
  console.log('  verify new key:', v.status);
  if (!v.ok) continue;

  // 4. Update DB
  await conn.execute('UPDATE invoices SET pdfUrl = ? WHERE id = ?', ['/cdn/media/' + newKey, row.id]);
  console.log('  DB updated to /cdn/media/' + newKey);
}
await conn.end();
console.log('Done');
