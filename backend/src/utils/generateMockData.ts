import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User";
import Deal from "../models/Deal";
import PriceHistory from "../models/PriceHistory";
import Alert from "../models/Alert";
import * as bcrypt from "bcryptjs";

dotenv.config();

const MONGODB_URI =
	process.env.MONGODB_URI || "mongodb://localhost:27017/markethub";

// Product data templates
const productTemplates = [
	{
		title: "Apple iPhone 15 Pro",
		category: "Smartphones",
		brand: "Apple",
		basePrice: 124999,
		keywords: ["iphone", "apple", "smartphone", "5g"],
		image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400",
	},
	{
		title: "Samsung Galaxy S24 Ultra",
		category: "Smartphones",
		brand: "Samsung",
		basePrice: 129999,
		keywords: ["samsung", "galaxy", "smartphone", "android"],
		image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400",
	},
	{
		title: "Sony WH-1000XM5 Headphones",
		category: "Electronics",
		brand: "Sony",
		basePrice: 26990,
		keywords: ["sony", "headphones", "noise cancellation", "wireless"],
		image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400",
	},
	{
		title: "MacBook Air M3",
		category: "Laptops",
		brand: "Apple",
		basePrice: 114900,
		keywords: ["macbook", "apple", "laptop", "m3"],
		image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400",
	},
	{
		title: "OnePlus 12 5G",
		category: "Smartphones",
		brand: "OnePlus",
		basePrice: 64999,
		keywords: ["oneplus", "smartphone", "5g", "android"],
		image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400",
	},
	{
		title: "iPad Pro 12.9 M2",
		category: "Tablets",
		brand: "Apple",
		basePrice: 112900,
		keywords: ["ipad", "tablet", "apple", "m2"],
		image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400",
	},
	{
		title: "Dell XPS 15 Laptop",
		category: "Laptops",
		brand: "Dell",
		basePrice: 159999,
		keywords: ["dell", "laptop", "xps", "windows"],
		image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400",
	},
	{
		title: "Bose QuietComfort 45",
		category: "Electronics",
		brand: "Bose",
		basePrice: 32900,
		keywords: ["bose", "headphones", "noise cancellation", "wireless"],
		image: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400",
	},
	{
		title: "Google Pixel 8 Pro",
		category: "Smartphones",
		brand: "Google",
		basePrice: 106999,
		keywords: ["google", "pixel", "smartphone", "android"],
		image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400",
	},
	{
		title: "Lenovo ThinkPad X1 Carbon",
		category: "Laptops",
		brand: "Lenovo",
		basePrice: 142900,
		keywords: ["lenovo", "thinkpad", "laptop", "business"],
		image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400",
	},
	{
		title: "Nike Air Jordan 1 Retro",
		category: "Fashion",
		brand: "Nike",
		basePrice: 12995,
		keywords: ["nike", "shoes", "sneakers", "jordan"],
		image: "https://images.unsplash.com/photo-1556906781-9a412961c28c?w=400",
	},
	{
		title: "Adidas Ultraboost 22",
		category: "Fashion",
		brand: "Adidas",
		basePrice: 16999,
		keywords: ["adidas", "shoes", "running", "ultraboost"],
		image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400",
	},
	{
		title: "Ray-Ban Aviator Sunglasses",
		category: "Fashion",
		brand: "Ray-Ban",
		basePrice: 9999,
		keywords: ["rayban", "sunglasses", "aviator", "fashion"],
		image: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400",
	},
	{
		title: "Fossil Gen 6 Smartwatch",
		category: "Electronics",
		brand: "Fossil",
		basePrice: 21995,
		keywords: ["fossil", "smartwatch", "wearable", "watch"],
		image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
	},
	{
		title: "JBL Flip 6 Bluetooth Speaker",
		category: "Electronics",
		brand: "JBL",
		basePrice: 12999,
		keywords: ["jbl", "speaker", "bluetooth", "portable"],
		image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400",
	},
];

const platforms = ["amazon", "flipkart", "meesho", "myntra", "ajio"];

const generateProductId = (title: string, platform: string) => {
	const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]/g, "");
	return `${platform}-${cleanTitle}-${Math.random().toString(36).substr(2, 6)}`;
};

const generateNormalizedTitle = (title: string) => {
	return title
		.toLowerCase()
		.replace(/[^a-z0-9\s]/g, "")
		.trim();
};

const generatePriceVariation = (basePrice: number, platform: string) => {
	const variations: { [key: string]: number } = {
		amazon: 0,
		flipkart: 0.02,
		meesho: 0.05,
		myntra: 0.03,
		ajio: 0.04,
	};
	const variation = variations[platform] || 0;
	return Math.round(basePrice * (1 + variation + (Math.random() - 0.5) * 0.1));
};

const generateDeals = async () => {
	const deals: any[] = [];

	for (const template of productTemplates) {
		// Create deals for multiple platforms
		const numPlatforms = Math.floor(Math.random() * 3) + 2; // 2-4 platforms per product
		const selectedPlatforms = platforms
			.sort(() => Math.random() - 0.5)
			.slice(0, numPlatforms);

		for (const platform of selectedPlatforms) {
			const price = generatePriceVariation(template.basePrice, platform);
			const discount = Math.floor(Math.random() * 30) + 5; // 5-35% discount
			const originalPrice = Math.round(price / (1 - discount / 100));

			deals.push({
				productId: generateProductId(template.title, platform),
				platform,
				title: template.title,
				normalizedTitle: generateNormalizedTitle(template.title),
				price,
				originalPrice,
				discount,
				rating: parseFloat((Math.random() * 1.5 + 3.5).toFixed(1)), // 3.5-5.0
				reviews: Math.floor(Math.random() * 20000) + 500,
				image: template.image,
				url: `https://www.${platform}.in/product/${generateProductId(
					template.title,
					platform
				)}`,
				category: template.category,
				brand: template.brand,
				keywords: template.keywords,
				isActive: true,
				lastScraped: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000), // Within last 24h
				expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
			});
		}
	}

	return deals;
};

const generatePriceHistory = async (deals: any[]) => {
	const history: any[] = [];

	for (const deal of deals) {
		// Generate 90 days of price history
		const daysOfHistory = 90;
		const currentDate = new Date();

		for (let i = daysOfHistory; i >= 0; i--) {
			const date = new Date(currentDate);
			date.setDate(date.getDate() - i);

			// Generate realistic price fluctuation
			const priceVariation =
				1 + Math.sin(i / 10) * 0.1 + (Math.random() - 0.5) * 0.05;
			const historicalPrice = Math.round(deal.price * priceVariation);

			history.push({
				productId: deal.productId,
				title: deal.title,
				url: deal.url,
				price: historicalPrice,
				timestamp: date,
			});
		}
	}

	return history;
};

const generateUsers = async () => {
	const hashedPassword = await bcrypt.hash("password123", 10);

	const users = [
		// Admin users
		{
			name: "Admin User",
			email: "admin@markethub.com",
			password: hashedPassword,
			role: "admin",
			tracklist: [],
			loginHistory: [
				{
					date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
					ip: "192.168.1.1",
				},
				{
					date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
					ip: "192.168.1.1",
				},
				{ date: new Date(), ip: "192.168.1.1" },
			],
		},
		// Seller users
		...Array.from({ length: 10 }, (_, i) => ({
			name: `Seller ${i + 1}`,
			email: `seller${i + 1}@example.com`,
			password: hashedPassword,
			role: "seller",
			tracklist: [],
			loginHistory: [
				{
					date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
					ip: `192.168.1.${i + 10}`,
				},
			],
		})),
		// Regular users
		...Array.from({ length: 50 }, (_, i) => ({
			name: `User ${i + 1}`,
			email: `user${i + 1}@example.com`,
			password: hashedPassword,
			role: "user",
			tracklist: [],
			loginHistory: [
				{
					date: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000),
					ip: `192.168.2.${i + 1}`,
				},
			],
		})),
	];

	return users;
};

const generateAlerts = async (users: any[], deals: any[]) => {
	const alerts: any[] = [];

	// Generate alerts for regular users
	const regularUsers = users.filter((u) => u.role === "user");

	for (let i = 0; i < 30; i++) {
		const user = regularUsers[Math.floor(Math.random() * regularUsers.length)];
		const deal = deals[Math.floor(Math.random() * deals.length)];

		alerts.push({
			userId: user._id,
			productId: deal.productId,
			targetPrice: Math.round(deal.price * (0.8 + Math.random() * 0.15)), // 80-95% of current price
			email: user.email,
			triggered: Math.random() > 0.7, // 30% already triggered
		});
	}

	return alerts;
};

const addTracklistToUsers = async (users: any[], deals: any[]) => {
	for (const user of users) {
		if (user.role === "user") {
			// Add 0-5 products to tracklist
			const tracklistSize = Math.floor(Math.random() * 6);
			const tracklist: any[] = [];

			for (let i = 0; i < tracklistSize; i++) {
				const deal = deals[Math.floor(Math.random() * deals.length)];
				tracklist.push({
					productId: deal.productId,
					title: deal.title,
					url: deal.url,
					price: deal.price,
				});
			}

			user.tracklist = tracklist;
		}
	}
};

const main = async () => {
	try {
		console.log("Connecting to MongoDB...");
		await mongoose.connect(MONGODB_URI);
		console.log("Connected to MongoDB");

		// Clear existing data
		console.log("Clearing existing data...");
		await User.deleteMany({});
		await Deal.deleteMany({});
		await PriceHistory.deleteMany({});
		await Alert.deleteMany({});
		console.log("Existing data cleared");

		// Generate and insert deals
		console.log("Generating deals...");
		const dealsData = await generateDeals();
		const deals = await Deal.insertMany(dealsData);
		console.log(`${deals.length} deals created`);

		// Generate and insert price history
		console.log("Generating price history...");
		const priceHistoryData = await generatePriceHistory(deals);
		await PriceHistory.insertMany(priceHistoryData);
		console.log(`${priceHistoryData.length} price history records created`);

		// Generate and insert users
		console.log("Generating users...");
		const usersData = await generateUsers();
		await addTracklistToUsers(usersData, deals);
		const users = await User.insertMany(usersData);
		console.log(`${users.length} users created`);

		// Generate and insert alerts
		console.log("Generating alerts...");
		const alertsData = await generateAlerts(users, deals);
		const alerts = await Alert.insertMany(alertsData);
		console.log(`${alerts.length} alerts created`);

		console.log("\n✅ Mock data generation completed successfully!");
		console.log("\nSummary:");
		console.log(
			`- Users: ${users.length} (1 admin, 10 sellers, 50 regular users)`
		);
		console.log(`- Deals: ${deals.length}`);
		console.log(`- Price History: ${priceHistoryData.length} records`);
		console.log(`- Alerts: ${alerts.length}`);
		console.log("\nLogin credentials:");
		console.log("Admin: admin@markethub.com / password123");
		console.log("Seller: seller1@example.com / password123");
		console.log("User: user1@example.com / password123");

		await mongoose.connection.close();
		process.exit(0);
	} catch (error) {
		console.error("Error generating mock data:", error);
		process.exit(1);
	}
};

main();
