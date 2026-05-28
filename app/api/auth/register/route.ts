import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8)
});

export async function POST(request: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return Response.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const parsed = registerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { name, email, password } = parsed.data;
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { name }
  });

  if (error || !data.user) {
    return Response.json({ error: error?.message ?? "Unable to create user." }, { status: 400 });
  }

  await supabase.from("profiles").upsert({
    id: data.user.id,
    email: data.user.email ?? email,
    name,
    email_verified: Boolean(data.user.email_confirmed_at),
    updated_at: new Date().toISOString()
  });

  return Response.json(
    {
      user: {
        id: data.user.id,
        email: data.user.email,
        name,
        emailVerified: Boolean(data.user.email_confirmed_at)
      }
    },
    { status: 201 }
  );
}
