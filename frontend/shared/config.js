/**
 * Shared configuration for all frontend modules
 */

const CONFIG = {
  // Blockchain configuration
  RPC_URL: "http://127.0.0.1:8545",
  INSTITUTION_REGISTRY_ADDRESS: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  CERTIFICATE_REGISTRY_ADDRESS: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",

  // Backend API configuration
  API_BASE_URL: "http://localhost:3001",
  PINATA_UPLOAD_ENDPOINT: "/api/utility/pinata-upload",

  // Storage keys
  STORAGE_KEY_INSTITUTION_PK: "cred-verif_institution_pk",
  STORAGE_KEY_ADMIN_PK: "cred-verif_admin_pk",
  STORAGE_KEY_STUDENT_PK: "cred-verif_student_pk",
  STORAGE_KEY_EMPLOYER_PK: "cred-verif_employer_pk",

  // Contract ABIs
  INSTITUTION_REGISTRY_ABI: [
    {"inputs":[{"internalType":"address","name":"institutionAddr","type":"address"},{"internalType":"string","name":"did","type":"string"},{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"physicalAddress","type":"string"}],"name":"registerInstitution","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"internalType":"address","name":"institutionAddr","type":"address"},{"internalType":"string","name":"did","type":"string"}],"name":"registerInstitution","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"internalType":"address","name":"institutionAddr","type":"address"}],"name":"removeInstitution","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"internalType":"address","name":"institutionAddr","type":"address"}],"name":"isInstitutionRegistered","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
    {"inputs":[],"name":"getInstitutions","outputs":[{"internalType":"address[]","name":"","type":"address[]"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"address","name":"institutionAddr","type":"address"}],"name":"getInstitution","outputs":[{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"physicalAddress","type":"string"},{"internalType":"string","name":"did","type":"string"},{"internalType":"bool","name":"approved","type":"bool"},{"internalType":"uint256","name":"registeredAt","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"string","name":"physicalAddress","type":"string"}],"name":"getInstitutionByPhysicalAddress","outputs":[{"internalType":"address","name":"institutionAddr","type":"address"},{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"did","type":"string"},{"internalType":"bool","name":"approved","type":"bool"}],"stateMutability":"view","type":"function"},
    {"inputs":[],"name":"getPendingInstitutions","outputs":[{"components":[{"internalType":"address","name":"institutionAddr","type":"address"},{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"physicalAddress","type":"string"},{"internalType":"string","name":"did","type":"string"},{"internalType":"uint256","name":"timestamp","type":"uint256"}],"internalType":"struct InstitutionRegistry.PendingRequest[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"address","name":"institutionAddr","type":"address"}],"name":"approveInstitution","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"internalType":"address","name":"institutionAddr","type":"address"}],"name":"rejectInstitution","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[],"name":"getHistory","outputs":[{"components":[{"internalType":"address","name":"institutionAddr","type":"address"},{"internalType":"string","name":"name","type":"string"},{"internalType":"string","name":"physicalAddress","type":"string"},{"internalType":"string","name":"did","type":"string"},{"internalType":"bool","name":"approved","type":"bool"},{"internalType":"uint256","name":"timestamp","type":"uint256"}],"internalType":"struct InstitutionRegistry.HistoryEntry[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"}
  ],

  CERTIFICATE_REGISTRY_ABI: [
    {"inputs":[{"internalType":"bytes32","name":"certHash","type":"bytes32"},{"internalType":"string","name":"ipfsCID","type":"string"}],"name":"issueCertificate","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"internalType":"bytes32","name":"certHash","type":"bytes32"}],"name":"revokeCertificate","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"internalType":"bytes32","name":"certHash","type":"bytes32"}],"name":"verifyCertificate","outputs":[{"components":[{"internalType":"bytes32","name":"certHash","type":"bytes32"},{"internalType":"string","name":"ipfsCID","type":"string"},{"internalType":"address","name":"issuer","type":"address"},{"internalType":"address","name":"student","type":"address"},{"internalType":"uint256","name":"issuedAt","type":"uint256"},{"internalType":"bool","name":"isValid","type":"bool"}],"internalType":"struct CertificateRegistry.Certificate","name":"","type":"tuple"}],"stateMutability":"view","type":"function"}
  ]
};

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = CONFIG;
}
