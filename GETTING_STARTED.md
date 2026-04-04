# Getting Started Guide

Complete step-by-step guide to set up and run the Credential Verification System.

## Prerequisites

Before starting, ensure you have:

- **Node.js** >= 16.0.0 ([Download](https://nodejs.org/))
- **npm** >= 8.0.0 (included with Node.js)
- **Git** for cloning the repository
- **MetaMask** or compatible Ethereum wallet (for testing)
- **Hardhat** (will be installed via npm)

### Optional

- **IPFS** local node for certificate storage (can use mock mode)
- **VS Code** or any code editor
- **Postman** for testing API endpoints

## Step 1: Installation

### 1.1 Clone and Navigate

```bash
# Navigate to project directory
cd cred-verification

# Install all dependencies
npm install
```

### 1.2 Setup Environment

```bash
# Create environment file
cd backend
cp .env.example .env
```

Edit `backend/.env` and set:

```env
# Network configuration
RPC_URL=http://127.0.0.1:8545
CHAIN_ID=31337
NETWORK=hardhat

# Temporary placeholders (will update after deployment)
INSTITUTION_REGISTRY_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
CERTIFICATE_REGISTRY_ADDRESS=0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9

# Server
PORT=3001
NODE_ENV=development

# Admin address (for testing)
ADMIN_ADDRESS=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
```

## Step 2: Start Hardhat Node

The Hardhat node is a local Ethereum blockchain for development.

```bash
cd backend

# Start the local blockchain node
npm run node
```

You should see output:

```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/
```

**Keep this terminal open!** The node must run while testing.

### Test Accounts Available

Hardhat provides 20 pre-funded test accounts:

```
Account 0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (1000 ETH)
Account 1: 0x70997970C51812e339D9B73b0245ad39437eSc5d (1000 ETH)
Account 2: 0x3C44CdDdB6a900c6D2b8371300141F16C21f97ef (1000 ETH)
... and more
```

Private keys are printed in the terminal.

## Step 3: Deploy Smart Contracts

In a **new terminal** (keep the Hardhat node running):

```bash
cd backend

# Deploy to local network
npm run deploy-local
```

You'll see output like:

```
📋 Deploying InstitutionRegistry...
✓ InstitutionRegistry deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3

📜 Deploying CertificateRegistry...
✓ CertificateRegistry deployed to: 0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9

👨‍🎓 Deploying StudentRegistry...
✓ StudentRegistry deployed to: 0x8A791620dd6260a716120dDA047c1f35b57d437B
```

### Update Environment

Copy the contract addresses and update `backend/.env`:

```env
INSTITUTION_REGISTRY_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3
CERTIFICATE_REGISTRY_ADDRESS=0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9
STUDENT_REGISTRY_ADDRESS=0x8A791620dd6260a716120dDA047c1f35b57d437B
```

Also update frontend config at `frontend/shared/config.js`:

```javascript
INSTITUTION_REGISTRY_ADDRESS: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
CERTIFICATE_REGISTRY_ADDRESS: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
```

## Step 4: Start Backend Server

In a **new terminal**:

```bash
cd backend

# Start the backend API server
npm start
```

You should see:

```
╔════════════════════════════════════════════════════════════╗
║   Credential Verification System - Backend Server          ║
╠════════════════════════════════════════════════════════════╣
║  Status: ✓ Running                                          ║
║  Port: 3001                                                 ║
║  Environment: development                                  ║
...
```

### Test Backend

```bash
# Check if server is running
curl http://localhost:3001/health

# Output should be:
{
  "status": "ok",
  "timestamp": "2024-04-04T10:00:00.000Z",
  "environment": "development",
  "network": "hardhat"
}
```

## Step 5: Test Frontend

The frontend files are ready to use. You can open them directly or serve via a local server.

### Option A: Direct File Access

Open in your browser:

- Admin: `file://<PATH>/frontend/admin/index.html`
- Institution: `file://<PATH>/frontend/institution/index.html`
- Student: `file://<PATH>/frontend/student/index.html`
- Employer: `file://<PATH>/frontend/employer/index.html`

### Option B: Local Server (Recommended)

```bash
# Using Python 3
cd frontend
python -m http.server 3000

# Or using Node.js http-server
npm install -g http-server
http-server frontend -p 3000
```

Access at: `http://localhost:3000`

## Step 6: Test the Complete Flow

### 6.1 Admin Approves Institution

1. Open Admin Dashboard: `http://localhost:3000/admin`
2. Import a test private key from Hardhat
3. Go to "Approvals Pending" tab
4. Register an institution (using an account address)
5. Approve the institution registration

### 6.2 Institution Issues Certificate

1. Open Institution Dashboard
2. Register/Login with the approved institution address
3. Issue a certificate for a student
4. View newly created certificates

### 6.3 Student Views Certificates

1. Open Student Dashboard
2. Enter student ID
3. View certificates issued

### 6.4 Employer Verifies Certificate

1. Open Employer Dashboard
2. Enter certificate CID
3. Verify certificate
4. Request ZKP proofs for CGPA/Age
5. View verification status

## Testing with API Endpoints

### Using curl

```bash
# Check system health
curl http://localhost:3001/health

# Get pending institutions
curl http://localhost:3001/api/admin/pending-institutions

# Get registered institutions
curl http://localhost:3001/api/admin/institutions

# Verify a certificate
curl -X POST http://localhost:3001/api/employer/verify-certificate \
  -H "Content-Type: application/json" \
  -d '{
    "certificateHash": "0x..."
  }'
```

### Using Postman

1. Import the API collection (create if needed)
2. Set base URL: `http://localhost:3001`
3. Create requests for each endpoint
4. Save for later use

## Troubleshooting

### Issue: "Connection refused" on port 8545

**Solution**: Make sure the Hardhat node is running in another terminal:

```bash
cd backend
npm run node
```

### Issue: "Contract not found at address"

**Solution**: Contract addresses in `.env` don't match deployment output. Redeploy:

```bash
npm run deploy-local
# Copy new addresses to .env
```

### Issue: "No such file" for ethers.js

**Solution**: Copy ethers library to frontend:

```bash
cp libs/ethers.umd.min.js frontend/shared/libs/
```

### Issue: CORS errors from frontend

**Solution**: Ensure `CORS_ORIGIN` in `.env` includes your frontend:

```env
CORS_ORIGIN=http://localhost:3000,http://localhost:3001
```

### Issue: "Private key required" in frontend

**Solution**: When prompted, paste a test account private key from Hardhat output. It will be saved in localStorage.

## Next Steps

### For Development

1. Explore the smart contracts in `backend/contracts/`
2. Review API endpoints in `backend/routes/`
3. Test with Hardhat tests: `cd backend && npm test`
4. Deploy to testnet (Sepolia, Mumbai, etc.)

### For Production

1. Use a real database instead of JSON storage
2. Implement proper authentication and authorization
3. Deploy to mainnet or production testnet
4. Set up SSL/TLS certificates
5. Configure rate limiting and monitoring
6. Use environment secrets management
7. Implement proper logging and analytics

## Useful Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [Ethereum Development](https://ethereum.org/developers)
- [Smart Contract Security](https://smartcontractresearch.org/)
- [IPFS Documentation](https://docs.ipfs.io/)
- [MetaMask Integration](https://docs.metamask.io/)

## Support

For issues:

1. Check the main README: `README_COMPLETE.md`
2. Review error messages in console
3. Check blockchain node logs
4. Check backend server logs
5. Check browser console for frontend errors

---

**Happy developing! 🚀**
