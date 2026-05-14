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
      return serverless(app);
    })();
  }
  return handlerPromise;
}

export default async function vercelHandler(
  req: Parameters<ReturnType<typeof serverless>>[0],
  res: Parameters<ReturnType<typeof serverless>>[1],
) {
  const handler = await loadHandler();
  return handler(req, res);
}
