/**
 * Database/Storage Utilities
 * JSON-based storage for development, can be replaced with real database
 */

const fs = require('fs');
const path = require('path');
const config = require('../config/config');

class StorageUtils {
  /**
   * Read JSON file
   */
  static readJSON(filePath) {
    try {
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf-8');
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      console.error(`Error reading JSON from ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Write JSON file
   */
  static writeJSON(filePath, data) {
    try {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error(`Error writing JSON to ${filePath}:`, error);
      return false;
    }
  }

  /**
   * Append to JSON array file
   */
  static appendJSON(filePath, item) {
    try {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      let data = [];
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        data = JSON.parse(fileContent);
      }

      if (!Array.isArray(data)) {
        data = [];
      }

      data.push({
        ...item,
        id: item.id || Date.now().toString(),
        createdAt: item.createdAt || new Date().toISOString()
      });

      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      return true;
    } catch (error) {
      console.error(`Error appending JSON to ${filePath}:`, error);
      return false;
    }
  }

  /**
   * Update item in JSON array file
   */
  static updateJSON(filePath, id, updates) {
    try {
      const data = this.readJSON(filePath) || [];
      const index = data.findIndex(item => item.id === id);

      if (index !== -1) {
        data[index] = {
          ...data[index],
          ...updates,
          updatedAt: new Date().toISOString()
        };
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        return data[index];
      }

      return null;
    } catch (error) {
      console.error(`Error updating JSON in ${filePath}:`, error);
      return null;
    }
  }

  /**
   * Delete item from JSON array file
   */
  static deleteJSON(filePath, id) {
    try {
      const data = this.readJSON(filePath) || [];
      const filtered = data.filter(item => item.id !== id);
      fs.writeFileSync(filePath, JSON.stringify(filtered, null, 2));
      return true;
    } catch (error) {
      console.error(`Error deleting JSON from ${filePath}:`, error);
      return false;
    }
  }

  /**
   * Get storage path for entity
   */
  static getStoragePath(entity, id) {
    const basePath = config.DB_PATH;
    
    const paths = {
      'institution': path.join(basePath, 'institutions', `${id}.json`),
      'institution-list': path.join(basePath, 'institutions', 'list.json'),
      'student': path.join(basePath, 'students', `${id}.json`),
      'student-list': path.join(basePath, 'students', 'list.json'),
      'certificate': path.join(basePath, 'certificates', `${id}.json`),
      'certificate-list': path.join(basePath, 'certificates', 'list.json'),
      'zkp-proof': path.join(basePath, 'zkp-proofs', `${id}.json`),
      'zkp-proof-list': path.join(basePath, 'zkp-proofs', 'list.json')
    };

    return paths[entity] || path.join(basePath, `${entity}.json`);
  }

  /**
   * Save institution record
   */
  static saveInstitution(institutionData) {
    const filePath = this.getStoragePath('institution', institutionData.address);
    const listPath = this.getStoragePath('institution-list');

    // Save individual record
    this.writeJSON(filePath, institutionData);

    // Update list
    const list = this.readJSON(listPath) || [];
    const index = list.findIndex(i => i.address === institutionData.address);
    
    if (index !== -1) {
      list[index] = institutionData;
    } else {
      list.push(institutionData);
    }

    this.writeJSON(listPath, list);
    return institutionData;
  }

  /**
   * Get institution record
   */
  static getInstitution(address) {
    const filePath = this.getStoragePath('institution', address);
    return this.readJSON(filePath);
  }

  /**
   * Get all institutions
   */
  static getAllInstitutions() {
    const listPath = this.getStoragePath('institution-list');
    return this.readJSON(listPath) || [];
  }

  /**
   * Save certificate record
   */
  static saveCertificate(certificateData) {
    const filePath = this.getStoragePath('certificate', certificateData.id);
    const listPath = this.getStoragePath('certificate-list');

    // Save individual record
    this.writeJSON(filePath, certificateData);

    // Update list
    const list = this.readJSON(listPath) || [];
    const index = list.findIndex(c => c.id === certificateData.id);
    
    if (index !== -1) {
      list[index] = certificateData;
    } else {
      list.push(certificateData);
    }

    this.writeJSON(listPath, list);
    return certificateData;
  }

  /**
   * Get certificate record
   */
  static getCertificate(certificateId) {
    const filePath = this.getStoragePath('certificate', certificateId);
    return this.readJSON(filePath);
  }

  /**
   * Get certificates by student
   */
  static getCertificatesByStudent(studentId) {
    const listPath = this.getStoragePath('certificate-list');
    const list = this.readJSON(listPath) || [];
    return list.filter(c => c.studentId === studentId);
  }

  /**
   * Save ZKP proof
   */
  static saveZKPProof(proofData) {
    const filePath = this.getStoragePath('zkp-proof', proofData.id);
    const listPath = this.getStoragePath('zkp-proof-list');

    // Save individual record
    this.writeJSON(filePath, proofData);

    // Update list
    const list = this.readJSON(listPath) || [];
    const index = list.findIndex(p => p.id === proofData.id);
    
    if (index !== -1) {
      list[index] = proofData;
    } else {
      list.push(proofData);
    }

    this.writeJSON(listPath, list);
    return proofData;
  }

  /**
   * Get ZKP proof
   */
  static getZKPProof(proofId) {
    const filePath = this.getStoragePath('zkp-proof', proofId);
    return this.readJSON(filePath);
  }

  /**
   * List files in directory
   */
  static listFiles(entity) {
    const dir = path.join(config.DB_PATH, entity);
    
    if (!fs.existsSync(dir)) {
      return [];
    }

    return fs.readdirSync(dir).filter(f => f !== 'list.json');
  }

  /**
   * Clear all data (for testing)
   */
  static clearAll() {
    try {
      const dirs = [
        path.join(config.DB_PATH, 'institutions'),
        path.join(config.DB_PATH, 'students'),
        path.join(config.DB_PATH, 'certificates'),
        path.join(config.DB_PATH, 'zkp-proofs')
      ];

      dirs.forEach(dir => {
        if (fs.existsSync(dir)) {
          fs.rmSync(dir, { recursive: true });
        }
      });

      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  }
}

module.exports = StorageUtils;
