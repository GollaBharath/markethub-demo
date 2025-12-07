export { scrapeAmazonProduct } from "./amazonScraper";
export { scrapeFlipkartProduct } from "./flipkartScraper";
export { scrapeMeeshoProduct } from "./meeshoScraper";
export { scrapeMyntraProduct } from "./myntraScraper";
export { scrapeAjioProduct } from "./ajioScraper";

// Export persistent browser manager for lifecycle management
export {
	getBrowserManager,
	closeBrowserManager,
	resetBrowserManager,
	PersistentBrowserManager,
} from "./persistentBrowser";
