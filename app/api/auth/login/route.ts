import { z } from "zod";
import { getSupabaseAuthClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

export async function POST(request: Request) {
  const supabase = getSupabaseAuthClient();
  if (!supabase) {
    return Response.json({ error: "Supabase auth is not configured." }, { status: 503 });
  }

  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error || !data.session || !data.user) {
    return Response.json({ error: error?.message ?? "Invalid credentials." }, { status: 401 });
  }

  return Response.json({
    user: {
      id: data.user.id,
      email: data.user.email,
      name: data.user.user_metadata.name ?? "Wallet User",
      emailVerified: Boolean(data.user.email_confirmed_at)
    },
    session: {
      accessToken: data.session.access_token,
      expiresAt: data.session.expires_at ? new Date(data.session.expires_at * 1000).toISOString() : null
    }
  });
}
