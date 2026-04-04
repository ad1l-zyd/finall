/**
 * Institution Routes
 * Endpoints for institution dashboard (issuing certificates)
 */

const express = require('express');
const router = express.Router();
const blockchainUtils = require('../utils/blockchain');
const certificateService = require('../services/certificateService');
const storageUtils = require('../utils/storage');
const config = require('../config/config');

/**
 * Register institution (Step 1)
 */
router.post('/register', async (req, res, next) => {
  try {
    const { address, name, physicalAddress, did } = req.body;

    if (!blockchainUtils.isValidAddress(address)) {
      return res.status(400).json({
        error: 'Invalid address',
        message: 'Please provide a valid Ethereum address'
      });
    }

    if (!name || !did) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Name and DID are required'
      });
    }

    // Register institution in blockchain
    const registry = await blockchainUtils.getInstitutionRegistry();
    const tx = await registry.registerInstitution(address, did, name, physicalAddress);
    const receipt = await tx.wait();

    // Store locally
    const institutionData = {
      address,
      name,
      physicalAddress,
      did,
      status: 'pending',
      registeredAt: new Date().toISOString(),
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber
    };

    storageUtils.saveInstitution(institutionData);

    res.json({
      success: true,
      message: 'Institution registration request submitted',
      institution: institutionData,
      transactionHash: receipt.hash
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get institution details
 */
router.get('/details/:address', async (req, res, next) => {
  try {
    const { address } = req.params;

    if (!blockchainUtils.isValidAddress(address)) {
      return res.status(400).json({
        error: 'Invalid address'
      });
    }

    const details = await blockchainUtils.getInstitutionDetails(address);
    const isRegistered = await blockchainUtils.isInstitutionRegistered(address);

    res.json({
      success: true,
      institution: {
        address,
        name: details.name,
        physicalAddress: details.physicalAddress,
        did: details.did,
        approved: details.approved,
        registered: isRegistered,
        registeredAt: details.registeredAt ? new Date(parseInt(details.registeredAt) * 1000).toISOString() : null
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Create certificate (Step 5-6)
 * Issues a certificate for a student
 */
router.post('/issue-certificate', async (req, res, next) => {
  try {
    const {
      issuerAddress,
      issuerPrivateKey,
      studentName,
      studentDOB,
      studentId,
      program,
      gradYear,
      institutionName,
      institutionDID,
      institutionPlace,
      degree,
      cgpa,
      major,
      validity
    } = req.body;

    // Validate inputs
    if (!issuerPrivateKey) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Institution private key is required'
      });
    }

    // Check if institution is registered
    const isRegistered = await blockchainUtils.isInstitutionRegistered(issuerAddress);
    if (!isRegistered) {
      return res.status(403).json({
        error: 'Unauthorized',
        message: 'Institution is not registered or approved'
      });
    }

    // Create certificate
    const certificateResult = await certificateService.createCertificate(
      {
        studentName,
        studentDOB,
        studentId,
        program,
        gradYear,
        institutionName,
        institutionDID,
        institutionPlace,
        degree,
        cgpa,
        major,
        validity
      },
      issuerPrivateKey
    );

    // Step 10: Register on blockchain
    const blockchainResult = await certificateService.registerCertificateOnChain(
      certificateResult.hash,
      certificateResult.ipfsCID,
      issuerPrivateKey
    );

    res.json({
      success: true,
      message: 'Certificate issued successfully',
      certificate: {
        id: certificateResult.certificateId,
        hash: certificateResult.hash,
        ipfsCID: certificateResult.ipfsCID,
        transactionHash: blockchainResult.txHash,
        blockNumber: blockchainResult.blockNumber
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get issued certificates
 */
router.get('/certificates/:issuerAddress', async (req, res, next) => {
  try {
    const { issuerAddress } = req.params;

    if (!blockchainUtils.isValidAddress(issuerAddress)) {
      return res.status(400).json({
        error: 'Invalid address'
      });
    }

    // Get certificates issued by this institution
    const allCerts = storageUtils.getAllCertificates?.() || [];
    const issuedCerts = allCerts.filter(c => c.blockchain?.issuer === issuerAddress);

    res.json({
      success: true,
      issuerAddress,
      count: issuedCerts.length,
      certificates: issuedCerts
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Revoke certificate
 */
router.post('/revoke-certificate', async (req, res, next) => {
  try {
    const { certificateHash, issuerPrivateKey } = req.body;

    if (!certificateHash) {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Certificate hash is required'
      });
    }

    const result = await certificateService.revokeCertificate(
      certificateHash,
      issuerPrivateKey
    );

    res.json({
      success: true,
      message: 'Certificate revoked successfully',
      transactionHash: result.txHash,
      blockNumber: result.blockNumber
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get certificate details
 */
router.get('/certificate/:certificateId', async (req, res, next) => {
  try {
    const { certificateId } = req.params;

    const certificate = await certificateService.getCertificateDetails(certificateId);

    res.json({
      success: true,
      certificate
    });
  } catch (error) {
    next(error);
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
      service: 'institution',
      blockchain: chainInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
