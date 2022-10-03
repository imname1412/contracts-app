// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

interface IERC721 {
    function transferFrom(
        address _from,
        address _to,
        uint256 _tokenId
    ) external;
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
    bool inspectionPassed = false;

    mapping(address => bool) approval;

    receive() external payable {}

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

    modifier onlyBuyer() {
        require(msg.sender == buyer, "Only buyer can call this function");
        _;
    }

    modifier onlyInspector() {
        require(msg.sender == inspector, "only inspector can call this function");
        _;
    }

    function depositEarnest() external payable onlyBuyer {
        require(msg.value >= escrowAmount, "your value is not enought");
    }

    function updateInspectionStatus(bool _passed) external onlyInspector {
        inspectionPassed = _passed;
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    function approveSale() external {
        approval[msg.sender] = true;
    }

    function finalizeSale() external {
        require(inspectionPassed, "must pass inspection");
        require(approval[buyer], "must be approved by buyer");
        require(approval[seller], "must be approved by seller");
        require(approval[lender], "must be approved by lender");
        require(address(this).balance >= purchasePrice, "must have enought ether for sale");

        //pay to seller after finalize sale
        (bool sent, ) = payable(seller).call{value: address(this).balance}("");
        require(sent, "Failed to send Ether");

        //Transfer ownership
        IERC721(nftAddress).transferFrom(seller, buyer, nftId);
    }
}
