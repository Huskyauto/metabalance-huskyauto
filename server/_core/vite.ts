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
    hmr: false,
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

  // Serve static files with explicit MIME types and aggressive cache-busting
  app.use(express.static(distPath, {
    setHeaders: (res, filePath) => {
      // Force correct MIME types for JavaScript modules
      if (filePath.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
        res.setHeader('X-Content-Type-Options', 'nosniff');
      } else if (filePath.endsWith('.mjs')) {
        res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
        res.setHeader('X-Content-Type-Options', 'nosniff');
      } else if (filePath.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css; charset=UTF-8');
      } else if (filePath.endsWith('.json')) {
        res.setHeader('Content-Type', 'application/json; charset=UTF-8');
      } else if (filePath.endsWith('.wasm')) {
        res.setHeader('Content-Type', 'application/wasm');
      }
      
      // Add cache control
      if (filePath.includes('/assets/')) {
        // Long cache for hashed assets
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      } else {
        // No cache for HTML and other files
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
      }
      
      // Additional headers to prevent proxy caching issues
      res.setHeader('Vary', 'Accept-Encoding');
      res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    }
  }));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=UTF-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
