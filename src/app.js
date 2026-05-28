(function () {
  "use strict";

  var STORAGE = {
    users: "wallax.users",
    session: "wallax.session",
    wallets: "wallax.wallets",
    events: "wallax.securityEvents",
    draftPhrase: "wallax.draftPhrase",
    pendingTransfer: "wallax.pendingTransfer",
    lastTransfer: "wallax.lastTransfer",
  };

  var ASSETS = [
    {
      id: "eth",
      name: "Ethereum",
      symbol: "ETH",
      chain: "Ethereum",
      price: 3298.42,
      color: "#627eea",
      balance: 1.8245,
    },
    {
      id: "btc",
      name: "Bitcoin",
      symbol: "BTC",
      chain: "Bitcoin",
      price: 68420.18,
      color: "#f7931a",
      balance: 0.1264,
    },
    {
      id: "matic",
      name: "Polygon",
      symbol: "MATIC",
      chain: "Polygon",
      price: 0.82,
      color: "#8247e5",
      balance: 842.2,
    },
    {
      id: "usdc",
      name: "USD Coin",
      symbol: "USDC",
      chain: "Ethereum",
      price: 1,
      color: "#2775ca",
      balance: 2400,
    },
    {
      id: "sol",
      name: "Solana",
      symbol: "SOL",
      chain: "Solana",
      price: 152.44,
      color: "#14f195",
      balance: 38.42,
    },
    {
      id: "bnb",
      name: "BNB",
      symbol: "BNB",
      chain: "BNB Smart Chain",
      price: 612.8,
      color: "#f3ba2f",
      balance: 6.18,
    },
  ];

  var WORDS = [
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
    "kitten",
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
    "zenith",
  ];

  var ROUTES = {
    public: ["", "landing", "login", "register", "forgot", "reset"],
    appNoWallet: ["wallet-setup", "create-wallet", "confirm-phrase", "import-wallet", "wallet-success"],
  };

  var state = {
    route: getRoute(),
    selectedTxId: null,
    transferError: "",
    walletLocked: false,
    revealPhrase: false,
    showBackupModal: false,
    assetSearch: "",
    historyFilters: {
      asset: "all",
      type: "all",
      status: "all",
    },
  };

  var app = document.getElementById("app");

  window.addEventListener("hashchange", function () {
    state.route = getRoute();
    state.selectedTxId = null;
    state.transferError = "";
    render();
  });

  document.addEventListener("click", function (event) {
    var target = event.target.closest("[data-action]");
    if (!target) return;
    var action = target.getAttribute("data-action");
    var id = target.getAttribute("data-id");
    var value = target.getAttribute("data-value");

    if (action === "logout") logout();
    if (action === "logout-all") logoutAll();
    if (action === "copy") copyText(value || "");
    if (action === "open-tx") {
      state.selectedTxId = id;
      render();
    }
    if (action === "close-modal") {
      state.selectedTxId = null;
      state.showBackupModal = false;
      render();
    }
    if (action === "favorite") toggleFavorite(id);
    if (action === "lock") toggleLock();
    if (action === "accept-backup") {
      state.showBackupModal = false;
      render();
    }
    if (action === "new-wallet") {
      removeStorage(STORAGE.draftPhrase);
      state.showBackupModal = true;
      navigate("create-wallet");
      render();
    }
    if (action === "regenerate-phrase") {
      removeStorage(STORAGE.draftPhrase);
      render();
    }
  });

  document.addEventListener("submit", function (event) {
    var form = event.target;
    if (!form.matches("[data-form]")) return;
    event.preventDefault();
    var name = form.getAttribute("data-form");
    var data = formData(form);

    if (name === "register") handleRegister(form, data);
    if (name === "login") handleLogin(form, data);
    if (name === "forgot") handleForgot(form, data);
    if (name === "reset") handleReset(form, data);
    if (name === "confirm-phrase") handlePhraseConfirm(form, data);
    if (name === "import-wallet") handleImportWallet(form, data);
    if (name === "send") handleSend(form, data);
    if (name === "review") handleReview(form, data);
    if (name === "profile") handleProfile(form, data);
    if (name === "password") handlePasswordChange(form, data);
    if (name === "reveal-phrase") handleRevealPhrase(form, data);
  });

  document.addEventListener("change", function (event) {
    var target = event.target;
    if (target.matches("[data-wallet-select]")) {
      setActiveWallet(target.value);
      render();
    }
    if (target.matches("[data-asset-route]")) {
      navigate(target.getAttribute("data-asset-route") + "?asset=" + target.value);
    }
    if (target.matches("[data-filter]")) {
      state.historyFilters[target.name] = target.value;
      render();
    }
  });

  document.addEventListener("input", function (event) {
    if (event.target.matches("[data-asset-search]")) {
      state.assetSearch = event.target.value;
      render();
      focusAssetSearch();
    }
  });

  seedDemoAccount();
  render();

  function render() {
    var session = getSession();
    var route = normalizeRoute(state.route.name);
    var isPublic = ROUTES.public.indexOf(route) >= 0;

    if (!session && !isPublic) {
      navigate("login");
      return;
    }

    if (session && isPublic && route !== "reset" && route !== "forgot") {
      var firstWallet = getActiveWallet();
      navigate(firstWallet ? "dashboard" : "wallet-setup");
      return;
    }

    if (session && !isPublic) {
      var wallet = getActiveWallet();
      var allowedNoWallet = ROUTES.appNoWallet.indexOf(route) >= 0;
      if (!wallet && !allowedNoWallet) {
        navigate("wallet-setup");
        return;
      }
    }

    if (isPublic) {
      app.innerHTML = renderAuth(route);
      return;
    }

    app.innerHTML = renderShell(route);
    if (state.selectedTxId) {
      app.insertAdjacentHTML("beforeend", renderTransactionModal(state.selectedTxId));
    }
    if (state.showBackupModal && route === "create-wallet") {
      app.insertAdjacentHTML("beforeend", renderBackupModal());
    }
  }

  function renderAuth(route) {
    var content = "";
    if (route === "" || route === "landing") content = renderLanding();
    if (route === "login") content = renderLogin();
    if (route === "register") content = renderRegister();
    if (route === "forgot") content = renderForgot();
    if (route === "reset") content = renderReset();

    return (
      '<main class="auth-shell">' +
      '<section class="splash-panel">' +
      '<div class="brand"><div class="brand-mark">W</div><div class="brand-text"><strong>Wallax</strong><span>self-custody wallet MVP</span></div></div>' +
      '<div class="splash-copy"><h1>Wallet flows without real custody risk.</h1><p>Create, import, review, send, receive, and inspect wallet activity in a safe mock environment built for product validation.</p>' +
      '<div class="splash-stats"><div class="stat-pill"><strong>6</strong><span>demo assets</span></div><div class="stat-pill"><strong>12</strong><span>word phrase flow</span></div><div class="stat-pill"><strong>Mock</strong><span>signing layer</span></div></div></div>' +
      '<p class="muted">Prototype mode. No blockchain transactions are broadcast.</p>' +
      '</section>' +
      '<section class="auth-card">' +
      content +
      "</section></main>"
    );
  }

  function renderLanding() {
    return (
      '<div class="auth-form">' +
      "<h2>Open Wallax</h2>" +
      '<p>Use the demo account or create your own local prototype account.</p>' +
      '<div class="button-row"><a class="btn btn-primary" href="#/login">Login</a><a class="btn btn-secondary" href="#/register">Register</a></div>' +
      '<p class="mini">Demo: demo@wallax.local / password123</p>' +
      "</div>"
    );
  }

  function renderRegister() {
    return (
      '<form class="auth-form form-grid" data-form="register">' +
      "<h2>Create account</h2><p>Register a local MVP account.</p>" +
      field("name", "Name", "text", "Ada Builder", true) +
      field("email", "Email", "email", "you@example.com", true) +
      field("password", "Password", "password", "At least 8 characters", true) +
      field("confirmPassword", "Confirm password", "password", "Repeat password", true) +
      '<div class="error-text" data-error></div>' +
      '<button class="btn btn-primary" type="submit">Register</button>' +
      '<p class="mini">Already have an account? <a href="#/login">Login</a></p>' +
      "</form>"
    );
  }

  function renderLogin() {
    return (
      '<form class="auth-form form-grid" data-form="login">' +
      "<h2>Login</h2><p>Access your wallet workspace.</p>" +
      field("email", "Email", "email", "demo@wallax.local", true) +
      field("password", "Password", "password", "password123", true) +
      '<div class="error-text" data-error></div>' +
      '<button class="btn btn-primary" type="submit">Login</button>' +
      '<div class="button-row"><a class="btn btn-ghost" href="#/forgot">Forgot password</a><a class="btn btn-ghost" href="#/register">Register</a></div>' +
      '<p class="mini">Demo: demo@wallax.local / password123</p>' +
      "</form>"
    );
  }

  function renderForgot() {
    return (
      '<form class="auth-form form-grid" data-form="forgot">' +
      "<h2>Reset password</h2><p>Enter your email to create a local reset code.</p>" +
      field("email", "Email", "email", "you@example.com", true) +
      '<div class="error-text" data-error></div>' +
      '<button class="btn btn-primary" type="submit">Send reset code</button>' +
      '<a class="btn btn-ghost" href="#/login">Back to login</a>' +
      "</form>"
    );
  }

  function renderReset() {
    var email = localStorage.getItem("wallax.pendingResetEmail") || "";
    var code = localStorage.getItem("wallax.pendingResetCode") || "";
    return (
      '<form class="auth-form form-grid" data-form="reset">' +
      "<h2>Choose new password</h2><p>Prototype reset code: " +
      escapeHtml(code || "request one first") +
      "</p>" +
      field("email", "Email", "email", "you@example.com", true, email) +
      field("code", "Reset code", "text", "6 digits", true) +
      field("password", "New password", "password", "At least 8 characters", true) +
      field("confirmPassword", "Confirm new password", "password", "Repeat password", true) +
      '<div class="error-text" data-error></div>' +
      '<button class="btn btn-primary" type="submit">Reset password</button>' +
      "</form>"
    );
  }

  function renderShell(route) {
    var title = pageTitle(route);
    return (
      '<div class="app-shell">' +
      renderSidebar(route) +
      '<main class="main-area">' +
      renderTopbar(title) +
      renderRoute(route) +
      "</main>" +
      renderMobileNav(route) +
      "</div>"
    );
  }

  function renderSidebar(route) {
    return (
      '<aside class="sidebar">' +
      '<div class="brand"><div class="brand-mark">W</div><div class="brand-text"><strong>Wallax</strong><span>prototype wallet</span></div></div>' +
      '<nav class="nav">' +
      navLink("dashboard", "Dashboard", icon("dashboard"), route) +
      navLink("assets", "Assets", icon("assets"), route) +
      navLink("send", "Send", icon("send"), route) +
      navLink("receive", "Receive", icon("receive"), route) +
      navLink("history", "History", icon("history"), route) +
      navLink("settings", "Settings", icon("settings"), route) +
      "</nav>" +
      '<div class="sidebar-footer">' +
      '<button class="btn btn-secondary" data-action="new-wallet">' +
      icon("plus") +
      " Add Wallet</button>" +
      '<button class="btn btn-ghost" data-action="logout">' +
      icon("logout") +
      " Logout</button>" +
      "</div></aside>"
    );
  }

  function renderMobileNav(route) {
    return (
      '<nav class="mobile-nav">' +
      navLink("dashboard", "Home", icon("dashboard"), route) +
      navLink("assets", "Assets", icon("assets"), route) +
      navLink("send", "Send", icon("send"), route) +
      navLink("receive", "Receive", icon("receive"), route) +
      navLink("history", "History", icon("history"), route) +
      "</nav>"
    );
  }

  function renderTopbar(title) {
    var user = getCurrentUser();
    var wallets = getUserWallets();
    var wallet = getActiveWallet();
    var walletSelect = wallets.length
      ? '<select data-wallet-select title="Wallet selector">' +
        wallets
          .map(function (item) {
            return (
              '<option value="' +
              item.id +
              '"' +
              (wallet && wallet.id === item.id ? " selected" : "") +
              ">" +
              escapeHtml(item.name) +
              "</option>"
            );
          })
          .join("") +
        "</select>"
      : "";

    return (
      '<header class="topbar">' +
      '<div class="topbar-title"><h1>' +
      escapeHtml(title) +
      "</h1><p>" +
      escapeHtml(user ? user.name : "") +
      "</p></div>" +
      '<div class="topbar-actions">' +
      walletSelect +
      '<button class="icon-btn" title="Lock wallet" data-action="lock">' +
      icon(state.walletLocked ? "lock" : "unlock") +
      "</button>" +
      '<a class="icon-btn" title="Profile" href="#/profile">' +
      icon("user") +
      "</a>" +
      "</div></header>"
    );
  }

  function renderRoute(route) {
    if (route === "wallet-setup") return renderWalletSetup();
    if (route === "create-wallet") return renderCreateWallet();
    if (route === "confirm-phrase") return renderConfirmPhrase();
    if (route === "import-wallet") return renderImportWallet();
    if (route === "wallet-success") return renderWalletSuccess();
    if (route === "dashboard") return renderDashboard();
    if (route === "assets") return renderAssetsPage();
    if (route === "asset") return renderAssetDetail(state.route.parts[1]);
    if (route === "send") return renderSend();
    if (route === "review") return renderReview();
    if (route === "transfer-result") return renderTransferResult();
    if (route === "receive") return renderReceive();
    if (route === "history") return renderHistory();
    if (route === "settings") return renderSettings();
    if (route === "security") return renderSecurity();
    if (route === "profile") return renderProfile();
    return renderDashboard();
  }

  function renderWalletSetup() {
    return (
      '<section class="grid grid-2">' +
      '<article class="panel"><div class="panel-header"><h2>Create Wallet</h2>' +
      icon("shield") +
      '</div><p class="panel-subtitle">Generate a new 12-word recovery phrase and confirm selected words before using the wallet.</p><button class="btn btn-primary" data-action="new-wallet">Create Wallet</button></article>' +
      '<article class="panel"><div class="panel-header"><h2>Import Wallet</h2>' +
      icon("import") +
      '</div><p class="panel-subtitle">Use an existing recovery phrase to create a local mock wallet profile.</p><a class="btn btn-secondary" href="#/import-wallet">Import Wallet</a></article>' +
      '<article class="empty-state"><h3>No wallet yet</h3><p class="muted">Dashboard, assets, send, receive, and history unlock after wallet setup.</p></article>' +
      "</section>"
    );
  }

  function renderCreateWallet() {
    var phrase = getDraftPhrase();
    return (
      '<section class="grid">' +
      '<div class="warning"><strong>Never share your recovery phrase.</strong> Anyone with these words can control the wallet in a real self-custody system.</div>' +
      '<article class="panel"><div class="panel-header"><div><h2>Recovery phrase</h2><p class="panel-subtitle">Write these 12 words down in order.</p></div><a class="btn btn-secondary btn-small" href="#/confirm-phrase">Continue</a></div>' +
      '<div class="word-grid">' +
      phrase
        .map(function (word, index) {
          return '<div class="word-chip"><span>' + (index + 1) + "</span>" + escapeHtml(word) + "</div>";
        })
        .join("") +
      "</div></article>" +
      '<div class="button-row"><a class="btn btn-primary" href="#/confirm-phrase">Confirm Phrase</a><button class="btn btn-secondary" data-action="regenerate-phrase">Regenerate</button></div>' +
      "</section>"
    );
  }

  function renderConfirmPhrase() {
    var phrase = getDraftPhrase();
    var indices = [1, 5, 9];
    return (
      '<form class="grid" data-form="confirm-phrase">' +
      '<article class="panel"><div class="panel-header"><div><h2>Confirm recovery phrase</h2><p class="panel-subtitle">Select the words that match the requested positions.</p></div></div>' +
      '<div class="grid grid-3">' +
      indices
        .map(function (index) {
          return (
            '<div class="field"><label>Word #' +
            (index + 1) +
            '</label><select name="word' +
            index +
            '" required><option value="">Choose word</option>' +
            shuffledOptions(phrase, phrase[index]) +
            "</select></div>"
          );
        })
        .join("") +
      '</div><div class="error-text" data-error></div></article>' +
      '<div class="button-row"><button class="btn btn-primary" type="submit">Create Wallet</button><a class="btn btn-secondary" href="#/create-wallet">Back</a></div>' +
      "</form>"
    );
  }

  function renderImportWallet() {
    return (
      '<form class="grid" data-form="import-wallet">' +
      '<div class="danger-note"><strong>Never paste a real recovery phrase into this prototype.</strong> Use demo words only.</div>' +
      '<article class="panel form-grid"><h2>Import Wallet</h2><p class="panel-subtitle">Enter at least 12 words separated by spaces.</p>' +
      '<div class="field"><label>Recovery phrase</label><textarea name="phrase" placeholder="anchor bridge canyon dawn ember fabric globe harbor island jungle kernel lantern" required></textarea></div>' +
      field("walletName", "Wallet name", "text", "Imported Wallet", false) +
      '<div class="error-text" data-error></div>' +
      '</article><div class="button-row"><button class="btn btn-primary" type="submit">Import Wallet</button><a class="btn btn-secondary" href="#/wallet-setup">Cancel</a></div></form>'
    );
  }

  function renderWalletSuccess() {
    return (
      '<section class="empty-state"><h3>Wallet ready</h3><p class="muted">Your mock wallet is set up with demo balances and transaction history.</p><div class="button-row"><a class="btn btn-primary" href="#/dashboard">Open Dashboard</a><a class="btn btn-secondary" href="#/receive">Receive</a></div></section>'
    );
  }

  function renderDashboard() {
    var wallet = getActiveWallet();
    if (!wallet) return renderWalletSetup();
    var total = portfolioValue(wallet);
    var txs = wallet.transactions.slice(0, 4);
    return (
      '<section class="dashboard-grid">' +
      '<div class="grid">' +
      '<article class="balance-card"><span>Total portfolio balance</span><strong>' +
      money(total) +
      '</strong><p>Mock balances across ' +
      wallet.assets.length +
      " assets.</p></article>" +
      '<div class="quick-actions">' +
      quickAction("send", "Send", icon("send")) +
      quickAction("receive", "Receive", icon("receive")) +
      '<button class="quick-action" data-action="new-wallet">' +
      icon("plus") +
      "<span>Add Wallet</span></button>" +
      quickAction("history", "History", icon("history")) +
      "</div>" +
      '<article class="panel"><div class="panel-header"><h2>Supported assets</h2><a class="btn btn-ghost btn-small" href="#/assets">View all</a></div>' +
      renderAssetList(wallet.assets.slice(0, 5)) +
      "</article></div>" +
      '<div class="grid"><article class="panel"><div class="panel-header"><h2>Wallet accounts</h2><span class="badge success">active</span></div>' +
      renderAccountList(wallet) +
      '</article><article class="panel"><div class="panel-header"><h2>Recent transactions</h2><a class="btn btn-ghost btn-small" href="#/history">View all</a></div>' +
      renderTxList(txs) +
      "</article></div></section>"
    );
  }

  function renderAssetsPage() {
    var wallet = getActiveWallet();
    var search = state.assetSearch.toLowerCase().trim();
    var assets = wallet.assets.filter(function (holding) {
      var asset = assetById(holding.assetId);
      return !search || asset.name.toLowerCase().indexOf(search) >= 0 || asset.symbol.toLowerCase().indexOf(search) >= 0;
    });

    return (
      '<section class="grid">' +
      '<div class="section-head"><div><h2>Assets</h2><p>Search, inspect, and favorite demo assets.</p></div><input class="search-input" data-asset-search placeholder="Search assets" value="' +
      escapeHtml(search) +
      '"></div>' +
      (assets.length ? renderAssetList(assets) : '<div class="empty-state"><h3>No assets found</h3><p class="muted">Try a different symbol or asset name.</p></div>') +
      "</section>"
    );
  }

  function renderAssetDetail(assetId) {
    var wallet = getActiveWallet();
    var holding = wallet.assets.find(function (item) {
      return item.assetId === assetId;
    });
    if (!holding) return '<div class="empty-state"><h3>Asset not found</h3><a class="btn btn-primary" href="#/assets">Back to assets</a></div>';
    var asset = assetById(assetId);
    var txs = wallet.transactions.filter(function (tx) {
      return tx.assetId === assetId;
    });
    return (
      '<section class="grid">' +
      '<article class="panel"><div class="asset-card"><div class="asset-main">' +
      assetIcon(asset) +
      '<div class="asset-copy"><strong>' +
      escapeHtml(asset.name) +
      '</strong><span>' +
      escapeHtml(asset.chain) +
      '</span></div></div><div class="asset-values"><strong>' +
      formatAmount(holding.balance) +
      " " +
      asset.symbol +
      "</strong><span>" +
      money(holding.balance * asset.price) +
      '</span></div></div><div class="button-row"><a class="btn btn-primary" href="#/send?asset=' +
      asset.id +
      '">Send</a><a class="btn btn-secondary" href="#/receive?asset=' +
      asset.id +
      '">Receive</a><button class="btn btn-secondary" data-action="favorite" data-id="' +
      asset.id +
      '">' +
      (holding.favorite ? "Remove Favorite" : "Favorite") +
      "</button></div></article>" +
      '<article class="panel"><div class="panel-header"><h2>Recent transactions</h2><span class="badge">' +
      txs.length +
      " total</span></div>" +
      renderTxList(txs) +
      "</article></section>"
    );
  }

  function renderSend() {
    var wallet = getActiveWallet();
    var requestedAsset = getQuery().asset;
    var activeAsset = requestedAsset || wallet.assets[0].assetId;
    return (
      '<form class="grid" data-form="send">' +
      '<article class="panel form-grid"><h2>Send asset</h2>' +
      assetSelect(wallet, "assetId", activeAsset, "send") +
      field("recipient", "Recipient address", "text", "0x...", true) +
      field("amount", "Amount", "number", "0.00", true) +
      '<div class="field"><label>Network fee</label><input name="fee" value="' +
      estimateFee(activeAsset) +
      '" readonly></div>' +
      '<div class="error-text" data-error></div>' +
      "</article>" +
      '<div class="button-row"><button class="btn btn-primary" type="submit">Review Transaction</button><a class="btn btn-secondary" href="#/dashboard">Cancel</a></div>' +
      "</form>"
    );
  }

  function renderReview() {
    var pending = readJson(STORAGE.pendingTransfer, null);
    if (!pending) {
      return '<div class="empty-state"><h3>No transfer to review</h3><a class="btn btn-primary" href="#/send">Start send flow</a></div>';
    }
    var asset = assetById(pending.assetId);
    return (
      '<form class="grid" data-form="review">' +
      '<article class="panel"><div class="panel-header"><h2>Review transaction</h2><span class="badge pending">unsigned</span></div>' +
      detailRow("Asset", asset.name + " (" + asset.symbol + ")") +
      detailRow("Recipient", pending.recipient, true) +
      detailRow("Amount", pending.amount + " " + asset.symbol) +
      detailRow("Estimated fee", pending.fee) +
      detailRow("Network", asset.chain) +
      '</article><article class="panel form-grid"><h2>Password confirmation</h2>' +
      field("password", "Password", "password", "Confirm local account password", true) +
      '<div class="error-text" data-error>' +
      escapeHtml(state.transferError) +
      "</div></article>" +
      '<div class="button-row"><button class="btn btn-primary" type="submit">Submit Transfer</button><a class="btn btn-secondary" href="#/send">Edit</a></div>' +
      "</form>"
    );
  }

  function renderTransferResult() {
    var result = readJson(STORAGE.lastTransfer, null);
    if (!result) return '<div class="empty-state"><h3>No transfer result</h3><a class="btn btn-primary" href="#/send">Send asset</a></div>';
    return (
      '<section class="empty-state"><span class="badge ' +
      result.status +
      '">' +
      result.status +
      "</span><h3>" +
      (result.status === "success" ? "Transfer submitted" : "Transfer failed") +
      '</h3><p class="muted">Transaction hash: ' +
      escapeHtml(result.hash) +
      '</p><div class="button-row"><a class="btn btn-primary" href="#/history">View History</a><a class="btn btn-secondary" href="#/dashboard">Dashboard</a></div></section>'
    );
  }

  function renderReceive() {
    var wallet = getActiveWallet();
    var assetId = getQuery().asset || wallet.assets[0].assetId;
    var asset = assetById(assetId);
    var account = wallet.accounts.find(function (item) {
      return item.chain === asset.chain;
    }) || wallet.accounts[0];
    return (
      '<section class="grid grid-2">' +
      '<article class="panel form-grid"><h2>Receive</h2>' +
      assetSelect(wallet, "assetId", assetId, "receive") +
      '<div class="copy-box"><code>' +
      escapeHtml(account.address) +
      '</code><button class="btn btn-secondary btn-small" data-action="copy" data-value="' +
      escapeHtml(account.address) +
      '">Copy</button></div>' +
      '<div class="button-row"><button class="btn btn-secondary" data-action="copy" data-value="' +
      escapeHtml(account.address) +
      '">Share</button></div></article>' +
      '<article class="panel"><div class="panel-header"><h2>QR code</h2><span class="badge">' +
      escapeHtml(asset.chain) +
      '</span></div><div class="qr">' +
      qrCells(account.address) +
      "</div></article></section>"
    );
  }

  function renderHistory() {
    var wallet = getActiveWallet();
    var assetFilter = state.historyFilters.asset || "all";
    var typeFilter = state.historyFilters.type || "all";
    var statusFilter = state.historyFilters.status || "all";
    var txs = wallet.transactions.filter(function (tx) {
      return (
        (assetFilter === "all" || tx.assetId === assetFilter) &&
        (typeFilter === "all" || tx.type === typeFilter) &&
        (statusFilter === "all" || tx.status === statusFilter)
      );
    });

    return (
      '<section class="grid">' +
      '<div class="section-head"><div><h2>Transfer history</h2><p>Filter incoming and outgoing mock transfers.</p></div></div>' +
      '<div class="filters">' +
      filterSelect("asset", "Asset", [["all", "All assets"]].concat(ASSETS.map(function (a) { return [a.id, a.symbol]; })), assetFilter) +
      filterSelect("type", "Type", [["all", "All types"], ["incoming", "Incoming"], ["outgoing", "Outgoing"]], typeFilter) +
      filterSelect("status", "Status", [["all", "All statuses"], ["success", "Success"], ["pending", "Pending"], ["failed", "Failed"]], statusFilter) +
      "</div>" +
      (txs.length ? renderTxList(txs) : '<div class="empty-state"><h3>No transactions</h3><p class="muted">Transfers matching these filters will appear here.</p></div>') +
      "</section>"
    );
  }

  function renderSettings() {
    return (
      '<section class="grid grid-2">' +
      '<article class="panel"><div class="panel-header"><h2>Security</h2><span class="badge">' +
      (state.walletLocked ? "locked" : "unlocked") +
      '</span></div><div class="settings-list">' +
      settingsRow("Profile settings", "Name, email, and local profile data.", "#/profile") +
      settingsRow("Security activity", "Audit log placeholder for sensitive events.", "#/security") +
      settingsRow("Reveal recovery phrase", "Requires password confirmation below.", "#/settings") +
      '</div></article>' +
      '<article class="panel form-grid"><h2>Reveal recovery phrase</h2><p class="panel-subtitle">Prototype-only display behind password confirmation.</p>' +
      '<form class="form-grid" data-form="reveal-phrase">' +
      field("password", "Password", "password", "Confirm password", true) +
      '<div class="error-text" data-error></div><button class="btn btn-secondary" type="submit">Reveal</button></form>' +
      (state.revealPhrase ? '<div class="word-grid">' + getActiveWallet().phrase.map(function (word, index) { return '<div class="word-chip"><span>' + (index + 1) + "</span>" + escapeHtml(word) + "</div>"; }).join("") + "</div>" : "") +
      '</article><article class="panel"><div class="panel-header"><h2>Sessions</h2><span class="badge pending">placeholder</span></div><div class="settings-list">' +
      '<div class="settings-row"><div class="settings-main">' + icon("device") + '<div class="settings-copy"><strong>Current browser</strong><span>Local session storage</span></div></div><span class="badge success">active</span></div>' +
      '<div class="settings-row"><div class="settings-main">' + icon("shield") + '<div class="settings-copy"><strong>2FA and WebAuthn</strong><span>Future enhancement</span></div></div><span class="badge pending">planned</span></div>' +
      '</div><div class="button-row"><button class="btn btn-secondary" data-action="lock">Toggle Lock</button><button class="btn btn-danger" data-action="logout-all">Logout All</button></div></article>' +
      '<article class="panel form-grid"><h2>Change password</h2><form class="form-grid" data-form="password">' +
      field("currentPassword", "Current password", "password", "Current password", true) +
      field("password", "New password", "password", "At least 8 characters", true) +
      field("confirmPassword", "Confirm new password", "password", "Repeat password", true) +
      '<div class="error-text" data-error></div><button class="btn btn-primary" type="submit">Change Password</button></form></article>' +
      "</section>"
    );
  }

  function renderSecurity() {
    var events = getEvents();
    return (
      '<section class="grid">' +
      '<div class="section-head"><div><h2>Security activity</h2><p>Audit event placeholders for account and wallet actions.</p></div></div>' +
      '<article class="panel">' +
      (events.length
        ? events
            .slice()
            .reverse()
            .map(function (event) {
              return '<div class="tx-row"><div class="tx-main">' + icon("shield") + '<div class="tx-copy"><strong>' + escapeHtml(event.type) + '</strong><span>' + escapeHtml(event.detail) + '</span></div></div><div class="tx-values"><span>' + formatDate(event.createdAt) + '</span></div></div>';
            })
            .join("")
        : '<div class="empty-state"><h3>No events yet</h3><p class="muted">Logins, wallet creation, and phrase reveal events appear here.</p></div>') +
      "</article></section>"
    );
  }

  function renderProfile() {
    var user = getCurrentUser();
    return (
      '<form class="grid" data-form="profile">' +
      '<article class="panel form-grid"><h2>Profile</h2>' +
      field("name", "Name", "text", "Your name", true, user.name) +
      field("email", "Email", "email", "you@example.com", true, user.email) +
      '<div class="field"><label>Email verification</label><input value="Placeholder: unverified" readonly></div>' +
      '<div class="error-text" data-error></div></article>' +
      '<div class="button-row"><button class="btn btn-primary" type="submit">Save Profile</button><a class="btn btn-secondary" href="#/settings">Settings</a></div></form>'
    );
  }

  function renderAssetList(holdings) {
    if (!holdings.length) return '<div class="empty-state"><h3>No assets</h3><p class="muted">Demo holdings will appear after wallet setup.</p></div>';
    return (
      '<div class="asset-list">' +
      holdings
        .map(function (holding) {
          var asset = assetById(holding.assetId);
          return (
            '<a class="asset-card" href="#/asset/' +
            asset.id +
            '"><div class="asset-main">' +
            assetIcon(asset) +
            '<div class="asset-copy"><strong>' +
            escapeHtml(asset.name) +
            (holding.favorite ? " *" : "") +
            '</strong><span>' +
            escapeHtml(asset.symbol + " on " + asset.chain) +
            '</span></div></div><div class="asset-values"><strong>' +
            formatAmount(holding.balance) +
            " " +
            asset.symbol +
            "</strong><span>" +
            money(holding.balance * asset.price) +
            "</span></div></a>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function renderTxList(txs) {
    if (!txs.length) return '<div class="empty-state"><h3>No transactions</h3><p class="muted">Mock sends and receives appear here.</p></div>';
    return (
      '<div class="tx-list">' +
      txs
        .map(function (tx) {
          var asset = assetById(tx.assetId);
          return (
            '<button class="tx-row" data-action="open-tx" data-id="' +
            tx.id +
            '"><div class="tx-main">' +
            assetIcon(asset) +
            '<div class="tx-copy"><strong>' +
            capitalize(tx.type) +
            " " +
            asset.symbol +
            '</strong><span>' +
            formatDate(tx.createdAt) +
            '</span></div></div><div class="tx-values"><strong>' +
            (tx.type === "incoming" ? "+" : "-") +
            formatAmount(tx.amount) +
            " " +
            asset.symbol +
            '</strong><span class="badge ' +
            tx.status +
            '">' +
            tx.status +
            "</span></div></button>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function renderAccountList(wallet) {
    return (
      '<div class="account-list">' +
      wallet.accounts
        .map(function (account) {
          return (
            '<div class="account-row"><div class="account-main">' +
            icon("wallet") +
            '<div class="account-copy"><strong>' +
            escapeHtml(account.chain) +
            '</strong><span>' +
            escapeHtml(shortAddress(account.address)) +
            '</span></div></div><button class="btn btn-secondary btn-small" data-action="copy" data-value="' +
            escapeHtml(account.address) +
            '">Copy</button></div>'
          );
        })
        .join("") +
      "</div>"
    );
  }

  function renderTransactionModal(txId) {
    var wallet = getActiveWallet();
    var tx = wallet.transactions.find(function (item) {
      return item.id === txId;
    });
    if (!tx) return "";
    var asset = assetById(tx.assetId);
    return (
      '<div class="modal-backdrop"><article class="modal"><div class="panel-header"><h2>Transaction details</h2><button class="icon-btn" data-action="close-modal" title="Close">' +
      icon("close") +
      "</button></div>" +
      '<div class="detail-grid">' +
      detailRow("Status", tx.status) +
      detailRow("Type", tx.type) +
      detailRow("Asset", asset.name + " (" + asset.symbol + ")") +
      detailRow("Amount", formatAmount(tx.amount) + " " + asset.symbol) +
      detailRow("From", tx.from, true) +
      detailRow("To", tx.to, true) +
      detailRow("Fee", tx.fee) +
      detailRow("Hash", tx.hash, true) +
      detailRow("Date", formatDate(tx.createdAt)) +
      "</div></article></div>"
    );
  }

  function renderBackupModal() {
    return (
      '<div class="modal-backdrop"><article class="modal"><h2>Backup warning</h2><p>This prototype displays a mock recovery phrase. In a real wallet, store it offline and never share it with anyone.</p><div class="danger-note">Never share your recovery phrase. Wallax support will never ask for it.</div><div class="button-row" style="margin-top:14px"><button class="btn btn-primary" data-action="accept-backup">I understand</button><a class="btn btn-secondary" href="#/wallet-setup">Cancel</a></div></article></div>'
    );
  }

  function handleRegister(form, data) {
    clearError(form);
    if (data.password.length < 8) return setError(form, "Password must be at least 8 characters.");
    if (data.password !== data.confirmPassword) return setError(form, "Passwords do not match.");
    var users = getUsers();
    if (users.some(function (u) { return u.email.toLowerCase() === data.email.toLowerCase(); })) {
      return setError(form, "Email is already registered.");
    }
    var user = {
      id: uid("user"),
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      password: data.password,
      emailVerified: false,
      createdAt: now(),
    };
    users.push(user);
    saveUsers(users);
    setSession({ userId: user.id, createdAt: now() });
    addEvent(user.id, "register", "Account registered in prototype mode.");
    toast("Account created.");
    navigate("wallet-setup");
  }

  function handleLogin(form, data) {
    clearError(form);
    var user = getUsers().find(function (u) {
      return u.email.toLowerCase() === data.email.toLowerCase() && u.password === data.password;
    });
    if (!user) return setError(form, "Invalid email or password.");
    setSession({ userId: user.id, createdAt: now() });
    addEvent(user.id, "login", "Successful local login.");
    toast("Logged in.");
    navigate(getUserWallets(user.id).length ? "dashboard" : "wallet-setup");
  }

  function handleForgot(form, data) {
    clearError(form);
    var user = getUsers().find(function (u) { return u.email.toLowerCase() === data.email.toLowerCase(); });
    if (!user) return setError(form, "No account found for that email.");
    var code = String(Math.floor(100000 + Math.random() * 900000));
    localStorage.setItem("wallax.pendingResetEmail", user.email);
    localStorage.setItem("wallax.pendingResetCode", code);
    addEvent(user.id, "password reset requested", "Prototype reset code generated.");
    navigate("reset");
  }

  function handleReset(form, data) {
    clearError(form);
    var code = localStorage.getItem("wallax.pendingResetCode");
    var email = localStorage.getItem("wallax.pendingResetEmail");
    if (data.email.toLowerCase() !== (email || "").toLowerCase() || data.code !== code) {
      return setError(form, "Reset code does not match.");
    }
    if (data.password.length < 8) return setError(form, "Password must be at least 8 characters.");
    if (data.password !== data.confirmPassword) return setError(form, "Passwords do not match.");
    var users = getUsers();
    var user = users.find(function (u) { return u.email.toLowerCase() === data.email.toLowerCase(); });
    if (!user) return setError(form, "Account not found.");
    user.password = data.password;
    saveUsers(users);
    addEvent(user.id, "password reset", "Password changed through reset flow.");
    localStorage.removeItem("wallax.pendingResetCode");
    localStorage.removeItem("wallax.pendingResetEmail");
    toast("Password reset.");
    navigate("login");
  }

  function handlePhraseConfirm(form, data) {
    clearError(form);
    var phrase = getDraftPhrase();
    var indices = [1, 5, 9];
    var valid = indices.every(function (index) {
      return data["word" + index] === phrase[index];
    });
    if (!valid) return setError(form, "Selected words do not match the phrase.");
    var wallet = createWallet("Primary Wallet", phrase, "created");
    removeStorage(STORAGE.draftPhrase);
    setActiveWallet(wallet.id);
    toast("Wallet created.");
    navigate("wallet-success");
  }

  function handleImportWallet(form, data) {
    clearError(form);
    var words = data.phrase.toLowerCase().trim().split(/\s+/).filter(Boolean);
    if (words.length < 12) return setError(form, "Enter at least 12 words.");
    var wallet = createWallet(data.walletName || "Imported Wallet", words.slice(0, 12), "imported");
    setActiveWallet(wallet.id);
    toast("Wallet imported.");
    navigate("wallet-success");
  }

  function handleSend(form, data) {
    clearError(form);
    var wallet = getActiveWallet();
    var holding = wallet.assets.find(function (item) { return item.assetId === data.assetId; });
    var amount = Number(data.amount);
    if (!holding) return setError(form, "Select an asset.");
    if (!data.recipient || data.recipient.length < 12) return setError(form, "Enter a valid recipient address.");
    if (!amount || amount <= 0) return setError(form, "Enter an amount greater than zero.");
    if (amount > holding.balance) return setError(form, "Amount exceeds available balance.");
    writeJson(STORAGE.pendingTransfer, {
      walletId: wallet.id,
      assetId: data.assetId,
      recipient: data.recipient.trim(),
      amount: amount,
      fee: data.fee || estimateFee(data.assetId),
      createdAt: now(),
    });
    navigate("review");
  }

  function handleReview(form, data) {
    clearError(form);
    state.transferError = "";
    var user = getCurrentUser();
    if (!user || user.password !== data.password) {
      state.transferError = "Password confirmation failed.";
      return render();
    }
    var pending = readJson(STORAGE.pendingTransfer, null);
    if (!pending) return navigate("send");
    var wallet = getActiveWallet();
    var holding = wallet.assets.find(function (item) { return item.assetId === pending.assetId; });
    var status = pending.recipient.toLowerCase().indexOf("fail") >= 0 ? "failed" : "success";
    var account = wallet.accounts.find(function (item) { return item.chain === assetById(pending.assetId).chain; }) || wallet.accounts[0];
    var tx = {
      id: uid("tx"),
      assetId: pending.assetId,
      type: "outgoing",
      status: status,
      amount: pending.amount,
      fee: pending.fee,
      from: account.address,
      to: pending.recipient,
      hash: fakeHash(),
      createdAt: now(),
    };
    if (status === "success") holding.balance = roundBalance(holding.balance - pending.amount);
    wallet.transactions.unshift(tx);
    updateWallet(wallet);
    writeJson(STORAGE.lastTransfer, { status: status, hash: tx.hash });
    removeStorage(STORAGE.pendingTransfer);
    addEvent(user.id, "transaction submitted", status + " mock transfer for " + pending.amount + " " + assetById(pending.assetId).symbol + ".");
    navigate("transfer-result");
  }

  function handleProfile(form, data) {
    clearError(form);
    var users = getUsers();
    var current = getCurrentUser();
    var duplicate = users.some(function (u) {
      return u.id !== current.id && u.email.toLowerCase() === data.email.toLowerCase();
    });
    if (duplicate) return setError(form, "Email is already in use.");
    current.name = data.name.trim();
    current.email = data.email.trim().toLowerCase();
    saveUsers(users.map(function (u) { return u.id === current.id ? current : u; }));
    addEvent(current.id, "profile updated", "Profile information changed.");
    toast("Profile saved.");
    render();
  }

  function handlePasswordChange(form, data) {
    clearError(form);
    var users = getUsers();
    var current = getCurrentUser();
    if (current.password !== data.currentPassword) return setError(form, "Current password is incorrect.");
    if (data.password.length < 8) return setError(form, "Password must be at least 8 characters.");
    if (data.password !== data.confirmPassword) return setError(form, "Passwords do not match.");
    current.password = data.password;
    saveUsers(users.map(function (u) { return u.id === current.id ? current : u; }));
    addEvent(current.id, "password changed", "Password changed from settings.");
    toast("Password changed.");
    form.reset();
  }

  function handleRevealPhrase(form, data) {
    clearError(form);
    var user = getCurrentUser();
    if (user.password !== data.password) return setError(form, "Password confirmation failed.");
    state.revealPhrase = true;
    addEvent(user.id, "phrase revealed", "Recovery phrase was revealed after password confirmation.");
    toast("Phrase revealed.");
    render();
  }

  function createWallet(name, phrase, source) {
    var user = getCurrentUser();
    var wallet = {
      id: uid("wallet"),
      userId: user.id,
      name: name || "Wallet",
      phrase: phrase,
      source: source,
      createdAt: now(),
      accounts: deriveAccounts(phrase),
      assets: ASSETS.map(function (asset, index) {
        return {
          assetId: asset.id,
          balance: roundBalance(asset.balance * (source === "imported" ? 0.72 : 1)),
          favorite: index < 2,
        };
      }),
      transactions: seedTransactions(phrase),
    };
    var wallets = getWallets();
    wallets.push(wallet);
    saveWallets(wallets);
    addEvent(user.id, source === "imported" ? "wallet imported" : "wallet created", wallet.name + " added.");
    return wallet;
  }

  function seedTransactions(phrase) {
    var accounts = deriveAccounts(phrase);
    var evm = accounts[0].address;
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
        createdAt: offsetDate(-1),
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
        createdAt: offsetDate(-2),
      },
      {
        id: uid("tx"),
        assetId: "btc",
        type: "incoming",
        status: "success",
        amount: 0.021,
        fee: "0.00004 BTC",
        from: "bc1q" + randomString(36),
        to: accounts[1].address,
        hash: fakeHash(),
        createdAt: offsetDate(-5),
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
        createdAt: offsetDate(-8),
      },
    ];
  }

  function seedDemoAccount() {
    var users = getUsers();
    var demo = users.find(function (u) { return u.email === "demo@wallax.local"; });
    if (!demo) {
      demo = {
        id: "user_demo",
        name: "Demo User",
        email: "demo@wallax.local",
        password: "password123",
        emailVerified: false,
        createdAt: now(),
      };
      users.push(demo);
      saveUsers(users);
    }
    var wallets = getWallets();
    if (!wallets.some(function (wallet) { return wallet.userId === demo.id; })) {
      var phrase = ["anchor", "bridge", "canyon", "dawn", "ember", "fabric", "globe", "harbor", "island", "jungle", "kernel", "lantern"];
      var wallet = {
        id: "wallet_demo",
        userId: demo.id,
        name: "Demo Wallet",
        phrase: phrase,
        source: "seed",
        createdAt: now(),
        accounts: deriveAccounts(phrase),
        assets: ASSETS.map(function (asset, index) {
          return { assetId: asset.id, balance: asset.balance, favorite: index < 2 };
        }),
        transactions: seedTransactions(phrase),
      };
      wallets.push(wallet);
      saveWallets(wallets);
    }
  }

  function getRoute() {
    var hash = window.location.hash.replace(/^#\/?/, "");
    var queryIndex = hash.indexOf("?");
    var path = queryIndex >= 0 ? hash.slice(0, queryIndex) : hash;
    var query = queryIndex >= 0 ? hash.slice(queryIndex + 1) : "";
    var parts = path.split("/").filter(Boolean);
    return {
      name: parts[0] || "landing",
      parts: parts,
      query: query,
    };
  }

  function normalizeRoute(route) {
    return route || "landing";
  }

  function getQuery() {
    var query = {};
    if (!state.route.query) return query;
    state.route.query.split("&").forEach(function (pair) {
      var bits = pair.split("=");
      query[decodeURIComponent(bits[0])] = decodeURIComponent(bits[1] || "");
    });
    return query;
  }

  function navigate(path) {
    window.location.hash = "#/" + path;
  }

  function getSession() {
    return readJson(STORAGE.session, null);
  }

  function setSession(session) {
    writeJson(STORAGE.session, session);
  }

  function getCurrentUser() {
    var session = getSession();
    if (!session) return null;
    return getUsers().find(function (user) { return user.id === session.userId; }) || null;
  }

  function getUsers() {
    return readJson(STORAGE.users, []);
  }

  function saveUsers(users) {
    writeJson(STORAGE.users, users);
  }

  function getWallets() {
    return readJson(STORAGE.wallets, []);
  }

  function saveWallets(wallets) {
    writeJson(STORAGE.wallets, wallets);
  }

  function getUserWallets(userId) {
    var id = userId || (getCurrentUser() && getCurrentUser().id);
    return getWallets().filter(function (wallet) { return wallet.userId === id; });
  }

  function getActiveWallet() {
    var wallets = getUserWallets();
    if (!wallets.length) return null;
    var activeId = localStorage.getItem("wallax.activeWalletId");
    return wallets.find(function (wallet) { return wallet.id === activeId; }) || wallets[0];
  }

  function setActiveWallet(walletId) {
    localStorage.setItem("wallax.activeWalletId", walletId);
  }

  function updateWallet(wallet) {
    saveWallets(getWallets().map(function (item) { return item.id === wallet.id ? wallet : item; }));
  }

  function getEvents() {
    var user = getCurrentUser();
    var events = readJson(STORAGE.events, []);
    return user ? events.filter(function (event) { return event.userId === user.id; }) : [];
  }

  function addEvent(userId, type, detail) {
    var events = readJson(STORAGE.events, []);
    events.push({ id: uid("event"), userId: userId, type: type, detail: detail, createdAt: now() });
    writeJson(STORAGE.events, events);
  }

  function logout() {
    removeStorage(STORAGE.session);
    toast("Logged out.");
    navigate("login");
  }

  function logoutAll() {
    var user = getCurrentUser();
    if (user) addEvent(user.id, "logout all", "All local sessions cleared.");
    removeStorage(STORAGE.session);
    navigate("login");
  }

  function toggleLock() {
    state.walletLocked = !state.walletLocked;
    if (getCurrentUser()) addEvent(getCurrentUser().id, "wallet lock toggled", state.walletLocked ? "Wallet locked." : "Wallet unlocked.");
    toast(state.walletLocked ? "Wallet locked." : "Wallet unlocked.");
    render();
  }

  function toggleFavorite(assetId) {
    var wallet = getActiveWallet();
    var holding = wallet.assets.find(function (item) { return item.assetId === assetId; });
    if (holding) holding.favorite = !holding.favorite;
    updateWallet(wallet);
    render();
  }

  function getDraftPhrase() {
    var existing = readJson(STORAGE.draftPhrase, null);
    if (existing) return existing;
    var phrase = generateMnemonic();
    writeJson(STORAGE.draftPhrase, phrase);
    return phrase;
  }

  function generateMnemonic() {
    var pool = WORDS.slice();
    var words = [];
    while (words.length < 12) {
      var index = Math.floor(Math.random() * pool.length);
      words.push(pool.splice(index, 1)[0]);
    }
    return words;
  }

  function deriveAccounts(phrase) {
    var seed = hashString(phrase.join(" "));
    return [
      { id: uid("acct"), chain: "Ethereum", address: "0x" + hexFromSeed(seed + "eth", 40) },
      { id: uid("acct"), chain: "Bitcoin", address: "bc1q" + randomStringFromSeed(seed + "btc", 38) },
      { id: uid("acct"), chain: "Polygon", address: "0x" + hexFromSeed(seed + "poly", 40) },
      { id: uid("acct"), chain: "Solana", address: randomStringFromSeed(seed + "sol", 44) },
      { id: uid("acct"), chain: "BNB Smart Chain", address: "0x" + hexFromSeed(seed + "bnb", 40) },
    ];
  }

  function estimateFee(assetId) {
    var asset = assetById(assetId || "eth");
    if (!asset) return "TBD";
    if (asset.chain === "Bitcoin") return "0.00004 BTC";
    if (asset.chain === "Solana") return "0.00001 SOL";
    if (asset.chain === "Polygon") return "0.03 MATIC";
    if (asset.chain === "BNB Smart Chain") return "0.0007 BNB";
    return "0.0012 ETH";
  }

  function assetById(id) {
    return ASSETS.find(function (asset) { return asset.id === id; }) || ASSETS[0];
  }

  function assetIcon(asset) {
    return '<span class="asset-icon" style="background:' + asset.color + '">' + escapeHtml(asset.symbol.slice(0, 1)) + "</span>";
  }

  function assetSelect(wallet, name, selected, routeBase) {
    return (
      '<div class="field"><label>Asset</label><select name="' +
      name +
      '" required ' +
      (routeBase ? 'data-asset-route="' + routeBase + '"' : "") +
      ">" +
      wallet.assets
        .map(function (holding) {
          var asset = assetById(holding.assetId);
          return '<option value="' + asset.id + '"' + (asset.id === selected ? " selected" : "") + ">" + asset.symbol + " - " + asset.name + " (available " + formatAmount(holding.balance) + ")</option>";
        })
        .join("") +
      "</select></div>"
    );
  }

  function field(name, label, type, placeholder, required, value) {
    return (
      '<div class="field"><label for="' +
      name +
      '">' +
      label +
      '</label><input id="' +
      name +
      '" name="' +
      name +
      '" type="' +
      type +
      '" placeholder="' +
      placeholder +
      '" ' +
      (required ? "required " : "") +
      (value !== undefined ? 'value="' + escapeHtml(value) + '" ' : "") +
      "></div>"
    );
  }

  function navLink(path, label, iconSvg, route) {
    var active = route === path || (route === "asset" && path === "assets") || (route === "review" && path === "send") || (route === "transfer-result" && path === "send");
    return '<a class="' + (active ? "active" : "") + '" href="#/' + path + '">' + iconSvg + "<span>" + label + "</span></a>";
  }

  function quickAction(path, label, iconSvg) {
    return '<a class="quick-action" href="#/' + path + '">' + iconSvg + "<span>" + label + "</span></a>";
  }

  function settingsRow(title, subtitle, href) {
    return '<a class="settings-row" href="' + href + '"><div class="settings-main">' + icon("chevron") + '<div class="settings-copy"><strong>' + escapeHtml(title) + '</strong><span>' + escapeHtml(subtitle) + "</span></div></div></a>";
  }

  function filterSelect(name, label, options, selected) {
    return (
      '<div class="field"><label>' +
      label +
      '</label><select data-filter name="' +
      name +
      '">' +
      options
        .map(function (item) {
          return '<option value="' + item[0] + '"' + (item[0] === selected ? " selected" : "") + ">" + item[1] + "</option>";
        })
        .join("") +
      "</select></div>"
    );
  }

  function detailRow(label, value, code) {
    return '<div class="detail-row"><span>' + escapeHtml(label) + "</span>" + (code ? "<code>" + escapeHtml(value) + "</code>" : "<span>" + escapeHtml(value) + "</span>") + "</div>";
  }

  function shuffledOptions(phrase, requiredWord) {
    var choices = [requiredWord];
    while (choices.length < 4) {
      var word = phrase[Math.floor(Math.random() * phrase.length)];
      if (choices.indexOf(word) < 0) choices.push(word);
    }
    choices.sort();
    return choices.map(function (word) { return '<option value="' + word + '">' + word + "</option>"; }).join("");
  }

  function icon(name) {
    var paths = {
      dashboard: '<path d="M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z"/>',
      assets: '<path d="M12 2 3 7l9 5 9-5-9-5Zm-9 9 9 5 9-5M3 15l9 5 9-5"/>',
      send: '<path d="m3 12 18-9-5 18-4-7-9-2Z"/>',
      receive: '<path d="M12 3v14m0 0 5-5m-5 5-5-5M5 21h14"/>',
      history: '<path d="M3 12a9 9 0 1 0 3-6.7M3 4v6h6M12 7v6l4 2"/>',
      settings: '<path d="M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm8.5 4a7 7 0 0 0-.1-1l2-1.5-2-3.5-2.4 1a8 8 0 0 0-1.8-1L16 3h-4l-.4 3a8 8 0 0 0-1.8 1l-2.4-1-2 3.5 2 1.5a7 7 0 0 0 0 2l-2 1.5 2 3.5 2.4-1a8 8 0 0 0 1.8 1l.4 3h4l.4-3a8 8 0 0 0 1.8-1l2.4 1 2-3.5-2-1.5c.1-.3.1-.7.1-1Z"/>',
      plus: '<path d="M12 5v14M5 12h14"/>',
      logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 14 5-5-5-5m5 5H9"/>',
      lock: '<path d="M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5V11Z"/>',
      unlock: '<path d="M7 11V8a5 5 0 0 1 9.5-2.2M5 11h14v10H5V11Z"/>',
      user: '<path d="M20 21a8 8 0 0 0-16 0M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z"/>',
      shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>',
      import: '<path d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v3h16v-3"/>',
      wallet: '<path d="M3 7h18v14H3V7Zm0 0 3-4h12l3 4m13 7h4v4h-4z"/>',
      close: '<path d="m6 6 12 12M18 6 6 18"/>',
      chevron: '<path d="m9 18 6-6-6-6"/>',
      device: '<path d="M7 2h10v20H7V2Zm3 17h4"/>',
    };
    return '<svg class="nav-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (paths[name] || paths.dashboard) + "</svg>";
  }

  function formData(form) {
    var out = {};
    new FormData(form).forEach(function (value, key) {
      out[key] = String(value).trim();
    });
    return out;
  }

  function setError(form, message) {
    var error = form.querySelector("[data-error]");
    if (error) error.textContent = message;
  }

  function clearError(form) {
    setError(form, "");
  }

  function focusAssetSearch() {
    var focus = function () {
      var input = document.querySelector("[data-asset-search]");
      if (!input) return;
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    };
    if (window.requestAnimationFrame) {
      window.requestAnimationFrame(focus);
    } else {
      window.setTimeout(focus, 0);
    }
  }

  function readJson(key, fallback) {
    try {
      var value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (error) {
      return fallback;
    }
  }

  function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function removeStorage(key) {
    localStorage.removeItem(key);
  }

  function copyText(value) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(value).then(function () { toast("Copied."); });
    } else {
      toast("Copy: " + value);
    }
  }

  function toast(message) {
    var root = document.getElementById("toast-root");
    var el = document.createElement("div");
    el.className = "toast";
    el.textContent = message;
    root.appendChild(el);
    window.setTimeout(function () {
      el.remove();
    }, 2600);
  }

  function pageTitle(route) {
    var titles = {
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
      profile: "Profile",
    };
    return titles[route] || "Dashboard";
  }

  function portfolioValue(wallet) {
    return wallet.assets.reduce(function (sum, holding) {
      return sum + holding.balance * assetById(holding.assetId).price;
    }, 0);
  }

  function money(value) {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 }).format(value || 0);
  }

  function formatAmount(value) {
    return Number(value).toLocaleString("en-US", { maximumFractionDigits: 6 });
  }

  function roundBalance(value) {
    return Math.max(0, Math.round(value * 1000000) / 1000000);
  }

  function formatDate(value) {
    return new Date(value).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
  }

  function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  function shortAddress(value) {
    if (!value || value.length < 14) return value;
    return value.slice(0, 8) + "..." + value.slice(-6);
  }

  function now() {
    return new Date().toISOString();
  }

  function offsetDate(days) {
    var date = new Date();
    date.setDate(date.getDate() + days);
    return date.toISOString();
  }

  function uid(prefix) {
    return prefix + "_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
  }

  function fakeHash() {
    return "0x" + randomString(64, "0123456789abcdef");
  }

  function fakeEvmAddress() {
    return "0x" + randomString(40, "0123456789abcdef");
  }

  function randomString(length, alphabet) {
    var chars = alphabet || "abcdefghijklmnopqrstuvwxyz0123456789";
    var out = "";
    for (var i = 0; i < length; i += 1) out += chars[Math.floor(Math.random() * chars.length)];
    return out;
  }

  function hashString(value) {
    var hash = 0;
    for (var i = 0; i < value.length; i += 1) {
      hash = (hash << 5) - hash + value.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  function hexFromSeed(seed, length) {
    return randomStringFromSeed(seed, length, "0123456789abcdef");
  }

  function randomStringFromSeed(seedValue, length, alphabet) {
    var chars = alphabet || "abcdefghijklmnopqrstuvwxyz0123456789";
    var seed = hashString(String(seedValue));
    var out = "";
    for (var i = 0; i < length; i += 1) {
      seed = (seed * 9301 + 49297) % 233280;
      out += chars[Math.floor((seed / 233280) * chars.length)];
    }
    return out;
  }

  function qrCells(value) {
    var seed = hashString(value);
    var cells = "";
    for (var y = 0; y < 21; y += 1) {
      for (var x = 0; x < 21; x += 1) {
        var finder =
          (x < 7 && y < 7) ||
          (x > 13 && y < 7) ||
          (x < 7 && y > 13);
        var inner =
          (x > 1 && x < 5 && y > 1 && y < 5) ||
          (x > 15 && x < 19 && y > 1 && y < 5) ||
          (x > 1 && x < 5 && y > 15 && y < 19);
        var on = finder ? (x === 0 || y === 0 || x === 6 || y === 6 || inner) : ((x * 17 + y * 31 + seed) % 5 < 2);
        cells += on ? "<i></i>" : "<span></span>";
      }
    }
    return cells;
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();
