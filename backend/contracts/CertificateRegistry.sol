// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Certificate Registry
 * @notice Manages certificate issuance and verification on blockchain
 */
interface IInstitutionRegistry {
    function isInstitutionRegistered(address addr) external view returns (bool);
    function getInstitution(
        address addr
    )
        external
        view
        returns (
            string memory name,
            string memory physicalAddress,
            string memory did,
            bool approved,
            uint256 registeredAt
        );
}

contract CertificateRegistry {
    IInstitutionRegistry public institutionRegistry;

    struct Certificate {
        bytes32 certHash; // keccak256(JSON contents)
        string ipfsCID; // IPFS content identifier
        address issuer; // Institution address
        address student; // Student wallet address
        uint256 issuedAt;
        bool isValid;
    }

    struct CertificateMetadata {
        string studentName;
        string degree;
        string major;
        string institution;
    }

    mapping(bytes32 => Certificate) public certificates;
    mapping(bytes32 => CertificateMetadata) public certificateMetadata;
    mapping(address => bytes32[]) public issuedCertificates;
    mapping(address => bytes32[]) public receivedCertificates;

    event CertificateIssued(
        bytes32 indexed certHash,
        string ipfsCID,
        address indexed issuer,
        address indexed student,
        uint256 timestamp
    );
    event CertificateRevoked(
        bytes32 indexed certHash,
        address indexed issuer,
        uint256 timestamp
    );
    event CertificateVerified(bytes32 indexed certHash, bool isValid);

    constructor(address registryAddr) {
        institutionRegistry = IInstitutionRegistry(registryAddr);
    }

    modifier onlyRegisteredInstitution() {
        require(
            institutionRegistry.isInstitutionRegistered(msg.sender),
            "Not a registered institution"
        );
        _;
    }

    /**
     * Issue a certificate
     */
    function issueCertificate(
        bytes32 certHash,
        string memory ipfsCID,
        address student,
        string memory studentName,
        string memory degree,
        string memory major,
        string memory institution
    ) external onlyRegisteredInstitution {
        require(certHash != bytes32(0), "Invalid certificate hash");
        require(bytes(ipfsCID).length > 0, "IPFS CID is required");
        require(student != address(0), "Invalid student address");

        certificates[certHash] = Certificate(
            certHash,
            ipfsCID,
            msg.sender,
            student,
            block.timestamp,
            true
        );

        certificateMetadata[certHash] = CertificateMetadata(
            studentName,
            degree,
            major,
            institution
        );

        issuedCertificates[msg.sender].push(certHash);
        receivedCertificates[student].push(certHash);

        emit CertificateIssued(
            certHash,
            ipfsCID,
            msg.sender,
            student,
            block.timestamp
        );
    }

    /**
     * Simplify issueCertificate for backward compatibility
     */
    function issueCertificate(
        bytes32 certHash,
        string memory ipfsCID
    ) external onlyRegisteredInstitution {
        require(certHash != bytes32(0), "Invalid certificate hash");
        require(bytes(ipfsCID).length > 0, "IPFS CID is required");

        certificates[certHash] = Certificate(
            certHash,
            ipfsCID,
            msg.sender,
            address(0),
            block.timestamp,
            true
        );

        emit CertificateIssued(
            certHash,
            ipfsCID,
            msg.sender,
            address(0),
            block.timestamp
        );
    }

    /**
     * Revoke a certificate
     */
    function revokeCertificate(
        bytes32 certHash
    ) external onlyRegisteredInstitution {
        require(
            certificates[certHash].issuer == msg.sender,
            "You did not issue this certificate"
        );
        certificates[certHash].isValid = false;
        emit CertificateRevoked(certHash, msg.sender, block.timestamp);
    }

    /**
     * Verify a certificate
     */
    function verifyCertificate(
        bytes32 certHash
    ) external view returns (Certificate memory) {
        return certificates[certHash];
    }

    /**
     * Get certificate with metadata
     */
    function getCertificateWithMetadata(
        bytes32 certHash
    )
        external
        view
        returns (Certificate memory cert, CertificateMetadata memory metadata)
    {
        return (certificates[certHash], certificateMetadata[certHash]);
    }

    /**
     * Get certificates issued by an institution
     */
    function getIssuedCertificates(
        address institution
    ) external view returns (bytes32[] memory) {
        return issuedCertificates[institution];
    }

    /**
     * Get certificates received by a student
     */
    function getReceivedCertificates(
        address student
    ) external view returns (bytes32[] memory) {
        return receivedCertificates[student];
    }

    /**
     * Check if certificate is valid
     */
    function isCertificateValid(bytes32 certHash) external view returns (bool) {
        return certificates[certHash].isValid;
    }
}
