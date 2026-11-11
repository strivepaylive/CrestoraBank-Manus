/**
 * Global vitest teardown: removes any test accounts created during test runs
 * so the production admin dashboard stays clean.
 */
import mysql from 'mysql2/promise';

const TEST_USERNAME_PATTERNS = [
  "username LIKE 'vitest%'",
  "username LIKE 'otptest%'",
  "username LIKE 'upgtest%'",
  "username LIKE 'p2test%'",
  "username LIKE 'invalidotp%'",
  "username LIKE 'phonetest%'",
  "username LIKE 'emailtest%'",
  "username LIKE 'weakpass%'",
  "username LIKE 'passwordtest%'",
  "username LIKE 'johndoe17%'",
  "username LIKE 'unapproved17%'",
  "username LIKE 'RobustLogin%'",
  "username LIKE 'logincheck%'",
  "username LIKE 'prodcheck%'",
  "username LIKE 'methodtest%'",
  "username LIKE 'resettest%'",
  "username LIKE 'e2etest%'",
  "username LIKE 'cardfeetest%'",
  "username LIKE 'langtest%'",
];

async function cleanupTestAccounts() {
  const url = process.env.DATABASE_URL;
  if (!url) return;
  let conn: mysql.Connection | null = null;
  try {
    conn = await mysql.createConnection(url);
    const where = TEST_USERNAME_PATTERNS.join(' OR ');
    const [rows] = await conn.query<mysql.RowDataPacket[]>(
      `SELECT id FROM registrations WHERE ${where}`
    );
    if (rows.length === 0) return;
    const ids = rows.map((r) => r.id);
    const childTables = [
      'transactions',
      'login_sessions',
      'otpVerifications',
      'cards',
      'supportMessages',
      'user_notifications',
      'email_logs',
      'deposit_requests',
    ];
    for (const t of childTables) {
      try {
        await conn.query(`DELETE FROM \`${t}\` WHERE registrationId IN (?)`, [ids]);
      } catch {
        // table may not have registrationId column; ignore
      }
    }
    await conn.query('DELETE FROM registrations WHERE id IN (?)', [ids]);
    // remove session user rows created for these registrations
    await conn.query(
      `DELETE FROM users WHERE openId LIKE 'reg\\_%' AND SUBSTRING(openId, 5) NOT IN (SELECT CAST(id AS CHAR) FROM registrations)`
    );
    console.log(`[TEST CLEANUP] Removed ${ids.length} test account(s) and related data`);
  } catch (err) {
    console.error('[TEST CLEANUP] Failed:', err);
  } finally {
    await conn?.end();
  }
}

export async function setup() {
  // no-op: cleanup happens in teardown after all tests complete
}

export async function teardown() {
  await cleanupTestAccounts();
}
