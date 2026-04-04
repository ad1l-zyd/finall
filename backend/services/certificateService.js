/**
 * Certificate Service
 * Manages the complete certificate lifecycle
 */

const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const blockchainUtils = require('../utils/blockchain');
const cryptoUtils = require('../utils/crypto');
const ipfsUtils = require('../utils/ipfs');
const zkpUtils = require('../utils/zkp');
const storageUtils = require('../utils/storage');

class CertificateService {
  /**
   * Create a new certificate with student and institution details
   */
  static async createCertificate(certificateData, issuerPrivateKey) {
    try {
      const certificateId = uuidv4();

      // Structure certificate data according to requirements
      const structuredCertificate = {
        id: certificateId,
        studentDetails: {
          name: certificateData.studentName,
          DOB: certificateData.studentDOB,
          id: certificateData.studentId,
          program: certificateData.program,
          gradYear: certificateData.gradYear
        },
        institutionDetails: {
          name: certificateData.institutionName,
          did: certificateData.institutionDID,
          place: certificateData.institutionPlace
        },
        certDetails: {
          degree: certificateData.degree,
          cgpa: certificateData.cgpa,
          major: certificateData.major,
          issueDate: new Date().toISOString(),
          validity: certificateData.validity
        },
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      // Step 6: Institution signs certificate digitally
      const signature = cryptoUtils.signData(
        JSON.stringify(structuredCertificate),
        issuerPrivateKey
      );

      structuredCertificate.digitalSignature = signature;
      structuredCertificate.signedAt = new Date().toISOString();

      // Step 8: Hash the certificate
      const certificateHash = cryptoUtils.keccak256(
        JSON.stringify(structuredCertificate)
      );
      structuredCertificate.hash = certificateHash;

      // Step 9: Store in IPFS and get CID
      const ipfsCID = await ipfsUtils.uploadJSON(structuredCertificate);
      structuredCertificate.ipfsCID = ipfsCID;

      // Step 10: Store CID on blockchain (will be done separately)
      structuredCertificate.blockchain = {
        registered: false,
        transactionHash: null,
        blockNumber: null,
        timestamp: null
      };

      // Save locally
      storageUtils.saveCertificate(structuredCertificate);

      // Store IPFS backup
      await ipfsUtils.storeLocalBackup(ipfsCID, structuredCertificate);

      return {
        success: true,
        certificateId: certificateId,
        hash: certificateHash,
        ipfsCID: ipfsCID,
        certificate: structuredCertificate
      };
    } catch (error) {
      console.error('Error creating certificate:', error);
      throw error;
    }
  }

  /**
   * Register certificate on blockchain
   */
  static async registerCertificateOnChain(certificateHash, ipfsCID, issuerPrivateKey) {
    try {
      const result = await blockchainUtils.issueCertificate(
        certificateHash,
        ipfsCID,
        issuerPrivateKey
      );

      // Update certificate record
      const certificate = storageUtils.getCertificate(certificateHash);
      if (certificate) {
        certificate.blockchain = {
          registered: true,
          transactionHash: result.txHash,
          blockNumber: result.blockNumber,
          timestamp: new Date().toISOString()
        };
        certificate.status = 'registered';
        storageUtils.saveCertificate(certificate);
      }

      return result;
    } catch (error) {
      console.error('Error registering certificate on chain:', error);
      throw error;
    }
  }

  /**
   * Verify certificate
   */
  static async verifyCertificate(certificateHash) {
    try {
      // Step 13: Check certificate on blockchain
      const blockchainData = await blockchainUtils.verifyCertificate(certificateHash);

      if (!blockchainData.isValid) {
        return {
          valid: false,
          message: 'Certificate is invalid or revoked'
        };
      }

      // Retrieve full certificate from IPFS
      const certificate = await ipfsUtils.retrieveJSON(blockchainData.ipfsCID);

      // Return partial details (not revealing all sensitive info)
      return {
        valid: true,
        certificate: {
          studentName: certificate.studentDetails.name,
          program: certificate.certDetails.degree,
          major: certificate.certDetails.major,
          issueDate: certificate.certDetails.issueDate,
          institutionName: certificate.institutionDetails.name,
          cgpa: certificate.certDetails.cgpa // Will request ZKP for this
        },
        issuer: blockchainData.issuer,
        ipfsCID: blockchainData.ipfsCID,
        blockchainData
      };
    } catch (error) {
      console.error('Error verifying certificate:', error);
      throw error;
    }
  }

  /**
   * Generate ZKP request for certificate verification
   * Step 14: For age and CGPA requirement
   */
  static generateZKPRequest(certificateData, requirements) {
    try {
      const requestId = uuidv4();

      const zkpRequest = {
        id: requestId,
        certificateId: certificateData.id,
        certificateHash: certificateData.hash,
        requirements: requirements, // { minAge: 18, minCGPA: 3.0 }
        studentId: certificateData.studentDetails.id,
        createdAt: new Date().toISOString(),
        status: 'pending'
      };

      // Create challenges for student to respond to
      if (requirements.minAge) {
        zkpRequest.ageChallenge = zkpUtils.createChallenge({
          type: 'ageVerification',
          minAge: requirements.minAge
        });
      }

      if (requirements.minCGPA) {
        zkpRequest.cgpaChallenge = zkpUtils.createChallenge({
          type: 'cgpaVerification',
          minCGPA: requirements.minCGPA
        });
      }

      storageUtils.saveZKPProof(zkpRequest);
      return zkpRequest;
    } catch (error) {
      console.error('Error generating ZKP request:', error);
      throw error;
    }
  }

  /**
   * Student generates and submits ZKP proofs
   * Step 15: Student generate ZKP and return
   */
  static async submitZKPProofs(zkpRequestId, studentData, proofs) {
    try {
      const zkpRequest = storageUtils.getZKPProof(zkpRequestId);

      if (!zkpRequest) {
        throw new Error('ZKP request not found');
      }

      // Verify proofs
      let allProofsValid = true;
      const verificationResults = {};

      if (zkpRequest.requirements.minAge && proofs.ageProof) {
        const ageValid = zkpUtils.verifyAgeProof(
          proofs.ageProof,
          zkpRequest.requirements.minAge
        );
        verificationResults.ageProof = ageValid;
        allProofsValid = allProofsValid && ageValid;
      }

      if (zkpRequest.requirements.minCGPA && proofs.cgpaProof) {
        const cgpaValid = zkpUtils.verifyCGPAProof(
          proofs.cgpaProof,
          zkpRequest.requirements.minCGPA
        );
        verificationResults.cgpaProof = cgpaValid;
        allProofsValid = allProofsValid && cgpaValid;
      }

      // Update ZKP request
      zkpRequest.studentProofs = proofs;
      zkpRequest.verificationResults = verificationResults;
      zkpRequest.status = allProofsValid ? 'verified' : 'failed';
      zkpRequest.submittedAt = new Date().toISOString();

      storageUtils.saveZKPProof(zkpRequest);

      return {
        success: allProofsValid,
        zkpRequestId: zkpRequestId,
        verificationResults: verificationResults,
        status: zkpRequest.status,
        message: allProofsValid ? 'All proofs verified successfully' : 'Some proofs failed verification'
      };
    } catch (error) {
      console.error('Error submitting ZKP proofs:', error);
      throw error;
    }
  }

  /**
   * Revoke certificate
   */
  static async revokeCertificate(certificateHash, issuerPrivateKey) {
    try {
      const result = await blockchainUtils.revokeCertificate(
        certificateHash,
        issuerPrivateKey
      );

      // Update certificate record
      const certificate = storageUtils.getCertificate(certificateHash);
      if (certificate) {
        certificate.status = 'revoked';
        certificate.revokedAt = new Date().toISOString();
        storageUtils.saveCertificate(certificate);
      }

      return result;
    } catch (error) {
      console.error('Error revoking certificate:', error);
      throw error;
    }
  }

  /**
   * Get certificate details
   */
  static async getCertificateDetails(certificateId) {
    try {
      const certificate = storageUtils.getCertificate(certificateId);

      if (!certificate) {
        throw new Error('Certificate not found');
      }

      return certificate;
    } catch (error) {
      console.error('Error getting certificate details:', error);
      throw error;
    }
  }

  /**
   * Get student's certificates
   */
  static async getStudentCertificates(studentId) {
    try {
      return storageUtils.getCertificatesByStudent(studentId);
    } catch (error) {
      console.error('Error getting student certificates:', error);
      throw error;
    }
  }

  /**
   * Export certificate for sharing with employer
   * Step 12: Certificate with CID and minimal details sent to employer
   */
  static async exportCertificateForEmployer(certificateId, employerAddress) {
    try {
      const certificate = storageUtils.getCertificate(certificateId);

      if (!certificate) {
        throw new Error('Certificate not found');
      }

      // Create export with minimal details
      const exportData = {
        id: certificateId,
        ipfsCID: certificate.ipfsCID,
        certificateHash: certificate.hash,
        studentName: certificate.studentDetails.name,
        program: certificate.certDetails.degree,
        issueDate: certificate.certDetails.issueDate,
        institutionName: certificate.institutionDetails.name,
        issuer: certificate.blockchain.issuer || 'pending',
        exportedAt: new Date().toISOString(),
        exportedTo: employerAddress
      };

      return exportData;
    } catch (error) {
      console.error('Error exporting certificate:', error);
      throw error;
    }
  }
}

module.exports = CertificateService;
