const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Counter.sol", () => {
  let counter;

  beforeEach(async () => {
    const Counter = await ethers.getContractFactory("Counter");
    counter = await Counter.deploy("Alice", 1);
  });

  describe("Deployment", () => {
    it("get initial count", async () => {
      expect(await counter.getCount()).to.equal(1);
    });

    it("get initial name", async () => {
      expect(await counter.getName()).to.equal("Alice");
    });
  });

  describe("Variable", () => {
    it('get count from public variable "count"', async () => {
      expect(await counter.count()).to.equal(1);
    });

    it('get count from "getCount()" function', async () => {
      expect(await counter.getCount()).to.equal(1);
    });

    it('get count from public variable "name"', async () => {
      expect(await counter.name()).to.equal("Alice");
    });

    it('get count from "getName()" function', async () => {
      expect(await counter.getName()).to.equal("Alice");
    });

    it("set new name", async () => {
      await counter.setName("Bob");

      expect(await counter.getName()).to.equal("Bob");
    });
  });

  describe("Counting", () => {
    it("count increment", async () => {
      await counter.IncreaseNum();

      expect(await counter.getCount()).to.equal(2);

      await counter.IncreaseNum();

      expect(await counter.getCount()).to.equal(3);
    });

    it("count decrement", async () => {
      await counter.decreaseNum();

      expect(await counter.getCount()).to.equal(0);

      //! err test
      await expect(counter.decreaseNum()).to.be.reverted;
    });

    it("reset", async () => {
      await counter.resetCount();

      expect(await counter.getCount()).to.equal(0);
    });
  });
});
