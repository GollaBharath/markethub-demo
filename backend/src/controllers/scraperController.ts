import { Response } from "express";
import PriceHistory from "../models/PriceHistory";
import { getRecommendation } from "../utils/recommendation";
import { scrapeAmazonProduct } from "../scrapers/amazonScraper";
import { scrapeFlipkartProduct } from "../scrapers/flipkartScraper";
import { scrapeMeeshoProduct } from "../scrapers/meeshoScraper";
import { scrapeMyntraProduct } from "../scrapers/myntraScraper";
import { scrapeAjioProduct } from "../scrapers/ajioScraper";
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

// Flipkart Scraper
export const scrapeFlipkart = async (req: AuthRequest, res: Response) => {
	try {
		const { url, productId } = req.body;

		if (!url) {
			return res.status(400).json({ message: "URL is required" });
		}

		const finalProductId =
			productId || url.match(/\/([^\/\?]+)\?/)?.[1] || Date.now().toString();

		const scraped = await scrapeFlipkartProduct(url);

		if (scraped.error) {
			return res.status(500).json({
				message: "Scraper failed",
				error: scraped.error,
				details: scraped.details,
			});
		}

		const numericPrice = typeof scraped.price === "number" ? scraped.price : 0;

		if (numericPrice > 0) {
			await PriceHistory.create({
				productId: finalProductId,
				title: scraped.title,
				url: scraped.url,
				price: numericPrice,
			});
		}

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

		return res.json({
			source: "flipkart",
			productId: finalProductId,
			title: scraped.title,
			price: numericPrice,
			rating: scraped.rating,
			reviews: scraped.reviews,
			image: scraped.image,
			url: scraped.url,
			recommendation,
		});
	} catch (err) {
		console.error("FLIPKART SCRAPER ERROR:", err);
		return res.status(500).json({
			message: "Scraping failed",
			error: err,
		});
	}
};

// Meesho Scraper
export const scrapeMeesho = async (req: AuthRequest, res: Response) => {
	try {
		const { url, productId } = req.body;

		if (!url) {
			return res.status(400).json({ message: "URL is required" });
		}

		const finalProductId =
			productId || url.match(/\/p\/([^\/\?]+)/)?.[1] || Date.now().toString();

		const scraped = await scrapeMeeshoProduct(url);

		if (scraped.error) {
			return res.status(500).json({
				message: "Scraper failed",
				error: scraped.error,
				details: scraped.details,
			});
		}

		const numericPrice = typeof scraped.price === "number" ? scraped.price : 0;

		if (numericPrice > 0) {
			await PriceHistory.create({
				productId: finalProductId,
				title: scraped.title,
				url: scraped.url,
				price: numericPrice,
			});
		}

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

		return res.json({
			source: "meesho",
			productId: finalProductId,
			title: scraped.title,
			price: numericPrice,
			rating: scraped.rating,
			reviews: scraped.reviews,
			image: scraped.image,
			url: scraped.url,
			recommendation,
		});
	} catch (err) {
		console.error("MEESHO SCRAPER ERROR:", err);
		return res.status(500).json({
			message: "Scraping failed",
			error: err,
		});
	}
};

// Myntra Scraper
export const scrapeMyntra = async (req: AuthRequest, res: Response) => {
	try {
		const { url, productId } = req.body;

		if (!url) {
			return res.status(400).json({ message: "URL is required" });
		}

		const finalProductId =
			productId || url.match(/\/([0-9]+)\/buy/)?.[1] || Date.now().toString();

		const scraped = await scrapeMyntraProduct(url);

		if (scraped.error) {
			return res.status(500).json({
				message: "Scraper failed",
				error: scraped.error,
				details: scraped.details,
			});
		}

		const numericPrice = typeof scraped.price === "number" ? scraped.price : 0;

		if (numericPrice > 0) {
			await PriceHistory.create({
				productId: finalProductId,
				title: scraped.title,
				url: scraped.url,
				price: numericPrice,
			});
		}

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

		return res.json({
			source: "myntra",
			productId: finalProductId,
			title: scraped.title,
			price: numericPrice,
			rating: scraped.rating,
			reviews: scraped.reviews,
			image: scraped.image,
			url: scraped.url,
			recommendation,
		});
	} catch (err) {
		console.error("MYNTRA SCRAPER ERROR:", err);
		return res.status(500).json({
			message: "Scraping failed",
			error: err,
		});
	}
};

// Ajio Scraper
export const scrapeAjio = async (req: AuthRequest, res: Response) => {
	try {
		const { url, productId } = req.body;

		if (!url) {
			return res.status(400).json({ message: "URL is required" });
		}

		const finalProductId =
			productId || url.match(/\/p\/([0-9]+)/)?.[1] || Date.now().toString();

		const scraped = await scrapeAjioProduct(url);

		if (scraped.error) {
			return res.status(500).json({
				message: "Scraper failed",
				error: scraped.error,
				details: scraped.details,
			});
		}

		const numericPrice = typeof scraped.price === "number" ? scraped.price : 0;

		if (numericPrice > 0) {
			await PriceHistory.create({
				productId: finalProductId,
				title: scraped.title,
				url: scraped.url,
				price: numericPrice,
			});
		}

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

		return res.json({
			source: "ajio",
			productId: finalProductId,
			title: scraped.title,
			price: numericPrice,
			rating: scraped.rating,
			reviews: scraped.reviews,
			image: scraped.image,
			url: scraped.url,
			recommendation,
		});
	} catch (err) {
		console.error("AJIO SCRAPER ERROR:", err);
		return res.status(500).json({
			message: "Scraping failed",
			error: err,
		});
	}
};
