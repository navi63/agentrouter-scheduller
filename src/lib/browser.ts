/**
 * Headless Browser Automation Service
 * Handles login/logout automation using Puppeteer
 */

import puppeteer, { Browser, Page } from "puppeteer";
import type { PrismaClient } from "@prisma/client";

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const CONFIG = {
  BASE_URL: "https://agentrouter.org",
  VIEWPORT: { width: 1920, height: 1080 },
  BUTTON_INDEX: 6, // "Continue with GitHub" button index
  TIMEOUTS: {
    NAVIGATION: 60000,
    CLICK: 10000,
    BUTTON_CLICK_NAVIGATION: 30000,
    PRE_REFRESH_DELAY: 1000,
    DEBUG_PAUSE: 60000,
  },
  BUTTON_TEXT: "Continue with GitHub",
} as const;

// ============================================================================
// LOGGING HELPERS
// ============================================================================

async function logStep(
  prisma: PrismaClient,
  logId: number,
  step: string,
  level: string,
  message: string,
  metadata?: Record<string, unknown>
) {
  await prisma.logEntry.create({
    data: {
      logId,
      step,
      level,
      message,
      metadata: metadata ? JSON.stringify(metadata, null, 2) : undefined,
    },
  });
}

async function logConsole(message: string, data?: unknown) {
  console.log(`[Browser] ${message}`, data ?? "");
}

// ============================================================================
// BROWSER MANAGEMENT
// ============================================================================

async function createBrowser(): Promise<Browser> {
  const showBrowser = process.env.SHOW_BROWSER === "true" || process.env.DEBUG_BROWSER === "true";
  const debugMode = process.env.DEBUG_BROWSER === "true";

  logConsole("Creating browser", {
    showBrowser,
    debugMode,
    mode: showBrowser ? "VISIBLE (non-headless)" : "HEADLESS",
  });

  return await puppeteer.launch({
    headless: !showBrowser,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--disable-gpu",
      debugMode ? "--auto-open-devtools-for-tabs" : "",
    ].filter(Boolean),
  });
}

async function setupPage(page: Page): Promise<void> {
  await page.setViewport(CONFIG.VIEWPORT);
  logConsole("Page configured", CONFIG.VIEWPORT);
}

async function pauseForDebugging(): Promise<void> {
  if (process.env.DEBUG_BROWSER === "true") {
    logConsole("Pausing for debugging inspection");
    await new Promise(resolve => setTimeout(resolve, CONFIG.TIMEOUTS.DEBUG_PAUSE));
  }
}

// ============================================================================
// COOKIE MANAGEMENT
// ============================================================================

interface CookieHeader {
  domain: string;
  cookieHeader: string;
}

async function setCookiesFromHeaders(
  page: Page,
  cookieHeaders: CookieHeader[]
): Promise<void> {
  const allCookies: Parameters<typeof page.setCookie>[0][] = [];

  for (const { domain, cookieHeader } of cookieHeaders) {
    if (!cookieHeader) continue;

    const cookiePairs = cookieHeader.split(";");
    for (const pair of cookiePairs) {
      const [name, value] = pair.trim().split("=");
      if (name && value) {
        allCookies.push({
          name,
          value,
          domain,
          path: "/",
          expires: -1,
          secure: true,
          sameSite: "Lax" as const,
          httpOnly: true,
        });
      }
    }
  }

  if (allCookies.length > 0) {
    await page.setCookie(...allCookies);
    logConsole(`Set ${allCookies.length} cookies`);
  }
}

async function getCookiesAsHeader(page: Page): Promise<string> {
  const cookies = await page.cookies();
  return cookies.map((c) => `${c.name}=${c.value}`).join("; ");
}

// ============================================================================
// NAVIGATION HELPERS
// ============================================================================

async function navigateTo(
  page: Page,
  path: string,
  description: string
): Promise<void> {
  const url = `${CONFIG.BASE_URL}${path}`;
  logConsole(`Navigating to ${description}`, url);

  await page.goto(url, {
    waitUntil: "networkidle2",
    timeout: CONFIG.TIMEOUTS.NAVIGATION,
  });

  logConsole(`${description} loaded`);
}

async function refreshPage(page: Page): Promise<void> {
  logConsole("Refreshing page");
  await page.reload({
    waitUntil: "networkidle2",
    timeout: CONFIG.TIMEOUTS.NAVIGATION,
  });
  logConsole("Page refreshed");
}

async function waitFor(ms: number): Promise<void> {
  logConsole(`Waiting ${ms}ms`);
  await new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// ELEMENT INTERACTION HELPERS
// ============================================================================

interface ButtonInfo {
  index: number;
  text: string;
  class: string;
  id: string;
  visible: boolean;
}

async function getAllButtons(page: Page): Promise<ButtonInfo[]> {
  return await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll("button"));
    return buttons.map((btn, idx) => ({
      index: idx,
      text: btn.textContent?.trim() || "(empty)",
      class: btn.className,
      id: btn.id,
      visible: window.getComputedStyle(btn).display !== "none",
    }));
  });
}

async function waitForNewPage(
  browser: Browser,
  currentPages: number,
  timeout: number = 30000
): Promise<Page> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    const pages = await browser.pages();
    if (pages.length > currentPages) {
      return pages[pages.length - 1];
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error("Timeout waiting for new page to open");
}

async function clickButtonByIndex(
  page: Page,
  index: number,
  description: string,
  waitForNav: boolean = true
): Promise<void> {
  logConsole(`Clicking button: ${description}`, `index=${index}`);

  const buttons = await page.$$("button");
  if (buttons.length <= index) {
    throw new Error(`Button at index ${index} not found. Total buttons: ${buttons.length}`);
  }

  await buttons[index].click();
  logConsole(`Button clicked successfully: ${description}`);

  if (waitForNav) {
    await page.waitForNavigation({
      waitUntil: "networkidle2",
      timeout: CONFIG.TIMEOUTS.BUTTON_CLICK_NAVIGATION,
    });
    logConsole("Navigation completed after button click");
  }
}

// ============================================================================
// DEBUGGING HELPERS
// ============================================================================

async function logPageInfo(page: Page, prisma: PrismaClient, logId: number): Promise<void> {
  const pageHTML = await page.content();
  await logStep(
    prisma,
    logId,
    "Page Info Retrieved",
    "INFO",
    `Page HTML: ${pageHTML.length} characters`
  );

  const buttonsInfo = await getAllButtons(page);
  logConsole("Buttons found", buttonsInfo);

  await logStep(
    prisma,
    logId,
    "Buttons Found",
    "INFO",
    `Found ${buttonsInfo.length} buttons`,
    { buttons: buttonsInfo }
  );
}

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

export async function executeLoginWithBrowser(
  agentRouterCookie: string,
  githubCookie: string,
  cookieId: number,
  prisma: PrismaClient,
  logId: number
): Promise<{
  success: boolean;
  message: string;
  data?: Record<string, unknown>;
}> {
  let browser: Browser | null = null;

  try {
    // Initialize
    await logStep(prisma, logId, "Starting", "INFO", "Launching browser");
    browser = await createBrowser();
    const page = await browser.newPage();

    // Set cookies
    await setCookiesFromHeaders(page, [
      { domain: "agentrouter.org", cookieHeader: agentRouterCookie },
      { domain: "github.com", cookieHeader: githubCookie },
    ]);
    await logStep(
      prisma,
      logId,
      "Cookies Set",
      "INFO",
      "Applied cookies for agentrouter.org and github.com"
    );

    // Navigate to login page
    await logStep(prisma, logId, "Navigating", "INFO", "Going to login page");
    await navigateTo(page, "/login", "Login page");
    await logStep(prisma, logId, "Login Page Loaded", "INFO", "Login page ready");

    // Refresh page to ensure elements render
    await waitFor(CONFIG.TIMEOUTS.PRE_REFRESH_DELAY);
    await refreshPage(page);
    await logStep(prisma, logId, "Page Refreshed", "INFO", "Page refreshed");

    // Debug: log page info
    await logPageInfo(page, prisma, logId);

    // Get current page count before clicking
    const initialPageCount = (await browser.pages()).length;

    // Click GitHub login button (opens new tab, so don't wait for navigation)
    await logStep(prisma, logId, "Clicking GitHub Button", "INFO", `Clicking button: ${CONFIG.BUTTON_TEXT}`);
    await clickButtonByIndex(page, CONFIG.BUTTON_INDEX, CONFIG.BUTTON_TEXT, false);
    await logStep(prisma, logId, "GitHub Button Clicked", "INFO", "GitHub button clicked");

    // Wait for GitHub OAuth page to open in new tab
    logConsole("Waiting for GitHub OAuth page to open...");
    const githubPage = await waitForNewPage(browser, initialPageCount);
    logConsole("GitHub OAuth page opened in new tab");

    // Wait 2 seconds for OAuth flow to complete
    await waitFor(2000);
    await logStep(prisma, logId, "Delay", "INFO", "Waited 2 seconds after GitHub OAuth opened");

    // Close the GitHub OAuth tab
    await githubPage.close();
    await logStep(prisma, logId, "GitHub Tab Closed", "INFO", "Closed GitHub OAuth tab");

    // Create new tab and navigate to console page
    const newPage = await browser.newPage();
    await setupPage(newPage);

    // Copy cookies from original page to new page
    const cookies = await page.cookies();
    await newPage.setCookie(...cookies);
    await logStep(prisma, logId, "Cookies Copied", "INFO", "Cookies copied to new tab");

    // Navigate to console in new tab
    await logStep(prisma, logId, "Navigating", "INFO", "Going to console page in new tab");
    await navigateTo(newPage, "/console", "Console page");
    await logStep(prisma, logId, "Console Page Loaded", "INFO", "Console page ready in new tab");

    // Scrape balance and consumption data
    const balanceData = await newPage.evaluate(() => {
      const getText = (label: string): string | null => {
        const elements = Array.from(document.querySelectorAll('*'));
        for (const el of elements) {
          if (el.textContent?.includes(label)) {
            const parent = el.parentElement;
            if (parent) {
              const valueText = parent.textContent?.replace(label, '').trim() || '';
              const match = valueText.match(/\$[\d,]+\.?\d*/);
              return match ? match[0] : null;
            }
          }
        }
        return null;
      };

      return {
        currentBalance: getText('Current balance'),
        consumption: getText('Consumption'),
      };
    });

    await logStep(prisma, logId, "Data Scraped", "INFO", "Balance and consumption data retrieved", balanceData);
    logConsole("Balance data scraped", balanceData);

    // Save or update account data in database
    if (balanceData.currentBalance || balanceData.consumption) {
      const previousAccountData = await prisma.accountData.findUnique({
        where: { cookieId },
      });

      const upsertResult = await prisma.accountData.upsert({
        where: { cookieId },
        create: {
          cookieId,
          currentBalance: balanceData.currentBalance,
          consumption: balanceData.consumption,
        },
        update: {
          currentBalance: balanceData.currentBalance,
          consumption: balanceData.consumption,
        },
      });

      // Check if balance increased and create redemption log
      if (previousAccountData?.currentBalance && balanceData.currentBalance) {
        const prevBalance = parseFloat(previousAccountData.currentBalance.replace(/[$,]/g, ''));
        const newBalance = parseFloat(balanceData.currentBalance.replace(/[$,]/g, ''));

        if (newBalance > prevBalance) {
          const nominal = (newBalance - prevBalance).toFixed(2);
          const auditableData = JSON.stringify({
            previousConsumption: previousAccountData.consumption,
            newConsumption: balanceData.consumption,
            scrapedAt: new Date().toISOString(),
          });

          await prisma.redemptionLog.create({
            data: {
              accountDataId: upsertResult.id,
              cookieId,
              nominal: `$${nominal}`,
              auditableData,
              previousBalance: previousAccountData.currentBalance,
              newBalance: balanceData.currentBalance,
            },
          });

          await logStep(
            prisma,
            logId,
            "Redemption Logged",
            "INFO",
            `Balance increased by $${nominal} from ${previousAccountData.currentBalance} to ${balanceData.currentBalance}`
          );
        }
      }

      await logStep(prisma, logId, "Account Data Saved", "INFO", "Balance and consumption saved to database");
    }

    // Debug pause
    await pauseForDebugging();

    const buttonsInfo = await getAllButtons(newPage);
    return {
      success: true,
      message: "Login flow completed successfully",
      data: {
        buttonsCount: buttonsInfo.length,
        balance: balanceData.currentBalance,
        consumption: balanceData.consumption,
      },
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    await logStep(prisma, logId, "Error", "ERROR", `Login failed: ${errorMsg}`);
    logConsole("Error occurred", errorMsg);

    return {
      success: false,
      message: `Login error: ${errorMsg}`,
    };
  } finally {
    if (browser) {
      await browser.close();
      await logStep(prisma, logId, "Browser Closed", "INFO", "Browser closed successfully");
      logConsole("Browser closed");
    }
  }
}

export async function executeLogoutWithBrowser(
  agentRouterCookie: string,
  githubCookie: string,
  prisma: PrismaClient,
  logId: number
): Promise<{
  success: boolean;
  message: string;
}> {
  let browser: Browser | null = null;

  try {
    // Initialize
    await logStep(prisma, logId, "Starting", "INFO", "Launching browser");
    browser = await createBrowser();
    const page = await browser.newPage();
    await setupPage(page);

    // Set cookies
    await setCookiesFromHeaders(page, [
      { domain: "agentrouter.org", cookieHeader: agentRouterCookie },
      { domain: "github.com", cookieHeader: githubCookie },
    ]);
    await logStep(prisma, logId, "Cookies Set", "INFO", "Applied cookies");

    // Verify session
    await logStep(prisma, logId, "Verifying Session", "INFO", "Checking session");
    const userData = await page.evaluate(async (baseUrl) => {
      try {
        const response = await fetch(`${baseUrl}/api/user/self`);
        const data = await response.json();
        return { success: data.success, status: response.status, data: data.data };
      } catch (error) {
        return { success: false, error: String(error) };
      }
    }, CONFIG.BASE_URL);

    const userInfo = userData.success ? (userData.data as Record<string, unknown>) : null;

    if (userData.success && userInfo) {
      await logStep(
        prisma,
        logId,
        "Logout Success",
        "INFO",
        `Session verified: ${userInfo.display_name || "Unknown"}`
      );
      return {
        success: true,
        message: `Session verified. User: ${userInfo.display_name || "Unknown"}`,
      };
    } else {
      await logStep(prisma, logId, "Session Invalid", "WARN", "Session expired/invalid");
      return {
        success: true,
        message: "Session already expired or invalid",
      };
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    await logStep(prisma, logId, "Error", "ERROR", `Logout failed: ${errorMsg}`);

    return {
      success: false,
      message: `Logout error: ${errorMsg}`,
    };
  } finally {
    if (browser) {
      await browser.close();
      await logStep(prisma, logId, "Browser Closed", "INFO", "Browser closed");
    }
  }
}
