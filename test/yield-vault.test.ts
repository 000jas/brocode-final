import { expect } from "chai";
import { ethers } from "hardhat";

describe("YieldVault", function () {
  it("should distribute SHM rewards proportionally", async function () {
    const [owner, user1, user2] = await ethers.getSigners();

    // Deploy SHMToken
    const SHM = await ethers.getContractFactory("SHMToken");
    const shm = await SHM.deploy("Shardeum Token", "SHM");
    await shm.waitForDeployment();

    // Deploy DepositVault
    const DepositVault = await ethers.getContractFactory("DepositVault");
    const depositVault = await DepositVault.deploy();
    await depositVault.waitForDeployment();

    // Deploy YieldVault
    const YieldVault = await ethers.getContractFactory("YieldVault");
    const yieldVault = await YieldVault.deploy(await depositVault.getAddress(), await shm.getAddress());
    await yieldVault.waitForDeployment();

    // Create vault
    await depositVault.createVault(1);

    // Users deposit native SHM
    await depositVault.connect(user1).deposit(1, { value: ethers.parseEther("3") });
    await depositVault.connect(user2).deposit(1, { value: ethers.parseEther("7") });

    // Fund rewards (owner mints SHM and funds vault)
    await shm.mint(owner.address, ethers.parseEther("100"));
    await shm.approve(await yieldVault.getAddress(), ethers.parseEther("100"));
    await yieldVault.fundRewards(1, ethers.parseEther("100"));

    // Users claim rewards
    await yieldVault.connect(user1).claimYield(1);
    await yieldVault.connect(user2).claimYield(1);

    const bal1 = await shm.balanceOf(await user1.getAddress());
    const bal2 = await shm.balanceOf(await user2.getAddress());

    // User1 should get ~30, User2 ~70
    expect(bal1).to.equal(ethers.parseEther("30"));
    expect(bal2).to.equal(ethers.parseEther("70"));
  });
});
