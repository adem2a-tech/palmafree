import express, { type Express } from "express";
import type { IncomingMessage, ServerResponse } from "node:http";
import cors from "cors";
import { pinoHttp } from "pino-http";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
/** Chemin fichier explicite : Node ESM sur Vercel rejette `import "./routes"` (répertoire sans index résolu). */
import router from "./routes/index.js";
import { logger } from "./lib/logger";
import { pool } from "@workspace/db";

const pgSession = connectPgSimple(session);

const app: Express = express();

/** Sur Vercel : pas de store Postgres (CREATE TABLE / pool → erreurs fréquentes en serverless). */
const usePostgresSessionStore = process.env.VERCEL !== "1";

/** Requis derrière le proxy TLS de Vercel (cookies `secure`, IP réelle). */
app.set("trust proxy", 1);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req: IncomingMessage) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res: ServerResponse) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: "12mb" }));
app.use(express.urlencoded({ extended: true, limit: "12mb" }));

if (!process.env.SESSION_SECRET) {
  logger.warn("SESSION_SECRET not set, using default secret. This is not secure!");
}

app.use(
  session({
    ...(usePostgresSessionStore
      ? {
          store: new pgSession({
            pool,
            tableName: "session",
            createTableIfMissing: true,
          }),
        }
      : {}),
    secret: process.env.SESSION_SECRET || "palma-fa-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      secure:
        process.env.NODE_ENV === "production" || process.env.VERCEL === "1",
      httpOnly: true,
      sameSite: "lax",
    },
  }),
);

app.use("/api", router);

export default app;
