/**
 * Normalize product title for fuzzy matching
 * Removes special chars, brands, sizes, colors, etc.
 */
export function normalizeTitle(title: string): string {
	if (!title) return "";

	let normalized = title
		.toLowerCase()
		.trim()
		// Remove common words
		.replace(
			/\b(for|men|women|boys|girls|kids|pack|of|with|and|or|the|a|an)\b/gi,
			" "
		)
		// Remove sizes
		.replace(/\b(xs|s|m|l|xl|xxl|xxxl|\d+xl)\b/gi, " ")
		.replace(/\b\d+\s*(gb|tb|mb|kg|g|ml|l|cm|mm|inch|inches|ft|feet)\b/gi, " ")
		// Remove colors
		.replace(
			/\b(black|white|red|blue|green|yellow|pink|purple|grey|gray|brown|orange|silver|gold)\b/gi,
			" "
		)
		// Remove special characters
		.replace(/[^a-z0-9\s]/g, " ")
		// Remove extra spaces
		.replace(/\s+/g, " ")
		.trim();

	return normalized;
}

/**
 * Extract keywords from title for better search
 */
export function extractKeywords(title: string): string[] {
	const normalized = normalizeTitle(title);
	const words = normalized.split(" ").filter((w) => w.length > 2);
	return [...new Set(words)]; // Remove duplicates
}

/**
 * Calculate similarity score between two titles (0-1)
 * Uses Jaccard similarity on word sets
 */
export function calculateSimilarity(title1: string, title2: string): number {
	const words1 = new Set(normalizeTitle(title1).split(" "));
	const words2 = new Set(normalizeTitle(title2).split(" "));

	const intersection = new Set([...words1].filter((x) => words2.has(x)));
	const union = new Set([...words1, ...words2]);

	if (union.size === 0) return 0;

	return intersection.size / union.size;
}

/**
 * Extract brand from title (simple heuristic)
 */
export function extractBrand(title: string): string | null {
	const commonBrands = [
		"samsung",
		"apple",
		"nike",
		"adidas",
		"puma",
		"reebok",
		"xiaomi",
		"realme",
		"oneplus",
		"oppo",
		"vivo",
		"hp",
		"dell",
		"lenovo",
		"sony",
		"lg",
		"boat",
		"jbl",
		"bose",
		"levi",
		"levis",
		"zara",
		"h&m",
		"uniqlo",
	];

	const lowerTitle = title.toLowerCase();
	for (const brand of commonBrands) {
		if (lowerTitle.includes(brand)) {
			return brand;
		}
	}

	// Try to get first word as brand
	const firstWord = title.split(" ")[0];
	if (firstWord && firstWord.length > 2) {
		return firstWord.toLowerCase();
	}

	return null;
}

/**
 * Categorize product based on title
 */
export function categorizeProduct(title: string): string {
	const lowerTitle = title.toLowerCase();

	if (lowerTitle.match(/\b(phone|mobile|smartphone|iphone|android)\b/)) {
		return "electronics";
	}
	if (lowerTitle.match(/\b(laptop|computer|desktop|tablet|ipad)\b/)) {
		return "computers";
	}
	if (
		lowerTitle.match(/\b(shirt|tshirt|t-shirt|jeans|pants|trouser|dress|top)\b/)
	) {
		return "fashion";
	}
	if (lowerTitle.match(/\b(shoe|shoes|sneaker|boot|sandal|slipper)\b/)) {
		return "footwear";
	}
	if (lowerTitle.match(/\b(watch|watches)\b/)) {
		return "accessories";
	}
	if (lowerTitle.match(/\b(headphone|earphone|earbud|speaker|audio)\b/)) {
		return "audio";
	}
	if (lowerTitle.match(/\b(bag|backpack|luggage|wallet)\b/)) {
		return "bags";
	}

	return "general";
}
