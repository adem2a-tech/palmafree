import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build as esbuild } from "esbuild";
import esbuildPluginPino from "esbuild-plugin-pino";
import { cp, rm } from "node:fs/promises";

globalThis.require = createRequire(import.meta.url);

const artifactDir = path.dirname(fileURLToPath(import.meta.url));

const isProductionBundle =
  process.env.NODE_ENV === "production" ||
  process.env.VERCEL === "1" ||
  process.env.VERCEL_ENV === "production";

/** Pour `node dist/index.mjs` (Docker / local) : dépendances lourdes hors bundle. */
const runtimeExternal = [
  "express",
  "express-session",
  "cookie-parser",
  "cors",
  "connect-pg-simple",
  "drizzle-orm",
  "pg",
];

const nativeExternal = [
  "*.node",
  "sharp",
  "better-sqlite3",
  "sqlite3",
  "canvas",
  "bcrypt",
  "argon2",
  "fsevents",
  "re2",
  "farmhash",
  "xxhash-addon",
  "bufferutil",
  "utf-8-validate",
  "ssh2",
  "cpu-features",
  "dtrace-provider",
  "isolated-vm",
  "lightningcss",
  "pg-native",
  "oracledb",
  "mongodb-client-encryption",
  "nodemailer",
  "handlebars",
  "knex",
  "typeorm",
  "protobufjs",
  "onnxruntime-node",
  "@tensorflow/*",
  "@prisma/client",
  "@mikro-orm/*",
  "@grpc/*",
  "@swc/*",
  "@aws-sdk/*",
  "@azure/*",
  "@opentelemetry/*",
  "@google-cloud/*",
  "@google/*",
  "googleapis",
  "firebase-admin",
  "@parcel/watcher",
  "@sentry/profiling-node",
  "@tree-sitter/*",
  "aws-sdk",
  "classic-level",
  "dd-trace",
  "ffi-napi",
  "grpc",
  "hiredis",
  "kerberos",
  "leveldown",
  "miniflare",
  "mysql2",
  "newrelic",
  "odbc",
  "piscina",
  "realm",
  "ref-napi",
  "rocksdb",
  "sass-embedded",
  "sequelize",
  "serialport",
  "snappy",
  "tinypool",
  "usb",
  "workerd",
  "wrangler",
  "zeromq",
  "zeromq-prebuilt",
  "playwright",
  "puppeteer",
  "puppeteer-core",
  "electron",
];

const esmBanner = {
  js: `import { createRequire as __bannerCrReq } from 'node:module';
import __bannerPath from 'node:path';
import __bannerUrl from 'node:url';

globalThis.require = __bannerCrReq(import.meta.url);
globalThis.__filename = __bannerUrl.fileURLToPath(import.meta.url);
globalThis.__dirname = __bannerPath.dirname(globalThis.__filename);
`,
};

const pinoPlugins = [
  esbuildPluginPino({
    transports: isProductionBundle ? [] : ["pino-pretty"],
  }),
];

async function buildAll() {
  const distDir = path.resolve(artifactDir, "dist");
  await rm(distDir, { recursive: true, force: true });

  // 1) Serveur classique (listen + PORT)
  await esbuild({
    entryPoints: [path.resolve(artifactDir, "src/index.ts")],
    platform: "node",
    bundle: true,
    format: "esm",
    outdir: distDir,
    outExtension: { ".js": ".mjs" },
    logLevel: isProductionBundle ? "error" : "info",
    external: [...runtimeExternal, ...nativeExternal],
    minify: isProductionBundle,
    sourcemap: isProductionBundle ? false : "linked",
    plugins: pinoPlugins,
    banner: esmBanner,
  });

  // 2) Vercel : bundle autonome (sous-dossier : pino génère plusieurs fichiers → outdir obligatoire)
  const vercelBundleDir = path.resolve(distDir, "vercel-bundle");
  await rm(vercelBundleDir, { recursive: true, force: true });
  await esbuild({
    entryPoints: [path.resolve(artifactDir, "src/vercel-handler.ts")],
    platform: "node",
    bundle: true,
    format: "esm",
    outdir: vercelBundleDir,
    outExtension: { ".js": ".mjs" },
    logLevel: isProductionBundle ? "error" : "info",
    external: [...nativeExternal],
    minify: isProductionBundle,
    sourcemap: isProductionBundle ? false : "linked",
    plugins: pinoPlugins,
    banner: esmBanner,
  });

  // 3) Copie à côté de api/index.mjs : Vercel inclut mal les imports ../artifacts depuis api/.
  const repoRoot = path.resolve(artifactDir, "../..");
  const apiVercelBundle = path.join(repoRoot, "api", "vercel-bundle");
  await rm(apiVercelBundle, { recursive: true, force: true });
  await cp(vercelBundleDir, apiVercelBundle, { recursive: true });
}

buildAll().catch((err) => {
  console.error(err);
  process.exit(1);
});
