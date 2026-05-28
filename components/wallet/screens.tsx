"use client";

import {
  AlertTriangle,
  ArrowRight,
  BadgeCheck,
  CheckCircle2,
  Clock3,
  Copy,
  Download,
  Eye,
  Fingerprint,
  History,
  Import,
  KeyRound,
  Lock,
  LogOut,
  Plus,
  Repeat2,
  ScanLine,
  Search,
  Send,
  Share2,
  ShieldCheck,
  Smartphone,
  Star,
  Unlock,
  User,
  WalletCards
} from "lucide-react";
import Link from "next/link";
import { FormEvent, useRef, useState } from "react";
import gsap from "gsap";
import { buttonDanger, buttonPrimary, buttonSecondary } from "@/components/wallet/constants";
import {
  AssetIcon,
  BackupModal,
  Badge,
  DetailGrid,
  EmptyState,
  Field,
  FilterSelect,
  FormError,
  Panel,
  QrCode,
  QuickAction,
  SectionHead,
  SelectControl,
  SettingsRow,
  shuffledOptions,
  StaticRow,
  Warning,
  WordGrid
} from "@/components/wallet/ui";
import { AccountList, AssetList, AssetSelect, TxList } from "@/components/wallet/wallet-lists";
import {
  ASSETS,
  assetById,
  estimateFee,
  formatAmount,
  formatDate,
  money,
  portfolioValue,
  shortAddress
} from "@/lib/mock-data";
import type {
  HistoryFilters,
  PendingTransfer,
  SecurityEvent,
  TransferResult,
  User as WalletUser,
  Wallet
} from "@/lib/types";

export function WalletSetupScreen({ onCreateWallet }: { onCreateWallet: () => void }) {
  return (
    <section className="grid gap-6 lg:grid-cols-2 text-left max-w-4xl mx-auto w-full py-8">
      <Panel className="scanline relative overflow-hidden flex flex-col justify-between p-6 min-h-[200px]" animate>
        <div className="absolute inset-0 bg-gradient-to-br from-purple/5 to-transparent pointer-events-none" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold font-display text-white">Create New Wallet</h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              Generate a unique 12-word recovery phrase for this wallet.
            </p>
          </div>
          <ShieldCheck className="h-6 w-6 text-purple" />
        </div>
        <button className={`${buttonPrimary} mt-6 w-full sm:w-fit`} onClick={onCreateWallet}>
          <Plus className="h-4 w-4" />
          Generate Seeds
        </button>
      </Panel>
      <Panel className="relative overflow-hidden flex flex-col justify-between p-6 min-h-[200px]" animate>
        <div className="absolute inset-0 bg-gradient-to-br from-cyan/5 to-transparent pointer-events-none" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold font-display text-white">Import Existing Wallet</h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-400">
              Enter an existing recovery phrase to restore wallet addresses locally.
            </p>
          </div>
          <Import className="h-6 w-6 text-cyan" />
        </div>
        <Link className={`${buttonSecondary} mt-6 w-full sm:w-fit`} href="/import-wallet">
          <Import className="h-4 w-4" />
          Import Phrase
        </Link>
      </Panel>
    </section>
  );
}

export function CreateWalletScreen({
  draftPhrase,
  onRegeneratePhrase
}: {
  draftPhrase: string[];
  onRegeneratePhrase: () => void;
}) {
  return (
    <section className="grid gap-6 max-w-3xl mx-auto w-full text-left py-4">
      <Warning tone="amber" title="Backup Safety Notice:">
        Write down these 12 words in order and store them offline. Anyone with these words can control your assets.
      </Warning>
      <Panel animate>
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-bold font-display text-white">Cryptographic Recovery Phrase</h2>
            <p className="mt-1 text-xs text-slate-400">Record these words in exact order.</p>
          </div>
          <Link className={buttonSecondary} href="/confirm-phrase">
            Continue
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <WordGrid words={draftPhrase} />
      </Panel>
      <div className="flex flex-wrap gap-2" data-animate>
        <Link className={buttonPrimary} href="/confirm-phrase">
          <ShieldCheck className="h-4 w-4" />
          Confirm Phrase
        </Link>
        <button className={buttonSecondary} onClick={onRegeneratePhrase}>
          <Repeat2 className="h-4 w-4" />
          Regenerate
        </button>
      </div>
    </section>
  );
}

export function ConfirmPhraseScreen({
  draftPhrase,
  formError,
  onConfirmPhrase
}: {
  draftPhrase: string[];
  formError: string;
  onConfirmPhrase: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const checks = [1, 5, 9];
  return (
    <form className="grid gap-6 max-w-3xl mx-auto w-full text-left py-4" onSubmit={onConfirmPhrase}>
      <Panel animate>
        <h2 className="text-xl font-bold font-display text-white">Verify Recovery Phrase</h2>
        <p className="mt-1 text-xs text-slate-400">Select the matching words at positions #2, #6, and #10.</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {checks.map((index) => (
            <div className="grid gap-1.5" key={index}>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 pl-1 font-mono">Word #{index + 1}</span>
              <SelectControl
                name={`word${index}`}
                required
              >
                <option value="" className="bg-ink">Choose word...</option>
                {shuffledOptions(draftPhrase, draftPhrase[index]).map((word) => (
                  <option key={word} value={word} className="bg-ink">
                    {word}
                  </option>
                ))}
              </SelectControl>
            </div>
          ))}
        </div>
        <FormError message={formError} />
      </Panel>
      <div className="flex flex-wrap gap-2" data-animate>
        <button className={buttonPrimary} type="submit">
          <BadgeCheck className="h-4 w-4" />
          Complete Setup
        </button>
        <Link className={buttonSecondary} href="/create-wallet">
          Back
        </Link>
      </div>
    </form>
  );
}

export function ImportWalletScreen({
  formError,
  onImportWallet
}: {
  formError: string;
  onImportWallet: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form className="grid gap-6 max-w-3xl mx-auto w-full text-left py-4" onSubmit={onImportWallet}>
      <Warning tone="rose" title="Security Warning:">
        Do not import high-value production wallets into an MVP build. Use a fresh wallet until audits are complete.
      </Warning>
      <Panel animate>
        <h2 className="text-xl font-bold font-display text-white">Import Mnemonic Vault</h2>
        <p className="mt-1 text-xs text-slate-400">Enter your 12-word recovery phrase separated by single spaces.</p>
        <div className="mt-6 grid gap-4">
          <div className="grid gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 pl-1 font-mono">Recovery Phrase</span>
            <textarea
              className="focus-ring min-h-24 resize-y rounded-ui border border-white/10 bg-black/40 px-4 py-3 text-sm text-white focus:border-cyan/50 focus:bg-black/60 focus:shadow-cyanGlow transition-all duration-300 font-mono"
              name="phrase"
              placeholder="anchor bridge canyon dawn ember fabric globe harbor island jungle kernel lantern"
              required
            />
          </div>
          <Field label="Custom Wallet Name" name="walletName" placeholder="My Imported Wallet" />
          <FormError message={formError} />
        </div>
      </Panel>
      <div className="flex flex-wrap gap-2" data-animate>
        <button className={buttonPrimary} type="submit">
          <Import className="h-4 w-4" />
          Import Wallet
        </button>
        <Link className={buttonSecondary} href="/wallet-setup">
          Cancel
        </Link>
      </div>
    </form>
  );
}

export function WalletSuccessScreen() {
  return (
    <div className="max-w-2xl mx-auto w-full py-12 text-left">
      <EmptyState
        title="Vault Decrypted & Ready"
        text="Your wallet metadata is stored in Supabase. MVP test balances are ready for send and receive flows."
        icon={CheckCircle2}
        actions={
          <>
            <Link className={buttonPrimary} href="/dashboard">
              Enter Dashboard
            </Link>
            <Link className={buttonSecondary} href="/receive">
              Receive Assets
            </Link>
          </>
        }
      />
    </div>
  );
}

export function AreaChart({ timeframe }: { timeframe: "1D" | "1W" | "1M" | "1Y" | "ALL" }) {
  const paths: Record<string, { area: string; line: string }> = {
    "1D": {
      area: "M 0,40 L 40,48 L 80,35 L 120,42 L 160,25 L 200,30 L 240,15 L 280,18 L 300,8 L 300,80 L 0,80 Z",
      line: "M 0,40 L 40,48 L 80,35 L 120,42 L 160,25 L 200,30 L 240,15 L 280,18 L 300,8"
    },
    "1W": {
      area: "M 0,35 L 40,50 L 80,55 L 120,40 L 160,28 L 200,18 L 240,30 L 280,15 L 300,4 L 300,80 L 0,80 Z",
      line: "M 0,35 L 40,50 L 80,55 L 120,40 L 160,28 L 200,18 L 240,30 L 280,15 L 300,4"
    },
    "1M": {
      area: "M 0,65 L 30,55 L 70,62 L 110,38 L 150,45 L 190,18 L 230,28 L 270,12 L 300,4 L 300,80 L 0,80 Z",
      line: "M 0,65 L 30,55 L 70,62 L 110,38 L 150,45 L 190,18 L 230,28 L 270,12 L 300,4"
    },
    "1Y": {
      area: "M 0,72 L 40,65 L 80,58 L 120,62 L 160,40 L 200,45 L 240,22 L 280,12 L 300,2 L 300,80 L 0,80 Z",
      line: "M 0,72 L 40,65 L 80,58 L 120,62 L 160,40 L 200,45 L 240,22 L 280,12 L 300,2"
    },
    "ALL": {
      area: "M 0,75 L 40,70 L 80,60 L 120,48 L 160,52 L 200,35 L 240,28 L 280,15 L 300,5 L 300,80 L 0,80 Z",
      line: "M 0,75 L 40,70 L 80,60 L 120,48 L 160,52 L 200,35 L 240,28 L 280,15 L 300,5"
    }
  };

  const currentPath = paths[timeframe] || paths["1M"];

  return (
    <div className="relative w-full h-24 mt-4 overflow-hidden rounded-ui bg-black/20 border border-white/5 p-1">
      <svg viewBox="0 0 300 80" className="w-full h-full overflow-visible opacity-70 hover:opacity-90 transition-opacity duration-300" preserveAspectRatio="none">
        <defs>
          <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--cyan)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--cyan)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          d={currentPath.area}
          fill="url(#area-grad)"
          className="transition-all duration-500 ease-in-out"
        />
        <path
          d={currentPath.line}
          fill="none"
          stroke="var(--cyan)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-all duration-500 ease-in-out"
        />
      </svg>
    </div>
  );
}

export function HolographicWalletCard({ wallet, onCopyAddress }: { wallet: Wallet; onCopyAddress: (addr: string) => void }) {
  const [flipped, setFlipped] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (flipped) return;
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const px = (x / rect.width) - 0.5;
    const py = (y / rect.height) - 0.5;
    
    gsap.to(card, {
      rotateX: -py * 20,
      rotateY: px * 20,
      transformPerspective: 1000,
      ease: "power2.out",
      duration: 0.3
    });
  };

  const handleMouseLeave = () => {
    if (flipped) return;
    const card = cardRef.current;
    if (!card) return;
    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      ease: "power3.out",
      duration: 0.6
    });
  };

  const handleFlip = (e: React.MouseEvent) => {
    // Avoid flip on button click
    const target = e.target as HTMLElement;
    if (target.closest("button")) return;

    const card = cardRef.current;
    if (!card) return;
    const nextFlipped = !flipped;
    setFlipped(nextFlipped);
    
    gsap.to(card, {
      rotateY: nextFlipped ? 180 : 0,
      ease: "power2.inOut",
      duration: 0.6
    });
  };

  const primaryAddress = wallet.accounts[0]?.address ?? "";

  return (
    <div 
      className="perspective-1000 w-full max-w-[340px] sm:max-w-[360px] aspect-[1.75/1] cursor-pointer relative z-10 shrink-0 self-center"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={handleFlip}
    >
      <div 
        ref={cardRef}
        className="preserve-3d relative w-full h-full rounded-[16px] duration-300 shadow-glow"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Card Front */}
        <div 
          className="backface-hidden absolute inset-0 rounded-[16px] bg-gradient-to-br from-purple via-pink to-cyan p-[1.5px]"
        >
          <div className="w-full h-full rounded-[15px] bg-[#050814]/90 p-5 flex flex-col justify-between backdrop-blur-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple/10 via-cyan/5 to-transparent pointer-events-none" />
            
            <div className="flex justify-between items-start">
              <div>
                <span className="text-[9px] font-bold text-cyan/70 tracking-widest font-mono uppercase">Multi-Chain Pass</span>
                <h4 className="text-lg font-bold font-display text-white leading-none mt-1">{wallet.name}</h4>
              </div>
              <span className="h-8.5 w-8.5 rounded-ui border border-white/10 bg-white/5 flex items-center justify-center font-display text-white font-black text-xs">W</span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-mono">{shortAddress(primaryAddress)}</span>
                <button 
                  onClick={() => onCopyAddress(primaryAddress)}
                  className="p-1 hover:text-cyan text-slate-500 transition-colors"
                  title="Copy Primary Address"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex justify-between items-end mt-2">
                <div>
                  <span className="text-[9px] text-slate-500 uppercase font-mono">Net Portfolio</span>
                  <span className="text-xl font-bold text-white font-outfit block leading-none mt-1.5">
                    {money(portfolioValue(wallet))}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-mint/15 border border-mint/25 px-2.5 py-0.5 text-[9px] font-mono font-bold text-mint uppercase">
                  <span className="h-1.5 w-1.5 rounded-full bg-mint animate-ping" />
                  Active
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card Back */}
        <div 
          className="backface-hidden absolute inset-0 rounded-[16px] bg-gradient-to-br from-pink via-purple to-cyan p-[1.5px]"
          style={{ transform: "rotateY(180deg)" }}
        >
          <div className="w-full h-full rounded-[15px] bg-[#050814]/90 p-4 flex items-center justify-between backdrop-blur-xl relative overflow-hidden">
            <div className="flex flex-col justify-between h-full z-10 text-left">
              <div>
                <h4 className="text-xs font-bold font-display text-white">Deposit QR</h4>
                <p className="text-[9px] text-slate-400 mt-1 max-w-[120px] leading-relaxed">
                  Scan to deposit EVM tokens to this wallet.
                </p>
              </div>
              <div className="text-[8px] text-slate-500 font-mono">
                Click card to flip back
              </div>
            </div>
            <div className="scale-75 origin-right shrink-0">
              <QrCode value={primaryAddress} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickActionPortal({ href, icon: Icon, label, theme }: { href: string; icon: any; label: string; theme: "purple" | "cyan" | "amber" }) {
  const colors = {
    purple: {
      border: "hover:border-purple/35 hover:bg-purple/[0.04]",
      badgeBg: "bg-purple/10 text-purple border-purple/20",
      shadow: "group-hover:shadow-[0_0_15px_rgba(168,85,247,0.4)]"
    },
    cyan: {
      border: "hover:border-cyan/35 hover:bg-cyan/[0.04]",
      badgeBg: "bg-cyan/10 text-cyan border-cyan/20",
      shadow: "group-hover:shadow-[0_0_15px_rgba(6,182,212,0.4)]"
    },
    amber: {
      border: "hover:border-amber/35 hover:bg-amber/[0.04]",
      badgeBg: "bg-amber/10 text-amber border-amber/20",
      shadow: "group-hover:shadow-[0_0_15px_rgba(245,158,11,0.4)]"
    }
  }[theme];

  return (
    <Link 
      className={`group flex min-h-24 flex-col items-center justify-center gap-2 rounded-ui border border-white/5 bg-white/[0.015] p-4 text-center transition-all ${colors.border} hover:scale-[1.03] active:scale-[0.97] duration-300 sm:gap-3 sm:p-5`}
      href={href}
    >
      <span className={`grid h-11 w-11 place-items-center rounded-xl ${colors.badgeBg} border ${colors.shadow} transition-all duration-300`}>
        <Icon className="h-5 w-5" />
      </span>
      <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors font-outfit">{label}</span>
    </Link>
  );
}

export function DashboardScreen({
  activeWallet,
  onCreateWallet,
  onCopyAddress,
  onOpenTransaction
}: {
  activeWallet: Wallet | null;
  onCreateWallet: () => void;
  onCopyAddress: (address: string) => void;
  onOpenTransaction: (transactionId: string) => void;
}) {
  const [timeframe, setTimeframe] = useState<"1D" | "1W" | "1M" | "1Y" | "ALL">("1M");

  if (!activeWallet) return <WalletSetupScreen onCreateWallet={onCreateWallet} />;
  const total = portfolioValue(activeWallet);
  const txs = activeWallet.transactions.slice(0, 4);

  return (
    <section className="mx-auto grid w-full max-w-[1440px] gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
      {/* Bento Item 1: Portfolio Balance & Holographic Card (Spans 2 columns) */}
      <div className="md:col-span-2">
        <article className="glass-panel relative flex h-full min-w-0 flex-col justify-between gap-5 overflow-hidden rounded-ui p-4 shadow-glow sm:gap-6 sm:p-6">
          <div className="absolute inset-0 bg-gradient-to-r from-purple/5 via-pink/5 to-transparent pointer-events-none -z-10" />
          <div className="flex flex-col sm:flex-row justify-between items-start gap-6 w-full">
            <div className="min-w-0 text-left">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Decrypted Net Worth</span>
              <div className="flex flex-wrap items-baseline gap-3 mt-1.5">
                <strong className="break-words text-3xl font-bold tracking-tight text-white font-outfit xs:text-4xl sm:text-5xl">
                  {money(total)}
                </strong>
                <span className="inline-flex items-center gap-1 rounded-full bg-mint/15 border border-mint/25 px-2.5 py-0.5 text-xs font-mono font-bold text-mint">
                  +4.89%
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-400 font-mono">
                Aggregated holdings across {activeWallet.assets.length} supported chains.
              </p>
            </div>
            <div className="w-full sm:w-auto flex justify-center">
              <HolographicWalletCard wallet={activeWallet} onCopyAddress={onCopyAddress} />
            </div>
          </div>

          <div className="w-full text-left">
            <div className="mt-2 flex flex-col gap-3 border-t border-white/5 pt-4 xs:flex-row xs:items-center xs:justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">Performance history</span>
              <div className="grid grid-cols-5 gap-1 rounded-ui border border-white/5 bg-white/[0.03] p-0.5 xs:flex">
                {(["1D", "1W", "1M", "1Y", "ALL"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTimeframe(t)}
                    className={`px-2.5 py-1 text-[10px] font-bold font-mono rounded-[8px] transition-all duration-200 ${
                      timeframe === t
                        ? "bg-purple text-white shadow-glow"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <AreaChart timeframe={timeframe} />
          </div>
        </article>
      </div>

      {/* Bento Item 2: Quick Action Portals (Spans 1 column) */}
      <div className="glass-panel flex h-full min-w-0 flex-col justify-between rounded-ui p-4 sm:p-6">
        <div className="mb-4 text-left">
          <h2 className="text-lg font-bold font-display text-white">Quick Portal</h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">Route instantly between transactions</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <QuickActionPortal href="/send" icon={Send} label="Send" theme="purple" />
          <QuickActionPortal href="/receive" icon={Download} label="Receive" theme="cyan" />
          <QuickActionPortal href="/settings" icon={ShieldCheck} label="Security" theme="purple" />
          <QuickActionPortal href="/history" icon={History} label="History" theme="amber" />
        </div>
      </div>

      {/* Bento Item 3: Supported Assets (Spans 2 columns) */}
      <div className="md:col-span-2">
        <Panel animate className="h-full flex flex-col justify-between">
          <SectionHead title="Supported Assets" href="/assets" />
          <AssetList holdings={activeWallet.assets.slice(0, 5)} />
        </Panel>
      </div>

      {/* Bento Item 4: Wallet Accounts (Spans 1 column) */}
      <div>
        <Panel animate className="h-full flex flex-col justify-between">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-left">
            <h2 className="text-lg font-bold font-display text-white">Wallet Accounts</h2>
            <Badge status="success">active</Badge>
          </div>
          <AccountList wallet={activeWallet} onCopyAddress={onCopyAddress} />
        </Panel>
      </div>

      {/* Bento Item 5: Recent Transactions (Spans 3 columns) */}
      <div className="md:col-span-2 lg:col-span-3">
        <Panel animate>
          <SectionHead title="Recent Transaction Log" href="/history" />
          <TxList transactions={txs} onOpenTransaction={onOpenTransaction} />
        </Panel>
      </div>
    </section>
  );
}

export function AssetsPageScreen({
  activeWallet,
  assetSearch,
  onAssetSearch
}: {
  activeWallet: Wallet | null;
  assetSearch: string;
  onAssetSearch: (value: string) => void;
}) {
  if (!activeWallet) return null;
  const search = assetSearch.toLowerCase().trim();
  const holdings = activeWallet.assets.filter((holding) => {
    const asset = assetById(holding.assetId);
    return !search || asset.name.toLowerCase().includes(search) || asset.symbol.toLowerCase().includes(search);
  });
  return (
    <section className="grid gap-6 text-left max-w-4xl mx-auto w-full py-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between" data-animate>
        <div>
          <h2 className="text-3xl font-bold font-display text-white">Assets</h2>
          <p className="mt-1.5 text-xs text-slate-400 font-mono">Search, audit, and bookmark wallet holdings.</p>
        </div>
        <label className="relative block w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            className="focus-ring min-h-[44px] w-full rounded-ui border border-white/10 bg-black/40 py-2 pl-9 pr-4 text-sm text-white focus:border-cyan/50 focus:bg-black/60 focus:shadow-cyanGlow transition-all duration-300"
            placeholder="Search assets..."
            value={assetSearch}
            onChange={(event) => onAssetSearch(event.target.value)}
          />
        </label>
      </div>
      {holdings.length ? <AssetList holdings={holdings} /> : <EmptyState title="No assets found" text="Try a different symbol or asset name." icon={Search} />}
    </section>
  );
}

export function AssetDetailScreen({
  activeWallet,
  assetId,
  onOpenTransaction,
  onToggleFavorite
}: {
  activeWallet: Wallet | null;
  assetId?: string;
  onOpenTransaction: (transactionId: string) => void;
  onToggleFavorite: (assetId: string) => void;
}) {
  if (!activeWallet || !assetId) return null;
  const holding = activeWallet.assets.find((item) => item.assetId === assetId);
  if (!holding) {
    return (
      <EmptyState
        title="Asset not found"
        text="Open the assets page to choose a supported asset."
        icon={AlertTriangle}
        actions={
          <Link className={buttonPrimary} href="/assets">
            Back to assets
          </Link>
        }
      />
    );
  }
  const asset = assetById(assetId);
  const txs = activeWallet.transactions.filter((tx) => tx.assetId === assetId);
  return (
    <section className="grid gap-6 text-left max-w-4xl mx-auto w-full py-4">
      <Panel animate className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan/5 to-transparent pointer-events-none -z-10" />
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <AssetIcon assetId={asset.id} size="lg" />
            <div className="min-w-0">
              <h2 className="truncate text-2xl font-bold font-display text-white">{asset.name}</h2>
              <p className="text-xs text-slate-400 mt-1 font-mono">{asset.symbol} on {asset.chain}</p>
            </div>
          </div>
          <div className="text-left md:text-right">
            <strong className="block text-3xl font-extrabold text-white font-display">
              {formatAmount(holding.balance)} {asset.symbol}
            </strong>
            <span className="text-xs text-slate-400 font-mono mt-1 block">{money(holding.balance * asset.price)}</span>
          </div>
        </div>
        <div className="h-px bg-white/5 my-5" />
        <div className="flex flex-wrap gap-2">
          <Link className={buttonPrimary} href={`/send?asset=${asset.id}`}>
            <Send className="h-4 w-4" />
            Send
          </Link>
          <Link className={buttonSecondary} href={`/receive?asset=${asset.id}`}>
            <Download className="h-4 w-4" />
            Receive
          </Link>
          <button className={buttonSecondary} onClick={() => onToggleFavorite(asset.id)}>
            <Star className={`h-4 w-4 ${holding.favorite ? "fill-amber text-amber" : ""}`} />
            {holding.favorite ? "Remove Favorite" : "Favorite"}
          </button>
        </div>
      </Panel>
      
      <Panel animate>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold font-display text-white">Recent Transactions</h2>
          <Badge>{txs.length} total</Badge>
        </div>
        <TxList transactions={txs} onOpenTransaction={onOpenTransaction} />
      </Panel>
    </section>
  );
}

export type RecipientContact = {
  name: string;
  address: string;
  chain?: string;
};

export function SendScreen({
  activeWallet,
  assetId,
  formError,
  onAssetChange,
  onSend,
  recentContacts,
  userWallets
}: {
  activeWallet: Wallet | null;
  assetId: string;
  formError: string;
  onAssetChange: (assetId: string) => void;
  onSend: (event: FormEvent<HTMLFormElement>) => void;
  recentContacts: RecipientContact[];
  userWallets: Wallet[];
}) {
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");

  if (!activeWallet) return null;
  const activeAsset = assetById(assetId || activeWallet.assets[0]?.assetId || "eth");
  const holding = activeWallet.assets.find((item) => item.assetId === activeAsset.id);
  const compatibleContacts = recentContacts.filter((contact) => !contact.chain || contact.chain === activeAsset.chain);
  const internalRecipients = userWallets
    .filter((wallet) => wallet.id !== activeWallet.id)
    .map((wallet) => {
      const account = wallet.accounts.find((item) => item.chain === activeAsset.chain) ?? wallet.accounts[0];
      return account ? { wallet, account } : null;
    })
    .filter(Boolean) as Array<{ wallet: Wallet; account: Wallet["accounts"][number] }>;

  return (
    <div className="grid gap-6 lg:grid-cols-3 max-w-5xl mx-auto w-full py-4 text-left">
      <form className="lg:col-span-2 grid gap-6" onSubmit={onSend}>
        <Panel animate className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple/5 to-transparent pointer-events-none -z-10" />
          <h2 className="text-xl font-bold font-display text-white mb-4">Send Asset</h2>
          <div className="grid gap-4">
            <AssetSelect
              wallet={activeWallet}
              name="assetId"
              selected={activeAsset.id}
              onAssetChange={onAssetChange}
            />

            {/* Recipient Address */}
            <div className="relative grid gap-1.5 w-full">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 pl-1 font-mono">Recipient Address</span>
              <input
                className="focus-ring min-h-[46px] w-full rounded-ui border border-white/10 bg-black/40 px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-cyan/50 focus:bg-[#080d1a] focus:shadow-cyanGlow transition-all duration-300 font-mono"
                name="recipient"
                placeholder="0x... or bc1q..."
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                required
              />
              {internalRecipients.length > 0 && (
                <div className="mt-2 grid gap-2 rounded-ui border border-white/5 bg-black/30 p-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">Send to your wallets</span>
                  <div className="flex flex-wrap gap-2">
                    {internalRecipients.map(({ wallet, account }) => (
                      <button
                        key={`${wallet.id}-${account.id}`}
                        type="button"
                        className="rounded-ui border border-white/5 bg-white/[0.03] px-3 py-2 text-left text-xs font-semibold text-slate-300 transition hover:border-cyan/30 hover:text-white"
                        onClick={() => setRecipient(account.address)}
                      >
                        {wallet.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Amount */}
            <div className="relative grid gap-1.5 w-full">
              <div className="flex flex-col gap-1 pl-1 xs:flex-row xs:items-baseline xs:justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">Amount</span>
                <span className="text-[11px] text-slate-500 font-mono">
                  Available: {holding ? formatAmount(holding.balance) : "0"} {activeAsset.symbol}
                </span>
              </div>
              <div className="relative flex items-center">
                <input
                  className="focus-ring min-h-[46px] w-full rounded-ui border border-white/10 bg-black/40 pl-4 pr-16 py-2.5 text-sm text-white placeholder:text-slate-600 focus:border-cyan/50 focus:bg-[#080d1a] focus:shadow-cyanGlow transition-all duration-300 font-outfit"
                  name="amount"
                  type="number"
                  step="any"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
                <span className="absolute right-4 text-xs font-bold text-slate-400 font-mono uppercase">
                  {activeAsset.symbol}
                </span>
              </div>
              {/* Quick Percentage Buttons */}
              <div className="flex gap-1.5 mt-1">
                {([25, 50, 75, 100] as const).map((pct) => (
                  <button
                    key={pct}
                    type="button"
                    onClick={() => {
                      if (!holding) return;
                      const computed = holding.balance * (pct / 100);
                      setAmount(String(Math.round(computed * 1000000) / 1000000));
                    }}
                    className="flex-1 py-1 text-[10px] font-bold font-mono rounded bg-white/[0.03] border border-white/5 text-slate-400 hover:text-white hover:border-cyan/30 hover:bg-cyan/5 transition-all"
                  >
                    {pct === 100 ? "MAX" : `${pct}%`}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-2 rounded-ui border border-white/5 bg-black/40 p-4 text-xs font-mono">
              <div className="flex flex-col gap-1 xs:flex-row xs:justify-between xs:gap-3">
                <span className="text-slate-400">Available Balance</span>
                <strong className="break-words text-white xs:text-right">{holding ? `${formatAmount(holding.balance)} ${activeAsset.symbol}` : "0"}</strong>
              </div>
              <div className="h-px bg-white/5 my-1" />
              <div className="flex flex-col gap-1 xs:flex-row xs:justify-between xs:gap-3">
                <span className="text-slate-400">Estimated Gas Fee</span>
                <strong className="text-white xs:text-right">{estimateFee(activeAsset.id)}</strong>
              </div>
            </div>
            <FormError message={formError} />
          </div>
        </Panel>
        <div className="flex flex-wrap gap-2" data-animate>
          <button className={buttonPrimary} type="submit">
            <ScanLine className="h-4 w-4" />
            Review Transaction
          </button>
          <Link className={buttonSecondary} href="/dashboard">
            Cancel
          </Link>
        </div>
      </form>

      {/* Recent Recipients Sidebar */}
      <div className="glass-panel rounded-ui p-5 flex flex-col h-fit" data-animate>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono mb-4">Recent Contacts</h3>
        {compatibleContacts.length ? (
          <div className="grid gap-3">
            {compatibleContacts.map((contact) => (
              <button
                key={contact.address}
                type="button"
                onClick={() => setRecipient(contact.address)}
                className="group flex flex-col items-start gap-1 rounded-ui border border-white/5 bg-white/[0.015] p-3 hover:border-cyan/30 hover:bg-cyan/5 transition-all w-full text-left"
              >
                <span className="text-xs font-bold text-white group-hover:text-cyan transition-colors">{contact.name}</span>
                <span className="text-[10px] text-slate-500 font-mono truncate w-full">{contact.address}</span>
              </button>
            ))}
          </div>
        ) : (
          <p className="rounded-ui border border-white/5 bg-white/[0.015] p-3 text-xs leading-relaxed text-slate-500">
            Contacts appear after you create another wallet or send to an address.
          </p>
        )}
      </div>
    </div>
  );
}

export function ReviewScreen({
  pendingTransfer,
  transferError,
  onReview
}: {
  pendingTransfer: PendingTransfer | null;
  transferError: string;
  onReview: (event: FormEvent<HTMLFormElement>) => void;
}) {
  if (!pendingTransfer) {
    return (
      <EmptyState
        title="No transfer to review"
        text="Start the send flow to prepare a transaction."
        icon={Send}
        actions={
          <Link className={buttonPrimary} href="/send">
            Start send flow
          </Link>
        }
      />
    );
  }
  const asset = assetById(pendingTransfer.assetId);
  return (
    <form className="grid gap-6 text-left max-w-2xl mx-auto w-full py-4" onSubmit={onReview}>
      <Panel animate className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple/5 to-transparent pointer-events-none -z-10" />
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold font-display text-white font-display">Review Transaction</h2>
          <Badge status="pending">unsigned</Badge>
        </div>
        <DetailGrid
          rows={[
            ["Asset", `${asset.name} (${asset.symbol})`],
            ["Recipient", pendingTransfer.recipient],
            ["Amount", `${pendingTransfer.amount} ${asset.symbol}`],
            ["Estimated Fee", pendingTransfer.fee],
            ["Network", asset.chain]
          ]}
        />
      </Panel>
      <Panel animate>
        <h2 className="text-lg font-bold font-display text-white mb-2">Signature Confirmation</h2>
        <p className="text-xs text-slate-400 mb-4 font-mono">Confirm local decryption credentials to sign.</p>
        <div className="grid gap-3">
          <Field label="Decryption Password" name="password" type="password" placeholder="Confirm password" required />
          <FormError message={transferError} />
        </div>
      </Panel>
      <div className="flex flex-wrap gap-2" data-animate>
        <button className={buttonPrimary} type="submit">
          <CheckCircle2 className="h-4 w-4" />
          Submit Signature
        </button>
        <Link className={buttonSecondary} href="/send">
          Edit
        </Link>
      </div>
    </form>
  );
}

export function TransferResultScreen({ lastTransfer }: { lastTransfer: TransferResult | null }) {
  if (!lastTransfer) {
    return (
      <EmptyState
        title="No transfer result"
        text="Completed transfers will land here."
        icon={Clock3}
        actions={
          <Link className={buttonPrimary} href="/send">
            Send asset
          </Link>
        }
      />
    );
  }
  return (
    <div className="max-w-2xl mx-auto w-full py-12 text-left">
      <EmptyState
        title={lastTransfer.status === "success" ? "Transfer Decrypted & Submitted" : "Transaction Failed"}
        text={`Decryption hash: ${shortAddress(lastTransfer.hash)}`}
        icon={lastTransfer.status === "success" ? CheckCircle2 : AlertTriangle}
        badge={<Badge status={lastTransfer.status}>{lastTransfer.status}</Badge>}
        actions={
          <>
            <Link className={buttonPrimary} href="/history">
              View History
            </Link>
            <Link className={buttonSecondary} href="/dashboard">
              Dashboard
            </Link>
          </>
        }
      />
    </div>
  );
}

export function ReceiveScreen({
  activeWallet,
  assetId,
  onAssetChange,
  onCopyText,
  onReceive,
  onShareText
}: {
  activeWallet: Wallet | null;
  assetId: string;
  onAssetChange: (assetId: string) => void;
  onCopyText: (value: string) => void;
  onReceive: (assetId: string, amount: number) => void;
  onShareText: (value: string) => void;
}) {
  const [amount, setAmount] = useState("1");

  if (!activeWallet) return null;
  const asset = assetById(assetId || activeWallet.assets[0]?.assetId || "eth");
  const account = activeWallet.accounts.find((item) => item.chain === asset.chain) ?? activeWallet.accounts[0];
  return (
    <section className="mx-auto grid w-full max-w-4xl gap-4 py-4 text-left sm:gap-6 lg:grid-cols-2">
      <Panel animate className="relative flex flex-col justify-between overflow-hidden p-5 sm:p-6">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan/5 to-transparent pointer-events-none -z-10" />
        <div>
          <h2 className="text-xl font-bold font-display text-white mb-4">Receive Assets</h2>
          <div className="grid gap-4">
            <AssetSelect
              wallet={activeWallet}
              name="assetId"
              selected={asset.id}
              onAssetChange={onAssetChange}
            />
            <div className="relative grid gap-1.5 text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 pl-1 font-mono">Your Deposit Address</span>
              <div className="flex min-w-0 flex-col gap-2 rounded-ui border border-white/10 bg-black/40 px-3.5 py-2.5 xs:flex-row xs:items-center">
                <code className="min-w-0 flex-1 truncate text-xs text-slate-300 font-mono">{account.address}</code>
                <button className={`${buttonSecondary} !min-h-0 h-9 w-full px-3 xs:w-auto`} onClick={() => onCopyText(account.address)} type="button">
                  <Copy className="h-3.5 w-3.5" />
                  Copy
                </button>
              </div>
            </div>

            <div className="grid gap-2 rounded-ui border border-white/5 bg-black/30 p-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">MVP Receive Amount</span>
              <p className="text-[11px] text-slate-500 leading-normal">
                Add a test deposit to this wallet so the MVP history and balances can be verified.
              </p>
              <div className="grid gap-2 xs:grid-cols-[minmax(0,1fr)_auto]">
                <div className="relative flex-1">
                  <input
                    type="number"
                    step="any"
                    min="0"
                    className="focus-ring min-h-[42px] w-full rounded-ui border border-white/10 bg-black/40 px-3.5 text-xs text-white"
                    placeholder="Amount"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400 uppercase font-mono">
                    {asset.symbol}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const parsed = Number(amount);
                    if (!Number.isFinite(parsed) || parsed <= 0) return;
                    onReceive(asset.id, parsed);
                  }}
                  className={`${buttonPrimary} !min-h-[42px] px-4 py-2 text-xs`}
                >
                  <Download className="h-3.5 w-3.5" />
                  Add
                </button>
              </div>
            </div>

          </div>
        </div>
        <div className="mt-8 flex flex-col gap-2">
          <button className={buttonSecondary} onClick={() => onShareText(account.address)} type="button">
            <Share2 className="h-4 w-4" />
            Share Address
          </button>
        </div>
      </Panel>
      
      <Panel animate className="flex min-h-[300px] flex-col items-center justify-center p-5 sm:p-8">
        <div className="mb-6 flex items-center justify-between gap-3 w-full border-b border-white/5 pb-4">
          <h2 className="text-lg font-bold font-display text-white">QR Code</h2>
          <Badge>{asset.chain}</Badge>
        </div>
        <div className="flex max-w-full items-center justify-center rounded-[16px] bg-white p-2 shadow-glow sm:p-3.5">
          <QrCode value={account.address} />
        </div>
        <p className="mt-4 text-[11px] text-slate-500 font-mono text-center max-w-[200px]">
          Scan this QR to send {asset.symbol} tokens to this wallet.
        </p>
      </Panel>
    </section>
  );
}

export function HistoryScreen({
  activeWallet,
  historyFilters,
  onHistoryFiltersChange,
  onOpenTransaction
}: {
  activeWallet: Wallet | null;
  historyFilters: HistoryFilters;
  onHistoryFiltersChange: (filters: HistoryFilters) => void;
  onOpenTransaction: (transactionId: string) => void;
}) {
  if (!activeWallet) return null;
  const txs = activeWallet.transactions.filter((tx) => {
    return (
      (historyFilters.asset === "all" || tx.assetId === historyFilters.asset) &&
      (historyFilters.type === "all" || tx.type === historyFilters.type) &&
      (historyFilters.status === "all" || tx.status === historyFilters.status)
    );
  });
  return (
    <section className="grid gap-6 text-left max-w-4xl mx-auto w-full py-4">
      <div data-animate>
        <h2 className="text-3xl font-bold font-display text-white">Transfer History</h2>
        <p className="mt-1.5 text-xs text-slate-400 font-mono">Audit incoming and outgoing wallet transfers.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-3" data-animate>
        <FilterSelect
          label="Asset"
          value={historyFilters.asset}
          options={[["all", "All assets"], ...ASSETS.map((asset) => [asset.id, asset.symbol] as [string, string])]}
          onChange={(value) => onHistoryFiltersChange({ ...historyFilters, asset: value })}
        />
        <FilterSelect
          label="Type"
          value={historyFilters.type}
          options={[
            ["all", "All types"],
            ["incoming", "Incoming"],
            ["outgoing", "Outgoing"]
          ]}
          onChange={(value) => onHistoryFiltersChange({ ...historyFilters, type: value })}
        />
        <FilterSelect
          label="Status"
          value={historyFilters.status}
          options={[
            ["all", "All statuses"],
            ["success", "Success"],
            ["pending", "Pending"],
            ["failed", "Failed"]
          ]}
          onChange={(value) => onHistoryFiltersChange({ ...historyFilters, status: value })}
        />
      </div>
      {txs.length ? (
        <TxList transactions={txs} onOpenTransaction={onOpenTransaction} />
      ) : (
        <EmptyState title="No transactions" text="Transfers matching these filters will appear here." icon={History} />
      )}
    </section>
  );
}

export function SettingsScreen({
  activeWallet,
  formError,
  revealPhrase,
  walletLocked,
  onLogoutAll,
  onPasswordChange,
  onRevealPhrase,
  onToggleLock
}: {
  activeWallet: Wallet | null;
  formError: string;
  revealPhrase: boolean;
  walletLocked: boolean;
  onLogoutAll: () => void;
  onPasswordChange: (event: FormEvent<HTMLFormElement>) => void;
  onRevealPhrase: (event: FormEvent<HTMLFormElement>) => void;
  onToggleLock: () => void;
}) {
  return (
    <section className="mx-auto grid w-full max-w-4xl gap-4 py-4 text-left sm:gap-6 xl:grid-cols-2">
      <Panel animate>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold font-display text-white">Security Settings</h2>
          <Badge status={walletLocked ? "failed" : "success"}>{walletLocked ? "locked" : "unlocked"}</Badge>
        </div>
        <div className="grid gap-2">
          <SettingsRow title="Profile Settings" subtitle="Name, email, and local profile data." href="/profile" icon={User} />
          <SettingsRow title="Security Activity Log" subtitle="Audit log dashboard for events." href="/security" icon={ShieldCheck} />
          <SettingsRow title="Reveal Seed Phrase" subtitle="Requires password confirmation below." href="/settings" icon={Eye} />
        </div>
      </Panel>
      
      <Panel animate>
        <h2 className="text-xl font-bold font-display text-white">Reveal Mnemonic</h2>
        <p className="mt-1 text-xs text-slate-400 font-mono">Requires verification password to inspect keys.</p>
        <form className="mt-4 grid gap-3" onSubmit={onRevealPhrase}>
          <Field label="Password" name="password" type="password" placeholder="Confirm password" required />
          <FormError message={formError} />
          <button className={`${buttonSecondary} mt-2`} type="submit">
            <Eye className="h-4 w-4" />
            Reveal phrase
          </button>
        </form>
        {revealPhrase && activeWallet && <div className="mt-5"><WordGrid words={activeWallet.phrase} /></div>}
      </Panel>
      
      <Panel animate>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold font-display text-white">Decrypted Sessions</h2>
          <Badge status="pending">Local only</Badge>
        </div>
        <div className="grid gap-2">
          <StaticRow icon={Smartphone} title="Current browser" subtitle="Supabase authenticated session" badge={<Badge status="success">active</Badge>} />
          <StaticRow icon={Fingerprint} title="WebAuthn hardware key" subtitle="Hardware authentication simulation" badge={<Badge status="pending">planned</Badge>} />
        </div>
        <div className="mt-6 flex flex-wrap gap-2">
          <button className={buttonSecondary} onClick={onToggleLock}>
            {walletLocked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
            Toggle Lock
          </button>
          <button className={buttonDanger} onClick={onLogoutAll}>
            <LogOut className="h-4 w-4" />
            Destroy Sessions
          </button>
        </div>
      </Panel>
      
      <Panel animate>
        <h2 className="text-xl font-bold font-display text-white">Update Password</h2>
        <form className="mt-4 grid gap-3" onSubmit={onPasswordChange}>
          <Field label="Current Password" name="currentPassword" type="password" placeholder="Current password" required />
          <Field label="New Password" name="password" type="password" placeholder="At least 8 characters" required />
          <Field label="Confirm New Password" name="confirmPassword" type="password" placeholder="Repeat password" required />
          <FormError message={formError} />
          <button className={`${buttonPrimary} mt-2`} type="submit">
            <KeyRound className="h-4 w-4" />
            Update Password
          </button>
        </form>
      </Panel>
    </section>
  );
}

export function SecurityScreen({
  currentUserId,
  events
}: {
  currentUserId?: string;
  events: SecurityEvent[];
}) {
  const userEvents = currentUserId ? events.filter((event) => event.userId === currentUserId).slice().reverse() : [];
  return (
    <section className="grid gap-6 text-left max-w-4xl mx-auto w-full py-4">
      <div data-animate>
        <h2 className="text-3xl font-bold font-display text-white">Security Activity Log</h2>
        <p className="mt-1.5 text-xs text-slate-400 font-mono">Cryptographic audit log for active account changes.</p>
      </div>
      <Panel animate>
        {userEvents.length ? (
          <div className="grid gap-2">
            {userEvents.map((event) => (
              <StaticRow
                key={event.id}
                icon={ShieldCheck}
                title={event.type}
                subtitle={event.detail}
                badge={<span className="text-right text-xs font-mono text-slate-500">{formatDate(event.createdAt)}</span>}
              />
            ))}
          </div>
        ) : (
          <EmptyState title="No events yet" text="Logins, wallet creation, and phrase reveal events appear here." icon={ShieldCheck} />
        )}
      </Panel>
    </section>
  );
}

export function ProfileScreen({
  currentUser,
  formError,
  onProfile
}: {
  currentUser: WalletUser | null;
  formError: string;
  onProfile: (event: FormEvent<HTMLFormElement>) => void;
}) {
  if (!currentUser) return null;
  return (
    <form className="grid gap-6 text-left max-w-2xl mx-auto w-full py-4" onSubmit={onProfile}>
      <Panel animate>
        <h2 className="text-xl font-bold font-display text-white mb-4 font-display">Profile Details</h2>
        <div className="grid gap-3">
          <Field label="Name" name="name" placeholder="Ada Lovelace" defaultValue={currentUser.name} required />
          <Field label="Email" name="email" type="email" placeholder="you@domain.com" defaultValue={currentUser.email} readOnly />
          <Field label="Account state" name="verified" defaultValue="Supabase authenticated" readOnly />
          <FormError message={formError} />
        </div>
      </Panel>
      <div className="flex flex-wrap gap-2" data-animate>
        <button className={buttonPrimary} type="submit">
          <BadgeCheck className="h-4 w-4" />
          Save Changes
        </button>
        <Link className={buttonSecondary} href="/settings">
          Back
        </Link>
      </div>
    </form>
  );
}
