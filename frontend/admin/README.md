# Admin Dashboard

The admin dashboard allows administrators to manage institution registration requests and approvals.

## Features

- **Approvals Pending**: Review and approve/reject institution registration requests
- **History**: View the history of approved and rejected institutions
- **Removal**: Remove institutions from the registry

## Usage

1. Open `index.html` in a web browser
2. Click "Load Local Wallet" and provide your admin private key
3. Use the interface to manage institution registrations

## File Structure

```
admin/
├── index.html          # Main admin dashboard page
└── js/
    ├── app.js         # Main application logic
    ├── pending.js     # Pending approvals handler
    └── handlers.js    # History and registered institutions handlers
```

## Requirements

- Runs on local Hardhat node (http://127.0.0.1:8545)
- Requires InstitutionRegistry contract to be deployed
- Admin wallet with sufficient funds for transactions
