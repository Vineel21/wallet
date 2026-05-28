"use client";

import { Copy, History, Star, WalletCards } from "lucide-react";
import Link from "next/link";
import { assetById, formatAmount, formatDate, money, shortAddress } from "@/lib/mock-data";
import type { Wallet, WalletHolding, WalletTransaction } from "@/lib/types";
import { AssetIcon, Badge, capitalize, EmptyState } from "@/components/wallet/ui";

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

export function AssetList({ holdings }: { holdings: WalletHolding[] }) {
  if (!holdings.length) {
    return <EmptyState title="No assets" text="Demo holdings will appear after wallet setup." icon={WalletCards} />;
  }

  return (
    <div className="grid gap-2">
      {holdings.map((holding) => {
        const asset = assetById(holding.assetId);
        return (
          <Link
            className="group thin-panel flex min-h-[76px] min-w-0 items-center justify-between gap-3 rounded-ui p-3.5 transition duration-300 hover:border-cyan/30 hover:bg-cyan/5 hover:-translate-y-0.5"
            data-float-in
            href={`/asset/${asset.id}`}
            key={asset.id}
          >
            <div className="flex min-w-0 items-center gap-3">
              <AssetIcon assetId={asset.id} />
              <div className="min-w-0">
                <strong className="block truncate font-bold text-white group-hover:text-cyan transition-colors">
                  {asset.name}
                  {holding.favorite && <Star className="ml-1.5 inline h-3.5 w-3.5 fill-amber text-amber" />}
                </strong>
                <span className="block truncate text-xs text-slate-400 mt-0.5">
                  {asset.symbol} on {asset.chain}
                </span>
              </div>
            </div>
            
            {/* Sparkline chart in the center */}
            <div className="hidden sm:block shrink-0 mx-auto">
              <Sparkline seed={asset.id} color={asset.color} />
            </div>

            <div className="shrink-0 text-right">
              <strong className="block font-bold text-white">
                {formatAmount(holding.balance)} {asset.symbol}
              </strong>
              <span className="text-xs text-slate-400 mt-0.5">{money(holding.balance * asset.price)}</span>
            </div>
          </Link>
        );
      })}
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
    return <EmptyState title="No transactions" text="Mock sends and receives appear here." icon={History} />;
  }

  return (
    <div className="grid gap-2">
      {transactions.map((tx) => {
        const asset = assetById(tx.assetId);
        return (
          <button
            className="group thin-panel flex min-h-[76px] w-full min-w-0 items-center justify-between gap-3 rounded-ui p-3.5 text-left transition duration-300 hover:border-purple/30 hover:bg-purple/5 hover:-translate-y-0.5"
            data-float-in
            key={tx.id}
            onClick={() => onOpenTransaction(tx.id)}
          >
            <div className="flex min-w-0 items-center gap-3">
              <AssetIcon assetId={asset.id} />
              <div className="min-w-0">
                <strong className="block truncate font-bold text-white group-hover:text-purple transition-colors">
                  {capitalize(tx.type)} {asset.symbol}
                </strong>
                <span className="block truncate text-xs text-slate-400 mt-0.5">{formatDate(tx.createdAt)}</span>
              </div>
            </div>

            {/* Sparkline in the center */}
            <div className="hidden sm:block shrink-0 mx-auto">
              <Sparkline seed={tx.id} color={tx.type === "incoming" ? "var(--mint)" : "var(--rose)"} />
            </div>

            <div className="shrink-0 text-right">
              <strong className="block font-bold text-white">
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
    <div className="relative grid gap-1.5 text-left">
      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 pl-1 font-mono">Asset</span>
      <select
        className="focus-ring min-h-[46px] w-full rounded-ui border border-white/10 bg-black/40 px-3 text-sm text-white focus:border-cyan/50 focus:bg-black/60 focus:shadow-cyanGlow transition-all duration-300"
        defaultValue={selected}
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
      </select>
    </div>
  );
}
