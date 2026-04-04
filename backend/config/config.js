/**
 * Configuration file for the credential verification system
 * Loads environment variables and provides centralized config
 */

require('dotenv').config();

module.exports = {
  // Server Configuration
  PORT: parseInt(process.env.PORT || '3001', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  API_URL: process.env.API_URL || 'http://localhost:3001',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',

  // Blockchain Configuration
  RPC_URL: process.env.RPC_URL || 'http://127.0.0.1:8545',
  CHAIN_ID: parseInt(process.env.CHAIN_ID || '31337', 10),
  NETWORK: process.env.NETWORK || 'hardhat',

  // Smart Contract Addresses
  INSTITUTION_REGISTRY_ADDRESS: process.env.INSTITUTION_REGISTRY_ADDRESS || '0x5FbDB2315678afecb367f032d93F642f64180aa3',
  CERTIFICATE_REGISTRY_ADDRESS: process.env.CERTIFICATE_REGISTRY_ADDRESS || '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
  ADMIN_ADDRESS: process.env.ADMIN_ADDRESS || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',

  // IPFS Configuration
  IPFS_URL: process.env.IPFS_URL || 'http://127.0.0.1:5001',
  IPFS_GATEWAY: process.env.IPFS_GATEWAY || 'http://127.0.0.1:8080',
  INFURA_IPFS_URL: process.env.INFURA_IPFS_URL || 'https://ipfs.infura.io:5001',
  INFURA_IPFS_API_KEY: process.env.INFURA_IPFS_API_KEY || '',

  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production',
  JWT_EXPIRY: process.env.JWT_EXPIRY || '24h',

  // Database Configuration
  DB_TYPE: process.env.DB_TYPE || 'json',
  DB_PATH: process.env.DB_PATH || './data',

  // ZKP Configuration
  ZKP_ENABLED: process.env.ZKP_ENABLED === 'true',
  ZKP_CIRCUIT_PATH: process.env.ZKP_CIRCUIT_PATH || './zkp/circuits',
  ZKP_PROVER_PATH: process.env.ZKP_PROVER_PATH || './zkp/provers',

  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
  LOG_FILE: process.env.LOG_FILE || './logs/app.log',

  // Email Configuration
  SMTP_HOST: process.env.SMTP_HOST || '',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587', 10),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  FROM_EMAIL: process.env.FROM_EMAIL || 'noreply@cred-verification.com',

  // File Upload
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),
  UPLOAD_DIR: process.env.UPLOAD_DIR || './uploads',

  // Testing
  TEST_MODE: process.env.TEST_MODE === 'true',
  MOCK_IPFS: process.env.MOCK_IPFS === 'true',

  // Contract ABIs
  INSTITUTION_REGISTRY_ABI: [
    {
      inputs: [{ internalType: 'address', name: 'institutionAddr', type: 'address' }, { internalType: 'string', name: 'did', type: 'string' }, { internalType: 'string', name: 'name', type: 'string' }, { internalType: 'string', name: 'physicalAddress', type: 'string' }],
      name: 'registerInstitution',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [{ internalType: 'address', name: 'institutionAddr', type: 'address' }],
      name: 'approveInstitution',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [{ internalType: 'address', name: 'institutionAddr', type: 'address' }],
      name: 'rejectInstitution',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [{ internalType: 'address', name: 'institutionAddr', type: 'address' }],
      name: 'removeInstitution',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [{ internalType: 'address', name: 'institutionAddr', type: 'address' }],
      name: 'isInstitutionRegistered',
      outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [],
      name: 'getPendingInstitutions',
      outputs: [{ components: [{ internalType: 'address', name: 'institutionAddr', type: 'address' }, { internalType: 'string', name: 'name', type: 'string' }, { internalType: 'string', name: 'physicalAddress', type: 'string' }, { internalType: 'string', name: 'did', type: 'string' }, { internalType: 'uint256', name: 'timestamp', type: 'uint256' }], internalType: 'struct InstitutionRegistry.PendingRequest[]', name: '', type: 'tuple[]' }],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [],
      name: 'getInstitutions',
      outputs: [{ internalType: 'address[]', name: '', type: 'address[]' }],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [{ internalType: 'address', name: 'institutionAddr', type: 'address' }],
      name: 'getInstitution',
      outputs: [{ internalType: 'string', name: '', type: 'string' }, { internalType: 'string', name: '', type: 'string' }, { internalType: 'string', name: '', type: 'string' }, { internalType: 'bool', name: '', type: 'bool' }, { internalType: 'uint256', name: '', type: 'uint256' }],
      stateMutability: 'view',
      type: 'function'
    },
    {
      inputs: [],
      name: 'getHistory',
      outputs: [{ components: [{ internalType: 'address', name: 'institutionAddr', type: 'address' }, { internalType: 'string', name: 'name', type: 'string' }, { internalType: 'string', name: 'physicalAddress', type: 'string' }, { internalType: 'string', name: 'did', type: 'string' }, { internalType: 'bool', name: 'approved', type: 'bool' }, { internalType: 'uint256', name: 'timestamp', type: 'uint256' }], internalType: 'struct InstitutionRegistry.HistoryEntry[]', name: '', type: 'tuple[]' }],
      stateMutability: 'view',
      type: 'function'
    }
  ],

  CERTIFICATE_REGISTRY_ABI: [
    {
      inputs: [{ internalType: 'address', name: 'registryAddr', type: 'address' }],
      stateMutability: 'nonpayable',
      type: 'constructor'
    },
    {
      inputs: [{ internalType: 'bytes32', name: 'certHash', type: 'bytes32' }, { internalType: 'string', name: 'ipfsCID', type: 'string' }],
      name: 'issueCertificate',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [{ internalType: 'bytes32', name: 'certHash', type: 'bytes32' }],
      name: 'revokeCertificate',
      outputs: [],
      stateMutability: 'nonpayable',
      type: 'function'
    },
    {
      inputs: [{ internalType: 'bytes32', name: 'certHash', type: 'bytes32' }],
      name: 'verifyCertificate',
      outputs: [{ components: [{ internalType: 'bytes32', name: 'certHash', type: 'bytes32' }, { internalType: 'string', name: 'ipfsCID', type: 'string' }, { internalType: 'address', name: 'issuer', type: 'address' }, { internalType: 'bool', name: 'isValid', type: 'bool' }], internalType: 'struct CertificateRegistry.Certificate', name: '', type: 'tuple' }],
      stateMutability: 'view',
      type: 'function'
    }
  ]
};
