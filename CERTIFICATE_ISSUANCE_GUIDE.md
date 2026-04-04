# Certificate Issuance Guide - Automatic Pinata Upload

## Overview

The certificate issuance flow has been updated to **automatically upload certificates to Pinata IPFS** before submission to the blockchain. This ensures every certificate has a valid IPFS CID as required by the smart contract.

## New Flow

### Before

```
Manual CID Entry → Smart Contract Submission
```

### After

```
Certificate JSON → Pinata Upload (auto) → Get CID → Smart Contract Submission
```

## Step-by-Step Instructions

### 1. Prepare Your Pinata Credentials

Get your Pinata JWT from: https://app.pinata.cloud/developers/api-keys

### 2. Load JWT into Institution Portal

**Option A: Save to Browser Storage (Recommended)**

1. Navigate to **Institution Dashboard** → **Upload Certificate**
2. Paste your Pinata JWT in the "Pinata JWT (optional)" field
3. Click **"Save JWT to Browser"** button
4. JWT is now stored in localStorage and will be used automatically

**Option B: Provide JWT Each Time**

- Just paste your JWT in the field before submitting the certificate
- It will be used for this upload only

### 3. Prepare Certificate

Your certificate can be in one of these formats:

**Format A: JSON (Recommended)**

```json
{
  "studentId": "STU001",
  "studentName": "John Doe",
  "degree": "Bachelor of Science",
  "major": "Computer Science",
  "institution": "ABC University",
  "graduationDate": "2024-05-15",
  "grade": "3.8",
  "honors": "Summa Cum Laude"
}
```

**Format B: Plain Text (Converted to JSON)**

```
Student: John Doe
Degree: Bachelor of Science
Major: Computer Science
Institution: ABC University
Date: 2024-05-15
```

**Format C: Upload File**

- Select a `.json`, `.txt`, or `.pdf` file
- System will read the content automatically

### 4. Submit Certificate

1. In the **Upload Certificate** section:
   - Enter certificate JSON/text, OR
   - Upload a certificate file
   - Leave the "IPFS CID" field **blank** (this will trigger auto-upload)
2. Click **"Issue Certificate (on-chain)"**

3. You will see progress messages:
   - ✓ "Uploading certificate to IPFS via Pinata..."
   - ✓ "Certificate uploaded to IPFS. CID: Qm..."
   - ✓ "Issuing certificate on-chain..."
   - ✓ "Certificate issued!"

### 5. What Happens Behind the Scenes

When you submit, the system:

1. **Computes Hash**: Generates Keccak256 hash of certificate content

   ```
   Certificate JSON → SHA3-256 Hash → 0xabcd1234...
   ```

2. **Uploads to Pinata**:

   - Sends certificate to Pinata Cloud via JWT
   - Receives IPFS Content Identifier (CID)
   - Example: `QmXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

3. **Stores on Blockchain**:

   - Calls `issueCertificate(certHash, ipfsCID)`
   - Records both hash and CID on-chain
   - Transaction mined and confirmed

4. **Success Confirmation**:
   - Hash: For verification against original content
   - CID: To retrieve certificate from IPFS

## Verifying Upload Success

### Check Pinata Dashboard

1. Go to https://app.pinata.cloud/files
2. Look for recent uploads with name `certificate.json`
3. Verify upload timestamp matches your submission

### Check Blockchain

1. Use the certificate hash to query the smart contract
2. Verify the CID is stored with the hash

## Troubleshooting

### Error: "Pinata JWT not configured"

**Cause**: No JWT provided
**Solution**:

- Get JWT from https://app.pinata.cloud/developers/api-keys
- Paste it in the JWT field
- Click "Save JWT to Browser"

### Error: "Upload failed with status 401"

**Cause**: Invalid JWT
**Solution**:

- Verify JWT is correct and not expired
- Generate a new JWT from Pinata dashboard
- Clear old JWT: `localStorage.removeItem('pinata_jwt')`

### Error: "IPFS CID is required"

**Cause**: Certificate submitted without CID (shouldn't happen with new flow)
**Solution**:

- Check browser console for detailed errors
- Ensure Pinata upload step completed successfully
- Verify network connectivity

### Why is upload slow?

**Cause**: Large file size or network latency
**Solution**:

- Pinata uploads are pinned globally (takes 30-60 seconds sometimes)
- Patient wait is normal
- Check browser Network tab if concerned

## Sample Certificates

See `sample-certificates.json` for example certificate structures.

## API Endpoint Reference

For developers using the API directly:

**Upload to Pinata**

```
POST /api/utility/pinata-upload
Content-Type: application/json

{
  "certificateData": { /* certificate object or string */ },
  "pinataJWT": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Response:
{
  "success": true,
  "cid": "QmXxxx...",
  "certHash": "0xabcd...",
  "ipfsUrl": "https://gateway.pinata.cloud/ipfs/QmXxxx...",
  "timestamp": "2024-04-04T10:30:00Z",
  "pinSize": 1024
}
```

**Test Pinata Connection**

```
POST /api/utility/pinata-test
Content-Type: application/json

{
  "pinataJWT": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Response:
{
  "success": true,
  "message": "Connected to Pinata",
  "data": { /* Pinata auth details */ }
}
```

## Security Notes

- **JWT in Browser Storage**: JWT is stored in localStorage. Keep your browser secure.
- **HTTPS**: Always use HTTPS when communicating with Pinata
- **Content Verification**: Anyone with the CID can retrieve the certificate from IPFS
- **Blockchain Records**: Certificate hash + CID are immutable on-chain

## Next Steps

1. ✓ Get Pinata JWT from https://app.pinata.cloud
2. ✓ Save JWT to browser in Institution Portal
3. ✓ Prepare a certificate in JSON format
4. ✓ Submit certificate using the "Issue Certificate" button
5. ✓ Verify upload in Pinata dashboard and blockchain

---

**Last Updated**: April 4, 2024
**Version**: 2.0 (Auto-upload enabled)
