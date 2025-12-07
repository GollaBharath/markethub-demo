# MarketHub Backend

TypeScript/Node.js backend service for the MarketHub e-commerce price tracking platform.

## 🎯 Overview

This backend service provides RESTful APIs for:

- User authentication and authorization
- Multi-platform product scraping (Amazon, Flipkart, Meesho, Myntra, Ajio)
- Price history tracking and analytics
- Price alerts and notifications
- Smart product search with fuzzy matching
- Live deals management with automated scraping
- User tracklist management

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Cache**: Redis
- **Queue**: RabbitMQ
- **Scraping**: Puppeteer, Playwright, Cheerio
- **Authentication**: JWT (JSON Web Tokens)
- **Scheduling**: node-cron

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/              # Configuration files
│   │   ├── database.ts      # MongoDB connection
│   │   ├── redis.ts         # Redis connection
│   │   └── rabbit.ts        # RabbitMQ connection
│   │
│   ├── controllers/         # Request handlers
│   │   ├── authController.ts
│   │   ├── adminAuthController.ts
│   │   ├── dealController.ts
│   │   ├── scraperController.ts
│   │   ├── priceController.ts
│   │   ├── alertController.ts
│   │   ├── tracklistController.ts
│   │   └── summaryController.ts
│   │
│   ├── middleware/          # Express middleware
│   │   └── authMiddleware.ts
│   │
│   ├── models/              # Mongoose models
│   │   ├── User.ts
│   │   ├── Deal.ts
│   │   ├── PriceHistory.ts
│   │   └── Alert.ts
│   │
│   ├── routes/              # API routes
│   │   ├── authRoutes.ts
│   │   ├── adminAuthRoutes.ts
│   │   ├── dealRoutes.ts
│   │   ├── scraperRoutes.ts
│   │   ├── priceRoutes.ts
│   │   ├── alertRoutes.ts
│   │   ├── tracklistRoutes.ts
│   │   └── summaryRoutes.ts
│   │
│   ├── scrapers/            # Platform scrapers
│   │   ├── amazonScraper.ts
│   │   ├── flipkartScraper.ts
│   │   ├── meeshoScraper.ts
│   │   ├── myntraScraper.ts
│   │   ├── ajioScraper.ts
│   │   └── index.ts
│   │
│   ├── jobs/                # Background jobs
│   │   ├── scrapeScheduler.ts
│   │   └── dealsScheduler.ts
│   │
│   ├── utils/               # Utility functions
│   │   ├── productMatcher.ts
│   │   ├── recommendation.ts
│   │   ├── cleanupInvalidDeals.ts
│   │   └── createAdmin.ts
│   │
│   ├── types/               # TypeScript definitions
│   │   ├── index.ts
│   │   └── bcryptjs.d.ts
│   │
│   └── server.ts            # Application entry point
│
├── dist/                    # Compiled JavaScript
├── .env.example            # Environment variables template
├── package.json
└── tsconfig.json
```

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

- Node.js 18.x or higher
- MongoDB 6.x or higher
- Redis 7.x (optional but recommended)
- RabbitMQ 3.x (optional but recommended)

### Installation

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:

   ```env
   # Server
   PORT=5000
   NODE_ENV=development

   # Database
   MONGODB_URI=mongodb://localhost:27017/markethub

   # Authentication
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

   # Redis (optional)
   REDIS_URL=redis://localhost:6379

   # RabbitMQ (optional)
   RABBITMQ_URL=amqp://localhost

   # Admin Credentials
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=admin123
   ```

3. **Start required services**

   ```bash
   # MongoDB
   mongod --dbpath=/path/to/data

   # Redis (optional)
   redis-server

   # RabbitMQ (optional)
   rabbitmq-server
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

   The server will start on http://localhost:5000

### Production Build

```bash
# Build TypeScript to JavaScript
npm run build

# Start production server
npm start
```

## 📡 API Overview

Base URL: `http://localhost:5000/api`

### Authentication Endpoints

- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/admin` - Admin login

### Product Scraping

- `POST /scrape/amazon` - Scrape Amazon product
- `POST /scrape/flipkart` - Scrape Flipkart product
- `POST /scrape/meesho` - Scrape Meesho product
- `POST /scrape/myntra` - Scrape Myntra product
- `POST /scrape/ajio` - Scrape Ajio product

### Deals & Search

- `GET /deals/search` - Smart product search across platforms
- `GET /deals/live` - Get live deals from all platforms
- `POST /deals/scrape` - Add a deal manually
- `POST /deals/scrape-search` - Trigger live scraping for search query

### Price History

- `GET /prices/:productId` - Get price history for a product
- `GET /summary/:productId` - Get price summary and recommendations

### Alerts

- `POST /alerts` - Create price alert
- `GET /alerts` - Get user's price alerts

### Tracklist

- `POST /tracklist` - Add product to tracklist
- `GET /tracklist` - Get user's tracklist
- `DELETE /tracklist/:productId` - Remove from tracklist

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference.

## 🔧 Features

### Multi-Platform Scraping

- **Amazon India** - Full support with rating, reviews, images
- **Flipkart** - Product details with pricing
- **Meesho** - Budget products scraping
- **Myntra** - Fashion-focused scraping
- **Ajio** - Fashion and lifestyle products

### Smart Product Matching

- Fuzzy title matching using Jaccard similarity
- Normalization removes sizes, colors, common words
- Brand detection from product titles
- Category classification (electronics, fashion, etc.)
- 60%+ similarity threshold for grouping

### Automated Scraping

- **Deal Scheduler**: Runs every 6 hours
- **Initial Scrape**: 30 seconds after server start
- **Auto-Cleanup**: Expired deals removed via TTL indexes
- **Rate Limiting**: 3 requests/minute per platform

### Caching Strategy

- **Search Results**: 5-minute TTL in Redis
- **Cache Keys**: Include query + filters + sort
- **Auto-Invalidation**: When new deals added
- **Cache Indicator**: `fromCache` flag in responses

### Price Analytics

- Historical price tracking with timestamps
- Average, minimum, maximum price calculation
- Buy recommendations based on price trends
- Price drop percentage calculation

## 🧪 Testing & Debugging

### Manual API Testing

```bash
# Test user registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'

# Test product search
curl "http://localhost:5000/api/deals/search?query=iPhone%2015&sortBy=price_low"

# Test scraping (requires auth token)
curl -X POST http://localhost:5000/api/scrape/amazon \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.amazon.in/dp/PRODUCT_ID"}'
```

### Database Management

```bash
# Clean invalid deals from database
npm run cleanup:deals

# Access MongoDB shell
mongosh markethub

# Common MongoDB commands
db.deals.countDocuments()
db.deals.find({ platform: "amazon" })
db.users.find()
```

### Redis Cache Inspection

```bash
# Connect to Redis CLI
redis-cli

# Check cached searches
KEYS "search:*"

# View cache content
GET "search:query:iphone"

# Clear all cache
FLUSHALL
```

## 🔒 Security

### Authentication

- JWT tokens with configurable expiration
- Password hashing using bcryptjs (10 rounds)
- Role-based access control (user, seller, admin)
- Protected routes with middleware

### Rate Limiting

- 3 requests/minute for scraping endpoints
- Prevents abuse and server overload
- Per-IP tracking

### Input Validation

- URL validation for scraping endpoints
- Price range validation for searches
- Query sanitization to prevent injection

### Anti-Bot Measures

- Puppeteer stealth mode
- Randomized user agents
- Request delays and throttling
- Headless browser detection evasion

## 🔄 Background Jobs

### Deal Scheduler

- **Frequency**: Every 6 hours
- **Initial Run**: 30 seconds after server start
- **Function**: Scrapes all platforms for deals
- **Cleanup**: Removes expired deals (24-hour TTL)

### Price Update Scheduler

- **Frequency**: Daily at 3:00 AM
- **Function**: Updates tracked product prices
- **Notifications**: Triggers price alerts

## 📊 Database Schema

### User Model

```typescript
{
	name: string;
	email: string(unique, indexed);
	password: string(hashed);
	role: "user" | "seller" | "admin";
	createdAt: Date;
	updatedAt: Date;
}
```

### Deal Model

```typescript
{
  title: string (indexed)
  normalizedTitle: string (indexed)
  price: number
  originalPrice: number
  discount: number
  platform: string (indexed)
  url: string
  image: string
  rating: number
  reviews: number
  category: string
  brand: string
  expiresAt: Date (TTL index)
  createdAt: Date
}
```

### PriceHistory Model

```typescript
{
	productId: string(indexed);
	platform: string;
	price: number;
	timestamp: Date;
	title: string;
	url: string;
}
```

### Alert Model

```typescript
{
	userId: ObjectId(indexed);
	productId: string;
	targetPrice: number;
	currentPrice: number;
	isActive: boolean;
	createdAt: Date;
}
```

## 🐛 Troubleshooting

### MongoDB Connection Issues

```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod

# Check connection string in .env
MONGODB_URI=mongodb://localhost:27017/markethub
```

### Redis Connection Issues

```bash
# Check if Redis is running
redis-cli ping

# Start Redis
redis-server

# Use fallback if Redis unavailable (app continues without caching)
```

### Scraping Failures

- Check if target website structure changed
- Verify anti-bot measures aren't blocking requests
- Review puppeteer/playwright logs
- Test scraper selectors manually

### Port Already in Use

```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>
```

## 📝 Development Guidelines

### Code Style

- Use TypeScript strict mode
- Follow ESLint configuration
- Use async/await over promises
- Implement proper error handling
- Add JSDoc comments for complex functions

### Git Workflow

- Create feature branches from `main`
- Use descriptive commit messages
- Test before pushing
- Create PRs for review

### Adding New Scrapers

1. Create scraper in `src/scrapers/newPlatform.ts`
2. Export from `src/scrapers/index.ts`
3. Add route in `src/routes/scraperRoutes.ts`
4. Update controller in `src/controllers/scraperController.ts`
5. Add rate limiting
6. Test thoroughly

## 📄 License

MIT License - see LICENSE file for details

## 📞 Support

For issues, questions, or contributions:

- Open an issue on GitHub
- Email: support@markethub.com
