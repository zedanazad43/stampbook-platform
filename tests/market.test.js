"use strict";

/**
 * Tests for the market module.
 * File system is mocked so tests run without touching disk.
 */

let mockMarketStore;

jest.mock("fs", () => ({
  existsSync: jest.fn().mockImplementation((filePath) => {
    // Simulate the market data file always existing after first write
    return String(filePath).includes("market-data") ? !!mockMarketStore : false;
  }),
  readFileSync: jest.fn().mockImplementation((filePath) => {
    if (String(filePath).includes("market-data")) {
      return JSON.stringify(mockMarketStore || { items: [], transactions: [] });
    }
    return "{}";
  }),
  writeFileSync: jest.fn().mockImplementation((filePath, data) => {
    if (String(filePath).includes("market-data")) {
      mockMarketStore = JSON.parse(data);
    }
  }),
}));

describe("market module", () => {
  let market;

  beforeEach(() => {
    mockMarketStore = { items: [], transactions: [] };
    jest.resetModules();
    market = require("../market");
  });

  // --- addMarketItem ---
  describe("addMarketItem", () => {
    test("adds an item with required fields", () => {
      const item = market.addMarketItem("seller1", { name: "Blue Penny", price: 100 });
      expect(item.id).toBeDefined();
      expect(item.sellerId).toBe("seller1");
      expect(item.name).toBe("Blue Penny");
      expect(item.price).toBe(100);
      expect(item.status).toBe("available");
    });

    test("defaults missing optional fields", () => {
      const item = market.addMarketItem("seller1", { name: "Test Stamp", price: 10 });
      expect(item.description).toBe("");
      expect(item.price).toBe(10);
      expect(item.type).toBe("stamp");
      expect(item.imageUrl).toBe("");
    });

    test("throws when sellerId is missing", () => {
      expect(() => market.addMarketItem(null, { name: "x" })).toThrow();
    });

    test("throws when item name is missing", () => {
      expect(() => market.addMarketItem("seller1", {})).toThrow();
    });

    test("throws when listing contains contact info before purchase", () => {
      expect(() => market.addMarketItem("seller1", {
        name: "Rare stamp",
        description: "Contact me on whatsapp +971501234567"
      })).toThrow("not allowed before purchase");
    });

    test("throws when price is zero or negative", () => {
      expect(() => market.addMarketItem("seller1", { name: "Stamp", price: 0 })).toThrow("positive number");
      expect(() => market.addMarketItem("seller1", { name: "Stamp", price: -10 })).toThrow("positive number");
    });
  });

  // --- getAllMarketItems ---
  describe("getAllMarketItems", () => {
    beforeEach(() => {
      market.addMarketItem("s1", { name: "Stamp A", type: "stamp", price: 50 });
      market.addMarketItem("s2", { name: "Coin B", type: "coin", price: 200 });
    });

    test("returns all items with no filter", () => {
      const items = market.getAllMarketItems();
      expect(items.length).toBe(2);
    });

    test("filters by type", () => {
      const items = market.getAllMarketItems({ type: "coin" });
      expect(items.length).toBe(1);
      expect(items[0].name).toBe("Coin B");
    });

    test("filters by status", () => {
      const allItems = market.getAllMarketItems();
      const id = allItems[0].id;
      // purchase to mark as sold (no wallet check inside market module)
      market.purchaseMarketItem(id, "buyer1");
      const available = market.getAllMarketItems({ status: "available" });
      expect(available.length).toBe(1);
    });
  });

  // --- getMarketItem ---
  describe("getMarketItem", () => {
    test("returns item by id", () => {
      const created = market.addMarketItem("s1", { name: "Stamp X", price: 20 });
      const fetched = market.getMarketItem(created.id);
      expect(fetched.name).toBe("Stamp X");
    });

    test("throws for unknown id", () => {
      expect(() => market.getMarketItem("nonexistent-id")).toThrow("Market item not found");
    });

    test("does not expose private seller contact details", () => {
      const created = market.addMarketItem("s1", {
        name: "Stamp X",
        price: 50,
        sellerContact: { email: "seller@example.com", phone: "+971501234567" }
      });
      const fetched = market.getMarketItem(created.id);
      expect(fetched.sellerContactPrivate).toBeUndefined();
    });
  });

  // --- updateMarketItem ---
  describe("updateMarketItem", () => {
    test("updates allowed fields", () => {
      const item = market.addMarketItem("s1", { name: "Old Name", price: 10 });
      const updated = market.updateMarketItem(item.id, { price: 99, description: "Updated" });
      expect(updated.price).toBe(99);
      expect(updated.description).toBe("Updated");
    });

    test("throws for unknown id", () => {
      expect(() => market.updateMarketItem("bad-id", { price: 1 })).toThrow("Market item not found");
    });
  });

  // --- purchaseMarketItem ---
  describe("purchaseMarketItem", () => {
    test("marks item as sold and records transaction", () => {
      const item = market.addMarketItem("seller1", { name: "Stamp", price: 50 });
      const result = market.purchaseMarketItem(item.id, "buyer1");
      expect(result.transaction.buyerId).toBe("buyer1");
      expect(result.transaction.sellerId).toBe("seller1");
      expect(result.transaction.price).toBe(50);
      // Item should now be sold
      expect(() => market.purchaseMarketItem(item.id, "buyer2")).toThrow("not available");
    });

    test("throws when buyer is the seller", () => {
      const item = market.addMarketItem("user1", { name: "Stamp", price: 10 });
      expect(() => market.purchaseMarketItem(item.id, "user1")).toThrow("Cannot purchase your own item");
    });

    test("records fee metadata and keeps contacts private in transaction output", () => {
      const item = market.addMarketItem("seller1", {
        name: "Stamp",
        price: 100,
        sellerContact: { email: "seller@example.com", addressLine1: "Hidden Street" }
      });

      const result = market.purchaseMarketItem(item.id, "buyer1", {
        platformFee: 5,
        sellerProceeds: 95,
        feeCurrency: "STP",
        buyerContact: { email: "buyer@example.com", phone: "+971501111111" }
      });

      expect(result.transaction.platformFee).toBe(5);
      expect(result.transaction.sellerProceeds).toBe(95);
      expect(result.transaction.feeCurrency).toBe("STP");
      expect(result.transaction.sellerContactPrivate).toBeUndefined();
      expect(result.transaction.buyerContactPrivate).toBeUndefined();
    });
  });

  // --- removeMarketItem ---
  describe("removeMarketItem", () => {
    test("removes item when called by the seller", () => {
      const item = market.addMarketItem("seller1", { name: "Stamp", price: 10 });
      const result = market.removeMarketItem(item.id, "seller1");
      expect(result.success).toBe(true);
      expect(market.getAllMarketItems().length).toBe(0);
    });

    test("throws when called by non-seller", () => {
      const item = market.addMarketItem("seller1", { name: "Stamp", price: 10 });
      expect(() => market.removeMarketItem(item.id, "hacker")).toThrow("Only the seller");
    });

    test("throws for unknown item", () => {
      expect(() => market.removeMarketItem("bad-id", "s1")).toThrow("Market item not found");
    });
  });

  // --- getMarketTransactions ---
  describe("getMarketTransactions", () => {
    test("returns all transactions without filter", () => {
      const item = market.addMarketItem("seller1", { name: "Stamp", price: 10 });
      market.purchaseMarketItem(item.id, "buyer1");
      const txns = market.getMarketTransactions();
      expect(txns.length).toBe(1);
    });

    test("filters by buyerId", () => {
      const item1 = market.addMarketItem("seller1", { name: "Stamp 1", price: 10 });
      const item2 = market.addMarketItem("seller1", { name: "Stamp 2", price: 20 });
      market.purchaseMarketItem(item1.id, "buyer1");
      market.purchaseMarketItem(item2.id, "buyer2");
      const txns = market.getMarketTransactions({ buyerId: "buyer1" });
      expect(txns.length).toBe(1);
      expect(txns[0].buyerId).toBe("buyer1");
    });
  });

  // --- getTransactionContactExchange ---
  describe("getTransactionContactExchange", () => {
    test("returns private contact details only for buyer/seller", () => {
      const item = market.addMarketItem("seller1", {
        name: "Stamp",
        price: 100,
        sellerContact: { email: "seller@example.com" }
      });

      const result = market.purchaseMarketItem(item.id, "buyer1", {
        buyerContact: { email: "buyer@example.com" }
      });

      const byBuyer = market.getTransactionContactExchange(result.transaction.id, "buyer1");
      expect(byBuyer.sellerContact.email).toBe("seller@example.com");
      expect(byBuyer.buyerContact.email).toBe("buyer@example.com");

      expect(() => market.getTransactionContactExchange(result.transaction.id, "intruder")).toThrow("Only the buyer or seller");
    });
  });
});
