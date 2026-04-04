// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Institution Registry with pending requests and admin approval
/// @notice Institutions can request registration; admin approves or rejects requests.
contract InstitutionRegistry {
    address public admin;

    struct Institution {
        string name;
        string physicalAddress;
        string did;
        bool approved;
        uint256 registeredAt;
    }

    struct PendingRequest {
        address institutionAddr;
        string name;
        string physicalAddress;
        string did;
        uint256 timestamp;
    }

    struct HistoryEntry {
        address institutionAddr;
        string name;
        string physicalAddress;
        string did;
        bool approved;
        uint256 timestamp;
    }

    // Storage
    mapping(address => Institution) private institutions;
    address[] private registeredAddresses;

    PendingRequest[] private pendingRequests;
    mapping(address => uint256) private pendingIndexPlusOne; // 0 means not pending

    HistoryEntry[] private historyEntries;

    // Events
    event InstitutionRequested(address indexed institution, string did);
    event InstitutionApproved(address indexed institution, string did);
    event InstitutionRejected(address indexed institution, string did);
    event InstitutionRemoved(address indexed institution);

    // Modifiers
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier notZeroAddress(address a) {
        require(a != address(0), "Zero address not allowed");
        _;
    }

    constructor() {
        admin = msg.sender;
    }

    /// @notice Submit a registration request (full form).
    function registerInstitution(
        address institutionAddr,
        string memory did,
        string memory name,
        string memory physicalAddress
    ) public notZeroAddress(institutionAddr) {
        // If already approved, reject
        if (institutions[institutionAddr].approved) {
            revert("Institution already approved");
        }
        // If already pending, reject
        if (pendingIndexPlusOne[institutionAddr] != 0) {
            revert("Institution already has a pending request");
        }

        pendingRequests.push(
            PendingRequest({
                institutionAddr: institutionAddr,
                name: name,
                physicalAddress: physicalAddress,
                did: did,
                timestamp: block.timestamp
            })
        );

        pendingIndexPlusOne[institutionAddr] = pendingRequests.length; // store index+1

        emit InstitutionRequested(institutionAddr, did);
    }

    /// @notice Convenience overload: keep compatibility with callers that pass only (address, string)
    function registerInstitution(
        address institutionAddr,
        string memory did
    ) public {
        registerInstitution(institutionAddr, did, "", "");
    }

    /// @notice Approve a pending request and mark as registered.
    function approveInstitution(
        address institutionAddr
    ) external onlyAdmin notZeroAddress(institutionAddr) {
        uint256 idxPlusOne = pendingIndexPlusOne[institutionAddr];
        require(idxPlusOne != 0, "No pending request for this address");
        uint256 idx = idxPlusOne - 1;
        PendingRequest memory req = pendingRequests[idx];

        // Mark as registered
        institutions[institutionAddr] = Institution({
            name: req.name,
            physicalAddress: req.physicalAddress,
            did: req.did,
            approved: true,
            registeredAt: block.timestamp
        });

        registeredAddresses.push(institutionAddr);

        // Add to history
        historyEntries.push(
            HistoryEntry({
                institutionAddr: institutionAddr,
                name: req.name,
                physicalAddress: req.physicalAddress,
                did: req.did,
                approved: true,
                timestamp: block.timestamp
            })
        );

        // Remove pending entry by swap & pop and clear mapping
        _removePendingByIndex(idx, institutionAddr);

        emit InstitutionApproved(institutionAddr, req.did);
    }

    /// @notice Reject a pending request.
    function rejectInstitution(
        address institutionAddr
    ) external onlyAdmin notZeroAddress(institutionAddr) {
        uint256 idxPlusOne = pendingIndexPlusOne[institutionAddr];
        require(idxPlusOne != 0, "No pending request for this address");
        uint256 idx = idxPlusOne - 1;
        PendingRequest memory req = pendingRequests[idx];

        // Add to history as rejected
        historyEntries.push(
            HistoryEntry({
                institutionAddr: institutionAddr,
                name: req.name,
                physicalAddress: req.physicalAddress,
                did: req.did,
                approved: false,
                timestamp: block.timestamp
            })
        );

        // Remove pending entry by swap & pop and clear mapping
        _removePendingByIndex(idx, institutionAddr);

        emit InstitutionRejected(institutionAddr, req.did);
    }

    /// @notice Remove (deactivate) a registered institution.
    function removeInstitution(
        address institutionAddr
    ) external onlyAdmin notZeroAddress(institutionAddr) {
        if (institutions[institutionAddr].approved) {
            // mark as not approved
            institutions[institutionAddr].approved = false;
            institutions[institutionAddr].registeredAt = 0;

            // Add to history
            historyEntries.push(
                HistoryEntry({
                    institutionAddr: institutionAddr,
                    name: institutions[institutionAddr].name,
                    physicalAddress: institutions[institutionAddr]
                        .physicalAddress,
                    did: institutions[institutionAddr].did,
                    approved: false,
                    timestamp: block.timestamp
                })
            );

            emit InstitutionRemoved(institutionAddr);
        } else {
            revert("Institution not registered");
        }
    }

    /// @notice Check whether an institution is registered/approved.
    function isInstitutionRegistered(
        address institutionAddr
    ) external view returns (bool) {
        return institutions[institutionAddr].approved;
    }

    /// @notice Return all pending requests.
    function getPendingInstitutions()
        external
        view
        returns (PendingRequest[] memory)
    {
        return pendingRequests;
    }

    /// @notice Return all registered institution addresses.
    function getInstitutions() external view returns (address[] memory) {
        return registeredAddresses;
    }

    /// @notice Return institution details for a given address.
    function getInstitution(
        address institutionAddr
    )
        external
        view
        returns (string memory, string memory, string memory, bool, uint256)
    {
        Institution memory inst = institutions[institutionAddr];
        return (
            inst.name,
            inst.physicalAddress,
            inst.did,
            inst.approved,
            inst.registeredAt
        );
    }

    /// @notice Return history entries (approved and rejected events).
    function getHistory() external view returns (HistoryEntry[] memory) {
        return historyEntries;
    }

    /// @dev Internal helper to remove a pending request at index (swap & pop) and clear mapping for removed address.
    function _removePendingByIndex(uint256 idx, address removedAddr) internal {
        uint256 last = pendingRequests.length - 1;

        if (idx != last) {
            PendingRequest memory lastReq = pendingRequests[last];
            pendingRequests[idx] = lastReq;
            pendingIndexPlusOne[lastReq.institutionAddr] = idx + 1;
        }

        // pop last
        pendingRequests.pop();

        // clear mapping for the removed address
        pendingIndexPlusOne[removedAddr] = 0;
    }
}
