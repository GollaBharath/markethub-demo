import { Response } from "express";
import User from "../models/User";
import { AuthRequest } from "../types";

/* ✅ Add product to tracklist */
export const addToTracklist = async (req: AuthRequest, res: Response) => {
	try {
		const { productId, title, url, price } = req.body;

		const user = await User.findById(req.user?.id);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		const alreadyTracked = user.tracklist.some(
			(item) => item.productId?.toString() === productId
		);
		if (alreadyTracked) {
			return res.status(400).json({ message: "Product already in tracklist" });
		}

		user.tracklist.push({
			productId,
			title,
			url,
			price,
		});

		await user.save();
		return res.json({ message: "Product added to tracklist ✅" });
	} catch (error) {
		return res.status(500).json({ message: "Server error" });
	}
};

/* ✅ Get user's tracklist */
export const getTracklist = async (req: AuthRequest, res: Response) => {
	try {
		const user = await User.findById(req.user?.id).select("tracklist");

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		return res.json(user.tracklist);
	} catch (error) {
		return res.status(500).json({ message: "Server error" });
	}
};

/* ✅ Remove product from tracklist (FIXED) */
export const removeFromTracklist = async (req: AuthRequest, res: Response) => {
	try {
		const { productId } = req.params;

		const user = await User.findById(req.user?.id);
		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		// ✅ BEST PRACTICE: use pull instead of filter
		user.tracklist.pull({ productId });

		await user.save();
		return res.json({ message: "Removed from tracklist ✅" });
	} catch (error) {
		return res.status(500).json({ message: "Server error" });
	}
};
