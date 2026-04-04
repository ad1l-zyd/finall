/**
 * Diagnostic: Employer verification failure
 * Investigates why certificates fail verification despite being issued
 */

const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

const RPC_URL = "http://127.0.0.1:8545";
const provider = new ethers.JsonRpcProvider(RPC_URL);

// Contract addresses (from deployment)
const INSTITUTION_REGISTRY_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const CERTIFICATE_REGISTRY_ADDRESS = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";

// Load ABIs
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
  console.log("=== EMPLOYER VERIFICATION DIAGNOSTIC ===\n");

  try {
    // Load contracts
    const institutionABI = getABI("InstitutionRegistry");
    const certificateABI = getABI("CertificateRegistry");

    const institutionContract = new ethers.Contract(
      INSTITUTION_REGISTRY_ADDRESS,
      institutionABI,
      provider
    );

    const certificateContract = new ethers.Contract(
      CERTIFICATE_REGISTRY_ADDRESS,
      certificateABI,
      provider
    );

    // Check registered institutions
    console.log("📋 REGISTERED INSTITUTIONS:");
    const institutions = await institutionContract.getInstitutions();
    console.log(`Found ${institutions.length} institution(s)\n`);

    for (const inst of institutions) {
      const details = await institutionContract.getInstitution(inst);
      const institutionName = details.name && details.name.trim() ? details.name : "(No name registered)";
      console.log(`  📌 ${institutionName}`);
      console.log(`     Address: ${inst}`);
      console.log(`     Status: ${details.approved ? "✓ APPROVED" : "✗ NOT APPROVED"}`);

      // Check certificates issued by this institution
      const issuedHashes = await certificateContract.getIssuedCertificates(inst);
      console.log(`     Certificates issued: ${issuedHashes.length}`);

      if (issuedHashes.length > 0) {
        for (let i = 0; i < issuedHashes.length; i++) {
          const hash = issuedHashes[i];
          const cert = await certificateContract.verifyCertificate(hash);
          console.log(`       [${i + 1}] Hash: ${hash}`);
          console.log(`           CID: ${cert.ipfsCID}`);
          console.log(`           Valid: ${cert.isValid ? "✓ YES" : "✗ NO"}`);
          console.log(`           Student: ${cert.student}`);
          console.log(`           Issued: ${new Date(Number(cert.issuedAt) * 1000).toLocaleString()}`);
        }
      }
      console.log();
    }

    // Check pending requests
    console.log("⏳ PENDING INSTITUTION REQUESTS:");
    const pending = await institutionContract.getPendingInstitutions();
    console.log(`Found ${pending.length} pending request(s)\n`);

    if (pending.length > 0) {
      for (let i = 0; i < pending.length; i++) {
        const req = pending[i];
        console.log(`  [${i + 1}] ${req.name || "(No name)"}`);
        console.log(`       Address: ${req.institutionAddr}`);
        console.log(`       DID: ${req.did}`);
        console.log(`       Physical Address: ${req.physicalAddress || "(Not provided)"}`);
        console.log(`       Requested: ${new Date(Number(req.timestamp) * 1000).toLocaleString()}`);
        console.log(`       ⚠️  REQUIRES ADMIN APPROVAL TO ISSUE CERTIFICATES`);
        console.log();
      }
    }

    console.log("📝 VERIFICATION TEST:");
    console.log("To test employer verification, compute the same hash:");
    console.log("  1. Get the exact certificate text from the issuer portal");
    console.log("  2. Compute: ethers.keccak256(ethers.toUtf8Bytes(text))");
    console.log("  3. Use that hash in the employer verification portal");
    console.log("\n⚠️  COMMON ISSUES:");
    console.log("  - Hash mismatch: Form text trimming/whitespace differences");
    console.log("  - Missing issuance: Transaction failed but UI showed success");
    console.log("  - Wrong institution: Certificate issued by different account");

  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

main();
