import { Request, Response } from "express";
import PriceHistory from "../models/PriceHistory";
import { getRecommendation } from "../utils/recommendation";

export const getPriceSummary = async (req: Request, res: Response) => {
	try {
		const { productId } = req.params;

		const history = await PriceHistory.find({ productId }).sort({
			timestamp: 1,
		});

		if (!history.length) {
			return res.status(404).json({ message: "No price data found" });
		}

		const prices = history
			.map((p) => p.price)
			.filter((price): price is number => price != null);

		if (prices.length === 0) {
			return res.status(404).json({ message: "No valid price data found" });
		}

		const current = prices[prices.length - 1];
		const lowest = Math.min(...prices);
		const average = prices.reduce((a, b) => a + b, 0) / prices.length;

		const recommendation = getRecommendation(current, prices);

		return res.json({
			current,
			lowest,
			average,
			recommendation,
			historyCount: history.length,
		});
	} catch (err) {
		return res.status(500).json({ message: "Failed to load summary", err });
	}
};
