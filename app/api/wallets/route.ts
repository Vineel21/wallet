import { z } from "zod";
import { getBearerUser, getSupabaseAdmin } from "@/lib/supabase/server";

export const runtime = "nodejs";

const walletSchema = z.object({
  name: z.string().min(1),
  source: z.enum(["created", "imported"]),
  accounts: z.array(
    z.object({
      chain: z.string().min(1),
      derivationPath: z.string().optional(),
      address: z.string().min(8)
    })
  )
});

export async function GET(request: Request) {
  const auth = await getBearerUser(request);
  if ("error" in auth) return auth.error;

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return Response.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("wallets")
    .select("id,name,source,created_at,wallet_accounts(id,chain,derivation_path,address)")
    .eq("user_id", auth.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 400 });
  }

  return Response.json({ wallets: data ?? [] });
}

export async function POST(request: Request) {
  const auth = await getBearerUser(request);
  if ("error" in auth) return auth.error;

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return Response.json({ error: "Supabase is not configured." }, { status: 503 });
  }

  const parsed = walletSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { data: wallet, error: walletError } = await supabase
    .from("wallets")
    .insert({
      user_id: auth.user.id,
      name: parsed.data.name,
      source: parsed.data.source
    })
    .select("id,name,source,created_at")
    .single();

  if (walletError || !wallet) {
    return Response.json({ error: walletError?.message ?? "Unable to create wallet." }, { status: 400 });
  }

  const accounts = parsed.data.accounts.map((account) => ({
    wallet_id: wallet.id,
    chain: account.chain,
    derivation_path: account.derivationPath,
    address: account.address
  }));

  const { data: createdAccounts, error: accountsError } = await supabase
    .from("wallet_accounts")
    .insert(accounts)
    .select("id,chain,derivation_path,address");

  if (accountsError) {
    await supabase.from("wallets").delete().eq("id", wallet.id).eq("user_id", auth.user.id);
    return Response.json({ error: accountsError.message }, { status: 400 });
  }

  await supabase.from("security_events").insert({
    user_id: auth.user.id,
    event_type: "wallet created",
    detail: `${parsed.data.name} metadata stored.`
  });

  return Response.json({ wallet: { ...wallet, wallet_accounts: createdAccounts ?? [] } }, { status: 201 });
}
