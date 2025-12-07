import cron from "node-cron";
import Deal from "../models/Deal";
import {
	scrapeAmazonProduct,
	scrapeFlipkartProduct,
	scrapeMeeshoProduct,
	scrapeMyntraProduct,
	scrapeAjioProduct,
} from "../scrapers";
import {
	normalizeTitle,
	extractKeywords,
	extractBrand,
	categorizeProduct,
} from "../utils/productMatcher";

// Helper: Validate scraped data before storing
function isValidScrapedData(scraped: any): boolean {
	return (
		scraped &&
		scraped.title &&
		scraped.title !== "Blocked" &&
		scraped.title !== "N/A" &&
		scraped.title !== "" &&
		scraped.title.length > 3 &&
		scraped.price > 0 &&
		scraped.url &&
		scraped.url !== ""
	);
}

// Popular product URLs to scrape for deals - MUST be individual product pages, not search/category pages
const DEAL_URLS = {
	amazon: [
		// Popular smartphones
		"https://www.amazon.in/Apple-iPhone-15-128-GB/dp/B0CHX1W1XY",
		"https://www.amazon.in/Samsung-Galaxy-Storage-Emerald-Green/dp/B0D3F8JRJM",
		"https://www.amazon.in/OnePlus-Nord-Misty-128GB-Storage/dp/B0D67VDXZ6",
		// Popular laptops
		"https://www.amazon.in/Apple-MacBook-Laptop-chip-10%E2%80%91core/dp/B0CM5JV268",
		"https://www.amazon.in/HP-i5-1235U-39-62cms-Micro-Edge-15s-fy5007TU/dp/B0C7GQKL63",
		// Popular headphones
		"https://www.amazon.in/Sony-WH-1000XM5-Cancelling-Headphones-Multi-Point/dp/B09XS7JWHH",
		"https://www.amazon.in/boAt-Rockerz-450-Bluetooth-Headphone/dp/B07PR1FLGG",
	],
	flipkart: [
		// Popular smartphones
		"https://www.flipkart.com/apple-iphone-15-black-128-gb/p/itm6ac6485971754",
		"https://www.flipkart.com/samsung-galaxy-s24-ultra-5g-titanium-gray-256-gb/p/itm8bba29e4005c1",
		// Popular laptops
		"https://www.flipkart.com/hp-intel-core-i3-11th-gen-1115g4-8-gb-512-gb-ssd-windows-11-home-15s-fq2626tu-thin-light-laptop/p/itm6c57814bc98dd",
		// Electronics
		"https://www.flipkart.com/boat-rockerz-450-bluetooth-headset/p/itm3b7aa9f1f8d7f",
	],
	meesho: [
		// Popular clothing items
		"https://www.meesho.com/trendy-mens-tshirts/p/1srj4o",
		"https://www.meesho.com/womens-cotton-kurti/p/2abcd1",
	],
	myntra: [
		// Popular fashion items
		"https://www.myntra.com/tshirts/roadster/roadster-men-navy-blue-printed-round-neck-t-shirt/1376577/buy",
		"https://www.myntra.com/kurtas/libas/libas-women-pink-floral-printed-kurta/11982850/buy",
	],
	ajio: [
		// Popular items
		"https://www.ajio.com/levis-skinny-fit-jeans-with-mid-rise/p/460863045_blue",
		"https://www.ajio.com/dnmx-slim-fit-shirt-with-patch-pocket/p/460868001_white",
	],
};

/**
 * Scrape deals from a single platform
 */
async function scrapePlatformDeals(
	platform: string,
	urls: string[],
	scraper: any
) {
	console.log(`🔍 Scraping ${platform} deals...`);

	let successCount = 0;
	let errorCount = 0;

	for (const url of urls) {
		try {
			const scraped = await scraper(url);

			if (scraped.error) {
				console.error(`❌ ${platform} scrape error:`, scraped.error);
				errorCount++;
				continue;
			}

			// Validate scraped data - skip invalid/incomplete data
			if (!isValidScrapedData(scraped)) {
				console.log(
					`⚠️  ${platform} invalid data: ${scraped.title} - ₹${scraped.price}`
				);
				errorCount++;
				continue;
			}

			// Extract product ID
			const productId = extractProductId(url, platform);

			// Check if deal exists
			const existingDeal = await Deal.findOne({ productId, platform });

			const dealData = {
				productId,
				platform,
				title: scraped.title,
				normalizedTitle: normalizeTitle(scraped.title),
				price: scraped.price,
				rating: scraped.rating,
				reviews: scraped.reviews,
				image: scraped.image,
				url: scraped.url,
				brand: extractBrand(scraped.title),
				category: categorizeProduct(scraped.title),
				keywords: extractKeywords(scraped.title),
				isActive: true,
				lastScraped: new Date(),
				expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
			};

			if (existingDeal) {
				await Deal.findByIdAndUpdate(existingDeal._id, dealData);
			} else {
				await Deal.create(dealData);
			}

			successCount++;

			// Rate limiting: wait 5 seconds between requests
			await new Promise((resolve) => setTimeout(resolve, 5000));
		} catch (err) {
			console.error(`❌ ${platform} error:`, err);
			errorCount++;
			// Also add delay after errors to avoid rapid retries
			await new Promise((resolve) => setTimeout(resolve, 3000));
		}
	}

	console.log(`✅ ${platform}: ${successCount} success, ${errorCount} errors`);
}

/**
 * Main deal scraping job
 */
export async function runDealsScraper() {
	console.log("🚀 Starting deals scraper...");

	const startTime = Date.now();

	// Scrape all platforms in parallel
	await Promise.all([
		scrapePlatformDeals("amazon", DEAL_URLS.amazon, scrapeAmazonProduct),
		scrapePlatformDeals("flipkart", DEAL_URLS.flipkart, scrapeFlipkartProduct),
		scrapePlatformDeals("meesho", DEAL_URLS.meesho, scrapeMeeshoProduct),
		scrapePlatformDeals("myntra", DEAL_URLS.myntra, scrapeMyntraProduct),
		scrapePlatformDeals("ajio", DEAL_URLS.ajio, scrapeAjioProduct),
	]);

	// Clean up expired deals
	const deleteResult = await Deal.deleteMany({
		expiresAt: { $lt: new Date() },
	});

	const duration = ((Date.now() - startTime) / 1000).toFixed(2);

	console.log(`✨ Deals scraper completed in ${duration}s`);
	console.log(`🗑️  Removed ${deleteResult.deletedCount} expired deals`);

	// Log stats
	const stats = await Deal.aggregate([
		{ $match: { isActive: true } },
		{ $group: { _id: "$platform", count: { $sum: 1 } } },
	]);

	console.log("📊 Active deals by platform:", stats);
}

/**
 * Schedule the scraper to run every 6 hours
 */
export function startDealsScheduler() {
	// Run every 6 hours: at 00:00, 06:00, 12:00, 18:00
	cron.schedule("0 */6 * * *", async () => {
		console.log("⏰ Scheduled deals scraper triggered");
		await runDealsScraper();
	});

	console.log("📅 Deals scheduler initialized (runs every 6 hours)");

	// Run once on startup (after 30 seconds)
	setTimeout(async () => {
		console.log("🎬 Running initial deals scraper...");
		await runDealsScraper();
	}, 30000);
}

// Helper function
function extractProductId(url: string, platform: string): string {
	if (platform === "amazon") {
		return url.match(/\/dp\/([A-Z0-9]{10})/i)?.[1] || Date.now().toString();
	} else if (platform === "flipkart") {
		return url.match(/\/([^\/\?]+)\?/)?.[1] || Date.now().toString();
	} else if (platform === "meesho") {
		return url.match(/\/p\/([^\/\?]+)/)?.[1] || Date.now().toString();
	} else if (platform === "myntra") {
		return url.match(/\/([0-9]+)\/buy/)?.[1] || Date.now().toString();
	} else if (platform === "ajio") {
		return url.match(/\/p\/([0-9]+)/)?.[1] || Date.now().toString();
	}
	return Date.now().toString();
}
