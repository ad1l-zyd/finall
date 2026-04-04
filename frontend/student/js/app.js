/**
 * Student Dashboard Main Script
 */

let student = {
  config: CONFIG,
  provider: null,
  signer: null,
  certificateContract: null,

  async connectWallet() {
    try {
      const wallet = await BlockchainUtils.connectWallet(
        CONFIG.STORAGE_KEY_STUDENT_PK,
        CONFIG
      );
      this.provider = wallet.provider;
      this.signer = wallet.signer;

      // Create contract instance
      const ethers = BlockchainUtils.initEthers();
      this.certificateContract = new ethers.Contract(
        CONFIG.CERTIFICATE_REGISTRY_ADDRESS,
        CONFIG.CERTIFICATE_REGISTRY_ABI,
        this.signer
      );

      // Update UI
      UIUtils.updateWalletStatus("walletAddr", wallet.address);
      UIUtils.updateNetworkStatus("network", wallet.network, wallet.chainId);
    } catch (err) {
      console.error(err);
      UIUtils.showAlert(`Failed to connect: ${err?.message}`, true);
    }
  },

  clearWallet() {
    BlockchainUtils.clearWallet(CONFIG.STORAGE_KEY_STUDENT_PK);
    document.getElementById("walletAddr").innerText = "Wallet: not connected";
    document.getElementById("network").innerText = "Network: unknown";
    this.signer = null;
    this.certificateContract = null;
    UIUtils.showAlert("Local key removed from this browser (localStorage).");
  },

  async verifyCertificate(certHash) {
    try {
      if (!this.certificateContract) {
        UIUtils.setError("verifyResult", "Contract not initialized.");
        return;
      }

      const result = await this.certificateContract.verifyCertificate(certHash);
      if (result.isValid) {
        UIUtils.setSuccess("verifyResult", `Certificate is valid. Issued by: ${BlockchainUtils.formatAddress(result.issuer)}`);
      } else {
        UIUtils.setError("verifyResult", "Certificate is invalid or revoked.");
      }
    } catch (err) {
      console.error(err);
      UIUtils.setError("verifyResult", `Error verifying certificate: ${err?.message}`);
    }
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

  // Wallet controls
  document.getElementById("connectWalletBtn").addEventListener("click", () => student.connectWallet());
  document.getElementById("clearKeyBtn").addEventListener("click", () => student.clearWallet());

  // Certificate verification
  document.getElementById("verifyForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const certHash = document.getElementById("certHash").value.trim();
    if (certHash) {
      await student.verifyCertificate(certHash);
    } else {
      UIUtils.setError("verifyResult", "Please enter a certificate hash.");
    }
  });

  // Navigation
  window.show = function(id) {
    UIUtils.showSection(id, "nav-" + id);
  };
});
