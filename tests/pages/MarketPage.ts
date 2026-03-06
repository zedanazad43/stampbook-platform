import { type Locator, type Page } from "@playwright/test";

/**
 * Page Object Model for the Market section of the Stampcoin Platform SPA.
 * Encapsulates selectors and actions for listing stamps, viewing the
 * marketplace grid, and filtering items.
 */
export class MarketPage {
  readonly page: Page;

  readonly marketTitle: Locator;
  readonly listStampButton: Locator;

  // List stamp form
  readonly listForm: Locator;
  readonly stampNameInput: Locator;
  readonly stampPriceInput: Locator;
  readonly stampDescInput: Locator;
  readonly sellerIdInput: Locator;
  readonly listButton: Locator;

  // Filter buttons
  readonly filterAll: Locator;
  readonly filterAvailable: Locator;
  readonly filterSold: Locator;

  // Market grid
  readonly marketGrid: Locator;

  constructor(page: Page) {
    this.page = page;

    this.marketTitle = page.locator("#market-title");
    this.listStampButton = page.locator("#btn-list-stamp");

    this.listForm = page.locator("#list-form");
    this.stampNameInput = page.locator("#li-name");
    this.stampPriceInput = page.locator("#li-price");
    this.stampDescInput = page.locator("#li-desc");
    this.sellerIdInput = page.locator("#li-seller");
    this.listButton = page.locator("#btn-do-list");

    this.filterAll = page.locator("#filt-all");
    this.filterAvailable = page.locator("#filt-avail");
    this.filterSold = page.locator("#filt-sold");

    this.marketGrid = page.locator("#market-grid");
  }

  async navigate() {
    await this.page.locator("#nav-market").click();
    await this.page.waitForSelector("#sec-market.active");
  }

  async openListForm() {
    await this.listStampButton.click();
    await this.listForm.waitFor({ state: "visible" });
  }

  async listStamp(name: string, price: number, description: string, sellerId: string) {
    await this.openListForm();
    await this.stampNameInput.fill(name);
    await this.stampPriceInput.fill(String(price));
    await this.stampDescInput.fill(description);
    await this.sellerIdInput.fill(sellerId);
    // Wait for the POST to complete before returning; the UI will then refresh the grid
    const [response] = await Promise.all([
      this.page.waitForResponse(
        (resp) =>
          resp.url().includes("/api/market/items") &&
          resp.request().method() === "POST" &&
          resp.status() === 200
      ),
      this.listButton.click(),
    ]);
    if (!response.ok()) {
      throw new Error(`Stamp listing failed: ${await response.text()}`);
    }
  }

  async applyFilter(filter: "all" | "available" | "sold") {
    const filterMap = {
      all: this.filterAll,
      available: this.filterAvailable,
      sold: this.filterSold,
    };
    await filterMap[filter].click();
  }

  async getItemCount(): Promise<number> {
    return await this.page.locator("#market-grid .market-card").count();
  }
}
