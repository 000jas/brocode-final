import { ethers } from "hardhat";

describe("Lock", function () {
  let lock: any;
  let unlockTime: number;
  let lockedAmount = ethers.parseEther("0.001"); // 0.001 ETH

  beforeEach(async function () {
    unlockTime = Math.floor(Date.now() / 1000) + 60; // 60 seconds from now
    const Lock = await ethers.getContractFactory("Lock");
    lock = await Lock.deploy(unlockTime, { value: lockedAmount });
  });

  it("Should set the right unlockTime", async function () {
    const actualUnlockTime = await lock.unlockTime();
    if (actualUnlockTime.toString() !== unlockTime.toString()) {
      throw new Error(`Expected unlockTime ${unlockTime}, got ${actualUnlockTime}`);
    }
  });

  it("Should set the right owner", async function () {
    const [owner] = await ethers.getSigners();
    const actualOwner = await lock.owner();
    if (actualOwner !== owner.address) {
      throw new Error(`Expected owner ${owner.address}, got ${actualOwner}`);
    }
  });

  it("Should receive and store the funds to lock", async function () {
    const balance = await ethers.provider.getBalance(lock.target);
    if (balance !== lockedAmount) {
      throw new Error(`Expected balance ${lockedAmount}, got ${balance}`);
    }
  });

  it("Shouldn't allow withdrawals before unlock time", async function () {
    try {
      await lock.withdraw();
      throw new Error("Expected withdrawal to fail");
    } catch (error: any) {
      if (!error.message.includes("You can't withdraw yet")) {
        throw new Error(`Expected "You can't withdraw yet" error, got: ${error.message}`);
      }
    }
  });

  it("Shouldn't allow withdrawals from a non-owner", async function () {
    const [, otherAccount] = await ethers.getSigners();
    try {
      await lock.connect(otherAccount).withdraw();
      throw new Error("Expected withdrawal to fail");
    } catch (error: any) {
      if (!error.message.includes("You aren't the owner")) {
        throw new Error(`Expected "You aren't the owner" error, got: ${error.message}`);
      }
    }
  });
});
