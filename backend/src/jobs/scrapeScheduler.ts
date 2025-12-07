import cron from "node-cron";
import User from "../models/User";
import PriceHistory from "../models/PriceHistory";
import { scrapeAmazonProduct } from "../scrapers/amazonScraper";

// Run every day at 3 AM
cron.schedule("0 3 * * *", async () => {
	console.log("⏰ Running daily price updater...");

	try {
		const users = await User.find({});

		for (const user of users) {
			for (const item of user.tracklist) {
				const { productId, url, title } = item;

				if (!url) {
					console.log(`⚠ Skipping item with no URL: ${productId}`);
					continue;
				}

				const data = await scrapeAmazonProduct(url);
				const price = data.price || 0;

				if (price > 0 && !data.error) {
					await PriceHistory.create({
						productId,
						title,
						url,
						price,
					});

					console.log(`📦 Updated: ${productId} → ₹${price}`);
				}
			}
		}

		console.log("✔ Daily scrape completed.");
	} catch (error) {
		console.error("❌ Daily scrape failed:", error);
	}
});
