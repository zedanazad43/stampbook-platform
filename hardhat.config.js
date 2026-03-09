/**
 * Hardhat configuration for StampCoin (STP) smart contract deployment.
 *
 * Supports:
 *  - BSC Testnet  (chainId 97)  — for testing before mainnet launch
 *  - BSC Mainnet  (chainId 56)  — production deployment
 *
 * Required environment variables (set in .env, never commit):
 *   DEPLOYER_PRIVATE_KEY   — private key of the deploying wallet (no 0x prefix)
 *   BSC_TESTNET_RPC        — (optional) custom testnet RPC URL
 *   BSC_MAINNET_RPC        — (optional) custom mainnet RPC URL
 *   BSCSCAN_API_KEY        — BscScan API key for contract verification
 */

require("@nomicfoundation/hardhat-toolbox");

const DEPLOYER_KEY = process.env.DEPLOYER_PRIVATE_KEY
  ? [process.env.DEPLOYER_PRIVATE_KEY]
  : [];

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: { enabled: true, runs: 200 }
    }
  },

  networks: {
    // ── BSC Testnet (Chain ID 97) ─────────────────────────────────────────
    bscTestnet: {
      url: process.env.BSC_TESTNET_RPC ||
           "https://data-seed-prebsc-1-s1.binance.org:8545/",
      chainId: 97,
      accounts: DEPLOYER_KEY,
      gasPrice: 10_000_000_000   // 10 Gwei
    },

    // ── BSC Mainnet (Chain ID 56) ─────────────────────────────────────────
    bscMainnet: {
      url: process.env.BSC_MAINNET_RPC ||
           "https://bsc-dataseed.binance.org/",
      chainId: 56,
      accounts: DEPLOYER_KEY,
      gasPrice: 5_000_000_000    // 5 Gwei
    }
  },

  // Contract verification on BscScan
  etherscan: {
    apiKey: {
      bsc:        process.env.BSCSCAN_API_KEY || "",
      bscTestnet: process.env.BSCSCAN_API_KEY || ""
    },
    customChains: [
      {
        network: "bscTestnet",
        chainId: 97,
        urls: {
          apiURL:       "https://api-testnet.bscscan.com/api",
          browserURL:   "https://testnet.bscscan.com"
        }
      }
    ]
  },

  // Gas reporter (optional, needs REPORT_GAS=true env var)
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    token: "BNB"
  }
};
