// SPDX-License-Identifier: MIT
pragma solidity ^0.8.22;

contract MultiSigWallet {
    error NotOwner();
    error InvalidOwners();
    error InvalidRequirement();
    error ZeroAddressOwner();
    error DuplicateOwner(address owner);
    error InvalidTarget();
    error TxDoesNotExist(uint256 txIndex);
    error TxAlreadyExecuted(uint256 txIndex);
    error TxAlreadyConfirmed(uint256 txIndex, address owner);
    error TxNotConfirmed(uint256 txIndex, address owner);
    error NotEnoughConfirmations(uint256 txIndex);
    error TransactionExecutionFailed(uint256 txIndex);

    event Deposit(address indexed sender, uint256 amount, uint256 balance);
    event SubmitTransaction(
        address indexed owner,
        uint256 indexed txIndex,
        address indexed to,
        uint256 value,
        bytes data
    );
    event ConfirmTransaction(address indexed owner, uint256 indexed txIndex);
    event RevokeConfirmation(address indexed owner, uint256 indexed txIndex);
    event ExecuteTransaction(address indexed owner, uint256 indexed txIndex);

    struct Transaction {
        address to;
        uint256 value;
        bytes data;
        bool executed;
        uint256 numConfirmations;
    }

    address[] private s_owners;
    mapping(address => bool) public isOwner;
    uint256 public immutable requiredConfirmations;
    Transaction[] private s_transactions;
    mapping(uint256 => mapping(address => bool)) public isConfirmed;

    modifier onlyOwner() {
        if (!isOwner[msg.sender]) revert NotOwner();
        _;
    }

    modifier txExists(uint256 txIndex) {
        if (txIndex >= s_transactions.length) revert TxDoesNotExist(txIndex);
        _;
    }

    modifier notExecuted(uint256 txIndex) {
        if (s_transactions[txIndex].executed) revert TxAlreadyExecuted(txIndex);
        _;
    }

    modifier notConfirmed(uint256 txIndex) {
        if (isConfirmed[txIndex][msg.sender]) {
            revert TxAlreadyConfirmed(txIndex, msg.sender);
        }
        _;
    }

    constructor(address[] memory owners, uint256 confirmationsRequired) {
        uint256 ownerCount = owners.length;
        if (ownerCount == 0) revert InvalidOwners();
        if (confirmationsRequired == 0 || confirmationsRequired > ownerCount) {
            revert InvalidRequirement();
        }

        for (uint256 i = 0; i < ownerCount; i++) {
            address owner = owners[i];
            if (owner == address(0)) revert ZeroAddressOwner();
            if (isOwner[owner]) revert DuplicateOwner(owner);

            isOwner[owner] = true;
            s_owners.push(owner);
        }

        requiredConfirmations = confirmationsRequired;
    }

    receive() external payable {
        emit Deposit(msg.sender, msg.value, address(this).balance);
    }

    function submitTransaction(
        address to,
        uint256 value,
        bytes calldata data
    ) external onlyOwner returns (uint256 txIndex) {
        if (to == address(0)) revert InvalidTarget();

        txIndex = s_transactions.length;
        s_transactions.push(
            Transaction({
                to: to,
                value: value,
                data: data,
                executed: false,
                numConfirmations: 0
            })
        );

        emit SubmitTransaction(msg.sender, txIndex, to, value, data);
    }

    function confirmTransaction(
        uint256 txIndex
    ) external onlyOwner txExists(txIndex) notExecuted(txIndex) notConfirmed(txIndex) {
        Transaction storage transaction = s_transactions[txIndex];
        transaction.numConfirmations += 1;
        isConfirmed[txIndex][msg.sender] = true;

        emit ConfirmTransaction(msg.sender, txIndex);
    }

    function revokeConfirmation(
        uint256 txIndex
    ) external onlyOwner txExists(txIndex) notExecuted(txIndex) {
        if (!isConfirmed[txIndex][msg.sender]) {
            revert TxNotConfirmed(txIndex, msg.sender);
        }

        Transaction storage transaction = s_transactions[txIndex];
        transaction.numConfirmations -= 1;
        isConfirmed[txIndex][msg.sender] = false;

        emit RevokeConfirmation(msg.sender, txIndex);
    }

    function executeTransaction(
        uint256 txIndex
    ) external onlyOwner txExists(txIndex) notExecuted(txIndex) {
        Transaction storage transaction = s_transactions[txIndex];
        if (transaction.numConfirmations < requiredConfirmations) {
            revert NotEnoughConfirmations(txIndex);
        }

        transaction.executed = true;

        (bool success, ) = transaction.to.call{value: transaction.value}(transaction.data);
        if (!success) revert TransactionExecutionFailed(txIndex);

        emit ExecuteTransaction(msg.sender, txIndex);
    }

    function getOwners() external view returns (address[] memory) {
        return s_owners;
    }

    function getTransactionCount() external view returns (uint256) {
        return s_transactions.length;
    }

    function getTransaction(
        uint256 txIndex
    )
        external
        view
        txExists(txIndex)
        returns (address to, uint256 value, bytes memory data, bool executed, uint256 numConfirmations)
    {
        Transaction storage transaction = s_transactions[txIndex];
        return (
            transaction.to,
            transaction.value,
            transaction.data,
            transaction.executed,
            transaction.numConfirmations
        );
    }
}
