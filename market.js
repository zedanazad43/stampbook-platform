/**
 * Market Institution Module
 * Digital marketplace for stamps and collectibles
 */

const fs = require("fs");
const { resolveDataFile } = require("./storage-paths");

const MARKET_FILE = resolveDataFile("market-data.json");

// Initialize market data structure
let marketData = {
  items: [],
  transactions: []
};

const CONTACT_PATTERNS = [
  /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i,
  /(?:\+?\d[\d\s().-]{7,}\d)/,
  /(?:https?:\/\/|www\.)\S+/i,
  /\b(?:whatsapp|telegram|t\.me|discord|snapchat|instagram|facebook|wechat|line|email|e-mail|phone|mobile|contact|عنوان|واتساب|تليجرام|هاتف|جوال)\b/i,
  /\b(?:street|st\.?|avenue|ave\.?|road|rd\.?|zip|postal|postcode|address|building|apartment|apt\.?|city|district|حي|شارع|بناية|شقة|رمز\s*بريدي|عنوان)\b/i
];

function containsRestrictedContactInfo(text) {
  if (typeof text !== "string") {
    return false;
  }

  const normalized = text.trim();
  if (!normalized) {
    return false;
  }

  return CONTACT_PATTERNS.some(pattern => pattern.test(normalized));
}

function assertNoContactLeak(value, fieldName) {
  if (containsRestrictedContactInfo(value)) {
    throw new Error(`Sharing contact or personal address info in ${fieldName} is not allowed before purchase`);
  }
}

function normalizePrice(rawPrice) {
  const price = Number(rawPrice);
  if (!Number.isFinite(price) || price <= 0) {
    throw new Error("Item price must be a positive number");
  }
  return price;
}

function sanitizeContactInfo(contact) {
  if (!contact || typeof contact !== "object") {
    return null;
  }

  const safe = {
    fullName: contact.fullName ? String(contact.fullName).trim() : "",
    email: contact.email ? String(contact.email).trim() : "",
    phone: contact.phone ? String(contact.phone).trim() : "",
    addressLine1: contact.addressLine1 ? String(contact.addressLine1).trim() : "",
    addressLine2: contact.addressLine2 ? String(contact.addressLine2).trim() : "",
    city: contact.city ? String(contact.city).trim() : "",
    country: contact.country ? String(contact.country).trim() : "",
    postalCode: contact.postalCode ? String(contact.postalCode).trim() : "",
    notes: contact.notes ? String(contact.notes).trim() : ""
  };

  const hasAnyValue = Object.values(safe).some(value => value !== "");
  return hasAnyValue ? safe : null;
}

function toPublicItem(item) {
  const { sellerContactPrivate, ...publicItem } = item;
  return publicItem;
}

function toPublicTransaction(tx) {
  const { sellerContactPrivate, buyerContactPrivate, ...publicTx } = tx;
  return publicTx;
}

// Load market data from file
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

// Save market data to file
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

/**
 * Add a new item to the market
 */
function addMarketItem(sellerId, item) {
  if (!sellerId || !item || !item.name) {
    throw new Error("sellerId and item with name are required");
  }

  assertNoContactLeak(item.name, "name");
  assertNoContactLeak(item.description || "", "description");

  const price = normalizePrice(item.price);

  const newItem = {
    id: `item_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
    sellerId,
    name: item.name,
    description: item.description || "",
    price,
    type: item.type || "stamp",
    imageUrl: item.imageUrl || "",
    status: "available",
    listedAt: new Date().toISOString(),
    sellerContactPrivate: sanitizeContactInfo(item.sellerContact)
  };

  marketData.items.push(newItem);
  saveMarketData();
  return toPublicItem(newItem);
}

/**
 * Get all market items
 */
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

  return items.map(toPublicItem);
}

/**
 * Get a specific market item by ID
 */
function getMarketItem(itemId) {
  const item = marketData.items.find(i => i.id === itemId);
  if (!item) {
    throw new Error("Market item not found");
  }
  return toPublicItem(item);
}

function getRawMarketItem(itemId) {
  const item = marketData.items.find(i => i.id === itemId);
  if (!item) {
    throw new Error("Market item not found");
  }
  return item;
}

/**
 * Update a market item
 */
function updateMarketItem(itemId, updates) {
  const itemIndex = marketData.items.findIndex(i => i.id === itemId);
  if (itemIndex === -1) {
    throw new Error("Market item not found");
  }

  const item = marketData.items[itemIndex];

  if (updates.name !== undefined) {
    assertNoContactLeak(updates.name, "name");
    item.name = updates.name;
  }
  if (updates.description !== undefined) {
    assertNoContactLeak(updates.description, "description");
    item.description = updates.description;
  }
  if (updates.price !== undefined) item.price = normalizePrice(updates.price);
  if (updates.status !== undefined) item.status = updates.status;
  if (updates.imageUrl !== undefined) item.imageUrl = updates.imageUrl;
  if (updates.sellerContact !== undefined) {
    item.sellerContactPrivate = sanitizeContactInfo(updates.sellerContact);
  }

  marketData.items[itemIndex] = item;
  saveMarketData();
  return toPublicItem(item);
}

/**
 * Purchase an item from the market
 */
function purchaseMarketItem(itemId, buyerId, options = {}) {
  const item = getRawMarketItem(itemId);

  if (item.status !== "available") {
    throw new Error("Item is not available for purchase");
  }

  if (item.sellerId === buyerId) {
    throw new Error("Cannot purchase your own item");
  }

  updateMarketItem(itemId, { status: "sold" });

  const platformFee = Number(options.platformFee || 0);
  const sellerProceeds = Number(options.sellerProceeds || item.price - platformFee);
  const feeCurrency = options.feeCurrency || "STP";

  const transaction = {
    id: `txn_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
    itemId,
    sellerId: item.sellerId,
    buyerId,
    price: item.price,
    platformFee,
    sellerProceeds,
    feeCurrency,
    contactExchangeUnlocked: true,
    sellerContactPrivate: item.sellerContactPrivate || null,
    buyerContactPrivate: sanitizeContactInfo(options.buyerContact),
    timestamp: new Date().toISOString()
  };

  marketData.transactions.push(transaction);
  saveMarketData();

  return {
    transaction: toPublicTransaction(transaction),
    item: toPublicItem(item)
  };
}

/**
 * Remove an item from the market
 */
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

/**
 * Get transaction history
 */
function getMarketTransactions(filter = {}) {
  let transactions = [...marketData.transactions];

  if (filter.buyerId) {
    transactions = transactions.filter(t => t.buyerId === filter.buyerId);
  }

  if (filter.sellerId) {
    transactions = transactions.filter(t => t.sellerId === filter.sellerId);
  }

  return transactions.map(toPublicTransaction);
}

function getTransactionContactExchange(transactionId, requesterId) {
  const tx = marketData.transactions.find(t => t.id === transactionId);
  if (!tx) {
    throw new Error("Market transaction not found");
  }

  if (!requesterId || (requesterId !== tx.buyerId && requesterId !== tx.sellerId)) {
    throw new Error("Only the buyer or seller can access contact exchange details");
  }

  if (!tx.contactExchangeUnlocked) {
    throw new Error("Contact exchange is locked for this transaction");
  }

  return {
    transactionId: tx.id,
    itemId: tx.itemId,
    sellerId: tx.sellerId,
    buyerId: tx.buyerId,
    sellerContact: tx.sellerContactPrivate || null,
    buyerContact: tx.buyerContactPrivate || null,
    unlockedAt: tx.timestamp
  };
}

module.exports = {
  addMarketItem,
  getAllMarketItems,
  getMarketItem,
  getRawMarketItem,
  updateMarketItem,
  purchaseMarketItem,
  removeMarketItem,
  getMarketTransactions,
  getTransactionContactExchange
};
