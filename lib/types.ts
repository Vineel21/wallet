export type Asset = {
  id: string;
  name: string;
  symbol: string;
  chain: string;
  price: number;
  color: string;
  balance: number;
};

export type User = {
  id: string;
  name: string;
  email: string;
  password?: string;
  emailVerified: boolean;
  createdAt: string;
};

export type Session = {
  userId: string;
  accessToken?: string;
  user?: User;
  startedAt: string;
  expiresAt: string;
};

export type WalletAccount = {
  id: string;
  chain: string;
  address: string;
};

export type WalletHolding = {
  assetId: string;
  balance: number;
  favorite: boolean;
};

export type TransactionStatus = "pending" | "success" | "failed";
export type TransactionType = "incoming" | "outgoing";

export type WalletTransaction = {
  id: string;
  assetId: string;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  fee: string;
  from: string;
  to: string;
  hash: string;
  createdAt: string;
};

export type Wallet = {
  id: string;
  userId: string;
  name: string;
  phrase: string[];
  source: "created" | "imported" | "seed";
  createdAt: string;
  accounts: WalletAccount[];
  assets: WalletHolding[];
  transactions: WalletTransaction[];
};

export type SecurityEvent = {
  id: string;
  userId: string;
  type: string;
  detail: string;
  createdAt: string;
};

export type PendingTransfer = {
  assetId: string;
  recipient: string;
  amount: number;
  fee: string;
};

export type TransferResult = {
  status: TransactionStatus;
  hash: string;
  assetId: string;
  amount: number;
  createdAt: string;
};

export type HistoryFilters = {
  asset: string;
  type: string;
  status: string;
};
