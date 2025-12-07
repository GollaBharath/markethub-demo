import { Response } from "express";
import PriceHistory from "../models/PriceHistory";
import { getRecommendation } from "../utils/recommendation";
import { scrapeAmazonProduct } from "../scrapers/amazonScraper";
import { AuthRequest } from "../types";

export const scrapeAmazon = async (req: AuthRequest, res: Response) => {
	try {
		const { url, productId } = req.body;

		if (!url) {
			return res.status(400).json({ message: "URL is required" });
		}

		// Extract ASIN from URL if productId not given
		const asin = url.match(/\/dp\/([A-Z0-9]{10})/i)?.[1];
		const finalProductId = productId || asin;

		if (!finalProductId) {
			return res.status(400).json({
				message: "Invalid Amazon URL — Could not extract product ID / ASIN.",
			});
		}

		// 🔵 SCRAPE AMAZON
		const scraped = await scrapeAmazonProduct(url);

		if (scraped.error) {
			return res.status(500).json({
				message: "Scraper failed",
				error: scraped.error,
				details: scraped.details,
			});
		}

		const numericPrice = typeof scraped.price === "number" ? scraped.price : 0;

		// 🔵 SAVE PRICE HISTORY (only if valid price)
		if (numericPrice > 0) {
			await PriceHistory.create({
				productId: finalProductId,
				title: scraped.title,
				url: scraped.url,
				price: numericPrice,
			});
		}

		// 🔵 Retrieve full price history to generate recommendation
		const historyDocs = await PriceHistory.find({
			productId: finalProductId,
		}).sort({ timestamp: 1 });

		const historyPrices = historyDocs
			.map((h) => h.price)
			.filter((price): price is number => price != null);

		const recommendation =
			numericPrice > 0 && historyPrices.length > 1
				? getRecommendation(numericPrice, historyPrices)
				: "Not enough data for recommendation";

		// 🔵 SEND CLEAN RESPONSE TO FRONTEND
		return res.json({
			source: "amazon",
			productId: finalProductId,
			title: scraped.title,
			price: numericPrice,
			rating: scraped.rating, // number
			reviews: scraped.reviews, // number
			image: scraped.image, // ADDED
			url: scraped.url,
			recommendation,
		});
	} catch (err) {
		console.error("SCRAPER CONTROLLER ERROR:", err);
		return res.status(500).json({
			message: "Scraping failed",
			error: err,
		});
	}
};
