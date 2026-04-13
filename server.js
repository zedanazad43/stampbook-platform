"use strict";

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const compression = require("compression");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const walletModule = require("./wallet");
const marketModule = require("./market");
const blockchainModule = require("./blockchain");

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "stampbook-dev-secret-change-in-production";
const SYNC_TOKEN = process.env.SYNC_TOKEN;

// ─── Middleware ───────────────────────────────────────────────────────────────

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-sync-token"]
}));
app.use(compression());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ─── Database helpers (auth / nfts / auctions / news) ────────────────────────

const DB_PATH = path.join(__dirname, "database.json");

function readDB() {
  try {
    if (fs.existsSync(DB_PATH)) {
      return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
    }
  } catch (e) {
    console.error("Error reading database:", e.message);
  }
  return { users: [], nfts: [], auctions: [], transactions: [], news: [], events: [] };
}

function writeDB(db) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf8");
  } catch (e) {
    console.error("Error writing database:", e.message);
  }
}

// ─── Auth middleware ──────────────────────────────────────────────────────────

function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required" });
  }
  try {
    req.user = jwt.verify(header.slice(7), JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// ─── Sync-token middleware (admin / server-to-server endpoints) ───────────────

function syncMiddleware(req, res, next) {
  if (!SYNC_TOKEN) return next();
  const provided =
    req.headers["x-sync-token"] ||
    (req.headers.authorization || "").replace("Bearer ", "");
  if (provided !== SYNC_TOKEN) {
    return res.status(403).json({ error: "Forbidden: invalid sync token" });
  }
  next();
}

// ─── Auth endpoints ───────────────────────────────────────────────────────────

app.post("/api/auth/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "Name, email and password are required" });
    }
    const db = readDB();
    if (db.users.find(u => u.email === email)) {
      return res.status(409).json({ error: "Email already registered" });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = {
      id: Date.now().toString(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashed,
      stpBalance: 0,
      points: 0,
      createdAt: new Date().toISOString()
    };
    db.users.push(user);
    writeDB(db);
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
    const { password: _, ...pub } = user;
    return res.status(201).json({ token, user: pub });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    const db = readDB();
    const user = db.users.find(u => u.email === email.trim().toLowerCase());
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
    const { password: _, ...pub } = user;
    return res.json({ token, user: pub });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

app.get("/api/auth/me", authMiddleware, (req, res) => {
  try {
    const db = readDB();
    const user = db.users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    const { password: _, ...pub } = user;
    return res.json(pub);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// ─── Stats endpoint ───────────────────────────────────────────────────────────

app.get("/api/stats", (req, res) => {
  try {
    const db = readDB();
    return res.json({
      users: db.users.length,
      nfts: db.nfts.length,
      auctions: db.auctions.filter(a => a.status === "active").length
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// ─── NFT endpoints ────────────────────────────────────────────────────────────

app.get("/api/nfts", (req, res) => {
  try {
    const db = readDB();
    const { status, ownerId } = req.query;
    let nfts = db.nfts;
    if (status) nfts = nfts.filter(n => n.status === status);
    if (ownerId) nfts = nfts.filter(n => n.ownerId === ownerId);
    return res.json(nfts);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

app.get("/api/nfts/:id", (req, res) => {
  try {
    const db = readDB();
    const nft = db.nfts.find(n => n.id === req.params.id);
    if (!nft) return res.status(404).json({ error: "NFT not found" });
    return res.json(nft);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

app.post("/api/nfts/mint", authMiddleware, (req, res) => {
  try {
    const { name, description, imageUrl, price } = req.body;
    if (!name) return res.status(400).json({ error: "NFT name is required" });
    const db = readDB();
    const nft = {
      id: `NFT_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name: name.trim(),
      description: description || "",
      imageUrl: imageUrl || "",
      price: parseFloat(price) || 0,
      ownerId: req.user.id,
      status: "available",
      createdAt: new Date().toISOString()
    };
    db.nfts.push(nft);
    writeDB(db);
    return res.status(201).json(nft);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// ─── Auction endpoints ────────────────────────────────────────────────────────

app.get("/api/auctions", (req, res) => {
  try {
    const db = readDB();
    const { status } = req.query;
    const auctions = status
      ? db.auctions.filter(a => a.status === status)
      : db.auctions;
    return res.json(auctions);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

app.post("/api/auctions", authMiddleware, (req, res) => {
  try {
    const { title, description, startPrice, endTime, imageUrl } = req.body;
    if (!title || !startPrice || !endTime) {
      return res.status(400).json({ error: "Title, startPrice and endTime are required" });
    }
    const db = readDB();
    const auction = {
      id: `AUC_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      title: title.trim(),
      description: description || "",
      imageUrl: imageUrl || "",
      startPrice: parseFloat(startPrice),
      currentPrice: parseFloat(startPrice),
      highestBidder: null,
      bids: [],
      sellerId: req.user.id,
      status: "active",
      endTime,
      createdAt: new Date().toISOString()
    };
    db.auctions.push(auction);
    writeDB(db);
    return res.status(201).json(auction);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

app.post("/api/auctions/bid/:id", authMiddleware, (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || parseFloat(amount) <= 0) {
      return res.status(400).json({ error: "Valid bid amount is required" });
    }
    const db = readDB();
    const auction = db.auctions.find(a => a.id === req.params.id);
    if (!auction) return res.status(404).json({ error: "Auction not found" });
    if (auction.status !== "active") {
      return res.status(400).json({ error: "Auction is not active" });
    }
    if (parseFloat(amount) <= auction.currentPrice) {
      return res.status(400).json({ error: "Bid must exceed current price of " + auction.currentPrice + " STP" });
    }
    auction.currentPrice = parseFloat(amount);
    auction.highestBidder = req.user.id;
    if (!auction.bids) auction.bids = [];
    auction.bids.push({ userId: req.user.id, amount: parseFloat(amount), timestamp: new Date().toISOString() });
    writeDB(db);
    return res.json({ success: true, auction });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// ─── News endpoints ───────────────────────────────────────────────────────────

app.get("/api/news", (req, res) => {
  try {
    const db = readDB();
    return res.json(db.news || []);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// ─── Wallet endpoints ─────────────────────────────────────────────────────────

app.post("/api/wallet/create", (req, res) => {
  try {
    const { userId, userName } = req.body;
    const w = walletModule.createWallet(userId, userName);
    return res.status(201).json(w);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

app.get("/api/wallets", syncMiddleware, (req, res) => {
  try {
    return res.json(walletModule.getAllWallets());
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

app.get("/api/wallet/:userId", (req, res) => {
  try {
    const w = walletModule.getWallet(req.params.userId);
    if (!w) return res.status(404).json({ error: "Wallet not found" });
    return res.json(w);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

app.post("/api/wallet/transfer", (req, res) => {
  try {
    const { fromUserId, toUserId, amount, stampId } = req.body;
    const tx = walletModule.transfer(fromUserId, toUserId, amount, stampId);
    return res.json(tx);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

app.get("/api/wallet/:userId/transactions", (req, res) => {
  try {
    return res.json(walletModule.getTransactionHistory(req.params.userId));
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

app.post("/api/wallet/:userId/stamps", syncMiddleware, (req, res) => {
  try {
    const w = walletModule.addStamp(req.params.userId, req.body);
    return res.json(w);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

app.post("/api/wallet/:userId/topup", syncMiddleware, (req, res) => {
  try {
    const { amount } = req.body;
    const w = walletModule.updateBalance(req.params.userId, parseFloat(amount));
    return res.json(w);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// ─── Market endpoints ─────────────────────────────────────────────────────────

app.get("/api/market/items", (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.type) filter.type = req.query.type;
    if (req.query.sellerId) filter.sellerId = req.query.sellerId;
    return res.json(marketModule.getAllMarketItems(filter));
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

app.post("/api/market/items", (req, res) => {
  try {
    const { sellerId, ...item } = req.body;
    const created = marketModule.addMarketItem(sellerId, item);
    return res.status(201).json(created);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

app.get("/api/market/items/:itemId", (req, res) => {
  try {
    return res.json(marketModule.getMarketItem(req.params.itemId));
  } catch (e) {
    return res.status(404).json({ error: e.message });
  }
});

app.put("/api/market/items/:itemId", (req, res) => {
  try {
    const { sellerId, ...updates } = req.body;
    const item = marketModule.getRawMarketItem(req.params.itemId);
    if (item.sellerId !== sellerId) {
      return res.status(403).json({ error: "Only the seller can update this item" });
    }
    return res.json(marketModule.updateMarketItem(req.params.itemId, updates));
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

app.post("/api/market/items/:itemId/buy", (req, res) => {
  try {
    const { buyerId, ...options } = req.body;
    return res.json(marketModule.purchaseMarketItem(req.params.itemId, buyerId, options));
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

app.delete("/api/market/items/:itemId", (req, res) => {
  try {
    const { sellerId } = req.body;
    return res.json(marketModule.removeMarketItem(req.params.itemId, sellerId));
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

app.get("/api/market/transactions", (req, res) => {
  try {
    const filter = {};
    if (req.query.buyerId) filter.buyerId = req.query.buyerId;
    if (req.query.sellerId) filter.sellerId = req.query.sellerId;
    return res.json(marketModule.getMarketTransactions(filter));
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

app.get("/api/market/transactions/:txId/contact", (req, res) => {
  try {
    const { requesterId } = req.query;
    return res.json(marketModule.getTransactionContactExchange(req.params.txId, requesterId));
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// ─── Blockchain endpoints ─────────────────────────────────────────────────────

app.get("/api/blockchain/info", (req, res) => {
  try {
    return res.json(blockchainModule.getBlockchainInfo());
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

app.get("/api/blockchain/supply", (req, res) => {
  try {
    return res.json(blockchainModule.getSupply());
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

app.post("/api/blockchain/mint", syncMiddleware, (req, res) => {
  try {
    const { toAddress, amount } = req.body;
    const event = blockchainModule.mintTokens(toAddress, parseInt(amount, 10));
    return res.status(201).json(event);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

app.get("/api/blockchain/balance/:address", (req, res) => {
  try {
    return res.json(blockchainModule.getBalance(req.params.address));
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

app.get("/api/blockchain/mint/events", syncMiddleware, (req, res) => {
  try {
    return res.json(blockchainModule.getMintEvents());
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// ─── Status / Health ──────────────────────────────────────────────────────────

app.get("/api/status", (req, res) => {
  const db = readDB();
  return res.json({ status: "online", nfts: db.nfts.length, timestamp: new Date().toISOString() });
});

app.get("/api/health", (_req, res) => {
  return res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ─── SPA fallback ─────────────────────────────────────────────────────────────

app.get("*", (req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "API endpoint not found" });
  }
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// ─── Start server ─────────────────────────────────────────────────────────────

function startServer() {
  const server = app.listen(PORT, () => {
    console.log(`\n🚀 Stampbook Server running on http://localhost:${PORT}`);
    console.log(`📊 Mode: ${process.env.NODE_ENV || "development"}\n`);
  });
  return server;
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
