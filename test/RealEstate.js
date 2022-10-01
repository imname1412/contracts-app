const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RealEstate", () => {
  let realEstate, escrow;
  let deployer, seller;
  let nftID = 1;

  beforeEach(async () => {
    //Set account
    accounts = await ethers.getSigners();
    deployer = accounts[0];
    seller = deployer;
    buyer = accounts[1];

    //Load contract
    const RealEstate = await ethers.getContractFactory("RealEstate");
    const Escrow = await ethers.getContractFactory("Escrow");

    //Deploy contract
    realEstate = await RealEstate.deploy();

    escrow = await Escrow.deploy(
      realEstate.address,
      nftID,
      seller.address,
      buyer.address
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
    let tx;

    it("executes a successful transaction", async () => {
      //Seller must be NFT owner before the sale
      expect(await realEstate.ownerOf(nftID)).to.equal(seller.address);

      tx = await escrow.connect(buyer).finalizeSale();
      console.log("Buyer finalizes sale");

      //Check transfer
      expect(await realEstate.ownerOf(nftID)).to.equal(buyer.address);
    });
  });
});
