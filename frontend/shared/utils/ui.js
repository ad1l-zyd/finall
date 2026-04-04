/**
 * Shared UI utility functions
 */

class UIUtils {
  static showSection(sectionId, navButtonId) {
    // Hide all sections
    document.querySelectorAll("main section").forEach(s => s.style.display = "none");
    
    // Show target section
    const section = document.getElementById(sectionId);
    if (section) {
      section.style.display = "block";
    }

    // Update nav buttons
    document.querySelectorAll("nav button").forEach(b => b.classList.remove("active"));
    const navBtn = document.getElementById(navButtonId);
    if (navBtn) {
      navBtn.classList.add("active");
    }

    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  static showAlert(message, isError = false) {
    alert(message);
  }

  static updateWalletStatus(elementId, address, network = "", chainId = "") {
    const el = document.getElementById(elementId);
    if (!el) return;

    if (!address) {
      el.innerText = "Wallet: not connected";
    } else {
      let text = "Wallet: " + address;
      if (network) text += ` | Network: ${network} (${chainId})`;
      el.innerText = text;
    }
  }

  static updateNetworkStatus(elementId, network, chainId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.innerText = network ? `Network: ${network} (chainId ${chainId})` : "Network: unknown";
  }

  static setLoading(elementId, isLoading, loadingText = "Loading...") {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.innerHTML = isLoading ? `<div class="muted">${loadingText}</div>` : "";
  }

  static setError(elementId, message) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.innerHTML = `<div class="status-bad">${message || "An error occurred"}</div>`;
  }

  static setSuccess(elementId, message) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.innerHTML = `<div class="status-ok">${message}</div>`;
  }

  static setInfo(elementId, message) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.innerHTML = `<div class="muted">${message}</div>`;
  }

  static createListItem(name, address, details = {}) {
    const li = document.createElement("li");
    let html = `<div>
                  <div style="font-weight:700">${name || "(no name)"}</div>`;
    
    if (details.physicalAddress) {
      html += `<div class="muted">${details.physicalAddress}</div>`;
    }
    if (details.did) {
      html += `<div class="muted">DID: ${details.did}</div>`;
    }
    if (address) {
      html += `<div class="muted">Address: ${address}</div>`;
    }
    
    html += `</div>`;

    if (details.status) {
      const statusClass = details.status === 'Approved' ? 'status-ok' : 'status-bad';
      html = html.replace('</div>', `<div class="${statusClass}" style="margin-left:8px">${details.status}</div></div>`);
    }

    if (details.actions) {
      html += `<div class="actions" style="display:flex;gap:8px">`;
      for (const [label, action] of Object.entries(details.actions)) {
        const btnClass = action.ghost ? 'btn ghost' : 'btn';
        html += `<button class="${btnClass}" data-action="${action.action}" data-addr="${address}">${label}</button>`;
      }
      html += `</div>`;
    }

    li.innerHTML = html;
    return li;
  }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UIUtils;
}
