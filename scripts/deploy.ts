import hre from "hardhat";
import { ethers } from "ethers";

async function main() {
  console.log("Available tasks:", Object.keys(hre.tasks));
  
  const currentTimestampInSeconds = Math.round(Date.now() / 1000);
  const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
  const unlockTime = currentTimestampInSeconds + ONE_YEAR_IN_SECS;

  const lockedAmount = ethers.parseEther("1");

  // Try using the artifacts to get contract info
  const artifact = await hre.artifacts.readArtifact("Lock");
  console.log("Contract artifact:", artifact.contractName);
  
  console.log("Deployment would happen here with unlock time:", unlockTime);
  console.log("Locked amount:", lockedAmount.toString());
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
