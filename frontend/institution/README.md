# Institution Dashboard

The institution dashboard allows registered institutions to manage certificate issuance and registration.

## Features

- **Institution Registry**: Submit registration requests and view registered institutions
- **Upload Certificate**: Issue certificates on-chain with IPFS integration support
- **Remove Certificate**: Revoke previously issued certificates

## Usage

1. Open `index.html` in a web browser
2. Click "Load Local Wallet" and provide your institution's private key
3. Use the interface to manage certificates and registration

## File Structure

```
institution/
├── index.html          # Main institution dashboard page
└── js/
    ├── app.js         # Main application logic
    ├── registry.js    # Institution registry handler
    └── certificate.js # Certificate management handler
```

## Requirements

- Runs on local Hardhat node (http://127.0.0.1:8545)
- Requires InstitutionRegistry and CertificateRegistry contracts to be deployed
- Institution wallet with sufficient funds for transactions
