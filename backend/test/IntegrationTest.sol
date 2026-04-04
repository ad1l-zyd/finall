// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "hardhat/console.sol";
import "./InstitutionRegistry.sol";
import "./CertificateRegistry.sol";
import "./StudentRegistry.sol";

contract IntegrationTest {
    InstitutionRegistry institutionRegistry;
    CertificateRegistry certificateRegistry;
    StudentRegistry studentRegistry;

    address public owner;
    address public institution1;
    address public institution2;
    address public student1;

    constructor() {
        owner = msg.sender;
        institution1 = address(0x1);
        institution2 = address(0x2);
        student1 = address(0x3);

        institutionRegistry = new InstitutionRegistry();
        certificateRegistry = new CertificateRegistry(
            address(institutionRegistry)
        );
        studentRegistry = new StudentRegistry();
    }

    function testInstitutionAsFlow() public {
        // Test institution registration flow
        console.log("Testing Institution Registration Flow...");

        // Institution requests registration
        institutionRegistry.registerInstitution(
            institution1,
            "did:web:university1.edu",
            "University 1",
            "City 1"
        );

        // Check pending
        InstitutionRegistry.PendingRequest[]
            memory pending = institutionRegistry.getPendingInstitutions();
        console.log("Pending institutions:", pending.length);

        // Admin approves
        institutionRegistry.approveInstitution(institution1);

        // Check if registered
        bool isRegistered = institutionRegistry.isInstitutionRegistered(
            institution1
        );
        console.log("Institution registered:", isRegistered);

        // Get details
        (
            string memory name,
            string memory physAddr,
            string memory did,
            bool approved,

        ) = institutionRegistry.getInstitution(institution1);
        console.log("Institution name:", name);
        console.log("Institution approved:", approved);
    }

    function testStudentRegistration() public {
        // Test student registration
        console.log("Testing Student Registration...");

        studentRegistry.registerStudent(
            student1,
            "STU001",
            "John Doe",
            "2000-01-15"
        );

        bool isRegistered = studentRegistry.isStudentRegistered(student1);
        console.log("Student registered:", isRegistered);

        StudentRegistry.Student memory student = studentRegistry.getStudent(
            student1
        );
        console.log("Student ID:", student.studentId);
        console.log("Student name:", student.name);
    }

    function testCertificateFlow() public {
        // First register institution
        institutionRegistry.registerInstitution(
            institution1,
            "did:web:university2.edu",
            "University 2",
            "City 2"
        );
        institutionRegistry.approveInstitution(institution1);

        // Register student
        studentRegistry.registerStudent(
            student1,
            "STU002",
            "Jane Smith",
            "2001-05-20"
        );

        // Issue certificate
        bytes32 certHash = keccak256(
            abi.encodePacked("cert_data", block.timestamp)
        );

        certificateRegistry.issueCertificate(
            certHash,
            "QmExampleIPFSHash123",
            student1,
            "Jane Smith",
            "Bachelor of Science",
            "Computer Science",
            "University 2"
        );

        // Verify certificate
        CertificateRegistry.Certificate memory cert = certificateRegistry
            .verifyCertificate(certHash);
        console.log("Certificate issued:", cert.isValid);
        console.log("Student address:", cert.student);

        // Get metadata
        (
            ,
            CertificateRegistry.CertificateMetadata memory metadata
        ) = certificateRegistry.getCertificateWithMetadata(certHash);
        console.log("Degree:", metadata.degree);
        console.log("Major:", metadata.major);
    }
}
