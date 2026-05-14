/**
 * Point d’entrée Vercel (Serverless) : Express ne doit pas appeler `listen()` ici.
 * Le dépôt doit être la racine monorepo (`Palma-Capture`) pour que `pnpm install` résolve `@workspace/*`.
 */
import serverless from "serverless-http";
import app from "../artifacts/api-server/src/app";

export default serverless(app);
