const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");

describe("Deploying", function () {
    async function deployContract() {
      const stakeLAB = await ethers.getContractFactory("StakeLab");
      const [owner, addr1, addr2] = await ethers.getSigners();
  
      const stakelab = await stakeLAB.deploy();
  
      await stakelab.deployed();
  
      return { stakeLAB, stakelab, owner, addr1, addr2 };
    }
  
// Test deploy & call some function  
    it("balance must be zero", async function () {
      const { stakelab, owner } = await loadFixture(deployContract);
  
      const ownerBalance = await stakelab.balance(owner.address);
      expect(ownerBalance).to.equal(0);
    });

    it("withdraw to be reverted", async function () {
      const { stakelab } = await loadFixture(deployContract);
  
      await expect(stakelab.withdraw()).to.be.reverted;
    });

    it("deposit function", async function () {
      const { stakelab, owner } = await loadFixture(deployContract);

      await stakelab.connect(owner).deposit({ value: ethers.utils.parseEther("100") });
      expect(await stakelab.balance(owner.address)).to.equal(ethers.utils.parseEther("100"));
    });
  
    
  });