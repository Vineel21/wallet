import { z } from "zod";
import { getSupabaseAuthClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8)
});

export async function POST(request: Request) {
  const supabase = getSupabaseAuthClient();
  if (!supabase) {
    return Response.json({ error: "Supabase auth is not configured." }, { status: 503 });
  }

  const parsed = registerSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { name, email, password } = parsed.data;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name }
    }
  });

  if (error || !data.user) {
    return Response.json({ error: error?.message ?? "Unable to create user." }, { status: 400 });
  }

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
