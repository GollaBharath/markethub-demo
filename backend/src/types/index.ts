import { Request } from "express";

export interface AuthRequest extends Request {
	user?: {
		id: string;
		role: string;
	};
}

export interface ScrapedProduct {
	title: string;
	price: number;
	rating: number;
	reviews: number;
	image: string;
	url: string;
	error?: string;
	details?: any;
}

export interface QueueMessage {
	task: string;
	productId: string;
	targetPrice: number;
	email: string | null;
	userId: string;
}
