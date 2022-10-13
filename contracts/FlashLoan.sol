// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import 'hardhat/console.sol';
import "./ERC-20/myToken.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

interface IReceiver {
    function receiveTokens(address _tokenAdress, uint256 _amount) external;
}

contract FlashLoan is ReentrancyGuard {
    using SafeMath for uint256;

    myToken token;
    uint256 poolBalance;

    constructor(address _tokenAddress) {
        token = myToken(_tokenAddress);
    }

    function depositTokens(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Must deposit at least 1 token");
        token.transferFrom(msg.sender, address(this), _amount);
        poolBalance = poolBalance.add(_amount);
    }

    function flashLoan(uint256 _borrowAmount) external nonReentrant {
        require(_borrowAmount > 0, "Amount must be greater than zero");

        uint256 balanceBefore = token.balanceOf(address(this));
        require(balanceBefore >= _borrowAmount, "Tokens in pool is not enought");

        assert(poolBalance == balanceBefore);

        // Send tokens to receiver
        token.transfer(msg.sender, _borrowAmount);

        // Callback borrower
        IReceiver(msg.sender).receiveTokens(address(token), _borrowAmount);

        // Ensure borrower paid back
        uint256 balanceAfter = token.balanceOf(address(this));
        require(balanceAfter >= balanceBefore, "Borrower does not paid back");
    }
}
