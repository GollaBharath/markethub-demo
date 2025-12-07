import express from "express";
import { protect } from "../middleware/authMiddleware";
import {
	getAllUsers,
	getAllSellers,
	getAllProducts,
	getSalesTrends,
	getSystemLogs,
	deleteUser,
	deleteProduct,
	updateProduct,
	getDashboardAnalytics,
} from "../controllers/adminController";

const router = express.Router();

// Admin middleware to check if user is admin
const adminOnly = (req: any, res: any, next: any) => {
	if (req.user?.role !== "admin") {
		return res.status(403).json({ error: "Admin access only" });
	}
	next();
};

// Dashboard analytics
router.get("/analytics", protect, adminOnly, getDashboardAnalytics);

// User management
router.get("/users", protect, adminOnly, getAllUsers);
router.delete("/users/:userId", protect, adminOnly, deleteUser);

// Seller management
router.get("/sellers", protect, adminOnly, getAllSellers);

// Product management
router.get("/products", protect, adminOnly, getAllProducts);
router.delete("/products/:productId", protect, adminOnly, deleteProduct);
router.put("/products/:productId", protect, adminOnly, updateProduct);

// Trends
router.get("/trends", protect, adminOnly, getSalesTrends);

// Logs
router.get("/logs", protect, adminOnly, getSystemLogs);

export default router;
