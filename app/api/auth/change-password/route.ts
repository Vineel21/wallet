import { z } from "zod";
import { getBearerUser, getSupabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";

const changePasswordSchema = z.object({
  password: z.string().min(8)
});

export async function POST(request: Request) {
  const auth = await getBearerUser(request);
  if ("error" in auth) return auth.error;

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return Response.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const parsed = changePasswordSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { error } = await supabase.auth.admin.updateUserById(auth.user.id, {
    password: parsed.data.password
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  await supabase.from("security_events").insert({
    user_id: auth.user.id,
    event_type: "password changed",
    detail: "Password updated from settings."
  });

  return Response.json({ ok: true });
}
