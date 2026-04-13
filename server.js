"use strict";

require("dotenv").config();

const express     = require("express");
const cors        = require("cors");
const compression = require("compression");
const helmet      = require("helmet");
const morgan      = require("morgan");
const path        = require("path");
const fs          = require("fs");
const bcrypt      = require("bcryptjs");
const jwt         = require("jsonwebtoken");

const rateLimit = require("express-rate-limit");

const walletModule     = require("./wallet");
const marketModule     = require("./market");
const blockchainModule = require("./blockchain");

const app        = express();
const PORT       = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || "stampbook-dev-secret-change-in-production";
const SYNC_TOKEN = process.env.SYNC_TOKEN;

// ─── Security warnings ────────────────────────────────────────────────────────

if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  console.warn("⚠️  WARNING: JWT_SECRET is not set. Using insecure default — set JWT_SECRET in production!");
}
if (process.env.NODE_ENV === "production" && !process.env.SYNC_TOKEN) {
  console.warn("⚠️  WARNING: SYNC_TOKEN is not set. Admin endpoints are unprotected!");
}

// ─── Middleware ───────────────────────────────────────────────────────────────

// Rate limiters (skipped in test environment)
const IS_TEST = process.env.NODE_ENV === "test";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: IS_TEST ? 0 : 20,    // 0 = disabled in test, 20 in production
  skip: () => IS_TEST,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." }
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,      // 1 minute
  max: IS_TEST ? 0 : 120,   // 0 = disabled in test, 120 in production
  skip: () => IS_TEST,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." }
});

app.use("/api/auth", authLimiter);
app.use("/api/", apiLimiter);

// Security headers
app.use(helmet({
  contentSecurityPolicy: false // disabled so the SPA can load external fonts/icons
}));

// HTTP request logging (skip in test environment)
if (process.env.NODE_ENV !== "test") {
  app.use(morgan("combined"));
}

app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
      .split(",")
      .map((o) => o.trim())
      .filter(Boolean);

    // Allow non-browser or same-origin requests without an Origin header.
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-sync-token"]
}));
app.use(compression());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ─── Database helpers ─────────────────────────────────────────────────────────

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

// ─── Input validation helpers ─────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LEN = 8;

function isValidEmail(email) {
  return typeof email === "string" && EMAIL_RE.test(email.trim());
}

function isStrongPassword(pw) {
  return typeof pw === "string" && pw.length >= MIN_PASSWORD_LEN;
}

// ─── Pagination helper ────────────────────────────────────────────────────────

function paginate(array, query) {
  const page  = Math.max(1, parseInt(query.page  || 1,  10));
  const limit = Math.min(100, Math.max(1, parseInt(query.limit || 20, 10)));
  const start = (page - 1) * limit;
  return {
    data:  array.slice(start, start + limit),
    meta:  { page, limit, total: array.length, pages: Math.ceil(array.length / limit) }
  };
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

// ─── Sync-token middleware (admin / server-to-server) ─────────────────────────

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
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Invalid email address" });
    }
    if (!isStrongPassword(password)) {
      return res.status(400).json({ error: `Password must be at least ${MIN_PASSWORD_LEN} characters` });
    }
    const db = readDB();
    if (db.users.find(u => u.email === email.trim().toLowerCase())) {
      return res.status(409).json({ error: "Email already registered" });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = {
      id: Date.now().toString(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashed,
      stpBalance: 100,   // welcome bonus
      points: 50,
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

app.put("/api/auth/profile", authMiddleware, async (req, res) => {
  try {
    const db = readDB();
    const idx = db.users.findIndex(u => u.id === req.user.id);
    if (idx === -1) return res.status(404).json({ error: "User not found" });
    const user = db.users[idx];
    if (req.body.name)    user.name    = req.body.name.trim();
    if (req.body.phone)   user.phone   = req.body.phone.trim();
    if (req.body.bio)     user.bio     = req.body.bio.trim();
    if (req.body.avatarUrl) user.avatarUrl = req.body.avatarUrl.trim();
    user.updatedAt = new Date().toISOString();
    db.users[idx] = user;
    writeDB(db);
    const { password: _, ...pub } = user;
    return res.json(pub);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

app.post("/api/auth/change-password", authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "currentPassword and newPassword are required" });
    }
    if (!isStrongPassword(newPassword)) {
      return res.status(400).json({ error: `New password must be at least ${MIN_PASSWORD_LEN} characters` });
    }
    const db  = readDB();
    const idx = db.users.findIndex(u => u.id === req.user.id);
    if (idx === -1) return res.status(404).json({ error: "User not found" });
    const user = db.users[idx];
    if (!(await bcrypt.compare(currentPassword, user.password))) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }
    db.users[idx].password   = await bcrypt.hash(newPassword, 10);
    db.users[idx].updatedAt  = new Date().toISOString();
    writeDB(db);
    return res.json({ message: "Password updated successfully" });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// ─── Stats ────────────────────────────────────────────────────────────────────

app.get("/api/stats", (req, res) => {
  try {
    const db = readDB();
    const supply = blockchainModule.getSupply();
    return res.json({
      users:    db.users.length,
      nfts:     db.nfts.length,
      auctions: db.auctions.filter(a => a.status === "active").length,
      marketItems: (db.users.length > 0)
        ? marketModule.getAllMarketItems({ status: "available" }).length
        : 0,
      stpPrice:      0.20,
      stpSupply:     supply.totalSupply,
      stpMinted:     supply.mintedSupply,
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
    if (status)  nfts = nfts.filter(n => n.status === status);
    if (ownerId) nfts = nfts.filter(n => n.ownerId === ownerId);
    const result = paginate(nfts, req.query);
    return res.json(result);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

app.get("/api/nfts/:id", (req, res) => {
  try {
    const db  = readDB();
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
      id:          `NFT_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      name:        name.trim(),
      description: description || "",
      imageUrl:    imageUrl || "",
      price:       parseFloat(price) || 0,
      ownerId:     req.user.id,
      status:      "available",
      createdAt:   new Date().toISOString()
    };
    db.nfts.push(nft);
    writeDB(db);
    return res.status(201).json(nft);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

app.post("/api/nfts/:id/buy", authMiddleware, (req, res) => {
  try {
    const db  = readDB();
    const idx = db.nfts.findIndex(n => n.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "NFT not found" });
    const nft = db.nfts[idx];
    if (nft.status !== "available") {
      return res.status(400).json({ error: "NFT is not available for purchase" });
    }
    if (nft.ownerId === req.user.id) {
      return res.status(400).json({ error: "Cannot purchase your own NFT" });
    }
    const buyer = db.users.find(u => u.id === req.user.id);
    if (!buyer) return res.status(404).json({ error: "Buyer not found" });
    if (buyer.stpBalance < nft.price) {
      return res.status(400).json({ error: `Insufficient STP balance (need ${nft.price} STP)` });
    }
    // Deduct balance
    buyer.stpBalance -= nft.price;
    // Credit seller
    const seller = db.users.find(u => u.id === nft.ownerId);
    if (seller) seller.stpBalance = (seller.stpBalance || 0) + nft.price;
    // Transfer ownership
    nft.previousOwnerId = nft.ownerId;
    nft.ownerId  = req.user.id;
    nft.status   = "owned";
    nft.soldAt   = new Date().toISOString();
    db.nfts[idx] = nft;
    writeDB(db);
    return res.json({ success: true, nft });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// ─── Auction endpoints ────────────────────────────────────────────────────────

app.get("/api/auctions", (req, res) => {
  try {
    const db = readDB();
    const { status } = req.query;
    let auctions = status
      ? db.auctions.filter(a => a.status === status)
      : db.auctions;
    const result = paginate(auctions, req.query);
    return res.json(result);
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
      id:           `AUC_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      title:        title.trim(),
      description:  description || "",
      imageUrl:     imageUrl || "",
      startPrice:   parseFloat(startPrice),
      currentPrice: parseFloat(startPrice),
      highestBidder: null,
      bids:         [],
      sellerId:     req.user.id,
      status:       "active",
      endTime,
      createdAt:    new Date().toISOString()
    };
    db.auctions.push(auction);
    writeDB(db);
    return res.status(201).json(auction);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

app.delete("/api/auctions/:id", authMiddleware, (req, res) => {
  try {
    const db  = readDB();
    const idx = db.auctions.findIndex(a => a.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "Auction not found" });
    const auction = db.auctions[idx];
    if (auction.sellerId !== req.user.id) {
      return res.status(403).json({ error: "Only the seller can cancel this auction" });
    }
    if (auction.bids && auction.bids.length > 0) {
      return res.status(400).json({ error: "Cannot cancel an auction that already has bids" });
    }
    db.auctions.splice(idx, 1);
    writeDB(db);
    return res.json({ success: true, message: "Auction cancelled" });
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
    if (auction.sellerId === req.user.id) {
      return res.status(400).json({ error: "Cannot bid on your own auction" });
    }
    if (parseFloat(amount) <= auction.currentPrice) {
      return res.status(400).json({
        error: `Bid must exceed current price of ${auction.currentPrice} STP`
      });
    }
    auction.currentPrice   = parseFloat(amount);
    auction.highestBidder  = req.user.id;
    if (!auction.bids) auction.bids = [];
    auction.bids.push({
      userId:    req.user.id,
      amount:    parseFloat(amount),
      timestamp: new Date().toISOString()
    });
    writeDB(db);
    return res.json({ success: true, auction });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// ─── News ─────────────────────────────────────────────────────────────────────

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

// ─── Market endpoints — secured with authMiddleware ───────────────────────────

app.get("/api/market/items", (req, res) => {
  try {
    const filter = {};
    if (req.query.status)   filter.status   = req.query.status;
    if (req.query.type)     filter.type     = req.query.type;
    if (req.query.sellerId) filter.sellerId = req.query.sellerId;
    if (req.query.q) {
      const q = req.query.q.trim().toLowerCase();
      const items = marketModule.getAllMarketItems(filter)
        .filter(i => i.name.toLowerCase().includes(q) || (i.description || "").toLowerCase().includes(q));
      return res.json(paginate(items, req.query));
    }
    const result = paginate(marketModule.getAllMarketItems(filter), req.query);
    return res.json(result);
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

app.post("/api/market/items", authMiddleware, (req, res) => {
  try {
    // sellerId comes from the verified JWT, not from the request body
    const { name, description, type, price, imageUrl, sellerContact } = req.body;
    const created = marketModule.addMarketItem(req.user.id, {
      name, description, type, price, imageUrl, sellerContact
    });
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

app.put("/api/market/items/:itemId", authMiddleware, (req, res) => {
  try {
    const item = marketModule.getRawMarketItem(req.params.itemId);
    if (item.sellerId !== req.user.id) {
      return res.status(403).json({ error: "Only the seller can update this item" });
    }
    return res.json(marketModule.updateMarketItem(req.params.itemId, req.body));
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

app.post("/api/market/items/:itemId/buy", authMiddleware, (req, res) => {
  try {
    // buyerId comes from the verified JWT
    const result = marketModule.purchaseMarketItem(
      req.params.itemId,
      req.user.id,
      req.body   // optional: platformFee, sellerProceeds, buyerContact
    );

    // Deduct STP balance from buyer in database
    const db    = readDB();
    const buyer = db.users.find(u => u.id === req.user.id);
    if (buyer && result.item && result.item.price) {
      buyer.stpBalance = Math.max(0, (buyer.stpBalance || 0) - result.item.price);
      writeDB(db);
    }

    return res.json(result);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

app.delete("/api/market/items/:itemId", authMiddleware, (req, res) => {
  try {
    return res.json(marketModule.removeMarketItem(req.params.itemId, req.user.id));
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

app.get("/api/market/transactions", (req, res) => {
  try {
    const filter = {};
    if (req.query.buyerId)  filter.buyerId  = req.query.buyerId;
    if (req.query.sellerId) filter.sellerId = req.query.sellerId;
    return res.json(marketModule.getMarketTransactions(filter));
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

app.get("/api/market/transactions/:txId/contact", authMiddleware, (req, res) => {
  try {
    return res.json(
      marketModule.getTransactionContactExchange(req.params.txId, req.user.id)
    );
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

// ─── My purchases / listings ──────────────────────────────────────────────────

app.get("/api/my/purchases", authMiddleware, (req, res) => {
  try {
    return res.json(marketModule.getMarketTransactions({ buyerId: req.user.id }));
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

app.get("/api/my/listings", authMiddleware, (req, res) => {
  try {
    return res.json(marketModule.getAllMarketItems({ sellerId: req.user.id }));
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

app.get("/api/my/nfts", authMiddleware, (req, res) => {
  try {
    const db = readDB();
    return res.json(db.nfts.filter(n => n.ownerId === req.user.id));
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

app.get("/api/my/balance", authMiddleware, (req, res) => {
  try {
    const db   = readDB();
    const user = db.users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json({
      userId:     user.id,
      stpBalance: user.stpBalance || 0,
      points:     user.points     || 0
    });
  } catch (e) {
    return res.status(500).json({ error: e.message });
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
  return res.json({
    status:    "online",
    nfts:      db.nfts.length,
    users:     db.users.length,
    timestamp: new Date().toISOString()
  });
});

app.get("/health", (_req, res) => {
  return res.json({ status: "ok", timestamp: new Date().toISOString() });
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
    console.log(`\n🚀 Stampbook running on http://localhost:${PORT}`);
    console.log(`📊 Mode: ${process.env.NODE_ENV || "development"}`);
    if (!process.env.JWT_SECRET) {
      console.log("⚠️  JWT_SECRET not set — using insecure default (development only)");
    }
    console.log();
  });
  return server;
}

if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
