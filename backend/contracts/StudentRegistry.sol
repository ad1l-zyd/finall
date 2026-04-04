// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Student Registry
 * @notice Manages student registration and identity tracking
 */
contract StudentRegistry {
    struct Student {
        address walletAddress;
        string studentId;
        string name;
        string dateOfBirth;
        bool registered;
        uint256 registeredAt;
    }

    mapping(address => Student) public students;
    mapping(string => address) public studentIdToAddress;
    address[] public registeredStudents;

    event StudentRegistered(address indexed student, string studentId);
    event StudentUpdated(address indexed student, string studentId);

    /**
     * Register a new student
     */
    function registerStudent(
        address walletAddress,
        string memory studentId,
        string memory name,
        string memory dateOfBirth
    ) external {
        require(walletAddress != address(0), "Invalid wallet address");
        require(bytes(studentId).length > 0, "Student ID is required");
        require(
            !students[walletAddress].registered,
            "Student already registered"
        );
        require(
            studentIdToAddress[studentId] == address(0),
            "Student ID already in use"
        );

        students[walletAddress] = Student({
            walletAddress: walletAddress,
            studentId: studentId,
            name: name,
            dateOfBirth: dateOfBirth,
            registered: true,
            registeredAt: block.timestamp
        });

        studentIdToAddress[studentId] = walletAddress;
        registeredStudents.push(walletAddress);

        emit StudentRegistered(walletAddress, studentId);
    }

    /**
     * Get student details
     */
    function getStudent(
        address walletAddress
    ) external view returns (Student memory) {
        require(students[walletAddress].registered, "Student not found");
        return students[walletAddress];
    }

    /**
     * Check if student is registered
     */
    function isStudentRegistered(
        address walletAddress
    ) external view returns (bool) {
        return students[walletAddress].registered;
    }

    /**
     * Get address from student ID
     */
    function getAddressByStudentId(
        string memory studentId
    ) external view returns (address) {
        return studentIdToAddress[studentId];
    }

    /**
     * Get all registered students
     */
    function getAllStudents() external view returns (address[] memory) {
        return registeredStudents;
    }

    /**
     * Update student information
     */
    function updateStudent(
        address walletAddress,
        string memory name,
        string memory dateOfBirth
    ) external {
        require(students[walletAddress].registered, "Student not registered");

        students[walletAddress].name = name;
        students[walletAddress].dateOfBirth = dateOfBirth;

        emit StudentUpdated(walletAddress, students[walletAddress].studentId);
    }
}
