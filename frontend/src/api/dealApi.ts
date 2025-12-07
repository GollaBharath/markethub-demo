import api from "./axiosInstance";

export interface Deal {
	_id: string;
	productId: string;
	platform: string;
	title: string;
	normalizedTitle: string;
	price: number;
	originalPrice?: number;
	discount?: number;
	rating: number;
	reviews: number;
	image?: string;
	url: string;
	category: string;
	brand?: string;
	keywords: string[];
	isActive: boolean;
	lastScraped: Date;
	expiresAt: Date;
	createdAt: Date;
	updatedAt: Date;
}

export interface ProductGroup {
	productName: string;
	normalizedTitle: string;
	category: string;
	brand?: string;
	variants: Deal[];
	lowestPrice: number;
	highestRating: number;
	bestDeal: Deal;
}

export interface SearchResponse {
	query: string;
	totalResults: number;
	groupedResults: number;
	products: ProductGroup[];
	fromCache: boolean;
}

export interface LiveDealsResponse {
	totalDeals: number;
	deals: Deal[];
}

/**
 * Search for products across all platforms
 */
export const searchProducts = async (
	query: string,
	filters?: {
		platforms?: string[];
		minPrice?: number;
		maxPrice?: number;
		sortBy?: "relevance" | "price_low" | "price_high" | "rating";
	}
): Promise<SearchResponse> => {
	const params: any = { query };

	if (filters?.platforms && filters.platforms.length > 0) {
		params.platforms = filters.platforms.join(",");
	}
	if (filters?.minPrice) params.minPrice = filters.minPrice;
	if (filters?.maxPrice) params.maxPrice = filters.maxPrice;
	if (filters?.sortBy) params.sortBy = filters.sortBy;

	const { data } = await api.get("/deals/search", { params });
	return data;
};

/**
 * Get live deals from all platforms
 */
export const getLiveDeals = async (filters?: {
	platform?: string;
	category?: string;
	limit?: number;
}): Promise<LiveDealsResponse> => {
	const { data } = await api.get("/deals/live", { params: filters });
	return data;
};

/**
 * Scrape and store a product as a deal
 */
export const scrapeAndStoreDeal = async (url: string): Promise<Deal> => {
	const { data } = await api.post("/deals/scrape", { url });
	return data.deal;
};

/**
 * Trigger live scraping for a search query across platforms
 */
export const triggerLiveScraping = async (
	query: string,
	platforms?: string[]
): Promise<{
	message: string;
	note: string;
	suggestion: string;
}> => {
	const { data } = await api.post("/deals/scrape-search", {
		query,
		platforms,
	});
	return data;
};
