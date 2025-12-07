# MarketHub Backend API Documentation

## Base URL

```
http://localhost:5000/api
```

## Authentication

Most endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## Endpoints

### 🔐 Authentication

#### Register User

```http
POST /auth/register
```

**Request Body:**

```json
{
	"name": "John Doe",
	"email": "john@example.com",
	"password": "securePassword123",
	"role": "user" // Optional: "user" | "seller" | "admin"
}
```

**Response:** `201 Created`

```json
{
	"message": "User registered successfully"
}
```

---

#### User Login

```http
POST /auth/login
```

**Request Body:**

```json
{
	"email": "john@example.com",
	"password": "securePassword123"
}
```

**Response:** `200 OK`

```json
{
	"message": "Login successful",
	"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
	"user": {
		"id": "507f1f77bcf86cd799439011",
		"name": "John Doe",
		"email": "john@example.com",
		"role": "user"
	}
}
```

---

#### Admin Login

```http
POST /auth/admin
```

**Request Body:**

```json
{
	"username": "admin",
	"password": "adminPassword"
}
```

**Response:** `200 OK`

```json
{
	"message": "Admin login successful",
	"token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
	"user": {
		"id": "507f1f77bcf86cd799439011",
		"name": "Admin User",
		"email": "admin@markethub.com",
		"role": "admin"
	}
}
```

---

### 🔍 Product Scraping

#### Scrape Amazon Product

```http
POST /scrape/amazon
Authorization: Bearer <token>
```

**Request Body:**

```json
{
	"url": "https://www.amazon.in/dp/B0ABCD1234",
	"productId": "B0ABCD1234" // Optional
}
```

**Response:** `200 OK`

```json
{
	"source": "amazon",
	"productId": "B0ABCD1234",
	"title": "Product Title",
	"price": 3999,
	"rating": 4.5,
	"reviews": 1234,
	"image": "https://m.media-amazon.com/images/...",
	"url": "https://www.amazon.in/dp/B0ABCD1234",
	"recommendation": "Good time to buy ✅"
}
```

**Rate Limit:** 3 requests per minute

---

### 📊 Price History

#### Get Price History

```http
GET /prices/:productId?days=180
Authorization: Bearer <token>
```

**Query Parameters:**

- `days` (optional): Number of days of history (default: 180)

**Response:** `200 OK`

```json
[
	{
		"_id": "507f1f77bcf86cd799439011",
		"productId": "B0ABCD1234",
		"title": "Product Title",
		"url": "https://www.amazon.in/dp/B0ABCD1234",
		"price": 3999,
		"timestamp": "2025-12-01T10:00:00.000Z",
		"createdAt": "2025-12-01T10:00:00.000Z",
		"updatedAt": "2025-12-01T10:00:00.000Z"
	},
	{
		"_id": "507f1f77bcf86cd799439012",
		"productId": "B0ABCD1234",
		"title": "Product Title",
		"url": "https://www.amazon.in/dp/B0ABCD1234",
		"price": 3799,
		"timestamp": "2025-12-02T10:00:00.000Z",
		"createdAt": "2025-12-02T10:00:00.000Z",
		"updatedAt": "2025-12-02T10:00:00.000Z"
	}
]
```

---

### 📈 Price Summary

#### Get Price Summary

```http
GET /summary/:productId
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
	"current": 3999,
	"lowest": 3499,
	"average": 3799,
	"recommendation": "Price higher than usual, wait ⏳",
	"historyCount": 45
}
```

---

### 🔔 Price Alerts

#### Create Price Alert

```http
POST /alerts
Authorization: Bearer <token>
```

**Request Body:**

```json
{
	"productId": "B0ABCD1234",
	"targetPrice": 3500,
	"email": "notify@example.com" // Optional
}
```

**Response:** `200 OK`

```json
{
	"message": "Alert created and queued for monitoring",
	"alert": {
		"_id": "507f1f77bcf86cd799439011",
		"userId": "507f1f77bcf86cd799439010",
		"productId": "B0ABCD1234",
		"targetPrice": 3500,
		"email": "notify@example.com",
		"triggered": false,
		"createdAt": "2025-12-07T10:00:00.000Z",
		"updatedAt": "2025-12-07T10:00:00.000Z"
	}
}
```

---

#### Get User Alerts

```http
GET /alerts
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
[
	{
		"_id": "507f1f77bcf86cd799439011",
		"userId": "507f1f77bcf86cd799439010",
		"productId": "B0ABCD1234",
		"targetPrice": 3500,
		"email": "notify@example.com",
		"triggered": false,
		"createdAt": "2025-12-07T10:00:00.000Z",
		"updatedAt": "2025-12-07T10:00:00.000Z"
	}
]
```

---

### 📝 User Tracklist

#### Add to Tracklist

```http
POST /tracklist
Authorization: Bearer <token>
```

**Request Body:**

```json
{
	"productId": "B0ABCD1234",
	"title": "Product Title",
	"url": "https://www.amazon.in/dp/B0ABCD1234",
	"price": 3999
}
```

**Response:** `200 OK`

```json
{
	"message": "Product added to tracklist ✅"
}
```

---

#### Get User Tracklist

```http
GET /tracklist
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
[
	{
		"productId": "B0ABCD1234",
		"title": "Product Title",
		"url": "https://www.amazon.in/dp/B0ABCD1234",
		"price": 3999,
		"_id": "507f1f77bcf86cd799439011"
	}
]
```

---

#### Remove from Tracklist

```http
DELETE /tracklist/:productId
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
	"message": "Removed from tracklist ✅"
}
```

---

## Error Responses

### 400 Bad Request

```json
{
	"message": "Validation error message"
}
```

### 401 Unauthorized

```json
{
	"message": "Not authorized, token missing"
}
```

### 404 Not Found

```json
{
	"message": "Resource not found"
}
```

### 500 Internal Server Error

```json
{
	"message": "Error description",
	"error": {}
}
```

---

## Data Models

### User

```typescript
{
	_id: ObjectId;
	name: string;
	email: string;
	password: string(hashed);
	role: "user" | "seller" | "admin";
	tracklist: Array<{
		productId: string;
		title: string;
		url: string;
		price: number;
	}>;
	loginHistory: Array<{
		date: Date;
		ip: string;
	}>;
	createdAt: Date;
	updatedAt: Date;
}
```

### PriceHistory

```typescript
{
	_id: ObjectId;
	productId: string;
	title: string;
	url: string;
	price: number;
	timestamp: Date;
	createdAt: Date;
	updatedAt: Date;
}
```

### Alert

```typescript
{
	_id: ObjectId;
	userId: string;
	productId: string;
	targetPrice: number;
	email: string | null;
	triggered: boolean;
	createdAt: Date;
	updatedAt: Date;
}
```

---

## Background Jobs

### Daily Price Scraper

- **Schedule:** Every day at 3:00 AM
- **Function:** Automatically scrapes prices for all products in user tracklists
- **Updates:** Price history in database

---

## Rate Limiting

### Scraper Endpoints

- **Window:** 1 minute
- **Max Requests:** 3
- **Reason:** Prevent IP blocking by Amazon

---

## Environment Variables

See `.env.example` for required configuration:

- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `PORT` - Server port (default: 5000)
- `REDIS_URL` - Redis connection URL
- `RABBITMQ_URL` - RabbitMQ connection URL
