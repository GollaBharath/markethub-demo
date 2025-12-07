import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import type { Browser, Page } from "puppeteer";
import { ScrapedProduct } from "../types";

puppeteer.use(StealthPlugin());

export const scrapeAmazonProduct = async (
	rawUrl: string
): Promise<ScrapedProduct> => {
	let browser: Browser | null = null;

	try {
		// Clean the URL (remove tracking)
		const cleanUrl =
			rawUrl.match(/https:\/\/www\.amazon\.in\/dp\/[A-Z0-9]+/i)?.[0] || rawUrl;

		console.log("🟦 Scraping:", cleanUrl);

		browser = await puppeteer.launch({
			headless: true,
			defaultViewport: null,
			args: [
				"--no-sandbox",
				"--disable-setuid-sandbox",
				"--disable-dev-shm-usage",
				"--disable-blink-features=AutomationControlled",
				"--window-size=1366,768",
			],
		});

		const page = await browser.newPage();

		// Anti-bot tweaks
		await page.evaluateOnNewDocument(() => {
			Object.defineProperty(navigator, "webdriver", { get: () => false });
			Object.defineProperty(navigator, "plugins", { get: () => [1, 2, 3] });
			Object.defineProperty(navigator, "languages", { get: () => ["en-US"] });
		});

		await page.setUserAgent(
			"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121 Safari/537.36"
		);

		// Load page
		await page.goto(cleanUrl, {
			waitUntil: ["domcontentloaded", "networkidle2"],
			timeout: 120000,
		});

		// Check if blocked
		const html = await page.content();
		if (
			html.includes("captcha") ||
			html.includes("Robot Check") ||
			html.includes("Enter the characters you see below") ||
			html.includes("Page Not Found")
		) {
			console.log("❌ Blocked by Amazon");
			await browser.close();
			return {
				title: "Blocked",
				price: 0,
				rating: 0,
				reviews: 0,
				image: "",
				url: cleanUrl,
			};
		}

		await autoScroll(page);

		// Extract data
		const title = await getText(page, "#productTitle");
		const priceText = await getText(page, ".a-price .a-offscreen");
		const ratingText = await getText(page, "span.a-icon-alt");
		const reviewsText = await getText(page, "#acrCustomerReviewText");

		// Extract product image
		const image = await page
			.$eval("#landingImage", (img: any) => img.src)
			.catch(() => "");

		// --- FIX PRICE ---
		// "₹3,999.00" → "399900" → 3999
		let numericPrice = 0;
		if (priceText && priceText !== "N/A") {
			const digitsOnly = priceText.replace(/[^\d]/g, "");
			numericPrice = parseInt(digitsOnly) / 100;
		}

		// --- FIX RATING ---
		// "4.1 out of 5 stars" → 4.1
		const ratingNumber =
			ratingText && ratingText.includes("out") ? parseFloat(ratingText) : 0;

		// --- FIX REVIEWS ---
		// "(4,864)" → 4864
		const reviewNumber =
			reviewsText && reviewsText !== "N/A"
				? parseInt(reviewsText.replace(/[^\d]/g, ""))
				: 0;

		await browser.close();

		return {
			title,
			price: numericPrice,
			rating: ratingNumber,
			reviews: reviewNumber,
			image,
			url: cleanUrl,
		};
	} catch (err) {
		console.log("❌ SCRAPER ERROR:", err);
		if (browser) await browser.close();
		return {
			title: "Error",
			price: 0,
			rating: 0,
			reviews: 0,
			image: "",
			url: rawUrl,
			error: "Scraping failed",
			details: err,
		};
	}
}; // Helpers
async function getText(page: Page, selector: string): Promise<string> {
	try {
		return await page.$eval(selector, (el: any) => el.textContent.trim());
	} catch {
		return "N/A";
	}
}

async function autoScroll(page: Page): Promise<void> {
	await page.evaluate(async () => {
		await new Promise((resolve) => {
			let totalHeight = 0;
			const distance = 500;
			const timer = setInterval(() => {
				const scrollHeight = document.body.scrollHeight;
				window.scrollBy(0, distance);
				totalHeight += distance;

				if (totalHeight >= scrollHeight - window.innerHeight) {
					clearInterval(timer);
					resolve(true);
				}
			}, 400);
		});
	});
}
