import { z } from "zod";
import { getBearerUser, getSupabaseUserClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const profileSchema = z.object({
  name: z.string().min(2)
});

export async function POST(request: Request) {
  const auth = await getBearerUser(request);
  if ("error" in auth) return auth.error;

  const supabase = getSupabaseUserClient(auth.token);
  if (!supabase) {
    return Response.json({ error: "Supabase auth is not configured." }, { status: 503 });
  }

  const parsed = profileSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { error: authError } = await supabase.auth.updateUser({
    data: { name: parsed.data.name }
  });

  if (authError) {
    return Response.json({ error: authError.message }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("profiles")
    .update({
      name: parsed.data.name,
      updated_at: new Date().toISOString()
    })
    .eq("id", auth.user.id)
    .select("id,email,name,email_verified,created_at")
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  return Response.json({ profile: data });
}
