// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface IERC721 {
     function transferFrom(address _from, address _to, uint256 _tokenId) external;
}

contract Escrow {
    address public nftAddress;
    uint256 public nftId;
    uint256 public purchasePrice;
    uint256 public escrowAmount;
    address payable seller;
    address payable buyer;
    address public inspector;
    address public lender;

    constructor(
        address _nftAddress, 
        uint256 _nftId,
        uint256 _purchasePrice,
        uint256 _escrowAmount,
        address payable _seller, 
        address payable _buyer,
        address _inspector,
        address _lender
    ) {
        nftAddress = _nftAddress;
        nftId = _nftId;
        purchasePrice = _purchasePrice;
        escrowAmount = _escrowAmount;
        seller = _seller;
        buyer = _buyer;
        inspector = _inspector;
        lender = _lender;
    }

    modifier checkDeposit() {
        require(msg.value >= escrowAmount, "Your value is not enought");
        _;
    }

    function depositEarnest() public payable checkDeposit() {

    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function finalizeSale() public {
        //Transfer ownership
        IERC721(nftAddress).transferFrom(seller, buyer, nftId);
    }
}