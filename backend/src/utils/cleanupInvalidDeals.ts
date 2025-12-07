import mongoose from "mongoose";
import Deal from "../models/Deal";
import dotenv from "dotenv";

dotenv.config();

/**
 * Cleanup script to remove all invalid deals from the database
 * Run this with: npx ts-node src/utils/cleanupInvalidDeals.ts
 */
async function cleanupInvalidDeals() {
	try {
		console.log("🔌 Connecting to database...");
		await mongoose.connect(process.env.MONGO_URI || "");
		console.log("✅ Connected to MongoDB");

		console.log("🧹 Cleaning up invalid deals...");

		// Find and delete deals with invalid data
		const result = await Deal.deleteMany({
			$or: [
				{ title: { $in: ["Blocked", "N/A", ""] } },
				{ title: { $regex: /^.{0,3}$/ } }, // Title less than 4 characters
				{ price: { $lte: 0 } },
				{ price: { $exists: false } },
				{ url: { $in: ["", null] } },
				{ url: { $exists: false } },
			],
		});

		console.log(`✅ Deleted ${result.deletedCount} invalid deals`);

		// Log remaining deals
		const validDealsCount = await Deal.countDocuments({
			isActive: true,
			price: { $gt: 0 },
			title: { $exists: true, $nin: ["Blocked", "N/A", ""] },
		});

		console.log(`📊 Remaining valid deals: ${validDealsCount}`);

		// Show breakdown by platform
		const platformStats = await Deal.aggregate([
			{
				$match: {
					isActive: true,
					price: { $gt: 0 },
					title: { $exists: true, $nin: ["Blocked", "N/A", ""] },
				},
			},
			{
				$group: {
					_id: "$platform",
					count: { $sum: 1 },
					avgPrice: { $avg: "$price" },
					avgRating: { $avg: "$rating" },
				},
			},
			{ $sort: { count: -1 } },
		]);

		console.log("\n📊 Valid deals by platform:");
		platformStats.forEach((stat) => {
			console.log(
				`  ${stat._id.toUpperCase()}: ${
					stat.count
				} deals (Avg Price: ₹${stat.avgPrice.toFixed(
					2
				)}, Avg Rating: ${stat.avgRating.toFixed(1)})`
			);
		});

		await mongoose.connection.close();
		console.log("\n✅ Cleanup completed!");
		process.exit(0);
	} catch (error) {
		console.error("❌ Cleanup failed:", error);
		process.exit(1);
	}
}

cleanupInvalidDeals();
