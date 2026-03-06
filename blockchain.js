/**
 * Blockchain Module for Stampcoin Platform
 *
 * Implements BEP-20-compatible token logic for the STP (StampCoin) token
 * on BNB Smart Chain (BSC) using Proof of Staked Authority (PoSA) consensus.
 *
 * This module provides server-side token supply tracking and minting logic
 * that mirrors the on-chain BEP-20 contract defined in contracts/STP.sol.
 */

"use strict";

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** BEP-20 token parameters */
const TOKEN = {
  name: "StampCoin",
  symbol: "STP",
  decimals: 18,
  totalSupply: 421000000,    // Maximum total supply (hard cap)
  blockchain: "BNB Smart Chain",
  consensus: "Proof of Staked Authority (PoSA)",
  standard: "BEP-20",
  network: "BSC Mainnet",
  chainId: 56
};

const BLOCKCHAIN_FILE = path.join(__dirname, "blockchain-state.json");

// ---------------------------------------------------------------------------
// Persistence helpers
// ---------------------------------------------------------------------------

/**
 * Load blockchain state from disk, or return a fresh initial state.
 * @returns {object} Current blockchain state
 */
function loadState() {
  try {
    if (fs.existsSync(BLOCKCHAIN_FILE)) {
      const raw = fs.readFileSync(BLOCKCHAIN_FILE, "utf8");
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Error loading blockchain state:", e.message);
  }
  return {
    mintedSupply: 0,
    balances: {},
    mintEvents: []
  };
}

/**
 * Persist blockchain state to disk.
 * @param {object} state - State to persist
 * @returns {boolean} true on success
 */
function saveState(state) {
  try {
    fs.writeFileSync(BLOCKCHAIN_FILE, JSON.stringify(state, null, 2), "utf8");
    return true;
  } catch (e) {
    console.error("Error saving blockchain state:", e.message);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/**
 * Validate a wallet/token address (non-empty, safe string, no prototype keys).
 * @param {*} address - Value to validate
 * @throws {Error} if address is invalid
 */
function validateAddress(address) {
  if (
    typeof address !== "string" ||
    address.trim() === "" ||
    address === "__proto__" ||
    address === "constructor" ||
    address === "prototype"
  ) {
    throw new Error("Invalid address");
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Return static token/blockchain metadata.
 * @returns {object} Token and blockchain info
 */
function getBlockchainInfo() {
  return {
    ...TOKEN,
    contractAddress: process.env.STP_CONTRACT_ADDRESS || "Pending mainnet deployment"
  };
}

/**
 * Return current token supply metrics.
 * @returns {object} Supply statistics
 */
function getSupply() {
  const state = loadState();
  return {
    totalSupply: TOKEN.totalSupply,
    mintedSupply: state.mintedSupply,
    remainingSupply: TOKEN.totalSupply - state.mintedSupply,
    symbol: TOKEN.symbol,
    decimals: TOKEN.decimals
  };
}

/**
 * Mint new STP tokens to a given address.
 *
 * Minting is controlled:
 * - amount must be a positive integer
 * - total minted supply must not exceed TOKEN.totalSupply (hard cap)
 *
 * @param {string} toAddress - Recipient address (wallet userId or hex address)
 * @param {number} amount    - Number of whole STP tokens to mint
 * @returns {object} Mint event record
 * @throws {Error} on validation failure or supply cap exceeded
 */
function mintTokens(toAddress, amount) {
  validateAddress(toAddress);

  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0 || !Number.isInteger(amount)) {
    throw new Error("Mint amount must be a positive integer");
  }

  const state = loadState();

  if (state.mintedSupply + amount > TOKEN.totalSupply) {
    throw new Error(
      `Mint would exceed total supply cap of ${TOKEN.totalSupply} STP ` +
      `(currently minted: ${state.mintedSupply})`
    );
  }

  // Update balances
  state.balances[toAddress] = (state.balances[toAddress] || 0) + amount;
  state.mintedSupply += amount;

  // Record mint event
  const event = {
    id: crypto.randomUUID(),
    type: "mint",
    to: toAddress,
    amount,
    timestamp: new Date().toISOString()
  };
  state.mintEvents.push(event);

  saveState(state);
  return event;
}

/**
 * Get the STP token balance for an address.
 * @param {string} address - Wallet address or user ID
 * @returns {object} Balance info
 */
function getBalance(address) {
  validateAddress(address);
  const state = loadState();
  return {
    address,
    balance: state.balances[address] || 0,
    symbol: TOKEN.symbol
  };
}

/**
 * Get all mint events (audit log).
 * @returns {Array} List of mint events
 */
function getMintEvents() {
  const state = loadState();
  return state.mintEvents;
}

// Initialize state file on module load
loadState();

module.exports = {
  getBlockchainInfo,
  getSupply,
  mintTokens,
  getBalance,
  getMintEvents
};
