// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract MultiSigWallet {
    event Deposit(address indexed sender, uint amount);
    event Submit(uint indexed txId);
    event Approve(address indexed owner, uint indexed txId);
    event Revoke(address indexed owner, uint indexed txId);
    event Execute(uint indexed txId);

    struct Transaction {
        address to;
        uint value;
        bytes data;
        bool excecuted;
    }

    address[] public owners;
    mapping(address => bool) public isOwner;
    uint public required;

    Transaction[] public transactions;
    mapping(uint => mapping(address => bool)) public approved;

    modifier onlyOwner() {
        require(isOwner[msg.sender], "your are not owner");
        _;
    }

    modifier txExists(uint _txId) {
        require(_txId < transactions.length, "tx does not exist");
        _;
    }

    modifier notApproved(uint _txId) {
        require(!approved[_txId][msg.sender], "tx already approved");
        _;
    }

    modifier notExecuted(uint _txId) {
        require(!transactions[_txId].excecuted, "tx already executed");
        _;
    }

    constructor (address[] memory _owner, uint _required) {
        require(_owner.length > 0, "owners required");
        require(_required > 0 && _required <= _owner.length, "invalid required of owners");

        for (uint i; i < _owner.length; i++) {
            address owner = _owner[i];
            require(owner != address(0), "invalid owner");
            require(!isOwner[owner], "owner is not unique");

            isOwner[owner] = true;
            owners.push(owner);
        }

        required = _required;
    }

    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }

    function submit(address _to, uint _value, bytes calldata _data) external onlyOwner {
        // key value mapping
        transactions.push(Transaction({
            to: _to,
            value: _value,
            data: _data,
            excecuted: false
        }));
        //start tx at 0
        emit Submit(transactions.length - 1);
    }

    function approve(uint _txId)
        external 
        onlyOwner 
        txExists(_txId) 
        notApproved(_txId)
        notExecuted(_txId)
    {
        approved[_txId][msg.sender] = true;
        emit Approve(msg.sender, _txId);
    }

    function _getApprovalCount(uint _txId) private view returns (uint count) {
        for (uint i; i < owners.length; i++) {
            if (approved[_txId][owners[i]]) {
                count++;
            }
        }
    }

    function execute(uint _txId) external txExists(_txId) notExecuted(_txId) {
        require(_getApprovalCount(_txId) >= required, "approvals less than required");
        Transaction storage transaction = transactions[_txId];
        transaction.excecuted = true;
        //_to.call{ value: eth}(data);
        (bool sent, ) = transaction.to.call{ value: transaction.value}(transaction.data);
        require(sent, "Failed to send Ether");

        emit Execute(_txId);
    }

    function revoke(uint _txId) external onlyOwner txExists(_txId) notExecuted(_txId) {
        require(approved[_txId][msg.sender], "tx not approved");
        approved[_txId][msg.sender] = false;

        emit Revoke(msg.sender, _txId);
    }
}