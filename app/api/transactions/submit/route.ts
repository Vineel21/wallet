import { z } from "zod";
import { getBearerUser } from "@/lib/supabase/server";

export const runtime = "nodejs";

const submitSchema = z.object({
  walletId: z.string().min(1),
  assetId: z.string().min(1),
  toAddress: z.string().min(8),
  amount: z.string().min(1),
  signedPayload: z.string().min(1)
});

export async function POST(request: Request) {
  const auth = await getBearerUser(request);
  if ("error" in auth) return auth.error;

  const parsed = submitSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  return Response.json(
    {
      userId: auth.user.id,
      request: parsed.data,
      status: "pending",
      txHash: "future-broadcast-hash"
    },
    { status: 202 }
  );
}
