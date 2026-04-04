/**
 * Blockchain Utilities
 * Functions for interacting with Ethereum smart contracts
 */

const { ethers } = require('ethers');
const config = require('../config/config');

class BlockchainUtils {
  constructor() {
    this.provider = new ethers.JsonRpcProvider(config.RPC_URL);
  }

  /**
   * Get a signer from private key
   */
  static getSigner(privateKey) {
    const provider = new ethers.JsonRpcProvider(config.RPC_URL);
    return new ethers.Wallet(privateKey, provider);
  }

  /**
   * Get Institution Registry contract instance
   */
  async getInstitutionRegistry(signer) {
    const contract = new ethers.Contract(
      config.INSTITUTION_REGISTRY_ADDRESS,
      config.INSTITUTION_REGISTRY_ABI,
      signer || this.provider
    );
    return contract;
  }

  /**
   * Get Certificate Registry contract instance
   */
  async getCertificateRegistry(signer) {
    const contract = new ethers.Contract(
      config.CERTIFICATE_REGISTRY_ADDRESS,
      config.CERTIFICATE_REGISTRY_ABI,
      signer || this.provider
    );
    return contract;
  }

  /**
   * Register an institution (submit request)
   */
  async registerInstitution(institutionAddress, did, name, physicalAddress, signerPrivateKey) {
    try {
      const signer = BlockchainUtils.getSigner(signerPrivateKey);
      const registry = await this.getInstitutionRegistry(signer);
      
      const tx = await registry.registerInstitution(
        institutionAddress,
        did,
        name,
        physicalAddress
      );
      
      const receipt = await tx.wait();
      return {
        success: true,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error('Error registering institution:', error);
      throw error;
    }
  }

  /**
   * Approve an institution (admin only)
   */
  async approveInstitution(institutionAddress, adminPrivateKey) {
    try {
      const signer = BlockchainUtils.getSigner(adminPrivateKey);
      const registry = await this.getInstitutionRegistry(signer);
      
      const tx = await registry.approveInstitution(institutionAddress);
      const receipt = await tx.wait();
      
      return {
        success: true,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error('Error approving institution:', error);
      throw error;
    }
  }

  /**
   * Reject an institution (admin only)
   */
  async rejectInstitution(institutionAddress, adminPrivateKey) {
    try {
      const signer = BlockchainUtils.getSigner(adminPrivateKey);
      const registry = await this.getInstitutionRegistry(signer);
      
      const tx = await registry.rejectInstitution(institutionAddress);
      const receipt = await tx.wait();
      
      return {
        success: true,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error('Error rejecting institution:', error);
      throw error;
    }
  }

  /**
   * Get pending institutions
   */
  async getPendingInstitutions() {
    try {
      const registry = await this.getInstitutionRegistry();
      const pending = await registry.getPendingInstitutions();
      return pending;
    } catch (error) {
      console.error('Error getting pending institutions:', error);
      throw error;
    }
  }

  /**
   * Get all registered institutions
   */
  async getRegisteredInstitutions() {
    try {
      const registry = await this.getInstitutionRegistry();
      const addresses = await registry.getInstitutions();
      return addresses;
    } catch (error) {
      console.error('Error getting registered institutions:', error);
      throw error;
    }
  }

  /**
   * Get institution details
   */
  async getInstitutionDetails(institutionAddress) {
    try {
      const registry = await this.getInstitutionRegistry();
      const details = await registry.getInstitution(institutionAddress);
      
      return {
        name: details[0],
        physicalAddress: details[1],
        did: details[2],
        approved: details[3],
        registeredAt: details[4]
      };
    } catch (error) {
      console.error('Error getting institution details:', error);
      throw error;
    }
  }

  /**
   * Issue a certificate on-chain
   */
  async issueCertificate(certificateHash, ipfsCID, issuerPrivateKey) {
    try {
      const signer = BlockchainUtils.getSigner(issuerPrivateKey);
      const registry = await this.getCertificateRegistry(signer);
      
      const tx = await registry.issueCertificate(certificateHash, ipfsCID);
      const receipt = await tx.wait();
      
      return {
        success: true,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        certificateHash,
        ipfsCID
      };
    } catch (error) {
      console.error('Error issuing certificate:', error);
      throw error;
    }
  }

  /**
   * Verify a certificate
   */
  async verifyCertificate(certificateHash) {
    try {
      const registry = await this.getCertificateRegistry();
      const cert = await registry.verifyCertificate(certificateHash);
      
      return {
        certHash: cert.certHash,
        ipfsCID: cert.ipfsCID,
        issuer: cert.issuer,
        isValid: cert.isValid
      };
    } catch (error) {
      console.error('Error verifying certificate:', error);
      throw error;
    }
  }

  /**
   * Revoke a certificate
   */
  async revokeCertificate(certificateHash, issuerPrivateKey) {
    try {
      const signer = BlockchainUtils.getSigner(issuerPrivateKey);
      const registry = await this.getCertificateRegistry(signer);
      
      const tx = await registry.revokeCertificate(certificateHash);
      const receipt = await tx.wait();
      
      return {
        success: true,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber
      };
    } catch (error) {
      console.error('Error revoking certificate:', error);
      throw error;
    }
  }

  /**
   * Check if institution is registered
   */
  async isInstitutionRegistered(institutionAddress) {
    try {
      const registry = await this.getInstitutionRegistry();
      const isRegistered = await registry.isInstitutionRegistered(institutionAddress);
      return isRegistered;
    } catch (error) {
      console.error('Error checking institution registration:', error);
      throw error;
    }
  }

  /**
   * Verify an address is valid
   */
  static isValidAddress(address) {
    return ethers.isAddress(address);
  }

  /**
   * Get address from private key
   */
  static getAddressFromPrivateKey(privateKey) {
    const wallet = new ethers.Wallet(privateKey);
    return wallet.address;
  }

  /**
   * Parse Keccak256 hash from text
   */
  static keccak256(text) {
    return ethers.keccak256(ethers.toUtf8Bytes(text));
  }

  /**
   * Get chain information
   */
  async getChainInfo() {
    try {
      const network = await this.provider.getNetwork();
      return {
        chainId: network.chainId,
        name: network.name,
        rpcUrl: config.RPC_URL
      };
    } catch (error) {
      console.error('Error getting chain info:', error);
      throw error;
    }
  }
}

module.exports = new BlockchainUtils();
