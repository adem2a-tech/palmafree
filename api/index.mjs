/**
 * Vercel Serverless : charge uniquement le bundle esbuild (monorepo + deps résolus au build).
 */
import handler from "../artifacts/api-server/dist/vercel-bundle/vercel-handler.mjs";

export default handler;
