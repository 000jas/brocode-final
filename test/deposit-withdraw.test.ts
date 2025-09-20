import { expect } from "chai";
import { ethers } from "hardhat";

describe("Deposit and Withdraw Vaults (Native SHM)", function () {
  it("Deposit and withdraw SHM correctly", async function () {
    const [owner, user] = await ethers.getSigners();

    // Deploy DepositVault
    const DepositVault = await ethers.getContractFactory("DepositVault");
    const depositVault = await DepositVault.deploy();
    await depositVault.waitForDeployment();

    // Deploy WithdrawHandler
    const WithdrawHandler = await ethers.getContractFactory("WithdrawHandler");
    const withdrawHandler = await WithdrawHandler.deploy(await depositVault.getAddress());
    await withdrawHandler.waitForDeployment();

    // Authorize withdraw handler
    await depositVault.setAuthorizedWithdrawer(await withdrawHandler.getAddress(), true);

    // Create vault
    await depositVault.createVault(1);

    // User deposits 3 SHM (native coin)
    await depositVault.connect(user).deposit(1, { value: ethers.parseEther("3") });

    expect(await depositVault.balanceOf(1, await user.getAddress()))
      .to.equal(ethers.parseEther("3"));

    // User withdraws 2 SHM via WithdrawHandler
    await withdrawHandler.connect(user).withdraw(1, ethers.parseEther("2"));

    expect(await depositVault.balanceOf(1, await user.getAddress()))
      .to.equal(ethers.parseEther("1"));
  });
});
