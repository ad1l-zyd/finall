# Credential Verification System - Blockchain Backend

This directory contains the Ethereum smart contracts for the credential verification system using Hardhat.

## Quick Start

### Installation

```bash
npm install
```

### Running a Local Hardhat Node

```bash
npm run node
```

This starts a local Ethereum node on `http://127.0.0.1:8545` with 20 pre-funded accounts (each with 10,000 ETH).

### Deploying Contracts

In a new terminal:

```bash
npm run deploy-local
```

This deploys both `InstitutionRegistry` and `CertificateRegistry` contracts.

### Running Tests

```bash
npm test
```

### Compiling Contracts

```bash
npm run compile
```

## Smart Contracts

### InstitutionRegistry.sol

- Manages institution registration requests and approvals
- Admin-controlled approval workflow
- Stores institution details (name, physical address, DID)

### CertificateRegistry.sol

- Allows registered institutions to issue certificates
- Stores certificate hashes and IPFS references
- Provides certificate verification functionality

## Project Structure

```
backend/
├── contracts/         # Solidity smart contracts
├── scripts/          # Deployment and interaction scripts
├── test/             # Test files
├── ignition/         # Hardhat Ignition modules
├── artifacts/        # Compiled contract outputs
└── cache/            # Hardhat cache
```

## Development

### Useful Commands

- `npx hardhat accounts` - List all accounts and balances
- `npx hardhat help` - Show Hardhat help
- `REPORT_GAS=true npm test` - Run tests with gas reports

### Contract Deployment on Local Network

After running `npm run node`, deploy with:

```bash
npm run deploy-local
```

This outputs the contract addresses needed for frontend configuration.

## Configuration

Network configuration is in `hardhat.config.js`. Default RPC URL for local development is `http://127.0.0.1:8545`.

## Environment Variables

Create a `.env` file for production deployments (not included in repo):

```
PRIVATE_KEY=<your-private-key>
ETHERSCAN_API_KEY=<your-api-key>
INFURA_API_KEY=<your-key>
```

## License

MIT
