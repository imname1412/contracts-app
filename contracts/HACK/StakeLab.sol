// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

//Vulnerability solidity version < 0.8.0

contract StakeLab {
    uint unlockTime;
    mapping(address => uint) public balance;
    mapping(address => uint) public lockTime;

    constructor(uint _unlockTime) {
        unlockTime = _unlockTime;
    }

    modifier isQualify() {
        require(balance[msg.sender] > 0, "Insufficient funds");
        require(block.timestamp > lockTime[msg.sender], "Lock time not expire");
        _;
    }

    function deposit() external payable {
        balance[msg.sender] += msg.value;
        lockTime[msg.sender] = block.timestamp + unlockTime;
    }

    function increaseLockTime(uint _secondsToIncrease) external {
        lockTime[msg.sender] += _secondsToIncrease;
    }

    function withdraw() external isQualify {
        uint amount = balance[msg.sender];
        balance[msg.sender] = 0;

        (bool sent, ) = msg.sender.call{value: amount}("");
        require(sent, "Falied to send Ether");
    }
}