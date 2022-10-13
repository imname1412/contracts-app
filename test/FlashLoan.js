const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Flash Loan", () => {
    async function deployContract() {
        const [deployer, borrower] = await ethers.getSigners();

        const Token = await ethers.getContractFactory("myToken", deployer);
        const FlashLoan = await ethers.getContractFactory("FlashLoan", deployer);
        const FlashLoanReceiver = await ethers.getContractFactory("FlashLoanReceiver", borrower);

        //Token
        const token = await Token.deploy("MerklePatt", "MKP", "1000000");
        //Pool
        const flashloan = await FlashLoan.deploy(token.address);
        let tx = await token.connect(deployer).approve(flashloan.address, ethers.utils.parseEther('1000000'))
        //Deposit tokens into the pool
        tx = await flashloan.connect(deployer).depositTokens(ethers.utils.parseEther('1000000'))
        //Borrower
        const flashloanReceiver = await FlashLoanReceiver.deploy(flashloan.address);
    
        await token.deployed();
        await flashloan.deployed();
        await flashloanReceiver.deployed();
    
        return { flashloan, token, flashloanReceiver, deployer, borrower };
      }

      describe("Deployment", () => {
        it("Token minted to pool address", async () => {
          const { flashloan, token } = await loadFixture(deployContract);
          //console.log(`${ethers.utils.formatEther(await token.balanceOf(flashloan.address))} ${await token.symbol()}`);
          expect(await token.balanceOf(flashloan.address)).to.equal(ethers.utils.parseEther('1000000'));
        })
    })

    describe("Borrowing funds", () => {
        it("borrow funds from the pool", async () => {
          const { flashloanReceiver, token, deployer, borrower } = await loadFixture(deployContract);
          let amount = ethers.utils.parseEther('100');
    
          await expect(flashloanReceiver.connect(deployer).executeFlashLoad(amount)).to.be.reverted;

          let tx = await flashloanReceiver.connect(borrower).executeFlashLoad(amount);
          await expect(tx)
            .to.emit(flashloanReceiver, "LoanReceived")
            .withArgs(token.address, amount);

          expect(await token.balanceOf(flashloanReceiver.address)).to.equal(0);
        })
    })
})