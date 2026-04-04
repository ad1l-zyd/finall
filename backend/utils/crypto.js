/**
 * Cryptography Utilities
 * Digital signatures, encryption, hashing
 */

const crypto = require('crypto');
const ethers = require('ethers');

class CryptoUtils {
  /**
   * Generate Keccak256 hash (compatible with Solidity)
   */
  static keccak256(data) {
    const bytes = typeof data === 'string' ? ethers.toUtf8Bytes(data) : data;
    return ethers.keccak256(bytes);
  }

  /**
   * Generate SHA256 hash
   */
  static sha256(data) {
    const bytes = typeof data === 'string' ? Buffer.from(data, 'utf-8') : data;
    return crypto.createHash('sha256').update(bytes).digest('hex');
  }

  /**
   * Sign data with private key (EIP-191)
   */
  static signData(data, privateKey) {
    const messageHash = ethers.hashMessage(ethers.toUtf8Bytes(data));
    const wallet = new ethers.Wallet(privateKey);
    const signature = wallet.signingKey.sign(messageHash);
    
    return ethers.Signature.from({
      r: signature.r,
      s: signature.s,
      v: signature.v
    }).serialized;
  }

  /**
   * Verify signature
   */
  static verifySignature(data, signature, address) {
    try {
      const messageHash = ethers.hashMessage(ethers.toUtf8Bytes(data));
      const recoveredAddress = ethers.recoverAddress(messageHash, signature);
      return recoveredAddress.toLowerCase() === address.toLowerCase();
    } catch (error) {
      console.error('Error verifying signature:', error);
      return false;
    }
  }

  /**
   * Generate a random salt
   */
  static generateSalt(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Hash with salt (for storing sensitive data)
   */
  static hashWithSalt(data, salt = null) {
    const useSalt = salt || this.generateSalt();
    const hash = crypto.pbkdf2Sync(data, useSalt, 100000, 64, 'sha512');
    return {
      hash: hash.toString('hex'),
      salt: useSalt
    };
  }

  /**
   * Verify hash with salt
   */
  static verifyHashWithSalt(data, hash, salt) {
    const verifyHash = crypto.pbkdf2Sync(data, salt, 100000, 64, 'sha512');
    return verifyHash.toString('hex') === hash;
  }

  /**
   * AES-256-GCM encryption
   */
  static encrypt(plaintext, key) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(key, 'hex'), iv);
    
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    
    return {
      iv: iv.toString('hex'),
      encryptedData: encrypted,
      authTag: authTag.toString('hex')
    };
  }

  /**
   * AES-256-GCM decryption
   */
  static decrypt(encrypted, key) {
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      Buffer.from(key, 'hex'),
      Buffer.from(encrypted.iv, 'hex')
    );
    
    decipher.setAuthTag(Buffer.from(encrypted.authTag, 'hex'));
    
    let decrypted = decipher.update(encrypted.encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  /**
   * Generate asymmetric key pair
   */
  static generateKeyPair() {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicExponent: 0x10001,
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      },
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      }
    });

    return { publicKey, privateKey };
  }

  /**
   * Sign with RSA private key
   */
  static signWithRSA(data, privateKey) {
    const sign = crypto.createSign('sha256');
    sign.update(data);
    return sign.sign(privateKey, 'hex');
  }

  /**
   * Verify RSA signature
   */
  static verifyRSASignature(data, signature, publicKey) {
    const verify = crypto.createVerify('sha256');
    verify.update(data);
    return verify.verify(publicKey, Buffer.from(signature, 'hex'));
  }

  /**
   * Create certificate fingerprint
   */
  static createCertificateFingerprint(certificateData) {
    const jsonString = JSON.stringify(certificateData);
    return this.keccak256(jsonString);
  }
}

module.exports = CryptoUtils;
