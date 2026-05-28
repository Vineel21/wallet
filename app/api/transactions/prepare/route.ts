import { z } from "zod";
import { getBearerUser } from "@/lib/supabase/server";

export const runtime = "nodejs";

const prepareSchema = z.object({
  walletId: z.string().min(1),
  assetId: z.string().min(1),
  toAddress: z.string().min(8),
  amount: z.string().min(1)
});

export async function POST(request: Request) {
  const auth = await getBearerUser(request);
  if ("error" in auth) return auth.error;

  const parsed = prepareSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  return Response.json({
    userId: auth.user.id,
    preview: parsed.data,
    estimatedFee: "mock-fee",
    signingLocation: "client"
  });
}
