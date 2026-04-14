"use strict";

/**
 * HTTP route integration tests for the 3 new endpoints:
 *   - POST /api/wallet/:userId/stamps   (issue #177)
 *   - GET  /api/wallets                 (issue #177)
 *   - GET  /api/market/transactions     (issue #176)
 *   - PUT  /api/market/items/:itemId    (issue #175)
 *
 * wallet.js and market.js are mocked so no disk I/O occurs.
 */

jest.mock("../wallet");
jest.mock("../market");
jest.mock("../blockchain");

const request = require("supertest");
const wallet = require("../wallet");
const market = require("../market");

// Load the express app after mocks are in place
const { app } = require("../server");

const VALID_TOKEN = "test-secret";

// Helper to make token header
const authHeader = (token = VALID_TOKEN) => ({ Authorization: `Bearer ${token}` });

beforeEach(() => {
  jest.resetAllMocks();
  process.env.SYNC_TOKEN = VALID_TOKEN;
});

// ── POST /api/wallet/:userId/stamps ──────────────────────────────────────────

describe("POST /api/wallet/:userId/stamps", () => {
  const stamp = { name: "Rare Stamp", year: 1920 };

  test("returns updated wallet on success", async () => {
    const updatedWallet = {
      userId: "user1",
      userName: "Alice",
      balance: 0,
      stamps: [{ id: "uuid-1", name: "Rare Stamp", year: 1920, addedAt: "2026-01-01T00:00:00.000Z" }]
    };
    wallet.addStamp.mockReturnValue(updatedWallet);

    const res = await request(app)
      .post("/api/wallet/user1/stamps")
      .set(authHeader())
      .send(stamp);

    expect(res.status).toBe(200);
    expect(res.body.stamps).toHaveLength(1);
    expect(res.body.stamps[0].name).toBe("Rare Stamp");
    expect(wallet.addStamp).toHaveBeenCalledWith("user1", stamp);
  });

  test("returns 404 when wallet does not exist", async () => {
    wallet.addStamp.mockImplementation(() => { throw new Error("Wallet not found"); });

    const res = await request(app)
      .post("/api/wallet/nobody/stamps")
      .set(authHeader())
      .send(stamp);

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Wallet not found");
  });

  test("returns 401 when no token is provided", async () => {
    const res = await request(app)
      .post("/api/wallet/user1/stamps")
      .send(stamp);

    expect(res.status).toBe(401);
  });

  test("returns 401 when wrong token is provided", async () => {
    const res = await request(app)
      .post("/api/wallet/user1/stamps")
      .set(authHeader("wrong-token"))
      .send(stamp);

    expect(res.status).toBe(401);
  });
});

// ── GET /api/wallets ─────────────────────────────────────────────────────────

describe("GET /api/wallets", () => {
  const allWallets = {
    user1: { userId: "user1", userName: "Alice", balance: 0, stamps: [] },
    user2: { userId: "user2", userName: "Bob", balance: 100, stamps: [] }
  };

  test("returns all wallets with valid token", async () => {
    wallet.getAllWallets.mockReturnValue(allWallets);

    const res = await request(app)
      .get("/api/wallets")
      .set(authHeader());

    expect(res.status).toBe(200);
    expect(res.body.user1.userName).toBe("Alice");
    expect(res.body.user2.userName).toBe("Bob");
  });

  test("returns 401 without token", async () => {
    const res = await request(app).get("/api/wallets");
    expect(res.status).toBe(401);
  });
});

// ── GET /api/market/transactions ─────────────────────────────────────────────

describe("GET /api/market/transactions", () => {
  const txList = [
    { id: "txn1", itemId: "item1", sellerId: "seller1", buyerId: "buyer1", price: 100, timestamp: "2026-01-01T00:00:00.000Z" },
    { id: "txn2", itemId: "item2", sellerId: "seller1", buyerId: "buyer2", price: 200, timestamp: "2026-01-02T00:00:00.000Z" }
  ];

  test("returns all transactions with no filter", async () => {
    market.getMarketTransactions.mockReturnValue(txList);

    const res = await request(app).get("/api/market/transactions");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    expect(market.getMarketTransactions).toHaveBeenCalledWith({ buyerId: undefined, sellerId: undefined });
  });

  test("passes buyerId query param to getMarketTransactions", async () => {
    market.getMarketTransactions.mockReturnValue([txList[0]]);

    const res = await request(app).get("/api/market/transactions?buyerId=buyer1");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(market.getMarketTransactions).toHaveBeenCalledWith({ buyerId: "buyer1", sellerId: undefined });
  });

  test("passes sellerId query param to getMarketTransactions", async () => {
    market.getMarketTransactions.mockReturnValue(txList);

    const res = await request(app).get("/api/market/transactions?sellerId=seller1");

    expect(res.status).toBe(200);
    expect(market.getMarketTransactions).toHaveBeenCalledWith({ buyerId: undefined, sellerId: "seller1" });
  });
});

// ── PUT /api/market/items/:itemId ────────────────────────────────────────────

describe("PUT /api/market/items/:itemId", () => {
  const existingItem = { id: "item1", sellerId: "seller1", name: "Old Name", price: 10, status: "available" };
  const updatedItem = { ...existingItem, price: 99, description: "Updated" };

  beforeEach(() => {
    market.getMarketItem.mockReturnValue(existingItem);
    market.updateMarketItem.mockReturnValue(updatedItem);
  });

  test("updates item when called by the seller", async () => {
    const res = await request(app)
      .put("/api/market/items/item1")
      .send({ userId: "seller1", price: 99, description: "Updated" });

    expect(res.status).toBe(200);
    expect(res.body.price).toBe(99);
    expect(market.updateMarketItem).toHaveBeenCalledWith("item1", { price: 99, description: "Updated" });
  });

  test("returns 403 when caller is not the seller", async () => {
    const res = await request(app)
      .put("/api/market/items/item1")
      .send({ userId: "hacker", price: 1 });

    expect(res.status).toBe(403);
    expect(market.updateMarketItem).not.toHaveBeenCalled();
  });

  test("returns 400 when userId is missing", async () => {
    const res = await request(app)
      .put("/api/market/items/item1")
      .send({ price: 99 });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/userId/);
  });

  test("returns 400 when no updatable fields are provided", async () => {
    const res = await request(app)
      .put("/api/market/items/item1")
      .send({ userId: "seller1" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/No updatable fields/);
  });

  test("returns 404 when item does not exist", async () => {
    market.getMarketItem.mockImplementation(() => { throw new Error("Market item not found"); });

    const res = await request(app)
      .put("/api/market/items/bad-id")
      .send({ userId: "seller1", price: 10 });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Market item not found");
  });
});
