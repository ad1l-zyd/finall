/**
 * Manual Institution Approval Script
 * Approve Account 1 (issuer) using Account 0 (admin)
 */

const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

const RPC_URL = "http://127.0.0.1:8545";
const provider = new ethers.JsonRpcProvider(RPC_URL);

// Hardhat test accounts
const ACCOUNT_0_PK = "0xac0974bec39a17e36ba4a6b4d238ff944bacb476caddcac1f0b9f1dc44b17eaf"; // Admin
const ACCOUNT_1_ADDRESS = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"; // Issuer

// Contract addresses
const INSTITUTION_REGISTRY_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

// Load ABI
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
  console.log("=== MANUAL INSTITUTION APPROVAL ===\n");

  try {
    const institutionABI = getABI("InstitutionRegistry");
    const adminSigner = new ethers.Wallet(ACCOUNT_0_PK, provider);

    console.log(`Admin Account: ${adminSigner.address}`);
    console.log(`Issuer Account (to approve): ${ACCOUNT_1_ADDRESS}\n`);

    const institutionContract = new ethers.Contract(
      INSTITUTION_REGISTRY_ADDRESS,
      institutionABI,
      adminSigner
    );

    // Check current state
    console.log("📋 Current state of issuer account:");
    const details = await institutionContract.getInstitution(ACCOUNT_1_ADDRESS);
    console.log(`   Approved: ${details.approved}`);
    console.log(`   Name: ${details.name || "(empty)"}`);
    console.log();

    // Get pending requests
    const pending = await institutionContract.getPendingInstitutions();
    console.log(`Pending requests: ${pending.length}`);
    
    let foundPending = false;
    for (let i = 0; i < pending.length; i++) {
      if (pending[i].institutionAddr.toLowerCase() === ACCOUNT_1_ADDRESS.toLowerCase()) {
        console.log(`Found pending request at index ${i}`);
        console.log(`  Name: ${pending[i].name}`);
        foundPending = true;
      }
    }

    if (!foundPending && pending.length > 0) {
      console.log("\n⚠️  Warning: No pending request found for Account 1");
      console.log("Pending requests:");
      for (let i = 0; i < pending.length; i++) {
        console.log(`  [${i}] ${pending[i].institutionAddr}`);
      }
    }

    if (!details.approved) {
      console.log("\n🔄 Attempting to approve Account 1...\n");
      const tx = await institutionContract.approveInstitution(ACCOUNT_1_ADDRESS);
      console.log(`Transaction sent: ${tx.hash}`);
      const receipt = await tx.wait();
      console.log(`Transaction mined in block ${receipt.blockNumber}`);

      // Verify approval
      const newDetails = await institutionContract.getInstitution(ACCOUNT_1_ADDRESS);
      console.log(`\n✅ Account 1 approved: ${newDetails.approved}`);
    } else {
      console.log("\n✅ Account 1 is already approved!");
    }

  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

main();
