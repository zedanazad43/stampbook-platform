"use strict";

/**
 * Integration tests for server.js API routes.
 * Uses supertest to make HTTP requests against the express app
 * without binding a real port.
 *
 * The database is mocked via jest.mock("fs") so no disk I/O occurs.
 */

const request = require("supertest");

// ─── Mock the file-system before requiring server ─────────────────────────────

let mockDB;

jest.mock("fs", () => {
  const real = jest.requireActual("fs");
  return {
    ...real,
    existsSync: jest.fn().mockReturnValue(true),
    readFileSync: jest.fn().mockImplementation((filePath, enc) => {
      const p = String(filePath);
      if (p.includes("database"))       return JSON.stringify(mockDB);
      if (p.includes("wallets"))        return JSON.stringify({});
      if (p.includes("transactions"))   return JSON.stringify([]);
      if (p.includes("market-data"))    return JSON.stringify({ items: [], transactions: [] });
      if (p.includes("blockchain-state")) return JSON.stringify({ mintedSupply: 0, balances: {}, mintEvents: [] });
      if (p.includes("package.json"))   return real.readFileSync(filePath, enc);
      return "{}";
    }),
    writeFileSync: jest.fn().mockImplementation((filePath, data) => {
      if (String(filePath).includes("database")) {
        mockDB = JSON.parse(data);
      }
    }),
    mkdirSync: jest.fn(),
  };
});

// ─── Load app after fs is mocked ─────────────────────────────────────────────

const { app } = require("../server");

// ─── Helpers ─────────────────────────────────────────────────────────────────

function freshDB() {
  return { users: [], nfts: [], auctions: [], transactions: [], news: [], events: [] };
}

// ─── /health ─────────────────────────────────────────────────────────────────

describe("GET /health", () => {
  it("returns ok", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body).toHaveProperty("timestamp");
  });
});

describe("GET /api/health", () => {
  it("returns ok", async () => {
    const res = await request(app).get("/api/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
  });
});

// ─── Auth ─────────────────────────────────────────────────────────────────────

describe("POST /api/auth/register", () => {
  beforeEach(() => { mockDB = freshDB(); });

  it("creates a user and returns a JWT token", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Alice", email: "alice@test.com", password: "secret123" });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user.email).toBe("alice@test.com");
    expect(res.body.user.stpBalance).toBe(100); // welcome bonus
    expect(res.body.user).not.toHaveProperty("password");
  });

  it("rejects duplicate email with 409", async () => {
    // register once
    await request(app)
      .post("/api/auth/register")
      .send({ name: "Alice", email: "alice@test.com", password: "secret123" });

    // register again with same email
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Alice2", email: "alice@test.com", password: "other" });

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty("error");
  });

  it("rejects missing fields with 400", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "nopass@test.com" });
    expect(res.status).toBe(400);
  });
});

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    mockDB = freshDB();
    // pre-register a user
    await request(app)
      .post("/api/auth/register")
      .send({ name: "Bob", email: "bob@test.com", password: "password1" });
  });

  it("returns token on valid credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "bob@test.com", password: "password1" });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body.user.email).toBe("bob@test.com");
  });

  it("rejects wrong password with 401", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "bob@test.com", password: "wrongpass" });
    expect(res.status).toBe(401);
  });

  it("rejects unknown email with 401", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@test.com", password: "password1" });
    expect(res.status).toBe(401);
  });
});

describe("GET /api/auth/me", () => {
  let token;

  beforeEach(async () => {
    mockDB = freshDB();
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Carol", email: "carol@test.com", password: "pass" });
    token = res.body.token;
  });

  it("returns current user with valid token", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.email).toBe("carol@test.com");
    expect(res.body).not.toHaveProperty("password");
  });

  it("returns 401 without token", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("returns 401 with invalid token", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer not-a-real-token");
    expect(res.status).toBe(401);
  });
});

describe("PUT /api/auth/profile", () => {
  let token;

  beforeEach(async () => {
    mockDB = freshDB();
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Dave", email: "dave@test.com", password: "pass" });
    token = res.body.token;
  });

  it("updates user profile fields", async () => {
    const res = await request(app)
      .put("/api/auth/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "David", bio: "Stamp collector" });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("David");
    expect(res.body.bio).toBe("Stamp collector");
  });

  it("returns 401 without token", async () => {
    const res = await request(app)
      .put("/api/auth/profile")
      .send({ name: "Hacker" });
    expect(res.status).toBe(401);
  });
});

// ─── Stats ────────────────────────────────────────────────────────────────────

describe("GET /api/stats", () => {
  beforeEach(() => { mockDB = freshDB(); });

  it("returns platform statistics", async () => {
    const res = await request(app).get("/api/stats");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("users");
    expect(res.body).toHaveProperty("nfts");
    expect(res.body).toHaveProperty("auctions");
  });
});

// ─── NFTs ─────────────────────────────────────────────────────────────────────

describe("GET /api/nfts", () => {
  beforeEach(() => { mockDB = freshDB(); });

  it("returns nft list", async () => {
    const res = await request(app).get("/api/nfts");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe("POST /api/nfts/mint", () => {
  let token;

  beforeEach(async () => {
    mockDB = freshDB();
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Minter", email: "minter@test.com", password: "pass" });
    token = res.body.token;
  });

  it("mints an NFT for authenticated user", async () => {
    const res = await request(app)
      .post("/api/nfts/mint")
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "Rare Stamp", description: "1840 Penny Black", price: 500, image: "https://example.com/img.jpg" });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.name).toBe("Rare Stamp");
  });

  it("returns 401 without auth", async () => {
    const res = await request(app)
      .post("/api/nfts/mint")
      .send({ name: "Stamp", price: 100 });
    expect(res.status).toBe(401);
  });
});

// ─── Auctions ─────────────────────────────────────────────────────────────────

describe("GET /api/auctions", () => {
  beforeEach(() => { mockDB = freshDB(); });

  it("returns auction list", async () => {
    const res = await request(app).get("/api/auctions");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe("POST /api/auctions", () => {
  let token;

  beforeEach(async () => {
    mockDB = freshDB();
    const res = await request(app)
      .post("/api/auth/register")
      .send({ name: "Seller", email: "seller@test.com", password: "pass" });
    token = res.body.token;
  });

  it("creates an auction for authenticated user", async () => {
    const res = await request(app)
      .post("/api/auctions")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Penny Black Auction",
        description: "Rare 1840 stamp",
        startPrice: 1000,
        imageUrl: "https://example.com/img.jpg",
        endTime: new Date(Date.now() + 86400000).toISOString()
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.title).toBe("Penny Black Auction");
  });

  it("returns 401 without auth", async () => {
    const res = await request(app)
      .post("/api/auctions")
      .send({ title: "Unauthorized Auction" });
    expect(res.status).toBe(401);
  });
});

// ─── News ─────────────────────────────────────────────────────────────────────

describe("GET /api/news", () => {
  beforeEach(() => { mockDB = freshDB(); });

  it("returns news list", async () => {
    const res = await request(app).get("/api/news");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

// ─── Market ───────────────────────────────────────────────────────────────────

describe("GET /api/market/items", () => {
  it("returns market items array", async () => {
    const res = await request(app).get("/api/market/items");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

// ─── Blockchain ───────────────────────────────────────────────────────────────

describe("GET /api/blockchain/info", () => {
  it("returns blockchain metadata", async () => {
    const res = await request(app).get("/api/blockchain/info");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("name");
    expect(res.body).toHaveProperty("symbol");
  });
});

describe("GET /api/blockchain/supply", () => {
  it("returns supply stats", async () => {
    const res = await request(app).get("/api/blockchain/supply");
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("totalSupply");
    expect(res.body).toHaveProperty("mintedSupply");
  });
});

// ─── 404 fallback ─────────────────────────────────────────────────────────────

describe("Unknown API route", () => {
  it("returns 404 JSON for unknown /api/* paths", async () => {
    const res = await request(app).get("/api/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error");
  });
});
