/**
 * Employer Dashboard Main Script
 */

let employer = {
  config: CONFIG,
  provider: null,
  signer: null,
  certificateContract: null,

  async connectWallet() {
    try {
      const wallet = await BlockchainUtils.connectWallet(
        CONFIG.STORAGE_KEY_EMPLOYER_PK,
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
    BlockchainUtils.clearWallet(CONFIG.STORAGE_KEY_EMPLOYER_PK);
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
      
      // Check if certificate exists (hash is not bytes32(0))
      if (result.certHash === '0x0000000000000000000000000000000000000000000000000000000000000000') {
        UIUtils.setError("verifyResult", `❌ Certificate not found on blockchain. Hash: ${certHash}`);
        return;
      }
      
      if (result.isValid) {
        const cid = result.ipfsCID;
        const issuer = BlockchainUtils.formatAddress(result.issuer);
        const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${cid}`;
        UIUtils.setSuccess("verifyResult", `
          ✓ Certificate is VALID
          <br>Issued by: ${issuer}
          <br>IPFS CID: ${cid}
          <br><a href="${ipfsUrl}" target="_blank">View on IPFS Gateway →</a>
        `);
      } else {
        UIUtils.setError("verifyResult", "❌ Certificate is invalid or revoked.");
      }
    } catch (err) {
      console.error(err);
      UIUtils.setError("verifyResult", `Error verifying certificate: ${err?.message}`);
    }
  },

  async verifyCertificateByCID(cid) {
    try {
      if (!this.certificateContract) {
        UIUtils.setError("verifyResult", "Contract not initialized.");
        return;
      }

      // This would require checking all certificates by institution, which is expensive
      // Better approach: employer should have the certificate hash
      UIUtils.setError("verifyResult", "Please use certificate hash instead. CID alone is not enough to verify on blockchain.");
    } catch (err) {
      console.error(err);
      UIUtils.setError("verifyResult", `Error: ${err?.message}`);
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
  document.getElementById("connectWalletBtn").addEventListener("click", () => employer.connectWallet());
  document.getElementById("clearKeyBtn").addEventListener("click", () => employer.clearWallet());

  // Certificate verification
  document.getElementById("verifyForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const certHash = document.getElementById("certHash").value.trim();
    if (certHash) {
      await employer.verifyCertificate(certHash);
    } else {
      UIUtils.setError("verifyResult", "Please enter a certificate hash.");
    }
  });

  // Navigation
  window.show = function(id) {
    UIUtils.showSection(id, "nav-" + id);
  };
});
