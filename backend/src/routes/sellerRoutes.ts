import express from "express";
import { protect } from "../middleware/authMiddleware";
import {
	getSellerDashboard,
	getCompetitorAnalysis,
	getTrendingProducts,
	getCustomerInterests,
	getSalesInsights,
} from "../controllers/sellerController";

const router = express.Router();

// Seller middleware to check if user is seller
const sellerOnly = (req: any, res: any, next: any) => {
	if (req.user?.role !== "seller") {
		return res.status(403).json({ error: "Seller access only" });
	}
	next();
};

// Dashboard
router.get("/dashboard", protect, sellerOnly, getSellerDashboard);

// Competition analysis
router.get("/competition", protect, sellerOnly, getCompetitorAnalysis);

// Trending products
router.get("/trending", protect, sellerOnly, getTrendingProducts);

// Customer interests
router.get("/interests", protect, sellerOnly, getCustomerInterests);

// Sales insights
router.get("/insights", protect, sellerOnly, getSalesInsights);

export default router;
