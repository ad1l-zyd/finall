/**
 * Institution Dashboard - Certificate Handler
 */

class CertificateHandler {
  constructor(config) {
    this.config = config;
    this.contract = null;
    this.signer = null;
    this.pinataJWT = this.getPinataJWT();
    this.lastCertificateText = null; // Store for preview after upload
  }

  setContracts(contract, signer) {
    this.contract = contract;
    this.signer = signer;
  }

  getPinataJWT() {
    // Try to get from localStorage first (user provided)
    const storedJWT = localStorage.getItem('pinata_jwt');
    if (storedJWT) return storedJWT;
    // Fallback to config if available
    return this.config?.PINATA_JWT || null;
  }

  async uploadToPinata(certificateData) {
    try {
      // Try to get JWT from multiple sources
      let jwt = this.pinataJWT;
      if (!jwt) {
        // Check input field
        const inputJwt = document.getElementById("pinataJwt").value.trim();
        if (inputJwt) {
          jwt = inputJwt;
          this.pinataJWT = jwt;
        }
      }

      if (!jwt) {
        throw new Error("Pinata JWT not configured. Please enter your Pinata JWT in the form and click 'Save JWT to Browser'.");
      }

      const response = await fetch(this.config.API_BASE_URL + this.config.PINATA_UPLOAD_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          certificateData: certificateData,
          pinataJWT: jwt
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Upload failed with status ${response.status}`);
      }

      const result = await response.json();
      if (!result.success || !result.cid) {
        throw new Error(result.message || "Failed to get CID from Pinata");
      }

      return result.cid;
    } catch (err) {
      console.error("Pinata upload error:", err);
      throw err;
    }
  }

  async computeHash(text) {
    try {
      if (!text) {
        throw new Error("Provide certificate text to compute hash.");
      }

      const ethers = BlockchainUtils.initEthers();
      const hash = ethers.keccak256(ethers.toUtf8Bytes(text));
      return hash;
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async previewHash() {
    try {
      let text = document.getElementById("certText").value.trim();
      const fileInput = document.getElementById("certFile");

      if (!text && fileInput.files && fileInput.files.length) {
        text = await BlockchainUtils.readFileAsText(fileInput.files[0]);
      }

      // If form is empty, use the last stored certificate text
      if (!text && this.lastCertificateText) {
        text = this.lastCertificateText;
      }

      const hash = await this.computeHash(text);
      document.getElementById("uploadResult").innerHTML = `<div><strong>Certificate hash:</strong> ${hash}</div>`;
    } catch (err) {
      console.error(err);
      UIUtils.setError("uploadResult", `Error computing hash: ${err?.message}`);
    }
  }

  async issueCertificate() {
    try {
      if (!this.signer || !this.contract) {
        throw new Error("Wallet not connected.");
      }

      let text = document.getElementById("certText").value.trim();
      const fileInput = document.getElementById("certFile");

      if (!text && fileInput.files && fileInput.files.length) {
        text = await BlockchainUtils.readFileAsText(fileInput.files[0]);
      }

      if (!text) {
        throw new Error("Provide certificate text or upload a file.");
      }

      // Store certificate text for later preview
      this.lastCertificateText = text;

      document.getElementById("issueBtn").setAttribute("disabled", "true");
      const certHash = await this.computeHash(text);

      // Check if manual CID provided
      let ipfsCid = document.getElementById("ipfsCid").value.trim();
      if (!ipfsCid) {
        // Automatically upload to Pinata
        UIUtils.setInfo("uploadResult", "Uploading certificate to IPFS via Pinata...");
        try {
          const certificateData = text.startsWith('{') ? text : JSON.stringify({ content: text });
          ipfsCid = await this.uploadToPinata(certificateData);
          UIUtils.setInfo("uploadResult", `Certificate uploaded to IPFS. CID: ${ipfsCid}`);
        } catch (pinataErr) {
          throw new Error(`Pinata upload failed: ${pinataErr.message}`);
        }
      }

      // Issue certificate with CID
      UIUtils.setInfo("uploadResult", "Issuing certificate on-chain...");
      const tx = await this.contract.issueCertificate(certHash, ipfsCid);

      await tx.wait();

      UIUtils.setSuccess("uploadResult", `Certificate issued!\nHash: ${certHash}\nCID: ${ipfsCid}`);
      document.getElementById("uploadForm").reset();
    } catch (err) {
      console.error(err);
      UIUtils.setError("uploadResult", `Error issuing certificate: ${err?.message}`);
    } finally {
      document.getElementById("issueBtn").removeAttribute("disabled");
    }
  }

  async revokeCertificate(input) {
    try {
      if (!this.signer || !this.contract) {
        throw new Error("Wallet not connected.");
      }

      if (!input) {
        throw new Error("Enter certificate hash or text to hash.");
      }

      const ethers = BlockchainUtils.initEthers();
      let certHash = input.startsWith("0x") && input.length === 66 ? input : ethers.keccak256(ethers.toUtf8Bytes(input));

      const tx = await this.contract.revokeCertificate(certHash);
      document.getElementById("revokeResult").innerText = "Revoking...";

      await tx.wait();

      UIUtils.setSuccess("revokeResult", `Certificate revoked: ${certHash}`);
      document.getElementById("removeCertForm").reset();
    } catch (err) {
      console.error(err);
      UIUtils.setError("revokeResult", `Error revoking: ${err?.message}`);
    }
  }
}

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CertificateHandler;
}
