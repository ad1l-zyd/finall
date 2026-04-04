# Credential Verification System - Frontend

Modern, modular frontend for the credential verification system with separate dashboards for different user roles.

## Directory Structure

```
frontend/
├── admin/                 # Admin dashboard
│   ├── index.html        # Admin interface
│   ├── js/               # Admin-specific scripts
│   └── README.md
├── institution/          # Institution dashboard
│   ├── index.html        # Institution interface
│   ├── js/               # Institution-specific scripts
│   └── README.md
├── student/              # Student dashboard
│   ├── index.html        # Student interface
│   ├── js/               # Student-specific scripts
│   └── README.md
├── employer/             # Employer dashboard
│   ├── index.html        # Employer interface
│   ├── js/               # Employer-specific scripts
│   └── README.md
├── shared/               # Shared resources
│   ├── config.js         # Global configuration
│   ├── libs/             # Third-party libraries
│   │   └── ethers.umd.min.js
│   ├── styles/           # Shared CSS
│   │   └── main.css
│   └── utils/            # Shared utility modules
│       ├── blockchain.js # Blockchain interaction utilities
│       └── ui.js         # UI helper functions
├── README.md             # This file
└── setup.sh              # Setup script for development
```

## Quick Start

### 1. Copy ethers.umd.min.js

The ethers library must be copied to `shared/libs/`:

```bash
# From project root
cp libs/ethers.umd.min.js frontend/shared/libs/
# Or on Windows
copy libs\ethers.umd.min.js frontend\shared\libs\
```

### 2. View Dashboards

Once the backend is running with contracts deployed, you can access each dashboard:

- **Admin**: http://localhost:5500/frontend/admin/
- **Institution**: http://localhost:5500/frontend/institution/
- **Student**: http://localhost:5500/frontend/student/
- **Employer**: http://localhost:5500/frontend/employer/

(Using Live Server or any local HTTP server on port 5500)

## Architecture

### Modular Design

Each dashboard is completely modular with:

- Separate index.html files
- Role-specific JavaScript modules
- Shared utilities and configuration
- Centralized styling

### Shared Components

- `config.js` - Centralized blockchain configuration and contract ABIs
- `utils/blockchain.js` - Wallet connection, contract interaction, hash computation
- `utils/ui.js` - DOM manipulation, UI state management
- `styles/main.css` - Consistent styling across all dashboards

### Dashboard Modules

Each dashboard extends shared functionality with role-specific features:

#### Admin Dashboard

- Approve/reject institution registrations
- View pending requests
- Review approval history
- Remove institutions from registry

#### Institution Dashboard

- Register institutions on-chain
- Check registration status
- Issue certificates
- Revoke certificates

#### Student Dashboard

- Verify certificate authenticity
- View issued credentials

#### Employer Dashboard

- Verify candidate certificates
- Search candidate credentials
- Validate certificate authenticity

## Development

### Adding a New Feature

1. If it's shared across dashboards, add to `utils/` or `config.js`
2. If it's role-specific, add to the dashboard's `js/` folder
3. Import shared scripts using `<script>` tags in HTML
4. Follow the event listener pattern in existing modules

### Configuration

Update contract addresses and ABI in `shared/config.js`:

```javascript
const CONFIG = {
  RPC_URL: "http://127.0.0.1:8545",
  INSTITUTION_REGISTRY_ADDRESS: "0x...",
  CERTIFICATE_REGISTRY_ADDRESS: "0x...",
  // ABIs...
};
```

## Running a Dashboard

### Prerequisites

1. Backend must be running:

   ```bash
   cd backend
   npm install
   npm run node
   ```

2. In another terminal, deploy contracts:

   ```bash
   npm run deploy-local
   ```

3. Start a local HTTP server in the project root:

   ```bash
   # Using Python
   python -m http.server 5500

   # Using Node.js (npm install -g http-server)
   http-server -p 5500

   # Using Live Server extension in VS Code
   # Right-click index.html → "Open with Live Server"
   ```

### Access Dashboards

- Admin: http://localhost:5500/frontend/admin/
- Institution: http://localhost:5500/frontend/institution/
- Student: http://localhost:5500/frontend/student/
- Employer: http://localhost:5500/frontend/employer/

## Styling

All dashboards use the shared CSS with role-specific color schemes:

- Admin: Blue (#1f6feb)
- Institution: Dark Blue (#2b6cb0)
- Student: Purple (#7c3aed)
- Employer: Green (#059669)

Customize colors in the `:root` styles section of each dashboard's HTML.

## Security Notes

⚠️ **Development Only**: This frontend stores private keys in localStorage for local development. **NEVER use in production**.

For production:

- Use hardware wallets or browser extensions (MetaMask, etc.)
- Implement proper authentication
- Use environment variables for sensitive data
- Never store private keys in localStorage

## Troubleshooting

### "ethers is not defined"

- Verify `ethers.umd.min.js` exists in `frontend/shared/libs/`
- Check that the script tag loads correctly

### "Contract not initialized"

- Verify contracts are deployed with `npm run deploy-local`
- Check RPC_URL in config.js matches running Hardhat node
- Verify contract addresses in config.js match deployment output

### "Wallet not connected"

- Click "Load Local Wallet" button
- Provide the private key when prompted
- Ensure the account has sufficient funds

## License

MIT
