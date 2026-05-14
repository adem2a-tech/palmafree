import type { RequestHandler } from "express";

export const adminAuth: RequestHandler = (req, res, next) => {
  if (req.session && (req.session as any).isAdmin) {
    next();
  } else {
    res.status(401).json({ error: "Unauthorized" });
  }
};
