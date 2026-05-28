# Codex Prompt for Trust Wallet-Like Web Prototype

Create a **web application prototype** inspired by Trust Wallet, but focused on MVP-level wallet behavior for demonstration and product validation. Trust Wallet publicly describes itself as a self-custody wallet, and its developer materials describe Wallet Core as the low-level library for wallet creation, address derivation, and transaction signing across multiple blockchains.[cite:2][cite:14] The prototype should imitate the product structure and user experience patterns of a modern crypto wallet, while keeping the implementation safe and realistic for a prototype phase rather than pretending to be a production-grade custody system.[cite:2][cite:7]

## What Trust Wallet is

Trust Wallet is a self-custody crypto wallet product that allows users to create or import a wallet, manage assets, derive addresses for supported chains, and sign transactions locally rather than relying on a custodial exchange account.[cite:2][cite:14] Its public guides also emphasize recovery phrase backup, private-key protection, and WalletConnect-based dApp connectivity as key parts of the wallet experience.[cite:6][cite:10]

## Goal of this prototype

Build a **responsive web application prototype** that simulates a Trust Wallet-like user flow with standard web authentication and wallet management screens. The system should include login, registration, wallet creation/import, portfolio overview, send/receive flows, and transfer history, while clearly separating normal web-app user management from wallet-specific cryptographic operations.[cite:2][cite:14]

This is a **prototype/MVP**, so the first version may use mock balances and mock transfers, but the architecture must be prepared to later support real blockchain integration using RPC providers and a wallet-signing library.[cite:14][cite:7]

## Product requirements

### 1. Authentication module

Build these screens and features:
- Register page with name, email, password, confirm password.
- Login page with email and password.
- Forgot password page.
- Reset password flow.
- Logout functionality.
- Session persistence.
- Optional email verification placeholder.
- Protected routes so dashboard and wallet pages are accessible only after login.

### 2. Wallet onboarding module

After login, the user must see two primary options:
- Create Wallet
- Import Wallet

These wallet actions match the core wallet operations documented by Trust Wallet’s developer materials.[cite:14]

Build these exact features:
- Create wallet using a generated 12-word recovery phrase.
- Show recovery phrase in a protected screen.
- Force the user to confirm selected recovery words before continuing.
- Import wallet using existing recovery phrase.
- Show backup warning modal.
- Show “Never share your recovery phrase” warning.
- Add a success screen after wallet creation or import.

### 3. Dashboard module

Build a main wallet dashboard with:
- Total portfolio balance card.
- List of wallet accounts.
- List of supported assets.
- Recent transactions widget.
- Quick actions: Send, Receive, Add Wallet, View History.
- Wallet selector dropdown if multiple wallets are supported.
- Empty state when no assets or transactions exist.

### 4. Asset management module

Build an assets page or section with:
- Native assets list such as ETH, BTC, MATIC, or demo assets.
- Per-asset balance.
- Fiat value placeholder.
- Asset detail page.
- Token icon, symbol, chain, balance, recent transactions.
- Search/filter assets.
- Optional watchlist/favorite toggle.

### 5. Send flow

Build the send feature with the following steps:
1. Select asset.
2. Enter recipient address.
3. Enter amount.
4. Show available balance.
5. Show network fee or estimated gas placeholder.
6. Review transaction screen.
7. Ask for password/PIN confirmation.
8. Submit transaction.
9. Show success or failed status.

Trust Wallet’s public usage documentation describes transaction creation, signing, and submission as core wallet operations, so the send flow should feel structured and security-conscious.[cite:14]

### 6. Receive flow

Build the receive feature with:
- Wallet address display.
- QR code display.
- Copy address button.
- Chain selection if multi-chain demo is supported.
- Optional share button.

### 7. Transaction history module

Build a full history page with:
- Incoming and outgoing transactions.
- Status badges: pending, success, failed.
- Asset name and amount.
- Sender and receiver address.
- Date and time.
- Fee.
- Transaction hash placeholder.
- Filters by asset, type, and status.
- Transaction detail drawer or modal.

### 8. Security and settings module

Build a settings section with:
- Profile settings.
- Change password.
- Backup phrase warning page.
- Reveal recovery phrase flow behind password confirmation.
- Logout from all sessions.
- Security activity log placeholder.
- Connected devices/sessions placeholder.
- Wallet lock toggle.
- 2FA/WebAuthn placeholder for future enhancement.

Trust Wallet’s security guides strongly emphasize recovery-phrase protection, local control of keys, and defensive user behavior.[cite:6][cite:10]

### 9. UI and UX requirements

The interface should feel like a modern crypto wallet product:
- Clean dashboard layout.
- Mobile-first responsive design.
- Sidebar or top navigation for desktop.
- Bottom navigation or compact navigation for mobile.
- Dark mode preferred, optional light mode.
- High-clarity cards for assets and transactions.
- Clear warning states for sensitive actions.
- Smooth onboarding with minimal confusion.
- Strong empty states and loading skeletons.

### 10. Prototype logic modes

Implement the prototype in one of these modes:
- **Mock mode:** balances, transfers, and histories are simulated using local demo data.
- **Hybrid mode:** auth is real, but blockchain operations are mocked.
- **Future-ready mode:** architecture prepared for real integration with Wallet Core or EVM libraries plus RPC providers.[cite:2][cite:14]

## Technical requirements

### Frontend

Use one of these:
- Next.js + React + Tailwind CSS
- React + Vite + Tailwind CSS

Frontend must include:
- Auth pages
- Dashboard
- Wallet onboarding screens
- Asset list
- Send/receive forms
- Transaction history
- Settings
- Route guards
- Form validation
- Responsive design

### Backend

Use one of these:
- Laravel API
- Node.js with Express or NestJS

Backend responsibilities:
- User registration and login
- Password reset
- Session/token management
- User profile management
- Wallet metadata storage
- Transaction history storage
- Audit/security event storage
- Future integration endpoints for wallet services

### Database

Use MySQL or PostgreSQL.

Suggested tables:
- users
- sessions
- wallets
- wallet_accounts
- assets
- transactions
- security_events
- password_resets
- connected_sessions

Suggested relationships:
- One user has many wallets.
- One wallet has many wallet accounts.
- One wallet account has many transactions.
- One asset appears in many transactions.
- One user has many security events.

### Wallet engine integration

For future real wallet support, keep the system ready for:
- BIP39 mnemonic generation/import.
- Address derivation.
- Local transaction signing.
- EVM support using ethers.js or viem.
- Optional Trust Wallet Core integration for multi-chain support.[cite:2][cite:14]

### Blockchain and API integration

Future integration options:
- Alchemy
- Infura
- QuickNode
- Direct RPC endpoints

These will later be used for:
- Fetching balances.
- Estimating gas.
- Broadcasting signed transactions.
- Fetching transaction history if not fully indexed internally.[cite:14]

## Exact pages to build

Build these pages/screens exactly:
1. Landing page or splash page.
2. Register page.
3. Login page.
4. Forgot password page.
5. Wallet setup page.
6. Create wallet page.
7. Confirm recovery phrase page.
8. Import wallet page.
9. Dashboard page.
10. Asset details page.
11. Send asset page.
12. Receive asset page.
13. Transfer review page.
14. Transfer success/failure page.
15. Transaction history page.
16. Transaction details modal/page.
17. Settings page.
18. Security activity page.
19. Profile page.
20. Empty state screens for no wallet/no transactions/no assets.

## Exact features to build point by point

- User registration.
- User login.
- Logout.
- Forgot/reset password.
- Protected dashboard.
- Create wallet.
- Import wallet.
- Recovery phrase display.
- Recovery phrase confirmation.
- Wallet backup warnings.
- Wallet list.
- Wallet selector.
- Portfolio balance card.
- Asset list.
- Asset detail screen.
- Send form.
- Receive screen.
- QR code for address.
- Transaction review step.
- Transfer confirmation.
- Transfer history.
- Transaction detail modal.
- Status badges.
- Settings and profile.
- Security logs placeholder.
- Session management placeholder.
- Mobile responsive layout.
- Dark theme UI.
- Mock data service layer.
- API-ready architecture.

## Non-goals for the first prototype

Do **not** build these in version 1 unless explicitly required:
- Swaps.
- Staking.
- NFT marketplace.
- Browser extension.
- Complex multi-chain bridging.
- Real private-key export.
- Production-grade custody backend.
- Full dApp browser.

Trust Wallet supports a broader ecosystem, but its core wallet materials show that wallet creation, import, address derivation, and signing are the essential base behaviors to model first.[cite:2][cite:14]

## Expected output from Codex

Generate the project as a structured prototype with:
- Clear folder structure.
- Reusable components.
- Mock API/data layer.
- Clean routing.
- Auth flow.
- Dashboard flow.
- Wallet onboarding flow.
- Asset and transaction modules.
- Responsive styling.
- Seed data for demo balances and transactions.

Also generate:
- README explaining setup.
- Database schema or migration plan.
- Dummy API contracts.
- Notes marking which parts are mock and which are future blockchain integration points.

## Final instruction to Codex

Build a polished, realistic, Trust Wallet-inspired web wallet prototype focused on authentication, wallet onboarding, portfolio display, send/receive operations, and transaction history. Keep the architecture ready for future blockchain integration, but implement the current version safely as a prototype with mockable wallet operations and clear separation between user auth, wallet data, and future signing infrastructure.[cite:2][cite:14][cite:6]
# Modern Full-Stack Stack Recommendation for High-Performance UI and Advanced Animations

A strong modern stack for a highly interactive web product is **Next.js + TypeScript + Tailwind CSS + GSAP on the frontend, Express.js for custom backend APIs, and Supabase for Postgres, authentication, storage, and realtime features**.[cite:38][cite:45][cite:43] This combination balances performance, developer experience, production structure, and flexibility for animation-heavy user interfaces.[cite:38][cite:42][cite:46]

## Recommended stack

### Frontend
- **Next.js** for application structure, routing, SSR/SSG where needed, and production-oriented performance tooling.[cite:38]
- **TypeScript** for safer component contracts, animation state typing, API typing, and improved maintainability in large UI systems.
- **Tailwind CSS** for fast styling, design consistency, and reduced CSS overhead in product UIs.
- **GSAP + `@gsap/react`** for advanced timelines, micro-interactions, scroll effects, and controlled animation lifecycles in React-based applications.[cite:45][cite:42]

### Backend
- **Express.js** for lightweight custom APIs, orchestration logic, webhooks, caching, rate limiting, and integration with third-party services.
- **Supabase** for PostgreSQL, authentication, row-level security, storage, and optional realtime subscriptions.[cite:43][cite:46]

### Supporting tools
- **Zod** for schema validation across frontend and backend.
- **TanStack Query** for client-side data synchronization and cache control.
- **Framer Motion only for simple UI transitions** if needed, while keeping GSAP as the primary tool for complex, timeline-based animation.
- **Vercel** for frontend deployment and **Render/Railway/Fly.io** for Express deployment.

## Why this stack works well

This stack is effective because it separates concerns cleanly: Next.js handles the high-performance user experience, Express handles custom server logic, and Supabase handles managed data and authentication.[cite:38][cite:43][cite:46] GSAP fits especially well when the product needs complex sequences, scroll choreography, pinned sections, and high-fidelity motion that goes beyond simple state transitions.[cite:45][cite:42]

For animation-heavy applications, the most important architectural rule is to keep animation control close to the DOM and isolate it in client components or animation wrappers. GSAP’s React guidance recommends `useGSAP()` with automatic cleanup through `gsap.context()`, which is valuable in large apps with route changes and component remounting.[cite:45][cite:42]

## Next.js vs React with TypeScript

### High-level difference

React is the UI library, while Next.js is a framework built on React that adds routing, rendering strategies, bundling conventions, and application structure.[cite:38] If the goal is a production-grade full-stack front end with SEO, route-based splitting, server rendering, and a more opinionated architecture, Next.js is usually the stronger default.[cite:38]

### Comparison table

| Area | Next.js + TypeScript | React + TypeScript |
|---|---|---|
| Core model | Full React framework with routing and rendering conventions.[cite:38] | UI library with freedom to choose routing, build tooling, SSR strategy, and app structure. |
| Performance defaults | Built-in route-based architecture, server/client component model, and production-oriented optimizations.[cite:38] | Can be very fast, but requires manual choice of tooling and optimization strategy. |
| Routing | Built-in App Router.[cite:38] | Requires React Router or another routing layer. |
| SSR/SSG | Native support for server rendering and static generation.[cite:38] | Needs separate framework or custom setup for SSR/SSG. |
| GSAP integration | Excellent, but GSAP must stay in client components because animations need DOM access.[cite:45][cite:41] | Excellent and often simpler because the environment is purely client-rendered by default.[cite:45] |
| Project structure | More opinionated and scalable for larger products. | More flexible for prototypes, isolated SPAs, and simpler deployments. |
| Backend proximity | Easy to pair with APIs, middleware, and edge logic, though Express can still remain separate. | Purely frontend unless paired with a separate backend from the start. |
| Best fit | Production apps, content-rich apps, dashboard products, hybrid-rendered apps. | Animation-heavy SPAs, prototypes, microsites, and products needing full custom client control. |

### Which one is better for GSAP?

For **maximum simplicity in DOM-heavy animation work**, plain React with TypeScript is slightly easier because everything is client-side by default and there is less risk of mixing server and client concerns. GSAP itself is framework-agnostic, and its React integration is explicitly designed to work through `useGSAP()` for clean setup and teardown.[cite:42][cite:45]

For a **real product with scale, routing, SEO, and better production ergonomics**, Next.js is usually the better choice, but animations should be isolated inside client components using `"use client"` and refs. In App Router projects, animation code should not be placed in server components because GSAP depends on browser APIs and direct DOM access.[cite:38][cite:41][cite:45]

### Practical recommendation

- Choose **Next.js + TypeScript** if the product is a serious application, dashboard, marketing site, or hybrid product with authenticated areas and long-term maintainability requirements.[cite:38]
- Choose **React + TypeScript** if the project is primarily a single-page experience, internal tool, demo, or animation-first interface where complete client-side control matters more than framework structure.

In most cases, **Next.js wins overall**, while **React-only wins on minimalism**.

## GSAP integration guidance

GSAP’s official React documentation recommends using `@gsap/react` and the `useGSAP()` hook because it acts as a React-friendly replacement for effect hooks and handles cleanup automatically using `gsap.context()`.[cite:45][cite:42] This is especially important in route transitions, conditional rendering, and reusable animated sections.[cite:45]

### Best practices
- Keep GSAP inside client-rendered components.
- Use `ref`-scoped selectors instead of global selectors.[cite:42]
- Use timeline composition for page sections rather than scattered one-off tweens.
- Avoid animating layout-critical properties excessively; prefer transforms and opacity for smoother rendering.
- For scroll-driven experiences, isolate `ScrollTrigger` logic so route changes cleanly destroy instances.
- In Next.js App Router, create dedicated animated components or providers instead of mixing motion logic into server-rendered layout code.[cite:41][cite:38]

### Frontend setup recommendation

The best frontend setup for your stated goal is:
- **Next.js 15+ with App Router**
- **TypeScript**
- **Tailwind CSS**
- **GSAP + `@gsap/react`**
- **TanStack Query** for server-state handling
- **Zod** for request and form validation

This gives strong performance characteristics, clean route organization, and controlled advanced animation support.[cite:38][cite:45]

## Architecture with Express.js and Supabase

### Core architecture idea

Use **Next.js as the frontend application**, **Express.js as the custom backend service**, and **Supabase as the data/auth platform**. Supabase Auth is built on top of the project’s Postgres database and integrates closely with authorization through Row Level Security, which makes it a strong managed backend foundation.[cite:43][cite:46]

### Responsibilities by layer

| Layer | Responsibility |
|---|---|
| Next.js frontend | UI rendering, route handling, forms, dashboards, animation orchestration, client-side data fetching |
| Express.js backend | Business logic, third-party integrations, secure server-only operations, webhook handling, file-processing jobs, rate limiting |
| Supabase Auth | Signup, login, session handling, user identity, auth tokens.[cite:43][cite:46] |
| Supabase Postgres | Core relational database, policies, profiles, app data, audit logs.[cite:43] |
| Supabase Storage | File uploads such as avatars, media, or generated assets |
| Supabase Realtime | Live notifications, collaborative events, status updates |

### Recommended request flow

1. User interacts with the Next.js frontend.
2. Frontend authenticates the user via Supabase Auth.[cite:43][cite:46]
3. Frontend reads allowed user data directly from Supabase where appropriate, using secure policies.
4. Frontend calls Express.js for custom business logic, aggregation, protected integrations, or workflow-heavy operations.
5. Express validates the Supabase JWT before processing protected requests.
6. Express reads or writes to Supabase/Postgres using a service role only where elevated permissions are necessary.
7. Responses return to the frontend, where GSAP-powered UI transitions present results smoothly.

This pattern keeps the frontend fast, the backend focused, and the database/auth layer managed.[cite:43][cite:46]

## Suggested system design

### Frontend modules
- Marketing pages
- Auth screens
- Application shell
- Dashboard views
- Animated sections/components
- Data hooks
- Form system
- Notification/toast layer

### Express modules
- Auth verification middleware
- User profile service
- Billing/integration service
- Webhook handlers
- Background job triggers
- Audit/event logging endpoints
- Admin-only endpoints

### Supabase schema areas
- `auth.users` for managed auth records under Supabase Auth.[cite:43]
- `profiles` for application-facing user profile data
- `projects` or domain data tables
- `activity_logs` for auditing
- `media_assets` for uploaded files
- `notifications` for live updates

## Authentication model

Supabase provides built-in authentication and ties authorization to Postgres Row Level Security, allowing fine-grained access control at the database layer.[cite:46][cite:43] That means the recommended approach is:
- Use **Supabase Auth** for login, signup, password reset, and session handling.
- Use **RLS policies** so users can only access their own records.[cite:46]
- Use **Express middleware** to verify JWTs from Supabase on protected API routes.
- Reserve the **Supabase service role key** for trusted server-side actions only.

This model is simpler and safer than rebuilding authentication manually in Express.[cite:43][cite:46]

## Performance recommendations

For high-performance UI, most gains will come from frontend discipline rather than the framework alone. Next.js provides useful performance primitives, but smoothness still depends on how components, animation, and state are managed.[cite:38][cite:45]

Use these practices:
- Prefer transform- and opacity-based GSAP animations.
- Keep animated trees shallow and isolated.
- Avoid unnecessary React re-renders in animated regions.
- Lazy-load heavy sections and media.
- Use optimized image handling and code splitting.
- Use server rendering only where it improves UX or SEO.
- Cache read-heavy requests through TanStack Query or edge caching.
- Keep Express handlers narrow and fast; avoid turning Express into a monolith.

## Final recommendation

The most balanced modern stack for your requirement is:

- **Frontend:** Next.js + TypeScript + Tailwind CSS + GSAP + `@gsap/react`
- **State/data:** TanStack Query + Zod
- **Backend:** Express.js
- **Database/Auth:** Supabase Postgres + Supabase Auth + Row Level Security
- **Deployment:** Vercel for frontend, Render/Railway/Fly.io for Express, Supabase Cloud for data/auth

Choose **Next.js** over plain React when the app needs scalable routing, hybrid rendering, and stronger production structure.[cite:38] Choose **plain React** only when the product is intentionally a client-only SPA and animation control simplicity matters more than framework-level capabilities.[cite:45][cite:42]

For advanced animations, **GSAP works excellently with both**, but Next.js requires more discipline around client-only boundaries, while React-only has a simpler mental model.[cite:41][cite:45] For backend and persistence, **Express + Supabase** is a strong combination because it avoids rebuilding auth and database infrastructure while preserving flexibility for custom server logic.[cite:43][cite:46]
