import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import { createServer as createViteServer } from "vite";
import viteConfig from "../../vite.config";

export async function setupVite(app: Express, server: Server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true as const,
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    try {
      const clientTemplate = path.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );

      // always reload the index.html file from disk incase it changes
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath =
    process.env.NODE_ENV === "development"
      ? path.resolve(import.meta.dirname, "../..", "dist", "public")
      : path.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }

  // Production hardening: sanitize the built index.html so no development
  // platform markers (inline runtime scripts, debug collectors, platform CDN
  // meta images) are exposed to visitors. Functionality is unchanged — only
  // development/preview tooling markup is stripped from the served HTML.
  let sanitizedIndexHtml: string | null = null;
  function getSanitizedIndexHtml(): string | null {
    if (sanitizedIndexHtml !== null) return sanitizedIndexHtml;
    try {
      let html = fs.readFileSync(path.resolve(distPath, "index.html"), "utf-8");
      // 1) Remove the injected inline runtime script (preview/editor tooling —
      //    only functional inside the development preview iframe, inert in production)
      html = html.replace(
        /<script id="manus-runtime">[\s\S]*?<\/script>/g,
        ""
      );
      // 2) Remove any external debug/collector script tags
      html = html.replace(
        /<script[^>]*src="[^"]*__manus__[^"]*"[^>]*><\/script>/g,
        ""
      );
      // 2b) Remove analytics script tags that reference platform domains
      html = html.replace(
        /<script[^>]*src="[^"]*manus[^"]*"[^>]*(?:\/>|><\/script>)/g,
        ""
      );
      html = html.replace(
        /<script\s[^>]*?src="https?:\/\/[^"]*manus[^"]*"[\s\S]*?<\/script>/g,
        ""
      );
      // 3) Replace platform-CDN social preview images with same-origin URLs
      html = html.replace(
        /https:\/\/files\.manuscdn\.com\/[^"']*/g,
        "https://www.crestorabank.com/favicon.ico"
      );
      sanitizedIndexHtml = html;
    } catch {
      sanitizedIndexHtml = null;
    }
    return sanitizedIndexHtml;
  }

  // Block direct access to development/debug artifacts
  app.use((req, res, next) => {
    if (req.path.startsWith("/__manus__")) {
      res.status(404).send("Not Found");
      return;
    }
    if (req.path === "/version.json" || req.path.endsWith("/debug-collector.js")) {
      res.status(404).send("Not Found");
      return;
    }
    next();
  });

  // Serve the sanitized index.html for the root document
  app.get("/", (_req, res, next) => {
    const html = getSanitizedIndexHtml();
    if (html) {
      res.status(200).set({ "Content-Type": "text/html" }).end(html);
      return;
    }
    next();
  });

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    const html = getSanitizedIndexHtml();
    if (html) {
      res.status(200).set({ "Content-Type": "text/html" }).end(html);
      return;
    }
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
