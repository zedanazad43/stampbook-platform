import { type Locator, type Page } from "@playwright/test";

/**
 * Page Object Model for the Stampcoin Platform homepage (sec-home section).
 * Encapsulates selectors and actions for the home section of the SPA.
 */
export class HomePage {
  readonly page: Page;

  readonly navHome: Locator;
  readonly navWallet: Locator;
  readonly navMarket: Locator;
  readonly navExchange: Locator;
  readonly navToken: Locator;

  readonly heroTitle: Locator;
  readonly heroSubtitle: Locator;
  readonly heroCtaButton: Locator;

  readonly statUsers: Locator;
  readonly statStamps: Locator;
  readonly statVolume: Locator;

  readonly featureDigitalWallet: Locator;
  readonly featureMarketplace: Locator;

  constructor(page: Page) {
    this.page = page;

    this.navHome = page.locator("#nav-home");
    this.navWallet = page.locator("#nav-wallet");
    this.navMarket = page.locator("#nav-market");
    this.navExchange = page.locator("#nav-exchange");
    this.navToken = page.locator("#nav-token");

    this.heroTitle = page.locator("#hero-title");
    this.heroSubtitle = page.locator("#hero-sub");
    this.heroCtaButton = page.locator("#hero-cta");

    this.statUsers = page.locator("#stat-users");
    this.statStamps = page.locator("#stat-stamps");
    this.statVolume = page.locator("#stat-vol");

    this.featureDigitalWallet = page.locator("#feat1-title");
    this.featureMarketplace = page.locator("#feat2-title");
  }

  async goto() {
    await this.page.goto("/");
  }

  async navigateToSection(section: "wallet" | "market" | "exchange" | "token") {
    const navMap = {
      wallet: this.navWallet,
      market: this.navMarket,
      exchange: this.navExchange,
      token: this.navToken,
    };
    await navMap[section].click();
    await this.page.waitForSelector(`#sec-${section}.active`);
  }
}
