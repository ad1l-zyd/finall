// scripts/registerInstitution.js
const hre = require("hardhat");

async function main() {
  // Get available accounts from Hardhat node
  const [admin] = await hre.ethers.getSigners();

  // Attach to deployed InstitutionRegistry contract
  const InstitutionRegistry = await hre.ethers.getContractFactory("InstitutionRegistry");
  const registry = InstitutionRegistry.attach("0xYourContractAddressHere"); // replace with deployed address

  // Institution details
  const institutionAddr = "0xInstitutionAddressHere"; // replace with institution’s Ethereum address
  const did = "did:ethr:" + institutionAddr;

  console.log("Registering institution:", institutionAddr, "with DID:", did);

  // Send transaction
  const tx = await registry.connect(admin).registerInstitution(institutionAddr, did);
  await tx.wait();

  console.log("✅ Institution registered successfully!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
