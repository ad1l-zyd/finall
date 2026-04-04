# API Documentation

Complete reference for all backend API endpoints of the Credential Verification System.

## Base URL

```
http://localhost:3001
```

## Authentication

Some endpoints require JWT tokens. Include in header:

```
Authorization: Bearer <token>
```

## Response Format

All responses follow this standard format:

```json
{
  "success": true,
  "data": {},
  "message": "Success message",
  "timestamp": "2024-04-04T10:00:00.000Z"
}
```

Error responses:

```json
{
  "error": "Error type",
  "message": "Error description",
  "timestamp": "2024-04-04T10:00:00.000Z"
}
```

---

## 1. Health & System Endpoints

### GET /health

Check if the server is running.

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2024-04-04T10:00:00.000Z",
  "environment": "development",
  "network": "hardhat"
}
```

### GET /api/utility/status

Get complete system status.

**Response:**

```json
{
  "success": true,
  "status": {
    "ipfs": true,
    "blockchain": {
      "chainId": 31337,
      "network": "hardhat"
    },
    "timestamp": "2024-04-04T10:00:00.000Z"
  }
}
```

---

## 2. Admin Endpoints (`/api/admin`)

### GET /pending-institutions

Get all pending institution registration requests.

**Response:**

```json
{
  "success": true,
  "count": 2,
  "institutions": [
    {
      "address": "0x70997970C51812e339D9B73b0245ad39437eSc5d",
      "name": "University A",
      "physicalAddress": "123 Main St, City",
      "did": "did:web:universityA.edu",
      "requestedAt": "2024-04-04T10:00:00.000Z"
    }
  ]
}
```

### GET /institutions

Get all registered institutions.

**Response:**

```json
{
  "success": true,
  "count": 1,
  "institutions": [
    {
      "address": "0x70997970C51812e339D9B73b0245ad39437eSc5d",
      "name": "University A",
      "physicalAddress": "123 Main St, City",
      "did": "did:web:universityA.edu",
      "approved": true,
      "registeredAt": "2024-04-04T09:00:00.000Z"
    }
  ]
}
```

### POST /approve-institution

Approve a pending institution request (Admin only).

**Request:**

```json
{
  "institutionAddress": "0x70997970C51812e339D9B73b0245ad39437eSc5d"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Institution approved successfully",
  "transactionHash": "0x...",
  "blockNumber": 123
}
```

### POST /reject-institution

Reject a pending institution request (Admin only).

**Request:**

```json
{
  "institutionAddress": "0x70997970C51812e339D9B73b0245ad39437eSc5d"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Institution rejected successfully",
  "transactionHash": "0x...",
  "blockNumber": 123
}
```

### GET /history

Get history of all institution approvals/rejections.

**Response:**

```json
{
  "success": true,
  "count": 5,
  "history": [
    {
      "address": "0x70997970C51812e339D9B73b0245ad39437eSc5d",
      "name": "University A",
      "approved": true,
      "timestamp": "2024-04-04T09:00:00.000Z"
    }
  ]
}
```

### GET /summary

Get admin dashboard summary.

**Response:**

```json
{
  "success": true,
  "summary": {
    "pendingRequests": 2,
    "registeredInstitutions": 3,
    "totalRequests": 5,
    "timestamp": "2024-04-04T10:00:00.000Z"
  }
}
```

---

## 3. Institution Endpoints (`/api/institution`)

### POST /register

Register a new institution.

**Request:**

```json
{
  "address": "0x70997970C51812e339D9B73b0245ad39437eSc5d",
  "name": "State University",
  "physicalAddress": "123 Main St, City, State",
  "did": "did:web:university.edu"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Institution registration request submitted",
  "institution": {
    "address": "0x70997970C51812e339D9B73b0245ad39437eSc5d",
    "name": "State University",
    "status": "pending",
    "registeredAt": "2024-04-04T10:00:00.000Z"
  },
  "transactionHash": "0x..."
}
```

### GET /details/:address

Get details of a specific institution.

**Parameters:**

- `address` (URL): Institution Ethereum address

**Response:**

```json
{
  "success": true,
  "institution": {
    "address": "0x70997970C51812e339D9B73b0245ad39437eSc5d",
    "name": "State University",
    "physicalAddress": "123 Main St, City, State",
    "did": "did:web:university.edu",
    "approved": true,
    "registered": true,
    "registeredAt": "2024-04-04T09:00:00.000Z"
  }
}
```

### POST /issue-certificate

Issue a certificate for a student (Requires approved institution).

**Request:**

```json
{
  "issuerAddress": "0x70997970C51812e339D9B73b0245ad39437eSc5d",
  "issuerPrivateKey": "0x...",
  "studentName": "John Doe",
  "studentDOB": "2000-01-15",
  "studentId": "STU001",
  "program": "Bachelor of Science",
  "gradYear": 2024,
  "institutionName": "State University",
  "institutionDID": "did:web:university.edu",
  "institutionPlace": "City, State",
  "degree": "Bachelor of Science",
  "cgpa": 3.8,
  "major": "Computer Science",
  "validity": "2034-05-20"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Certificate issued successfully",
  "certificate": {
    "id": "uuid",
    "hash": "0x...",
    "ipfsCID": "Qm...",
    "transactionHash": "0x...",
    "blockNumber": 125
  }
}
```

### GET /certificates/:issuerAddress

Get certificates issued by an institution.

**Parameters:**

- `issuerAddress` (URL): Institution address

**Response:**

```json
{
  "success": true,
  "issuerAddress": "0x70997970C51812e339D9B73b0245ad39437eSc5d",
  "count": 3,
  "certificates": [...]
}
```

### POST /revoke-certificate

Revoke a previously issued certificate.

**Request:**

```json
{
  "certificateHash": "0x...",
  "issuerPrivateKey": "0x..."
}
```

**Response:**

```json
{
  "success": true,
  "message": "Certificate revoked successfully",
  "transactionHash": "0x...",
  "blockNumber": 126
}
```

---

## 4. Student Endpoints (`/api/student`)

### POST /register

Register a new student.

**Request:**

```json
{
  "address": "0x3C44CdDdB6a900c6D2b8371300141F16C21f97ef",
  "name": "John Doe",
  "dateOfBirth": "2000-01-15",
  "studentId": "STU001"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Student registered successfully",
  "student": {
    "address": "0x3C44CdDdB6a900c6D2b8371300141F16C21f97ef",
    "name": "John Doe",
    "registeredAt": "2024-04-04T10:00:00.000Z"
  }
}
```

### GET /certificates/:studentId

Get all certificates for a student.

**Parameters:**

- `studentId` (URL): Student ID

**Response:**

```json
{
  "success": true,
  "studentId": "STU001",
  "count": 2,
  "certificates": [
    {
      "id": "cert-uuid",
      "program": "Bachelor of Science",
      "major": "Computer Science",
      "issueDate": "2024-05-20T10:00:00.000Z",
      "institutionName": "State University",
      "status": "registered"
    }
  ]
}
```

### GET /certificate/:certificateId

Get details of a specific certificate.

**Parameters:**

- `certificateId` (URL): Certificate UUID

**Response:**

```json
{
  "success": true,
  "certificate": {
    "id": "uuid",
    "studentDetails": {...},
    "institutionDetails": {...},
    "certDetails": {...},
    "hash": "0x...",
    "ipfsCID": "Qm...",
    "status": "registered"
  }
}
```

### POST /generate-zkp-proofs

Generate zero-knowledge proofs for certificate verification.

**Request:**

```json
{
  "zkpRequestId": "request-uuid",
  "studentId": "STU001",
  "dateOfBirth": "2000-01-15",
  "cgpa": 3.8
}
```

**Response:**

```json
{
  "success": true,
  "message": "All proofs verified successfully",
  "zkpRequestId": "request-uuid",
  "verificationResults": {
    "ageProof": true,
    "cgpaProof": true
  },
  "status": "verified"
}
```

### POST /share-certificate

Share certificate with an employer.

**Request:**

```json
{
  "certificateId": "cert-uuid",
  "employerAddress": "0x5aAeb6053ba3EEdb6a475b53b5d709D82E0f6e0b"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Certificate shared with employer",
  "exportedCertificate": {
    "id": "cert-uuid",
    "ipfsCID": "Qm...",
    "certificateHash": "0x...",
    "studentName": "John Doe",
    "program": "Bachelor of Science"
  }
}
```

---

## 5. Employer Endpoints (`/api/employer`)

### POST /register

Register a new employer.

**Request:**

```json
{
  "address": "0x5aAeb6053ba3EEdb6a475b53b5d709D82E0f6e0b",
  "companyName": "Tech Company Inc",
  "industry": "Technology"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Employer registered successfully",
  "employer": {
    "address": "0x5aAeb6053ba3EEdb6a475b53b5d709D82E0f6e0b",
    "companyName": "Tech Company Inc",
    "registeredAt": "2024-04-04T10:00:00.000Z"
  }
}
```

### POST /verify-certificate

Verify a certificate using its hash.

**Request:**

```json
{
  "certificateHash": "0x..."
}
```

**Response:**

```json
{
  "success": true,
  "message": "Certificate verified",
  "certificate": {
    "studentName": "John Doe",
    "program": "Bachelor of Science",
    "major": "Computer Science",
    "issueDate": "2024-05-20T10:00:00.000Z",
    "institutionName": "State University",
    "cgpa": 3.8
  },
  "blockchainData": {
    "certHash": "0x...",
    "ipfsCID": "Qm...",
    "issuer": "0x...",
    "isValid": true
  }
}
```

### POST /request-zkp-verification

Request zero-knowledge proof verification from student.

**Request:**

```json
{
  "certificateHash": "0x...",
  "requirements": {
    "minAge": 18,
    "minCGPA": 3.5
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "ZKP verification request sent to student",
  "zkpRequest": {
    "id": "request-uuid",
    "certificateHash": "0x...",
    "requirements": {
      "minAge": 18,
      "minCGPA": 3.5
    },
    "status": "pending",
    "studentId": "STU001"
  }
}
```

### GET /zkp-status/:zkpRequestId

Check status of a ZKP verification request.

**Parameters:**

- `zkpRequestId` (URL): ZKP Request UUID

**Response:**

```json
{
  "success": true,
  "zkpRequest": {
    "id": "request-uuid",
    "status": "verified",
    "requirements": {
      "minAge": 18,
      "minCGPA": 3.5
    },
    "verificationResults": {
      "ageProof": true,
      "cgpaProof": true
    },
    "submittedAt": "2024-04-04T10:05:00.000Z"
  }
}
```

### GET /certificate/:ipfsCID

Retrieve full certificate details from IPFS.

**Parameters:**

- `ipfsCID` (URL): IPFS Content Identifier

**Response:**

```json
{
  "success": true,
  "certificate": {
    "id": "uuid",
    "studentDetails": {...},
    "institutionDetails": {...},
    "certDetails": {...}
  }
}
```

---

## 6. Blockchain Endpoints (`/api/blockchain`)

### GET /chain-info

Get blockchain network information.

**Response:**

```json
{
  "success": true,
  "chainInfo": {
    "chainId": 31337,
    "name": "hardhat",
    "rpcUrl": "http://127.0.0.1:8545"
  }
}
```

### GET /contracts

Get deployed contract addresses.

**Response:**

```json
{
  "success": true,
  "contracts": {
    "institutionRegistry": {
      "address": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
      "network": "hardhat"
    },
    "certificateRegistry": {
      "address": "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
      "network": "hardhat"
    }
  }
}
```

### POST /validate-address

Validate an Ethereum address.

**Request:**

```json
{
  "address": "0x70997970C51812e339D9B73b0245ad39437eSc5d"
}
```

**Response:**

```json
{
  "success": true,
  "address": "0x70997970C51812e339D9B73b0245ad39437eSc5d",
  "isValid": true,
  "formatted": "0x7099...5d"
}
```

### POST /hash

Generate Keccak256 hash of text.

**Request:**

```json
{
  "text": "certificate data"
}
```

**Response:**

```json
{
  "success": true,
  "text": "certificate data",
  "hash": "0x..."
}
```

### POST /sign-data

Sign data with a private key.

**Request:**

```json
{
  "data": "message to sign",
  "privateKey": "0x..."
}
```

**Response:**

```json
{
  "success": true,
  "data": "message to sign",
  "signature": "0x..."
}
```

### POST /verify-signature

Verify a signature.

**Request:**

```json
{
  "data": "original message",
  "signature": "0x...",
  "address": "0x70997970C51812e339D9B73b0245ad39437eSc5d"
}
```

**Response:**

```json
{
  "success": true,
  "isValid": true,
  "address": "0x70997970C51812e339D9B73b0245ad39437eSc5d"
}
```

---

## 7. Utility Endpoints (`/api/utility`)

### GET /ipfs-status

Check IPFS availability.

**Response:**

```json
{
  "success": true,
  "ipfs": {
    "available": true,
    "version": "0.20.0"
  }
}
```

### POST /ipfs-upload-json

Upload JSON data to IPFS.

**Request:**

```json
{
  "data": {
    "name": "John Doe",
    "degree": "Bachelor",
    "issued": "2024-05-20"
  }
}
```

**Response:**

```json
{
  "success": true,
  "cid": "Qm...",
  "gatewayUrl": "http://127.0.0.1:8080/ipfs/Qm..."
}
```

### GET /ipfs-retrieve/:cid

Retrieve data from IPFS.

**Parameters:**

- `cid` (URL): IPFS CID

**Response:**

```json
{
  "success": true,
  "cid": "Qm...",
  "data": {...}
}
```

### GET /zkp-nonce

Generate a random nonce for ZKP.

**Response:**

```json
{
  "success": true,
  "nonce": "hex-string"
}
```

### POST /zkp-cgpa-proof

Generate CGPA zero-knowledge proof.

**Request:**

```json
{
  "actualCGPA": 3.8,
  "minCGPA": 3.5,
  "studentId": "STU001",
  "nonce": "hex-nonce"
}
```

**Response:**

```json
{
  "success": true,
  "proof": {
    "commitment": "0x...",
    "minCGPA": 3.5,
    "proof": "0x...",
    "timestamp": 1712345678000,
    "studentId": "STU001"
  }
}
```

### POST /zkp-age-proof

Generate age zero-knowledge proof.

**Request:**

```json
{
  "birthDate": "2000-01-15",
  "minAge": 18,
  "studentId": "STU001",
  "nonce": "hex-nonce"
}
```

**Response:**

```json
{
  "success": true,
  "proof": {
    "dobCommitment": "0x...",
    "minAge": 18,
    "proof": "0x...",
    "timestamp": 1712345678000,
    "studentId": "STU001"
  }
}
```

### GET /status

Get complete system status.

**Response:**

```json
{
  "success": true,
  "status": {
    "ipfs": true,
    "blockchain": {
      "chainId": 31337,
      "network": "hardhat"
    },
    "timestamp": "2024-04-04T10:00:00.000Z"
  }
}
```

---

## Error Responses

### Common HTTP Status Codes

- `200 OK` - Successful request
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing/invalid authentication
- `403 Forbidden` - Access denied
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

### Error Response Format

```json
{
  "error": "Error Type",
  "message": "Detailed error message",
  "timestamp": "2024-04-04T10:00:00.000Z"
}
```

---

## Rate Limiting

Currently no rate limiting is implemented in development mode. For production, implement:

- Per-IP rate limiting
- Per-user rate limiting
- Method-specific limits

---

## Pagination

Some endpoints support pagination:

**Query Parameters:**

- `page` (default: 1) - Page number
- `limit` (default: 20) - Items per page

Example:

```
GET /api/admin/institutions?page=2&limit=10
```

---

## Sorting

Supported by some list endpoints:

**Query Parameters:**

- `sort` - Field to sort by
- `order` - `asc` or `desc`

Example:

```
GET /api/admin/history?sort=timestamp&order=desc
```

---

Last Updated: April 4, 2026
