import { z } from "zod";
import { getSupabaseAuthClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const resetSchema = z.object({
  email: z.string().email()
});

export async function POST(request: Request) {
  const supabase = getSupabaseAuthClient();
  if (!supabase) {
    return Response.json({ error: "Supabase auth is not configured." }, { status: 503 });
  }

  const parsed = resetSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/reset`
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  return Response.json({ ok: true });
}
