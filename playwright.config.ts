import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright configuration for the Stampcoin Platform test suite.
 * - Cross-browser testing: Chromium, Firefox, WebKit
 * - Headless mode for CI/CD
 * - Screenshots on failure
 * - Parallel execution
 * See https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.spec.ts",

  /* Run tests in parallel */
  fullyParallel: true,

  /* Fail the build on CI if test.only is left in the source */
  forbidOnly: !!process.env.CI,

  /* Retry failed tests once on CI */
  retries: process.env.CI ? 1 : 0,

  /* Use more workers locally, fewer in CI to avoid resource contention */
  workers: process.env.CI ? 2 : undefined,

  /* Reporter: HTML by default, line reporter in CI */
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],

  /* Shared settings for all tests */
  use: {
    /* Base URL for the local dev server */
    baseURL: "http://localhost:8080",

    /* Headless mode (always headless in CI) */
    headless: true,

    /* Collect traces and screenshots on failure for debugging */
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    trace: "on-first-retry",
  },

  /* Configure cross-browser projects */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
  ],

  /* Start the local server before running tests */
  webServer: {
    command: "node server.js",
    url: "http://localhost:8080",
    reuseExistingServer: !process.env.CI,
    timeout: 15000,
  },
});
