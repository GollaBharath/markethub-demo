import API from "./index";

// Auto-detect platform from URL and scrape
export const scrapeProduct = async (url: string) => {
	// Detect platform from URL
	let endpoint = "/scrape/amazon"; // default

	if (url.includes("flipkart.com")) {
		endpoint = "/scrape/flipkart";
	} else if (url.includes("meesho.com")) {
		endpoint = "/scrape/meesho";
	} else if (url.includes("myntra.com")) {
		endpoint = "/scrape/myntra";
	} else if (url.includes("ajio.com")) {
		endpoint = "/scrape/ajio";
	} else if (url.includes("amazon.in")) {
		endpoint = "/scrape/amazon";
	}

	const response = await API.post(endpoint, { url });
	return response.data;
};

// Specific scraper functions (optional, for explicit use)
export const scrapeAmazon = async (url: string) => {
	const response = await API.post("/scrape/amazon", { url });
	return response.data;
};

export const scrapeFlipkart = async (url: string) => {
	const response = await API.post("/scrape/flipkart", { url });
	return response.data;
};

export const scrapeMeesho = async (url: string) => {
	const response = await API.post("/scrape/meesho", { url });
	return response.data;
};

export const scrapeMyntra = async (url: string) => {
	const response = await API.post("/scrape/myntra", { url });
	return response.data;
};

export const scrapeAjio = async (url: string) => {
	const response = await API.post("/scrape/ajio", { url });
	return response.data;
};
