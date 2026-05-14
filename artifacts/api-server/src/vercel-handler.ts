/**
 * Entrée Vercel : **export default app** (instance Express), sans `serverless-http`.
 * @see https://vercel.com/kb/guide/using-express-with-vercel
 */
import type { Express } from "express";
import express from "express";

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

export default app;
