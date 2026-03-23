// ====================== blockchain.js ======================
/**
 * Blockchain Module for Stampcoin Platform
 * Implements BEP-20-compatible token logic for the STP (StampCoin) token
 * on BNB Smart Chain (BSC) using Proof of Staked Authority (PoSA) consensus.
 */
"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const TOKEN = {
  name: "StampCoin",
  symbol: "STP",
  decimals: 18,
  totalSupply: 421000000,
  blockchain: "BNB Smart Chain",
  consensus: "Proof of Staked Authority (PoSA)",
  standard: "BEP-20",
  network: "BSC Mainnet",
  chainId: 56
};

const BLOCKCHAIN_FILE = path.join(__dirname, "blockchain-state.json");

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

function saveState(state) {
  try {
    fs.writeFileSync(BLOCKCHAIN_FILE, JSON.stringify(state, null, 2), "utf8");
    return true;
  } catch (e) {
    console.error("Error saving blockchain state:", e.message);
    return false;
  }
}

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

function getBlockchainInfo() {
  return {
    ...TOKEN,
    contractAddress: process.env.STP_CONTRACT_ADDRESS || "Pending mainnet deployment"
  };
}

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

function mintTokens(toAddress, amount) {
  validateAddress(toAddress);

  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0 || !Number.isInteger(amount)) {
    throw new Error("Mint amount must be a positive integer");
  }

  const state = loadState();

  if (state.mintedSupply + amount > TOKEN.totalSupply) {
    throw new Error(
      `Mint would exceed total supply cap of ${TOKEN.totalSupply} STP (currently minted: ${state.mintedSupply})`
    );
  }

  state.balances[toAddress] = (state.balances[toAddress] || 0) + amount;
  state.mintedSupply += amount;

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

function getBalance(address) {
  validateAddress(address);
  const state = loadState();
  return {
    address,
    balance: state.balances[address] || 0,
    symbol: TOKEN.symbol
  };
}

function getMintEvents() {
  const state = loadState();
  return state.mintEvents;
}

// Initialize state file on module load
loadState();

// ====================== wallet.js ======================
/**
 * Digital Wallet Module for Stampcoin Platform
 * Module for managing digital wallets, balances, and transactions
 */
const WALLETS_FILE = path.join(__dirname, 'wallets.json');
const TRANSACTIONS_FILE = path.join(__dirname, 'transactions.json');

function validateUserId(userId) {
  if (
    typeof userId !== 'string' ||
    userId.trim() === '' ||
    userId === '__proto__' ||
    userId === 'constructor' ||
    userId === 'prototype'
  ) {
    throw new Error('Invalid userId');
  }
}

function initializeStorage() {
  if (!fs.existsSync(WALLETS_FILE)) {
    fs.writeFileSync(WALLETS_FILE, JSON.stringify({}, null, 2), 'utf8');
  }
  if (!fs.existsSync(TRANSACTIONS_FILE)) {
    fs.writeFileSync(TRANSACTIONS_FILE, JSON.stringify([], null, 2), 'utf8');
  }
}

function readWallets() {
  try {
    const data = fs.readFileSync(WALLETS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return {};
    }
    console.error('Error reading wallets:', error.message);
    throw error;
  }
}

function writeWallets(wallets) {
  try {
    fs.writeFileSync(WALLETS_FILE, JSON.stringify(wallets, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing wallets:', error.message);
    return false;
  }
}

function readTransactions() {
  try {
    const data = fs.readFileSync(TRANSACTIONS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return [];
    }
    console.error('Error reading transactions:', error.message);
    throw error;
  }
}

function writeTransactions(transactions) {
  try {
    fs.writeFileSync(TRANSACTIONS_FILE, JSON.stringify(transactions, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error writing transactions:', error.message);
    return false;
  }
}

function createWallet(userId, userName) {
  validateUserId(userId);
  if (typeof userName !== 'string' || userName.trim() === '') {
    throw new Error('Invalid userName');
  }
  const wallets = readWallets();

  if (wallets[userId]) {
    throw new Error('Wallet already exists for this user');
  }

  const wallet = {
    userId,
    userName,
    balance: 0,
    stamps: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  wallets[userId] = wallet;
  writeWallets(wallets);

  return wallet;
}

function getWallet(userId) {
  validateUserId(userId);
  const wallets = readWallets();
  return wallets[userId] || null;
}

function getAllWallets() {
  return readWallets();
}

function updateBalance(userId, amount) {
  validateUserId(userId);

  const wallets = readWallets();
  const wallet = wallets[userId];

  if (!wallet) {
    throw new Error('Wallet not found');
  }

  const newBalance = wallet.balance + amount;
  if (newBalance < 0) {
    throw new Error('Insufficient balance');
  }

  wallet.balance = newBalance;
  wallet.updatedAt = new Date().toISOString();

  wallets[userId] = wallet;
  writeWallets(wallets);

  return wallet;
}

function addStamp(userId, stamp) {
  validateUserId(userId);
  const wallets = readWallets();
  const wallet = wallets[userId];

  if (!wallet) {
    throw new Error('Wallet not found');
  }

  const stampWithId = {
    id: crypto.randomUUID(),
    ...stamp,
    addedAt: new Date().toISOString()
  };

  wallet.stamps.push(stampWithId);
  wallet.updatedAt = new Date().toISOString();

  wallets[userId] = wallet;
  writeWallets(wallets);

  return wallet;
}

function transfer(fromUserId, toUserId, amount = 0, stampId = null) {
  validateUserId(fromUserId);
  validateUserId(toUserId);
  if (!stampId && (!amount || amount <= 0)) {
    throw new Error('Transfer amount must be a positive number when transferring balance');
  }

  const wallets = readWallets();
  const fromWallet = wallets[fromUserId];
  const toWallet = wallets[toUserId];

  if (!fromWallet || !toWallet) {
    throw new Error('One or both wallets not found');
  }

  const transactionId = crypto.randomUUID();
  const timestamp = new Date().toISOString();

  if (amount > 0) {
    if (fromWallet.balance < amount) {
      throw new Error('Insufficient balance');
    }
    fromWallet.balance -= amount;
    toWallet.balance += amount;
  }

  if (stampId) {
    const stampIndex = fromWallet.stamps.findIndex(s => s.id === stampId);
    if (stampIndex === -1) {
      throw new Error('Stamp not found in sender wallet');
    }
    const stamp = fromWallet.stamps.splice(stampIndex, 1)[0];
    toWallet.stamps.push({
      ...stamp,
      transferredAt: timestamp
    });
  }

  fromWallet.updatedAt = timestamp;
  toWallet.updatedAt = timestamp;

  wallets[fromUserId] = fromWallet;
  wallets[toUserId] = toWallet;
  writeWallets(wallets);

  const transaction = {
    id: transactionId,
    from: fromUserId,
    to: toUserId,
    amount,
    stampId,
    timestamp,
    status: 'completed'
  };

  const transactions = readTransactions();
  transactions.push(transaction);
  writeTransactions(transactions);

  return transaction;
}

function getTransactionHistory(userId) {
  validateUserId(userId);
  const transactions = readTransactions();
  return transactions.filter(t => t.from === userId || t.to === userId);
}

function getAllTransactions() {
  return readTransactions();
}

// Initialize storage on module load
initializeStorage();

// ====================== market.js ======================
/**
 * Market Institution Module
 * Digital marketplace for stamps and collectibles
 */
const MARKET_FILE = path.join(__dirname, "market-data.json");

// Initialize market data structure
let marketData = {
  items: [],
  transactions: []
};

function loadMarketData() {
  try {
    if (fs.existsSync(MARKET_FILE)) {
      const raw = fs.readFileSync(MARKET_FILE, "utf8");
      marketData = JSON.parse(raw);
    }
  } catch (e) {
    console.error("Error loading market data:", e.message);
  }
}

function saveMarketData() {
  try {
    fs.writeFileSync(MARKET_FILE, JSON.stringify(marketData, null, 2), "utf8");
    return true;
  } catch (e) {
    console.error("Error saving market data:", e.message);
    return false;
  }
}

// Initialize on module load
loadMarketData();

function addMarketItem(sellerId, item) {
  if (!sellerId || !item || !item.name) {
    throw new Error("sellerId and item with name are required");
  }

  const newItem = {
    id: `item_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
    sellerId,
    name: item.name,
    description: item.description || "",
    price: item.price || 0,
    type: item.type || "stamp",
    imageUrl: item.imageUrl || "",
    status: "available",
    listedAt: new Date().toISOString()
  };

  marketData.items.push(newItem);
  saveMarketData();
  return newItem;
}

function getAllMarketItems(filter = {}) {
  let items = [...marketData.items];

  if (filter.status) {
    items = items.filter(item => item.status === filter.status);
  }

  if (filter.type) {
    items = items.filter(item => item.type === filter.type);
  }

  if (filter.sellerId) {
    items = items.filter(item => item.sellerId === filter.sellerId);
  }

  return items;
}

function getMarketItem(itemId) {
  const item = marketData.items.find(i => i.id === itemId);
  if (!item) {
    throw new Error("Market item not found");
  }
  return item;
}

function updateMarketItem(itemId, updates) {
  const itemIndex = marketData.items.findIndex(i => i.id === itemId);
  if (itemIndex === -1) {
    throw new Error("Market item not found");
  }

  const item = marketData.items[itemIndex];

  if (updates.name !== undefined) item.name = updates.name;
  if (updates.price !== undefined) item.price = updates.price;
  if (updates.description !== undefined) item.description = updates.description;
  if (updates.status !== undefined) item.status = updates.status;
  if (updates.imageUrl !== undefined) item.imageUrl = updates.imageUrl;

  marketData.items[itemIndex] = item;
  saveMarketData();
  return item;
}

function purchaseMarketItem(itemId, buyerId) {
  const item = getMarketItem(itemId);

  if (item.status !== "available") {
    throw new Error("Item is not available for purchase");
  }

  if (item.sellerId === buyerId) {
    throw new Error("Cannot purchase your own item");
  }

  updateMarketItem(itemId, { status: "sold" });

  const transaction = {
    id: `txn_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
    itemId,
    sellerId: item.sellerId,
    buyerId,
    price: item.price,
    timestamp: new Date().toISOString()
  };

  marketData.transactions.push(transaction);
  saveMarketData();

  return {
    transaction,
    item
  };
}

function removeMarketItem(itemId, userId) {
  const itemIndex = marketData.items.findIndex(i => i.id === itemId);
  if (itemIndex === -1) {
    throw new Error("Market item not found");
  }

  const item = marketData.items[itemIndex];

  if (item.sellerId !== userId) {
    throw new Error("Only the seller can remove this item");
  }

  marketData.items.splice(itemIndex, 1);
  saveMarketData();
  return { success: true, message: "Item removed from market" };
}

function getMarketTransactions(filter = {}) {
  let transactions = [...marketData.transactions];

  if (filter.buyerId) {
    transactions = transactions.filter(t => t.buyerId === filter.buyerId);
  }

  if (filter.sellerId) {
    transactions = transactions.filter(t => t.sellerId === filter.sellerId);
  }

  return transactions;
}

// ====================== index.js ======================
/**
 * Entry point for Stampcoin Platform
 * Starts the main server
 */
try {
  require('./server');
} catch (err) {
  console.error('Failed to start server:', err.message);
  process.exit(1);
}

// ====================== server.js ======================
/**
 * Express Server – API endpoints and integration
 * (يمكنك دمج server.js هنا أو استدعاء express والتكامل مع الوظائف أعلاه)
 */