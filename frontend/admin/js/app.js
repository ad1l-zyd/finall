/**
 * Admin Dashboard Main Script
 */

let admin = {
  config: CONFIG,
  provider: null,
  signer: null,
  contract: null,
  pending: new AdminPendingHandler(CONFIG),
  history: new AdminHistoryHandler(CONFIG),
  registered: new AdminRegisteredHandler(CONFIG),

  async connectWallet() {
    try {
      const wallet = await BlockchainUtils.connectWallet(
        CONFIG.STORAGE_KEY_ADMIN_PK,
        CONFIG
      );
      this.provider = wallet.provider;
      this.signer = wallet.signer;

      // Create contract instances
      const ethers = BlockchainUtils.initEthers();
      this.contract = new ethers.Contract(
        CONFIG.INSTITUTION_REGISTRY_ADDRESS,
        CONFIG.INSTITUTION_REGISTRY_ABI,
        this.signer
      );

      // Update handlers
      this.pending.setContracts(this.contract, this.signer);
      this.history.setContract(this.contract);
      this.registered.setContracts(this.contract, this.signer);

      // Update UI
      UIUtils.updateWalletStatus("walletAddr", wallet.address, wallet.network, wallet.chainId);
      UIUtils.updateNetworkStatus("network", wallet.network, wallet.chainId);

      // Load data
      await Promise.all([this.pending.loadPending(), this.history.loadHistory(), this.registered.loadRegistered()]);
    } catch (err) {
      console.error(err);
      UIUtils.showAlert(`Failed to connect: ${err?.message}`, true);
    }
  },

  clearWallet() {
    BlockchainUtils.clearWallet(CONFIG.STORAGE_KEY_ADMIN_PK);
    document.getElementById("walletAddr").innerText = "not connected";
    document.getElementById("network").innerText = "unknown";
    this.signer = null;
    this.contract = null;
    UIUtils.showAlert("Admin key removed from this browser (localStorage).");
  },

  loadPending() {
    return this.pending.loadPending();
  },

  loadHistory() {
    return this.history.loadHistory();
  },

  loadRegistered() {
    return this.registered.loadRegistered();
  },

  async refreshAll() {
    await Promise.allSettled([this.pending.loadPending(), this.history.loadHistory(), this.registered.loadRegistered()]);
  }
};

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
  try {
    BlockchainUtils.initEthers();
  } catch (err) {
    console.error(err);
    UIUtils.showAlert('Ethers library failed to load. Check that ethers.umd.min.js is present.', true);
  }

  // Wire up event listeners
  document.getElementById("connectWalletBtn").addEventListener("click", () => admin.connectWallet());
  document.getElementById("clearAdminKeyBtn").addEventListener("click", () => admin.clearWallet());
  document.getElementById("refreshAllBtn").addEventListener("click", () => admin.refreshAll());
  document.getElementById("refreshPendingBtn").addEventListener("click", () => admin.pending.loadPending());
  document.getElementById("refreshHistoryBtn").addEventListener("click", () => admin.history.loadHistory());
  document.getElementById("refreshRegisteredBtn").addEventListener("click", () => admin.registered.loadRegistered());

  // Pending list actions
  document.getElementById("pendingList").addEventListener("click", async (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const addr = btn.getAttribute("data-addr");
    const action = btn.getAttribute("data-action");
    if (addr && action) await admin.pending.performAction(addr, action);
  });

  // Registered list actions
  document.getElementById("registeredList").addEventListener("click", async (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;
    const addr = btn.getAttribute("data-addr");
    const action = btn.getAttribute("data-action");
    if (addr && action) await admin.registered.performAction(addr, action);
  });

  // Navigation
  window.show = function(id) {
    const navMap = { pending: "nav-pending", history: "nav-history", removal: "nav-removal" };
    UIUtils.showSection(id, navMap[id]);
  };
});
