/**
 * Certificate Upload to Pinata + Blockchain
 * Complete workflow example
 */

const axios = require('axios');
const fs = require('fs');

// Configuration
const BACKEND_URL = 'http://localhost:3001';
const PINATA_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI2NzNkOWZkYS1mMmVjLTQwMGYtOTg0YS0yZjJiMzM1NTcyNTciLCJlbWFpbCI6ImFkaWwuenlkNzU5NEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiNDhjZTZkY2NlYmIwNmE4YjE3OTgiLCJzY29wZWRLZXlTZWNyZXQiOiJhYTMwYzE0YzkwNDQwMWE4NTAzYTk1N2RmMjNkZTExMTc3YjA1ZDRjZWRkN2QzMTdmNWVhNjg2ZjdiZjQwZmMxIiwiZXhwIjoxODA2ODQ0OTE5fQ.gmgV36BWpEibzlaLjHQ7MgcZVm4h1FR-jU3dIMZwC3k';

/**
 * Step 1: Upload certificate to Pinata
 */
async function uploadToPinata(certificateData) {
  console.log('\n📤 Uploading certificate to Pinata...');
  
  try {
    const response = await axios.post(`${BACKEND_URL}/api/utility/pinata-upload`, {
      certificateData: certificateData,
      pinataJWT: PINATA_JWT
    });

    const { cid, certHash, ipfsUrl } = response.data;
    
    console.log('✅ Upload successful!');
    console.log(`  CID: ${cid}`);
    console.log(`  Certificate Hash: ${certHash}`);
    console.log(`  IPFS URL: ${ipfsUrl}`);
    
    return { cid, certHash, ipfsUrl };
  } catch (error) {
    console.error('❌ Upload failed:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Step 2: Update JSON with CID and submit to blockchain
 */
async function submitToBlockchain(
  certificateData,
  cid,
  certHash,
  institutionAddress,
  institutionPrivateKey
) {
  console.log('\n📝 Certificate data with CID:');
  
  const completeData = {
    ...certificateData,
    ipfsCID: cid,
    certHash: certHash,
    blockchainSubmittedAt: new Date().toISOString()
  };
  
  console.log(JSON.stringify(completeData, null, 2));
  
  console.log('\n⛓️  Ready to submit to blockchain!');
  console.log(`  Institution Address: ${institutionAddress}`);
  console.log(`  Certificate Hash: ${certHash}`);
  console.log(`  IPFS CID: ${cid}`);
  
  return completeData;
}

/**
 * Test Pinata connection
 */
async function testPinataConnection() {
  console.log('\n🔗 Testing Pinata connection...');
  
  try {
    const response = await axios.post(`${BACKEND_URL}/api/utility/pinata-test`, {
      pinataJWT: PINATA_JWT
    });
    
    if (response.data.success) {
      console.log('✅ Connected to Pinata!');
      console.log(`  User: ${response.data.data.email}`);
    } else {
      console.log('❌ Connection failed:', response.data.message);
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ Connection test failed:', error.response?.data || error.message);
    throw error;
  }
}

/**
 * Main workflow
 */
async function main() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║   Certificate Upload to Pinata + Blockchain          ║');
  console.log('╚════════════════════════════════════════════════════════╝');
  
  try {
    // Test connection first
    await testPinataConnection();
    
    // Sample certificate data (without CID)
    const certificateData = {
      studentName: "John Doe",
      certificateType: "Bachelor of Science in Computer Science",
      issuerName: "ABC University",
      issuerAddress: "0x70997970C51812e339D9B73b0245ad39437eSc5d",
      issuanceDate: "2024-05-15",
      studentId: "STU-2024-001",
      gpa: "3.85",
      achievements: ["Dean's List", "Honor Roll"]
    };
    
    console.log('\n📋 Certificate Data (without CID):');
    console.log(JSON.stringify(certificateData, null, 2));
    
    // Step 1: Upload to Pinata
    const { cid, certHash, ipfsUrl } = await uploadToPinata(certificateData);
    
    // Step 2: Prepare for blockchain submission
    const completeData = await submitToBlockchain(
      certificateData,
      cid,
      certHash,
      "0x70997970C51812e339D9B73b0245ad39437eSc5d",
      "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
    );
    
    console.log('\n💾 Save this data to submit on-chain:');
    console.log(JSON.stringify(completeData, null, 2));
    
    // Save to file for reference
    const outputFile = 'certificate-with-cid.json';
    fs.writeFileSync(outputFile, JSON.stringify(completeData, null, 2));
    console.log(`\n✅ Saved to ${outputFile}`);
    
  } catch (error) {
    console.error('\n❌ Workflow failed:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  uploadToPinata,
  submitToBlockchain,
  testPinataConnection
};
