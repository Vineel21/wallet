import { z } from "zod";
import { getBearerUser, getSupabaseAdmin, getSupabaseUserClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const changePasswordSchema = z.object({
  password: z.string().min(8)
});

export async function POST(request: Request) {
  const auth = await getBearerUser(request);
  if ("error" in auth) return auth.error;

  const supabase = getSupabaseUserClient(auth.token);
  if (!supabase) {
    return Response.json({ error: "Supabase auth is not configured." }, { status: 503 });
  }

  const parsed = changePasswordSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { error } = await supabase.auth.updateUser({
    password: parsed.data.password
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  const admin = getSupabaseAdmin();
  await admin?.from("security_events").insert({
    user_id: auth.user.id,
    event_type: "password changed",
    detail: "Password updated from settings."
  });

  return Response.json({ ok: true });
}
