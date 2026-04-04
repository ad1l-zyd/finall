const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("╔════════════════════════════════════════════════════════╗");
  console.log("║   Deploying Credential Verification Contracts         ║");
  console.log("╚════════════════════════════════════════════════════════╝");
  console.log();

  // Deploy InstitutionRegistry
  console.log("📋 Deploying InstitutionRegistry...");
  const InstitutionRegistry = await hre.ethers.getContractFactory("InstitutionRegistry");
  const institutionRegistry = await InstitutionRegistry.deploy();
  await institutionRegistry.waitForDeployment();
  const institutionAddr = await institutionRegistry.getAddress();
  console.log("✓ InstitutionRegistry deployed to:", institutionAddr);
  console.log();

  // Deploy CertificateRegistry
  console.log("📜 Deploying CertificateRegistry...");
  const CertificateRegistry = await hre.ethers.getContractFactory("CertificateRegistry");
  const certificateRegistry = await CertificateRegistry.deploy(institutionAddr);
  await certificateRegistry.waitForDeployment();
  const certificateAddr = await certificateRegistry.getAddress();
  console.log("✓ CertificateRegistry deployed to:", certificateAddr);
  console.log();

  // Deploy StudentRegistry
  console.log("👨‍🎓 Deploying StudentRegistry...");
  const StudentRegistry = await hre.ethers.getContractFactory("StudentRegistry");
  const studentRegistry = await StudentRegistry.deploy();
  await studentRegistry.waitForDeployment();
  const studentAddr = await studentRegistry.getAddress();
  console.log("✓ StudentRegistry deployed to:", studentAddr);
  console.log();

  // Save deployment addresses
  const deploymentAddresses = {
    network: hre.network.name,
    chainId: Number((await hre.ethers.provider.getNetwork()).chainId),
    timestamp: new Date().toISOString(),
    contracts: {
      InstitutionRegistry: institutionAddr,
      CertificateRegistry: certificateAddr,
      StudentRegistry: studentAddr
    }
  };

  const deploymentPath = path.join(__dirname, "../deployments.json");
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentAddresses, null, 2));
  console.log("📁 Deployment addresses saved to:", deploymentPath);
  console.log();

  console.log("╔════════════════════════════════════════════════════════╗");
  console.log("║                 DEPLOYMENT COMPLETE                   ║");
  console.log("╠════════════════════════════════════════════════════════╣");
  console.log("║ InstitutionRegistry:  " + institutionAddr.substring(0, 38) + "║");
  console.log("║ CertificateRegistry:  " + certificateAddr.substring(0, 38) + "║");
  console.log("║ StudentRegistry:      " + studentAddr.substring(0, 38) + "║");
  console.log("╚════════════════════════════════════════════════════════╝");
  console.log();
  console.log("Update your .env file with these addresses!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
