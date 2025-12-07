import { useState, useEffect } from "react";
import { getLiveDeals, Deal } from "@/api/dealApi";
import productsData from "@/data/products.json";

/**
 * Validate deal data to filter out incomplete/invalid deals
 */
function isValidDeal(deal: Deal): boolean {
	return (
		deal &&
		deal.title &&
		deal.title !== "Blocked" &&
		deal.title !== "N/A" &&
		deal.title !== "" &&
		deal.title.length > 3 &&
		deal.price > 0 &&
		deal.url &&
		deal.url !== ""
	);
}

interface TransformedProduct {
	id: string;
	name: string;
	category: string;
	image: string;
	rating: number;
	reviewCount: number;
	prices: {
		amazon?: { price: number; url: string } | null;
		flipkart?: { price: number; url: string } | null;
		meesho?: { price: number; url: string } | null;
		myntra?: { price: number; url: string } | null;
		ajio?: { price: number; url: string } | null;
	};
	buyRecommendation: "good" | "neutral" | "high";
}

/**
 * Custom hook to fetch deals from the database or fallback to hardcoded data
 */
export function useDeals(limit?: number) {
	const [products, setProducts] = useState<TransformedProduct[]>([]);
	const [loading, setLoading] = useState(true);
	const [isFromDatabase, setIsFromDatabase] = useState(false);

	useEffect(() => {
		const fetchDeals = async () => {
			try {
				setLoading(true);

				// Try to fetch deals from the database
				const response = await getLiveDeals({ limit: limit || 20 });

				if (response.deals && response.deals.length > 0) {
					// Filter out invalid deals before transforming
					const validDeals = response.deals.filter(isValidDeal);

					if (validDeals.length > 0) {
						// Transform database deals to match the product card interface
						const transformedProducts = transformDealsToProducts(validDeals);
						setProducts(transformedProducts);
						setIsFromDatabase(true);
					} else {
						// All deals were invalid, use fallback
						console.log("All deals invalid, using hardcoded products");
						const fallbackProducts = productsData.products
							.slice(0, limit || 20)
							.map((p) => ({
								...p,
								buyRecommendation: p.buyRecommendation as
									| "good"
									| "neutral"
									| "high",
							}));
						setProducts(fallbackProducts);
						setIsFromDatabase(false);
					}
				} else {
					// Fallback to hardcoded data if no deals in database
					console.log("No deals in database, using hardcoded products");
					const fallbackProducts = productsData.products
						.slice(0, limit || 20)
						.map((p) => ({
							...p,
							buyRecommendation: p.buyRecommendation as
								| "good"
								| "neutral"
								| "high",
						}));
					setProducts(fallbackProducts);
					setIsFromDatabase(false);
				}
			} catch (error) {
				console.error("Error fetching deals, using hardcoded products:", error);
				// Fallback to hardcoded data on error
				const fallbackProducts = productsData.products
					.slice(0, limit || 20)
					.map((p) => ({
						...p,
						buyRecommendation: p.buyRecommendation as
							| "good"
							| "neutral"
							| "high",
					}));
				setProducts(fallbackProducts);
				setIsFromDatabase(false);
			} finally {
				setLoading(false);
			}
		};

		fetchDeals();
	}, [limit]);

	return { products, loading, isFromDatabase };
}

/**
 * Transform database deals into the ProductCard format
 */
function transformDealsToProducts(deals: Deal[]): TransformedProduct[] {
	// Group deals by normalized title to combine multiple platforms
	const groupedDeals = new Map<string, Deal[]>();

	deals.forEach((deal) => {
		const key = deal.normalizedTitle || deal.title;
		if (!groupedDeals.has(key)) {
			groupedDeals.set(key, []);
		}
		groupedDeals.get(key)!.push(deal);
	});

	// Transform each group into a product
	const products: TransformedProduct[] = [];

	groupedDeals.forEach((dealGroup, normalizedTitle) => {
		// Use the first deal as the base
		const baseDeal = dealGroup[0];

		// Combine prices from all platforms
		const prices: TransformedProduct["prices"] = {
			amazon: null,
			flipkart: null,
			meesho: null,
			myntra: null,
			ajio: null,
		};

		let highestRating = 0;
		let totalReviews = 0;

		dealGroup.forEach((deal) => {
			const platform = deal.platform.toLowerCase() as keyof typeof prices;
			if (prices[platform] === undefined) return;

			prices[platform] = {
				price: deal.price,
				url: deal.url,
			};

			if (deal.rating > highestRating) {
				highestRating = deal.rating;
			}
			totalReviews = Math.max(totalReviews, deal.reviews || 0);
		});

		// Calculate buy recommendation based on discount
		let buyRecommendation: "good" | "neutral" | "high" = "neutral";
		const avgDiscount =
			dealGroup.reduce((sum, d) => sum + (d.discount || 0), 0) /
			dealGroup.length;

		if (avgDiscount >= 20) {
			buyRecommendation = "good";
		} else if (avgDiscount < 10) {
			buyRecommendation = "high";
		}

		products.push({
			id: baseDeal._id,
			name: baseDeal.title,
			category: baseDeal.category || "General",
			image:
				baseDeal.image ||
				"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
			rating: highestRating || 4.0,
			reviewCount: totalReviews || 0,
			prices,
			buyRecommendation,
		});
	});

	return products;
}
