# Troubleshooting: Admin Not Receiving Pending Requests

## Current Status ✓

✓ InstitutionRegistry deployed at: 0x5FbDB2315678afecb367f032d93F642f64180aa3  
✓ CertificateRegistry deployed at: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512  
✓ getInstitutions() function is working correctly  
✓ All backend contract calls succeed

## The Problem

The error "could not decode result data (value="0x")" happens when:

1. Browser has stale cached JavaScript code
2. Browser localstorage has old contract state
3. Browser can't reach the RPC endpoint
4. ABI cached in browser doesn't match deployed contract

## Solution: Clear Everything and Reconnect

### Step 1: Hard Refresh Browser Cache

Press these keys simultaneously:

- **Windows/Linux**: `Ctrl + Shift + R`
- **Mac**: `Cmd + Shift + R`

This clears all cached JavaScript files AND the browser cache.

### Step 2: Clear LocalStorage

Open browser DevTools (F12) and run in Console:

```javascript
localStorage.clear();
console.log("LocalStorage cleared");
```

### Step 3: Refresh Page

Press F5 or click refresh

### Step 4: Reconnect Wallet

1. Go to Admin Dashboard: `http://localhost:3000/frontend/admin/`
2. Click "Connect Wallet" button
3. Paste a private key from Hardhat test accounts:
   - Account 0: `0xac0974bec39a17e36ba4a6b4d238ff944bacb476caddcac1f0b9f1dc44b17eaf`
   - Account 1: `0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d`
   - etc. (from `npm run node` output)

### Step 5: Submit Institution Registration

1. Go to Institution Dashboard: `http://localhost:3000/frontend/institution/`
2. Click "Load Local Wallet" and use a different account private key
3. Go to "Institution Registry" tab
4. Fill in:
   - Name: "Test University"
   - Physical Address: "123 Main St, City, Country"
   - Ethereum Address: (auto-populated, or use deployer address `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`)
5. Click "Send Request"
6. Wait for "Request sent on-chain. Transaction mined."

### Step 6: Return to Admin Dashboard

1. Go back to Admin Dashboard
2. Click Refresh or reload the page
3. **You should now see the pending request under "Pending Approvals"**

### Step 7: Approve the Request

1. In pending requests list, click "Approve" button
2. Confirm transaction
3. You should see success message

## If Still Not Working

### Check 1: Verify Services Are Running

```powershell
netstat -ano | Select-String ":3000|:3001|:8545" | Select-String "LISTENING"
```

Should show 3 listening ports:

```
:3000 (Frontend) LISTENING
:3001 (Backend) LISTENING
:8545 (Blockchain) LISTENING
```

### Check 2: Test Contract Directly

Run this from the root directory:

```bash
node test-contract-deployment.js
```

Should show:

```
✓ Contract code is deployed
✓ getInstitutions() works correctly
```

### Check 3: Check Browser Console for Errors

1. Open DevTools: F12
2. Go to "Console" tab
3. Look for any red error messages
4. Note the exact error message

### Check 4: Check Network Requests

1. Open DevTools: F12
2. Go to "Network" tab
3. Submit registration again
4. Look for failed requests to `http://127.0.0.1:8545`
5. If failing, Hardhat node might not be accessible from browser

### Check 5: Verify Blockchain State

Run this test to check pending requests:

```javascript
// In browser console
const abi = CONFIG.INSTITUTION_REGISTRY_ABI;
const addr = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
const contract = new ethers.Contract(addr, abi, provider);

// Check pending
contract.getPendingInstitutions().then((p) => {
  console.log("Pending requests:", p);
});

// Check registered
contract.getInstitutions().then((a) => {
  console.log("Registered institutions:", a);
});
```

## Common Error Solutions

| Error                          | Cause                | Solution                                                 |
| ------------------------------ | -------------------- | -------------------------------------------------------- |
| "could not decode result data" | Stale cache          | Hard refresh (Ctrl+Shift+R) + clear localStorage         |
| "Contract not initialized"     | Wallet not connected | Click "Connect Wallet" button                            |
| "Not a registered institution" | Using wrong account  | Use the account that submitted the registration          |
| "Network: unknown"             | RPC not connected    | Check 127.0.0.1:8545 is reachable                        |
| "Failed to load resource 404"  | Missing file         | Verify ethers.umd.min.js exists in frontend/shared/libs/ |

## Manual Workflow Test

If automatic process fails, test each step:

### 1. Test Pending Request Submission

In browser console on Institution page:

```javascript
const addr = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"; // Admin's address
const tx = await institution.institutionContract.registerInstitution(
  addr,
  "did:ethr:" + addr,
  "Test Univ",
  "123 Main",
);
console.log("Transaction:", tx.hash);
await tx.wait();
console.log("Mined!");
```

### 2. Test Pending List Retrieval

```javascript
const pending = await institution.institutionContract.getPendingInstitutions();
console.log("Pending requests:", pending);
```

### 3. Test Approval

```javascript
const adminAddr = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
const tx = await admin.contract.approveInstitution(adminAddr);
await tx.wait();
console.log("Approved!");
```

## Get Help

If still stuck, check:

1. Are Hardhat node logs showing transactions?
2. Is backend responding to requests?
3. Are all 3 services running on correct ports?

---

**Version**: 1.0
**Updated**: April 4, 2024
**Status**: All systems operational - browser cache issue
