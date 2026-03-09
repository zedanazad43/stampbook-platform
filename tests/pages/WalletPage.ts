import { type Locator, type Page } from "@playwright/test";

/**
 * Page Object Model for the Wallet section of the Stampcoin Platform SPA.
 * Encapsulates selectors and actions for creating/loading wallets,
 * sending STP, and viewing transaction history.
 */
export class WalletPage {
  readonly page: Page;

  // Tabs
  readonly createTab: Locator;
  readonly loadTab: Locator;

  // Create wallet form
  readonly createPanel: Locator;
  readonly userIdInput: Locator;
  readonly userNameInput: Locator;
  readonly createButton: Locator;

  // Load wallet form
  readonly loadPanel: Locator;
  readonly loadUserIdInput: Locator;
  readonly loadButton: Locator;

  // Wallet display
  readonly walletDisplay: Locator;
  readonly walletName: Locator;
  readonly walletId: Locator;
  readonly walletBalance: Locator;
  readonly topupButton: Locator;
  readonly refreshButton: Locator;

  // Send STP form
  readonly sendToInput: Locator;
  readonly sendAmountInput: Locator;
  readonly sendButton: Locator;

  // Stamps and transactions
  readonly stampsContainer: Locator;
  readonly transactionsContainer: Locator;

  constructor(page: Page) {
    this.page = page;

    this.createTab = page.locator("#wtab-create");
    this.loadTab = page.locator("#wtab-load");

    this.createPanel = page.locator("#wallet-create-panel");
    this.userIdInput = page.locator("#cw-userId");
    this.userNameInput = page.locator("#cw-userName");
    this.createButton = page.locator("#btn-create-wallet");

    this.loadPanel = page.locator("#wallet-load-panel");
    this.loadUserIdInput = page.locator("#lw-userId");
    this.loadButton = page.locator("#btn-load-wallet");

    this.walletDisplay = page.locator("#wallet-display");
    this.walletName = page.locator("#wd-name");
    this.walletId = page.locator("#wd-id");
    this.walletBalance = page.locator("#wd-balance");
    this.topupButton = page.locator("#btn-topup");
    this.refreshButton = page.locator("#btn-refresh");

    this.sendToInput = page.locator("#send-to");
    this.sendAmountInput = page.locator("#send-amount");
    this.sendButton = page.locator("#btn-send");

    this.stampsContainer = page.locator("#wd-stamps");
    this.transactionsContainer = page.locator("#wd-txs");
  }

  async navigate() {
    await this.page.locator("#nav-wallet").click();
    await this.page.waitForSelector("#sec-wallet.active");
  }

  async createWallet(userId: string, userName: string) {
    await this.createTab.click();
    await this.userIdInput.fill(userId);
    await this.userNameInput.fill(userName);
    const [response] = await Promise.all([
      this.page.waitForResponse(
        (resp) => resp.url().includes("/api/wallet/create") && resp.status() === 200
      ),
      this.createButton.click(),
    ]);
    if (!response.ok()) {
      throw new Error(`Wallet creation failed: ${await response.text()}`);
    }
    await this.walletDisplay.waitFor({ state: "visible" });
  }

  async loadWallet(userId: string) {
    await this.loadTab.click();
    await this.loadUserIdInput.fill(userId);
    await this.loadButton.click();
    await this.walletDisplay.waitFor({ state: "visible" });
  }

  async topup() {
    await Promise.all([
      this.page.waitForResponse(
        (resp) => resp.url().includes("/topup") && resp.status() === 200
      ),
      this.topupButton.click(),
    ]);
  }

  async sendSTP(recipientId: string, amount: number) {
    await this.sendToInput.fill(recipientId);
    await this.sendAmountInput.fill(String(amount));
    await this.sendButton.click();
  }
}
