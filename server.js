const express = require("express");
const fs = require("fs").promises;
const fsSync = require("fs");
const path = require("path");
const cors = require("cors");
const wallet = require("./wallet");
const market = require("./market");
const blockchain = require("./blockchain");
const { dataDir, resolveDataFile } = require("./storage-paths");

const app = express();

function normalizeUrl(value) {
  if (!value) return "";
  return value.trim().replace(/\/$/, "");
}

function getHostname(value) {
  if (!value) return "";
  try {
    return new URL(value).hostname.toLowerCase();
  } catch (error) {
    return value.trim().toLowerCase();
  }
}

const baseUrl = normalizeUrl(process.env.BASE_URL);
const canonicalHost = getHostname(process.env.CANONICAL_HOST || baseUrl);
const canonicalOrigin = baseUrl || (canonicalHost ? `https://${canonicalHost}` : "");
const productionFallbackOrigins = [
  "https://ecostamp.net",
  "https://www.ecostamp.net"
];

app.set("trust proxy", true);

const allowedOrigins = [
  "http://localhost:8080",
  "http://localhost:3000",
  "http://localhost:10000",
  ...productionFallbackOrigins,
  ...((process.env.ALLOWED_ORIGINS || "").split(",").map(o => o.trim()).filter(Boolean)),
  ...(canonicalOrigin ? [canonicalOrigin] : [])
].filter((origin, index, list) => list.indexOf(origin) === index);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (process.env.NODE_ENV !== "production") {
      return callback(null, true);
    }
    callback(new Error("Not allowed by CORS"));
  }
}));

app.use(express.json());

app.use((req, res, next) => {
  if (process.env.NODE_ENV !== "production" || !canonicalHost) {
    return next();
  }

  const requestHost = (req.hostname || "").toLowerCase();
  if (!requestHost || requestHost === canonicalHost) {
    return next();
  }

  const forwardedProto = req.get("x-forwarded-proto");
  const requestProtocol = (forwardedProto || req.protocol || "https").split(",")[0].trim();
  const redirectTarget = `${canonicalOrigin.replace(/^https?:\/\//, `${requestProtocol}://`)}${req.originalUrl}`;
  return res.redirect(308, redirectTarget);
});

app.use(express.static(path.join(__dirname, "public")));

const DATA_FILE = resolveDataFile("data.json");
const SYNC_TOKEN = process.env.SYNC_TOKEN || "";
const MARKET_FEE_BPS = Number(process.env.MARKET_FEE_BPS || 500);
const MARKET_FEE_WALLET_ID = process.env.MARKET_FEE_WALLET_ID || "platform_treasury";
const MARKET_FEE_WALLET_NAME = process.env.MARKET_FEE_WALLET_NAME || "Platform Treasury";

function requireToken(req, res, next) {
  const auth = req.get("Authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "");
  if (!SYNC_TOKEN) {
    if (process.env.NODE_ENV === "production") {
      return res.status(401).json({ error: "Unauthorized" });
    }
    console.warn("SYNC_TOKEN not configured - authentication disabled (development mode)");
    return next();
  }
  if (token !== SYNC_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

// Mount AI Agent Expert routes
const aiAgentPath = path.join(__dirname, "src/ai-agent-expert/index.js");
if (fsSync.existsSync(aiAgentPath)) {
  const aiAgent = require(aiAgentPath);
  app.use("/agent", aiAgent);
  console.log("AI Agent Expert mounted successfully");
} else {
  console.warn("AI Agent Expert not found at:", aiAgentPath);
}

// --- API Endpoints ---

app.get("/health", (req, res) => res.json({ status: "ok", baseUrl: canonicalOrigin || null }));
app.get("/api/health", (req, res) => res.json({ status: "ok", baseUrl: canonicalOrigin || null }));

app.get("/api/site", (req, res) => {
  res.json({
    baseUrl: canonicalOrigin || `${req.protocol}://${req.get("host")}`,
    canonicalHost: canonicalHost || req.hostname,
    allowedOrigins,
    dataDir
  });
});

// --- Wallet API ---
app.post("/api/wallet/create", (req, res) => {
  try {
    const { userId, userName } = req.body;
    if (!userId || !userName) return res.status(400).json({ error: "userId and userName are required" });
    const w = wallet.createWallet(userId, userName);
    res.json(w);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.get("/api/wallet/:userId", (req, res) => {
  try {
    const w = wallet.getWallet(req.params.userId);
    if (!w) return res.status(404).json({ error: "Wallet not found" });
    res.json(w);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/wallet/transfer", (req, res) => {
  try {
    const { fromUserId, toUserId, amount } = req.body;
    if (!fromUserId || !toUserId || !amount) return res.status(400).json({ error: "fromUserId, toUserId, and amount are required" });
    const tx = wallet.transfer(fromUserId, toUserId, Number(amount));
    res.json(tx);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.get("/api/wallet/:userId/transactions", (req, res) => {
  try {
    const txs = wallet.getTransactionHistory(req.params.userId);
    res.json(txs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/wallet/:userId/stamps", requireToken, (req, res) => {
  try {
    const stamp = req.body;
    if (!stamp || !stamp.name) return res.status(400).json({ error: "stamp name is required" });
    const w = wallet.addStamp(req.params.userId, stamp);
    res.json(w);
  } catch (e) {
    if (e.message === "Wallet not found") return res.status(404).json({ error: e.message });
    res.status(400).json({ error: e.message });
  }
});

app.get("/api/wallets", requireToken, (req, res) => {
  try {
    res.json(wallet.getAllWallets());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/wallet/:userId/topup", requireToken, (req, res) => {
  try {
    const amount = Number((req.body && req.body.amount) || 1000);
    const w = wallet.updateBalance(req.params.userId, amount);
    res.json(w);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// --- Market API ---
app.get("/api/market/items", (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.type) filter.type = req.query.type;
    if (req.query.sellerId) filter.sellerId = req.query.sellerId;
    res.json(market.getAllMarketItems(filter));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/market/items", (req, res) => {
  try {
    const { sellerId, name, description, price, type, imageUrl, sellerContact } = req.body;
    if (!sellerId || !name) return res.status(400).json({ error: "sellerId and name are required" });
    const item = market.addMarketItem(sellerId, { name, description, price, type, imageUrl, sellerContact });
    res.json(item);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.get("/api/market/items/:itemId", (req, res) => {
  try {
    res.json(market.getMarketItem(req.params.itemId));
  } catch (e) {
    res.status(404).json({ error: e.message });
  }
});

app.put("/api/market/items/:itemId", (req, res) => {
  try {
    const { userId, price, description, status, imageUrl, sellerContact } = req.body || {};
    if (!userId) return res.status(400).json({ error: "userId is required" });
    const item = market.getRawMarketItem(req.params.itemId);
    if (item.sellerId !== userId) return res.status(403).json({ error: "Only the seller can update this item" });
    const updates = {};
    if (price !== undefined) updates.price = price;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;
    if (imageUrl !== undefined) updates.imageUrl = imageUrl;
    if (sellerContact !== undefined) updates.sellerContact = sellerContact;
    if (Object.keys(updates).length === 0) return res.status(400).json({ error: "No updatable fields provided" });
    res.json(market.updateMarketItem(req.params.itemId, updates));
  } catch (e) {
    if (e.message === "Market item not found") return res.status(404).json({ error: e.message });
    res.status(400).json({ error: e.message });
  }
});

app.post("/api/market/items/:itemId/buy", (req, res) => {
  try {
    const { buyerId, buyerContact } = req.body;
    if (!buyerId) return res.status(400).json({ error: "buyerId is required" });
    const item = market.getRawMarketItem(req.params.itemId);

    if (item.price <= 0) {
      return res.status(400).json({ error: "Free listings are not allowed." });
    }

    if (!wallet.getWallet(MARKET_FEE_WALLET_ID)) {
      wallet.createWallet(MARKET_FEE_WALLET_ID, MARKET_FEE_WALLET_NAME);
    }

    const platformFee = Math.max(1, Math.ceil((item.price * MARKET_FEE_BPS) / 10000));
    const sellerProceeds = item.price - platformFee;
    
    wallet.transfer(buyerId, item.sellerId, sellerProceeds);
    wallet.transfer(buyerId, MARKET_FEE_WALLET_ID, platformFee);

    const result = market.purchaseMarketItem(req.params.itemId, buyerId, {
      platformFee,
      sellerProceeds,
      feeCurrency: "STP",
      buyerContact
    });
    res.json(result);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// --- Blockchain API ---
app.post("/api/blockchain/mint", requireToken, (req, res) => {
  try {
    const { toAddress, amount } = req.body || {};
    if (!toAddress) return res.status(400).json({ error: "toAddress is required" });
    const event = blockchain.mintTokens(toAddress, Number(amount));
    res.json(event);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// --- Sync API (Persistent Storage) ---
async function readData() {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(raw || "[]");
  } catch (e) {
    return [];
  }
}

async function writeData(todos) {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(todos, null, 2), "utf8");
    return true;
  } catch (e) {
    return false;
  }
}

app.get("/sync", requireToken, async (req, res) => {
  const todos = await readData();
  res.json({ todos });
});

app.post("/sync", requireToken, async (req, res) => {
  const payload = req.body;
  if (!payload || !Array.isArray(payload.todos)) {
    return res.status(400).json({ error: "Invalid payload" });
  }
  const ok = await writeData(payload.todos);
  if (!ok) return res.status(500).json({ error: "Failed to store data" });
  res.json({ ok: true });
});

// Final Server Startup
const port = process.env.PORT || 10000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Stampcoin Platform server listening on port ${port}`);
});
