/**
 * Repro locale du handler Vercel (après build) → envoie des logs à l’ingest debug Cursor.
 * Usage (depuis la racine du monorepo Palma-Capture) :
 *   pnpm --filter @workspace/api-server run build
 *   node scripts/debug-vercel-handler.mjs
 */
import http from "node:http";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const endpoint =
  "http://127.0.0.1:7699/ingest/6bf834d8-5189-4baf-be4d-1cb063409782";

async function agentLog(hypothesisId, location, message, data = {}) {
  const body = JSON.stringify({
    sessionId: "7768ea",
    hypothesisId,
    location,
    message,
    data,
    timestamp: Date.now(),
  });
  await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "7768ea",
    },
    body,
  }).catch(() => {});
}

const handlerPath = path.join(root, "api", "vercel-bundle", "vercel-handler.mjs");

await agentLog("H0", "debug-vercel-handler.mjs:start", "script_start", {
  cwd: process.cwd(),
  handlerPath,
});

let mod;
try {
  mod = await import(pathToFileURL(handlerPath).href);
} catch (e) {
  await agentLog("H1", "debug-vercel-handler.mjs:import", "import_failed", {
    err: String(e),
    stack: e?.stack?.slice(0, 800),
  });
  console.error(e);
  process.exit(1);
}

await agentLog("H1", "debug-vercel-handler.mjs:import", "import_ok", {
  exportType: typeof mod.default,
});

const handler = mod.default;
const server = http.createServer(async (req, res) => {
  try {
    await handler(req, res);
  } catch (e) {
    await agentLog("H3", "debug-vercel-handler.mjs:server", "handler_throw", {
      err: String(e),
    });
    if (!res.headersSent) res.statusCode = 500;
    res.end(String(e));
  }
});

await new Promise((resolve, reject) => {
  server.listen(0, "127.0.0.1", (err) => (err ? reject(err) : resolve()));
});
const { port } = server.address();

const status = await new Promise((resolve, reject) => {
  http
    .get(`http://127.0.0.1:${port}/api/healthz`, (r) => {
      let buf = "";
      r.on("data", (c) => {
        buf += c;
      });
      r.on("end", () => {
        resolve({ code: r.statusCode, buf: buf.slice(0, 400) });
      });
    })
    .on("error", reject);
});

server.close();

await agentLog("H3", "debug-vercel-handler.mjs:done", "http_request_done", status);
console.log("debug-vercel-handler result:", status);
