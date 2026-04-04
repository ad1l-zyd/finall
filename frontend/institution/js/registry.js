/**
 * Institution Dashboard - Registry Handler
 */

class InstitutionRegistryHandler {
  constructor(config) {
    this.config = config;
    this.contract = null;
    this.signer = null;
  }

  setContracts(contract, signer) {
    this.contract = contract;
    this.signer = signer;
  }

  async submitRegistration(name, physical, publicAddr) {
    try {
      if (!this.signer || !this.contract) {
        throw new Error("Wallet not connected.");
      }

      if (!name || !physical || !publicAddr) {
        throw new Error("Please fill in all required fields.");
      }

      const did = "did:ethr:" + publicAddr;
      const tx = await this.contract.registerInstitution(publicAddr, did, name, physical);
      
      const submitBtn = document.querySelector("#newRegistryForm .btn");
      if (submitBtn) submitBtn.setAttribute("disabled", "true");
      
      await tx.wait();
      
      UIUtils.showAlert("Request sent on-chain. Transaction mined.");
      document.getElementById("newRegistryForm").reset();
      await this.listInstitutions();
    } catch (err) {
      console.error(err);
      throw err;
    } finally {
      const submitBtn = document.querySelector("#newRegistryForm .btn");
      if (submitBtn) submitBtn.removeAttribute("disabled");
    }
  }

  async checkStatus(physical) {
    const out = document.getElementById("statusResult");
    try {
      if (!this.contract) {
        UIUtils.setError("statusResult", "Contract not initialized.");
        return;
      }

      if (!physical) {
        out.innerText = "Enter a physical address to check.";
        return;
      }

      // Try direct lookup first
      try {
        const res = await this.contract.getInstitutionByPhysicalAddress(physical);
        const [addr, name, did, approved] = res;
        const statusClass = approved ? 'status-ok' : 'status-bad';
        const statusText = approved ? 'Approved' : 'Not approved';
        out.innerHTML = `<div><strong>${name}</strong> — ${BlockchainUtils.formatAddress(addr)}</div>
                         <div class="${statusClass}">${statusText}</div>
                         <div class="muted">DID: ${did}</div>`;
        return;
      } catch (err) {
        console.debug("Direct lookup failed, scanning all institutions:", err?.message);
      }

      // Fallback: scan all institutions
      const addrs = await this.contract.getInstitutions();
      for (let a of addrs) {
        try {
          const details = await this.contract.getInstitution(a);
          const [name, phys, did, approved] = details;
          if (phys && phys.trim().toLowerCase() === physical.trim().toLowerCase()) {
            const statusClass = approved ? 'status-ok' : 'status-bad';
            const statusText = approved ? 'Approved' : 'Not approved';
            out.innerHTML = `<div><strong>${name}</strong> — ${BlockchainUtils.formatAddress(a)}</div>
                             <div class="${statusClass}">${statusText}</div>
                             <div class="muted">DID: ${did}</div>`;
            return;
          }
        } catch (innerErr) {
          console.debug("Failed to get details for", a);
        }
      }

      UIUtils.setError("statusResult", "No institution found for that physical address.");
    } catch (err) {
      console.error(err);
      UIUtils.setError("statusResult", `Error checking status: ${err?.message}`);
    }
  }

  async listInstitutions() {
    const listEl = document.getElementById("institutionsList");
    UIUtils.setLoading("institutionsList", true);

    try {
      if (!this.contract) {
        UIUtils.setError("institutionsList", "Contract not initialized.");
        return;
      }

      const addrs = await this.contract.getInstitutions();
      if (!addrs || addrs.length === 0) {
        listEl.innerHTML = "<li class='muted'>No registered institutions found.</li>";
        return;
      }

      listEl.innerHTML = "";
      for (let a of addrs) {
        try {
          const details = await this.contract.getInstitution(a);
          const [name, physicalAddress, did, approved] = details;
          const statusClass = approved ? 'status-ok' : 'status-bad';
          const statusText = approved ? 'Approved' : 'Not approved';
          const li = document.createElement("li");
          li.innerHTML = `<div style="display:flex;justify-content:space-between;align-items:center">
                            <div>
                              <div style="font-weight:700">${name || "(no name)"}</div>
                              <div class="muted">${physicalAddress || ""}</div>
                              <div class="muted">DID: ${did || "—"}</div>
                              <div class="muted">Address: ${BlockchainUtils.formatAddress(a)}</div>
                            </div>
                            <div style="text-align:right">
                              <div class="${statusClass}">${statusText}</div>
                            </div>
                          </div>`;
          listEl.appendChild(li);
        } catch (err) {
          console.debug("Failed to get details for", a);
          const li = document.createElement("li");
          li.textContent = BlockchainUtils.formatAddress(a);
          listEl.appendChild(li);
        }
      }
    } catch (err) {
      console.error(err);
      UIUtils.setError("institutionsList", `Error loading institutions: ${err?.message}`);
    }
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = InstitutionRegistryHandler;
}
