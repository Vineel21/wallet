# Wallax Wallet MVP

Wallax is a Trust Wallet-inspired wallet prototype built from the recommended stack in `combined_wallet_and_stack_recommendation.md`:

- Next.js App Router + React + TypeScript
- Tailwind CSS for the product UI
- GSAP + `@gsap/react` for route, panel, and row motion
- Zod for form/API validation
- TanStack Query provider for future server-state work
- Express.js API skeleton with Supabase Auth/Postgres integration points

The current wallet behavior remains safe mock mode. No private keys are derived, no real signing occurs, and no blockchain transaction is broadcast.

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Demo account:

- Email: `demo@wallax.local`
- Password: `password123`

All prototype UI data is stored in browser `localStorage`.

## Verify

```bash
npm run typecheck
npm run build
```

Optional API skeleton:

```bash
npm run api:dev
```

The API expects Supabase variables when protected routes are exercised:

```bash
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Vercel deploys the Next.js app and the `app/api/*` route handlers. Apply
`supabase/migrations/20260528000000_initial_schema.sql` to your Supabase project,
then set these Vercel environment variables for Production, Preview, and
Development:

```bash
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=
```

After deployment, `/api/health` reports whether the Supabase database schema is
reachable from Vercel.

## Included MVP Scope

- Register, login, logout, forgot/reset password
- Protected dashboard and wallet routes
- Create wallet with generated 12-word recovery phrase
- Confirm selected recovery words
- Import wallet using a demo phrase
- Backup and phrase safety warnings
- Portfolio balance, wallet selector, accounts, assets, and recent transactions
- Asset search, detail screen, and favorite toggle
- Send flow with asset selection, recipient, amount, fee placeholder, review, password confirmation, and status result
- Receive flow with address display, copy/share actions, chain-aware account selection, and QR-style visual placeholder
- Full history filters and transaction detail modal
- Settings, profile, change password, reveal phrase behind password confirmation, session placeholders, lock toggle, security activity log
- Mobile bottom navigation and desktop sidebar
- GSAP-powered route, card, row, toast, and scanline micro-interactions

## Prototype Safety Notes

This is not a production wallet. It intentionally does not:

- Derive real private keys
- Broadcast blockchain transactions
- Connect to RPC providers
- Encrypt recovery phrases securely
- Implement production authentication

A production wallet should keep private material client-side, encrypted, and never send raw phrases to an API.

## Structure

- `app/` - Next.js App Router entry, layout, and global Tailwind styles
- `components/wallet-app.tsx` - animated wallet prototype UI
- `lib/` - typed mock data, local storage helpers, validation, and wallet services
- `server/` - Express/Supabase-ready API skeleton
- `supabase/migrations/` - Supabase/Postgres schema and RLS migration
- `docs/schema.sql` - readable schema draft retained for reference
- `docs/api-contracts.md` - future API contracts
- `src/` and `index.html` - legacy static prototype files retained for reference

## Future Integration Path

1. Replace local mock auth with Supabase Auth.
2. Persist profiles, wallet metadata, accounts, balances, transactions, and security events in Supabase Postgres.
3. Add RLS policies from `docs/schema.sql`.
4. Add a real client-side BIP39/address-derivation engine.
5. Fetch balances and fees through RPC providers such as Alchemy, Infura, QuickNode, or direct RPC.
6. Keep transaction signing client-side and submit only signed payloads to backend services.
