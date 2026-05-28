import type { NextFunction, Request, Response } from "express";
import { supabaseAdmin } from "../supabase";

export type AuthedRequest = Request & {
  userId?: string;
};

export async function requireSupabaseUser(req: AuthedRequest, res: Response, next: NextFunction) {
  const token = req.header("authorization")?.replace(/^Bearer\s+/i, "");

  if (!token) {
    res.status(401).json({ error: "Missing bearer token." });
    return;
  }

  if (!supabaseAdmin) {
    res.status(503).json({ error: "Supabase is not configured." });
    return;
  }

  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) {
    res.status(401).json({ error: "Invalid session." });
    return;
  }

  req.userId = data.user.id;
  next();
}
