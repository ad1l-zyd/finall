/**
 * Find actual admin address
 */

const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

const RPC_URL = "http://127.0.0.1:8545";
const provider = new ethers.JsonRpcProvider(RPC_URL);

const INSTITUTION_REGISTRY_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

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
  const institutionABI = getABI("InstitutionRegistry");
  const contract = new ethers.Contract(
    INSTITUTION_REGISTRY_ADDRESS,
    institutionABI,
    provider
  );

  const admin = await contract.admin();
  console.log("Admin address:", admin);
  
  // Hardhat accounts generated from the mnemonic "test test test test test test test test test test test junk"
  console.log("\nThis address is Hardhat's FIRST account (Account 0 in deployment scripts)");
  console.log("Private key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb476caddcac1f0b9f1dc44b17eaf");
}

main();
