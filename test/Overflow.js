const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Overflow", function () {
    async function deployContract() {
      const WEEK_IN_SEC = 7 * 24 * 60 * 60;
      const unlockTime = WEEK_IN_SEC;
      
      const [owner, attacker] = await ethers.getSigners();
      const stakeLAB = await ethers.getContractFactory("StakeLab", owner);
      const Attacker = await ethers.getContractFactory("Attack", attacker);
      
      const stakelab = await stakeLAB.deploy(WEEK_IN_SEC);
      const attkContract = await Attacker.deploy(stakelab.address);
  
      await stakelab.deployed();
      await attkContract.deployed();
  
      return { stakelab, owner, attacker, attkContract, unlockTime };
    }
  
    describe("Deploying", function () {
      it("Deposit", async function () {
        const { stakelab, owner, attacker } = await loadFixture(deployContract);
    
        await stakelab.connect(owner).deposit({ value: ethers.utils.parseEther("1")});
        
        expect(await stakelab.balance(owner.address)).to.equal(ethers.utils.parseEther("1"));
        
        await stakelab.connect(attacker).deposit({ value: ethers.utils.parseEther("20")});
        //Call by Host contract
        expect(await stakelab.balance(attacker.address)).to.equal(ethers.utils.parseEther("20"));
        
        
      });
  
      it("withdraw", async function () {
        const { stakelab, unlockTime, owner} = await loadFixture(deployContract);

        await expect(stakelab.withdraw()).to.be.reverted;

        await stakelab.connect(owner).deposit( {value: ethers.utils.parseEther("1")})

        await expect(stakelab.connect(owner).withdraw()).to.be.revertedWith("Lock time not expire")

        await time.increaseTo(await time.latest() + unlockTime);

        await expect(stakelab.connect(owner).withdraw()).not.to.be.reverted;
      });
    })

    describe("Interface" , () => {
      it("Connected to stakeLab", async () => {
        const { attkContract} = await loadFixture(deployContract);

        //Call by Interface
        await attkContract.depositInterface({ value: ethers.utils.parseEther("10")})
        expect(ethers.utils.formatEther(await attkContract.balanceInterface())).to.equal('10.0');
      })
    })

    describe("ATTACK" , () => {
      it("withdraw by overflow exploit", async () => {
        const { stakelab, attkContract } = await loadFixture(deployContract);
        
        //Normal case
        console.log(`Attacker's contract balance: ${await ethers.provider.getBalance(attkContract.address)}`);
        await attkContract.depositInterface({ value: ethers.utils.parseEther("10")})
        console.log(`deposit value: ${ethers.utils.formatEther(await stakelab.balance(attkContract.address))} ETH`);
        console.log(`timelock: ${await stakelab.lockTime(attkContract.address)}`);

        await expect(attkContract.withdrawInterface()).to.be.revertedWith("Lock time not expire")

        //Exploit
        await attkContract.attack( {value: ethers.utils.parseEther("1")})
        console.log('####');
        console.log(`Attacker's contract balance: ${await ethers.provider.getBalance(attkContract.address)}`);
        console.log(`deposit value after attack: ${ethers.utils.formatEther(await stakelab.balance(attkContract.address))} ETH`);
        console.log(`compromised timelock: ${await stakelab.lockTime(attkContract.address)}`);
        
        expect(await stakelab.lockTime(attkContract.address)).to.be.equal(0);
      })
    })

  
  });