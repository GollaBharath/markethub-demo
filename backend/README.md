# MarketHub Backend 🚀

A robust TypeScript backend for price tracking and comparison across e-commerce platforms.

## ✅ Status: Production Ready

- **Type Errors:** 0
- **Build Status:** ✅ Success
- **Test Coverage:** All endpoints functional
- **Code Quality:** Strict TypeScript mode enabled

## 🎯 Features

### Core Functionality

- ✅ **User Authentication** - Register, login with JWT
- ✅ **Admin Portal** - Separate admin authentication
- ✅ **Product Scraping** - Real-time Amazon price scraping
- ✅ **Price History** - Track price changes over time
- ✅ **Price Alerts** - Get notified when prices drop
- ✅ **User Tracklist** - Save and track favorite products
- ✅ **Price Analysis** - AI-powered buy recommendations

### Technical Features

- ✅ **TypeScript** - Full type safety with strict mode
- ✅ **Rate Limiting** - Protection against abuse
- ✅ **Background Jobs** - Automated daily price updates
- ✅ **Queue System** - RabbitMQ for async tasks
- ✅ **Caching** - Redis for performance
- ✅ **Web Scraping** - Puppeteer with stealth mode

## 🛠️ Tech Stack

- **Runtime:** Node.js + Express + TypeScript
- **Database:** MongoDB + Mongoose
- **Cache:** Redis
- **Queue:** RabbitMQ
- **Scraping:** Puppeteer + Cheerio
- **Auth:** JWT + bcryptjs

## 📦 Installation

### Prerequisites

- Node.js 18.x or higher
- MongoDB running locally or remote
- Redis (optional, for caching)
- RabbitMQ (optional, for background jobs)

### Setup Steps

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Configure Environment**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start Services**

   ```bash
   # Make sure MongoDB is running
   mongod

   # (Optional) Start Redis
   redis-server

   # (Optional) Start RabbitMQ
   rabbitmq-server
   ```

4. **Run Development Server**

   ```bash
   npm run dev
   ```

5. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

## 🌐 API Endpoints

### Base URL: `http://localhost:5000/api`

#### Authentication

- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/admin` - Admin login

#### Scraping

- `POST /scrape/amazon` - Scrape Amazon product (rate-limited)

#### Price Data

- `GET /prices/:productId` - Get price history
- `GET /summary/:productId` - Get price summary & recommendation

#### Alerts

- `POST /alerts` - Create price alert
- `GET /alerts` - Get user's alerts

#### Tracklist

- `POST /tracklist` - Add product to tracklist
- `GET /tracklist` - Get user's tracklist
- `DELETE /tracklist/:productId` - Remove from tracklist

📖 **Full API Documentation:** See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

## 🔐 Environment Variables

```env
# MongoDB
MONGO_URI=mongodb://localhost:27017/markethub

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_change_this

# Server
PORT=5000

# Redis (Optional)
REDIS_URL=redis://127.0.0.1:6379

# RabbitMQ (Optional)
RABBITMQ_URL=amqp://localhost
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Database, Redis, RabbitMQ configs
│   ├── controllers/     # Request handlers
│   ├── jobs/            # Cron jobs and schedulers
│   ├── middleware/      # Auth middleware
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API route definitions
│   ├── scrapers/        # Web scraping logic
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Helper functions
│   └── server.ts        # Application entry point
├── dist/                # Compiled JavaScript output
├── .env.example         # Environment template
├── package.json
├── tsconfig.json
├── API_DOCUMENTATION.md # Complete API docs
└── BUILD_SUMMARY.md     # Build details
```

## 🚀 Scripts

```bash
# Development (with hot reload)
npm run dev

# Build TypeScript to JavaScript
npm run build

# Production (run compiled code)
npm start
```

## 🎨 Code Quality

- ✅ **TypeScript Strict Mode** - Maximum type safety
- ✅ **No Type Errors** - 100% type coverage
- ✅ **Error Handling** - Comprehensive try-catch blocks
- ✅ **Input Validation** - All endpoints validated
- ✅ **Rate Limiting** - Prevents abuse
- ✅ **Security** - JWT, bcrypt, CORS configured

## ⚡ Performance

- **Rate Limiting:** 3 requests/min for scraping
- **Headless Scraping:** Optimized Puppeteer config
- **Database Indexing:** Fast queries on productId
- **Background Jobs:** Scheduled at 3 AM daily
- **Efficient Filtering:** Type-safe array operations

## 🔄 Background Jobs

### Daily Price Scraper

- **Schedule:** Every day at 3:00 AM
- **Function:** Updates prices for all tracked products
- **Location:** `src/jobs/scrapeScheduler.ts`

## 🐛 Troubleshooting

### Build Fails

```bash
# Ensure TypeScript is executable
chmod +x node_modules/.bin/tsc
npm run build
```

### MongoDB Connection Error

```bash
# Check if MongoDB is running
mongod --version
# Start MongoDB
mongod
```

### Redis Connection Error

Redis is optional. The app will work without it, but caching will be disabled.

### RabbitMQ Connection Error

RabbitMQ is optional. The app will work without it, but background alert processing will be disabled.

## 🔗 Frontend Integration

This backend is designed to work with the MarketHub frontend located in `../frontend`.

**Frontend Base URL:** Configure in frontend's `axiosInstance.ts`

```typescript
baseURL: "http://localhost:5000/api";
```

## 📝 License

MIT

## 👨‍💻 Development

Built with ❤️ for efficient price tracking and comparison.

**Status:** ✅ Production Ready  
**Last Updated:** December 7, 2025  
**TypeScript Version:** 5.9.3
