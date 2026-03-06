import { test, expect } from "@playwright/test";

/**
 * API endpoint tests for the Stampcoin Platform.
 * Tests REST API endpoints directly using Playwright's request context.
 * Each test is isolated using unique IDs to avoid state pollution.
 */
test.describe("API: Health", () => {
  test("GET /health returns status ok", async ({ request }) => {
    const response = await request.get("/health");
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toMatchObject({ status: "ok" });
  });
});

test.describe("API: Token Info", () => {
  test("GET /api/token returns StampCoin token metadata", async ({ request }) => {
    const response = await request.get("/api/token");
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.name).toBe("StampCoin");
    expect(body.symbol).toBe("STP");
    expect(body.totalSupply).toBeGreaterThan(0);
    expect(Array.isArray(body.distribution)).toBe(true);
  });
});

test.describe("API: Wallet", () => {
  test("POST /api/wallet/create creates a new wallet", async ({ request }) => {
    const uid = `api_wallet_${Date.now()}`;
    const response = await request.post("/api/wallet/create", {
      data: { userId: uid, userName: "API Test User" },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.userId).toBe(uid);
    expect(body.userName).toBe("API Test User");
    expect(typeof body.balance).toBe("number");
  });

  test("POST /api/wallet/create returns 400 when userId is missing", async ({ request }) => {
    const response = await request.post("/api/wallet/create", {
      data: { userName: "No ID User" },
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBeTruthy();
  });

  test("POST /api/wallet/create returns 400 when userName is missing", async ({ request }) => {
    const response = await request.post("/api/wallet/create", {
      data: { userId: `uid_${Date.now()}` },
    });
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toBeTruthy();
  });

  test("GET /api/wallet/:userId retrieves an existing wallet", async ({ request }) => {
    const uid = `api_get_${Date.now()}`;
    await request.post("/api/wallet/create", {
      data: { userId: uid, userName: "Getter User" },
    });

    const response = await request.get(`/api/wallet/${uid}`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.userId).toBe(uid);
  });

  test("GET /api/wallet/:userId returns 404 for unknown wallet", async ({ request }) => {
    const response = await request.get("/api/wallet/nonexistent_user_xyz_123");
    expect(response.status()).toBe(404);
  });

  test("POST /api/wallet/:userId/topup increases wallet balance", async ({ request }) => {
    const uid = `api_topup_${Date.now()}`;
    await request.post("/api/wallet/create", {
      data: { userId: uid, userName: "Topup Test" },
    });

    const response = await request.post(`/api/wallet/${uid}/topup`, {
      data: { amount: 500 },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.balance).toBeGreaterThanOrEqual(500);
  });

  test("POST /api/wallet/transfer moves STP between wallets", async ({ request }) => {
    const fromId = `api_from_${Date.now()}`;
    const toId = `api_to_${Date.now()}`;

    await request.post("/api/wallet/create", { data: { userId: fromId, userName: "Sender" } });
    await request.post("/api/wallet/create", { data: { userId: toId, userName: "Receiver" } });
    await request.post(`/api/wallet/${fromId}/topup`, { data: { amount: 1000 } });

    const response = await request.post("/api/wallet/transfer", {
      data: { fromUserId: fromId, toUserId: toId, amount: 200 },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.amount).toBe(200);
    expect(body.status).toBe("completed");
  });

  test("POST /api/wallet/transfer returns 400 for insufficient balance", async ({ request }) => {
    const fromId = `api_insuf_${Date.now()}`;
    const toId = `api_recv2_${Date.now()}`;

    await request.post("/api/wallet/create", { data: { userId: fromId, userName: "Broke Sender" } });
    await request.post("/api/wallet/create", { data: { userId: toId, userName: "Receiver 2" } });
    // No topup, balance is 0

    const response = await request.post("/api/wallet/transfer", {
      data: { fromUserId: fromId, toUserId: toId, amount: 9999 },
    });
    expect(response.status()).toBe(400);
  });

  test("GET /api/wallet/:userId/transactions returns transaction array", async ({ request }) => {
    const uid = `api_txs_${Date.now()}`;
    await request.post("/api/wallet/create", { data: { userId: uid, userName: "TX Lister" } });

    const response = await request.get(`/api/wallet/${uid}/transactions`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
  });
});

test.describe("API: Market", () => {
  test("GET /api/market/items returns an array", async ({ request }) => {
    const response = await request.get("/api/market/items");
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
  });

  test("POST /api/market/items lists a new stamp", async ({ request }) => {
    const uid = `seller_api_${Date.now()}`;
    await request.post("/api/wallet/create", { data: { userId: uid, userName: "API Seller" } });

    const response = await request.post("/api/market/items", {
      data: {
        sellerId: uid,
        name: "API Test Stamp",
        description: "Listed via API test",
        price: 50,
        type: "stamp",
      },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.name).toBe("API Test Stamp");
    expect(body.sellerId).toBe(uid);
    expect(body.status).toBe("available");
  });

  test("POST /api/market/items returns 400 when sellerId is missing", async ({ request }) => {
    const response = await request.post("/api/market/items", {
      data: { name: "No Seller Stamp" },
    });
    expect(response.status()).toBe(400);
  });

  test("GET /api/market/items/:itemId retrieves a specific item", async ({ request }) => {
    const uid = `seller_get_${Date.now()}`;
    await request.post("/api/wallet/create", { data: { userId: uid, userName: "Get Seller" } });

    const listRes = await request.post("/api/market/items", {
      data: { sellerId: uid, name: "Get Test Stamp", price: 10 },
    });
    const listed = await listRes.json();

    const response = await request.get(`/api/market/items/${listed.id}`);
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.id).toBe(listed.id);
    expect(body.name).toBe("Get Test Stamp");
  });

  test("DELETE /api/market/items/:itemId removes an item", async ({ request }) => {
    const uid = `seller_del_${Date.now()}`;
    await request.post("/api/wallet/create", { data: { userId: uid, userName: "Del Seller" } });

    const listRes = await request.post("/api/market/items", {
      data: { sellerId: uid, name: "To Delete Stamp", price: 0 },
    });
    const listed = await listRes.json();

    const response = await request.delete(`/api/market/items/${listed.id}`, {
      data: { userId: uid },
    });
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.success).toBe(true);
  });

  test("GET /api/market/items supports status filter", async ({ request }) => {
    const response = await request.get("/api/market/items?status=available");
    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(Array.isArray(body)).toBe(true);
    // All returned items should be available
    body.forEach((item: { status: string }) => {
      expect(item.status).toBe("available");
    });
  });
});

test.describe("API: Sync", () => {
  test("GET /sync returns todos array (no auth token configured)", async ({ request }) => {
    const response = await request.get("/sync");
    // In dev mode with no SYNC_TOKEN, should succeed with 200
    // In production mode with SYNC_TOKEN set, expect 401
    expect([200, 401]).toContain(response.status());
    if (response.status() === 200) {
      const body = await response.json();
      expect(body).toHaveProperty("todos");
      expect(Array.isArray(body.todos)).toBe(true);
    }
  });
});
