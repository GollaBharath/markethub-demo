import { chromium } from "playwright-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import type { Browser, BrowserContext } from "playwright";
import path from "path";
import fs from "fs";

chromium.use(StealthPlugin());

/**
 * Persistent Browser Manager
 *
 * This module manages a single, reusable browser instance to avoid detection.
 * Benefits:
 * - Maintains cookies and session state across scrapes
 * - Avoids "fresh browser = bot" detection pattern
 * - Reduces resource overhead from repeated browser launches
 * - Simulates real user behavior with persistent fingerprint
 */

interface BrowserConfig {
	headless?: boolean;
	useProxy?: boolean;
	proxyServer?: string;
	proxyUsername?: string;
	proxyPassword?: string;
}

class PersistentBrowserManager {
	private browser: Browser | null = null;
	private context: BrowserContext | null = null;
	private config: BrowserConfig;
	private stateFilePath: string;
	private isInitializing = false;

	constructor(config: BrowserConfig = {}) {
		this.config = {
			headless: config.headless !== undefined ? config.headless : true,
			useProxy: config.useProxy || false,
			proxyServer: config.proxyServer,
			proxyUsername: config.proxyUsername,
			proxyPassword: config.proxyPassword,
		};

		// Store browser state in a persistent location
		this.stateFilePath = path.join(process.cwd(), "browser-state.json");
	}

	/**
	 * Initialize or retrieve the persistent browser instance
	 */
	async getBrowser(): Promise<Browser> {
		// Prevent multiple simultaneous initializations
		while (this.isInitializing) {
			await new Promise((resolve) => setTimeout(resolve, 100));
		}

		if (this.browser && this.browser.isConnected()) {
			return this.browser;
		}

		this.isInitializing = true;

		try {
			console.log("🚀 Launching persistent browser...");

			this.browser = await chromium.launch({
				headless: this.config.headless,
				args: [
					// CRITICAL: Disable HTTP/2 to avoid protocol fingerprinting
					"--disable-http2",

					// Disable automation flags
					"--disable-blink-features=AutomationControlled",

					// Disable site isolation to mimic regular browsing
					"--disable-features=IsolateOrigins,site-per-process,SitePerProcess",

					// Standard security bypasses
					"--no-sandbox",
					"--disable-setuid-sandbox",
					"--ignore-certificate-errors",
					"--disable-dev-shm-usage",

					// Additional stealth
					"--disable-web-security",
					"--disable-features=VizDisplayCompositor",
				],
			});

			console.log("✅ Persistent browser launched successfully");
			return this.browser;
		} finally {
			this.isInitializing = false;
		}
	}

	/**
	 * Get or create a persistent browser context with session state
	 */
	async getContext(): Promise<BrowserContext> {
		if (this.context) {
			return this.context;
		}

		const browser = await this.getBrowser();

		const contextOptions: any = {
			viewport: { width: 1366, height: 768 },
			userAgent:
				"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",

			// Load previous session state if exists
			...(fs.existsSync(this.stateFilePath) && {
				storageState: this.stateFilePath,
			}),

			// Add proxy configuration if enabled
			...(this.config.useProxy &&
				this.config.proxyServer && {
					proxy: {
						server: this.config.proxyServer,
						...(this.config.proxyUsername && {
							username: this.config.proxyUsername,
							password: this.config.proxyPassword,
						}),
					},
				}),
		};

		this.context = await browser.newContext(contextOptions);

		// Additional stealth: override navigator properties
		await this.context.addInitScript(() => {
			// Remove webdriver flag
			Object.defineProperty(navigator, "webdriver", {
				get: () => undefined,
			});

			// Fake plugins
			Object.defineProperty(navigator, "plugins", {
				get: () => [1, 2, 3, 4, 5],
			});

			// Fake languages
			Object.defineProperty(navigator, "languages", {
				get: () => ["en-US", "en"],
			});
		});

		console.log("✅ Browser context created with persistent state");
		return this.context;
	}

	/**
	 * Save current session state for future use
	 */
	async saveState(): Promise<void> {
		if (this.context) {
			await this.context.storageState({ path: this.stateFilePath });
			console.log("💾 Browser state saved");
		}
	}

	/**
	 * Simulate human behavior before navigation
	 */
	async simulateHumanBehavior(page: any): Promise<void> {
		// Random wait (humans don't instantly navigate)
		await page.waitForTimeout(1000 + Math.random() * 2000);

		// Random mouse movement
		const x = 100 + Math.floor(Math.random() * 300);
		const y = 100 + Math.floor(Math.random() * 300);
		await page.mouse.move(x, y);

		// Another small wait
		await page.waitForTimeout(500 + Math.random() * 1000);
	}

	/**
	 * Navigate with human-like behavior
	 */
	async navigateWithHumanBehavior(
		page: any,
		url: string,
		waitUntil: "load" | "domcontentloaded" | "networkidle" = "networkidle"
	): Promise<void> {
		await this.simulateHumanBehavior(page);
		await page.goto(url, { waitUntil, timeout: 60000 });
	}

	/**
	 * Close the browser and save state
	 */
	async close(): Promise<void> {
		if (this.context) {
			await this.saveState();
			await this.context.close();
			this.context = null;
		}

		if (this.browser) {
			await this.browser.close();
			this.browser = null;
			console.log("🔒 Persistent browser closed");
		}
	}

	/**
	 * Reset browser state (useful for testing or clearing cookies)
	 */
	async reset(): Promise<void> {
		await this.close();

		if (fs.existsSync(this.stateFilePath)) {
			fs.unlinkSync(this.stateFilePath);
			console.log("🗑️  Browser state reset");
		}
	}

	/**
	 * Check if browser is active
	 */
	isActive(): boolean {
		return this.browser !== null && this.browser.isConnected();
	}
}

// Singleton instance for application-wide use
let browserManager: PersistentBrowserManager | null = null;

/**
 * Get the global persistent browser manager instance
 */
export function getBrowserManager(
	config?: BrowserConfig
): PersistentBrowserManager {
	if (!browserManager) {
		browserManager = new PersistentBrowserManager(config);
	}
	return browserManager;
}

/**
 * Close the global browser manager
 */
export async function closeBrowserManager(): Promise<void> {
	if (browserManager) {
		await browserManager.close();
		browserManager = null;
	}
}

/**
 * Reset the global browser manager
 */
export async function resetBrowserManager(): Promise<void> {
	if (browserManager) {
		await browserManager.reset();
		browserManager = null;
	}
}

export { PersistentBrowserManager };
