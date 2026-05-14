/**
 * Entrée Serverless (Vercel) : pas de `listen()`, bundle esbuild copié dans `api/vercel-bundle/`.
 *
 * - Pas de top-level await (meilleure compat runtime Vercel).
 * - `import("./app")` seulement au premier appel : évite throw @workspace/db si pas de DATABASE_URL.
 */
import type { Express } from "express";
import express from "express";
import serverless from "serverless-http";

function misconfiguredApp(detail: string): Express {
  const app = express();
  app.all(/.*/, (_req, res) => {
    res.status(503).json({
      error: "Configuration",
      detail,
    });
  });
  return app;
}

let handlerPromise: Promise<ReturnType<typeof serverless>> | undefined;

function loadHandler(): Promise<ReturnType<typeof serverless>> {
  if (!handlerPromise) {
    handlerPromise = (async () => {
      // #region agent log
      fetch("http://127.0.0.1:7699/ingest/6bf834d8-5189-4baf-be4d-1cb063409782", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Debug-Session-Id": "7768ea",
        },
        body: JSON.stringify({
          sessionId: "7768ea",
          hypothesisId: "H4",
          location: "vercel-handler.ts:loadHandler:start",
          message: "loadHandler inner start",
          data: { hasDatabaseUrl: Boolean(process.env.DATABASE_URL) },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      console.error(
        JSON.stringify({
          tag: "DEBUG_7768ea",
          hypothesisId: "H4",
          msg: "loadHandler_inner_start",
          hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
        }),
      );
      // #endregion
      let app: Express;
      if (!process.env.DATABASE_URL) {
        app = misconfiguredApp(
          "DATABASE_URL n'est pas définie. Vercel → Project → Settings → Environment Variables.",
        );
      } else {
        try {
          app = (await import("./app")).default;
        } catch (err) {
          console.error("[vercel-handler] échec chargement ./app", err);
          app = misconfiguredApp(
            "L'API n'a pas pu démarrer (voir logs Vercel). Vérifiez DATABASE_URL, SSL Postgres, et que le build api-server a réussi.",
          );
        }
      }
      // #region agent log
      fetch("http://127.0.0.1:7699/ingest/6bf834d8-5189-4baf-be4d-1cb063409782", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Debug-Session-Id": "7768ea",
        },
        body: JSON.stringify({
          sessionId: "7768ea",
          hypothesisId: "H4",
          location: "vercel-handler.ts:loadHandler:before_serverless",
          message: "before serverless(app)",
          data: {},
          timestamp: Date.now(),
        }),
      }).catch(() => {});
      // #endregion
      return serverless(app);
    })();
  }
  return handlerPromise;
}

export default function vercelHandler(
  req: Parameters<ReturnType<typeof serverless>>[0],
  res: Parameters<ReturnType<typeof serverless>>[1],
): void | Promise<unknown> {
  // #region agent log
  fetch("http://127.0.0.1:7699/ingest/6bf834d8-5189-4baf-be4d-1cb063409782", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "7768ea",
    },
    body: JSON.stringify({
      sessionId: "7768ea",
      hypothesisId: "H2",
      location: "vercel-handler.ts:vercelHandler:entry",
      message: "handler invoked (sync export)",
      data: {
        method: (req as { method?: string }).method,
        url: (req as { url?: string }).url?.slice(0, 120),
      },
      timestamp: Date.now(),
      runId: "post-fix-sync-export",
    }),
  }).catch(() => {});
  console.error(
    JSON.stringify({
      tag: "DEBUG_7768ea",
      hypothesisId: "H2",
      msg: "vercelHandler_entry_sync",
      method: (req as { method?: string }).method,
      url: (req as { url?: string }).url,
    }),
  );
  // #endregion

  return loadHandler()
    .then((h) => {
      // #region agent log
      fetch("http://127.0.0.1:7699/ingest/6bf834d8-5189-4baf-be4d-1cb063409782", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Debug-Session-Id": "7768ea",
        },
        body: JSON.stringify({
          sessionId: "7768ea",
          hypothesisId: "H3",
          location: "vercel-handler.ts:vercelHandler:before_inner",
          message: "about to call inner serverless handler",
          data: {},
          timestamp: Date.now(),
          runId: "post-fix-sync-export",
        }),
      }).catch(() => {});
      // #endregion
      return Promise.resolve(h(req, res));
    })
    .then((out) => {
      // #region agent log
      fetch("http://127.0.0.1:7699/ingest/6bf834d8-5189-4baf-be4d-1cb063409782", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Debug-Session-Id": "7768ea",
        },
        body: JSON.stringify({
          sessionId: "7768ea",
          hypothesisId: "H3",
          location: "vercel-handler.ts:vercelHandler:after_inner",
          message: "inner handler returned",
          data: { outType: typeof out },
          timestamp: Date.now(),
          runId: "post-fix-sync-export",
        }),
      }).catch(() => {});
      // #endregion
      return out;
    })
    .catch((e: unknown) => {
      // #region agent log
      fetch("http://127.0.0.1:7699/ingest/6bf834d8-5189-4baf-be4d-1cb063409782", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Debug-Session-Id": "7768ea",
        },
        body: JSON.stringify({
          sessionId: "7768ea",
          hypothesisId: "H3",
          location: "vercel-handler.ts:vercelHandler:chain_catch",
          message: String(e),
          data: { stack: (e as Error)?.stack?.slice(0, 500) },
          timestamp: Date.now(),
          runId: "post-fix-sync-export",
        }),
      }).catch(() => {});
      console.error(
        JSON.stringify({
          tag: "DEBUG_7768ea",
          hypothesisId: "H3",
          msg: "chain_catch",
          err: String(e),
        }),
      );
      // #endregion
      const r = res as { headersSent?: boolean; statusCode?: number; setHeader?: (n: string, v: string) => void; end?: (b: string) => void };
      if (!r.headersSent) {
        r.statusCode = 500;
        r.setHeader?.("Content-Type", "application/json");
        r.end?.(
          JSON.stringify({
            error: "RuntimeError",
            message: String((e as Error)?.message ?? e),
          }),
        );
      }
    });
}
