// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "hardhat/console.sol";
import "./FlashLoan.sol";
import "./ERC-20/myToken.sol";

contract FlashLoanReceiver {
    FlashLoan pool;
    address owner;

    event LoanReceived(address token, uint256 amount);

    constructor(address _poolAddress) {
        pool = FlashLoan(_poolAddress);
        owner = msg.sender;
    }

    function receiveTokens(address _tokenAdress, uint256 _amount) external {
        require(msg.sender == address(pool), "Sender must be pool");
        // Do somthing with tokens ... like arbitrage

        // check loan amount
        require(myToken(_tokenAdress).balanceOf(address(this)) == _amount, "Failed to get Loan");
        emit LoanReceived(_tokenAdress, _amount);

        // paid back to pool
        require(myToken(_tokenAdress).transfer(msg.sender, _amount), "Failed to paid back to the pool");
    }

    function executeFlashLoad(uint256 _amount) external {
        require(msg.sender == owner, "Only owner can execute flashLoan");
        pool.flashLoan(_amount);
    }
}
