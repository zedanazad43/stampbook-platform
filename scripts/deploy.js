/**
 * Hardhat deployment script for the StampCoin (STP) BEP-20 contract.
 *
 * Usage:
 *   # BSC Testnet
 *   npx hardhat run scripts/deploy.js --network bscTestnet
 *
 *   # BSC Mainnet (production — use with caution)
 *   npx hardhat run scripts/deploy.js --network bscMainnet
 *
 * After deployment:
 *   1. Copy the printed contract address into your .env:
 *        STP_CONTRACT_ADDRESS=0x...
 *   2. Verify the contract on BscScan:
 *        npx hardhat verify --network bscTestnet <address> <ownerAddress>
 */

const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("=".repeat(60));
  console.log("StampCoin (STP) — BEP-20 Deployment");
  console.log("=".repeat(60));
  console.log("Network       :", hre.network.name);
  console.log("Deployer      :", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance       :", hre.ethers.formatEther(balance), "BNB");
  console.log("-".repeat(60));

  // Deploy the contract — pass the deployer address as the initial owner
  const StampCoin = await hre.ethers.getContractFactory("StampCoin");
  console.log("Deploying StampCoin …");
  const stp = await StampCoin.deploy(deployer.address);
  await stp.waitForDeployment();

  const address = await stp.getAddress();

  console.log("✅  Contract deployed!");
  console.log("Contract address  :", address);
  console.log("Owner             :", deployer.address);
  console.log("Max supply        :", hre.ethers.formatUnits(await stp.maxSupply(), 18), "STP");
  console.log("-".repeat(60));

  // Print the BscScan URL for easy verification
  const explorerBase = hre.network.name === "bscMainnet"
    ? "https://bscscan.com"
    : "https://testnet.bscscan.com";
  console.log("BscScan URL       :", explorerBase + "/address/" + address);
  console.log("\nNext step — add to your .env file:");
  console.log("  STP_CONTRACT_ADDRESS=" + address);
  console.log("=".repeat(60));
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
