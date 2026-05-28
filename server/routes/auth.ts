import { Router } from "express";
import { z } from "zod";
import { supabaseAdmin } from "../supabase";

export const authRouter = Router();

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

authRouter.post("/register", async (req, res) => {
  if (!supabaseAdmin) {
    res.status(503).json({ error: "Supabase is not configured." });
    return;
  }

  const parsed = credentialsSchema.extend({ name: z.string().min(2) }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: false,
    user_metadata: { name: parsed.data.name }
  });

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  res.status(201).json({ user: data.user });
});

authRouter.post("/password-reset", async (req, res) => {
  const parsed = z.object({ email: z.string().email() }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  res.json({ ok: true, email: parsed.data.email, mode: "supabase-auth-placeholder" });
});
