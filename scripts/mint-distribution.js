/**
 * Initial STP token distribution mint script.
 *
 * Mints the full 421,000,000 STP supply across six allocations:
 *
 *   20%  Public ICO Sale       →  84,200,000 STP  (ICO_WALLET)
 *   20%  Ecosystem & Partners  →  84,200,000 STP  (ECOSYSTEM_WALLET)
 *   20%  Community & Rewards   →  84,200,000 STP  (COMMUNITY_WALLET)
 *   15%  Liquidity Pool        →  63,150,000 STP  (LIQUIDITY_WALLET)
 *   15%  Team & Founders       →  63,150,000 STP  (TEAM_WALLET)  ← 2-yr vesting
 *   10%  Reserve               →  42,100,000 STP  (RESERVE_WALLET)
 *
 * Usage (run AFTER deploy.js):
 *   npx hardhat run scripts/mint-distribution.js --network bscTestnet
 *   npx hardhat run scripts/mint-distribution.js --network bscMainnet
 *
 * Required environment variables (set in .env):
 *   STP_CONTRACT_ADDRESS   — deployed contract address
 *   ICO_WALLET             — recipient wallet for public ICO allocation
 *   ECOSYSTEM_WALLET       — recipient wallet for ecosystem allocation
 *   COMMUNITY_WALLET       — recipient wallet for community allocation
 *   LIQUIDITY_WALLET       — recipient wallet for liquidity pool allocation
 *   TEAM_WALLET            — recipient wallet for team & founders allocation
 *   RESERVE_WALLET         — recipient wallet for reserve allocation
 *   DEPLOYER_PRIVATE_KEY   — owner private key (must be the contract owner)
 */

const hre = require("hardhat");

// Token parameters
const DECIMALS   = 18n;
const UNIT       = 10n ** DECIMALS;

const ALLOCATIONS = [
  { name: "Public ICO Sale",      envKey: "ICO_WALLET",       amount: 84_200_000n * UNIT },
  { name: "Ecosystem & Partners", envKey: "ECOSYSTEM_WALLET", amount: 84_200_000n * UNIT },
  { name: "Community & Rewards",  envKey: "COMMUNITY_WALLET", amount: 84_200_000n * UNIT },
  { name: "Liquidity Pool",       envKey: "LIQUIDITY_WALLET", amount: 63_150_000n * UNIT },
  { name: "Team & Founders",      envKey: "TEAM_WALLET",      amount: 63_150_000n * UNIT },
  { name: "Reserve",              envKey: "RESERVE_WALLET",   amount: 42_100_000n * UNIT },
];

async function main() {
  const contractAddress = process.env.STP_CONTRACT_ADDRESS;
  if (!contractAddress || contractAddress === "0x0000000000000000000000000000000000000000") {
    throw new Error(
      "STP_CONTRACT_ADDRESS not set. Run deploy.js first and update your .env file."
    );
  }

  const [owner] = await hre.ethers.getSigners();
  const StampCoin = await hre.ethers.getContractAt("StampCoin", contractAddress, owner);

  console.log("=".repeat(65));
  console.log("StampCoin (STP) — Initial Token Distribution");
  console.log("=".repeat(65));
  console.log("Contract  :", contractAddress);
  console.log("Owner     :", owner.address);
  console.log("Network   :", hre.network.name);
  console.log("-".repeat(65));

  // Validate that all recipient wallets are configured
  for (const alloc of ALLOCATIONS) {
    if (!process.env[alloc.envKey]) {
      throw new Error(
        `Environment variable ${alloc.envKey} is not set. ` +
        "Please configure all recipient wallet addresses in your .env file."
      );
    }
  }

  let totalMinted = 0n;

  for (const alloc of ALLOCATIONS) {
    const recipient = process.env[alloc.envKey];
    const humanAmount = hre.ethers.formatUnits(alloc.amount, DECIMALS);

    console.log(`Minting  ${humanAmount.padStart(14)} STP  →  ${alloc.name}`);
    console.log(`          Recipient: ${recipient}`);

    const tx = await StampCoin.mint(recipient, alloc.amount);
    await tx.wait();
    console.log(`          ✅  TX: ${tx.hash}`);

    totalMinted += alloc.amount;
  }

  console.log("-".repeat(65));
  const totalHuman = hre.ethers.formatUnits(totalMinted, DECIMALS);
  console.log(`Total minted: ${totalHuman} STP`);
  console.log("Distribution complete!");
  console.log("=".repeat(65));
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
