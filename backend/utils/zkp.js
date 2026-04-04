/**
 * Zero-Knowledge Proof Utilities
 * For proving attributes without revealing them
 */

const crypto = require('crypto');
const config = require('../config/config');

/**
 * Simple ZKP implementation for CGPA and Age verification
 * This is a simplified version. For production, use proper ZKP circuits with snarkjs
 */
class ZKPUtils {
  /**
   * Generate a ZKP for CGPA being above threshold
   * Returns proof that CGPA >= minCGPA without revealing actual CGPA
   */
  static generateCGPAProof(actualCGPA, minCGPA, studentId, nonce) {
    if (actualCGPA < minCGPA) {
      throw new Error('CGPA does not meet minimum requirement');
    }

    // Simple commitment: hash(CGPA, nonce)
    const cgpaCommitment = this.createCommitment(actualCGPA.toString(), nonce);
    
    // Create proof that CGPA >= minCGPA
    // In real ZKP, this would be a cryptographic proof
    const proof = {
      commitment: cgpaCommitment,
      minCGPA: minCGPA,
      proof: crypto.createHash('sha256')
        .update(`cgpa_proof:${cgpaCommitment}:${minCGPA}:${studentId}`)
        .digest('hex'),
      timestamp: Date.now(),
      studentId: studentId
    };

    return proof;
  }

  /**
   * Generate a ZKP for Age being above threshold
   * Returns proof that Age >= minAge without revealing actual age/DOB
   */
  static generateAgeProof(birthDate, minAge, studentId, nonce) {
    const age = this.calculateAge(birthDate);
    
    if (age < minAge) {
      throw new Error('Age does not meet minimum requirement');
    }

    // DOB commitment: hash(DOB, nonce)
    const dobCommitment = this.createCommitment(birthDate, nonce);
    
    // Create proof that Age >= minAge
    const proof = {
      dobCommitment: dobCommitment,
      minAge: minAge,
      proof: crypto.createHash('sha256')
        .update(`age_proof:${dobCommitment}:${minAge}:${studentId}`)
        .digest('hex'),
      timestamp: Date.now(),
      studentId: studentId
    };

    return proof;
  }

  /**
   * Verify CGPA proof
   * Note: This is simplified. Real verification would use circuit verification
   */
  static verifyCGPAProof(proof, minCGPA) {
    return proof.minCGPA === minCGPA && proof.proof && proof.commitment;
  }

  /**
   * Verify Age proof
   */
  static verifyAgeProof(proof, minAge) {
    return proof.minAge === minAge && proof.proof && proof.dobCommitment;
  }

  /**
   * Create a cryptographic commitment
   */
  static createCommitment(value, nonce) {
    return crypto.createHash('sha256')
      .update(`${value}:${nonce}`)
      .digest('hex');
  }

  /**
   * Calculate age from birth date
   */
  static calculateAge(birthDate) {
    const ageDiff = Date.now() - new Date(birthDate).getTime();
    const ageDate = new ageDate(ageDiff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }

  /**
   * Generate a nonce for proof generation
   */
  static generateNonce() {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Create a salt for hashing sensitive data
   */
  static generateSalt(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Hash certificate data for zero-knowledge proof context
   */
  static hashCertificateContext(certificateData) {
    return crypto.createHash('sha256')
      .update(JSON.stringify(certificateData))
      .digest('hex');
  }

  /**
   * Generate multiple proofs for different attributes
   */
  static generateMultiProofs(studentData, requirements) {
    const nonce = this.generateNonce();
    const proofs = {};

    if (requirements.minAge && studentData.dateOfBirth) {
      proofs.ageProof = this.generateAgeProof(
        studentData.dateOfBirth,
        requirements.minAge,
        studentData.id,
        nonce
      );
    }

    if (requirements.minCGPA && studentData.cgpa) {
      proofs.cgpaProof = this.generateCGPAProof(
        studentData.cgpa,
        requirements.minCGPA,
        studentData.id,
        nonce
      );
    }

    return {
      proofs,
      nonce,
      studentId: studentData.id,
      timestamp: Date.now()
    };
  }

  /**
   * Create a ZKP challenge for verification
   */
  static createChallenge(proofRequest) {
    const challenge = crypto.randomBytes(32).toString('hex');
    
    return {
      challenge,
      request: proofRequest,
      expiry: Date.now() + 3600000, // 1 hour
      id: crypto.randomUUID()
    };
  }

  /**
   * Verify a challenge response
   */
  static verifyChallengeResponse(challenge, response) {
    if (Date.now() > challenge.expiry) {
      throw new Error('Challenge has expired');
    }

    // Verify structure
    return response.challengeId === challenge.id &&
           response.proofs &&
           response.timestamp &&
           response.signature;
  }

  /**
   * Create a zero-knowledge proof circuit (simplified)
   * In production, this would generate actual Circom circuits
   */
  static createZKPCircuit(circuitType, constraints) {
    const circuits = {
      ageVerification: {
        name: 'AgeVerification',
        inputs: ['dateOfBirth', 'nonce'],
        constraints: ['age >= minAge'],
        output: 'ageCommitment'
      },
      cgpaVerification: {
        name: 'CGPAVerification',
        inputs: ['cgpa', 'nonce'],
        constraints: ['cgpa >= minCGPA'],
        output: 'cgpaCommitment'
      },
      credentialVerification: {
        name: 'CredentialVerification',
        inputs: ['credential', 'issuer', 'nonce'],
        constraints: ['issuer is registered', 'credential is valid'],
        output: 'credentialCommitment'
      }
    };

    return circuits[circuitType] || null;
  }
}

module.exports = ZKPUtils;
