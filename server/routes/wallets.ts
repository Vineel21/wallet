import { Router } from "express";
import { z } from "zod";
import { requireSupabaseUser, type AuthedRequest } from "../middleware/auth";

export const walletRouter = Router();

walletRouter.use(requireSupabaseUser);

walletRouter.get("/", (req: AuthedRequest, res) => {
  res.json({ wallets: [], userId: req.userId, mode: "future-supabase-postgres" });
});

walletRouter.post("/", (req: AuthedRequest, res) => {
  const parsed = z
    .object({
      name: z.string().min(1),
      source: z.enum(["created", "imported"]),
      accounts: z.array(
        z.object({
          chain: z.string().min(1),
          derivationPath: z.string().optional(),
          address: z.string().min(8)
        })
      )
    })
    .safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  res.status(202).json({
    userId: req.userId,
    wallet: parsed.data,
    mode: "metadata-only-no-raw-phrase"
  });
});
