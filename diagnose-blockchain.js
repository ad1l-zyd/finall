/**
 * Diagnostic tool to check certificate status in blockchain
 */

const { ethers } = require('ethers');

const INSTITUTION_REGISTRY = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const CERTIFICATE_REGISTRY = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512';
const RPC_URL = 'http://127.0.0.1:8545';

const CERT_ABI = [
  {
    inputs: [{ name: 'certHash', type: 'bytes32' }],
    name: 'verifyCertificate',
    outputs: [
      {
        components: [
          { name: 'certHash', type: 'bytes32' },
          { name: 'ipfsCID', type: 'string' },
          { name: 'issuer', type: 'address' },
          { name: 'isValid', type: 'bool' }
        ],
        name: '',
        type: 'tuple'
      }
    ],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'institution', type: 'address' }],
    name: 'getIssuedCertificates',
    outputs: [{ name: '', type: 'bytes32[]' }],
    stateMutability: 'view',
    type: 'function'
  }
];

const INST_ABI = [
  {
    inputs: [],
    name: 'getInstitutions',
    outputs: [{ name: '', type: 'address[]' }],
    stateMutability: 'view',
    type: 'function'
  },
  {
    inputs: [{ name: 'inst', type: 'address' }],
    name: 'getInstitution',
    outputs: [
      { name: 'name', type: 'string' },
      { name: 'physicalAddress', type: 'string' },
      { name: 'did', type: 'string' },
      { name: 'approved', type: 'bool' },
      { name: 'registeredAt', type: 'uint256' }
    ],
    stateMutability: 'view',
    type: 'function'
  }
];

async function diagnoseBlockchain() {
  try {
    const provider = new ethers.JsonRpcProvider(RPC_URL);
    
    console.log('\n=== BLOCKCHAIN DIAGNOSTIC ===\n');
    
    // Check registered institutions
    const instContract = new ethers.Contract(INSTITUTION_REGISTRY, INST_ABI, provider);
    const institutions = await instContract.getInstitutions();
    
    console.log(`Found ${institutions.length} registered institution(s):`);
    for (let inst of institutions) {
      try {
        const details = await instContract.getInstitution(inst);
        const [name, physical, did, approved] = details;
        console.log(`  ✓ ${name} (${ethers.getAddress(inst)})`);
        console.log(`    - Approved: ${approved}`);
        
        // Check certificates issued by this institution
        const certContract = new ethers.Contract(CERTIFICATE_REGISTRY, CERT_ABI, provider);
        const certs = await certContract.getIssuedCertificates(inst);
        console.log(`    - Issued ${certs.length} certificate(s)`);
        
        if (certs.length > 0) {
          console.log('      Certificates:');
          for (let i = 0; i < certs.length; i++) {
            const cert = await certContract.verifyCertificate(certs[i]);
            console.log(`        [${i}] Hash: ${certs[i]}`);
            console.log(`            CID: ${cert.ipfsCID}`);
            console.log(`            Valid: ${cert.isValid}`);
            console.log(`            Issuer: ${ethers.getAddress(cert.issuer)}`);
          }
        }
      } catch (err) {
        console.log(`  ❌ Error reading institution: ${err.message}`);
      }
    }
    
    if (institutions.length === 0) {
      console.log('❌ No registered institutions found!');
      console.log('   Institutions must be registered AND approved before issuing certificates.');
    }
    
  } catch (err) {
    console.error('\n❌ Diagnostic error:', err.message);
    process.exit(1);
  }
}

diagnoseBlockchain();
