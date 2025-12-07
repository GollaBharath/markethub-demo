import { Response } from "express";
import Deal from "../models/Deal";
import { AuthRequest } from "../types";
import redis from "../config/redis";
import {
	normalizeTitle,
	extractKeywords,
	calculateSimilarity,
	extractBrand,
	categorizeProduct,
} from "../utils/productMatcher";
import {
	scrapeAmazonProduct,
	scrapeFlipkartProduct,
	scrapeMeeshoProduct,
	scrapeMyntraProduct,
	scrapeAjioProduct,
} from "../scrapers";

// Smart search across all platforms with caching
export const searchProducts = async (req: AuthRequest, res: Response) => {
	try {
		const { query, platforms, minPrice, maxPrice, sortBy } = req.query;

		if (!query || typeof query !== "string") {
			return res.status(400).json({ message: "Search query is required" });
		}

		// Generate cache key
		const cacheKey = `search:${query}:${platforms || "all"}:${minPrice || 0}:${
			maxPrice || 999999
		}:${sortBy || "relevance"}`;

		// Check cache first
		try {
			const cached = await redis.get(cacheKey);
			if (cached) {
				console.log("📦 Returning cached results for:", query);
				return res.json({
					...JSON.parse(cached),
					fromCache: true,
				});
			}
		} catch (cacheErr) {
			console.error("Cache read error:", cacheErr);
		}

		// Normalize search query
		const normalizedQuery = normalizeTitle(query);
		const searchKeywords = extractKeywords(query);

		// Build search filters
		const filters: any = {
			isActive: true,
			expiresAt: { $gt: new Date() },
		};

		if (platforms && typeof platforms === "string") {
			const platformList = platforms.split(",");
			filters.platform = { $in: platformList };
		}

		if (minPrice) filters.price = { ...filters.price, $gte: Number(minPrice) };
		if (maxPrice) filters.price = { ...filters.price, $lte: Number(maxPrice) };

		// Text search
		let deals = await Deal.find({
			...filters,
			$text: { $search: query },
		}).limit(100);

		// If no results, try fuzzy matching
		if (deals.length === 0) {
			deals = await Deal.find(filters).limit(200);
		}

		// Calculate similarity scores and filter
		const scoredDeals = deals
			.filter((deal) => isValidDeal(deal)) // Filter out invalid deals
			.map((deal) => ({
				...deal.toObject(),
				similarityScore: calculateSimilarity(query, deal.title),
			}))
			.filter((deal) => deal.similarityScore > 0.3); // At least 30% match

		// Sort by relevance or price
		if (sortBy === "price_low") {
			scoredDeals.sort((a, b) => a.price - b.price);
		} else if (sortBy === "price_high") {
			scoredDeals.sort((a, b) => b.price - a.price);
		} else if (sortBy === "rating") {
			scoredDeals.sort((a, b) => b.rating - a.rating);
		} else {
			// Default: relevance
			scoredDeals.sort((a, b) => b.similarityScore - a.similarityScore);
		}

		// Group by similar products
		const groupedDeals = groupSimilarProducts(scoredDeals);

		const result = {
			query,
			totalResults: scoredDeals.length,
			groupedResults: groupedDeals.length,
			products: groupedDeals,
		};

		// Cache for 5 minutes
		try {
			await redis.setEx(cacheKey, 300, JSON.stringify(result));
		} catch (cacheErr) {
			console.error("Cache write error:", cacheErr);
		}

		// If no results found, suggest live scraping
		const shouldSuggestScraping = groupedDeals.length === 0;

		return res.json({
			...result,
			fromCache: false,
			shouldSuggestScraping,
			scrapingSuggestion: shouldSuggestScraping
				? "No results found in database. Try scraping live from platforms."
				: null,
		});
	} catch (err) {
		console.error("SEARCH ERROR:", err);
		return res.status(500).json({
			message: "Search failed",
			error: err,
		});
	}
};

// Get live deals from all platforms
export const getLiveDeals = async (req: AuthRequest, res: Response) => {
	try {
		const { platform, category, limit = 20 } = req.query;

		const filters: any = {
			isActive: true,
			expiresAt: { $gt: new Date() },
			// Filter out invalid deals
			price: { $gt: 0 },
			title: {
				$exists: true,
				$nin: ["Blocked", "N/A", ""],
			},
		};

		if (platform) filters.platform = platform;
		if (category) filters.category = category;

		const deals = await Deal.find(filters)
			.sort({ discount: -1, createdAt: -1 })
			.limit(Number(limit));

		return res.json({
			totalDeals: deals.length,
			deals,
		});
	} catch (err) {
		console.error("GET DEALS ERROR:", err);
		return res.status(500).json({
			message: "Failed to fetch deals",
			error: err,
		});
	}
};

// Scrape and store a product as a deal
export const scrapeAndStoreDeal = async (req: AuthRequest, res: Response) => {
	try {
		const { url } = req.body;

		if (!url) {
			return res.status(400).json({ message: "URL is required" });
		}

		// Detect platform
		let platform = "amazon";
		let scraper = scrapeAmazonProduct;

		if (url.includes("flipkart.com")) {
			platform = "flipkart";
			scraper = scrapeFlipkartProduct;
		} else if (url.includes("meesho.com")) {
			platform = "meesho";
			scraper = scrapeMeeshoProduct;
		} else if (url.includes("myntra.com")) {
			platform = "myntra";
			scraper = scrapeMyntraProduct;
		} else if (url.includes("ajio.com")) {
			platform = "ajio";
			scraper = scrapeAjioProduct;
		}

		// Scrape product
		const scraped = await scraper(url);

		if (scraped.error) {
			return res.status(500).json({
				message: "Scraping failed",
				error: scraped.error,
			});
		}

		// Validate scraped data - don't store incomplete/invalid data
		if (!isValidScrapedData(scraped)) {
			return res.status(400).json({
				message: "Invalid or incomplete product data",
				details: {
					title: scraped.title,
					price: scraped.price,
					reason: getValidationFailureReason(scraped),
				},
			});
		}

		// Extract product ID
		const productId = extractProductId(url, platform);

		// Check if deal already exists
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

		let deal;
		if (existingDeal) {
			// Update existing deal
			deal = await Deal.findByIdAndUpdate(existingDeal._id, dealData, {
				new: true,
			});
		} else {
			// Create new deal
			deal = await Deal.create(dealData);
		}

		// Clear search cache
		await clearSearchCache();

		return res.json({
			message: "Deal stored successfully",
			deal,
		});
	} catch (err) {
		console.error("STORE DEAL ERROR:", err);
		return res.status(500).json({
			message: "Failed to store deal",
			error: err,
		});
	}
};

// Helper: Group similar products from different platforms
function groupSimilarProducts(deals: any[]): any[] {
	const groups: any[] = [];
	const processed = new Set();

	for (const deal of deals) {
		if (processed.has(deal._id.toString())) continue;

		const group = {
			productName: deal.title,
			normalizedTitle: deal.normalizedTitle,
			category: deal.category,
			brand: deal.brand,
			variants: [deal],
			lowestPrice: deal.price,
			highestRating: deal.rating,
			bestDeal: deal,
		};

		processed.add(deal._id.toString());

		// Find similar products from other platforms
		for (const otherDeal of deals) {
			if (
				processed.has(otherDeal._id.toString()) ||
				otherDeal.platform === deal.platform
			) {
				continue;
			}

			const similarity = calculateSimilarity(deal.title, otherDeal.title);

			if (similarity > 0.6) {
				// 60% similarity threshold
				group.variants.push(otherDeal);
				processed.add(otherDeal._id.toString());

				if (otherDeal.price < group.lowestPrice) {
					group.lowestPrice = otherDeal.price;
					group.bestDeal = otherDeal;
				}

				if (otherDeal.rating > group.highestRating) {
					group.highestRating = otherDeal.rating;
				}
			}
		}

		groups.push(group);
	}

	return groups;
}

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

// Helper: Get validation failure reason
function getValidationFailureReason(scraped: any): string {
	if (!scraped) return "No data returned";
	if (!scraped.title || scraped.title === "" || scraped.title.length <= 3)
		return "Invalid title";
	if (scraped.title === "Blocked") return "Product page blocked";
	if (scraped.title === "N/A") return "Product not available";
	if (scraped.price <= 0) return "Invalid price";
	if (!scraped.url || scraped.url === "") return "Invalid URL";
	return "Unknown validation error";
}

// Helper: Validate deal data
function isValidDeal(deal: any): boolean {
	return (
		deal &&
		deal.title &&
		deal.title !== "Blocked" &&
		deal.title !== "N/A" &&
		deal.title !== "" &&
		deal.title.length > 3 &&
		deal.price > 0
	);
}

// Helper: Extract product ID from URL
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

// Trigger live scraping - runs the deals scraper job
export const triggerLiveScraping = async (req: AuthRequest, res: Response) => {
	try {
		const { query } = req.body;

		if (!query || typeof query !== "string") {
			return res.status(400).json({ message: "Search query is required" });
		}

		console.log(`🔍 Triggering deals scraper for query: ${query}`);

		// Import and run the deals scraper
		const { runDealsScraper } = await import("../jobs/dealsScheduler");

		// Run scraper in background (don't wait for completion)
		runDealsScraper().catch((err) => {
			console.error("Background scraping error:", err);
		});

		// Clear search cache so new results will be picked up
		await clearSearchCache();

		return res.json({
			message: "Scraping job triggered successfully",
			note: "This will scrape deals from all platforms. It may take a few minutes to complete.",
			suggestion: "Try searching again in 1-2 minutes for updated results",
		});
	} catch (err) {
		console.error("TRIGGER SCRAPING ERROR:", err);
		return res.status(500).json({
			message: "Failed to trigger scraping",
			error: err,
		});
	}
};

// Get product by ID with all platform variants
export const getProductById = async (req: AuthRequest, res: Response) => {
	try {
		const { productId } = req.params;

		// Find the main product by productId (custom field, not _id)
		const mainProduct = await Deal.findOne({
			productId: productId,
			isActive: true,
		});

		if (!mainProduct) {
			return res.status(404).json({ message: "Product not found" });
		}

		// Find similar products from other platforms
		const similarProducts = await Deal.find({
			normalizedTitle: mainProduct.normalizedTitle,
			isActive: true,
			expiresAt: { $gt: new Date() },
		});

		// Group by platform
		const prices: any = {};
		similarProducts.forEach((deal) => {
			prices[deal.platform] = {
				price: deal.price,
				url: deal.url,
				originalPrice: deal.originalPrice,
				discount: deal.discount,
			};
		});

		// Get price history for this product
		const PriceHistory = (await import("../models/PriceHistory")).default;
		const priceHistory = await PriceHistory.find({
			productId: { $in: similarProducts.map((d) => d.productId) },
		})
			.sort({ timestamp: 1 })
			.limit(90);

		// Format price history by date
		const priceHistoryByDate: any = {};
		priceHistory.forEach((record) => {
			const date = record.timestamp.toISOString().split("T")[0];
			if (!priceHistoryByDate[date]) {
				priceHistoryByDate[date] = {};
			}
			// Find which platform this record belongs to
			const deal = similarProducts.find(
				(d) => d.productId === record.productId
			);
			if (deal) {
				priceHistoryByDate[date][deal.platform] = record.price;
			}
		});

		const priceHistoryArray = Object.entries(priceHistoryByDate).map(
			([date, prices]) => ({
				date,
				...(prices as object),
			})
		);

		// Build product response
		const product = {
			id: mainProduct._id,
			productId: mainProduct.productId,
			name: mainProduct.title,
			category: mainProduct.category || "General",
			brand: mainProduct.brand,
			image: mainProduct.image,
			rating: mainProduct.rating || 0,
			reviewCount: mainProduct.reviews || 0,
			description: `${mainProduct.title} - Available across multiple platforms`,
			prices,
			priceHistory: priceHistoryArray,
			availability: true,
			buyRecommendation: calculateBuyRecommendation(
				mainProduct.price,
				priceHistoryArray
			),
		};

		res.json(product);
	} catch (err) {
		console.error("GET PRODUCT ERROR:", err);
		return res.status(500).json({
			message: "Failed to fetch product",
			error: err,
		});
	}
};

// Helper: Calculate buy recommendation based on price history
function calculateBuyRecommendation(
	currentPrice: number,
	priceHistory: any[]
): string {
	if (priceHistory.length < 5) return "neutral";

	const prices = priceHistory
		.map((h) => Object.values(h).filter((v) => typeof v === "number"))
		.flat() as number[];

	if (prices.length === 0) return "neutral";

	const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
	const minPrice = Math.min(...prices);

	if (currentPrice <= minPrice * 1.05) return "good"; // Within 5% of lowest
	if (currentPrice >= avgPrice * 1.15) return "high"; // 15% above average
	return "neutral";
}

// Helper: Clear search cache
async function clearSearchCache() {
	try {
		const keys = await redis.keys("search:*");
		if (keys.length > 0) {
			await redis.del(keys);
		}
	} catch (err) {
		console.error("Cache clear error:", err);
	}
}
