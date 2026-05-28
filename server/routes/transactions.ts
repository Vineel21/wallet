import { Router } from "express";
import { z } from "zod";
import { requireSupabaseUser, type AuthedRequest } from "../middleware/auth";

export const transactionRouter = Router();

transactionRouter.use(requireSupabaseUser);

transactionRouter.post("/prepare", (req: AuthedRequest, res) => {
  const parsed = z
    .object({
      walletId: z.string().min(1),
      assetId: z.string().min(1),
      toAddress: z.string().min(8),
      amount: z.string().min(1)
    })
    .safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  res.json({
    userId: req.userId,
    preview: parsed.data,
    estimatedFee: "mock-fee",
    signingLocation: "client"
  });
});

transactionRouter.post("/submit", (req: AuthedRequest, res) => {
  const parsed = z
    .object({
      walletId: z.string().min(1),
      assetId: z.string().min(1),
      toAddress: z.string().min(8),
      amount: z.string().min(1),
      signedPayload: z.string().min(1)
    })
    .safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  res.status(202).json({
    userId: req.userId,
    status: "pending",
    txHash: "future-broadcast-hash"
  });
});
