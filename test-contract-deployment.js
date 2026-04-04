/**
 * Test script to verify contract deployment
 */

const { ethers } = require('ethers');

const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
const rpcUrl = 'http://127.0.0.1:8545';

async function checkDeployment() {
  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // Check code at address
    console.log('\n=== Checking Contract Deployment ===');
    console.log('Contract Address:', contractAddress);
    
    const code = await provider.getCode(contractAddress);
    console.log('\nCode at address (first 100 chars):', code.substring(0, 100));
    console.log('Code length:', code.length);
    
    if (code === '0x' || code.length < 10) {
      console.log('\n❌ NO CODE DEPLOYED at this address!');
      console.log('The contract needs to be deployed.');
      process.exit(1);
    }
    
    console.log('\n✓ Contract code is deployed');
    
    // Try to call getInstitutions
    const abi = [
      {
        "inputs": [],
        "name": "getInstitutions",
        "outputs": [
          {
            "internalType": "address[]",
            "name": "",
            "type": "address[]"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      }
    ];
    
    const contract = new ethers.Contract(contractAddress, abi, provider);
    
    console.log('\n=== Testing getInstitutions() ===');
    const result = await contract.getInstitutions();
    console.log('Result:', result);
    console.log('Array length:', result.length);
    console.log('\n✓ getInstitutions() works correctly');
    
  } catch (err) {
    console.error('\n❌ Error:', err.message);
    console.error('Full error:', err);
    process.exit(1);
  }
}

checkDeployment();
