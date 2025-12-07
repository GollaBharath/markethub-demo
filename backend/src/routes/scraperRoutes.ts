import express from "express";
import {
	scrapeAmazon,
	scrapeFlipkart,
	scrapeMeesho,
	scrapeMyntra,
	scrapeAjio,
} from "../controllers/scraperController";
import { protect } from "../middleware/authMiddleware";
import rateLimit from "express-rate-limit";

const router = express.Router();

// 🚨 Rate limiter to prevent blocking
const scrapeLimiter = rateLimit({
	windowMs: 60 * 1000, // 1 minute window
	max: 3, // Allow max 3 scrape requests per minute
	message: {
		message: "Too many requests. Please wait a moment before scraping again.",
	},
	standardHeaders: true,
	legacyHeaders: false,
});

// 🛡️ Protected + Safe scraper routes
router.post("/amazon", protect, scrapeLimiter, scrapeAmazon);
router.post("/flipkart", protect, scrapeLimiter, scrapeFlipkart);
router.post("/meesho", protect, scrapeLimiter, scrapeMeesho);
router.post("/myntra", protect, scrapeLimiter, scrapeMyntra);
router.post("/ajio", protect, scrapeLimiter, scrapeAjio);

export default router;
