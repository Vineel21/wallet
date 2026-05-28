import { getSupabaseAdmin, getSupabaseConfigState } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET() {
  const supabase = getSupabaseAdmin();
  const config = getSupabaseConfigState();

  if (!supabase) {
    return Response.json({
      ok: true,
      service: "wallax",
      supabase: {
        configured: false,
        config
      }
    });
  }

  const { error } = await supabase.from("profiles").select("id").limit(1);

  return Response.json(
    {
      ok: !error,
      service: "wallax",
      supabase: {
        configured: true,
        databaseConnected: !error,
        error: error?.message
      }
    },
    { status: error ? 503 : 200 }
  );
}
