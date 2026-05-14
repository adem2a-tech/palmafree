/**
 * Vercel Serverless : le build copie le bundle dans ./vercel-bundle/ (import fiable, sans ../artifacts).
 */
import handler from "./vercel-bundle/vercel-handler.mjs";

export default handler;
