import { Router } from "express";
import { requireSupabaseUser, type AuthedRequest } from "../middleware/auth";

export const securityRouter = Router();

securityRouter.use(requireSupabaseUser);

securityRouter.get("/events", (req: AuthedRequest, res) => {
  res.json({ userId: req.userId, events: [], mode: "future-audit-log" });
});
