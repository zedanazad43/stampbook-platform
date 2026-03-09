/**
 * PancakeSwap V2 liquidity addition script for StampCoin (STP).
 *
 * Adds an initial BNB/STP liquidity pair on PancakeSwap V2.
 *
 * Usage (run AFTER mint-distribution.js):
 *   npx hardhat run scripts/add-liquidity.js --network bscTestnet
 *   npx hardhat run scripts/add-liquidity.js --network bscMainnet
 *
 * Required environment variables (set in .env):
 *   STP_CONTRACT_ADDRESS   — deployed STP token address
 *   LIQUIDITY_PRIVATE_KEY  — private key of the LIQUIDITY_WALLET that holds STP tokens
 *   STP_LIQUIDITY_AMOUNT   — STP amount to add (whole tokens, e.g. "10000000")
 *   BNB_LIQUIDITY_AMOUNT   — BNB amount to pair (e.g. "50")
 *
 * What this script does:
 *   1. Approves the PancakeSwap router to spend STP tokens.
 *   2. Calls addLiquidityETH() to create the BNB/STP pair and receive LP tokens.
 *   3. Prints the LP token address and transaction hash.
 */

const hre = require("hardhat");

// PancakeSwap V2 Router addresses
const PANCAKE_ROUTER = {
  bscTestnet: "0xD99D1c33F9fC3444f8101754aBC46c52416550D1",
  bscMainnet: "0x10ED43C718714eb63d5aA57B78B54704E256024E"
};

// Minimal ABI for the PancakeSwap V2 Router
const ROUTER_ABI = [
  "function addLiquidityETH(address token, uint amountTokenDesired, uint amountTokenMin, uint amountETHMin, address to, uint deadline) payable returns (uint amountToken, uint amountETH, uint liquidity)",
  "function factory() external pure returns (address)"
];

// Minimal ABI for ERC-20/BEP-20 approve
const TOKEN_ABI = [
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address) view returns (uint256)"
];

async function main() {
  const contractAddress = process.env.STP_CONTRACT_ADDRESS;
  if (!contractAddress || contractAddress === "0x0000000000000000000000000000000000000000") {
    throw new Error("STP_CONTRACT_ADDRESS not set.");
  }

  const stpAmountStr = process.env.STP_LIQUIDITY_AMOUNT || "10000000";   // 10M STP default
  const bnbAmountStr = process.env.BNB_LIQUIDITY_AMOUNT || "50";         // 50 BNB default
  const network      = hre.network.name;
  const routerAddr   = PANCAKE_ROUTER[network];

  if (!routerAddr) {
    throw new Error(`No PancakeSwap router configured for network: ${network}`);
  }

  // Use the liquidity wallet signer (or fall back to deployer)
  let signer;
  if (process.env.LIQUIDITY_PRIVATE_KEY) {
    const wallet = new hre.ethers.Wallet(process.env.LIQUIDITY_PRIVATE_KEY, hre.ethers.provider);
    signer = wallet;
  } else {
    [signer] = await hre.ethers.getSigners();
    console.warn("⚠️  LIQUIDITY_PRIVATE_KEY not set — using deployer key");
  }

  const DECIMALS     = 18n;
  const UNIT         = 10n ** DECIMALS;
  const stpAmount    = BigInt(stpAmountStr) * UNIT;
  const bnbAmount    = hre.ethers.parseEther(bnbAmountStr);

  console.log("=".repeat(65));
  console.log("StampCoin (STP) — PancakeSwap V2 Add Liquidity");
  console.log("=".repeat(65));
  console.log("Network         :", network);
  console.log("Signer          :", signer.address);
  console.log("STP Contract    :", contractAddress);
  console.log("Router          :", routerAddr);
  console.log("STP to add      :", stpAmountStr, "STP");
  console.log("BNB to add      :", bnbAmountStr, "BNB");
  console.log("-".repeat(65));

  const stpToken = await hre.ethers.getContractAt(TOKEN_ABI, contractAddress, signer);
  const router   = await hre.ethers.getContractAt(ROUTER_ABI, routerAddr, signer);

  // Check STP balance
  const stpBalance = await stpToken.balanceOf(signer.address);
  console.log("STP balance     :", hre.ethers.formatUnits(stpBalance, 18));
  if (stpBalance < stpAmount) {
    throw new Error(`Insufficient STP balance. Have ${hre.ethers.formatUnits(stpBalance, 18)}, need ${stpAmountStr}`);
  }

  // Check BNB balance
  const bnbBalance = await hre.ethers.provider.getBalance(signer.address);
  console.log("BNB balance     :", hre.ethers.formatEther(bnbBalance));
  if (bnbBalance < bnbAmount) {
    throw new Error(`Insufficient BNB balance. Have ${hre.ethers.formatEther(bnbBalance)}, need ${bnbAmountStr}`);
  }

  // Step 1 — Approve the router to spend STP
  console.log("\nStep 1: Approving PancakeSwap Router to spend STP …");
  const approveTx = await stpToken.approve(routerAddr, stpAmount);
  await approveTx.wait();
  console.log("  ✅  Approved. TX:", approveTx.hash);

  // Step 2 — Add liquidity
  console.log("\nStep 2: Adding BNB/STP liquidity …");
  const deadline = Math.floor(Date.now() / 1000) + 60 * 20;   // 20-minute deadline
  // Slippage tolerance — default 1%, configurable via SLIPPAGE_PERCENT env var
  const slippagePct = BigInt(Math.max(1, Math.min(50, Number(process.env.SLIPPAGE_PERCENT || "1"))));
  const stpAmountMin = stpAmount * (100n - slippagePct) / 100n;
  const bnbAmountMin = bnbAmount * (100n - slippagePct) / 100n;

  const liqTx = await router.addLiquidityETH(
    contractAddress,
    stpAmount,
    stpAmountMin,
    bnbAmountMin,
    signer.address,
    deadline,
    { value: bnbAmount }
  );
  const receipt = await liqTx.wait();
  console.log("  ✅  Liquidity added! TX:", liqTx.hash);

  const explorerBase = network === "bscMainnet"
    ? "https://bscscan.com"
    : "https://testnet.bscscan.com";
  console.log("  BscScan:", explorerBase + "/tx/" + liqTx.hash);

  const pancakeBase = network === "bscMainnet"
    ? "https://pancakeswap.finance/add"
    : "https://pancake.kiemtienonline360.com/#/add";
  console.log("  PancakeSwap pair:", pancakeBase + "/BNB/" + contractAddress);

  console.log("=".repeat(65));
  console.log("Liquidity successfully added to PancakeSwap V2!");
  console.log("LP tokens sent to:", signer.address);
  console.log("=".repeat(65));
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
