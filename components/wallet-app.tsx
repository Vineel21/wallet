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
import { BackupModal, LoadingScreen, TransactionModal, CustomCursor } from "@/components/wallet/ui";
import {
  assetById,
  estimateFee,
  fakeHash,
  generateMnemonic,
  now,
  roundBalance,
  uid
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
import { addSecurityEvent, createSession, createUser, createWallet, seedDemoAccount } from "@/lib/wallet-service";

gsap.registerPlugin(useGSAP);

type WalletAppProps = {
  initialRoute: string[];
};

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
  const [toasts, setToasts] = useState<Array<{ id: string; message: string }>>([]);

  useEffect(() => {
    seedDemoAccount();
    setUsers(readJson<UserType[]>(STORAGE.users, []));
    setWallets(readJson<Wallet[]>(STORAGE.wallets, []));
    setEvents(readJson<SecurityEvent[]>(STORAGE.events, []));
    setSessionState(readJson<Session | null>(STORAGE.session, null));
    setActiveWalletId(readText(STORAGE.activeWalletId));
    setDraftPhrase(readJson<string[]>(STORAGE.draftPhrase, []));
    setPendingTransfer(readJson<PendingTransfer | null>(STORAGE.pendingTransfer, null));
    setLastTransfer(readJson<TransferResult | null>(STORAGE.lastTransfer, null));
    setHydrated(true);
  }, []);

  const currentUser = useMemo(
    () => (session ? users.find((user) => user.id === session.userId) ?? null : null),
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
    writeJson(STORAGE.wallets, next);
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

  function parseForm(form: HTMLFormElement) {
    return Object.fromEntries(Array.from(new FormData(form)).map(([key, value]) => [key, String(value).trim()]));
  }

  function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    try {
      const data = registerSchema.parse(parseForm(event.currentTarget));
      const email = data.email.toLowerCase();
      if (users.some((user) => user.email === email)) {
        setFormError("An account already exists for this email.");
        return;
      }
      const user = createUser(data.name, email, data.password);
      persistUsers([...users, user]);
      const nextSession = createSession(user.id);
      setSessionState(nextSession);
      writeJson(STORAGE.session, nextSession);
      persistEvents(addSecurityEvent(events, user.id, "account registered", "Local prototype account created."));
      toast("Account created.");
      router.push("/wallet-setup");
    } catch (error) {
      setFormError(firstZodError(error));
    }
  }

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    try {
      const data = loginSchema.parse(parseForm(event.currentTarget));
      const user = users.find((item) => item.email === data.email.toLowerCase() && item.password === data.password);
      if (!user) {
        setFormError("Email or password is incorrect.");
        return;
      }
      const nextSession = createSession(user.id);
      persistSession(nextSession);
      persistEvents(addSecurityEvent(events, user.id, "login", "Browser session opened."));
      const wallet = wallets.find((item) => item.userId === user.id);
      toast("Logged in.");
      router.push(wallet ? "/dashboard" : "/wallet-setup");
    } catch (error) {
      setFormError(firstZodError(error));
    }
  }

  function handleForgot(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    try {
      const data = resetRequestSchema.parse(parseForm(event.currentTarget));
      if (!users.some((user) => user.email === data.email.toLowerCase())) {
        setFormError("No local account exists for that email.");
        return;
      }
      const code = String(Math.floor(100000 + Math.random() * 900000));
      writeText(STORAGE.pendingResetEmail, data.email.toLowerCase());
      writeText(STORAGE.pendingResetCode, code);
      toast(`Reset code ${code} created.`);
      router.push("/reset");
    } catch (error) {
      setFormError(firstZodError(error));
    }
  }

  function handleReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    try {
      const data = resetConfirmSchema.parse(parseForm(event.currentTarget));
      const pendingEmail = readText(STORAGE.pendingResetEmail);
      const pendingCode = readText(STORAGE.pendingResetCode);
      if (pendingEmail !== data.email.toLowerCase() || pendingCode !== data.code) {
        setFormError("Reset code does not match.");
        return;
      }
      persistUsers(
        users.map((user) =>
          user.email === data.email.toLowerCase()
            ? {
                ...user,
                password: data.password
              }
            : user
        )
      );
      removeStorage(STORAGE.pendingResetEmail);
      removeStorage(STORAGE.pendingResetCode);
      toast("Password reset.");
      router.push("/login");
    } catch (error) {
      setFormError(firstZodError(error));
    }
  }

  function startCreateWallet() {
    const phrase = generateMnemonic();
    persistDraftPhrase(phrase);
    setShowBackupModal(true);
    router.push("/create-wallet");
  }

  function handleConfirmPhrase(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    if (!currentUser || !draftPhrase.length) return;
    const data = parseForm(event.currentTarget);
    const checks = [1, 5, 9];
    const valid = checks.every((index) => data[`word${index}`] === draftPhrase[index]);
    if (!valid) {
      setFormError("One or more selected words do not match.");
      return;
    }
    const wallet = createWallet(currentUser.id, "Primary Wallet", draftPhrase, "created");
    persistWallets([...wallets, wallet]);
    updateActiveWallet(wallet.id);
    removeStorage(STORAGE.draftPhrase);
    setDraftPhrase([]);
    logEvent("wallet created", `${wallet.name} added.`);
    toast("Wallet created.");
    router.push("/wallet-success");
  }

  function handleImportWallet(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    if (!currentUser) return;
    try {
      const data = importWalletSchema.parse(parseForm(event.currentTarget));
      const words = data.phrase.split(/\s+/).filter(Boolean);
      if (words.length < 12) {
        setFormError("Enter at least 12 words.");
        return;
      }
      const wallet = createWallet(currentUser.id, data.walletName || "Imported Wallet", words, "imported");
      persistWallets([...wallets, wallet]);
      updateActiveWallet(wallet.id);
      logEvent("wallet imported", `${wallet.name} added.`);
      toast("Wallet imported.");
      router.push("/wallet-success");
    } catch (error) {
      setFormError(firstZodError(error));
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

  function handleReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTransferError("");
    if (!currentUser || !activeWallet || !pendingTransfer) return;
    const password = String(new FormData(event.currentTarget).get("password") ?? "");
    if (currentUser.password !== password) {
      setTransferError("Password confirmation failed.");
      return;
    }
    const asset = assetById(pendingTransfer.assetId);
    const account = activeWallet.accounts.find((item) => item.chain === asset.chain) ?? activeWallet.accounts[0];
    const status = Math.random() > 0.08 ? "success" : "failed";
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
    const nextWallet: Wallet = {
      ...activeWallet,
      assets: activeWallet.assets.map((holding) =>
        holding.assetId === pendingTransfer.assetId && status === "success"
          ? { ...holding, balance: roundBalance(holding.balance - pendingTransfer.amount) }
          : holding
      ),
      transactions: [tx, ...activeWallet.transactions]
    };
    persistWallets(wallets.map((wallet) => (wallet.id === activeWallet.id ? nextWallet : wallet)));
    const result: TransferResult = {
      status,
      hash,
      assetId: pendingTransfer.assetId,
      amount: pendingTransfer.amount,
      createdAt: now()
    };
    persistLastTransfer(result);
    persistPendingTransfer(null);
    logEvent("transfer submitted", `${pendingTransfer.amount} ${asset.symbol} transfer ${status}.`);
    toast(status === "success" ? "Transfer submitted." : "Transfer failed.");
    router.push("/transfer-result");
  }

  function handleProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    if (!currentUser) return;
    try {
      const data = profileSchema.parse(parseForm(event.currentTarget));
      const email = data.email.toLowerCase();
      if (users.some((user) => user.email === email && user.id !== currentUser.id)) {
        setFormError("Another local account uses that email.");
        return;
      }
      persistUsers(users.map((user) => (user.id === currentUser.id ? { ...user, name: data.name, email } : user)));
      logEvent("profile updated", "Profile name or email changed.");
      toast("Profile saved.");
    } catch (error) {
      setFormError(firstZodError(error));
    }
  }

  function handlePasswordChange(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    if (!currentUser) return;
    try {
      const data = passwordSchema.parse(parseForm(event.currentTarget));
      if (data.currentPassword !== currentUser.password) {
        setFormError("Current password is incorrect.");
        return;
      }
      persistUsers(users.map((user) => (user.id === currentUser.id ? { ...user, password: data.password } : user)));
      logEvent("password changed", "Password changed from settings.");
      toast("Password changed.");
      event.currentTarget.reset();
    } catch (error) {
      setFormError(firstZodError(error));
    }
  }

  function handleRevealPhrase(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");
    if (!currentUser) return;
    try {
      const data = revealPhraseSchema.parse(parseForm(event.currentTarget));
      if (data.password !== currentUser.password) {
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
    <div className="min-h-screen wallet-grid-bg">
      <CustomCursor />
      {routeName === "landing" ? (
        <LandingPage />
      ) : isPublicRoute ? (
        <main ref={routeScope} className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.2fr_1fr] bg-[#03050c] relative overflow-hidden">
          <AuthScreens
            route={routeName}
            formError={formError}
            pendingResetEmail={readText(STORAGE.pendingResetEmail)}
            pendingResetCode={readText(STORAGE.pendingResetCode)}
            onRegister={handleRegister}
            onLogin={handleLogin}
            onForgot={handleForgot}
            onReset={handleReset}
          />
        </main>
      ) : (
        <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[252px_minmax(0,1fr)]">
          <Sidebar routeName={routeName} onAddWallet={startCreateWallet} onLogout={logout} />
          <div className="min-w-0 pb-24 lg:pb-0">
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
            <main ref={routeScope} className="mx-auto grid w-full max-w-[1440px] gap-5 px-4 pb-8 sm:px-6 lg:px-8">
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
      <div className="fixed bottom-4 right-4 z-[80] grid gap-2">
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
        />
      );
    }
    if (routeName === "review") {
      return <ReviewScreen pendingTransfer={pendingTransfer} transferError={transferError} onReview={handleReview} />;
    }
    if (routeName === "transfer-result") return <TransferResultScreen lastTransfer={lastTransfer} />;
    if (routeName === "receive") {
      return (
        <ReceiveScreen
          activeWallet={activeWallet}
          assetId={searchParams.get("asset") ?? activeWallet?.assets[0]?.assetId ?? "eth"}
          onAssetChange={(assetId) => router.push(`/receive?asset=${assetId}`)}
          onCopyText={copyText}
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
