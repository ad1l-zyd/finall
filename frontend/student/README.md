# Student Dashboard

The student dashboard allows students to verify their credentials and view their issued certificates.

## Features

- **Verify Certificate**: Verify the authenticity of any certificate on the blockchain
- **My Credentials**: View all issued credentials (coming soon)

## Usage

1. Open `index.html` in a web browser
2. Enter a certificate hash to verify its authenticity
3. Optionally connect your wallet to manage your profile

## File Structure

```
student/
├── index.html    # Main student dashboard page
└── js/
    └── app.js   # Main application logic
```

## Requirements

- Runs on local Hardhat node (http://127.0.0.1:8545)
- Requires CertificateRegistry contract to be deployed
