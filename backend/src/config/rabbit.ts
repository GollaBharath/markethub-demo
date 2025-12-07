import amqp from "amqplib";

let channel: amqp.Channel | null = null;

export const connectQueue = async () => {
	try {
		const rabbitUrl = process.env.RABBITMQ_URL || "amqp://localhost";
		const connection = await amqp.connect(rabbitUrl);

		connection.on("error", (err) => {
			console.error("🐇 RabbitMQ connection error:", err);
		});

		connection.on("close", () => {
			console.error("🐇 RabbitMQ connection closed! Reconnecting in 5s...");
			setTimeout(connectQueue, 5000);
		});

		channel = await connection.createChannel();
		await channel.assertQueue("price_alerts", { durable: true });

		console.log("🐇 RabbitMQ Connected");
	} catch (error) {
		console.error("❌ RabbitMQ connection failed, retrying in 5s:", error);
		setTimeout(connectQueue, 5000);
	}
};

export const sendToQueue = (data: any) => {
	if (!channel) {
		console.error("❌ Cannot send to queue: channel is not initialized");
		return;
	}

	channel.sendToQueue("price_alerts", Buffer.from(JSON.stringify(data)), {
		persistent: true,
	});

	console.log("📩 Message queued:", data);
};
