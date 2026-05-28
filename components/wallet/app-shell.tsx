"use client";

import { Lock, LogOut, Plus, Unlock, User } from "lucide-react";
import Link from "next/link";
import type { Wallet } from "@/lib/types";
import { buttonGhost, buttonSecondary, mobileNavItems, navItems } from "@/components/wallet/constants";
import { Brand, NavLink, pageTitle, SelectControl } from "@/components/wallet/ui";

type AppShellProps = {
  activeWallet: Wallet | null;
  activeWalletId: string;
  currentUserName: string;
  routeName: string;
  userWallets: Wallet[];
  walletLocked: boolean;
  onAddWallet: () => void;
  onLogout: () => void;
  onToggleLock: () => void;
  onWalletChange: (walletId: string) => void;
};

export function Sidebar({ onAddWallet, onLogout, routeName }: Pick<AppShellProps, "onAddWallet" | "onLogout" | "routeName">) {
  const activeIndex = navItems.findIndex((item) => isNavActive(routeName, item.path));

  return (
    <aside className="sticky top-0 hidden h-screen flex-col gap-6 border-r border-white/5 bg-[#03050c]/80 px-4 py-5 backdrop-blur-xl lg:flex">
      <Brand subtitle="sandbox vault" />
      <div className="relative mt-4 pl-1">
        {/* Sliding Indicator */}
        {activeIndex !== -1 && (
          <div 
            className="absolute left-0 w-[3px] bg-gradient-to-b from-purple to-pink rounded-full sidebar-indicator transition-all duration-300 ease-out"
            style={{
              top: `${activeIndex * 52 + 4}px`, // 44px height + 8px gap
              height: "36px"
            }}
          />
        )}
        <nav className="grid gap-2 pl-3">
          {navItems.map((item) => (
            <NavLink key={item.path} {...item} active={isNavActive(routeName, item.path)} />
          ))}
        </nav>
      </div>
      <div className="mt-auto grid gap-2">
        <button className={buttonSecondary} onClick={onAddWallet}>
          <Plus className="h-4 w-4" />
          Add Wallet
        </button>
        <button className={buttonGhost} onClick={onLogout}>
          <LogOut className="h-4 w-4" />
          Logout
        </button>
      </div>
    </aside>
  );
}

export function Topbar({
  activeWallet,
  activeWalletId,
  currentUserName,
  routeName,
  userWallets,
  walletLocked,
  onToggleLock,
  onWalletChange
}: Omit<AppShellProps, "onAddWallet" | "onLogout">) {
  return (
    <header className="mx-auto flex w-full max-w-[1440px] flex-col gap-3 px-3 py-4 text-left xs:px-4 sm:px-6 sm:py-5 lg:flex-row lg:items-center lg:justify-between lg:px-8">
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan/80 font-mono">{currentUserName || "Wallax"}</p>
        <h1 className="truncate text-2xl font-bold tracking-tight text-white xs:text-3xl sm:text-4xl font-display">{pageTitle(routeName)}</h1>
      </div>
      <div className="flex w-full min-w-0 items-center gap-2 sm:w-auto">
        {userWallets.length > 0 && (
          <SelectControl
            wrapperClassName="min-w-0 flex-1 sm:flex-none"
            className="min-h-10 py-2 text-xs sm:w-[220px] sm:text-sm"
            value={activeWallet?.id ?? activeWalletId}
            onChange={(event) => onWalletChange(event.target.value)}
            title="Wallet selector"
          >
            {userWallets.map((wallet) => (
              <option className="bg-ink" key={wallet.id} value={wallet.id}>
                {wallet.name}
              </option>
            ))}
          </SelectControl>
        )}
        <button className="focus-ring grid h-10 w-10 place-items-center rounded-ui border border-white/5 bg-[#0f1624]/60 text-slate-300 hover:text-white hover:border-purple/40 hover:shadow-glow transition-all" onClick={onToggleLock} title="Lock wallet">
          {walletLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
        </button>
        <Link className="focus-ring grid h-10 w-10 place-items-center rounded-ui border border-white/5 bg-[#0f1624]/60 text-slate-300 hover:text-white hover:border-purple/40 hover:shadow-glow transition-all" href="/profile" title="Profile">
          <User className="h-4 w-4" />
        </Link>
      </div>
    </header>
  );
}

export function MobileNav({ routeName }: Pick<AppShellProps, "routeName">) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-white/5 bg-[#03050c]/90 backdrop-blur-xl lg:hidden">
      {mobileNavItems.map((item) => {
        const Icon = item.icon;
        const active = isNavActive(routeName, item.path);
        return (
          <Link
            key={item.path}
            className={`grid min-h-16 place-items-center gap-1 px-1 py-2.5 text-[0.72rem] font-bold transition-colors ${
              active ? "text-cyan" : "text-slate-500 hover:text-slate-300"
            }`}
            href={item.path}
          >
            <Icon className="h-5 w-5" />
            <span>{item.label === "Dashboard" ? "Home" : item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

function isNavActive(routeName: string, path: string) {
  const base = path.replace("/", "");
  return (
    routeName === base ||
    (routeName === "asset" && base === "assets") ||
    (["review", "transfer-result"].includes(routeName) && base === "send")
  );
}
