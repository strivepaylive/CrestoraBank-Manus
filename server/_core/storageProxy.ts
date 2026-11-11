import type { Express, Request, Response } from "express";
import { ENV } from "./env";

async function presignGet(key: string): Promise<string | null> {
  const forgeUrl = new URL(
    "v1/storage/presign/get",
    ENV.forgeApiUrl.replace(/\/+$/, "") + "/",
  );
  forgeUrl.searchParams.set("path", key);
  const resp = await fetch(forgeUrl, {
    headers: { Authorization: `Bearer ${ENV.forgeApiKey}` },
  });
  if (!resp.ok) return null;
  const { url } = (await resp.json()) as { url: string };
  return url || null;
}

async function signedUrlIsValid(url: string): Promise<boolean> {
  try {
    const head = await fetch(url, { method: "HEAD" });
    return head.ok;
  } catch {
    return false;
  }
}

export function registerStorageProxy(app: Express) {
  // Serve stored files under a generic CDN-style path. The legacy
  // /manus-storage/ prefix is kept as a hidden alias so any previously
  // issued URLs (old emails, stored records) keep working.
  const handler = async (req: Request, res: Response) => {
    let key = (req.params as Record<string, string>)[0];
    if (!key) {
      res.status(400).send("Missing storage key");
      return;
    }

    // Keys may arrive percent-encoded (e.g. spaces as %20); decode so the
    // presign lookup matches the stored object key exactly.
    try {
      key = decodeURIComponent(key);
    } catch {
      // Not valid percent-encoding — use the raw key as-is
    }

    if (!ENV.forgeApiUrl || !ENV.forgeApiKey) {
      res.status(500).send("Storage proxy not configured");
      return;
    }

    try {
      // Build candidate keys. Legacy files whose names contained spaces were
      // actually stored under '+' (URLSearchParams encoding), and repaired
      // copies exist under a hyphen-substituted key. Try the exact key first,
      // then the fallbacks so every previously issued URL keeps working.
      const candidates = [key];
      if (key.includes(" ")) {
        candidates.push(key.replace(/ /g, "-"));
        candidates.push(key.replace(/ /g, "+"));
      }

      for (const candidate of candidates) {
        const url = await presignGet(candidate);
        if (!url) continue;
        // Only verify reachability when we have fallbacks to try; the common
        // single-candidate path stays a fast redirect without a HEAD probe.
        if (candidates.length > 1 && !(await signedUrlIsValid(url))) continue;
        res.set("Cache-Control", "no-store");
        res.redirect(307, url);
        return;
      }

      console.error(`[StorageProxy] no valid object found for key: ${key}`);
      res.status(404).send("File not found");
    } catch (err) {
      console.error("[StorageProxy] failed:", err);
      res.status(502).send("Storage proxy error");
    }
  };

  app.get("/cdn/media/*", handler);
  app.get("/manus-storage/*", handler);
}
