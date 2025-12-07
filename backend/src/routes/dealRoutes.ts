import express from "express";
import { protect } from "../middleware/authMiddleware";
import {
	searchProducts,
	getLiveDeals,
	scrapeAndStoreDeal,
	triggerLiveScraping,
	getProductById,
} from "../controllers/dealController";

const router = express.Router();

// Public routes
router.get("/search", searchProducts);
router.get("/live", getLiveDeals);
router.get("/product/:productId", getProductById);

// Protected routes
router.post("/scrape", protect, scrapeAndStoreDeal);
router.post("/scrape-search", protect, triggerLiveScraping);

export default router;
