# Certificate Verification Issue - Troubleshooting

## Problem Diagnosed ✓

Your blockchain shows:

- ✓ Institution registered and approved
- ❌ **0 certificates issued** (certificate not stored on blockchain)

This means:

1. ✓ Pinata upload succeeded (CID generated)
2. ❌ Blockchain transaction to issue certificate FAILED

## Why This Happens

The certificate issuance fails when:

### Reason 1: Wrong Account Used

The account that calls `issueCertificate()` must be the **registered institution's account**.

**Check:**

- In Institution Portal: Did you load the **same wallet** that registered the institution?
- Account used to register ≠ Account used to issue certificate → ❌ FAIL

### Reason 2: Institution Not Approved

Only **approved** institutions can issue certificates.

**Check:**

- In Admin Dashboard: Is the institution showing as "Approved"?
- If Not approved → ❌ FAIL (admin must approve first)

### Reason 3: Silent Transaction Failure

The transaction might fail but not show an error message.

**Check:**

- Open browser DevTools (F12) → Console tab
- Look for errors when you click "Issue Certificate"
- Note any error messages

## Step-by-Step Fix

### Step 1: Verify Institution Status

```bash
node diagnose-blockchain.js
```

Should show:

```
✓ Institution Name (address)
  - Approved: true
  - Issued 0 certificate(s)  ← Should increase after issuing
```

If "Approved: false" → Go to Admin Dashboard and approve it first.

### Step 2: Use Correct Account

1. **Admin Dashboard**:

   - Hardhat Account 0: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266` (private key: `0xac0974bec39a17e36ba4a6b4d238ff944bacb476caddcac1f0b9f1dc44b17eaf`)

2. **Institution Portal**:
   - Must use the **same account** that registered the institution
   - Or use the account that was approved as a registered institution

### Step 3: Check Institution Registration

1. Go to Institution Dashboard
2. Go to "Institution Registry" tab
3. Click "Show All Registered Institutions"
4. Verify your institution appears with "Approved" status

### Step 4: Try Issuing Again

1. Go to Institution Portal → "Upload Certificate" tab
2. Hard refresh (Ctrl+Shift+R) to clear cache
3. Click "Load Local Wallet"
4. Use the **institution's account** (not admin, not student)
5. Paste certificate JSON
6. Click "Issue Certificate (on-chain)"
7. **Wait for the success message** - don't skip this!

### Step 5: Verify on Blockchain

After successful issue:

```bash
node diagnose-blockchain.js
```

Should now show:

```
Issued 1 certificate(s):
  [0] Hash: 0x...
      CID: Qm...
      Valid: true
      Issuer: 0x...
```

### Step 6: Test Verification

1. Copy the certificate hash from the diagnostic output
2. Go to Employer Dashboard
3. Enter the hash
4. Click "Verify Certificate"
5. Should show ✓ Certificate is VALID

## Common Error Messages and Fixes

| Error                                      | Cause                       | Fix                                                |
| ------------------------------------------ | --------------------------- | -------------------------------------------------- |
| "Not a registered institution"             | Account not registered      | Use the account that registered the institution    |
| "Pinata upload failed"                     | No JWT or invalid JWT       | Enter Pinata JWT and save to browser               |
| "certificate uploaded... but verify fails" | Transaction failed silently | Check browser console for errors, retry            |
| "Certificate not found on blockchain"      | Not issued yet              | Check if issueCertificate succeeded (step 5 above) |
| "Wallet: not connected"                    | No account loaded           | Click "Load Local Wallet"                          |

## Test Workflow

1. **Admin Account**: Register institution with name "Test Univ"

   ```
   Name: Test Univ
   Address: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 (Account 1)
   ```

2. **Admin Dashboard**: Approve the pending request

3. **Account 1 (Institution)**: Load wallet and issue certificate

   - Use same address that was registered

4. **Employee Account**: Verify the certificate
   ```
   Hash: (from diagnostic)
   ```

## Still Not Working?

### Enable Debug Mode

Add this to browser console and try again:

```javascript
// Log certificate hash before issuance
console.log("Certificate text:", institution.certificates.lastCertificateText);
console.log(
  "Certificate hash:",
  await institution.certificates.computeHash(
    institution.certificates.lastCertificateText,
  ),
);
```

### Check Transaction Details

1. Hardhat node console should show transaction logs
2. If you see "Transaction failed" → Take note of reason
3. Common reasons: "Not a registered institution", "Institution not approved"

### Reset and Start Over

If something is stuck:

```bash
# Stop all services
Ctrl+C in each terminal

# Clear blockchain state
cd backend
npm run node  # Starts fresh blockchain
# In another terminal:
npm run deploy-local  # Redeploys contracts
```

## Key Points to Remember

✓ **Account matters**: Same account must register AND issue  
✓ **Admin approval required**: Institution must be approved before issuing  
✓ **Hash must match**: Certificate hash used to issue = hash used to verify  
✓ **Wait for confirmation**: Always wait for "Transaction mined" message  
✓ **CID is secondary**: Blockchain stores hash + CID link, verification uses hash

---

**Quick Diagnostic:**

```bash
node diagnose-blockchain.js
```

This shows exactly what's on the blockchain and helps identify the issue immediately.
