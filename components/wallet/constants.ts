import { Download, History, Layers3, LayoutDashboard, Send, Settings } from "lucide-react";

export const PUBLIC_ROUTES = ["landing", "login", "register", "forgot", "reset"];

export const NO_WALLET_ROUTES = [
  "wallet-setup",
  "create-wallet",
  "confirm-phrase",
  "import-wallet",
  "wallet-success"
];

export const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/assets", label: "Assets", icon: Layers3 },
  { path: "/send", label: "Send", icon: Send },
  { path: "/receive", label: "Receive", icon: Download },
  { path: "/history", label: "History", icon: History },
  { path: "/settings", label: "Settings", icon: Settings }
];

export const mobileNavItems = navItems.slice(0, 5);

export const buttonBase =
  "focus-ring inline-flex min-h-[42px] items-center justify-center gap-2 rounded-ui border px-4 py-2.5 text-sm font-bold tracking-wide transition-all duration-200 disabled:pointer-events-none disabled:opacity-40";
export const buttonPrimary = `${buttonBase} border-purple/30 bg-gradient-to-r from-purple to-pink text-white shadow-glow hover:border-purple/80 hover:scale-[1.02] active:scale-[0.98] laser-btn`;
export const buttonSecondary = `${buttonBase} border-white/10 bg-white/[0.03] text-white hover:border-cyan/40 hover:bg-cyan/5 hover:text-cyan hover:scale-[1.02] active:scale-[0.98]`;
export const buttonGhost = `${buttonBase} border-transparent bg-transparent text-slate-400 hover:bg-white/[0.04] hover:text-white`;
export const buttonDanger = `${buttonBase} border-rose/35 bg-rose/10 text-rose hover:bg-rose/20 hover:border-rose/70 hover:scale-[1.02] active:scale-[0.98]`;
