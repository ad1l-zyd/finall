/**
 * IPFS Utilities
 * Integration with IPFS for distributed storage
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const config = require('../config/config');

class IPFSUtils {
  constructor() {
    this.apiUrl = config.MOCK_IPFS ? null : config.IPFS_URL;
    this.gatewayUrl = config.IPFS_GATEWAY;
    this.isAvailable = !config.MOCK_IPFS;
  }

  /**
   * Upload JSON data to IPFS
   */
  async uploadJSON(data) {
    if (config.MOCK_IPFS || !this.isAvailable) {
      // Mock IPFS for testing
      return this.generateMockCID(data);
    }

    try {
      const jsonString = JSON.stringify(data);
      const form = new FormData();
      form.append('file', new Blob([jsonString]), 'certificate.json');

      const response = await axios.post(`${this.apiUrl}/api/v0/add`, form, {
        headers: form.getHeaders?.() || {}
      });

      return response.data.Hash; // IPFS CID
    } catch (error) {
      console.error('Error uploading to IPFS:', error);
      // Fallback to mock
      return this.generateMockCID(data);
    }
  }

  /**
   * Upload file to IPFS
   */
  async uploadFile(filePath) {
    if (config.MOCK_IPFS || !this.isAvailable) {
      return this.generateMockCID({ file: path.basename(filePath) });
    }

    try {
      const fileContent = fs.readFileSync(filePath);
      const fileName = path.basename(filePath);
      
      const form = new FormData();
      form.append('file', new Blob([fileContent]), fileName);

      const response = await axios.post(`${this.apiUrl}/api/v0/add`, form, {
        headers: form.getHeaders?.() || {}
      });

      return response.data.Hash;
    } catch (error) {
      console.error('Error uploading file to IPFS:', error);
      return this.generateMockCID({ file: path.basename(filePath) });
    }
  }

  /**
   * Retrieve data from IPFS
   */
  async retrieveJSON(cid) {
    if (config.MOCK_IPFS || !this.isAvailable) {
      // Return mock data
      return { mock: true, cid };
    }

    try {
      const response = await axios.get(`${this.gatewayUrl}/ipfs/${cid}`);
      return response.data;
    } catch (error) {
      console.error('Error retrieving from IPFS:', error);
      throw error;
    }
  }

  /**
   * Get IPFS gateway URL for a CID
   */
  getGatewayUrl(cid) {
    return `${this.gatewayUrl}/ipfs/${cid}`;
  }

  /**
   * Pin content on IPFS (keep it available)
   */
  async pinContent(cid) {
    if (config.MOCK_IPFS || !this.isAvailable) {
      return { pinned: true, cid };
    }

    try {
      const response = await axios.get(`${this.apiUrl}/api/v0/pin/add?arg=${cid}`);
      return response.data;
    } catch (error) {
      console.error('Error pinning content:', error);
      throw error;
    }
  }

  /**
   * Unpin content from IPFS
   */
  async unpinContent(cid) {
    if (config.MOCK_IPFS || !this.isAvailable) {
      return { unpinned: true, cid };
    }

    try {
      const response = await axios.get(`${this.apiUrl}/api/v0/pin/rm?arg=${cid}`);
      return response.data;
    } catch (error) {
      console.error('Error unpinning content:', error);
      throw error;
    }
  }

  /**
   * Generate a mock CID for testing
   */
  generateMockCID(data) {
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256');
    hash.update(JSON.stringify(data) + Date.now());
    const cidLike = 'Qm' + hash.digest('hex').substring(0, 44);
    return cidLike;
  }

  /**
   * Check if IPFS is available
   */
  async checkAvailability() {
    if (config.MOCK_IPFS) {
      return { available: true, mock: true };
    }

    try {
      const response = await axios.get(`${this.apiUrl}/api/v0/version`);
      this.isAvailable = true;
      return {
        available: true,
        version: response.data.Version,
        repo: response.data.Repo
      };
    } catch (error) {
      this.isAvailable = false;
      console.warn('IPFS not available, using mock mode');
      return { available: false, error: error.message };
    }
  }

  /**
   * Store certificate metadata locally (backup)
   */
  async storeLocalBackup(cid, certificateData) {
    const backupDir = path.join(config.UPLOAD_DIR, 'ipfs-backup');
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const filePath = path.join(backupDir, `${cid}.json`);
    fs.writeFileSync(filePath, JSON.stringify(certificateData, null, 2));
    
    return filePath;
  }

  /**
   * Retrieve certificate from local backup
   */
  async retrieveLocalBackup(cid) {
    const filePath = path.join(config.UPLOAD_DIR, 'ipfs-backup', `${cid}.json`);
    
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    }

    return null;
  }
}

module.exports = new IPFSUtils();
