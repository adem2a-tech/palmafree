/**
 * Entrée Vercel : **export default app** (instance Express), sans `serverless-http`.
 * Voir https://vercel.com/kb/guide/using-express-with-vercel — le runtime Vercel invoque l’app directement.
 */
import type { Express } from "express";
import express from "express";

const endpoint =
  "http://127.0.0.1:7699/ingest/6bf834d8-5189-4baf-be4d-1cb063409782";

function misconfiguredApp(detail: string): Express {
  const app = express();
  app.all(/.*/, (_req, res) => {
    res.status(503).json({ error: "Configuration", detail });
  });
  return app;
}

let app: Express;
try {
  if (!process.env.DATABASE_URL) {
    app = misconfiguredApp(
      "DATABASE_URL n'est pas définie. Vercel → Project → Settings → Environment Variables.",
    );
  } else {
    app = (await import("./app.js")).default;
  }
} catch (err) {
  console.error("[vercel-handler] échec chargement ./app", err);
  app = misconfiguredApp(
    "L'API n'a pas pu démarrer (voir logs Vercel). Vérifiez DATABASE_URL et Postgres (SSL).",
  );
}

// #region agent log
fetch(endpoint, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Debug-Session-Id": "7768ea",
  },
  body: JSON.stringify({
    sessionId: "7768ea",
    hypothesisId: "H7",
    location: "vercel-handler.ts:app_ready",
    message: "native Express default export (no serverless-http)",
    data: { hasDatabaseUrl: Boolean(process.env.DATABASE_URL) },
    timestamp: Date.now(),
    runId: "native-express-export",
  }),
}).catch(() => {});
console.error(
  JSON.stringify({
    tag: "DEBUG_7768ea",
    hypothesisId: "H7",
    msg: "vercel_native_express_ready",
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
  }),
);
// #endregion

export default app;
