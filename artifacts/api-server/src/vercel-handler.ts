/**
 * Entrée Serverless (Vercel) : pas de `listen()`, tout est dans le bundle esbuild.
 */
import serverless from "serverless-http";
import app from "./app";

export default serverless(app);
