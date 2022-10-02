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

      //Buyer deposits earnest
      tx = await escrow.connect(buyer).depositEarnest({ value: ether(30) });

      //Check escrow balance
      balance = await escrow.getBalance();
      console.log("escrow balance:", ethers.utils.formatEther(balance));

      tx = await escrow.connect(buyer).finalizeSale();
      console.log("Buyer finalizes sale");

      //Check transfer
      expect(await realEstate.ownerOf(nftID)).to.equal(buyer.address);
    });
  });
});
