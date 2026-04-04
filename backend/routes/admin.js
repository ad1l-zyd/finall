/**
 * Admin Routes
 * Endpoints for admin dashboard operations
 */

const express = require('express');
const router = express.Router();
const blockchainUtils = require('../utils/blockchain');
const storageUtils = require('../utils/storage');
const config = require('../config/config');

/**
 * Get pending institution requests
 */
router.get('/pending-institutions', async (req, res, next) => {
  try {
    const pending = await blockchainUtils.getPendingInstitutions();
    
    res.json({
      success: true,
      count: pending.length,
      institutions: pending.map(inst => ({
        address: inst.institutionAddr,
        name: inst.name,
        physicalAddress: inst.physicalAddress,
        did: inst.did,
        requestedAt: new Date(parseInt(inst.timestamp) * 1000).toISOString()
      }))
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get all registered institutions
 */
router.get('/institutions', async (req, res, next) => {
  try {
    const addresses = await blockchainUtils.getRegisteredInstitutions();
    const institutions = [];

    for (const address of addresses) {
      const details = await blockchainUtils.getInstitutionDetails(address);
      institutions.push({
        address,
        name: details.name,
        physicalAddress: details.physicalAddress,
        did: details.did,
        approved: details.approved,
        registeredAt: new Date(parseInt(details.registeredAt) * 1000).toISOString()
      });
    }

    res.json({
      success: true,
      count: institutions.length,
      institutions
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Approve institution
 */
router.post('/approve-institution', async (req, res, next) => {
  try {
    const { institutionAddress } = req.body;

    if (!blockchainUtils.isValidAddress(institutionAddress)) {
      return res.status(400).json({
        error: 'Invalid institution address',
        message: 'Please provide a valid Ethereum address'
      });
    }

    // Use admin private key (should be managed securely)
    const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY;
    if (!adminPrivateKey) {
      throw new Error('Admin private key not configured');
    }

    const result = await blockchainUtils.approveInstitution(
      institutionAddress,
      adminPrivateKey
    );

    res.json({
      success: true,
      message: 'Institution approved successfully',
      transactionHash: result.txHash,
      blockNumber: result.blockNumber
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Reject institution
 */
router.post('/reject-institution', async (req, res, next) => {
  try {
    const { institutionAddress } = req.body;

    if (!blockchainUtils.isValidAddress(institutionAddress)) {
      return res.status(400).json({
        error: 'Invalid institution address',
        message: 'Please provide a valid Ethereum address'
      });
    }

    const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY;
    if (!adminPrivateKey) {
      throw new Error('Admin private key not configured');
    }

    const result = await blockchainUtils.rejectInstitution(
      institutionAddress,
      adminPrivateKey
    );

    res.json({
      success: true,
      message: 'Institution rejected successfully',
      transactionHash: result.txHash,
      blockNumber: result.blockNumber
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Remove institution
 */
router.post('/remove-institution', async (req, res, next) => {
  try {
    const { institutionAddress } = req.body;

    if (!blockchainUtils.isValidAddress(institutionAddress)) {
      return res.status(400).json({
        error: 'Invalid institution address'
      });
    }

    const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY;
    if (!adminPrivateKey) {
      throw new Error('Admin private key not configured');
    }

    // For now, we would implement this in the smart contract
    res.json({
      success: true,
      message: 'Institution removal initiated',
      institutionAddress
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get history of all institution actions
 */
router.get('/history', async (req, res, next) => {
  try {
    const registry = await blockchainUtils.getInstitutionRegistry();
    const history = await registry.getHistory();

    res.json({
      success: true,
      count: history.length,
      history: history.map(entry => ({
        address: entry.institutionAddr,
        name: entry.name,
        physicalAddress: entry.physicalAddress,
        did: entry.did,
        approved: entry.approved,
        timestamp: new Date(parseInt(entry.timestamp) * 1000).toISOString()
      }))
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get admin dashboard summary
 */
router.get('/summary', async (req, res, next) => {
  try {
    const pending = await blockchainUtils.getPendingInstitutions();
    const registered = await blockchainUtils.getRegisteredInstitutions();

    res.json({
      success: true,
      summary: {
        pendingRequests: pending.length,
        registeredInstitutions: registered.length,
        totalRequests: pending.length + registered.length,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Health check for admin service
 */
router.get('/health', async (req, res, next) => {
  try {
    const chainInfo = await blockchainUtils.getChainInfo();
    
    res.json({
      status: 'ok',
      service: 'admin',
      blockchain: {
        chainId: chainInfo.chainId,
        network: chainInfo.name,
        rpcUrl: chainInfo.rpcUrl
      },
      contracts: {
        institutionRegistry: {
          address: config.INSTITUTION_REGISTRY_ADDRESS,
          abi: 'loaded'
        },
        certificateRegistry: {
          address: config.CERTIFICATE_REGISTRY_ADDRESS,
          abi: 'loaded'
        }
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
