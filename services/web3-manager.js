"use strict";

const { Web3 } = require("web3");

const SUPPORTED_CHAINS = {
  ETHEREUM: { name: "Ethereum", rpcUrl: process.env.ETH_RPC_URL || "https://cloudflare-eth.com", chainId: 1 },
  BSC: { name: "BNB Smart Chain", rpcUrl: process.env.BSC_RPC_URL || "https://bsc-dataseed.binance.org/", chainId: 56 },
  POLYGON: { name: "Polygon", rpcUrl: process.env.POLYGON_RPC_URL || "https://polygon-rpc.com", chainId: 137 },
  ARBITRUM: { name: "Arbitrum One", rpcUrl: process.env.ARBITRUM_RPC_URL || "https://arb1.arbitrum.io/rpc", chainId: 42161 },
  OPTIMISM: { name: "Optimism", rpcUrl: process.env.OPTIMISM_RPC_URL || "https://mainnet.optimism.io", chainId: 10 },
  AVALANCHE: { name: "Avalanche C-Chain", rpcUrl: process.env.AVAX_RPC_URL || "https://api.avax.network/ext/bc/C/rpc", chainId: 43114 },
  BASE: { name: "Base", rpcUrl: process.env.BASE_RPC_URL || "https://mainnet.base.org", chainId: 8453 }
};

class Web3Manager {
  constructor() {
    this.connections = {};
    this.supportedChains = Object.keys(SUPPORTED_CHAINS);
  }

  /**
   * Connect to a chain by name and return its Web3 instance.
   * @param {string} chain - Chain name key (e.g. "BSC", "ETHEREUM")
   * @returns {{ success: boolean, chain: string, chainId: number, rpcUrl: string } | { success: false, error: string }}
   */
  async connectToChain(chain) {
    const chainKey = String(chain).toUpperCase();
    const config = SUPPORTED_CHAINS[chainKey];
    if (!config) {
      return { success: false, error: `Unsupported chain: ${chain}` };
    }
    try {
      if (!this.connections[chainKey]) {
        this.connections[chainKey] = new Web3(config.rpcUrl);
      }
      const web3 = this.connections[chainKey];
      const currentChainId = await web3.eth.getChainId();
      return {
        success: true,
        chain: config.name,
        chainId: Number(currentChainId),
        rpcUrl: config.rpcUrl
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Disconnect from a chain (removes the cached Web3 instance).
   * @param {string} chain - Chain name key
   */
  disconnect(chain) {
    const chainKey = String(chain).toUpperCase();
    delete this.connections[chainKey];
  }

  /**
   * Get the Web3 instance for a connected chain, or null if not connected.
   * @param {string} chain - Chain name key
   * @returns {Web3 | null}
   */
  getProvider(chain) {
    return this.connections[String(chain).toUpperCase()] || null;
  }
}

module.exports = new Web3Manager();

