/**
 * Check specific certificate status
 */

const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

const RPC_URL = "http://127.0.0.1:8545";
const provider = new ethers.JsonRpcProvider(RPC_URL);

const CERTIFICATE_REGISTRY_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";
const INSTITUTION_REGISTRY_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// From institution portal
const CERTIFICATE_HASH = "0xb10e77d59ecab980ed1680845b515dbda6f9ba630c57002dc5eb7f906b82b173";
const CERTIFICATE_CID = "QmQFEgVoVUirCJrmLQp8tDErGPsoR1G8j5ua2ENe64nXgn";

const getABI = (contractName) => {
  const artifactPath = path.join(
    __dirname,
    "backend/artifacts/contracts",
    `${contractName}.sol`,
    `${contractName}.json`
  );
  const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
  return artifact.abi;
};

async function main() {
  console.log("=== CERTIFICATE STATUS CHECK ===\n");
  
  try {
    const certificateABI = getABI("CertificateRegistry");
    const institutionABI = getABI("InstitutionRegistry");

    const certificateContract = new ethers.Contract(
      CERTIFICATE_REGISTRY_ADDRESS,
      certificateABI,
      provider
    );

    const institutionContract = new ethers.Contract(
      INSTITUTION_REGISTRY_ADDRESS,
      institutionABI,
      provider
    );

    console.log(`Certificate Hash: ${CERTIFICATE_HASH}`);
    console.log(`Certificate CID: ${CERTIFICATE_CID}\n`);

    // Check if certificate exists on blockchain
    console.log("📋 Checking Certificate Registry...");
    const cert = await certificateContract.verifyCertificate(CERTIFICATE_HASH);
    
    console.log(`Cert Hash: ${cert.certHash}`);
    console.log(`Cert CID: ${cert.ipfsCID}`);
    console.log(`Issuer: ${cert.issuer}`);
    console.log(`Student: ${cert.student}`);
    console.log(`Issued At: ${cert.issuedAt ? new Date(Number(cert.issuedAt) * 1000).toLocaleString() : "N/A"}`);
    console.log(`Valid: ${cert.isValid}`);

    if (cert.certHash === '0x0000000000000000000000000000000000000000000000000000000000000000') {
      console.log("\n❌ Certificate NOT found on blockchain!");
      console.log("   This means issueCertificate() transaction did NOT execute.");
      
      // Check if institution is approved
      console.log("\n🔍 Checking Institution Status...");
      const instDetails = await institutionContract.getInstitution("0x70997970C51812dc3A010C7d01b50e0d17dc79C8");
      console.log(`Issuer Approved: ${instDetails.approved}`);
      
      if (!instDetails.approved) {
        console.log("\n⚠️  PROBLEM: Institution is NOT approved!");
        console.log("   Transaction failed because institution lacks approval.");
      }
    } else {
      console.log("\n✅ Certificate IS on blockchain!");
      
      if (cert.isValid) {
        console.log("✅ Certificate is VALID");
      } else {
        console.log("❌ Certificate is INVALID or REVOKED");
        console.log("   Check if revokeCertificate() was called");
      }

      // Verify CID matches
      if (cert.ipfsCID === CERTIFICATE_CID) {
        console.log("✅ CID matches!");
      } else {
        console.log(`❌ CID mismatch!`);
        console.log(`   Expected: ${CERTIFICATE_CID}`);
        console.log(`   Got: ${cert.ipfsCID}`);
      }
    }

  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

main();
