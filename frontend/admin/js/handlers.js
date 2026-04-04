/**
 * Admin Dashboard - History & Registered Handler
 */

class AdminHistoryHandler {
  constructor(config) {
    this.config = config;
    this.contract = null;
  }

  setContract(contract) {
    this.contract = contract;
  }

  async loadHistory() {
    const list = document.getElementById("historyList");
    UIUtils.setLoading("historyList", true);

    try {
      if (!this.contract) {
        UIUtils.setError("historyList", "Contract not initialized.");
        return;
      }

      try {
        const history = await this.contract.getHistory();
        if (!history || history.length === 0) {
          list.innerHTML = "<li class='muted'>No history entries.</li>";
          return;
        }

        list.innerHTML = "";
        history.reverse().forEach(h => {
          const [addr, name, physical, did, approved, ts] = h;
          const li = document.createElement("li");
          const statusClass = approved ? 'status-ok' : 'status-bad';
          const statusText = approved ? 'Approved' : 'Rejected';
          li.innerHTML = `<div>
                            <div style="font-weight:700">${name || "(no name)"} <span class="${statusClass}" style="margin-left:8px">${statusText}</span></div>
                            <div class="muted">${physical || ""}</div>
                            <div class="muted">DID: ${did || "—"}</div>
                            <div class="muted">Address: ${BlockchainUtils.formatAddress(addr)}</div>
                          </div>`;
          list.appendChild(li);
        });
      } catch (err) {
        console.debug("getHistory not available, falling back:", err?.message);
        await this.loadHistoryFallback();
      }
    } catch (err) {
      console.error(err);
      UIUtils.setError("historyList", `Error loading history: ${err?.message}`);
    }
  }

  async loadHistoryFallback() {
    const list = document.getElementById("historyList");
    try {
      const addrs = await this.contract.getInstitutions();
      list.innerHTML = "";
      if (!addrs || addrs.length === 0) {
        list.innerHTML = "<li class='muted'>No history available.</li>";
        return;
      }

      for (let a of addrs) {
        try {
          const details = await this.contract.getInstitution(a);
          const [name, physical, did, approved] = details;
          const statusClass = approved ? 'status-ok' : 'status-bad';
          const statusText = approved ? 'Approved' : 'Not approved';
          const li = document.createElement("li");
          li.innerHTML = `<div>
                            <div style="font-weight:700">${name || "(no name)"} <span class="${statusClass}" style="margin-left:8px">${statusText}</span></div>
                            <div class="muted">${physical || ""}</div>
                            <div class="muted">DID: ${did || "—"}</div>
                            <div class="muted">Address: ${BlockchainUtils.formatAddress(a)}</div>
                          </div>`;
          list.appendChild(li);
        } catch (err) {
          console.debug("Failed to get details for", a, err?.message);
        }
      }
    } catch (err) {
      console.error(err);
      UIUtils.setError("historyList", "Error loading history");
    }
  }
}

class AdminRegisteredHandler {
  constructor(config) {
    this.config = config;
    this.contract = null;
    this.signer = null;
  }

  setContracts(contract, signer) {
    this.contract = contract;
    this.signer = signer;
  }

  async loadRegistered() {
    const list = document.getElementById("registeredList");
    UIUtils.setLoading("registeredList", true);

    try {
      if (!this.contract) {
        UIUtils.setError("registeredList", "Contract not initialized.");
        return;
      }

      const addrs = await this.contract.getInstitutions();
      if (!addrs || addrs.length === 0) {
        list.innerHTML = "<li class='muted'>No registered institutions.</li>";
        return;
      }

      list.innerHTML = "";
      for (let a of addrs) {
        try {
          const details = await this.contract.getInstitution(a);
          const [name, physical, did, approved] = details;
          const li = document.createElement("li");
          li.innerHTML = `<div>
                            <div style="font-weight:700">${name || "(no name)"}</div>
                            <div class="muted">${physical || ""}</div>
                            <div class="muted">DID: ${did || "—"}</div>
                            <div class="muted">Address: ${BlockchainUtils.formatAddress(a)}</div>
                          </div>
                          <div class="actions">
                            <button class="btn" data-addr="${a}" data-action="remove">Remove</button>
                          </div>`;
          list.appendChild(li);
        } catch (err) {
          console.debug("Failed to get details for", a);
          const li = document.createElement("li");
          li.innerHTML = `<div class="muted">${BlockchainUtils.formatAddress(a)}</div>
                          <div class="actions">
                            <button class="btn" data-addr="${a}" data-action="remove">Remove</button>
                          </div>`;
          list.appendChild(li);
        }
      }
    } catch (err) {
      console.error(err);
      UIUtils.setError("registeredList", `Error loading registered: ${err?.message}`);
    }
  }

  async performAction(addr, action) {
    try {
      if (!this.signer || !this.contract) {
        throw new Error("Wallet not connected.");
      }

      if (action === "remove") {
        if (!confirm(`Remove institution ${BlockchainUtils.formatAddress(addr)}? This action is irreversible.`)) {
          return;
        }
        const tx = await this.contract.removeInstitution(addr);
        await tx.wait();
        UIUtils.showAlert(`Institution removed: ${BlockchainUtils.formatAddress(addr)}`);

        // Refresh all lists
        await Promise.allSettled([
          admin.loadRegistered(),
          admin.loadPending(),
          admin.loadHistory()
        ]);
      }
    } catch (err) {
      console.error(err);
      UIUtils.showAlert(`Error: ${err?.message}`, true);
    }
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AdminHistoryHandler, AdminRegisteredHandler };
}
