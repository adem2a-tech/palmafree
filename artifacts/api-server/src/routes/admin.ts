import { Router, type IRouter } from "express";
import { AdminLoginBody, AdminMeResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.post("/admin/login", async (req, res): Promise<void> => {
  const parsed = AdminLoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { username, password } = parsed.data;
  const adminPass = (process.env.ADMIN_PASSWORD || "admin").trim();

  req.log.info({ usernameMatch: username === "admin", passLen: adminPass.length }, "Login attempt");

  if (username === "admin" && password.trim() === adminPass) {
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
