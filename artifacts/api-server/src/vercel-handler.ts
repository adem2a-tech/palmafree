/**
 * Entrée Serverless (Vercel) : pas de `listen()`, tout est dans le bundle esbuild.
 *
 * Ne pas importer `./app` tant que `DATABASE_URL` est absent : `app` charge `@workspace/db`
 * qui throw au chargement → cold start Vercel en 500 FUNCTION_INVOCATION_FAILED sans corps utile.
 *
 * Toute erreur au `import("./app")` est capturée (pino-pretty manquant, module, etc.).
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

export default serverless(app);
