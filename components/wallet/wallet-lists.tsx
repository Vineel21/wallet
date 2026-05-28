"use client";

import { Copy, History, Star, WalletCards, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { assetById, formatAmount, formatDate, money, shortAddress } from "@/lib/mock-data";
import type { Wallet, WalletHolding, WalletTransaction } from "@/lib/types";
import { AssetIcon, Badge, capitalize, EmptyState, SelectControl } from "@/components/wallet/ui";

export function Sparkline({ seed, color = "var(--cyan)" }: { seed: string; color?: string }) {
  const hash = hashString(seed);
  const points = [];
  const width = 80;
  const height = 24;
  
  let currentVal = 12;
  for (let i = 0; i < 7; i++) {
    const change = ((hash >> (i * 3)) & 7) - 3.5;
    currentVal = Math.max(3, Math.min(21, currentVal + change));
    points.push(`${(i * width) / 6},${currentVal}`);
  }
  
  const pathData = `M ${points.join(" L ")}`;
  
  return (
    <svg width={width} height={height} className="overflow-visible opacity-50 group-hover:opacity-100 transition-opacity duration-300">
      <path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function hashString(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

const MOCK_CHANGES: Record<string, { percent: string; positive: boolean }> = {
  eth: { percent: "+3.42%", positive: true },
  btc: { percent: "+1.85%", positive: true },
  matic: { percent: "-2.10%", positive: false },
  usdc: { percent: "0.00%", positive: true },
  sol: { percent: "+7.89%", positive: true },
  bnb: { percent: "-0.45%", positive: false }
};

export function AssetList({ holdings }: { holdings: WalletHolding[] }) {
  if (!holdings.length) {
    return <EmptyState title="No assets" text="Assets will appear after wallet setup." icon={WalletCards} />;
  }

  return (
    <div className="overflow-hidden rounded-ui border border-white/5 bg-white/[0.01] backdrop-blur-md">
          {/* Table Headers */}
          <div className="grid grid-cols-[minmax(0,1.25fr)_minmax(96px,0.75fr)] items-center gap-3 border-b border-white/5 px-3 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-400 font-mono xs:px-4 sm:grid-cols-[2fr_1fr_1fr_1.5fr] sm:px-5 sm:py-3.5 sm:text-[10px]">
            <span>Asset</span>
            <span className="text-left hidden sm:block">24h Change</span>
            <span className="text-center hidden sm:block">Market trend</span>
            <span className="text-right">Balance / Value</span>
          </div>

          <div className="divide-y divide-white/5">
            {holdings.map((holding) => {
              const asset = assetById(holding.assetId);
              const change = MOCK_CHANGES[holding.assetId] || { percent: "0.00%", positive: true };
              return (
                <Link
                  className="grid grid-cols-[minmax(0,1.25fr)_minmax(96px,0.75fr)] items-center gap-3 px-3 py-3.5 text-left transition duration-300 hover:bg-white/[0.03] group xs:px-4 sm:grid-cols-[2fr_1fr_1fr_1.5fr] sm:px-5 sm:py-4"
                  data-float-in
                  href={`/asset/${asset.id}`}
                  key={asset.id}
                >
                  {/* Column 1: Icon & Name */}
                  <div className="flex items-center gap-3 min-w-0">
                    <AssetIcon assetId={asset.id} />
                    <div className="min-w-0">
                      <strong className="block truncate font-bold text-white group-hover:text-cyan transition-colors text-sm sm:text-base">
                        {asset.name}
                        {holding.favorite && <Star className="ml-1.5 inline h-3.5 w-3.5 fill-amber text-amber" />}
                      </strong>
                      <span className="block truncate text-xs text-slate-400 mt-0.5">
                        {asset.symbol} on {asset.chain}
                      </span>
                    </div>
                  </div>

                  {/* Column 2: 24h Change */}
                  <div className="text-left hidden sm:block">
                    <span className={`inline-flex items-center text-[10px] sm:text-xs font-bold font-mono px-2 py-0.5 rounded border ${
                      change.positive ? "text-mint border-mint/25 bg-mint/5" : "text-rose border-rose/25 bg-rose/5"
                    }`}>
                      {change.percent}
                    </span>
                  </div>

                  {/* Column 3: Sparkline */}
                  <div className="hidden sm:flex justify-center shrink-0">
                    <Sparkline seed={asset.id} color={asset.color} />
                  </div>

                  {/* Column 4: Balance */}
                  <div className="min-w-0 text-right">
                    <strong className="block break-words text-xs font-semibold leading-tight text-white font-outfit xs:text-sm sm:text-base">
                      {formatAmount(holding.balance)} {asset.symbol}
                    </strong>
                    <span className="mt-0.5 block text-[11px] text-slate-400 font-outfit sm:text-xs">
                      {money(holding.balance * asset.price)}
                    </span>
                    {/* Fallback 24h change for mobile */}
                    <span className={`inline-flex sm:hidden mt-1 text-[9px] font-bold font-mono px-1 rounded border ${
                      change.positive ? "text-mint border-mint/20 bg-mint/5" : "text-rose border-rose/20 bg-rose/5"
                    }`}>
                      {change.percent}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
    </div>
  );
}

export function TxList({
  transactions,
  onOpenTransaction
}: {
  transactions: WalletTransaction[];
  onOpenTransaction: (transactionId: string) => void;
}) {
  if (!transactions.length) {
    return <EmptyState title="No transactions" text="Confirmed wallet activity will appear here." icon={History} />;
  }

  return (
    <div className="overflow-hidden border border-white/5 bg-white/[0.01] rounded-ui backdrop-blur-md">
      {/* Table Headers */}
      <div className="grid grid-cols-[minmax(0,1.25fr)_minmax(100px,0.75fr)] items-center gap-3 border-b border-white/5 px-3 py-3 text-[9px] font-bold uppercase tracking-widest text-slate-400 font-mono xs:px-4 sm:grid-cols-[2fr_1fr_1.5fr] sm:px-5 sm:py-3.5 sm:text-[10px]">
        <span>Activity</span>
        <span className="text-center hidden sm:block">Market flow</span>
        <span className="text-right">Amount / Status</span>
      </div>

      <div className="divide-y divide-white/5">
        {transactions.map((tx) => {
          const asset = assetById(tx.assetId);
          return (
            <button
              className="grid w-full grid-cols-[minmax(0,1.25fr)_minmax(100px,0.75fr)] items-center gap-3 px-3 py-3.5 text-left transition duration-300 hover:bg-white/[0.03] group xs:px-4 sm:grid-cols-[2fr_1fr_1.5fr] sm:px-5 sm:py-4"
              data-float-in
              key={tx.id}
              onClick={() => onOpenTransaction(tx.id)}
            >
              {/* Column 1: Direction icon overlay and Name */}
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="relative shrink-0">
                  <AssetIcon assetId={asset.id} />
                  <span className={`absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[#090d16] text-white shadow-sm ${
                    tx.type === "incoming" ? "bg-mint" : "bg-rose"
                  }`}>
                    {tx.type === "incoming" ? (
                      <ArrowDownLeft className="h-2.5 w-2.5" />
                    ) : (
                      <ArrowUpRight className="h-2.5 w-2.5" />
                    )}
                  </span>
                </div>
                <div className="min-w-0">
                  <strong className="block truncate font-bold text-white group-hover:text-purple transition-colors text-sm sm:text-base">
                    {capitalize(tx.type)} {asset.symbol}
                  </strong>
                  <span className="block truncate text-xs text-slate-400 mt-0.5">{formatDate(tx.createdAt)}</span>
                </div>
              </div>

              {/* Column 2: Sparkline */}
              <div className="hidden sm:flex justify-center shrink-0">
                <Sparkline seed={tx.id} color={tx.type === "incoming" ? "var(--mint)" : "var(--rose)"} />
              </div>

              {/* Column 3: Amount & Badge */}
              <div className="min-w-0 text-right">
                <strong className={`block break-words text-xs font-semibold leading-tight font-outfit xs:text-sm sm:text-base ${
                  tx.type === "incoming" ? "text-mint" : "text-slate-200"
                }`}>
                  {tx.type === "incoming" ? "+" : "-"}
                  {formatAmount(tx.amount)} {asset.symbol}
                </strong>
                <div className="mt-1 flex justify-end">
                  <Badge status={tx.status}>{tx.status}</Badge>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function AccountList({
  wallet,
  onCopyAddress
}: {
  wallet: Wallet;
  onCopyAddress: (address: string) => void;
}) {
  return (
    <div className="grid gap-2 text-left">
      {wallet.accounts.map((account) => (
        <div className="thin-panel flex min-h-[66px] min-w-0 items-center justify-between gap-3 rounded-ui p-3.5" data-float-in key={account.id}>
          <div className="flex min-w-0 items-center gap-3">
            <WalletCards className="h-5 w-5 shrink-0 text-cyan" />
            <div className="min-w-0">
              <strong className="block truncate font-bold text-white text-sm">{account.chain}</strong>
              <span className="block truncate text-xs text-slate-500 font-mono mt-0.5">{shortAddress(account.address)}</span>
            </div>
          </div>
          <button 
            className="focus-ring grid h-9 w-9 shrink-0 place-items-center rounded-ui border border-white/5 bg-[#0f1624]/60 text-slate-400 hover:text-cyan hover:border-cyan/30 hover:scale-105 active:scale-95 transition-all" 
            onClick={() => onCopyAddress(account.address)} 
            title="Copy address"
          >
            <Copy className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}

export function AssetSelect({
  wallet,
  name,
  selected,
  onAssetChange
}: {
  wallet: Wallet;
  name: string;
  selected: string;
  onAssetChange: (assetId: string) => void;
}) {
  return (
    <SelectControl
      defaultValue={selected}
      label="Asset"
      name={name}
      onChange={(event) => onAssetChange(event.target.value)}
      required
    >
      {wallet.assets.map((holding) => {
        const asset = assetById(holding.assetId);
        return (
          <option key={asset.id} value={asset.id} className="bg-ink">
            {asset.symbol} - {asset.name} (available {formatAmount(holding.balance)})
          </option>
        );
      })}
    </SelectControl>
  );
}
