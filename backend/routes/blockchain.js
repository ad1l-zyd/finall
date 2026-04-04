/**
 * Blockchain Routes
 * Low-level blockchain interaction endpoints
 */

const express = require('express');
const router = express.Router();
const blockchainUtils = require('../utils/blockchain');
const cryptoUtils = require('../utils/crypto');
const config = require('../config/config');

/**
 * Get chain information
 */
router.get('/chain-info', async (req, res, next) => {
  try {
    const chainInfo = await blockchainUtils.getChainInfo();
    
    res.json({
      success: true,
      chainInfo
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get contract addresses
 */
router.get('/contracts', (req, res) => {
  res.json({
    success: true,
    contracts: {
      institutionRegistry: {
        address: config.INSTITUTION_REGISTRY_ADDRESS,
        network: config.NETWORK,
        rpcUrl: config.RPC_URL
      },
      certificateRegistry: {
        address: config.CERTIFICATE_REGISTRY_ADDRESS,
        network: config.NETWORK,
        rpcUrl: config.RPC_URL
      }
    }
  });
});

/**
 * Validate address
 */
router.post('/validate-address', (req, res) => {
  try {
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({
        error: 'Address is required'
      });
    }

    const isValid = blockchainUtils.isValidAddress(address);

    res.json({
      success: true,
      address,
      isValid,
      formatted: blockchainUtils.formatAddress(address)
    });
  } catch (error) {
    res.status(500).json({
      error: 'Validation error',
      message: error.message
    });
  }
});

/**
 * Get address from private key
 */
router.post('/get-address-from-key', (req, res) => {
  try {
    const { privateKey } = req.body;

    if (!privateKey) {
      return res.status(400).json({
        error: 'Private key is required'
      });
    }

    const address = blockchainUtils.getAddressFromPrivateKey(privateKey);

    res.json({
      success: true,
      address
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error deriving address',
      message: error.message
    });
  }
});

/**
 * Hash text (Keccak256)
 */
router.post('/hash', (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({
        error: 'Text is required'
      });
    }

    const hash = blockchainUtils.keccak256(text);

    res.json({
      success: true,
      text,
      hash
    });
  } catch (error) {
    res.status(500).json({
      error: 'Hashing error',
      message: error.message
    });
  }
});

/**
 * Verify certificate on blockchain
 */
router.get('/verify-certificate/:certificateHash', async (req, res, next) => {
  try {
    const { certificateHash } = req.params;

    const verification = await blockchainUtils.verifyCertificate(certificateHash);

    res.json({
      success: true,
      certificate: verification
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get institution registration status
 */
router.get('/institution-status/:address', async (req, res, next) => {
  try {
    const { address } = req.params;

    if (!blockchainUtils.isValidAddress(address)) {
      return res.status(400).json({
        error: 'Invalid address'
      });
    }

    const isRegistered = await blockchainUtils.isInstitutionRegistered(address);
    const details = await blockchainUtils.getInstitutionDetails(address);

    res.json({
      success: true,
      address,
      registered: isRegistered,
      details: {
        name: details.name,
        approved: details.approved,
        did: details.did
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Sign data
 */
router.post('/sign-data', (req, res) => {
  try {
    const { data, privateKey } = req.body;

    if (!data || !privateKey) {
      return res.status(400).json({
        error: 'Data and privateKey are required'
      });
    }

    const signature = cryptoUtils.signData(data, privateKey);

    res.json({
      success: true,
      data,
      signature
    });
  } catch (error) {
    res.status(500).json({
      error: 'Signing error',
      message: error.message
    });
  }
});

/**
 * Verify signature
 */
router.post('/verify-signature', (req, res) => {
  try {
    const { data, signature, address } = req.body;

    if (!data || !signature || !address) {
      return res.status(400).json({
        error: 'Data, signature, and address are required'
      });
    }

    const isValid = cryptoUtils.verifySignature(data, signature, address);

    res.json({
      success: true,
      isValid,
      address
    });
  } catch (error) {
    res.status(500).json({
      error: 'Verification error',
      message: error.message
    });
  }
});

/**
 * Health check
 */
router.get('/health', async (req, res, next) => {
  try {
    const chainInfo = await blockchainUtils.getChainInfo();
    
    res.json({
      status: 'ok',
      service: 'blockchain',
      blockchain: chainInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
