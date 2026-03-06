"use strict";

/**
 * Tests for the wallet module.
 * File system is mocked so tests run without touching disk.
 */

let mockWalletStore;
let mockTxStore;

jest.mock("fs", () => ({
  existsSync: jest.fn().mockReturnValue(true),
  readFileSync: jest.fn().mockImplementation((filePath) => {
    const p = String(filePath);
    if (p.includes("wallets")) return JSON.stringify(mockWalletStore);
    if (p.includes("transactions")) return JSON.stringify(mockTxStore);
    return "{}";
  }),
  writeFileSync: jest.fn().mockImplementation((filePath, data) => {
    const p = String(filePath);
    if (p.includes("wallets")) mockWalletStore = JSON.parse(data);
    if (p.includes("transactions")) mockTxStore = JSON.parse(data);
  }),
}));

describe("wallet module", () => {
  let wallet;

  beforeEach(() => {
    mockWalletStore = {};
    mockTxStore = [];
    jest.resetModules();
    // Re-require after resetting modules so initializeStorage runs fresh
    wallet = require("../wallet");
  });

  // --- createWallet ---
  describe("createWallet", () => {
    test("creates a wallet with correct initial state", () => {
      const w = wallet.createWallet("user1", "Alice");
      expect(w.userId).toBe("user1");
      expect(w.userName).toBe("Alice");
      expect(w.balance).toBe(0);
      expect(Array.isArray(w.stamps)).toBe(true);
      expect(w.stamps.length).toBe(0);
    });

    test("throws if wallet already exists", () => {
      wallet.createWallet("user1", "Alice");
      expect(() => wallet.createWallet("user1", "Alice Again")).toThrow("Wallet already exists");
    });

    test("throws on invalid userId", () => {
      expect(() => wallet.createWallet("__proto__", "x")).toThrow("Invalid userId");
      expect(() => wallet.createWallet("", "x")).toThrow("Invalid userId");
      expect(() => wallet.createWallet(123, "x")).toThrow("Invalid userId");
    });

    test("throws on invalid userName", () => {
      expect(() => wallet.createWallet("user1", "")).toThrow("Invalid userName");
      expect(() => wallet.createWallet("user1", 42)).toThrow("Invalid userName");
    });
  });

  // --- getWallet ---
  describe("getWallet", () => {
    test("returns existing wallet", () => {
      wallet.createWallet("user1", "Alice");
      const w = wallet.getWallet("user1");
      expect(w).not.toBeNull();
      expect(w.userId).toBe("user1");
    });

    test("returns null for unknown user", () => {
      expect(wallet.getWallet("nobody")).toBeNull();
    });

    test("throws on invalid userId", () => {
      expect(() => wallet.getWallet("constructor")).toThrow("Invalid userId");
    });
  });

  // --- updateBalance ---
  describe("updateBalance", () => {
    test("increases balance", () => {
      wallet.createWallet("user1", "Alice");
      const w = wallet.updateBalance("user1", 500);
      expect(w.balance).toBe(500);
    });

    test("decreases balance", () => {
      wallet.createWallet("user1", "Alice");
      wallet.updateBalance("user1", 500);
      const w = wallet.updateBalance("user1", -200);
      expect(w.balance).toBe(300);
    });

    test("throws on insufficient balance", () => {
      wallet.createWallet("user1", "Alice");
      expect(() => wallet.updateBalance("user1", -1)).toThrow("Insufficient balance");
    });

    test("throws for unknown user", () => {
      expect(() => wallet.updateBalance("nobody", 100)).toThrow("Wallet not found");
    });

    test("throws on invalid userId", () => {
      expect(() => wallet.updateBalance("prototype", 100)).toThrow("Invalid userId");
    });
  });

  // --- transfer ---
  describe("transfer", () => {
    beforeEach(() => {
      wallet.createWallet("alice", "Alice");
      wallet.createWallet("bob", "Bob");
      wallet.updateBalance("alice", 1000);
    });

    test("transfers balance between wallets", () => {
      const tx = wallet.transfer("alice", "bob", 300);
      expect(tx.from).toBe("alice");
      expect(tx.to).toBe("bob");
      expect(tx.amount).toBe(300);
      expect(tx.status).toBe("completed");
      expect(wallet.getWallet("alice").balance).toBe(700);
      expect(wallet.getWallet("bob").balance).toBe(300);
    });

    test("throws on insufficient balance", () => {
      expect(() => wallet.transfer("alice", "bob", 9999)).toThrow("Insufficient balance");
    });

    test("throws when wallets do not exist", () => {
      expect(() => wallet.transfer("alice", "ghost", 10)).toThrow("One or both wallets not found");
    });

    test("throws on non-positive amount without stampId", () => {
      expect(() => wallet.transfer("alice", "bob", 0)).toThrow();
      expect(() => wallet.transfer("alice", "bob", -5)).toThrow();
    });

    test("throws on invalid userId", () => {
      expect(() => wallet.transfer("__proto__", "bob", 10)).toThrow("Invalid userId");
      expect(() => wallet.transfer("alice", "__proto__", 10)).toThrow("Invalid userId");
    });

    test("records transaction in history", () => {
      wallet.transfer("alice", "bob", 100);
      const history = wallet.getTransactionHistory("alice");
      expect(history.length).toBe(1);
      expect(history[0].amount).toBe(100);
    });
  });

  // --- addStamp ---
  describe("addStamp", () => {
    test("adds a stamp to wallet", () => {
      wallet.createWallet("user1", "Alice");
      const w = wallet.addStamp("user1", { name: "Rare Stamp", year: 1920 });
      expect(w.stamps.length).toBe(1);
      expect(w.stamps[0].name).toBe("Rare Stamp");
      expect(w.stamps[0].id).toBeDefined();
    });

    test("throws for unknown user", () => {
      expect(() => wallet.addStamp("nobody", { name: "x" })).toThrow("Wallet not found");
    });

    test("throws on invalid userId", () => {
      expect(() => wallet.addStamp("constructor", { name: "x" })).toThrow("Invalid userId");
    });
  });

  // --- getTransactionHistory ---
  describe("getTransactionHistory", () => {
    test("returns only transactions involving the user", () => {
      wallet.createWallet("alice", "Alice");
      wallet.createWallet("bob", "Bob");
      wallet.createWallet("carol", "Carol");
      wallet.updateBalance("alice", 500);
      wallet.updateBalance("bob", 500);
      wallet.transfer("alice", "bob", 100);
      wallet.transfer("bob", "carol", 50);
      const aliceHistory = wallet.getTransactionHistory("alice");
      expect(aliceHistory.length).toBe(1);
    });

    test("throws on invalid userId", () => {
      expect(() => wallet.getTransactionHistory("")).toThrow("Invalid userId");
    });
  });
});
