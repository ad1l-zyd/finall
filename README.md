# Blockchain-Based Credential Verification System
A complete web application for blockchain-based credential verification with zero-knowledge proofs, implementing a multi-step certificate issuance and verification process.
## Architecture Overview
The system follows these 12 steps for complete credential verification:
 1. Institution Registration Request - Institution registers in portal
 2. Admin Approval - Admin approves institution
 3. Blockchain Registration - Institution added to blockchain registry
 4. Institution Storage - Name, DID, status stored on-chain
 5. Certificate Creation - Certificate JSON with student, institution, and certificate details
 6. Digital Signing - Institution signs certificate digitally
 7. Certificate Hashing - Certificate hashed and added to JSON
 8. IPFS Storage - Certificate stored in IPFS, CID generated
 9. Blockchain CID - CID registered on blockchain
 10. Verification Portal - Employer enters CID on verifier
 11. Verification Display - Partial details shown
 12. ZKP Request/Response - Age and CGPA requirement verified via zero-knowledge proofs
## Project Structure
project-root/
├── backend/ (Node.js + Hardhat backend)
│   ├── contracts/ (Smart contracts)
│   │   ├── InstitutionRegistry.sol
│   │   └── CertificateRegistry.sol
│   ├── scripts/
│   │   └── deploy.js
│   ├── config/
│   │   └── config.js
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── requestLogger.js
│   ├── routes/
│   │   ├── admin.js
│   │   ├── institution.js
│   │   ├── employer.js
│   │   ├── blockchain.js
│   │   └── utility.js
│   ├── services/
│   │   └── certificateService.js
│   ├── utils/
│   │   ├── blockchain.js
│   │   ├── crypto.js
│   │   ├── ipfs.js
│   │   ├── zkp.js
│   │   └── storage.js
│   ├── server.js
│   ├── package.json
│   ├── hardhat.config.js
│   └── .env.example
│
├── frontend/ (React/HTML frontend)
│   ├── admin/
│   ├── institution/
│   ├── employer/
│   └── shared/
│       ├── config.js
│       ├── libs/
│       ├── styles/
│       └── utils/
│
└── package.json
## Quick Start
Prerequisites:
 * Node.js >= 16.0.0
 * npm >= 8.0.0
 * Hardhat (for smart contracts)
 * IPFS node running locally (optional, can use mock mode)
 * MetaMask or compatible Ethereum wallet
Installation:
 1. Clone and install dependencies:
   npm install
   npm run setup
 2. Start Hardhat local node:
   cd backend
   npm run node
 3. Deploy smart contracts:
   cd backend
   npm run deploy-local
 4. Update configuration:
   Copy the contract addresses from deployment output to backend/.env
   cp backend/.env.example backend/.env
Edit backend/.env with:
 * INSTITUTION_REGISTRY_ADDRESS
 * CERTIFICATE_REGISTRY_ADDRESS
 5. Start backend server:
   cd backend
   npm start
   (Server will start on http://localhost:3001)
 6. Access frontend:
 * Admin: http://localhost:3000/admin
 * Institution: http://localhost:3000/institution
 * Employer: http://localhost:3000/employer
## Smart Contracts
InstitutionRegistry:
 * registerInstitution() - Submit registration request
 * approveInstitution() - Admin approval
 * rejectInstitution() - Admin rejection
 * isInstitutionRegistered() - Check registration status
CertificateRegistry:
 * issueCertificate() - Issue certificate with IPFS CID
 * verifyCertificate() - Verify certificate validity
 * revokeCertificate() - Revoke issued certificate
## API Endpoints
Admin API (/api/admin):
 * GET /pending-institutions
 * GET /institutions
 * POST /approve-institution
 * POST /reject-institution
 * GET /history
 * GET /summary
Institution API (/api/institution):
 * POST /register
 * GET /details/:address
 * POST /issue-certificate
 * GET /certificates/:address
 * POST /revoke-certificate
Employer API (/api/employer):
 * POST /register
 * POST /verify-certificate
 * POST /request-zkp-verification
 * GET /zkp-status/:id
Blockchain API (/api/blockchain):
 * GET /chain-info
 * GET /contracts
 * POST /validate-address
 * POST /sign-data
 * POST /verify-signature
Utility API (/api/utility):
 * GET /ipfs-status
 * POST /ipfs-upload-json
 * GET /ipfs-retrieve/:cid
 * POST /zkp-cgpa-proof
 * POST /zkp-age-proof
 * GET /status
## Zero-Knowledge Proofs
The system implements simplified ZKP for proving attributes without revealing sensitive data.
CGPA Proof Example:
POST /api/utility/zkp-cgpa-proof
Input: actualCGPA, minCGPA, nonce
Age Proof Example:
POST /api/utility/zkp-age-proof
Input: birthDate, minAge, nonce
## Data Storage
The backend uses JSON-based storage for development:
 * data/institutions/
 * data/certificates/
 * data/zkp-proofs/
## Security Considerations
 1. Private Keys: Use environment variables
 2. CORS: Configure CORS_ORIGIN in .env
 3. JWT: Set strong JWT_SECRET
 4. HTTPS: Use HTTPS in production
 5. Rate Limiting: Implement for production
 6. Input Validation: All inputs are validated
 7. Digital Signatures: EIP-191 compatible signatures
## Certificate JSON Structure
Contains: id, studentDetails (name, DOB, ID, program, gradYear), institutionDetails (name, DID, place), certDetails (degree, cgpa, major, dates), digitalSignature, hash, and ipfsCID.
## Testing
Run Contract Tests: cd backend && npm test
Run Frontend Tests: cd frontend && npm test
## Environment Variables (Example)
RPC_URL=http://127.0.0.1:8545
CHAIN_ID=31337
INSTITUTION_REGISTRY_ADDRESS=0x...
CERTIFICATE_REGISTRY_ADDRESS=0x...
IPFS_URL=http://127.0.0.1:5001
PORT=3001
JWT_SECRET=your-secret-key-here