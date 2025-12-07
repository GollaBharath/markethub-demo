import type { Page } from "playwright";
import { ScrapedProduct } from "../types";
import { getBrowserManager } from "./persistentBrowser";

export const scrapeAmazonProduct = async (
	rawUrl: string
): Promise<ScrapedProduct> => {
	const browserManager = getBrowserManager();

	try {
		// Clean the URL (remove tracking)
		const cleanUrl =
			rawUrl.match(/https:\/\/www\.amazon\.in\/dp\/[A-Z0-9]+/i)?.[0] || rawUrl;

		console.log("🟦 Scraping Amazon:", cleanUrl);

		// Get persistent context instead of creating new browser
		const context = await browserManager.getContext();
		const page = await context.newPage();

		// Simulate human behavior before navigation
		await browserManager.navigateWithHumanBehavior(
			page,
			cleanUrl,
			"networkidle"
		);

		// Wait for JS to execute
		await page.waitForTimeout(3000);

		// Check if blocked
		const html = await page.content();
		if (
			html.includes("captcha") ||
			html.includes("Robot Check") ||
			html.includes("Enter the characters you see below") ||
			html.includes("Page Not Found")
		) {
			console.log("❌ Blocked by Amazon");
			await page.close();
			await browserManager.saveState();
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
		const image =
			(await page.locator("#landingImage").getAttribute("src")) || "";

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

		await page.close();
		await browserManager.saveState();

		return {
			title,
			price: numericPrice,
			rating: ratingNumber,
			reviews: reviewNumber,
			image,
			url: cleanUrl,
		};
	} catch (err) {
		console.log("❌ AMAZON SCRAPER ERROR:", err);
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
		const element = page.locator(selector).first();
		const text = await element.textContent();
		return text?.trim() || "N/A";
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
