import type { Page } from "playwright";
import { ScrapedProduct } from "../types";
import { getBrowserManager } from "./persistentBrowser";

export const scrapeMeeshoProduct = async (
	rawUrl: string
): Promise<ScrapedProduct> => {
	const browserManager = getBrowserManager();

	try {
		const cleanUrl = rawUrl.split("?")[0];

		console.log("🟦 Scraping Meesho:", cleanUrl);

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

		const html = await page.content();
		if (html.includes("captcha") || html.includes("Access Denied")) {
			console.log("❌ Blocked by Meesho");
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

		// Meesho specific selectors
		const title = await getText(
			page,
			'h1[class*="ProductDetail"], h1[class*="Title"]'
		);
		const priceText = await getText(
			page,
			'span[class*="PriceCard__Price"], h4[class*="DesktopPriceCard__Price"]'
		);
		const ratingText = await getText(
			page,
			'span[class*="Rating__RatingLabel"], div[class*="Rating"] span'
		);
		const reviewsText = await getText(
			page,
			'span[class*="Rating__Count"], span[class*="ReviewCount"]'
		);

		// Extract image
		let image = "";
		try {
			const imgLocator = page
				.locator(
					'img[class*="DetailCard__StickyImage"], img[class*="ProductDetail__Image"]'
				)
				.first();
			image = (await imgLocator.getAttribute("src")) || "";
		} catch {
			image = "";
		}

		// Parse price
		let numericPrice = 0;
		if (priceText && priceText !== "N/A") {
			const digitsOnly = priceText.replace(/[^\d]/g, "");
			numericPrice = parseInt(digitsOnly) || 0;
		}

		// Parse rating
		const ratingNumber =
			ratingText && ratingText !== "N/A" ? parseFloat(ratingText) : 0;

		// Parse reviews
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
		console.log("❌ MEESHO SCRAPER ERROR:", err);
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
};

// Helper functions
async function getText(page: Page, selector: string): Promise<string> {
	try {
		const selectors = selector.split(",").map((s) => s.trim());
		for (const sel of selectors) {
			try {
				const element = page.locator(sel).first();
				const text = await element.textContent();
				if (text && text.trim() !== "") return text.trim();
			} catch {
				continue;
			}
		}
		return "N/A";
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
