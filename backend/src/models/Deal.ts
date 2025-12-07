import mongoose from "mongoose";

const dealSchema = new mongoose.Schema(
	{
		productId: { type: String, required: true, index: true },
		platform: {
			type: String,
			required: true,
			enum: ["amazon", "flipkart", "meesho", "myntra", "ajio"],
		},
		title: { type: String, required: true, index: "text" },
		normalizedTitle: { type: String, index: true }, // For fuzzy matching
		price: { type: Number, required: true },
		originalPrice: { type: Number },
		discount: { type: Number },
		rating: { type: Number, default: 0 },
		reviews: { type: Number, default: 0 },
		image: { type: String },
		url: { type: String, required: true },
		category: { type: String, index: true },
		brand: { type: String, index: true },
		keywords: [{ type: String }], // For search optimization
		isActive: { type: Boolean, default: true },
		lastScraped: { type: Date, default: Date.now },
		expiresAt: { type: Date }, // TTL for auto-cleanup
	},
	{ timestamps: true }
);

// Index for text search
dealSchema.index({ title: "text", normalizedTitle: "text", brand: "text" });

// Compound indexes for efficient queries
dealSchema.index({ platform: 1, isActive: 1, expiresAt: 1 });
dealSchema.index({ normalizedTitle: 1, platform: 1 });
dealSchema.index({ category: 1, isActive: 1 });

// TTL index for auto-cleanup (expires after expiresAt date)
dealSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("Deal", dealSchema);
