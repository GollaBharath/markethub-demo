import { createClient } from "redis";

const redis = createClient({
	url: process.env.REDIS_URL || "redis://127.0.0.1:6379",
});

redis.on("error", (err) => {
	console.error("❌ Redis Client Error:", err);
});

redis.on("connect", () => {
	console.log("✅ Redis Connected");
});

redis.connect().catch((err) => {
	console.error("❌ Redis connection failed:", err);
});

export default redis;
