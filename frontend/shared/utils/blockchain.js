/**
 * Shared utility functions for blockchain interactions
 */

class BlockchainUtils {
  static initEthers() {
    if (typeof window.ethers === 'undefined') {
      throw new Error('ethers library not loaded. Ensure libs/ethers.umd.min.js is included.');
    }
    return window.ethers;
  }

  static async connectWallet(privateKeyStorageKey, config) {
    const ethers = this.initEthers();
    
    try {
      const provider = new ethers.JsonRpcProvider(config.RPC_URL);

      let pk = window.localStorage.getItem(privateKeyStorageKey) || "";
      if (!pk) {
        pk = prompt("Paste your private key (Hardhat/Ganache account). This will be stored in localStorage for convenience on this page only.");
        if (!pk) {
          throw new Error("Private key required to sign transactions.");
        }
        pk = pk.trim();
        if (!pk.startsWith("0x")) pk = "0x" + pk;
        window.localStorage.setItem(privateKeyStorageKey, pk);
      }

      const signer = new ethers.Wallet(pk, provider);
      const addr = await signer.getAddress();

      let network = "unknown";
      let chainId = "unknown";
      try {
        const networkInfo = await provider.getNetwork();
        network = networkInfo.name;
        chainId = networkInfo.chainId;
      } catch (err) {
        console.warn("Could not fetch network info:", err);
      }

      return {
        provider,
        signer,
        address: addr,
        network,
        chainId
      };
    } catch (err) {
      console.error("Failed to connect wallet:", err);
      throw err;
    }
  }

  static clearWallet(storageKey) {
    window.localStorage.removeItem(storageKey);
  }

  static async readFileAsText(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  static getContractHash(text) {
    const ethers = this.initEthers();
    return ethers.keccak256(ethers.toUtf8Bytes(text));
  }

  static formatAddress(addr) {
    if (!addr || addr.length < 10) return addr;
    return addr.substring(0, 6) + "..." + addr.substring(addr.length - 4);
  }

  static formatDate(timestamp) {
    return new Date(parseInt(timestamp) * 1000).toLocaleDateString();
  }
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BlockchainUtils;
}
