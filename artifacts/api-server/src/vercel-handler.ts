/**
 * Entrée Serverless (Vercel) : pas de `listen()`, tout est dans le bundle esbuild.
 *
 * Ne pas importer `./app` tant que `DATABASE_URL` est absent : `app` charge `@workspace/db`
 * qui throw au chargement → cold start Vercel en 500 FUNCTION_INVOCATION_FAILED sans corps utile.
 */
import type { Express } from "express";
import express from "express";
import serverless from "serverless-http";

const misconfiguredApp: Express = express();
misconfiguredApp.all(/.*/, (_req, res) => {
  res.status(503).json({
    error: "Configuration",
    detail:
      "DATABASE_URL n'est pas définie. Vercel → Project → Settings → Environment Variables.",
  });
});

const app: Express = process.env.DATABASE_URL
  ? (await import("./app")).default
  : misconfiguredApp;

export default serverless(app);
