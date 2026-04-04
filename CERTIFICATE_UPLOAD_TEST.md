# Quick Test: Certificate Issuance with Automatic Pinata Upload

## Prerequisites

- ✓ Backend server running on `http://localhost:3001`
- ✓ Frontend running on `http://localhost:3000`
- ✓ Hardhat node running on `http://127.0.0.1:8545`
- ✓ Institution wallet loaded in portal
- ✓ Pinata account with JWT (get from https://app.pinata.cloud/developers/api-keys)

## Test Steps

### Step 1: Save Pinata JWT to Browser

1. Navigate to: `http://localhost:3000/frontend/institution/`
2. Click "Upload Certificate" tab
3. Find the "Pinata JWT" field
4. Paste your Pinata JWT: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
5. Click "Save JWT to Browser" button
6. You should see: ✓ "Pinata JWT saved to browser storage successfully!"

**Alternative**: You can skip this and paste JWT directly into the JWT field during submission.

### Step 2: Prepare Certificate Data

Choose one option:

**Option A: Paste JSON**

```json
{
  "studentId": "STU123",
  "studentName": "Jane Smith",
  "degree": "Bachelor of Science",
  "major": "Information Technology",
  "institution": "Tech University",
  "graduationDate": "2024-06-01",
  "gpa": "3.85"
}
```

- Paste this in the "Certificate JSON or Text" textarea

**Option B: Upload File**

- Create a file named `certificate.json` with the above content
- Click "Or upload certificate file" and select the file

### Step 3: Issue Certificate

1. Leave "IPFS CID" field **BLANK** (this triggers automatic upload)
2. Click "Issue Certificate (on-chain)" button

### Step 4: Watch Progress

You should see these messages in order:

```
📤 Uploading certificate to IPFS via Pinata...
✓ Certificate uploaded to IPFS. CID: QmXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
📝 Issuing certificate on-chain...
✓ Certificate issued!
   Hash: 0xabcd1234...
   CID: QmXxxx...
```

### Step 5: Verify Success

**In Pinata Dashboard**:

1. Go to https://app.pinata.cloud/files
2. Look for recent `certificate.json` uploads
3. Verify CID matches the one shown in Institution Portal

**On Blockchain**:

1. Get the certificate hash from the success message
2. Query the contract to verify CID is stored: TODO (depends on student dashboard implementation)

## Expected Outcomes

✅ Certificate uploaded to Pinata  
✅ CID returned from Pinata  
✅ Certificate issued on-chain with hash + CID  
✅ Transaction confirmed on Hardhat node

## Troubleshooting

| Error                           | Cause                              | Fix                                                |
| ------------------------------- | ---------------------------------- | -------------------------------------------------- |
| "Pinata JWT not configured"     | No JWT provided                    | Paste JWT in field and click "Save JWT"            |
| "Upload failed with status 401" | Invalid JWT                        | Get fresh JWT from Pinata dashboard                |
| "IPFS CID is required"          | CID not uploaded                   | Check backend logs, ensure Pinata upload succeeded |
| "Wallet not connected"          | No institution wallet              | Use "Load Local Wallet" to connect                 |
| No progress messages            | Frontend/backend not communicating | Check API_BASE_URL in config.js                    |

## Network Request Inspection

To see requests in detail:

1. **Browser Console**: Open DevTools (F12) → Console tab
2. **Network Tab**: F12 → Network → Check POST to `/api/utility/pinata-upload`
3. **Server Logs**: Check backend terminal for request logs

## Sample Success Response

When Pinata upload succeeds, you get:

```json
{
  "success": true,
  "message": "Certificate uploaded to Pinata successfully",
  "cid": "QmWXSTvzM4aBPUaVbhVqe9mZTw3f1pFVqLCVWGMj5qhng",
  "certHash": "0xabcd1234...",
  "ipfsUrl": "https://gateway.pinata.cloud/ipfs/QmWXSTvzM4aBPUaVbhVqe9mZTw3f1pFVqLCVWGMj5qhng",
  "timestamp": "2024-04-04T10:30:45.123Z",
  "pinSize": 1056
}
```

## Manual Testing with cURL

Test the Pinata endpoint directly:

```bash
curl -X POST http://localhost:3001/api/utility/pinata-upload \
  -H "Content-Type: application/json" \
  -d '{
    "certificateData": {
      "studentName": "John Doe",
      "degree": "BS Computer Science"
    },
    "pinataJWT": "YOUR_JWT_HERE"
  }'
```

## Still Having Issues?

1. Check Backend Logs:

   ```
   Terminal: Check output from "node server.js"
   Look for: "[PINATA]" or "[UTILITY]" logs
   ```

2. Test Pinata Connection:

   ```bash
   curl -X POST http://localhost:3001/api/utility/pinata-test \
     -H "Content-Type: application/json" \
     -d '{"pinataJWT": "YOUR_JWT_HERE"}'
   ```

3. Clear Browser Cache:

   - Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - Clear localStorage if JWT is stale

4. Check localhost:3001 is responding:
   ```bash
   curl http://localhost:3001/api/utility/health
   ```
   Should return: `{"status":"ok","service":"utility",...}`

---

**Version**: 2.0 (Auto-upload enabled)
**Created**: April 4, 2024
