# Wallax MVP API Contracts

These contracts describe the Express API boundary scaffolded in `server/`. The current Next.js prototype still runs wallet behavior in safe browser mock mode, while protected backend routes are prepared for Supabase Auth and Postgres.

## Auth

### POST /auth/register

Request:

```json
{
  "name": "Ada Builder",
  "email": "ada@example.com",
  "password": "password123"
}
```

Response:

```json
{
  "user": {
    "id": "uuid",
    "name": "Ada Builder",
    "email": "ada@example.com",
    "emailVerified": false
  },
  "session": {
    "accessToken": "jwt",
    "expiresAt": "2026-05-27T12:00:00.000Z"
  }
}
```

### POST /auth/login

Request:

```json
{
  "email": "ada@example.com",
  "password": "password123"
}
```

### POST /auth/password-reset

Request:

```json
{
  "email": "ada@example.com"
}
```

### POST /auth/password-reset/confirm

Request:

```json
{
  "token": "reset-token",
  "password": "new-password"
}
```

## Wallets

### GET /wallets

Returns all wallets for the authenticated user.

### POST /wallets

Creates wallet metadata after a client-side wallet engine creates a mnemonic and derives accounts.

Request:

```json
{
  "name": "Primary Wallet",
  "source": "created",
  "accounts": [
    {
      "chain": "Ethereum",
      "derivationPath": "m/44'/60'/0'/0/0",
      "address": "0x..."
    }
  ]
}
```

### POST /wallets/import

Stores imported wallet metadata after client-side validation and address derivation. A production design should not send raw recovery phrases to the backend.

## Assets

### GET /wallets/:walletId/assets

Returns assets and balances for one wallet.

### PATCH /wallets/:walletId/assets/:assetId

Updates user preferences such as favorite/watchlist state.

## Transactions

### GET /wallets/:walletId/transactions

Query params:

- `assetId`
- `direction`
- `status`
- `cursor`

### POST /wallets/:walletId/transactions/prepare

Returns a transaction preview and fee estimate. For real chains this endpoint can aggregate RPC fee data but signing should stay client-side.

### POST /wallets/:walletId/transactions/submit

Accepts a signed transaction payload or mock transfer request, then stores status and hash.

Request:

```json
{
  "assetId": "uuid",
  "toAddress": "0x...",
  "amount": "0.1",
  "signedPayload": "0x..."
}
```

## Security

### GET /security/events

Returns audit events for the authenticated user.

### GET /sessions

Returns connected browser/device sessions.

### DELETE /sessions/:sessionId

Revokes a connected session.
