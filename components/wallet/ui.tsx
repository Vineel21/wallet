import {
  AlertTriangle,
  ChevronRight,
  LucideIcon,
  X
} from "lucide-react";
import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { assetById, formatDate, qrCells } from "@/lib/mock-data";
import type { WalletTransaction } from "@/lib/types";
import { buttonGhost, buttonPrimary } from "@/components/wallet/constants";

export function CustomCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [clicked, setClicked] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    const handleMouseDown = () => setClicked(true);
    const handleMouseUp = () => setClicked(false);

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;
      if (
        target.tagName === "BUTTON" ||
        target.tagName === "A" ||
        target.closest("button") ||
        target.closest("a") ||
        target.closest("select") ||
        target.closest("input")
      ) {
        setHovered(true);
      } else {
        setHovered(false);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mouseover", handleMouseOver);
    };
  }, []);

  return (
    <>
      <div
        className="custom-cursor"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: `translate(-50%, -50%) scale(${clicked ? 0.85 : hovered ? 1.4 : 1})`,
          borderColor: clicked ? "var(--pink)" : hovered ? "var(--cyan)" : "var(--purple)",
          backgroundColor: clicked ? "rgba(236, 72, 153, 0.15)" : hovered ? "rgba(6, 182, 212, 0.08)" : "transparent"
        }}
      />
      <div
        className="custom-cursor-dot"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`
        }}
      />
    </>
  );
}

export function LoadingScreen() {
  return (
    <main className="grid min-h-screen place-items-center bg-ink text-white">
      <div className="glass-panel grid w-[min(400px,calc(100vw-32px))] justify-items-center gap-6 rounded-ui p-8 shadow-glow">
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-4 border-purple/20" />
          <div className="absolute inset-0 rounded-full border-4 border-purple border-t-transparent animate-spin" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-bold font-display text-white">Decrypting Workspace</h3>
          <p className="mt-1.5 text-xs text-slate-400 font-mono">Initializing mock cryptography...</p>
        </div>
      </div>
    </main>
  );
}

export function AuthCard({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <article className="glass-panel animate-float grid w-full gap-5 rounded-ui p-6 sm:p-8 shadow-glow">
      <div>
        <h2 className="text-3xl font-bold font-display tracking-tight text-white">{title}</h2>
        <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
      </div>
      <div className="h-px bg-gradient-to-r from-transparent via-line to-transparent" />
      {children}
    </article>
  );
}

export function Brand({ title = "Wallax", subtitle }: { title?: string; subtitle: string }) {
  return (
    <Link className="flex w-fit items-center gap-3 group text-left" href="/">
      <span className="grid h-11 w-11 place-items-center rounded-ui border border-purple/40 bg-purple/10 text-xl font-bold font-display text-white shadow-glow group-hover:border-pink group-hover:text-pink transition-all duration-300">
        W
      </span>
      <span className="grid gap-0.5 text-left">
        <strong className="leading-none text-white tracking-wider font-display text-lg">{title}</strong>
        <span className="text-xs font-semibold text-slate-500 font-mono uppercase tracking-wider">{subtitle}</span>
      </span>
    </Link>
  );
}

export function Field({
  label,
  name,
  type = "text",
  placeholder,
  defaultValue,
  required,
  readOnly,
  icon: Icon
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  defaultValue?: string;
  required?: boolean;
  readOnly?: boolean;
  icon?: any;
}) {
  return (
    <div className="relative grid gap-1.5 font-outfit w-full">
      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 pl-1 font-mono">{label}</span>
      <div className="relative flex items-center">
        {Icon && (
          <span className="absolute left-3.5 text-slate-400 pointer-events-none flex items-center justify-center">
            <Icon className="h-4 w-4" />
          </span>
        )}
        <input
          className={`focus-ring min-h-[46px] w-full rounded-ui border border-white/10 bg-black/40 py-2.5 text-sm text-white placeholder:text-slate-600 read-only:text-slate-500 focus:border-cyan/50 focus:bg-[#080d1a] focus:shadow-cyanGlow transition-all duration-300 font-outfit ${
            Icon ? "pl-10 pr-4" : "px-4"
          }`}
          defaultValue={defaultValue}
          name={name}
          placeholder={placeholder}
          readOnly={readOnly}
          required={required}
          type={type}
        />
      </div>
    </div>
  );
}

export function FormError({ message }: { message: string }) {
  return <p className="min-h-5 text-sm font-semibold text-rose pl-1 font-mono">{message}</p>;
}

export function Panel({
  children,
  className = "",
  animate
}: {
  children: ReactNode;
  className?: string;
  animate?: boolean;
}) {
  return (
    <article className={`glass-panel rounded-ui p-5 sm:p-6 ${className}`} data-animate={animate ? true : undefined}>
      {children}
    </article>
  );
}

export function NavLink({
  path,
  label,
  icon: Icon,
  active
}: {
  path: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
}) {
  return (
    <Link
      className={`focus-ring flex min-h-11 items-center gap-3 rounded-ui border px-3.5 py-2 text-sm font-bold transition-all duration-200 ${
        active
          ? "border-purple/20 bg-purple/10 text-white shadow-glow"
          : "border-transparent text-slate-400 hover:border-white/5 hover:bg-white/[0.03] hover:text-white"
      }`}
      href={path}
    >
      <Icon className={`h-5 w-5 shrink-0 transition-colors duration-200 ${active ? "text-cyan" : "text-slate-500 group-hover:text-slate-300"}`} />
      <span>{label}</span>
    </Link>
  );
}

export function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="thin-panel rounded-ui p-4" data-float-in>
      <strong className="block text-lg font-black text-white">{value}</strong>
      <span className="text-sm text-slate-400">{label}</span>
    </div>
  );
}

export function QuickAction({ href, icon: Icon, label }: { href: string; icon: LucideIcon; label: string }) {
  return (
    <Link className="scanline thin-panel grid min-h-24 justify-items-center gap-2 rounded-ui p-3 text-sm font-bold text-white transition hover:border-mint/30" href={href}>
      <Icon className="h-6 w-6 text-mint" />
      {label}
    </Link>
  );
}

export function SectionHead({ title, href }: { title: string; href: string }) {
  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="text-lg font-black">{title}</h2>
      <Link className={buttonGhost} href={href}>
        View all
      </Link>
    </div>
  );
}

export function AssetIcon({ assetId, size = "md" }: { assetId: string; size?: "md" | "lg" }) {
  const asset = assetById(assetId);
  return (
    <span
      className={`grid shrink-0 place-items-center rounded-ui font-black text-white ${size === "lg" ? "h-14 w-14 text-lg" : "h-10 w-10 text-sm"}`}
      style={{ backgroundColor: asset.color }}
    >
      {asset.symbol.slice(0, 1)}
    </span>
  );
}

export function Badge({
  children,
  status
}: {
  children: ReactNode;
  status?: "success" | "pending" | "failed";
}) {
  const colors =
    status === "success"
      ? "border-mint/25 bg-mint/10 text-[#a7f7ca]"
      : status === "pending"
        ? "border-amber/30 bg-amber/10 text-[#ffe0a6]"
        : status === "failed"
          ? "border-rose/30 bg-rose/10 text-[#ffc0ce]"
          : "border-white/10 bg-white/[0.055] text-slate-300";
  return (
    <span className={`inline-flex min-h-6 items-center justify-center rounded-full border px-2.5 py-1 text-xs font-black capitalize ${colors}`}>
      {children}
    </span>
  );
}

export function EmptyState({
  title,
  text,
  icon: Icon,
  actions,
  badge
}: {
  title: string;
  text: string;
  icon: LucideIcon;
  actions?: ReactNode;
  badge?: ReactNode;
}) {
  return (
    <section className="glass-panel grid justify-items-start gap-3 rounded-ui p-6" data-animate>
      <div className="grid h-12 w-12 place-items-center rounded-ui border border-white/10 bg-white/[0.055] text-mint">
        <Icon className="h-6 w-6" />
      </div>
      {badge}
      <h3 className="text-xl font-black">{title}</h3>
      <p className="max-w-2xl text-sm leading-6 text-slate-400">{text}</p>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </section>
  );
}

export function Warning({ title, tone, children }: { title: string; tone: "amber" | "rose"; children: ReactNode }) {
  const classes =
    tone === "amber"
      ? "border-amber/35 bg-amber/10 text-[#ffe0a6]"
      : "border-rose/35 bg-rose/10 text-[#ffc0ce]";
  return (
    <div className={`rounded-ui border p-4 text-sm leading-6 ${classes}`} data-animate>
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        <p>
          <strong>{title}</strong> {children}
        </p>
      </div>
    </div>
  );
}

export function WordGrid({ words }: { words: string[] }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {words.map((word, index) => (
        <div className="thin-panel flex min-h-11 items-center gap-2 rounded-ui px-3 py-2" data-float-in key={`${word}-${index}`}>
          <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/10 text-xs font-black text-slate-400">
            {index + 1}
          </span>
          <strong className="truncate text-sm">{word}</strong>
        </div>
      ))}
    </div>
  );
}

export function SettingsRow({
  title,
  subtitle,
  href,
  icon: Icon
}: {
  title: string;
  subtitle: string;
  href: string;
  icon: LucideIcon;
}) {
  return (
    <Link className="thin-panel flex min-h-[70px] min-w-0 items-center justify-between gap-3 rounded-ui p-3 transition hover:border-cyan/35" href={href}>
      <div className="flex min-w-0 items-center gap-3">
        <Icon className="h-5 w-5 shrink-0 text-cyan" />
        <div className="min-w-0">
          <strong className="block truncate">{title}</strong>
          <span className="block truncate text-sm text-slate-400">{subtitle}</span>
        </div>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0 text-slate-500" />
    </Link>
  );
}

export function StaticRow({
  icon: Icon,
  title,
  subtitle,
  badge
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  badge: ReactNode;
}) {
  return (
    <div className="thin-panel flex min-h-[70px] min-w-0 items-center justify-between gap-3 rounded-ui p-3">
      <div className="flex min-w-0 items-center gap-3">
        <Icon className="h-5 w-5 shrink-0 text-cyan" />
        <div className="min-w-0">
          <strong className="block truncate capitalize">{title}</strong>
          <span className="block truncate text-sm text-slate-400">{subtitle}</span>
        </div>
      </div>
      <div className="shrink-0">{badge}</div>
    </div>
  );
}

export function FilterSelect({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: string;
  options: Array<[string, string]>;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-bold text-slate-300">{label}</span>
      <select
        className="focus-ring min-h-11 rounded-ui border border-white/10 bg-panel2 px-3 text-sm text-white"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}

export function DetailGrid({ rows }: { rows: Array<[string, string]> }) {
  return (
    <div className="grid gap-1">
      {rows.map(([label, value]) => (
        <div className="grid gap-2 border-b border-white/10 py-3 text-sm last:border-0 sm:grid-cols-[150px_minmax(0,1fr)]" key={label}>
          <span className="font-bold text-slate-400">{label}</span>
          <span className="min-w-0 overflow-wrap-anywhere break-words text-slate-100">{value}</span>
        </div>
      ))}
    </div>
  );
}

export function TransactionModal({ transaction, onClose }: { transaction: WalletTransaction; onClose: () => void }) {
  const asset = assetById(transaction.assetId);
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-ink/75 p-4 backdrop-blur-md">
      <article className="glass-panel w-[min(620px,100%)] rounded-ui p-5">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-black">Transaction details</h2>
            <p className="mt-1 text-sm text-slate-400">{asset.name} on {asset.chain}</p>
          </div>
          <button className="focus-ring grid h-10 w-10 place-items-center rounded-ui border border-white/10 text-slate-300" onClick={onClose} title="Close">
            <X className="h-4 w-4" />
          </button>
        </div>
        <DetailGrid
          rows={[
            ["Status", transaction.status],
            ["Type", transaction.type],
            ["Amount", `${transaction.amount} ${asset.symbol}`],
            ["Fee", transaction.fee],
            ["From", transaction.from],
            ["To", transaction.to],
            ["Hash", transaction.hash],
            ["Date", formatDate(transaction.createdAt)]
          ]}
        />
      </article>
    </div>
  );
}

export function BackupModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center bg-ink/75 p-4 backdrop-blur-md">
      <article className="glass-panel w-[min(560px,100%)] rounded-ui p-5">
        <div className="mb-4 grid h-12 w-12 place-items-center rounded-ui border border-amber/25 bg-amber/10 text-amber">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-black">Backup warning</h2>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          This prototype stores demo words in browser storage. In a real wallet, protect the recovery phrase offline and never share it.
        </p>
        <button className={`${buttonPrimary} mt-5`} onClick={onClose}>
          I understand
        </button>
      </article>
    </div>
  );
}

export function QrCode({ value }: { value: string }) {
  return (
    <div className="grid w-[min(100%,260px)] grid-cols-[repeat(21,1fr)] gap-px rounded-ui border-[12px] border-[#f8fbff] bg-[#f8fbff]">
      {qrCells(value).map((on, index) => (
        <span className={`aspect-square ${on ? "qr-cell-on" : "qr-cell-off"}`} key={index} />
      ))}
    </div>
  );
}

export function shuffledOptions(phrase: string[], requiredWord: string) {
  const choices = [requiredWord];
  while (choices.length < 4 && phrase.length) {
    const word = phrase[Math.floor(Math.random() * phrase.length)];
    if (!choices.includes(word)) choices.push(word);
  }
  return choices.sort();
}

export function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function pageTitle(route: string) {
  const titles: Record<string, string> = {
    "wallet-setup": "Wallet setup",
    "create-wallet": "Create wallet",
    "confirm-phrase": "Confirm phrase",
    "import-wallet": "Import wallet",
    "wallet-success": "Wallet ready",
    dashboard: "Dashboard",
    assets: "Assets",
    asset: "Asset details",
    send: "Send",
    review: "Transfer review",
    "transfer-result": "Transfer status",
    receive: "Receive",
    history: "History",
    settings: "Settings",
    security: "Security activity",
    profile: "Profile"
  };
  return titles[route] ?? "Dashboard";
}
