import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let adminClient: SupabaseClient | null = null;
let authClient: SupabaseClient | null = null;

export function getSupabaseAdmin() {
  if (!supabaseUrl || !supabaseServiceRoleKey) return null;
  adminClient ??= createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  return adminClient;
}

export function getSupabaseAuthClient() {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  authClient ??= createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
  return authClient;
}

export function getSupabaseUserClient(token: string) {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`
      }
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export function getSupabaseConfigState() {
  return {
    url: Boolean(supabaseUrl),
    anonKey: Boolean(supabaseAnonKey),
    serviceRoleKey: Boolean(supabaseServiceRoleKey)
  };
}

export async function getBearerUser(request: Request): Promise<{ user: User; token: string } | { error: Response }> {
  const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (!token) {
    return { error: Response.json({ error: "Missing bearer token." }, { status: 401 }) };
  }

  const supabase = getSupabaseAuthClient();
  if (!supabase) {
    return { error: Response.json({ error: "Supabase auth is not configured." }, { status: 503 }) };
  }

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return { error: Response.json({ error: "Invalid session." }, { status: 401 }) };
  }

  return { user: data.user, token };
}
