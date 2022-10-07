// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

interface ITL {
    function deposit() external payable;
    function increaseLockTime(uint _secondsToIncrease) external;
    function withdraw() external;
    function balance(address addr) external view returns (uint);
    function lockTime(address addr) external view returns (uint);
}

contract Attack {
    ITL stakeLab;

    constructor(address _defi) {
        stakeLab = ITL(_defi);
    }

    receive() external payable {}

    function attack() public payable {
       //learning...
    }
}
