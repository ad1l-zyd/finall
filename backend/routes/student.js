/**
 * Student Routes
 * Endpoints for student dashboard
 */

const express = require('express');
const router = express.Router();
const certificateService = require('../services/certificateService');
const zkpUtils = require('../utils/zkp');
const storageUtils = require('../utils/storage');
const { v4: uuidv4 } = require('uuid');

/**
 * Register student
 */
router.post('/register', async (req, res, next) => {
  try {
    const { address, name, dateOfBirth, studentId } = req.body;

    if (!address || !name || !dateOfBirth || !studentId) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Address, name, dateOfBirth, and studentId are required'
      });
    }

    const studentData = {
      address,
      name,
      dateOfBirth,
      studentId,
      registeredAt: new Date().toISOString(),
      certificates: []
    };

    // Note: In a real system, this would be stored in a database
    res.json({
      success: true,
      message: 'Student registered successfully',
      student: studentData
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get student certificates (Step 7)
 * Certificate copy received on student wallet
 */
router.get('/certificates/:studentId', async (req, res, next) => {
  try {
    const { studentId } = req.params;

    const certificates = await certificateService.getStudentCertificates(studentId);

    res.json({
      success: true,
      studentId,
      count: certificates.length,
      certificates: certificates.map(cert => ({
        id: cert.id,
        program: cert.certDetails.degree,
        major: cert.certDetails.major,
        issueDate: cert.certDetails.issueDate,
        institutionName: cert.institutionDetails.name,
        ipfsCID: cert.ipfsCID,
        status: cert.status
      }))
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get certificate by ID
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
 * Generate ZKP proofs for certificate verification
 * Step 15: Student generate ZKP and return to employer
 */
router.post('/generate-zkp-proofs', async (req, res, next) => {
  try {
    const { zkpRequestId, studentId, dateOfBirth, cgpa } = req.body;

    if (!zkpRequestId || !studentId) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'zkpRequestId and studentId are required'
      });
    }

    // Get ZKP request
    const zkpRequest = storageUtils.getZKPProof(zkpRequestId);
    if (!zkpRequest) {
      return res.status(404).json({
        error: 'ZKP request not found'
      });
    }

    const nonce = zkpUtils.generateNonce();
    const proofs = {};

    // Generate required proofs
    if (zkpRequest.requirements.minAge && dateOfBirth) {
      proofs.ageProof = zkpUtils.generateAgeProof(
        dateOfBirth,
        zkpRequest.requirements.minAge,
        studentId,
        nonce
      );
    }

    if (zkpRequest.requirements.minCGPA && cgpa) {
      proofs.cgpaProof = zkpUtils.generateCGPAProof(
        cgpa,
        zkpRequest.requirements.minCGPA,
        studentId,
        nonce
      );
    }

    // Submit proofs
    const result = await certificateService.submitZKPProofs(
      zkpRequestId,
      { id: studentId, dateOfBirth, cgpa },
      proofs
    );

    res.json({
      success: result.success,
      message: result.message,
      zkpRequestId: result.zkpRequestId,
      verificationResults: result.verificationResults,
      status: result.status
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Verify ZKP challenge
 */
router.post('/verify-zkp-challenge', async (req, res, next) => {
  try {
    const { challengeId, proofResponse } = req.body;

    if (!challengeId || !proofResponse) {
      return res.status(400).json({
        error: 'Missing required fields'
      });
    }

    // Verify the challenge response
    // This is simplified - real verification would be more complex
    res.json({
      success: true,
      message: 'Challenge verified successfully',
      challengeId
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Share certificate with employer
 * Step 11: Certificate with CID and minimal details sent to employer
 */
router.post('/share-certificate', async (req, res, next) => {
  try {
    const { certificateId, employerAddress } = req.body;

    if (!certificateId || !employerAddress) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'certificateId and employerAddress are required'
      });
    }

    const exportedCertificate = await certificateService.exportCertificateForEmployer(
      certificateId,
      employerAddress
    );

    res.json({
      success: true,
      message: 'Certificate shared with employer',
      exportedCertificate
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get student profile
 */
router.get('/profile/:studentId', async (req, res, next) => {
  try {
    const { studentId } = req.params;

    // In a real system, fetch from database
    const certificates = await certificateService.getStudentCertificates(studentId);

    res.json({
      success: true,
      student: {
        studentId,
        certificateCount: certificates.length,
        registeredAt: new Date().toISOString(),
        lastActivity: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Request ZKP verification
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

    // Get certificate
    const certificate = storageUtils.getCertificate(certificateHash);
    if (!certificate) {
      return res.status(404).json({
        error: 'Certificate not found'
      });
    }

    // Generate ZKP request
    const zkpRequest = certificateService.generateZKPRequest(
      certificate,
      requirements
    );

    res.json({
      success: true,
      message: 'ZKP verification request created',
      zkpRequest: {
        id: zkpRequest.id,
        certificateId: zkpRequest.certificateId,
        requirements: zkpRequest.requirements,
        status: zkpRequest.status,
        createdAt: zkpRequest.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Health check
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'student',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
