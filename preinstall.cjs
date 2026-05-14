"use strict";
const fs = require("fs");
const path = require("path");

const root = __dirname;
for (const f of ["package-lock.json", "yarn.lock"]) {
  try {
    fs.unlinkSync(path.join(root, f));
  } catch {
    /* absent */
  }
}

const ua = (process.env.npm_config_user_agent || "").toLowerCase();
const execPath = (process.env.npm_execpath || "").replace(/\\/g, "/").toLowerCase();
const looksLikePnpm =
  ua.includes("pnpm") ||
  execPath.includes("pnpm") ||
  execPath.includes("pnpm.cjs") ||
  execPath.includes("pnpm.mjs");
// pnpm / corepack ne renseignent pas toujours la même chaîne sur Windows : si UA vide, ne pas bloquer.
const looksLikeNpmOnly = ua.startsWith("npm/") && !ua.includes("pnpm");
const looksLikeYarn = ua.startsWith("yarn/");

if ((looksLikeNpmOnly || looksLikeYarn) && !looksLikePnpm) {
  console.error("Utilisez pnpm (pas npm / yarn).");
  process.exit(1);
}
