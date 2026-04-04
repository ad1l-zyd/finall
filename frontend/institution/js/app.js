/**
 * Institution Dashboard Main Script
 */

let institution = {
  config: CONFIG,
  provider: null,
  signer: null,
  institutionContract: null,
  certificateContract: null,
  registry: new InstitutionRegistryHandler(CONFIG),
  certificates: new CertificateHandler(CONFIG),

  async connectWallet() {
    try {
      const wallet = await BlockchainUtils.connectWallet(
        CONFIG.STORAGE_KEY_INSTITUTION_PK,
        CONFIG
      );
      this.provider = wallet.provider;
      this.signer = wallet.signer;

      // Create contract instances
      const ethers = BlockchainUtils.initEthers();
      this.institutionContract = new ethers.Contract(
        CONFIG.INSTITUTION_REGISTRY_ADDRESS,
        CONFIG.INSTITUTION_REGISTRY_ABI,
        this.signer
      );
      this.certificateContract = new ethers.Contract(
        CONFIG.CERTIFICATE_REGISTRY_ADDRESS,
        CONFIG.CERTIFICATE_REGISTRY_ABI,
        this.signer
      );

      // Update handlers
      this.registry.setContracts(this.institutionContract, this.signer);
      this.certificates.setContracts(this.certificateContract, this.signer);

      // Update UI
      UIUtils.updateWalletStatus("walletAddr", wallet.address);
      UIUtils.updateNetworkStatus("network", wallet.network, wallet.chainId);
    } catch (err) {
      console.error(err);
      UIUtils.showAlert(`Failed to connect: ${err?.message}`, true);
    }
  },

  clearWallet() {
    BlockchainUtils.clearWallet(CONFIG.STORAGE_KEY_INSTITUTION_PK);
    document.getElementById("walletAddr").innerText = "Wallet: not connected";
    document.getElementById("network").innerText = "Network: unknown";
    this.signer = null;
    this.institutionContract = null;
    this.certificateContract = null;
    UIUtils.showAlert("Local key removed from this browser (localStorage).");
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
  document.getElementById("connectWalletBtn").addEventListener("click", () => institution.connectWallet());
  document.getElementById("clearKeyBtn").addEventListener("click", () => institution.clearWallet());

  // Registry form
  document.getElementById("newRegistryForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
      const name = document.getElementById("instName").value.trim();
      const physical = document.getElementById("instPhysicalAddr").value.trim();
      const publicAddr = document.getElementById("instPublicAddr").value.trim();
      await institution.registry.submitRegistration(name, physical, publicAddr);
    } catch (err) {
      UIUtils.showAlert(`Error: ${err?.message}`, true);
    }
  });

  // Status check
  document.getElementById("statusForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const physical = document.getElementById("statusPhysicalAddr").value.trim();
    await institution.registry.checkStatus(physical);
  });

  // List institutions
  document.getElementById("listInstitutionsBtn").addEventListener("click", () => {
    institution.registry.listInstitutions();
  });

  // Certificate upload
  document.getElementById("previewHashBtn").addEventListener("click", () => {
    institution.certificates.previewHash();
  });

  document.getElementById("uploadForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    await institution.certificates.issueCertificate();
  });

  // Save Pinata JWT
  document.getElementById("savePinataBtn").addEventListener("click", () => {
    const jwt = document.getElementById("pinataJwt").value.trim();
    if (!jwt) {
      UIUtils.showAlert("Please enter a Pinata JWT");
      return;
    }
    try {
      localStorage.setItem('pinata_jwt', jwt);
      institution.certificates.pinataJWT = jwt;
      UIUtils.showAlert("Pinata JWT saved to browser storage successfully!");
      document.getElementById("pinataJwt").value = "";
    } catch (err) {
      UIUtils.showAlert(`Error saving JWT: ${err?.message}`, true);
    }
  });

  // Certificate revocation
  document.getElementById("removeCertForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const input = document.getElementById("revokeHash").value.trim();
    await institution.certificates.revokeCertificate(input);
  });

  // Navigation
  window.show = function(id) {
    const navMap = { registry: "nav-reg", upload: "nav-up", remove: "nav-rv" };
    UIUtils.showSection(id, navMap[id]);
  };
});
