import type { Asset, Wallet, WalletAccount, WalletTransaction } from "@/lib/types";

export const ASSETS: Asset[] = [
  {
    id: "eth",
    name: "Ethereum",
    symbol: "ETH",
    chain: "Ethereum",
    price: 3298.42,
    color: "#627eea",
    balance: 1.8245
  },
  {
    id: "btc",
    name: "Bitcoin",
    symbol: "BTC",
    chain: "Bitcoin",
    price: 68420.18,
    color: "#f7931a",
    balance: 0.1264
  },
  {
    id: "matic",
    name: "Polygon",
    symbol: "MATIC",
    chain: "Polygon",
    price: 0.82,
    color: "#8247e5",
    balance: 842.2
  },
  {
    id: "usdc",
    name: "USD Coin",
    symbol: "USDC",
    chain: "Ethereum",
    price: 1,
    color: "#2775ca",
    balance: 2400
  },
  {
    id: "sol",
    name: "Solana",
    symbol: "SOL",
    chain: "Solana",
    price: 152.44,
    color: "#14f195",
    balance: 38.42
  },
  {
    id: "bnb",
    name: "BNB",
    symbol: "BNB",
    chain: "BNB Smart Chain",
    price: 612.8,
    color: "#f3ba2f",
    balance: 6.18
  }
];

export const WORDS = [
  "anchor",
  "bridge",
  "canyon",
  "dawn",
  "ember",
  "fabric",
  "globe",
  "harbor",
  "island",
  "jungle",
  "kernel",
  "lantern",
  "meadow",
  "nebula",
  "orange",
  "pioneer",
  "quartz",
  "raven",
  "silver",
  "timber",
  "unfold",
  "velvet",
  "window",
  "yellow",
  "zephyr",
  "atlas",
  "beacon",
  "circle",
  "drift",
  "engine",
  "forest",
  "galaxy",
  "honest",
  "ivory",
  "journey",
  "kernel",
  "ledger",
  "marble",
  "native",
  "ocean",
  "planet",
  "quiet",
  "rocket",
  "signal",
  "travel",
  "urban",
  "vivid",
  "wonder",
  "xenon",
  "yonder",
  "zenith"
];

export function assetById(id: string) {
  return ASSETS.find((asset) => asset.id === id) ?? ASSETS[0];
}

export function generateMnemonic() {
  const pool = [...new Set(WORDS)];
  const words: string[] = [];
  while (words.length < 12) {
    const index = Math.floor(Math.random() * pool.length);
    words.push(pool.splice(index, 1)[0]);
  }
  return words;
}

export function deriveAccounts(phrase: string[]): WalletAccount[] {
  const seed = hashString(phrase.join(" "));
  return [
    { id: uid("acct"), chain: "Ethereum", address: `0x${hexFromSeed(`${seed}eth`, 40)}` },
    { id: uid("acct"), chain: "Bitcoin", address: `bc1q${randomStringFromSeed(`${seed}btc`, 38)}` },
    { id: uid("acct"), chain: "Polygon", address: `0x${hexFromSeed(`${seed}poly`, 40)}` },
    { id: uid("acct"), chain: "Solana", address: randomStringFromSeed(`${seed}sol`, 44) },
    { id: uid("acct"), chain: "BNB Smart Chain", address: `0x${hexFromSeed(`${seed}bnb`, 40)}` }
  ];
}

export function createWalletForUser(
  userId: string,
  name: string,
  phrase: string[],
  source: Wallet["source"]
): Wallet {
  return {
    id: uid("wallet"),
    userId,
    name: name || "Primary Wallet",
    phrase,
    source,
    createdAt: now(),
    accounts: deriveAccounts(phrase),
    assets: ASSETS.map((asset, index) => ({
      assetId: asset.id,
      balance: roundBalance(asset.balance * (source === "imported" ? 0.72 : 1)),
      favorite: index < 2
    })),
    transactions: seedTransactions(phrase)
  };
}

export function demoWallet(userId: string): Wallet {
  const phrase = [
    "anchor",
    "bridge",
    "canyon",
    "dawn",
    "ember",
    "fabric",
    "globe",
    "harbor",
    "island",
    "jungle",
    "kernel",
    "lantern"
  ];

  return {
    id: "wallet_demo",
    userId,
    name: "Demo Wallet",
    phrase,
    source: "seed",
    createdAt: now(),
    accounts: deriveAccounts(phrase),
    assets: ASSETS.map((asset, index) => ({
      assetId: asset.id,
      balance: asset.balance,
      favorite: index < 2
    })),
    transactions: seedTransactions(phrase)
  };
}

export function seedTransactions(phrase: string[]): WalletTransaction[] {
  const accounts = deriveAccounts(phrase);
  const evm = accounts[0].address;
  return [
    {
      id: uid("tx"),
      assetId: "eth",
      type: "incoming",
      status: "success",
      amount: 0.84,
      fee: "0.0012 ETH",
      from: fakeEvmAddress(),
      to: evm,
      hash: fakeHash(),
      createdAt: offsetDate(-1)
    },
    {
      id: uid("tx"),
      assetId: "usdc",
      type: "outgoing",
      status: "pending",
      amount: 120,
      fee: "0.0008 ETH",
      from: evm,
      to: fakeEvmAddress(),
      hash: fakeHash(),
      createdAt: offsetDate(-2)
    },
    {
      id: uid("tx"),
      assetId: "btc",
      type: "incoming",
      status: "success",
      amount: 0.021,
      fee: "0.00004 BTC",
      from: `bc1q${randomString(36)}`,
      to: accounts[1].address,
      hash: fakeHash(),
      createdAt: offsetDate(-5)
    },
    {
      id: uid("tx"),
      assetId: "matic",
      type: "outgoing",
      status: "failed",
      amount: 42,
      fee: "0.03 MATIC",
      from: evm,
      to: fakeEvmAddress(),
      hash: fakeHash(),
      createdAt: offsetDate(-8)
    }
  ];
}

export function estimateFee(assetId: string) {
  const asset = assetById(assetId);
  if (asset.chain === "Bitcoin") return "0.00004 BTC";
  if (asset.chain === "Solana") return "0.00001 SOL";
  if (asset.chain === "Polygon") return "0.03 MATIC";
  if (asset.chain === "BNB Smart Chain") return "0.0007 BNB";
  return "0.0012 ETH";
}

export function qrCells(value: string) {
  const seed = hashString(value);
  const cells: boolean[] = [];
  for (let y = 0; y < 21; y += 1) {
    for (let x = 0; x < 21; x += 1) {
      const finder = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);
      const inner =
        (x > 1 && x < 5 && y > 1 && y < 5) ||
        (x > 15 && x < 19 && y > 1 && y < 5) ||
        (x > 1 && x < 5 && y > 15 && y < 19);
      cells.push(finder ? x === 0 || y === 0 || x === 6 || y === 6 || inner : (x * 17 + y * 31 + seed) % 5 < 2);
    }
  }
  return cells;
}

export function portfolioValue(wallet: Wallet) {
  return wallet.assets.reduce((sum, holding) => sum + holding.balance * assetById(holding.assetId).price, 0);
}

export function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  }).format(value || 0);
}

export function formatAmount(value: number) {
  return Number(value).toLocaleString("en-US", { maximumFractionDigits: 6 });
}

export function formatDate(value: string) {
  return new Date(value).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
}

export function shortAddress(value: string) {
  if (!value || value.length < 14) return value;
  return `${value.slice(0, 8)}...${value.slice(-6)}`;
}

export function roundBalance(value: number) {
  return Math.max(0, Math.round(value * 1_000_000) / 1_000_000);
}

export function now() {
  return new Date().toISOString();
}

export function offsetDate(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

export function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

export function fakeHash() {
  return `0x${randomString(64, "0123456789abcdef")}`;
}

function fakeEvmAddress() {
  return `0x${randomString(40, "0123456789abcdef")}`;
}

function randomString(length: number, alphabet = "abcdefghijklmnopqrstuvwxyz0123456789") {
  let out = "";
  for (let i = 0; i < length; i += 1) out += alphabet[Math.floor(Math.random() * alphabet.length)];
  return out;
}

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function hexFromSeed(seed: string, length: number) {
  return randomStringFromSeed(seed, length, "0123456789abcdef");
}

function randomStringFromSeed(seedValue: string, length: number, alphabet = "abcdefghijklmnopqrstuvwxyz0123456789") {
  let seed = hashString(seedValue);
  let out = "";
  for (let i = 0; i < length; i += 1) {
    seed = (seed * 9301 + 49297) % 233280;
    out += alphabet[Math.floor((seed / 233280) * alphabet.length)];
  }
  return out;
}
