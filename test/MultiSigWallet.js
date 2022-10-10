const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Multi-Signature Wallet", () => {
    async function deployContract() {
        const [alice, bob, charlie] = await ethers.getSigners();
        const MulSigWallet = await ethers.getContractFactory("MultiSigWallet", alice);
        
        const multisig = await MulSigWallet.deploy();
    
        await multisig.deployed();
    
        return { multisig, alice, bob, charlie };
      }

      describe("Deployment", () => {
        it("test", async () => {
          //...
        })
      })
})