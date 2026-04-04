/**
 * Pinata IPFS Utilities
 * Upload certificates to Pinata and get CID
 */

const axios = require('axios');
const crypto = require('crypto');

class PinataUtils {
  constructor(apiKey, apiSecret, jwt) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.jwt = jwt;
    this.baseUrl = 'https://api.pinata.cloud';
  }

  /**
   * Upload JSON data to Pinata and return CID
   */
  async uploadJSON(data, filename = 'certificate.json') {
    try {
      const jsonString = JSON.stringify(data, null, 2);
      
      // Create form data
      const FormData = require('form-data');
      const form = new FormData();
      const buffer = Buffer.from(jsonString);
      
      form.append('file', buffer, {
        filename: filename
      });

      // Optional: Add pinata metadata
      const metadata = {
        name: filename,
        keyvalues: {
          uploadedAt: new Date().toISOString(),
          type: 'certificate'
        }
      };
      form.append('pinataMetadata', JSON.stringify(metadata));

      // Upload to Pinata
      const response = await axios.post(
        `${this.baseUrl}/pinning/pinFileToIPFS`,
        form,
        {
          headers: {
            ...form.getHeaders(),
            'Authorization': `Bearer ${this.jwt}`
          },
          maxContentLength: Infinity,
          maxBodyLength: Infinity
        }
      );

      return {
        success: true,
        cid: response.data.IpfsHash,
        hash: response.data.IpfsHash,
        timestamp: response.data.Timestamp,
        size: response.data.PinSize,
        url: `https://gateway.pinata.cloud/ipfs/${response.data.IpfsHash}`
      };
    } catch (error) {
      console.error('Pinata upload error:', error.response?.data || error.message);
      throw new Error(`Failed to upload to Pinata: ${error.message}`);
    }
  }

  /**
   * Generate Keccak256 hash of certificate for blockchain
   */
  static getCertificateHash(certificateData) {
    const ethers = require('ethers');
    const jsonString = JSON.stringify(certificateData);
    return ethers.keccak256(ethers.toUtf8Bytes(jsonString));
  }

  /**
   * Verify Pinata JWT is valid
   */
  async testConnection() {
    try {
      const response = await axios.get(
        `${this.baseUrl}/data/testAuthentication`,
        {
          headers: {
            'Authorization': `Bearer ${this.jwt}`
          }
        }
      );
      return {
        success: true,
        message: 'Connected to Pinata',
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to connect to Pinata',
        error: error.message
      };
    }
  }
}

module.exports = PinataUtils;
