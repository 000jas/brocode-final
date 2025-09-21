import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  // DepositVault
  const DepositVault = await ethers.getContractFactory("DepositVault");
  const depositVault = await DepositVault.deploy();
  await depositVault.waitForDeployment();
  console.log("DepositVault deployed at:", await depositVault.getAddress());

  // WithdrawHandler
  const WithdrawHandler = await ethers.getContractFactory("WithdrawHandler");
  const withdrawHandler = await WithdrawHandler.deploy(await depositVault.getAddress());
  await withdrawHandler.waitForDeployment();
  console.log("WithdrawHandler deployed at:", await withdrawHandler.getAddress());

  await depositVault.setAuthorizedWithdrawer(await withdrawHandler.getAddress(), true);
  await depositVault.createVault(1);
  console.log("Authorized WithdrawHandler\nVault 1 created");

  // SHMToken
  const SHMToken = await ethers.getContractFactory("SHMToken");
  const shm = await SHMToken.deploy("Shardeum Token", "SHM");
  await shm.waitForDeployment();
  console.log("SHMToken deployed at:", await shm.getAddress());

  // YieldVault
  const YieldVault = await ethers.getContractFactory("YieldVault");
  const yieldVault = await YieldVault.deploy(
    await depositVault.getAddress(),
    await shm.getAddress()
  );
  await yieldVault.waitForDeployment();
  console.log("YieldVault deployed at:", await yieldVault.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
