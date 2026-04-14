"use strict";

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const compression = require("compression");
const rateLimit = require("express-rate-limit");

const wallet = require("./wallet");
const market = require("./market");
const blockchain = require("./blockchain");

const app = express();
const PORT = process.env.PORT || 3000;
const catchAllLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
});

// ─── Middleware ────────────────────────────────────────────────────────────────

app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ─── Auth Middleware ───────────────────────────────────────────────────────────

/**
 * Middleware to verify Bearer token.
 * In development (NODE_ENV != 'production' and SYNC_TOKEN is unset),
 * authentication is bypassed automatically.
 */
function requireAuth(req, res, next) {
  const syncToken = process.env.SYNC_TOKEN;
  if (!syncToken && process.env.NODE_ENV !== "production") {
    return next();
  }
  const authHeader = req.headers["authorization"] || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
  if (!token || token !== syncToken) {
    return res.status(401).json({ error: "Unauthorized: invalid or missing token" });
  }
  next();
}

// ─── Legacy / Status Routes ────────────────────────────────────────────────────

let db = { users: [], nfts: [], auctions: [], transactions: [] };
const dbPath = path.join(__dirname, "database.json");

if (fs.existsSync(dbPath)) {
  try {
    db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
  } catch (e) {
    console.error("Failed to load database.json:", e.message);
  }
}

app.get("/api/nfts", (req, res) => {
  res.json(db.nfts);
});

app.get("/api/status", (req, res) => {
  res.json({ status: "online", nfts: db.nfts.length });
});

// ─── Wallet Routes ─────────────────────────────────────────────────────────────

// POST /api/wallet/create — Create a new wallet
app.post("/api/wallet/create", (req, res) => {
  try {
    const { userId, userName } = req.body;
    const w = wallet.createWallet(userId, userName);
    res.json(w);
  } catch (e) {
    const status = e.message.includes("already exists") ? 400 : 400;
    res.status(status).json({ error: e.message });
  }
});

// GET /api/wallet/:userId — Get wallet by user ID
app.get("/api/wallet/:userId", (req, res) => {
  try {
    const w = wallet.getWallet(req.params.userId);
    if (!w) return res.status(404).json({ error: "Wallet not found" });
    res.json(w);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// GET /api/wallets — List all wallets (admin, token-protected)
app.get("/api/wallets", requireAuth, (req, res) => {
  try {
    res.json(wallet.getAllWallets());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/wallet/transfer — Transfer balance between wallets
app.post("/api/wallet/transfer", (req, res) => {
  try {
    const { fromUserId, toUserId, amount, stampId } = req.body;
    const tx = wallet.transfer(fromUserId, toUserId, amount, stampId || null);
    res.json(tx);
  } catch (e) {
    const status = e.message.includes("not found") ? 404 : 400;
    res.status(status).json({ error: e.message });
  }
});

// GET /api/wallet/:userId/transactions — Get transaction history
app.get("/api/wallet/:userId/transactions", (req, res) => {
  try {
    const history = wallet.getTransactionHistory(req.params.userId);
    res.json(history);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// POST /api/wallet/:userId/stamps — Add stamp to wallet (token-protected)
app.post("/api/wallet/:userId/stamps", requireAuth, (req, res) => {
  try {
    const updated = wallet.addStamp(req.params.userId, req.body);
    res.json(updated);
  } catch (e) {
    const status = e.message.includes("not found") ? 404 : 400;
    res.status(status).json({ error: e.message });
  }
});

// POST /api/wallet/:userId/topup — Top up wallet balance (token-protected)
app.post("/api/wallet/:userId/topup", requireAuth, (req, res) => {
  try {
    const amount = Number(req.body.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({ error: "amount must be a positive number" });
    }
    const updated = wallet.updateBalance(req.params.userId, amount);
    res.json({ userId: updated.userId, balance: updated.balance, updatedAt: updated.updatedAt });
  } catch (e) {
    const status = e.message.includes("not found") ? 404 : 400;
    res.status(status).json({ error: e.message });
  }
});

// ─── Market Routes ─────────────────────────────────────────────────────────────

// GET /api/market/items — Get all market items
app.get("/api/market/items", (req, res) => {
  try {
    const { status, type, sellerId } = req.query;
    const items = market.getAllMarketItems({ status, type, sellerId });
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/market/items — List a new item
app.post("/api/market/items", (req, res) => {
  try {
    const { sellerId, ...item } = req.body;
    const newItem = market.addMarketItem(sellerId, item);
    res.status(201).json(newItem);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// GET /api/market/items/:itemId — Get item by ID
app.get("/api/market/items/:itemId", (req, res) => {
  try {
    const item = market.getMarketItem(req.params.itemId);
    res.json(item);
  } catch (e) {
    const status = e.message.includes("not found") ? 404 : 400;
    res.status(status).json({ error: e.message });
  }
});

// PUT /api/market/items/:itemId — Update item (seller only)
app.put("/api/market/items/:itemId", (req, res) => {
  try {
    const { userId, ...updates } = req.body;
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }
    const item = market.getMarketItem(req.params.itemId);
    if (item.sellerId !== userId) {
      return res.status(403).json({ error: "Only the seller can update this item" });
    }
    const updatableFields = ["name", "description", "price", "status", "imageUrl", "sellerContact"];
    const hasUpdates = updatableFields.some((f) => updates[f] !== undefined);
    if (!hasUpdates) {
      return res.status(400).json({ error: "No updatable fields provided" });
    }
    const updated = market.updateMarketItem(req.params.itemId, updates);
    res.json(updated);
  } catch (e) {
    const status = e.message.includes("not found") ? 404 : 400;
    res.status(status).json({ error: e.message });
  }
});

// POST /api/market/items/:itemId/buy — Purchase an item
app.post("/api/market/items/:itemId/buy", (req, res) => {
  try {
    const { buyerId, buyerContact, platformFee, sellerProceeds, feeCurrency } = req.body;
    if (!buyerId) {
      return res.status(400).json({ error: "buyerId is required" });
    }
    const result = market.purchaseMarketItem(req.params.itemId, buyerId, {
      buyerContact,
      platformFee,
      sellerProceeds,
      feeCurrency
    });
    res.json(result);
  } catch (e) {
    const status = e.message.includes("not found") ? 404 :
      e.message.includes("not available") ? 400 :
      e.message.includes("own item") ? 400 : 400;
    res.status(status).json({ error: e.message });
  }
});

// DELETE /api/market/items/:itemId — Remove an item (seller only)
app.delete("/api/market/items/:itemId", (req, res) => {
  try {
    const userId = req.body.userId || req.query.userId;
    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }
    const result = market.removeMarketItem(req.params.itemId, userId);
    res.json(result);
  } catch (e) {
    const status = e.message.includes("not found") ? 404 :
      e.message.includes("Only the seller") ? 403 : 400;
    res.status(status).json({ error: e.message });
  }
});

// GET /api/market/transactions — Get market transaction history
app.get("/api/market/transactions", (req, res) => {
  try {
    const { buyerId, sellerId } = req.query;
    const txs = market.getMarketTransactions({ buyerId, sellerId });
    res.json(txs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/market/transactions/:transactionId/contact-exchange — Post-purchase contact exchange
app.get("/api/market/transactions/:transactionId/contact-exchange", (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ error: "userId query parameter is required" });
    }
    const data = market.getTransactionContactExchange(req.params.transactionId, userId);
    res.json(data);
  } catch (e) {
    const status = e.message.includes("not found") ? 404 :
      e.message.includes("Only the buyer or seller") ? 403 : 400;
    res.status(status).json({ error: e.message });
  }
});

// ─── Blockchain Routes ─────────────────────────────────────────────────────────

// GET /api/blockchain/info — Get token metadata
app.get("/api/blockchain/info", (req, res) => {
  try {
    res.json(blockchain.getBlockchainInfo());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/blockchain/supply — Get token supply stats
app.get("/api/blockchain/supply", (req, res) => {
  try {
    res.json(blockchain.getSupply());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/blockchain/mint — Mint STP tokens (token-protected)
app.post("/api/blockchain/mint", requireAuth, (req, res) => {
  try {
    const { toAddress, amount } = req.body;
    if (!toAddress) {
      return res.status(400).json({ error: "toAddress is required" });
    }
    if (typeof amount !== "number") {
      return res.status(400).json({ error: "amount must be a positive integer" });
    }
    const event = blockchain.mintTokens(toAddress, amount);
    res.json({ success: true, event });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// GET /api/blockchain/balance/:address — Get address balance
app.get("/api/blockchain/balance/:address", (req, res) => {
  try {
    res.json(blockchain.getBalance(req.params.address));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// GET /api/blockchain/mint/events — Get mint audit log (token-protected)
app.get("/api/blockchain/mint/events", requireAuth, (req, res) => {
  try {
    res.json(blockchain.getMintEvents());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ─── Catch-all: serve frontend ─────────────────────────────────────────────────

app.get("*", catchAllLimiter, (req, res) => {
  const indexFile = path.join(__dirname, "public", "index.html");
  if (fs.existsSync(indexFile)) {
    return res.sendFile(indexFile);
  }
  res.status(404).json({ error: "Not found" });
});

// ─── Server start ──────────────────────────────────────────────────────────────

function startServer(port) {
  const listenPort = port || PORT;
  const server = app.listen(listenPort, () => {
    console.log(`\n🚀 Stampbook Server running on http://localhost:${listenPort}`);
    console.log(`📊 NFTs available: ${db.nfts.length}\n`);
  });
  return server;
}

// Start automatically when run directly
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
