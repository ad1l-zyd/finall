/**
 * Utility Routes
 * Miscellaneous utility endpoints
 */

const express = require('express');
const router = express.Router();
const ipfsUtils = require('../utils/ipfs');
const zkpUtils = require('../utils/zkp');
const cryptoUtils = require('../utils/crypto');
const PinataUtils = require('../utils/pinata');

/**
 * Check IPFS availability
 */
router.get('/ipfs-status', async (req, res) => {
  try {
    const status = await ipfsUtils.checkAvailability();
    
    res.json({
      success: true,
      ipfs: status
    });
  } catch (error) {
    res.status(500).json({
      error: 'IPFS check failed',
      message: error.message
    });
  }
});

/**
 * Upload JSON to IPFS
 */
router.post('/ipfs-upload-json', async (req, res, next) => {
  try {
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({
        error: 'Data is required'
      });
    }

    const cid = await ipfsUtils.uploadJSON(data);

    res.json({
      success: true,
      cid,
      gatewayUrl: ipfsUtils.getGatewayUrl(cid)
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Retrieve data from IPFS
 */
router.get('/ipfs-retrieve/:cid', async (req, res, next) => {
  try {
    const { cid } = req.params;

    const data = await ipfsUtils.retrieveJSON(cid);

    res.json({
      success: true,
      cid,
      data
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Generate ZKP nonce
 */
router.get('/zkp-nonce', (req, res) => {
  try {
    const nonce = zkpUtils.generateNonce();

    res.json({
      success: true,
      nonce
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error generating nonce',
      message: error.message
    });
  }
});

/**
 * Generate CGPA proof
 */
router.post('/zkp-cgpa-proof', (req, res) => {
  try {
    const { actualCGPA, minCGPA, studentId, nonce } = req.body;

    if (!actualCGPA || !minCGPA || !studentId || !nonce) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'actualCGPA, minCGPA, studentId, and nonce are required'
      });
    }

    const proof = zkpUtils.generateCGPAProof(actualCGPA, minCGPA, studentId, nonce);

    res.json({
      success: true,
      proof
    });
  } catch (error) {
    res.status(400).json({
      error: 'Proof generation failed',
      message: error.message
    });
  }
});

/**
 * Generate Age proof
 */
router.post('/zkp-age-proof', (req, res) => {
  try {
    const { birthDate, minAge, studentId, nonce } = req.body;

    if (!birthDate || !minAge || !studentId || !nonce) {
      return res.status(400).json({
        error: 'Missing required fields'
      });
    }

    const proof = zkpUtils.generateAgeProof(birthDate, minAge, studentId, nonce);

    res.json({
      success: true,
      proof
    });
  } catch (error) {
    res.status(400).json({
      error: 'Proof generation failed',
      message: error.message
    });
  }
});

/**
 * Verify CGPA proof
 */
router.post('/zkp-verify-cgpa', (req, res) => {
  try {
    const { proof, minCGPA } = req.body;

    if (!proof || !minCGPA) {
      return res.status(400).json({
        error: 'Proof and minCGPA are required'
      });
    }

    const isValid = zkpUtils.verifyCGPAProof(proof, minCGPA);

    res.json({
      success: true,
      verified: isValid
    });
  } catch (error) {
    res.status(400).json({
      error: 'Verification failed',
      message: error.message
    });
  }
});

/**
 * Verify Age proof
 */
router.post('/zkp-verify-age', (req, res) => {
  try {
    const { proof, minAge } = req.body;

    if (!proof || !minAge) {
      return res.status(400).json({
        error: 'Proof and minAge are required'
      });
    }

    const isValid = zkpUtils.verifyAgeProof(proof, minAge);

    res.json({
      success: true,
      verified: isValid
    });
  } catch (error) {
    res.status(400).json({
      error: 'Verification failed',
      message: error.message
    });
  }
});

/**
 * Generate random salt
 */
router.get('/generate-salt', (req, res) => {
  try {
    const salt = cryptoUtils.generateSalt();

    res.json({
      success: true,
      salt
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error generating salt',
      message: error.message
    });
  }
});

/**
 * Create certificate fingerprint
 */
router.post('/create-fingerprint', (req, res) => {
  try {
    const { data } = req.body;

    if (!data) {
      return res.status(400).json({
        error: 'Data is required'
      });
    }

    const fingerprint = cryptoUtils.createCertificateFingerprint(data);

    res.json({
      success: true,
      fingerprint,
      data
    });
  } catch (error) {
    res.status(500).json({
      error: 'Error creating fingerprint',
      message: error.message
    });
  }
});

/**
 * System status
 */
router.get('/status', async (req, res, next) => {
  try {
    const ipfsStatus = await ipfsUtils.checkAvailability();
    const blockchainUtils = require('../utils/blockchain');
    const chainInfo = await blockchainUtils.getChainInfo();

    res.json({
      success: true,
      status: {
        ipfs: ipfsStatus.available,
        blockchain: {
          chainId: chainInfo.chainId,
          network: chainInfo.name
        },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * API documentation
 */
router.get('/docs', (req, res) => {
  res.json({
    success: true,
    api: {
      admin: '/api/admin',
      institution: '/api/institution',
      student: '/api/student',
      employer: '/api/employer',
      blockchain: '/api/blockchain',
      utility: '/api/utility'
    },
    endpoints: {
      'IPFS': [
        { method: 'GET', path: '/utility/ipfs-status', description: 'Check IPFS availability' },
        { method: 'POST', path: '/utility/ipfs-upload-json', description: 'Upload JSON to IPFS' },
        { method: 'GET', path: '/utility/ipfs-retrieve/:cid', description: 'Retrieve from IPFS' }
      ],
      'ZKP': [
        { method: 'GET', path: '/utility/zkp-nonce', description: 'Generate nonce' },
        { method: 'POST', path: '/utility/zkp-cgpa-proof', description: 'Generate CGPA proof' },
        { method: 'POST', path: '/utility/zkp-age-proof', description: 'Generate age proof' }
      ],
      'Blockchain': [
        { method: 'GET', path: '/blockchain/chain-info', description: 'Get chain information' },
        { method: 'GET', path: '/blockchain/contracts', description: 'Get contract addresses' },
        { method: 'POST', path: '/blockchain/validate-address', description: 'Validate address' }
      ]
    }
  });
});

/**
 * Upload certificate JSON to Pinata IPFS
 */
router.post('/pinata-upload', async (req, res, next) => {
  try {
    const { certificateData, pinataJWT, pinataApiKey, pinataApiSecret } = req.body;

    if (!certificateData) {
      return res.status(400).json({
        error: 'Missing required field',
        message: 'certificateData is required'
      });
    }

    if (!pinataJWT) {
      return res.status(400).json({
        error: 'Missing required field',
        message: 'pinataJWT is required'
      });
    }

    // Initialize Pinata with JWT
    const pinata = new PinataUtils(pinataApiKey, pinataApiSecret, pinataJWT);

    // Upload to Pinata
    const uploadResult = await pinata.uploadJSON(certificateData, 'certificate.json');

    // Calculate certificate hash for blockchain
    const certHash = PinataUtils.getCertificateHash(certificateData);

    res.json({
      success: true,
      message: 'Certificate uploaded to Pinata successfully',
      cid: uploadResult.cid,
      certHash: certHash,
      ipfsUrl: uploadResult.url,
      timestamp: uploadResult.timestamp,
      pinSize: uploadResult.size
    });
  } catch (error) {
    console.error('Pinata upload error:', error);
    res.status(500).json({
      error: 'Pinata upload failed',
      message: error.message
    });
  }
});

/**
 * Test Pinata connection
 */
router.post('/pinata-test', async (req, res, next) => {
  try {
    const { pinataJWT } = req.body;

    if (!pinataJWT) {
      return res.status(400).json({
        error: 'Missing required field',
        message: 'pinataJWT is required'
      });
    }

    const pinata = new PinataUtils('', '', pinataJWT);
    const connectionTest = await pinata.testConnection();

    res.json(connectionTest);
  } catch (error) {
    console.error('Pinata test error:', error);
    res.status(500).json({
      error: 'Pinata connection test failed',
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
    service: 'utility',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
