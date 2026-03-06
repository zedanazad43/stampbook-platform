import { test, expect } from "@playwright/test";
import { HomePage } from "./pages/HomePage";

/**
 * Homepage tests for the Stampcoin Platform.
 * Validates navigation structure, hero content, and feature cards.
 */
test.describe("Homepage", () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test("loads successfully and displays the hero section", async ({ page }) => {
    await expect(page).toHaveTitle(/StampCoin/i);
    await expect(homePage.heroTitle).toBeVisible();
    await expect(homePage.heroSubtitle).toBeVisible();
  });

  test("hero CTA button is visible and clickable", async ({ page }) => {
    await expect(homePage.heroCtaButton).toBeVisible();
    await homePage.heroCtaButton.click();
    // Clicking 'Get Started' should navigate to the wallet section
    await expect(page.locator("#sec-wallet")).toHaveClass(/active/);
  });

  test("navigation bar contains all expected links", async () => {
    await expect(homePage.navHome).toBeVisible();
    await expect(homePage.navWallet).toBeVisible();
    await expect(homePage.navMarket).toBeVisible();
    await expect(homePage.navExchange).toBeVisible();
    await expect(homePage.navToken).toBeVisible();
  });

  test("navigates to Wallet section via nav link", async ({ page }) => {
    await homePage.navigateToSection("wallet");
    await expect(page.locator("#sec-wallet")).toHaveClass(/active/);
    await expect(page.locator("#sec-home")).not.toHaveClass(/active/);
  });

  test("navigates to Market section via nav link", async ({ page }) => {
    await homePage.navigateToSection("market");
    await expect(page.locator("#sec-market")).toHaveClass(/active/);
  });

  test("navigates to Exchange section via nav link", async ({ page }) => {
    await homePage.navigateToSection("exchange");
    await expect(page.locator("#sec-exchange")).toHaveClass(/active/);
  });

  test("navigates to Token section via nav link", async ({ page }) => {
    await homePage.navigateToSection("token");
    await expect(page.locator("#sec-token")).toHaveClass(/active/);
  });

  test("displays feature cards for core platform features", async () => {
    await expect(homePage.featureDigitalWallet).toBeVisible();
    await expect(homePage.featureMarketplace).toBeVisible();
  });

  test("language selector is visible", async ({ page }) => {
    await expect(page.locator("#lang-select")).toBeVisible();
  });
});
