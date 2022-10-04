const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Reentrancy", () => {
  let deployer;
  let bank, attackerContract;

  beforeEach(async () => {
    [deployer, user, attacker] = await ethers.getSigners();
    const Bank = await ethers.getContractFactory("Reentrancy", deployer);
    bank = await Bank.deploy();

    await bank.deposit({ value: ethers.utils.parseEther("100") });
    await bank.connect(user).deposit({ value: ethers.utils.parseEther("50") });

    const Attacker = await ethers.getContractFactory('Attacker', attacker);
    attackerContract = await Attacker.deploy(bank.address);
  });

  describe("deposits and withdraws", () => {
    it("accepts deposits", async () => {
      const deployerBalance = await bank.balanceOf(deployer.address);
      expect(deployerBalance).to.equal(ethers.utils.parseEther("100"));

      const userBalance = await bank.balanceOf(user.address);
      expect(userBalance).to.equal(ethers.utils.parseEther("50"));
    });

    it("accepts withdraw", async () => {
      await bank.withdraw();
      expect(await bank.balanceOf(deployer.address)).to.equal(0);
      expect(await bank.balanceOf(user.address)).to.equal(ethers.utils.parseEther('50'));
    });

    it('allows attacker to drain funds from withdraw()', async () => {
        console.log('###Before###');
        console.log(`Bank balance: ${ethers.utils.formatEther(await ethers.provider.getBalance(bank.address))}`);
        console.log(`Attacker balance: ${ethers.utils.formatEther(await ethers.provider.getBalance(attacker.address))}`);

        //Perform attack
        await attackerContract.attack({ value: ethers.utils.parseEther('10')});
        // await expect(attackerContract.attack({ value: ethers.utils.parseEther('10')})).to.be.reverted;
        console.log('###After###');
        console.log(`Bank balance: ${ethers.utils.formatEther(await ethers.provider.getBalance(bank.address))}`);
        console.log(`Attacker balance: ${ethers.utils.formatEther(await ethers.provider.getBalance(attacker.address))}`);

        expect(await ethers.provider.getBalance(bank.address)).to.equal(0);
    })
  });
});
