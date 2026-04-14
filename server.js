// Stampcoin Platform — Main API Server
"use strict";

const express = require("express");
const cors = require("cors");
const path = require("path");

const wallet = require("./wallet");
const market = require("./market");
const blockchain = require("./blockchain");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// ── Auth middleware ──────────────────────────────────────────────────────────

function requireToken(req, res, next) {
  const auth = req.headers["authorization"] || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token || token !== process.env.SYNC_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

// ── Wallet API ───────────────────────────────────────────────────────────────

// POST /api/wallet/create
app.post("/api/wallet/create", (req, res) => {
  try {
    const { userId, userName } = req.body;
    res.json(wallet.createWallet(userId, userName));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// GET /api/wallets — admin list (token-protected)
app.get("/api/wallets", requireToken, (req, res) => {
  try {
    res.json(wallet.getAllWallets());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/wallet/:userId
app.get("/api/wallet/:userId", (req, res) => {
  try {
    const w = wallet.getWallet(req.params.userId);
    if (!w) return res.status(404).json({ error: "Wallet not found" });
    res.json(w);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// POST /api/wallet/transfer
app.post("/api/wallet/transfer", (req, res) => {
  try {
    const { fromUserId, toUserId, amount, stampId } = req.body;
    res.json(wallet.transfer(fromUserId, toUserId, amount, stampId));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// GET /api/wallet/:userId/transactions
app.get("/api/wallet/:userId/transactions", (req, res) => {
  try {
    res.json(wallet.getTransactionHistory(req.params.userId));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// POST /api/wallet/:userId/stamps — add stamp (token-protected)
app.post("/api/wallet/:userId/stamps", requireToken, (req, res) => {
  try {
    const w = wallet.addStamp(req.params.userId, req.body);
    res.json(w);
  } catch (e) {
    if (e.message === "Wallet not found") return res.status(404).json({ error: e.message });
    res.status(400).json({ error: e.message });
  }
});

// POST /api/wallet/:userId/topup — top up balance (token-protected)
app.post("/api/wallet/:userId/topup", requireToken, (req, res) => {
  try {
    const { amount } = req.body;
    const w = wallet.updateBalance(req.params.userId, amount);
    res.json(w);
  } catch (e) {
    if (e.message === "Wallet not found") return res.status(404).json({ error: e.message });
    res.status(400).json({ error: e.message });
  }
});

// ── Market API ───────────────────────────────────────────────────────────────

// GET /api/market/items
app.get("/api/market/items", (req, res) => {
  try {
    const { status, type, sellerId } = req.query;
    res.json(market.getAllMarketItems({ status, type, sellerId }));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/market/transactions
app.get("/api/market/transactions", (req, res) => {
  try {
    const { buyerId, sellerId } = req.query;
    res.json(market.getMarketTransactions({ buyerId, sellerId }));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/market/items/:itemId
app.get("/api/market/items/:itemId", (req, res) => {
  try {
    res.json(market.getMarketItem(req.params.itemId));
  } catch (e) {
    res.status(404).json({ error: e.message });
  }
});

// POST /api/market/items
app.post("/api/market/items", (req, res) => {
  try {
    const { sellerId, ...item } = req.body;
    res.status(201).json(market.addMarketItem(sellerId, item));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// PUT /api/market/items/:itemId — update item (seller only)
app.put("/api/market/items/:itemId", (req, res) => {
  try {
    const { userId, ...updates } = req.body;
    if (!userId) return res.status(400).json({ error: "userId is required" });

    const UPDATABLE = ["price", "description", "status", "imageUrl", "sellerContact", "name"];
    if (!UPDATABLE.some(k => updates[k] !== undefined)) {
      return res.status(400).json({ error: "No updatable fields provided" });
    }

    const item = market.getMarketItem(req.params.itemId);
    if (item.sellerId !== userId) {
      return res.status(403).json({ error: "Only the seller can update this item" });
    }

    res.json(market.updateMarketItem(req.params.itemId, updates));
  } catch (e) {
    if (e.message === "Market item not found") return res.status(404).json({ error: e.message });
    res.status(400).json({ error: e.message });
  }
});

// POST /api/market/items/:itemId/buy
app.post("/api/market/items/:itemId/buy", (req, res) => {
  try {
    const { buyerId, ...options } = req.body;
    res.json(market.purchaseMarketItem(req.params.itemId, buyerId, options));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// DELETE /api/market/items/:itemId — remove item (seller only)
app.delete("/api/market/items/:itemId", (req, res) => {
  try {
    const { userId } = req.body;
    res.json(market.removeMarketItem(req.params.itemId, userId));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// GET /api/market/transactions/:transactionId/contact-exchange
app.get("/api/market/transactions/:transactionId/contact-exchange", (req, res) => {
  try {
    const { userId } = req.query;
    res.json(market.getTransactionContactExchange(req.params.transactionId, userId));
  } catch (e) {
    res.status(403).json({ error: e.message });
  }
});

// ── Blockchain API ───────────────────────────────────────────────────────────

// GET /api/blockchain/info
app.get("/api/blockchain/info", (req, res) => {
  try {
    res.json(blockchain.getBlockchainInfo());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// GET /api/blockchain/supply
app.get("/api/blockchain/supply", (req, res) => {
  try {
    res.json(blockchain.getSupply());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/blockchain/mint (token-protected)
app.post("/api/blockchain/mint", requireToken, (req, res) => {
  try {
    const { toAddress, amount } = req.body;
    res.json(blockchain.mintTokens(toAddress, amount));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// GET /api/blockchain/balance/:address
app.get("/api/blockchain/balance/:address", (req, res) => {
  try {
    res.json(blockchain.getBalance(req.params.address));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// GET /api/blockchain/mint/events (token-protected)
app.get("/api/blockchain/mint/events", requireToken, (req, res) => {
  try {
    res.json(blockchain.getMintEvents());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── Entry point ──────────────────────────────────────────────────────────────

function startServer() {
  app.listen(PORT, () => {
    console.log(`\n🚀 Stampbook Server running on http://localhost:${PORT}\n`);
  });
}

module.exports = { app, startServer };

