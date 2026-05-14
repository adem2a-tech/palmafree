import { Router, type IRouter } from "express";
import { AdminLoginBody, AdminMeResponse } from "@workspace/api-zod";

/** Mot de passe admin par défaut (chiffres uniquement) si `ADMIN_PASSWORD` n’est pas défini. */
const DEFAULT_ADMIN_PASSWORD = "2715";

const router: IRouter = Router();

router.post("/admin/login", async (req, res): Promise<void> => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { username, password } = parsed.data;
  const fromEnv = process.env.ADMIN_PASSWORD?.trim();
  const inputPass = (password ?? "").trim();
  const okPassword = fromEnv ? inputPass === fromEnv : inputPass === DEFAULT_ADMIN_PASSWORD;

  req.log.info(
    { usernameMatch: username === "admin", usingEnvPassword: Boolean(fromEnv) },
    "Login attempt",
  );

  const allowOpen =
    process.env.ALLOW_OPEN_ADMIN === "1" ||
    process.env.ALLOW_OPEN_ADMIN === "true";

  if (username === "admin" && (okPassword || allowOpen)) {
    (req.session as any).isAdmin = true;
    res.sendStatus(200);
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

router.post("/admin/logout", async (req, res): Promise<void> => {
  req.session.destroy((err) => {
    if (err) {
      res.status(500).json({ error: "Could not log out" });
    } else {
      res.sendStatus(204);
    }
  });
});

router.get("/admin/me", async (req, res): Promise<void> => {
  const loggedIn = !!(req.session && (req.session as any).isAdmin);
  res.json(AdminMeResponse.parse({ loggedIn }));
});

export default router;
