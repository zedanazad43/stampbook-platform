import { test, expect } from "@playwright/test";
import { MarketPage } from "./pages/MarketPage";

/**
 * Market section tests for the Stampcoin Platform.
 * Tests marketplace listing, filtering, and item display.
 */
test.describe("Market Section", () => {
  let marketPage: MarketPage;

  test.beforeEach(async ({ page }) => {
    marketPage = new MarketPage(page);
    await page.goto("/");
    await marketPage.navigate();
  });

  test("displays the market section title", async () => {
    await expect(marketPage.marketTitle).toBeVisible();
    await expect(marketPage.marketTitle).toContainText("Marketplace");
  });

  test("shows the List a Stamp button", async () => {
    await expect(marketPage.listStampButton).toBeVisible();
  });

  test("opens the listing form when List a Stamp is clicked", async () => {
    await marketPage.openListForm();
    await expect(marketPage.listForm).toBeVisible();
    await expect(marketPage.stampNameInput).toBeVisible();
    await expect(marketPage.stampPriceInput).toBeVisible();
    await expect(marketPage.sellerIdInput).toBeVisible();
  });

  test("listing form can be toggled open and closed", async ({ page }) => {
    await marketPage.openListForm();
    await expect(marketPage.listForm).toBeVisible();

    // Click again to toggle it closed
    await marketPage.listStampButton.click();
    await expect(marketPage.listForm).toBeHidden();
  });

  test("all filter buttons are visible", async () => {
    await expect(marketPage.filterAll).toBeVisible();
    await expect(marketPage.filterAvailable).toBeVisible();
    await expect(marketPage.filterSold).toBeVisible();
  });

  test("market grid container is visible", async () => {
    await expect(marketPage.marketGrid).toBeVisible();
  });

  test("lists a stamp and it appears in the market grid", async ({ page }) => {
    const uid = `seller_${Date.now()}`;
    // Create a wallet for the seller via API
    await page.request.post("/api/wallet/create", {
      data: { userId: uid, userName: "Market Seller" },
    });

    const stampName = `Rare Stamp ${Date.now()}`;
    await marketPage.listStamp(stampName, 100, "A rare digital stamp", uid);

    // Wait for the item to appear in the grid
    await expect(
      page.locator("#market-grid").getByText(stampName)
    ).toBeVisible({ timeout: 10000 });
  });

  test("available filter shows available items", async ({ page }) => {
    await marketPage.applyFilter("available");
    await expect(marketPage.filterAvailable).toHaveClass(/active/);
  });

  test("sold filter button can be activated", async ({ page }) => {
    await marketPage.applyFilter("sold");
    await expect(marketPage.filterSold).toHaveClass(/active/);
  });

  test("all filter button returns to default view", async ({ page }) => {
    await marketPage.applyFilter("available");
    await marketPage.applyFilter("all");
    await expect(marketPage.filterAll).toHaveClass(/active/);
  });
});
