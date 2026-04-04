# Employer Dashboard

The employer dashboard allows employers to verify candidate credentials and certificates.

## Features

- **Verify Certificate**: Verify the authenticity of any certificate on the blockchain
- **Candidate Verification**: Search and verify applicant credentials

## Usage

1. Open `index.html` in a web browser
2. Enter a certificate hash to verify its authenticity
3. Use candidate verification to search for and verify applicant credentials

## File Structure

```
employer/
├── index.html    # Main employer dashboard page
└── js/
    └── app.js   # Main application logic
```

## Requirements

- Runs on local Hardhat node (http://127.0.0.1:8545)
- Requires CertificateRegistry contract to be deployed
