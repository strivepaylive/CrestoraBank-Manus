import { and, eq } from "drizzle-orm";
import { loginSessions } from "../drizzle/schema";
import { getDb } from "./db";

// Small in-memory cache to avoid a DB hit on every request (30s TTL)
const cache = new Map<string, { revoked: boolean; expires: number }>();
const TTL_MS = 30_000;

/**
 * Returns true when the given device session key has been revoked.
 * The session key is embedded in the signed JWT itself, so it cannot be
 * stripped or forged by the client (deleting cookies does not help — a token
 * signed with a sessionKey always carries it).
 * - No session key in the token (legacy sessions from before this feature,
 *   or admin-impersonation tokens): not revoked.
 * - Session key present but no matching row (row deleted on revoke): revoked.
 * - Matching row flagged revoked: revoked → request treated as unauthenticated.
 */
export async function isSessionRevoked(openId: string, sessionKey?: string): Promise<boolean> {
  if (!sessionKey) return false;
  const cacheKey = `${openId}:${sessionKey}`;
  const hit = cache.get(cacheKey);
  if (hit && hit.expires > Date.now()) return hit.revoked;

  const db = await getDb();
  if (!db) return false;
  const rows = await db
    .select({ revoked: loginSessions.revoked })
    .from(loginSessions)
    .where(eq(loginSessions.sessionKey, sessionKey))
    .limit(1);
  // Missing row means the session was revoked-and-deleted → treat as revoked.
  const revoked = rows.length > 0 ? Boolean(rows[0].revoked) : true;
  cache.set(cacheKey, { revoked, expires: Date.now() + TTL_MS });
  return revoked;
}

/** Invalidate cached entries for a session key after revocation so it takes effect quickly. */
export function bustRevocationCache(sessionKey: string) {
  for (const key of Array.from(cache.keys())) {
    if (key.endsWith(`:${sessionKey}`)) cache.delete(key);
  }
}
