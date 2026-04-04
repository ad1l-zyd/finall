# Blockchain-Based Credential Verification System

A complete web application for blockchain-based credential verification with zero-knowledge proofs, implementing a multi-step certificate issuance and verification process.

## 🏗️ Architecture Overview

The system follows these 15 steps for complete credential verification:

1. **Institution Registration Request** - Institution registers in portal
2. **Admin Approval** - Admin approves institution
3. **Blockchain Registration** - Institution added to blockchain registry
4. **Institution Storage** - Name, DID, status stored on-chain
5. **Certificate Creation** - Certificate JSON with student, institution, and certificate details
6. **Digital Signing** - Institution signs certificate digitally
7. **Student Wallet** - Certificate copy sent to student
8. **Certificate Hashing** - Certificate hashed and added to JSON
9. **IPFS Storage** - Certificate stored in IPFS, CID generated
10. **Blockchain CID** - CID registered on blockchain
11. **Employer Sharing** - Certificate with CID sent to employer
12. **Verification Portal** - Employer enters CID on verifier
13. **Verification Display** - Partial details shown
14. **ZKP Request** - Age and CGPA requirement via zero-knowledge proofs
15. **ZKP Submission** - Student generates and returns ZKP

## 📁 Project Structure

```
project-root/
├── backend/                          # Node.js + Hardhat backend
│   ├── contracts/                    # Smart contracts
│   │   ├── InstitutionRegistry.sol  # Institution management
│   │   ├── CertificateRegistry.sol  # Certificate management
│   │   └── StudentRegistry.sol      # Student registration
│   ├── scripts/
│   │   └── deploy.js               # Deployment script
│   ├── config/
│   │   └── config.js               # Configuration management
│   ├── middleware/                  # Express middleware
│   │   ├── auth.js                 # JWT authentication
│   │   ├── errorHandler.js         # Error handling
│   │   └── requestLogger.js        # Request logging
│   ├── routes/                      # API endpoints
│   │   ├── admin.js                # Admin endpoints
│   │   ├── institution.js          # Institution endpoints
│   │   ├── student.js              # Student endpoints
│   │   ├── employer.js             # Employer endpoints
│   │   ├── blockchain.js           # Blockchain endpoints
│   │   └── utility.js              # Utility endpoints
│   ├── services/
│   │   └── certificateService.js   # Certificate business logic
│   ├── utils/                       # Utility modules
│   │   ├── blockchain.js           # Blockchain interaction
│   │   ├── crypto.js               # Cryptography utilities
│   │   ├── ipfs.js                 # IPFS integration
│   │   ├── zkp.js                  # Zero-knowledge proofs
│   │   └── storage.js              # Data storage
│   ├── server.js                   # Express server entry point
│   ├── package.json                # Node dependencies
│   ├── hardhat.config.js          # Hardhat configuration
│   └── .env.example               # Environment template
│
├── frontend/                         # React/HTML frontend
│   ├── admin/                       # Admin dashboard
│   ├── institution/                 # Institution dashboard
│   ├── student/                     # Student dashboard
│   ├── employer/                    # Employer dashboard
│   └── shared/                      # Shared resources
│       ├── config.js               # Frontend configuration
│       ├── libs/                   # Libraries (ethers.js)
│       ├── styles/                 # CSS styles
│       └── utils/                  # Utility scripts
│
└── package.json                     # Root package configuration
```

## 🚀 Quick Start

### Prerequisites

- Node.js >= 16.0.0
- npm >= 8.0.0
- Hardhat (for smart contracts)
- IPFS node running locally (optional, can use mock mode)
- MetaMask or compatible Ethereum wallet

### Installation

1. **Clone and install dependencies:**

```bash
npm install
npm run setup
```

2. **Start Hardhat local node (in one terminal):**

```bash
cd backend
npm run node
```

3. **Deploy smart contracts (in another terminal):**

```bash
cd backend
npm run deploy-local
```

4. **Update configuration:**
   Copy the contract addresses from deployment output to `backend/.env`:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` with:

- `INSTITUTION_REGISTRY_ADDRESS`
- `CERTIFICATE_REGISTRY_ADDRESS`
- Student Registry address

5. **Start backend server (in another terminal):**

```bash
cd backend
npm start
```

Server will start on `http://localhost:3001`

6. **Access frontend:**

- Admin: `http://localhost:3000/admin`
- Institution: `http://localhost:3000/institution`
- Student: `http://localhost:3000/student`
- Employer: `http://localhost:3000/employer`

## 🔧 Smart Contracts

### InstitutionRegistry

Manages institution registration and approval workflow.

**Key Functions:**

- `registerInstitution()` - Submit registration request
- `approveInstitution()` - Admin approval
- `rejectInstitution()` - Admin rejection
- `isInstitutionRegistered()` - Check registration status

### CertificateRegistry

Manages certificate issuance and verification.

**Key Functions:**

- `issueCertificate()` - Issue certificate with IPFS CID
- `verifyCertificate()` - Verify certificate validity
- `revokeCertificate()` - Revoke issued certificate
- `getReceivedCertificates()` - Get student's certificates

### StudentRegistry

Manages student identity and registration.

**Key Functions:**

- `registerStudent()` - Register new student
- `getStudent()` - Get student details
- `isStudentRegistered()` - Check registration

## 🌐 API Endpoints

### Admin API (`/api/admin`)

```
GET  /pending-institutions      Get pending requests
GET  /institutions              Get registered institutions
POST /approve-institution       Approve institution
POST /reject-institution        Reject institution
GET  /history                   Get approval history
GET  /summary                   Get dashboard summary
```

### Institution API (`/api/institution`)

```
POST /register                  Register institution
GET  /details/:address          Get institution details
POST /issue-certificate         Issue certificate
GET  /certificates/:address     Get issued certificates
POST /revoke-certificate        Revoke certificate
```

### Student API (`/api/student`)

```
POST /register                  Register student
GET  /certificates/:studentId   Get student certificates
POST /generate-zkp-proofs       Generate ZKP proofs
POST /share-certificate         Share with employer
GET  /profile/:studentId        Get student profile
```

### Employer API (`/api/employer`)

```
POST /register                  Register employer
POST /verify-certificate        Verify certificate
POST /request-zkp-verification  Request ZKP proofs
GET  /zkp-status/:id           Check ZKP status
```

### Blockchain API (`/api/blockchain`)

```
GET  /chain-info               Get chain info
GET  /contracts                Get contract addresses
POST /validate-address         Validate Ethereum address
POST /sign-data               Sign data with private key
POST /verify-signature        Verify signature
```

### Utility API (`/api/utility`)

```
GET  /ipfs-status             Check IPFS availability
POST /ipfs-upload-json        Upload to IPFS
GET  /ipfs-retrieve/:cid      Retrieve from IPFS
POST /zkp-cgpa-proof          Generate CGPA proof
POST /zkp-age-proof           Generate age proof
GET  /status                  System status
```

## 🔐 Zero-Knowledge Proofs

The system implements simplified ZKP for proving attributes without revealing sensitive data:

### CGPA Proof

Proves CGPA >= minimum without revealing actual CGPA:

```javascript
POST /api/utility/zkp-cgpa-proof
{
  "actualCGPA": 3.8,
  "minCGPA": 3.5,
  "studentId": "STU001",
  "nonce": "random_hex_string"
}
```

### Age Proof

Proves Age >= minimum without revealing date of birth:

```javascript
POST /api/utility/zkp-age-proof
{
  "birthDate": "2000-01-15",
  "minAge": 18,
  "studentId": "STU001",
  "nonce": "random_hex_string"
}
```

## 💾 Data Storage

The backend uses JSON-based storage for development (can be replaced with database):

```
data/
├── institutions/     # Institution records
├── students/         # Student records
├── certificates/     # Certificate records
└── zkp-proofs/       # ZKP requests and proofs
```

## 🔐 Security Considerations

1. **Private Keys**: Use environment variables, never commit to repo
2. **CORS**: Configure `CORS_ORIGIN` in `.env`
3. **JWT**: Set strong `JWT_SECRET` in production
4. **HTTPS**: Use HTTPS in production
5. **Rate Limiting**: Implement rate limiting for production
6. **Input Validation**: All inputs are validated
7. **Digital Signatures**: EIP-191 compatible signatures

## 📚 Certificate JSON Structure

```json
{
  "id": "uuid",
  "studentDetails": {
    "name": "Student Name",
    "DOB": "2000-01-15",
    "id": "STU001",
    "program": "Computer Science",
    "gradYear": 2024
  },
  "institutionDetails": {
    "name": "University Name",
    "did": "did:web:university.edu",
    "place": "City, Country"
  },
  "certDetails": {
    "degree": "Bachelor of Science",
    "cgpa": 3.8,
    "major": "Computer Science",
    "issueDate": "2024-05-20T10:00:00.000Z",
    "validity": "2034-05-20T10:00:00.000Z"
  },
  "digitalSignature": "0x...",
  "hash": "0x...",
  "ipfsCID": "Qm..."
}
```

## 🧪 Testing

### Run Contract Tests

```bash
cd backend
npm test
```

### Run Frontend Tests

```bash
cd frontend
npm test
```

## 📦 Environment Variables

See `backend/.env.example` for all available options:

```bash
# Blockchain
RPC_URL=http://127.0.0.1:8545
CHAIN_ID=31337
NETWORK=hardhat

# Smart Contracts
INSTITUTION_REGISTRY_ADDRESS=0x...
CERTIFICATE_REGISTRY_ADDRESS=0x...
STUDENT_REGISTRY_ADDRESS=0x...

# IPFS
IPFS_URL=http://127.0.0.1:5001
IPFS_GATEWAY=http://127.0.0.1:8080

# Server
PORT=3001
NODE_ENV=development

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRY=24h
```

## 🐳 Docker Deployment (Optional)

Create a `Dockerfile` for containerized deployment:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3001
CMD ["npm", "start"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

MIT License

## 📞 Support

For issues and questions:

1. Check existing documentation
2. Review smart contract code comments
3. Check backend API logs
4. Review blockchain transaction details

---

**Last Updated:** April 4, 2026
**Version:** 1.0.0
