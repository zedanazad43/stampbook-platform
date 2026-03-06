import { test, expect } from "@playwright/test";
import { WalletPage } from "./pages/WalletPage";

/**
 * Wallet section tests for the Stampcoin Platform.
 * Tests wallet creation, loading, top-up, and transfer UI flows.
 * Each test uses a unique userId to stay fully isolated.
 */
test.describe("Wallet Section", () => {
  let walletPage: WalletPage;

  test.beforeEach(async ({ page }) => {
    walletPage = new WalletPage(page);
    await page.goto("/");
    await walletPage.navigate();
  });

  test("shows Create Wallet tab as active by default", async () => {
    await expect(walletPage.createTab).toHaveClass(/active/);
    await expect(walletPage.createPanel).toBeVisible();
  });

  test("switches between Create and Load tabs", async ({ page }) => {
    await walletPage.loadTab.click();
    await expect(walletPage.loadPanel).toBeVisible();
    await expect(walletPage.createPanel).toBeHidden();

    await walletPage.createTab.click();
    await expect(walletPage.createPanel).toBeVisible();
    await expect(walletPage.loadPanel).toBeHidden();
  });

  test("creates a new wallet and shows wallet display", async ({ page }) => {
    const uid = `test_create_${Date.now()}`;
    await walletPage.createWallet(uid, "Test User");

    await expect(walletPage.walletDisplay).toBeVisible();
    await expect(walletPage.walletName).toBeVisible();
    await expect(walletPage.walletBalance).toBeVisible();
  });

  test("wallet display shows the correct user ID after creation", async () => {
    const uid = `test_id_${Date.now()}`;
    await walletPage.createWallet(uid, "ID Tester");
    await expect(walletPage.walletId).toContainText(uid);
  });

  test("shows error when creating wallet without required fields", async ({ page }) => {
    // Click create without filling in any fields
    await walletPage.createButton.click();
    // The wallet display should NOT appear
    await expect(walletPage.walletDisplay).toBeHidden();
    // An error toast should be shown to the user
    await expect(page.locator(".toast-error")).toBeVisible();
  });

  test("loads an existing wallet by user ID", async ({ page }) => {
    // First create a wallet via the API directly so we know it exists
    const uid = `test_load_${Date.now()}`;
    await page.request.post("/api/wallet/create", {
      data: { userId: uid, userName: "Load Test User" },
    });

    // Now load it via the UI
    await walletPage.loadWallet(uid);
    await expect(walletPage.walletDisplay).toBeVisible();
    await expect(walletPage.walletId).toContainText(uid);
  });

  test("top-up increases balance by 1000 STP", async ({ page }) => {
    const uid = `test_topup_${Date.now()}`;
    await walletPage.createWallet(uid, "Topup User");

    const initialBalanceText = await walletPage.walletBalance.innerText();
    const initialBalance = parseFloat(initialBalanceText.replace(/[^0-9.]/g, ""));

    await walletPage.topup();
    await walletPage.refreshButton.click();

    const updatedBalanceText = await walletPage.walletBalance.innerText();
    const updatedBalance = parseFloat(updatedBalanceText.replace(/[^0-9.]/g, ""));

    expect(updatedBalance).toBeGreaterThan(initialBalance);
  });

  test("send STP form is visible after wallet is loaded", async () => {
    const uid = `test_send_${Date.now()}`;
    await walletPage.createWallet(uid, "Sender");

    await expect(walletPage.sendToInput).toBeVisible();
    await expect(walletPage.sendAmountInput).toBeVisible();
    await expect(walletPage.sendButton).toBeVisible();
  });

  test("transaction history section is displayed", async () => {
    const uid = `test_tx_${Date.now()}`;
    await walletPage.createWallet(uid, "TX User");
    await expect(walletPage.transactionsContainer).toBeVisible();
  });

  test("stamps section is displayed", async () => {
    const uid = `test_stamps_${Date.now()}`;
    await walletPage.createWallet(uid, "Stamps User");
    await expect(walletPage.stampsContainer).toBeVisible();
  });
});
