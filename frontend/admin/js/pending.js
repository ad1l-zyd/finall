/**
 * Admin Dashboard - Pending Approvals Handler
 */

class AdminPendingHandler {
  constructor(config) {
    this.config = config;
    this.contract = null;
    this.signer = null;
  }

  setContracts(contract, signer) {
    this.contract = contract;
    this.signer = signer;
  }

  async loadPending() {
    const list = document.getElementById("pendingList");
    UIUtils.setLoading("pendingList", true);

    try {
      if (!this.contract) {
        UIUtils.setError("pendingList", "Contract not initialized.");
        return;
      }

      try {
        const pending = await this.contract.getPendingInstitutions();
        if (!pending || pending.length === 0) {
          list.innerHTML = "<li class='muted'>No pending requests.</li>";
          return;
        }

        list.innerHTML = "";
        for (let p of pending) {
          const [addr, name, physical, did, ts] = p;
          const li = document.createElement("li");
          li.innerHTML = `<div>
                            <div style="font-weight:700">${name || "(no name)"}</div>
                            <div class="muted">${physical || ""}</div>
                            <div class="muted">Address: ${BlockchainUtils.formatAddress(addr)}</div>
                            <div class="muted">DID: ${did || "—"}</div>
                          </div>
                          <div class="actions">
                            <button class="btn" data-addr="${addr}" data-action="approve">Approve</button>
                            <button class="btn ghost" data-addr="${addr}" data-action="reject">Reject</button>
                          </div>`;
          list.appendChild(li);
        }
      } catch (err) {
        console.debug("getPendingInstitutions not available:", err?.message);
        list.innerHTML = "<li class='muted'>Pending retrieval not implemented in contract.</li>";
      }
    } catch (err) {
      console.error(err);
      UIUtils.setError("pendingList", `Error loading pending: ${err?.message}`);
    }
  }

  async performAction(addr, action) {
    try {
      if (!this.signer || !this.contract) {
        throw new Error("Wallet not connected.");
      }

      let tx;
      if (action === "approve") {
        tx = await this.contract.approveInstitution(addr);
        await tx.wait();
        UIUtils.showAlert(`Institution approved: ${BlockchainUtils.formatAddress(addr)}`);
      } else if (action === "reject") {
        tx = await this.contract.rejectInstitution(addr);
        await tx.wait();
        UIUtils.showAlert(`Institution rejected: ${BlockchainUtils.formatAddress(addr)}`);
      }

      // Refresh all lists
      await Promise.allSettled([
        this.loadPending(),
        admin.loadHistory(),
        admin.loadRegistered()
      ]);
    } catch (err) {
      console.error(err);
      UIUtils.showAlert(`Error: ${err?.message}`, true);
    }
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AdminPendingHandler;
}
