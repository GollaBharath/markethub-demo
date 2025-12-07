import { Response } from "express";
import Alert from "../models/Alert";
import { sendToQueue } from "../config/rabbit";
import { AuthRequest } from "../types";

// Create Price Alert
export const createAlert = async (req: AuthRequest, res: Response) => {
	try {
		const { productId, targetPrice, email } = req.body;

		// Basic validation
		if (!productId || !targetPrice) {
			return res.status(400).json({
				message: "productId and targetPrice are required",
			});
		}

		if (!req.user) {
			return res.status(401).json({ message: "User not authenticated" });
		}

		// Save alert to DB
		const alert = await Alert.create({
			userId: req.user.id,
			productId,
			targetPrice,
			email: email || null,
			triggered: false,
		});

		// Try sending task to RabbitMQ queue
		try {
			await sendToQueue({
				task: "schedule_price_check",
				productId,
				targetPrice,
				email: email || null,
				userId: req.user.id,
			});
		} catch (queueErr) {
			console.error("⚠ Queue push failed:", queueErr);
			// Don't fail the request — alert is still saved
		}

		return res.json({
			message: "Alert created and queued for monitoring",
			alert,
		});
	} catch (err) {
		console.error("ALERT ERROR:", err);
		return res.status(500).json({ message: "Failed to create alert", err });
	}
};

// Get Alerts for Logged-in User
export const getAlerts = async (req: AuthRequest, res: Response) => {
	try {
		if (!req.user) {
			return res.status(401).json({ message: "User not authenticated" });
		}
		const alerts = await Alert.find({ userId: req.user.id });
		return res.json(alerts);
	} catch (err) {
		console.error("GET ALERTS ERROR:", err);
		return res.status(500).json({ message: "Failed to load alerts", err });
	}
};
