# MarketHub API Documentation

Complete API reference for the MarketHub backend service.

## Base URL

```
http://localhost:5000/api
```

## Authentication

Most endpoints require authentication via JWT token in the Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

## Response Format

All API responses follow this format:

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response

```json
{
	"success": false,
	"error": "Error message",
	"message": "Detailed error description"
}
```

---

## 🔐 Authentication Endpoints

### Register User

Create a new user account.

```http
POST /auth/register
```

**Request Body:**

```json
{
	"name": "John Doe",
	"email": "john@example.com",
	"password": "securePassword123",
	"role": "user"
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | Yes | User's full name |
| email | string | Yes | Valid email address |
| password | string | Yes | Password (min 6 characters) |
| role | string | No | "user", "seller", or "admin" (default: "user") |

**Response:** `201 Created`

```json
{
	"message": "User registered successfully"
}
```

**Error Codes:**

- `400` - Invalid input or email already exists
- `500` - Server error

---

### User Login

Authenticate a user and receive JWT token.

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

**Error Codes:**

- `401` - Invalid credentials
- `400` - Missing email or password
- `500` - Server error

---

### Admin Login

Authenticate admin with username/password.

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
	"admin": {
		"username": "admin",
		"role": "admin"
	}
}
```

**Error Codes:**

- `401` - Invalid credentials
- `400` - Missing username or password
- `500` - Server error

---

## 🛒 Product Scraping Endpoints

All scraping endpoints require authentication and are rate-limited to 3 requests/minute.

### Scrape Amazon Product

```http
POST /scrape/amazon
```

**Headers:**

```http
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**

```json
{
	"url": "https://www.amazon.in/dp/B0XXXXXXXX",
	"productId": "custom-product-id"
}
```

**Parameters:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| url | string | Yes | Amazon product URL |
| productId | string | No | Custom product identifier |

**Response:** `200 OK`

```json
{
	"source": "amazon",
	"productId": "B0XXXXXXXX",
	"title": "Samsung Galaxy S24 Ultra 5G",
	"price": 124999,
	"rating": 4.5,
	"reviews": 2847,
	"image": "https://m.media-amazon.com/images/...",
	"url": "https://www.amazon.in/dp/B0XXXXXXXX",
	"recommendation": "Good time to buy ✅"
}
```

**Error Codes:**

- `401` - Unauthorized (missing or invalid token)
- `429` - Too many requests (rate limit exceeded)
- `400` - Invalid URL
- `500` - Scraping failed

---

### Scrape Flipkart Product

```http
POST /scrape/flipkart
```

**Request/Response:** Same format as Amazon scraper

---

### Scrape Meesho Product

```http
POST /scrape/meesho
```

**Request/Response:** Same format as Amazon scraper

---

### Scrape Myntra Product

```http
POST /scrape/myntra
```

**Request/Response:** Same format as Amazon scraper

---

### Scrape Ajio Product

```http
POST /scrape/ajio
```

**Request/Response:** Same format as Amazon scraper

---

## 🔍 Deals & Search Endpoints

### Smart Product Search

Search for products across all platforms with fuzzy matching.

```http
GET /deals/search
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| query | string | Yes | Product search query |
| platforms | string | No | Comma-separated platforms (e.g., "amazon,flipkart") |
| minPrice | number | No | Minimum price filter |
| maxPrice | number | No | Maximum price filter |
| sortBy | string | No | Sort order: "relevance", "price_low", "price_high", "rating" |

**Example:**

```http
GET /deals/search?query=iPhone%2015&platforms=amazon,flipkart&sortBy=price_low
```

**Response:** `200 OK`

```json
{
	"query": "iPhone 15",
	"totalResults": 12,
	"groupedResults": 3,
	"fromCache": false,
	"products": [
		{
			"title": "Apple iPhone 15 (128GB)",
			"normalizedTitle": "apple iphone 15",
			"platforms": ["amazon", "flipkart"],
			"prices": {
				"amazon": 79900,
				"flipkart": 79999
			},
			"bestPrice": 79900,
			"bestPlatform": "amazon",
			"rating": 4.6,
			"reviews": 3421,
			"image": "https://...",
			"urls": {
				"amazon": "https://www.amazon.in/...",
				"flipkart": "https://www.flipkart.com/..."
			},
			"discount": 15,
			"category": "electronics",
			"brand": "apple"
		}
	]
}
```

---

### Get Live Deals

Fetch current live deals from automated scraping.

```http
GET /deals/live
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| platform | string | No | Filter by platform |
| category | string | No | Filter by category |
| limit | number | No | Number of results (default: 20) |
| minDiscount | number | No | Minimum discount percentage |

**Example:**

```http
GET /deals/live?platform=amazon&minDiscount=20&limit=10
```

**Response:** `200 OK`

```json
{
	"deals": [
		{
			"_id": "507f1f77bcf86cd799439011",
			"title": "Samsung Galaxy M34 5G",
			"normalizedTitle": "samsung galaxy m34 5g",
			"price": 16999,
			"originalPrice": 24999,
			"discount": 32,
			"platform": "amazon",
			"url": "https://www.amazon.in/...",
			"image": "https://...",
			"rating": 4.3,
			"reviews": 1847,
			"category": "electronics",
			"brand": "samsung",
			"expiresAt": "2025-12-08T12:00:00.000Z",
			"createdAt": "2025-12-07T12:00:00.000Z"
		}
	],
	"total": 47,
	"page": 1
}
```

---

### Manually Add Deal

Add a product as a deal (admin/seller only).

```http
POST /deals/scrape
```

**Headers:**

```http
Authorization: Bearer <token>
```

**Request Body:**

```json
{
	"url": "https://www.amazon.in/dp/PRODUCTID"
}
```

**Response:** `201 Created`

```json
{
  "message": "Deal added successfully",
  "deal": { ... }
}
```

---

### Trigger Live Scraping

Scrape platforms in real-time for a search query.

```http
POST /deals/scrape-search
```

**Headers:**

```http
Authorization: Bearer <token>
```

**Request Body:**

```json
{
	"query": "wireless earbuds",
	"platforms": ["amazon", "flipkart"]
}
```

**Response:** `200 OK`

```json
{
	"message": "Live scraping completed",
	"results": {
		"total": 5,
		"success": 4,
		"failed": 1,
		"platforms": {
			"amazon": { "success": 2, "failed": 0 },
			"flipkart": { "success": 2, "failed": 1 }
		}
	}
}
```

---

## 📊 Price History Endpoints

### Get Price History

Retrieve historical price data for a product.

```http
GET /prices/:productId
```

**Headers:**

```http
Authorization: Bearer <token>
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| days | number | No | Number of days (default: 180) |

**Example:**

```http
GET /prices/B0XXXXXXXX?days=30
```

**Response:** `200 OK`

```json
{
	"productId": "B0XXXXXXXX",
	"history": [
		{
			"price": 124999,
			"timestamp": "2025-12-07T00:00:00.000Z",
			"platform": "amazon"
		},
		{
			"price": 119999,
			"timestamp": "2025-12-06T00:00:00.000Z",
			"platform": "amazon"
		}
	],
	"stats": {
		"currentPrice": 124999,
		"lowestPrice": 119999,
		"highestPrice": 129999,
		"averagePrice": 124332,
		"priceDropPercentage": -4.16
	}
}
```

---

### Get Price Summary

Get price analysis and buy recommendations.

```http
GET /summary/:productId
```

**Headers:**

```http
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
	"productId": "B0XXXXXXXX",
	"currentPrice": 124999,
	"lowestPrice": 119999,
	"highestPrice": 129999,
	"averagePrice": 124332,
	"recommendation": "Wait for better deal 🕒",
	"priceDropPercentage": -4.16,
	"daysTracked": 30,
	"trend": "decreasing"
}
```

---

## 🔔 Alert Endpoints

### Create Price Alert

Set up a notification for price drops.

```http
POST /alerts
```

**Headers:**

```http
Authorization: Bearer <token>
```

**Request Body:**

```json
{
	"productId": "B0XXXXXXXX",
	"targetPrice": 110000,
	"currentPrice": 124999
}
```

**Response:** `201 Created`

```json
{
	"message": "Alert created successfully",
	"alert": {
		"_id": "507f1f77bcf86cd799439011",
		"userId": "507f1f77bcf86cd799439012",
		"productId": "B0XXXXXXXX",
		"targetPrice": 110000,
		"currentPrice": 124999,
		"isActive": true,
		"createdAt": "2025-12-07T12:00:00.000Z"
	}
}
```

---

### Get User Alerts

Retrieve all alerts for authenticated user.

```http
GET /alerts
```

**Headers:**

```http
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
	"alerts": [
		{
			"_id": "507f1f77bcf86cd799439011",
			"productId": "B0XXXXXXXX",
			"targetPrice": 110000,
			"currentPrice": 124999,
			"isActive": true,
			"createdAt": "2025-12-07T12:00:00.000Z"
		}
	],
	"total": 5
}
```

---

## 📋 Tracklist Endpoints

### Add to Tracklist

Add a product to user's watchlist.

```http
POST /tracklist
```

**Headers:**

```http
Authorization: Bearer <token>
```

**Request Body:**

```json
{
	"productId": "B0XXXXXXXX",
	"platform": "amazon",
	"title": "Samsung Galaxy S24 Ultra",
	"price": 124999,
	"url": "https://www.amazon.in/dp/B0XXXXXXXX",
	"image": "https://..."
}
```

**Response:** `201 Created`

```json
{
  "message": "Product added to tracklist",
  "tracklist": { ... }
}
```

---

### Get User Tracklist

Retrieve user's saved products.

```http
GET /tracklist
```

**Headers:**

```http
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
	"tracklist": [
		{
			"productId": "B0XXXXXXXX",
			"platform": "amazon",
			"title": "Samsung Galaxy S24 Ultra",
			"price": 124999,
			"url": "https://www.amazon.in/dp/B0XXXXXXXX",
			"image": "https://...",
			"addedAt": "2025-12-07T12:00:00.000Z"
		}
	],
	"total": 12
}
```

---

### Remove from Tracklist

Remove a product from watchlist.

```http
DELETE /tracklist/:productId
```

**Headers:**

```http
Authorization: Bearer <token>
```

**Response:** `200 OK`

```json
{
	"message": "Product removed from tracklist"
}
```

---

## 🚫 Error Codes

| Code | Description                             |
| ---- | --------------------------------------- |
| 200  | Success                                 |
| 201  | Created                                 |
| 400  | Bad Request - Invalid input             |
| 401  | Unauthorized - Missing or invalid token |
| 403  | Forbidden - Insufficient permissions    |
| 404  | Not Found - Resource doesn't exist      |
| 429  | Too Many Requests - Rate limit exceeded |
| 500  | Internal Server Error                   |

---

## 🔒 Rate Limiting

### Scraping Endpoints

- **Limit**: 3 requests per minute per IP
- **Window**: 60 seconds
- **Response Header**: `X-RateLimit-Remaining`

### Other Endpoints

- **Limit**: 100 requests per 15 minutes per IP
- **Window**: 900 seconds

---

## 📝 Request Examples

### cURL Examples

#### Register User

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

#### Search Products

```bash
curl "http://localhost:5000/api/deals/search?query=iPhone%2015&sortBy=price_low"
```

#### Scrape Product

```bash
curl -X POST http://localhost:5000/api/scrape/amazon \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.amazon.in/dp/B0XXXXXXXX"}'
```

### JavaScript (Axios) Examples

#### Login

```javascript
const response = await axios.post("http://localhost:5000/api/auth/login", {
	email: "john@example.com",
	password: "password123",
});

const { token, user } = response.data;
```

#### Search with Authentication

```javascript
const response = await axios.get("http://localhost:5000/api/deals/search", {
	params: {
		query: "iPhone 15",
		platforms: "amazon,flipkart",
		sortBy: "price_low",
	},
	headers: {
		Authorization: `Bearer ${token}`,
	},
});
```

---

## 🔄 Webhooks (Future Feature)

Webhook support for price drop notifications coming soon.

---

## 📞 Support

For API issues or questions:

- GitHub Issues: https://github.com/GollaBharath/markethub-demo/issues
- Email: api-support@markethub.com

---

## 📜 Changelog

### v1.0.0 (2025-12-07)

- Initial API release
- Authentication endpoints
- Multi-platform scraping
- Smart search with fuzzy matching
- Price history tracking
- Alerts and tracklist management
- Live deals system

---

## 📄 License

MIT License - See LICENSE file for details
