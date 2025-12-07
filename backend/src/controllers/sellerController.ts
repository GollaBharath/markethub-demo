import { Request, Response } from "express";
import User from "../models/User";
import Deal from "../models/Deal";
import PriceHistory from "../models/PriceHistory";

// Get seller dashboard analytics
export const getSellerDashboard = async (req: Request, res: Response) => {
	try {
		const userId = (req as any).user.id;

		// Get seller info
		const seller = await User.findById(userId).select("name email");
		if (!seller) {
			return res.status(404).json({ error: "Seller not found" });
		}

		// For demo purposes, generate realistic data
		// In a real app, this would come from actual sales/orders collection
		const totalSales = Math.floor(Math.random() * 500) + 100;
		const revenue = Math.floor(Math.random() * 5000000) + 1000000;
		const avgOrderValue = Math.floor(revenue / totalSales);
		const conversionRate = (Math.random() * 5 + 2).toFixed(1);

		// Generate monthly sales data
		const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
		const monthlySales = months.map((month, index) => ({
			month,
			sales: Math.floor(Math.random() * 100) + 50 + index * 10,
			revenue: Math.floor(Math.random() * 1000000) + 500000 + index * 100000,
		}));

		// Get top categories from deals
		const categoryCounts = await Deal.aggregate([
			{ $match: { isActive: true, category: { $exists: true } } },
			{ $group: { _id: "$category", count: { $sum: 1 } } },
			{ $sort: { count: -1 } },
			{ $limit: 4 },
		]);

		const total = categoryCounts.reduce((acc, cat) => acc + cat.count, 0);
		const topCategories = categoryCounts.map((cat) => ({
			name: cat._id,
			sales: Math.floor(Math.random() * 100) + 20,
			percentage: total > 0 ? Math.round((cat.count / total) * 100) : 0,
		}));

		res.json({
			salesInsights: {
				totalSales,
				revenue,
				avgOrderValue,
				conversionRate: parseFloat(conversionRate),
				monthlySales,
				topCategories,
			},
		});
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};

// Get competitor analysis
export const getCompetitorAnalysis = async (req: Request, res: Response) => {
	try {
		// Get products with multiple entries (competitors)
		const products = await Deal.aggregate([
			{ $match: { isActive: true } },
			{
				$group: {
					_id: "$normalizedTitle",
					products: {
						$push: {
							platform: "$platform",
							price: "$price",
							title: "$title",
							url: "$url",
						},
					},
					count: { $sum: 1 },
				},
			},
			{ $match: { count: { $gte: 2 } } },
			{ $limit: 10 },
		]);

		const competitorData = products.map((group) => {
			const sortedProducts = group.products.sort(
				(a: any, b: any) => a.price - b.price
			);
			const yourPrice = sortedProducts[0].price;
			const competitorPrices = sortedProducts.slice(1, 4).map((p: any) => ({
				name: p.platform,
				price: p.price,
			}));

			const avgCompetitorPrice =
				competitorPrices.reduce((acc: number, p: any) => acc + p.price, 0) /
				competitorPrices.length;
			const priceTrend =
				yourPrice < avgCompetitorPrice
					? "decreasing"
					: yourPrice > avgCompetitorPrice
					? "increasing"
					: "stable";

			return {
				productName: sortedProducts[0].title.substring(0, 50) + "...",
				yourPrice,
				competitorPrices,
				priceTrend,
			};
		});

		res.json({ competitorData });
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};

// Get trending products
export const getTrendingProducts = async (req: Request, res: Response) => {
	try {
		// Get products with high discount or recent price changes
		const trending = await Deal.find({
			isActive: true,
			discount: { $gt: 10 },
		})
			.sort({ discount: -1, reviews: -1 })
			.limit(20)
			.select(
				"title platform price originalPrice discount rating reviews image url category"
			);

		const trendingProducts = trending.map((product) => {
			const discountValue = product.discount || 0;
			return {
				id: product._id,
				name: product.title,
				platform: product.platform,
				price: product.price,
				originalPrice: product.originalPrice || product.price,
				discount: discountValue,
				rating: product.rating || 0,
				reviews: product.reviews || 0,
				trend:
					discountValue > 30 ? "hot" : discountValue > 20 ? "rising" : "stable",
				category: product.category || "General",
				image: product.image,
				url: product.url,
			};
		});

		res.json({ trendingProducts });
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};

// Get customer interests
export const getCustomerInterests = async (req: Request, res: Response) => {
	try {
		// Get products by category popularity
		const interests = await Deal.aggregate([
			{ $match: { isActive: true } },
			{
				$group: {
					_id: "$category",
					count: { $sum: 1 },
					avgPrice: { $avg: "$price" },
					products: {
						$push: {
							title: "$title",
							price: "$price",
							platform: "$platform",
							image: "$image",
							url: "$url",
						},
					},
				},
			},
			{ $sort: { count: -1 } },
			{ $limit: 8 },
		]);

		const customerInterests = interests.map((interest) => ({
			category: interest._id || "General",
			searchVolume: interest.count * 10 + Math.floor(Math.random() * 100),
			avgPrice: Math.round(interest.avgPrice),
			products: interest.products.slice(0, 3),
		}));

		res.json({ customerInterests });
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};

// Get sales insights
export const getSalesInsights = async (req: Request, res: Response) => {
	try {
		const userId = (req as any).user.id;

		// Generate realistic sales data
		const totalSales = Math.floor(Math.random() * 500) + 150;
		const revenue = Math.floor(Math.random() * 5000000) + 1500000;
		const avgOrderValue = Math.floor(revenue / totalSales);
		const conversionRate = (Math.random() * 5 + 2.5).toFixed(1);

		// Monthly sales trend
		const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
		const monthlySales = months.map((month, index) => ({
			month,
			sales: Math.floor(Math.random() * 100) + 60 + index * 12,
			revenue: Math.floor(Math.random() * 1000000) + 600000 + index * 120000,
		}));

		// Top categories
		const categoryCounts = await Deal.aggregate([
			{ $match: { isActive: true, category: { $exists: true } } },
			{ $group: { _id: "$category", count: { $sum: 1 } } },
			{ $sort: { count: -1 } },
			{ $limit: 4 },
		]);

		const total = categoryCounts.reduce((acc, cat) => acc + cat.count, 0);
		const topCategories = categoryCounts.map((cat) => ({
			name: cat._id,
			sales: Math.floor(Math.random() * 150) + 50,
			percentage: total > 0 ? Math.round((cat.count / total) * 100) : 0,
		}));

		res.json({
			salesInsights: {
				totalSales,
				revenue,
				avgOrderValue,
				conversionRate: parseFloat(conversionRate),
				monthlySales,
				topCategories,
			},
		});
	} catch (error: any) {
		res.status(500).json({ error: error.message });
	}
};
