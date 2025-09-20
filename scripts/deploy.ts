import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const DepositVault = await ethers.getContractFactory("DepositVault");
  const depositVault = await DepositVault.deploy();
  await depositVault.waitForDeployment();
  console.log("DepositVault deployed at:", await depositVault.getAddress());

  const WithdrawHandler = await ethers.getContractFactory("WithdrawHandler");
  const withdrawHandler = await WithdrawHandler.deploy(await depositVault.getAddress());
  await withdrawHandler.waitForDeployment();
  console.log("WithdrawHandler deployed at:", await withdrawHandler.getAddress());

  await depositVault.setAuthorizedWithdrawer(await withdrawHandler.getAddress(), true);
  console.log("Authorized WithdrawHandler");

  await depositVault.createVault(1);
  console.log("Vault 1 created");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
