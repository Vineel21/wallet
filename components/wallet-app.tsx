"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { AuthScreens } from "@/components/wallet/auth-screens";
import { LandingPage } from "@/components/wallet/landing-page";
import { MobileNav, Sidebar, Topbar } from "@/components/wallet/app-shell";
import { NO_WALLET_ROUTES, PUBLIC_ROUTES } from "@/components/wallet/constants";
import {
  AssetDetailScreen,
  AssetsPageScreen,
  ConfirmPhraseScreen,
  CreateWalletScreen,
  DashboardScreen,
  HistoryScreen,
  ImportWalletScreen,
  ProfileScreen,
  ReceiveScreen,
  ReviewScreen,
  SecurityScreen,
  SendScreen,
  SettingsScreen,
  TransferResultScreen,
  WalletSetupScreen,
  WalletSuccessScreen
} from "@/components/wallet/screens";
import type { RecipientContact } from "@/components/wallet/screens";
import { BackupModal, LoadingScreen, TransactionModal, CustomCursor } from "@/components/wallet/ui";
import {
  ASSETS,
  assetById,
  deriveAccounts,
  estimateFee,
  fakeHash,
  generateMnemonic,
  now,
  roundBalance,
  uid,
} from "@/lib/mock-data";
import { readJson, readText, removeStorage, STORAGE, writeJson, writeText } from "@/lib/storage";
import {
  HistoryFilters,
  PendingTransfer,
  SecurityEvent,
  Session,
  TransferResult,
  User as UserType,
  Wallet,
  WalletHolding,
  WalletTransaction
} from "@/lib/types";
import {
  firstZodError,
  importWalletSchema,
  loginSchema,
  passwordSchema,
  profileSchema,
  registerSchema,
  resetConfirmSchema,
  resetRequestSchema,
  revealPhraseSchema,
  sendSchema
} from "@/lib/validation";
import { addSecurityEvent } from "@/lib/wallet-service";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

gsap.registerPlugin(useGSAP);

type WalletAppProps = {
  initialRoute: string[];
};

type RemoteWallet = {
  id: string;
  name: string;
  source: "created" | "imported";
  created_at: string;
  wallet_accounts?: Array<{
    id: string;
    chain: string;
    address: string;
  }>;
};

type RemoteSecurityEvent = {
  id: string;
  event_type: string;
  detail: string | null;
  created_at: string;
};

type WalletRuntime = {
  assets: WalletHolding[];
  transactions: WalletTransaction[];
};

type KnownWallet = Pick<Wallet, "id" | "userId" | "name" | "source" | "createdAt" | "accounts">;

export function WalletApp({ initialRoute }: WalletAppProps) {
  void initialRoute;

  const pathname = usePathname() || "/";
  const router = useRouter();
  const searchParams = useSearchParams();
  const routeParts = pathname.split("/").filter(Boolean);
  const routeName = routeParts[0] || "landing";
  const routeId = `${pathname}?${searchParams.toString()}`;
  const routeScope = useRef<HTMLDivElement>(null);

  const [hydrated, setHydrated] = useState(false);
  const [session, setSessionState] = useState<Session | null>(null);
  const [users, setUsers] = useState<UserType[]>([]);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [knownWallets, setKnownWallets] = useState<KnownWallet[]>([]);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [activeWalletId, setActiveWalletId] = useState("");
  const [draftPhrase, setDraftPhrase] = useState<string[]>([]);
  const [pendingTransfer, setPendingTransfer] = useState<PendingTransfer | null>(null);
  const [lastTransfer, setLastTransfer] = useState<TransferResult | null>(null);
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
  const [walletLocked, setWalletLocked] = useState(false);
  const [revealPhrase, setRevealPhrase] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [assetSearch, setAssetSearch] = useState("");
  const [historyFilters, setHistoryFilters] = useState<HistoryFilters>({
    asset: "all",
    type: "all",
    status: "all"
  });
  const [formError, setFormError] = useState("");
  const [transferError, setTransferError] = useState("");
  const [transferSubmitting, setTransferSubmitting] = useState(false);
  const [toasts, setToasts] = useState<Array<{ id: string; message: string }>>([]);

  useEffect(() => {
    const savedSession = readJson<Session | null>(STORAGE.session, null);
    const savedActiveWalletId = readText(STORAGE.activeWalletId);
    setSessionState(savedSession);
    setUsers(savedSession?.user ? [savedSession.user] : []);
    setKnownWallets(readJson<KnownWallet[]>(STORAGE.knownWallets, []));
    setActiveWalletId(savedActiveWalletId);
    setDraftPhrase(readJson<string[]>(STORAGE.draftPhrase, []));
    setPendingTransfer(readJson<PendingTransfer | null>(STORAGE.pendingTransfer, null));
    setLastTransfer(readJson<TransferResult | null>(STORAGE.lastTransfer, null));

    if (!savedSession?.accessToken) {
      setHydrated(true);
      return;
    }

    void loadRemoteData(savedSession.accessToken, savedSession.user?.id, savedActiveWalletId).finally(() => {
      setHydrated(true);
    });
  }, []);

  const currentUser = useMemo(
    () => session?.user ?? (session ? users.find((user) => user.id === session.userId) ?? null : null),
    [session, users]
  );

  const userWallets = useMemo(
    () => (currentUser ? wallets.filter((wallet) => wallet.userId === currentUser.id) : []),
    [currentUser, wallets]
  );

  const activeWallet = useMemo(() => {
    if (!userWallets.length) return null;
    return userWallets.find((wallet) => wallet.id === activeWalletId) ?? userWallets[0];
  }, [activeWalletId, userWallets]);

  const recentContacts = useMemo<RecipientContact[]>(() => {
    if (!activeWallet) return [];
    const ownAddresses = new Set(activeWallet.accounts.map((account) => account.address.toLowerCase()));
    const contacts = new Map<string, RecipientContact>();

    knownWallets.forEach((wallet) => {
      if (wallet.id === activeWallet.id) return;
      wallet.accounts.forEach((account) => {
        const key = account.address.toLowerCase();
        if (ownAddresses.has(key)) return;
        contacts.set(key, {
          name: `${wallet.name} (${account.chain})`,
          address: account.address,
          chain: account.chain
        });
      });
    });

    activeWallet.transactions
      .filter((tx) => tx.type === "outgoing")
      .forEach((tx) => {
        const key = tx.to.toLowerCase();
        if (!tx.to || ownAddresses.has(key) || contacts.has(key)) return;
        contacts.set(key, {
          name: `Recent ${assetById(tx.assetId).symbol} recipient`,
          address: tx.to,
          chain: assetById(tx.assetId).chain
        });
      });

    return Array.from(contacts.values()).slice(0, 8);
  }, [activeWallet, knownWallets]);

  const isPublicRoute = PUBLIC_ROUTES.includes(routeName);

  useEffect(() => {
    if (!hydrated) return;

    if (!session && !isPublicRoute) {
      router.replace("/login");
      return;
    }

    if (session && isPublicRoute && routeName !== "forgot" && routeName !== "reset") {
      router.replace(activeWallet ? "/dashboard" : "/wallet-setup");
      return;
    }

    if (session && !isPublicRoute && !activeWallet && !NO_WALLET_ROUTES.includes(routeName)) {
      router.replace("/wallet-setup");
    }
  }, [activeWallet, hydrated, isPublicRoute, routeName, router, session]);

  useEffect(() => {
    if (!hydrated || !["create-wallet", "confirm-phrase"].includes(routeName) || draftPhrase.length) return;
    persistDraftPhrase(generateMnemonic());
  }, [draftPhrase.length, hydrated, routeName]);

  useEffect(() => {
    if (routeName !== "transfer-result" || !pendingTransfer || !lastTransfer) return;
    setPendingTransfer(null);
    removeStorage(STORAGE.pendingTransfer);
    setTransferSubmitting(false);
  }, [lastTransfer, pendingTransfer, routeName]);

  useGSAP(
    () => {
      if (!routeScope.current) return;
      const items = routeScope.current.querySelectorAll("[data-animate]");
      gsap.fromTo(
        items,
        { autoAlpha: 0, y: 18, scale: 0.985 },
        { autoAlpha: 1, y: 0, scale: 1, duration: 0.55, ease: "power3.out", stagger: 0.045 }
      );
      gsap.fromTo(
        routeScope.current.querySelectorAll("[data-float-in]"),
        { autoAlpha: 0, x: -14 },
        { autoAlpha: 1, x: 0, duration: 0.62, ease: "expo.out", stagger: 0.035 }
      );
    },
    { scope: routeScope, dependencies: [routeId, hydrated] }
  );

  function persistUsers(next: UserType[]) {
    setUsers(next);
    writeJson(STORAGE.users, next);
  }

  function persistWallets(next: Wallet[]) {
    setWallets(next);
    const runtime = readJson<Record<string, WalletRuntime>>(STORAGE.walletRuntime, {});
    const nextRuntime = { ...runtime };
    next.forEach((wallet) => {
      nextRuntime[wallet.id] = {
        assets: wallet.assets,
        transactions: wallet.transactions
      };
    });
    writeJson(STORAGE.walletRuntime, nextRuntime);
    persistKnownWallets(next);
  }

  function persistKnownWallets(next: Wallet[]) {
    const existing = readJson<KnownWallet[]>(STORAGE.knownWallets, []);
    const merged = [...existing];
    next.forEach((wallet) => {
      const known: KnownWallet = {
        id: wallet.id,
        userId: wallet.userId,
        name: wallet.name,
        source: wallet.source,
        createdAt: wallet.createdAt,
        accounts: wallet.accounts
      };
      const index = merged.findIndex((item) => item.id === wallet.id);
      if (index >= 0) merged[index] = known;
      else merged.push(known);
    });
    setKnownWallets(merged);
    writeJson(STORAGE.knownWallets, merged);
  }

  function persistEvents(next: SecurityEvent[]) {
    setEvents(next);
    writeJson(STORAGE.events, next);
  }

  function persistSession(next: Session | null) {
    setSessionState(next);
    if (next) writeJson(STORAGE.session, next);
    else removeStorage(STORAGE.session);
  }

  function persistDraftPhrase(next: string[]) {
    setDraftPhrase(next);
    writeJson(STORAGE.draftPhrase, next);
  }

  function persistPendingTransfer(next: PendingTransfer | null) {
    setPendingTransfer(next);
    if (next) writeJson(STORAGE.pendingTransfer, next);
    else removeStorage(STORAGE.pendingTransfer);
  }

  function persistLastTransfer(next: TransferResult) {
    setLastTransfer(next);
    writeJson(STORAGE.lastTransfer, next);
  }

  function updateActiveWallet(walletId: string) {
    setActiveWalletId(walletId);
    writeText(STORAGE.activeWalletId, walletId);
  }

  function toast(message: string) {
    const id = uid("toast");
    setToasts((current) => [...current, { id, message }]);
    window.setTimeout(() => {
      setToasts((current) => current.filter((item) => item.id !== id));
    }, 2800);
  }

  function logEvent(type: string, detail: string) {
    if (!currentUser) return;
    persistEvents(addSecurityEvent(events, currentUser.id, type, detail));
  }

  function authHeaders(token = session?.accessToken): Record<string, string> {
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async function apiJson<T>(path: string, init: RequestInit = {}): Promise<T> {
    const response = await fetch(path, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init.headers ?? {})
      }
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(typeof payload.error === "string" ? payload.error : "Request failed.");
    }
    return payload as T;
  }

  function phraseStore() {
    return readJson<Record<string, string[]>>(STORAGE.walletPhrases, {});
  }

  function runtimeStore() {
    return readJson<Record<string, WalletRuntime>>(STORAGE.walletRuntime, {});
  }

  function writeWalletRuntime(walletId: string, runtime: WalletRuntime) {
    writeJson(STORAGE.walletRuntime, { ...runtimeStore(), [walletId]: runtime });
  }

  function persistWalletPhrase(walletId: string, phrase: string[]) {
    writeJson(STORAGE.walletPhrases, { ...phraseStore(), [walletId]: phrase });
  }

  function remoteWalletToWallet(remote: RemoteWallet, userId = currentUser?.id ?? ""): Wallet {
    const phrases = phraseStore();
    const runtime = runtimeStore()[remote.id];
    const transactions = (runtime?.transactions ?? []).filter((tx) => tx.from !== "MVP starter allocation");
    return {
      id: remote.id,
      userId,
      name: remote.name,
      phrase: phrases[remote.id] ?? [],
      source: remote.source,
      createdAt: remote.created_at,
      accounts: (remote.wallet_accounts ?? []).map((account) => ({
        id: account.id,
        chain: account.chain,
        address: account.address
      })),
      assets: runtime?.assets ?? ASSETS.map((asset, index) => ({
        assetId: asset.id,
        balance: 0,
        favorite: index < 2
      })),
      transactions
    };
  }

  function createStarterRuntime(wallet: Wallet): WalletRuntime {
    const assets = wallet.assets.map((holding, index) => {
      const asset = assetById(holding.assetId);
      const seed = Math.random();
      const balance =
        asset.id === "btc"
          ? 0.005 + seed * 0.045
          : asset.id === "eth"
            ? 0.2 + seed * 1.8
            : asset.id === "usdc"
              ? 100 + seed * 2400
              : asset.id === "sol"
                ? 2 + seed * 35
                : asset.id === "bnb"
                  ? 0.5 + seed * 8
                  : 50 + seed * 950;

      return {
        ...holding,
        balance: roundBalance(balance),
        favorite: index < 2
      };
    });

    return { assets, transactions: [] };
  }

  async function loadRemoteData(token: string, userId = currentUser?.id, preferredWalletId = activeWalletId) {
    const [walletPayload, eventsPayload] = await Promise.all([
      apiJson<{ wallets: RemoteWallet[] }>("/api/wallets", {
        headers: authHeaders(token)
      }),
      apiJson<{ events: RemoteSecurityEvent[] }>("/api/security/events", {
        headers: authHeaders(token)
      }).catch(() => ({ events: [] }))
    ]);

    const nextWallets = walletPayload.wallets.map((wallet) => remoteWalletToWallet(wallet, userId ?? ""));
    setWallets(nextWallets);
    persistKnownWallets(nextWallets);
    setEvents(
      eventsPayload.events.map((event) => ({
        id: event.id,
        userId: userId ?? "",
        type: event.event_type,
        detail: event.detail ?? "",
        createdAt: event.created_at
      }))
    );

    if (nextWallets.length) {
      const nextActive = nextWallets.some((wallet) => wallet.id === preferredWalletId)
        ? preferredWalletId
        : nextWallets[0].id;
      updateActiveWallet(nextActive);
    }

    return nextWallets;
  }

  async function authenticate(email: string, password: string) {
    const payload = await apiJson<{
      user: { id: string; email: string; name: string; emailVerified: boolean };
      session: { accessToken: string; expiresAt: string | null };
    }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    const user: UserType = {
      id: payload.user.id,
      name: payload.user.name,
      email: payload.user.email,
      emailVerified: payload.user.emailVerified,
      createdAt: now()
    };
    const nextSession: Session = {
      userId: user.id,
      accessToken: payload.session.accessToken,
      user,
      startedAt: now(),
      expiresAt: payload.session.expiresAt ?? new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString()
    };
    persistSession(nextSession);
    setUsers([user]);
    const remoteWallets = await loadRemoteData(payload.session.accessToken, user.id);
    return { user, session: nextSession, wallets: remoteWallets };
  }

  function parseForm(form: HTMLFormElement) {
    return Object.fromEntries(Array.from(new FormData(form)).map(([key, value]) => [key, String(value).trim()]));
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    try {
      const data = registerSchema.parse(parseForm(event.currentTarget));
      const email = data.email.toLowerCase();
      await apiJson("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name: data.name, email, password: data.password })
      });
      try {
        await authenticate(email, data.password);
        toast("Account created.");
        router.push("/wallet-setup");
      } catch {
        toast("Account created. Check your email to confirm before logging in.");
        router.push("/login");
      }
    } catch (error) {
      setFormError(error instanceof Error ? error.message : firstZodError(error));
    }
  }

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    try {
      const data = loginSchema.parse(parseForm(event.currentTarget));
      const auth = await authenticate(data.email.toLowerCase(), data.password);
      toast("Logged in.");
      router.push(auth.wallets.length ? "/dashboard" : "/wallet-setup");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : firstZodError(error));
    }
  }

  async function handleForgot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    try {
      const data = resetRequestSchema.parse(parseForm(event.currentTarget));
      await apiJson("/api/auth/password-reset", {
        method: "POST",
        body: JSON.stringify({ email: data.email.toLowerCase() })
      });
      toast("Password reset link sent.");
      router.push("/login");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : firstZodError(error));
    }
  }

  async function handleReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    try {
      const data = resetConfirmSchema.parse(parseForm(event.currentTarget));
      const params = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");

      if (!accessToken || !refreshToken) {
        setFormError("Open the password reset link from your email before setting a new password.");
        return;
      }
      const supabase = createBrowserSupabaseClient();
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      });
      if (sessionError) throw sessionError;

      const { error } = await supabase.auth.updateUser({ password: data.password });
      if (error) throw error;

      toast("Password reset.");
      router.push("/login");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : firstZodError(error));
    }
  }

  function startCreateWallet() {
    const phrase = generateMnemonic();
    persistDraftPhrase(phrase);
    setShowBackupModal(true);
    router.push("/create-wallet");
  }

  async function handleConfirmPhrase(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    if (!currentUser || !draftPhrase.length || !session?.accessToken) return;
    const data = parseForm(event.currentTarget);
    const checks = [1, 5, 9];
    const valid = checks.every((index) => data[`word${index}`] === draftPhrase[index]);
    if (!valid) {
      setFormError("One or more selected words do not match.");
      return;
    }
    try {
      const accounts = deriveAccounts(draftPhrase).map((account) => ({
        chain: account.chain,
        address: account.address
      }));
      const payload = await apiJson<{ wallet: RemoteWallet }>("/api/wallets", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          name: "Primary Wallet",
          source: "created",
          accounts
        })
      });
      persistWalletPhrase(payload.wallet.id, draftPhrase);
      const wallet = remoteWalletToWallet(payload.wallet, currentUser.id);
      wallet.phrase = draftPhrase;
      const runtime = createStarterRuntime(wallet);
      wallet.assets = runtime.assets;
      wallet.transactions = runtime.transactions;
      persistWallets([wallet, ...wallets]);
      updateActiveWallet(wallet.id);
      removeStorage(STORAGE.draftPhrase);
      setDraftPhrase([]);
      toast("Wallet created.");
      router.push("/wallet-success");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to create wallet.");
    }
  }

  async function handleImportWallet(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    if (!currentUser || !session?.accessToken) return;
    try {
      const data = importWalletSchema.parse(parseForm(event.currentTarget));
      const words = data.phrase.split(/\s+/).filter(Boolean);
      if (words.length < 12) {
        setFormError("Enter at least 12 words.");
        return;
      }
      const accounts = deriveAccounts(words).map((account) => ({
        chain: account.chain,
        address: account.address
      }));
      const payload = await apiJson<{ wallet: RemoteWallet }>("/api/wallets", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          name: data.walletName || "Imported Wallet",
          source: "imported",
          accounts
        })
      });
      persistWalletPhrase(payload.wallet.id, words);
      const wallet = remoteWalletToWallet(payload.wallet, currentUser.id);
      wallet.phrase = words;
      const runtime = createStarterRuntime(wallet);
      wallet.assets = runtime.assets;
      wallet.transactions = runtime.transactions;
      persistWallets([wallet, ...wallets]);
      updateActiveWallet(wallet.id);
      toast("Wallet imported.");
      router.push("/wallet-success");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : firstZodError(error));
    }
  }

  function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    if (!activeWallet) return;
    try {
      const data = sendSchema.parse(parseForm(event.currentTarget));
      const holding = activeWallet.assets.find((item) => item.assetId === data.assetId);
      if (!holding) {
        setFormError("Choose an available asset.");
        return;
      }
      if (data.amount > holding.balance) {
        setFormError("Amount exceeds available balance.");
        return;
      }
      persistPendingTransfer({
        assetId: data.assetId,
        recipient: data.recipient,
        amount: data.amount,
        fee: estimateFee(data.assetId)
      });
      router.push("/review");
    } catch (error) {
      setFormError(firstZodError(error));
    }
  }

  async function handleReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTransferError("");
    if (transferSubmitting || !currentUser || !activeWallet || !pendingTransfer) return;
    setTransferSubmitting(true);
    const password = String(new FormData(event.currentTarget).get("password") ?? "");
    try {
      await authenticate(currentUser.email, password);
    } catch {
      setTransferSubmitting(false);
      setTransferError("Password confirmation failed.");
      return;
    }
    const asset = assetById(pendingTransfer.assetId);
    const account = activeWallet.accounts.find((item) => item.chain === asset.chain) ?? activeWallet.accounts[0];
    const status = "success";
    const hash = fakeHash();
    const tx: WalletTransaction = {
      id: uid("tx"),
      assetId: pendingTransfer.assetId,
      type: "outgoing",
      status,
      amount: pendingTransfer.amount,
      fee: pendingTransfer.fee,
      from: account.address,
      to: pendingTransfer.recipient,
      hash,
      createdAt: now()
    };
    const recipientAddress = pendingTransfer.recipient.toLowerCase();
    const recipientCurrentWallet = wallets.find(
      (wallet) =>
        wallet.id !== activeWallet.id &&
        wallet.accounts.some((account) => account.address.toLowerCase() === recipientAddress)
    );
    const recipientKnownWallet = knownWallets.find(
      (wallet) =>
        wallet.id !== activeWallet.id &&
        wallet.accounts.some((account) => account.address.toLowerCase() === recipientAddress)
    );
    const recipientWallet = recipientCurrentWallet ?? recipientKnownWallet;
    const recipientTx: WalletTransaction | null = recipientWallet
      ? {
          id: uid("tx"),
          assetId: pendingTransfer.assetId,
          type: "incoming",
          status,
          amount: pendingTransfer.amount,
          fee: `0 ${asset.symbol}`,
          from: account.address,
          to: pendingTransfer.recipient,
          hash,
          createdAt: now()
        }
      : null;
    const nextWallet: Wallet = {
      ...activeWallet,
      assets: activeWallet.assets.map((holding) =>
        holding.assetId === pendingTransfer.assetId && status === "success"
          ? { ...holding, balance: roundBalance(holding.balance - pendingTransfer.amount) }
          : holding
      ),
      transactions: [tx, ...activeWallet.transactions]
    };
    const nextWallets = wallets.map((wallet) => {
        if (wallet.id === activeWallet.id) return nextWallet;
        if (recipientCurrentWallet && recipientTx && wallet.id === recipientCurrentWallet.id && status === "success") {
          return {
            ...wallet,
            assets: wallet.assets.map((holding) =>
              holding.assetId === pendingTransfer.assetId
                ? { ...holding, balance: roundBalance(holding.balance + pendingTransfer.amount) }
                : holding
            ),
            transactions: [recipientTx, ...wallet.transactions]
          };
        }
        return wallet;
      });
    persistWallets(nextWallets);

    if (!recipientCurrentWallet && recipientKnownWallet && recipientTx && status === "success") {
      const existingRuntime = runtimeStore()[recipientKnownWallet.id] ?? {
        assets: ASSETS.map((item, index) => ({
          assetId: item.id,
          balance: 0,
          favorite: index < 2
        })),
        transactions: []
      };
      writeWalletRuntime(recipientKnownWallet.id, {
        assets: existingRuntime.assets.map((holding) =>
          holding.assetId === pendingTransfer.assetId
            ? { ...holding, balance: roundBalance(holding.balance + pendingTransfer.amount) }
            : holding
        ),
        transactions: [recipientTx, ...existingRuntime.transactions]
      });
    }
    const result: TransferResult = {
      status,
      hash,
      assetId: pendingTransfer.assetId,
      amount: pendingTransfer.amount,
      createdAt: now()
    };
    persistLastTransfer(result);
    logEvent("transfer submitted", `${pendingTransfer.amount} ${asset.symbol} transfer ${status}.`);
    toast(status === "success" ? "Transfer submitted." : "Transfer failed.");
    router.push("/transfer-result");
  }

  async function handleProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    if (!currentUser || !session?.accessToken) return;
    try {
      const data = profileSchema.parse(parseForm(event.currentTarget));
      const payload = await apiJson<{ profile: { name: string; email: string; email_verified: boolean } }>("/api/profile", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ name: data.name })
      });
      const nextUser = {
        ...currentUser,
        name: payload.profile.name,
        email: payload.profile.email,
        emailVerified: payload.profile.email_verified
      };
      const nextSession = { ...session, user: nextUser };
      persistSession(nextSession);
      setUsers([nextUser]);
      logEvent("profile updated", "Profile name changed.");
      toast("Profile saved.");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : firstZodError(error));
    }
  }

  async function handlePasswordChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    if (!currentUser) return;
    try {
      const data = passwordSchema.parse(parseForm(event.currentTarget));
      try {
        await authenticate(currentUser.email, data.currentPassword);
      } catch {
        setFormError("Current password is incorrect.");
        return;
      }
      await apiJson("/api/auth/change-password", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ password: data.password })
      });
      logEvent("password changed", "Password changed from settings.");
      toast("Password changed.");
      event.currentTarget.reset();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : firstZodError(error));
    }
  }

  async function handleRevealPhrase(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    if (!currentUser) return;
    try {
      const data = revealPhraseSchema.parse(parseForm(event.currentTarget));
      try {
        await authenticate(currentUser.email, data.password);
      } catch {
        setFormError("Password confirmation failed.");
        return;
      }
      setRevealPhrase(true);
      logEvent("phrase revealed", "Recovery phrase was revealed after password confirmation.");
      toast("Phrase revealed.");
    } catch (error) {
      setFormError(firstZodError(error));
    }
  }

  function logout() {
    persistSession(null);
    toast("Logged out.");
    router.push("/login");
  }

  function logoutAll() {
    logEvent("logout all", "All local sessions cleared.");
    persistSession(null);
    router.push("/login");
  }

  function toggleLock() {
    setWalletLocked((value) => !value);
    logEvent("wallet lock toggled", walletLocked ? "Wallet unlocked." : "Wallet locked.");
    toast(walletLocked ? "Wallet unlocked." : "Wallet locked.");
  }

  function toggleFavorite(assetId: string) {
    if (!activeWallet) return;
    const nextWallet = {
      ...activeWallet,
      assets: activeWallet.assets.map((holding) =>
        holding.assetId === assetId ? { ...holding, favorite: !holding.favorite } : holding
      )
    };
    persistWallets(wallets.map((wallet) => (wallet.id === activeWallet.id ? nextWallet : wallet)));
  }

  function handleReceive(assetId: string, amount: number) {
    if (!activeWallet || amount <= 0) return;
    const asset = assetById(assetId);
    const account = activeWallet.accounts.find((item) => item.chain === asset.chain) ?? activeWallet.accounts[0];
    const tx: WalletTransaction = {
      id: uid("tx"),
      assetId,
      type: "incoming",
      status: "success",
      amount,
      fee: `0 ${asset.symbol}`,
      from: "External deposit",
      to: account?.address ?? "",
      hash: fakeHash(),
      createdAt: now()
    };
    const nextWallet: Wallet = {
      ...activeWallet,
      assets: activeWallet.assets.map((holding) =>
        holding.assetId === assetId ? { ...holding, balance: roundBalance(holding.balance + amount) } : holding
      ),
      transactions: [tx, ...activeWallet.transactions]
    };
    persistWallets(wallets.map((wallet) => (wallet.id === activeWallet.id ? nextWallet : wallet)));
    toast(`Received ${amount} ${asset.symbol}.`);
  }

  function copyText(value: string, label = "Copied.") {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(value).then(() => toast(label));
      return;
    }
    toast(value);
  }

  async function shareText(value: string) {
    if (navigator.share) {
      await navigator.share({ text: value });
      return;
    }
    copyText(value, "Address copied.");
  }

  if (!hydrated) {
    return <LoadingScreen />;
  }

  if (!session && !isPublicRoute) {
    return <LoadingScreen />;
  }

  if (session && isPublicRoute && routeName !== "forgot" && routeName !== "reset") {
    return <LoadingScreen />;
  }

  if (session && !isPublicRoute && !activeWallet && !NO_WALLET_ROUTES.includes(routeName)) {
    return <LoadingScreen />;
  }

  const selectedTx = selectedTxId && activeWallet ? activeWallet.transactions.find((tx) => tx.id === selectedTxId) : null;

  return (
    <div className="min-h-screen max-w-full overflow-x-hidden wallet-grid-bg">
      <CustomCursor />
      {routeName === "landing" ? (
        <LandingPage />
      ) : isPublicRoute ? (
        <main ref={routeScope} className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.2fr_1fr] bg-[#03050c] relative overflow-hidden">
          <AuthScreens
            route={routeName}
            formError={formError}
            onRegister={handleRegister}
            onLogin={handleLogin}
            onForgot={handleForgot}
            onReset={handleReset}
          />
        </main>
      ) : (
        <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[252px_minmax(0,1fr)]">
          <Sidebar routeName={routeName} onAddWallet={startCreateWallet} onLogout={logout} />
          <div className="min-w-0 max-w-full pb-24 lg:pb-0">
            <Topbar
              activeWallet={activeWallet}
              activeWalletId={activeWalletId}
              currentUserName={currentUser?.name ?? ""}
              routeName={routeName}
              userWallets={userWallets}
              walletLocked={walletLocked}
              onToggleLock={toggleLock}
              onWalletChange={updateActiveWallet}
            />
            <main ref={routeScope} className="mx-auto grid w-full max-w-[1440px] min-w-0 gap-4 px-3 pb-8 xs:px-4 sm:gap-5 sm:px-6 lg:px-8">
              {renderRoute()}
            </main>
          </div>
          <MobileNav routeName={routeName} />
        </div>
      )}
      {selectedTx && <TransactionModal transaction={selectedTx} onClose={() => setSelectedTxId(null)} />}
      {showBackupModal && routeName === "create-wallet" && (
        <BackupModal onClose={() => setShowBackupModal(false)} />
      )}
      <div className="fixed bottom-4 left-3 right-3 z-[80] grid gap-2 sm:left-auto sm:right-4 sm:w-[min(360px,calc(100vw-32px))]">
        {toasts.map((item) => (
          <div
            key={item.id}
            className="glass-panel rounded-ui px-4 py-3 text-sm font-semibold text-white"
            data-animate
          >
            {item.message}
          </div>
        ))}
      </div>
    </div>
  );

  function renderRoute(): ReactNode {
    if (routeName === "wallet-setup") return <WalletSetupScreen onCreateWallet={startCreateWallet} />;
    if (routeName === "create-wallet") {
      return (
        <CreateWalletScreen
          draftPhrase={draftPhrase}
          onRegeneratePhrase={() => persistDraftPhrase(generateMnemonic())}
        />
      );
    }
    if (routeName === "confirm-phrase") {
      return (
        <ConfirmPhraseScreen
          draftPhrase={draftPhrase}
          formError={formError}
          onConfirmPhrase={handleConfirmPhrase}
        />
      );
    }
    if (routeName === "import-wallet") {
      return <ImportWalletScreen formError={formError} onImportWallet={handleImportWallet} />;
    }
    if (routeName === "wallet-success") return <WalletSuccessScreen />;
    if (routeName === "assets") {
      return (
        <AssetsPageScreen
          activeWallet={activeWallet}
          assetSearch={assetSearch}
          onAssetSearch={setAssetSearch}
        />
      );
    }
    if (routeName === "asset") {
      return (
        <AssetDetailScreen
          activeWallet={activeWallet}
          assetId={routeParts[1]}
          onOpenTransaction={setSelectedTxId}
          onToggleFavorite={toggleFavorite}
        />
      );
    }
    if (routeName === "send") {
      return (
        <SendScreen
          activeWallet={activeWallet}
          assetId={searchParams.get("asset") ?? activeWallet?.assets[0]?.assetId ?? "eth"}
          formError={formError}
          onAssetChange={(assetId) => router.push(`/send?asset=${assetId}`)}
          onSend={handleSend}
          recentContacts={recentContacts}
          userWallets={userWallets}
        />
      );
    }
    if (routeName === "review") {
      return (
        <ReviewScreen
          isSubmitting={transferSubmitting}
          pendingTransfer={pendingTransfer}
          transferError={transferError}
          onReview={handleReview}
        />
      );
    }
    if (routeName === "transfer-result") return <TransferResultScreen lastTransfer={lastTransfer} />;
    if (routeName === "receive") {
      return (
        <ReceiveScreen
          activeWallet={activeWallet}
          assetId={searchParams.get("asset") ?? activeWallet?.assets[0]?.assetId ?? "eth"}
          onAssetChange={(assetId) => router.push(`/receive?asset=${assetId}`)}
          onCopyText={copyText}
          onReceive={handleReceive}
          onShareText={shareText}
        />
      );
    }
    if (routeName === "history") {
      return (
        <HistoryScreen
          activeWallet={activeWallet}
          historyFilters={historyFilters}
          onHistoryFiltersChange={setHistoryFilters}
          onOpenTransaction={setSelectedTxId}
        />
      );
    }
    if (routeName === "settings") {
      return (
        <SettingsScreen
          activeWallet={activeWallet}
          formError={formError}
          revealPhrase={revealPhrase}
          walletLocked={walletLocked}
          onLogoutAll={logoutAll}
          onPasswordChange={handlePasswordChange}
          onRevealPhrase={handleRevealPhrase}
          onToggleLock={toggleLock}
        />
      );
    }
    if (routeName === "security") {
      return <SecurityScreen currentUserId={currentUser?.id} events={events} />;
    }
    if (routeName === "profile") {
      return <ProfileScreen currentUser={currentUser} formError={formError} onProfile={handleProfile} />;
    }
    return (
      <DashboardScreen
        activeWallet={activeWallet}
        onCreateWallet={startCreateWallet}
        onCopyAddress={copyText}
        onOpenTransaction={setSelectedTxId}
      />
    );
  }

}
