const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const cors = require("cors");
const wallet = require("./wallet");
const market = require("./market");
const blockchain = require("./blockchain");

const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map(o => o.trim())
  : ["http://localhost:8080", "http://localhost:3000", "http://localhost:10000"];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    // In development mode, allow all origins for easier local testing
    if (process.env.NODE_ENV !== "production") {
      return callback(null, true);
    }
    callback(new Error("Not allowed by CORS"));
  }
}));
app.use(express.json());
// Redirect home to /contact (must be before express.static so it overrides public/index.html)
app.get("/", (req, res) => res.redirect(302, "/contact"));// --------------------
// Contact page + form
// --------------------

// Where contact messages will be stored (simple JSON file; for production use a DB)
const CONTACT_MESSAGES_FILE = path.join(__dirname, "contact-messages.json");

// helper: read existing messages
async function readContactMessages() {
  try {
    const raw = await fs.readFile(CONTACT_MESSAGES_FILE, "utf8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch (e) {
    // file doesn't exist yet => no messages
    if (e && (e.code === "ENOENT" || String(e.message).includes("ENOENT"))) return [];
    console.error("readContactMessages error:", e.message || e);
    return [];
  }
}

// helper: append a message
async function appendContactMessage(message) {
  const existing = await readContactMessages();
  existing.push(message);
  await fs.writeFile(CONTACT_MESSAGES_FILE, JSON.stringify(existing, null, 2), "utf8");
}

// Pretty contact page (GET)
app.get("/contact", (req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(`
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Contact | Stampcoin Platform</title>
  <style>
    :root { --bg:#0b1220; --card:#111a2e; --text:#e5e7eb; --muted:#9ca3af; --accent:#60a5fa; }
    body { margin:0; font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; background: radial-gradient(1200px 800px at 20% 10%, #1b2a52, var(--bg)); color: var(--text); }
    .wrap { max-width: 860px; margin: 0 auto; padding: 40px 18px; }
    .top { display:flex; justify-content:space-between; align-items:center; gap:12px; flex-wrap:wrap; }
    a { color: var(--accent); text-decoration: none; }
    a:hover { text-decoration: underline; }
    .card { background: rgba(17,26,46,.92); border: 1px solid rgba(255,255,255,.08); border-radius: 16px; padding: 18px; box-shadow: 0 10px 30px rgba(0,0,0,.25); }
    h1 { margin: 0 0 10px; font-size: 28px; }
    p { margin: 10px 0; color: var(--muted); }
    .grid { display:grid; grid-template-columns: 1fr; gap: 14px; margin-top: 14px; }
    @media (min-width: 860px) { .grid { grid-template-columns: 1fr 1fr; } }
    label { display:block; font-size: 13px; color: var(--muted); margin-bottom: 6px; }
    input, textarea { width:100%; box-sizing:border-box; padding: 12px 12px; border-radius: 12px; border: 1px solid rgba(255,255,255,.10); background: rgba(0,0,0,.18); color: var(--text); outline: none; }
    textarea { min-height: 120px; resize: vertical; }
    button { cursor:pointer; padding: 12px 14px; border: 0; border-radius: 12px; background: linear-gradient(90deg, #60a5fa, #a78bfa); color: #0b1220; font-weight: 700; }
    .row { display:flex; gap:12px; flex-wrap:wrap; }
    .pill { display:inline-block; padding: 6px 10px; border-radius: 999px; border: 1px solid rgba(255,255,255,.10); background: rgba(0,0,0,.18); color: var(--text); font-size: 13px; }
    .ok { color:#34d399; }
    .err { color:#fca5a5; }
    code { background: rgba(0,0,0,.25); padding: 2px 6px; border-radius: 8px; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="top">
      <div>
        <h1>Contact</h1>
        <p>Get in touch with the Stampcoin Platform team.</p>
      </div>
      <div class="row">
        <a class="pill" href="/">Home</a>
        <a class="pill" href="/health">Health</a>
        <a class="pill" href="/go-contact">Redirect test</a>
      </div>
    </div>

    <div class="grid">
      <div class="card">
        <h2 style="margin:0 0 10px;">Send a message</h2>
        <p>Messages are stored server-side (JSON) and also printed to logs. Later we can integrate email.</p>
        <form method="post" action="/contact">
          <div style="margin-top:12px;">
            <label for="name">Name</label>
            <input id="name" name="name" placeholder="Your name" required />
          </div>
          <div style="margin-top:12px;">
            <label for="email">Email</label>
            <input id="email" name="email" placeholder="you@example.com" type="email" required />
          </div>
          <div style="margin-top:12px;">
            <label for="message">Message</label>
            <textarea id="message" name="message" placeholder="Write your message..." required></textarea>
          </div>
          <div style="margin-top:12px;">
            <button type="submit">Send</button>
          </div>
        </form>
      </div>

      <div class="card">
        <h2 style="margin:0 0 10px;">Other contacts</h2>
        <p><strong>Email:</strong> <a href="mailto:stampcoin.contact@gmail.com">stampcoin.contact@gmail.com</a></p>
        <p><strong>GitHub:</strong> <a href="https://github.com/zedanazad43/stp">zedanazad43/stp</a></p>
        <p class="pill">Tip: check <code>/api/token</code> for token metadata.</p>
      </div>
    </div>
  </div>
</body>
</html>
  `);
});

// Parse simple HTML form posts
app.use(express.urlencoded({ extended: false }));

// Contact form submit (POST)
app.post("/contact", async (req, res) => {
  try {
    const { name, email, message } = req.body || {};
    if (!name || !email || !message) {
      return res.status(400).send("Missing name/email/message");
    }

    const entry = {
      id: "msg_" + Date.now(),
      name: String(name).trim(),
      email: String(email).trim(),
      message: String(message).trim(),
      createdAt: new Date().toISOString(),
      ip: req.headers["fly-client-ip"] || req.ip || null,
      userAgent: req.headers["user-agent"] || null,
    };

    await appendContactMessage(entry);
    console.log("CONTACT_MESSAGE:", entry);

    // Simple success page
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send(`
      <!doctype html>
      <html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
      <title>Message sent</title></head>
      <body style="font-family:system-ui;margin:40px;max-width:720px">
        <h1>Message sent</h1>
        <p class="ok">Thanks, we received your message.</p>
        <p><a href="/contact">Back to Contact</a> | <a href="/">Home</a></p>
      </body></html>
    `);
  } catch (e) {
    console.error("POST /contact error:", e);
    return res.status(500).send("Failed to store message");
  }
});

// Optional redirect endpoint (so / can stay Home)
app.get("/go-contact", (req, res) => res.redirect(302, "/contact"));
app.use(express.static(path.join(__dirname, "public")));

const DATA_FILE = path.join(__dirname, "data.json");
const SYNC_TOKEN = process.env.SYNC_TOKEN || "";

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
// Simple Contact page (GET)
app.get("/contact", (req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.status(200).send(`
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>Contact | Stampcoin Platform</title>
      </head>
      <body>
        <h1>Contact</h1>
        <p>Stampcoin Platform is running.</p>
        <p><a href="/health">Health</a></p>
      </body>
    </html>
  `);
});

// Redirect home to contact
app.get("/", (req, res) => res.redirect("/contact"));
// Health check endpoint
app.get("/health", (req, res) => res.json({ status: "ok" }));

// --- Wallet API ---

// Create wallet
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

// Get wallet by userId
app.get("/api/wallet/:userId", (req, res) => {
  try {
    const w = wallet.getWallet(req.params.userId);
    if (!w) return res.status(404).json({ error: "Wallet not found" });
    res.json(w);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Transfer balance between wallets
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

// Get transaction history for a user
app.get("/api/wallet/:userId/transactions", (req, res) => {
  try {
    const txs = wallet.getTransactionHistory(req.params.userId);
    res.json(txs);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Add stamp to wallet (token-protected to prevent unauthorized stamp minting)
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

// List all wallets (admin endpoint, token-protected)
app.get("/api/wallets", requireToken, (req, res) => {
  try {
    res.json(wallet.getAllWallets());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Top-up wallet balance (token-protected)
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

// Get all market items (with optional filters)
app.get("/api/market/items", (req, res) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.type) filter.type = req.query.type;
    res.json(market.getAllMarketItems(filter));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// List a new item on the market
app.post("/api/market/items", (req, res) => {
  try {
    const { sellerId, name, description, price, type, imageUrl } = req.body;
    if (!sellerId || !name) return res.status(400).json({ error: "sellerId and name are required" });
    const item = market.addMarketItem(sellerId, { name, description, price, type, imageUrl });
    res.json(item);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Get a specific market item by ID
app.get("/api/market/items/:itemId", (req, res) => {
  try {
    res.json(market.getMarketItem(req.params.itemId));
  } catch (e) {
    res.status(404).json({ error: e.message });
  }
});

// Update a market item (seller only)
app.put("/api/market/items/:itemId", (req, res) => {
  try {
    const { userId, price, description, status, imageUrl } = req.body || {};
    if (!userId) return res.status(400).json({ error: "userId is required" });
    const item = market.getMarketItem(req.params.itemId);
    if (item.sellerId !== userId) return res.status(403).json({ error: "Only the seller can update this item" });
    const updates = {};
    if (price !== undefined) updates.price = price;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;
    if (imageUrl !== undefined) updates.imageUrl = imageUrl;
    if (Object.keys(updates).length === 0) return res.status(400).json({ error: "No updatable fields provided" });
    res.json(market.updateMarketItem(req.params.itemId, updates));
  } catch (e) {
    if (e.message === "Market item not found") return res.status(404).json({ error: e.message });
    res.status(400).json({ error: e.message });
  }
});

// Purchase a market item
app.post("/api/market/items/:itemId/buy", (req, res) => {
  try {
    const { buyerId } = req.body;
    if (!buyerId) return res.status(400).json({ error: "buyerId is required" });
    const item = market.getMarketItem(req.params.itemId);
    if (item.price > 0) {
      wallet.transfer(buyerId, item.sellerId, item.price);
    }
    const result = market.purchaseMarketItem(req.params.itemId, buyerId);
    res.json(result);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Remove a market item (seller only)
app.delete("/api/market/items/:itemId", (req, res) => {
  try {
    const userId = (req.body && req.body.userId) || req.query.userId;
    if (!userId) return res.status(400).json({ error: "userId is required" });
    res.json(market.removeMarketItem(req.params.itemId, userId));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// Get market transaction history (with optional buyer/seller filters)
app.get("/api/market/transactions", (req, res) => {
  try {
    const filter = {};
    if (req.query.buyerId) filter.buyerId = req.query.buyerId;
    if (req.query.sellerId) filter.sellerId = req.query.sellerId;
    res.json(market.getMarketTransactions(filter));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- Token Info API ---
app.get("/api/token", (req, res) => {
  res.json({
    name: "StampCoin",
    symbol: "STP",
    totalSupply: 421000000,
    icoPrice: 1.65,
    icoUnit: "USD",
    decimals: 18,
    license: "MIT",
    website: "https://ecostamp.net",
    github: "https://github.com/zedanazad43/stp",
    contact: "stampcoin.contact@gmail.com",
    distribution: [
      { label: "Public ICO Sale",       percent: 20, amount: 84200000 },
      { label: "Ecosystem & Partners",  percent: 20, amount: 84200000 },
      { label: "Community & Rewards",   percent: 20, amount: 84200000 },
      { label: "Liquidity Pool",        percent: 15, amount: 63150000 },
      { label: "Team & Founders",       percent: 15, amount: 63150000 },
      { label: "Reserve",               percent: 10, amount: 42100000 }
    ],
    contractAddress: process.env.STP_CONTRACT_ADDRESS || "Pending mainnet deployment",
    network: "EVM-compatible"
  });
});

// --- Blockchain API ---

app.get("/api/blockchain/info", (req, res) => {
  try {
    res.json(blockchain.getBlockchainInfo());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/blockchain/supply", (req, res) => {
  try {
    res.json(blockchain.getSupply());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/blockchain/mint", requireToken, (req, res) => {
  try {
    const { toAddress, amount } = req.body || {};
    if (!toAddress) return res.status(400).json({ error: "toAddress is required" });
    if (amount === undefined || amount === null) return res.status(400).json({ error: "amount is required" });
    const event = blockchain.mintTokens(toAddress, Number(amount));
    res.json(event);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.get("/api/blockchain/balance/:address", (req, res) => {
  try {
    res.json(blockchain.getBalance(req.params.address));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.get("/api/blockchain/mint/events", requireToken, (req, res) => {
  try {
    res.json(blockchain.getMintEvents());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- Auctions API (in-memory — data resets on server restart) ---
// For production, replace with a persistent data store (e.g., database or JSON file).
const auctions = new Map();

app.get("/api/auctions", (req, res) => {
  try {
    const list = Array.from(auctions.values()).filter(a => a.status !== "cancelled");
    const { status } = req.query;
    res.json(status ? list.filter(a => a.status === status) : list);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/auctions", (req, res) => {
  try {
    const { sellerId, stampName, description, startingBid, durationHours } = req.body;
    if (!sellerId || !stampName || !startingBid) {
      return res.status(400).json({ error: "sellerId, stampName, and startingBid are required" });
    }
    const id = "auction_" + Date.now();
    const auction = {
      id,
      sellerId,
      stampName,
      description: description || "",
      currentBid: Number(startingBid),
      startingBid: Number(startingBid),
      bids: [],
      status: "active",
      endsAt: Date.now() + (Number(durationHours) || 24) * 3600 * 1000,
      createdAt: new Date().toISOString(),
    };
    auctions.set(id, auction);
    res.status(201).json(auction);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.get("/api/auctions/:id", (req, res) => {
  try {
    const auction = auctions.get(req.params.id);
    if (!auction) return res.status(404).json({ error: "Auction not found" });
    res.json(auction);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/auctions/:id/bid", (req, res) => {
  try {
    const auction = auctions.get(req.params.id);
    if (!auction) return res.status(404).json({ error: "Auction not found" });
    if (auction.status !== "active") return res.status(400).json({ error: "Auction is not active" });
    if (Date.now() > auction.endsAt) {
      auction.status = "ended";
      return res.status(400).json({ error: "Auction has ended" });
    }
    const { bidderId, amount } = req.body;
    if (!bidderId || !amount) return res.status(400).json({ error: "bidderId and amount are required" });
    if (Number(amount) <= auction.currentBid) {
      return res.status(400).json({ error: `Bid must be greater than current bid of ${auction.currentBid}` });
    }
    const bid = { bidderId, amount: Number(amount), timestamp: new Date().toISOString() };
    auction.bids.push(bid);
    auction.currentBid = Number(amount);
    res.json({ auction, bid });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// --- NFT Stamps API (in-memory — data resets on server restart) ---
// For production, replace with a persistent data store (e.g., database or JSON file).
const nftStamps = new Map();

app.get("/api/nft/stamps", (req, res) => {
  try {
    const list = Array.from(nftStamps.values());
    const { ownerId } = req.query;
    res.json(ownerId ? list.filter(s => s.ownerId === ownerId) : list);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/nft/mint", (req, res) => {
  try {
    const { ownerId, name, country, year, description, rarity, imageUrl } = req.body;
    if (!ownerId || !name) return res.status(400).json({ error: "ownerId and name are required" });
    const tokenId = "STP-" + Date.now().toString(36).toUpperCase();
    const stamp = {
      tokenId,
      ownerId,
      name,
      country: country || "",
      year: year || null,
      description: description || "",
      rarity: rarity || "common",
      imageUrl: imageUrl || null,
      mintedAt: new Date().toISOString(),
      status: "minted",
      mintCost: 50,
    };
    nftStamps.set(tokenId, stamp);
    res.status(201).json(stamp);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.get("/api/nft/stamps/:tokenId", (req, res) => {
  try {
    const stamp = nftStamps.get(req.params.tokenId);
    if (!stamp) return res.status(404).json({ error: "NFT stamp not found" });
    res.json(stamp);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- Users / Registration API (in-memory — data resets on server restart) ---
// For production, replace with a persistent data store (e.g., database or JSON file).
const users = new Map();

app.post("/api/users/register", (req, res) => {
  try {
    const { userId, userName, email } = req.body;
    if (!userId || !userName) return res.status(400).json({ error: "userId and userName are required" });
    if (users.has(userId)) return res.status(409).json({ error: "User already registered" });
    const user = {
      userId,
      userName,
      email: email || null,
      registeredAt: new Date().toISOString(),
      role: "user",
    };
    users.set(userId, user);
    // Also create wallet for the user
    let walletData = null;
    try { walletData = wallet.createWallet(userId, userName); } catch (e) {
      // Wallet may already exist for this userId — that is acceptable
      if (!e.message.includes("already exists")) {
        console.error("Wallet creation error during registration:", e.message);
      }
    }
    res.status(201).json({ user, wallet: walletData });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.get("/api/users/:userId", (req, res) => {
  try {
    const user = users.get(req.params.userId);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- Sync API ---
async function readData() {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf8");
    return JSON.parse(raw);
  } catch (e) {
    console.error("Error reading data file:", e.message);
    return [];
  }
}

async function writeData(todos) {
  try {
    await fs.writeFile(DATA_FILE, JSON.stringify(todos, null, 2), "utf8");
    return true;
  } catch (e) {
    console.error("Write error:", e);
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
    return res.status(400).json({ error: "Invalid payload, expected { todos: [...] }" });
  }
  const ok = await writeData(payload.todos);
  if (!ok) return res.status(500).json({ error: "Failed to store data" });
  res.json({ ok: true });
});

const port = process.env.PORT || 10000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Stampcoin Platform server listening on port ${port}`);
});
