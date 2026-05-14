import pino from "pino";

/** Vercel / Lambda : pas de pino-pretty (souvent absent des node_modules prod). */
const usePrettyTransport =
  process.env.NODE_ENV !== "production" && !process.env.VERCEL;

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  redact: [
    "req.headers.authorization",
    "req.headers.cookie",
    "res.headers['set-cookie']",
  ],
  ...(usePrettyTransport
    ? {
        transport: {
          target: "pino-pretty",
          options: { colorize: true },
        },
      }
    : {}),
});
