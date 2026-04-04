/**
 * Employer Routes
 * Endpoints for employer dashboard (verifying certificates)
 */

const express = require('express');
const router = express.Router();
const certificateService = require('../services/certificateService');
const ipfsUtils = require('../utils/ipfs');

/**
 * Register employer
 */
router.post('/register', async (req, res, next) => {
  try {
    const { address, companyName, industry } = req.body;

    if (!address || !companyName) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Address and companyName are required'
      });
    }

    const employerData = {
      address,
      companyName,
      industry,
      registeredAt: new Date().toISOString()
    };

    res.json({
      success: true,
      message: 'Employer registered successfully',
      employer: employerData
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Verify certificate by CID
 * Step 12: Employer enters CID on verifier portal
 * Step 13: Certificate verified and partial certificate details shown
 */
router.post('/verify-certificate', async (req, res, next) => {
  try {
    const { certificateHash } = req.body;

    if (!certificateHash) {
      return res.status(400).json({
        error: 'Missing required field',
        message: 'certificateHash is required'
      });
    }

    // Verify on blockchain
    const verification = await certificateService.verifyCertificate(certificateHash);

    res.json({
      success: verification.valid,
      message: verification.valid ? 'Certificate verified' : 'Certificate is invalid',
      certificate: verification.certificate,
      blockchainData: verification.blockchainData,
      ipfsCID: verification.ipfsCID
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Request ZKP verification from student
 * Step 14: For age and cgpa requirement zkp request to student
 */
router.post('/request-zkp-verification', async (req, res, next) => {
  try {
    const { certificateHash, requirements } = req.body;

    if (!certificateHash || !requirements) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'certificateHash and requirements are required'
      });
    }

    // Get certificate from blockchain
    const verification = await certificateService.verifyCertificate(certificateHash);
    
    if (!verification.valid) {
      return res.status(400).json({
        error: 'Invalid certificate',
        message: 'Cannot request ZKP for invalid certificate'
      });
    }

    // Create ZKP request for the student
    const zkpRequest = certificateService.generateZKPRequest(
      verification.certificate || { id: certificateHash },
      requirements
    );

    res.json({
      success: true,
      message: 'ZKP verification request sent to student',
      zkpRequest: {
        id: zkpRequest.id,
        certificateHash: certificateHash,
        requirements: zkpRequest.requirements,
        status: zkpRequest.status,
        studentId: zkpRequest.studentId
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Check ZKP verification status
 */
router.get('/zkp-status/:zkpRequestId', async (req, res, next) => {
  try {
    const { zkpRequestId } = req.params;

    // Get ZKP request status
    const storageUtils = require('../utils/storage');
    const zkpRequest = storageUtils.getZKPProof(zkpRequestId);

    if (!zkpRequest) {
      return res.status(404).json({
        error: 'ZKP request not found'
      });
    }

    res.json({
      success: true,
      zkpRequest: {
        id: zkpRequest.id,
        status: zkpRequest.status,
        requirements: zkpRequest.requirements,
        verificationResults: zkpRequest.verificationResults,
        submittedAt: zkpRequest.submittedAt
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get certificate details from IPFS
 */
router.get('/certificate/:ipfsCID', async (req, res, next) => {
  try {
    const { ipfsCID } = req.params;

    const certificateData = await ipfsUtils.retrieveJSON(ipfsCID);

    res.json({
      success: true,
      certificate: certificateData
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Verify certificate authenticity
 */
router.post('/verify-authenticity', async (req, res, next) => {
  try {
    const { certificateHash, signature, issuerAddress } = req.body;

    if (!certificateHash || !signature) {
      return res.status(400).json({
        error: 'Missing required fields'
      });
    }

    const cryptoUtils = require('../utils/crypto');

    // Verify signature
    const isValid = cryptoUtils.verifySignature(
      certificateHash,
      signature,
      issuerAddress
    );

    res.json({
      success: true,
      authentic: isValid,
      message: isValid ? 'Certificate is authentic' : 'Certificate authenticity verification failed'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get verification history
 */
router.get('/verification-history/:employerAddress', async (req, res, next) => {
  try {
    const { employerAddress } = req.params;

    // In a real system, fetch from database
    const storageUtils = require('../utils/storage');
    const zkpRequests = storageUtils.readJSON(
      require('path').join(require('../config/config').DB_PATH, 'zkp-proofs', 'list.json')
    ) || [];

    const employerVerifications = zkpRequests.filter(
      req => req.employerAddress === employerAddress
    );

    res.json({
      success: true,
      employerAddress,
      count: employerVerifications.length,
      verifications: employerVerifications
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get certificate gateway URL
 */
router.get('/gateway-url/:ipfsCID', (req, res) => {
  try {
    const { ipfsCID } = req.params;
    const gatewayUrl = ipfsUtils.getGatewayUrl(ipfsCID);

    res.json({
      success: true,
      ipfsCID,
      gatewayUrl
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error getting gateway URL',
      message: error.message
    });
  }
});

/**
 * Health check
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'employer',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
