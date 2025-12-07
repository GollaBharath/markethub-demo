import dotenv from "dotenv";
dotenv.config(); // <<< FIXED: MUST COME FIRST

import express from "express";
import cors from "cors";

import connectDB from "./config/database";
import { connectQueue } from "./config/rabbit";
import adminAuthRoutes from "./routes/adminAuthRoutes";
import adminRoutes from "./routes/adminRoutes";
import sellerRoutes from "./routes/sellerRoutes";

import authRoutes from "./routes/authRoutes";
import testRoutes from "./routes/testRoutes";
import tracklistRoutes from "./routes/tracklistRoutes";
import scraperRoutes from "./routes/scraperRoutes";
import summaryRoutes from "./routes/summaryRoutes";
import alertRoutes from "./routes/alertRoutes";
import priceRoutes from "./routes/priceRoutes";
import dealRoutes from "./routes/dealRoutes";
import "./jobs/scrapeScheduler";
import { startDealsScheduler } from "./jobs/dealsScheduler";

connectQueue(); // <<< CALL AFTER dotenv

const app = express();

app.use(express.json());
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/auth", adminAuthRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/test", testRoutes);
app.use("/api/tracklist", tracklistRoutes);
app.use("/api/scrape", scraperRoutes);
app.use("/api/prices", priceRoutes);
app.use("/api/summary", summaryRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/deals", dealRoutes);

connectDB();
startDealsScheduler();

app.get("/", (req, res) => {
	res.send("MarketHub Backend Running with MongoDB 🚀");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
	console.log(`✅ Server running on http://localhost:${PORT}`);
});
