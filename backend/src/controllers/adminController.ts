import { Request, Response } from "express";
import User from "../models/User";
import Deal from "../models/Deal";
import PriceHistory from "../models/PriceHistory";
import Alert from "../models/Alert";

// Get all users with analytics
export const getAllUsers = async (req: Request, res: Response) => {
	try {
		const users = await User.find({ role: { $ne: "admin" } })
			.select("-password")
			.sort({ createdAt: -1 });

		const userStats = users.map((user) => ({
			id: user._id,
			name: user.name,
			email: user.email,
			role: user.role,
			tracklistCount: user.tracklist?.length || 0,
			joinedAt: user.createdAt,
			lastLogin:
				user.loginHistory?.[user.loginHistory.length - 1]?.date ||
				user.createdAt,
		}));

		const analytics = {
			totalUsers: users.filter((u) => u.role === "user").length,
			activeLast30Days: users.filter((u) => {
				const lastLogin =
					u.loginHistory?.[u.loginHistory.length - 1]?.date || u.createdAt;
				return (
					new Date(lastLogin) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
				);
			}).length,
			avgTracklistSize:
				users.reduce((acc, u) => acc + (u.tracklist?.length || 0), 0) /
					users.length || 0,
		};

		res.json({ users: userStats, analytics });
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};

// Get all sellers with analytics
export const getAllSellers = async (req: Request, res: Response) => {
	try {
		const sellers = await User.find({ role: "seller" })
			.select("-password")
			.sort({ createdAt: -1 });

		const sellerStats = sellers.map((seller) => ({
			id: seller._id,
			name: seller.name,
			email: seller.email,
			joinedAt: seller.createdAt,
			lastLogin:
				seller.loginHistory?.[seller.loginHistory.length - 1]?.date ||
				seller.createdAt,
		}));

		const analytics = {
			totalSellers: sellers.length,
			activeLast30Days: sellers.filter((s) => {
				const lastLogin =
					s.loginHistory?.[s.loginHistory.length - 1]?.date || s.createdAt;
				return (
					new Date(lastLogin) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
				);
			}).length,
		};

		res.json({ sellers: sellerStats, analytics });
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};

// Get all products with analytics
export const getAllProducts = async (req: Request, res: Response) => {
	try {
		const products = await Deal.find({ isActive: true })
			.sort({ createdAt: -1 })
			.limit(100);

		const productStats = products.map((product) => ({
			id: product._id,
			productId: product.productId,
			title: product.title,
			platform: product.platform,
			price: product.price,
			originalPrice: product.originalPrice,
			discount: product.discount,
			rating: product.rating,
			reviews: product.reviews,
			category: product.category,
			brand: product.brand,
			lastScraped: product.lastScraped,
			url: product.url,
			image: product.image,
		}));

		const analytics = {
			totalProducts: await Deal.countDocuments({ isActive: true }),
			byPlatform: await Deal.aggregate([
				{ $match: { isActive: true } },
				{ $group: { _id: "$platform", count: { $sum: 1 } } },
			]),
			byCategory: await Deal.aggregate([
				{ $match: { isActive: true, category: { $exists: true } } },
				{ $group: { _id: "$category", count: { $sum: 1 } } },
				{ $sort: { count: -1 } },
				{ $limit: 5 },
			]),
			avgPrice: await Deal.aggregate([
				{ $match: { isActive: true } },
				{ $group: { _id: null, avgPrice: { $avg: "$price" } } },
			]),
		};

		res.json({ products: productStats, analytics });
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};

// Get sales trends
export const getSalesTrends = async (req: Request, res: Response) => {
	try {
		// Get price drops over time
		const priceDrops = await PriceHistory.aggregate([
			{
				$match: {
					createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
				},
			},
			{
				$group: {
					_id: {
						$dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
					},
					count: { $sum: 1 },
					avgPrice: { $avg: "$price" },
				},
			},
			{ $sort: { _id: 1 } },
		]);

		// Get top deals by discount
		const topDeals = await Deal.find({ isActive: true, discount: { $gt: 0 } })
			.sort({ discount: -1 })
			.limit(10)
			.select("title platform price originalPrice discount image url");

		// Get platform performance
		const platformPerformance = await Deal.aggregate([
			{ $match: { isActive: true } },
			{
				$group: {
					_id: "$platform",
					totalProducts: { $sum: 1 },
					avgDiscount: { $avg: "$discount" },
					avgRating: { $avg: "$rating" },
				},
			},
		]);

		// Alert trends
		const alertStats = await Alert.aggregate([
			{
				$group: {
					_id: {
						$dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
					},
					count: { $sum: 1 },
				},
			},
			{ $sort: { _id: 1 } },
			{ $limit: 30 },
		]);

		res.json({
			priceDrops,
			topDeals,
			platformPerformance,
			alertStats,
		});
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};

// Get system logs (activity logs)
export const getSystemLogs = async (req: Request, res: Response) => {
	try {
		// Get recent user activities
		const recentUsers = await User.find()
			.sort({ updatedAt: -1 })
			.limit(50)
			.select("name email role updatedAt createdAt");

		// Get recent product updates
		const recentProducts = await Deal.find()
			.sort({ lastScraped: -1 })
			.limit(50)
			.select("title platform lastScraped createdAt");

		// Get recent alerts
		const recentAlerts = await Alert.find()
			.sort({ createdAt: -1 })
			.limit(50)
			.populate("user", "name email");

		const logs = [
			...recentUsers.map((u) => ({
				id: u._id,
				type: "user",
				action:
					u.createdAt.getTime() === u.updatedAt.getTime()
						? "registered"
						: "updated",
				description: `User ${u.name} (${u.role})`,
				timestamp: u.updatedAt,
			})),
			...recentProducts.map((p) => ({
				id: p._id,
				type: "product",
				action: "scraped",
				description: `${p.title} on ${p.platform}`,
				timestamp: p.lastScraped,
			})),
			...recentAlerts.map((a: any) => ({
				id: a._id,
				type: "alert",
				action: "created",
				description: `Alert for ${a.productId} by ${a.user?.name || "Unknown"}`,
				timestamp: a.createdAt,
			})),
		].sort(
			(a, b) =>
				new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
		);

		res.json({ logs: logs.slice(0, 100) });
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};

// Delete user
export const deleteUser = async (req: Request, res: Response) => {
	try {
		const { userId } = req.params;
		const user = await User.findById(userId);

		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		if (user.role === "admin") {
			return res.status(403).json({ error: "Cannot delete admin users" });
		}

		await User.findByIdAndDelete(userId);
		res.json({ message: "User deleted successfully" });
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};

// Delete product
export const deleteProduct = async (req: Request, res: Response) => {
	try {
		const { productId } = req.params;
		await Deal.findByIdAndDelete(productId);
		res.json({ message: "Product deleted successfully" });
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};

// Update product
export const updateProduct = async (req: Request, res: Response) => {
	try {
		const { productId } = req.params;
		const updates = req.body;

		const product = await Deal.findByIdAndUpdate(productId, updates, {
			new: true,
		});

		if (!product) {
			return res.status(404).json({ error: "Product not found" });
		}

		res.json({ product });
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};

// Get dashboard analytics
export const getDashboardAnalytics = async (req: Request, res: Response) => {
	try {
		const totalUsers = await User.countDocuments({ role: "user" });
		const totalSellers = await User.countDocuments({ role: "seller" });
		const totalProducts = await Deal.countDocuments({ isActive: true });
		const totalAlerts = await Alert.countDocuments();

		// User growth over last 6 months
		const sixMonthsAgo = new Date();
		sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

		const userGrowth = await User.aggregate([
			{
				$match: {
					createdAt: { $gte: sixMonthsAgo },
					role: "user",
				},
			},
			{
				$group: {
					_id: {
						$dateToString: { format: "%Y-%m", date: "$createdAt" },
					},
					count: { $sum: 1 },
				},
			},
			{ $sort: { _id: 1 } },
		]);

		// Category popularity
		const categoryPopularity = await Deal.aggregate([
			{ $match: { isActive: true, category: { $exists: true } } },
			{ $group: { _id: "$category", count: { $sum: 1 } } },
			{ $sort: { count: -1 } },
			{ $limit: 5 },
		]);

		res.json({
			analytics: {
				totalUsers,
				totalSellers,
				totalProducts,
				totalAlerts,
			},
			userGrowth: userGrowth.map((item) => ({
				month: item._id,
				users: item.count,
			})),
			categoryPopularity: categoryPopularity.map((item) => ({
				name: item._id,
				count: item.count,
				percentage: 0, // Will calculate on frontend
			})),
		});
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};
