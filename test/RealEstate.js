const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

const ether = tokens;

describe("RealEstate", () => {
  let realEstate, escrow;
  let deployer, seller;
  let inspector, lender;
  let nftID = 1;
  let purchasePrice = ether(100);
  let escrowAmount = ether(20);

  beforeEach(async () => {
    //Set account
    accounts = await ethers.getSigners();
    deployer = accounts[0];
    seller = deployer;
    buyer = accounts[1];
    inspector = accounts[2];
    lender = accounts[3];

    //Load contract
    const RealEstate = await ethers.getContractFactory("RealEstate");
    const Escrow = await ethers.getContractFactory("Escrow");

    //Deploy contract
    realEstate = await RealEstate.deploy();

    escrow = await Escrow.deploy(
      realEstate.address,
      nftID,
      purchasePrice,
      escrowAmount,
      seller.address,
      buyer.address,
      inspector.address,
      lender.address
    );

    //Seller approve NFT (RealEstate Contract) before seller executes finalizeSale
    tx = await realEstate.connect(seller).approve(escrow.address, nftID);
  });

  describe("Deployment", () => {
    it("sends an NFT to the seller", async () => {
      expect(await realEstate.ownerOf(nftID)).to.equal(seller.address);
    });
  });

  describe("Selling real estate", () => {
    let tx, balance;

    it("executes a successful transaction", async () => {
      //Seller must be NFT owner before the sale
      expect(await realEstate.ownerOf(nftID)).to.equal(seller.address);

      balance = await escrow.getBalance();
      console.log(
        "Escrow balance before deposit:",
        ethers.utils.formatEther(balance)
      );

      //Buyer deposits earnest
      tx = await escrow.connect(buyer).depositEarnest({ value: ether(20) });
      console.log("Buyer deposits earnest money");
      //Check escrow balance
      balance = await escrow.getBalance();
      console.log("Escrow balance:", ethers.utils.formatEther(balance));

      //Inspector updates status
      tx = await escrow.connect(inspector).updateInspectionStatus(true);
      console.log("Inspector updates status");

      //Approval
      tx = await escrow.connect(buyer).approveSale();
      console.log("buyer approve");

      tx = await escrow.connect(seller).approveSale();
      console.log("seller approve");

      //Lender
      tx = await escrow.connect(lender).approveSale();
      console.log("lender approve");
      //Lender funds
      tx = await lender.sendTransaction({
        to: escrow.address,
        value: ethers.utils.parseEther("80"),
      });
      
      tx = await escrow.connect(buyer).finalizeSale();
      console.log("Buyer finalizes sale");

      //Check transfer
      expect(await realEstate.ownerOf(nftID)).to.equal(buyer.address);

      //Expect seller to receive funds
      balance = await ethers.provider.getBalance(seller.address);
      console.log("Seller balance:", ethers.utils.formatEther(balance));
    });
  });
});
