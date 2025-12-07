# MarketHub - E-commerce Price Tracking & Comparison Platform

A full-stack web application that enables users to track, compare, and monitor product prices across multiple e-commerce platforms including Amazon, Flipkart, Meesho, Myntra, and Ajio.

## 🌟 Features

### Core Functionality

- **Multi-Platform Price Tracking** - Track products from 5 major e-commerce platforms
- **Smart Product Search** - Intelligent cross-platform search with fuzzy matching
- **Live Deals System** - Automated deal discovery and scraping every 6 hours
- **Price History Analytics** - Historical price tracking with visual charts
- **Price Alerts** - Get notified when product prices drop
- **User Tracklist** - Save and monitor your favorite products
- **AI-Powered Recommendations** - Smart buy/wait suggestions based on price trends

### Technical Highlights

- **Real-time Scraping** - Automated web scraping with anti-bot protection
- **Redis Caching** - Fast response times with 5-minute cache TTL
- **Background Jobs** - Scheduled tasks for price updates and deal scraping
- **JWT Authentication** - Secure user authentication and authorization
- **Role-Based Access** - Support for users, sellers, and admins
- **Responsive Design** - Modern UI with shadcn/ui components

## 🛠️ Tech Stack

### Frontend

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **UI Library**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Charts**: Recharts
- **HTTP Client**: Axios

### Backend

- **Runtime**: Node.js + Express + TypeScript
- **Database**: MongoDB with Mongoose
- **Cache**: Redis
- **Queue**: RabbitMQ
- **Scraping**: Puppeteer + Cheerio + Playwright
- **Authentication**: JWT + bcryptjs
- **Job Scheduling**: node-cron

## 📦 Project Structure

```
markethub-demo/
├── backend/           # Express TypeScript backend
│   ├── src/
│   │   ├── config/    # Database, Redis, RabbitMQ configs
│   │   ├── controllers/ # Request handlers
│   │   ├── jobs/      # Scheduled tasks
│   │   ├── middleware/ # Auth middleware
│   │   ├── models/    # MongoDB schemas
│   │   ├── routes/    # API routes
│   │   ├── scrapers/  # Platform-specific scrapers
│   │   ├── types/     # TypeScript definitions
│   │   ├── utils/     # Helper functions
│   │   └── server.ts  # Entry point
│   └── package.json
│
└── frontend/          # React TypeScript frontend
    ├── src/
    │   ├── api/       # API client functions
    │   ├── components/ # React components
    │   ├── hooks/     # Custom React hooks
    │   ├── pages/     # Page components
    │   ├── store/     # Zustand stores
    │   └── lib/       # Utility functions
    └── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- MongoDB (local or remote)
- Redis (optional, for caching)
- RabbitMQ (optional, for background jobs)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/GollaBharath/markethub-demo.git
   cd markethub-demo
   ```

2. **Setup Backend**

   ```bash
   cd backend
   npm install
   ```

   **Configure Environment Variables** (`backend/.env`):

   ```env
   MONGODB_URI=mongodb://127.0.0.1:27017/markethub
   JWT_SECRET=your_super_secret_jwt_key_change_this
   PORT=5000
   REDIS_URL=redis://127.0.0.1:6379  # Optional
   RABBITMQ_URL=amqp://localhost      # Optional
   ```

3. **⚠️ Generate Mock Data (REQUIRED)**

   ```bash
   cd backend
   npm run seed
   ```

   **This step is mandatory!** The seed script generates:

   - 61 users (1 admin, 10 sellers, 50 users)
   - ~45-60 products across 5 platforms
   - 90 days of price history
   - 30 price alerts
   - User tracklists

4. **Start Backend Server**

   ```bash
   cd backend
   npm run dev
   ```

5. **Setup Frontend**

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

6. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

### 🔑 Default Login Credentials

After running `npm run seed`, login with these accounts:

**Admin:**

- Email: `admin@markethub.com`
- Password: `password123`

**Seller:**

- Email: `seller1@example.com` (or seller2...seller10)
- Password: `password123`

**User:**

- Email: `user1@example.com` (or user2...user50)
- Password: `password123`

### 📦 Generated Mock Data

The seed script creates realistic data including:

**Products:**

- Smartphones: iPhone 15 Pro, Samsung Galaxy S24 Ultra, OnePlus 12, Google Pixel 8 Pro
- Laptops: MacBook Air M3, Dell XPS 15, Lenovo ThinkPad X1 Carbon
- Electronics: Sony WH-1000XM5, Bose QuietComfort 45, Fossil Gen 6, JBL Flip 6
- Fashion: Nike Air Jordan 1, Adidas Ultraboost, Ray-Ban Aviators
- Tablets: iPad Pro 12.9 M2

**Features:**

- Multi-platform pricing (2-4 platforms per product)
- 90 days of historical price data
- Realistic price fluctuations
- Product ratings and reviews
- Platform-specific variations (~2-5% price differences)

### 🔄 Re-seeding Data

To regenerate fresh mock data:

```bash
cd backend
npm run seed
```

## 📚 Documentation

- [Backend README](./backend/README.md) - Backend setup and API overview
- [Frontend README](./frontend/README.md) - Frontend setup and components
- [API Documentation](./backend/API_DOCUMENTATION.md) - Complete API reference

## 🎯 Usage

### For Users

1. **Register/Login** - Create an account at `/register/user` or login at `/login/user`
2. **Search Products** - Search for products across Amazon, Flipkart, Meesho, Myntra, and Ajio
3. **View Live Deals** - Browse automatically scraped deals (updated every 6 hours)
4. **Track Products** - Add products to your personal tracklist
5. **Set Price Alerts** - Get notified when product prices drop below your target
6. **View Analytics** - Check price history charts and trends
7. **Get Recommendations** - AI-powered buy/wait suggestions based on price patterns

### For Sellers

1. **Register/Login** - Create a seller account at `/register/seller` or login at `/login/seller`
2. **Monitor Competition** - Track competitor prices and strategies
3. **View Market Insights** - Analyze market trends and pricing patterns
4. **Track Interests** - Monitor customer interests and trending products
5. **Get Analytics** - Access detailed seller dashboard with performance metrics

### For Admins

1. **Admin Login** - Login at `/login/admin` with:

   - Username: `admin`
   - Password: `admin123`

2. **Admin Dashboard** - View comprehensive platform analytics:

   - Total users, sellers, products, and alerts
   - User growth trends over time
   - Category popularity distribution

3. **User Management** (`/admin/users`):

   - View all registered users
   - Monitor user activity (last login, tracklist size)
   - Delete inactive users

4. **Seller Management** (`/admin/sellers`):

   - View all registered sellers
   - Track seller activity and status
   - Monitor active vs inactive sellers

5. **Product Analytics** (`/admin/products`):

   - View all tracked products
   - Analyze products by platform and category
   - Monitor pricing statistics and trends

6. **Sales Trends** (`/admin/trends`):

   - Price tracking activity over time
   - Alert creation patterns
   - Top deals by discount percentage
   - Platform performance comparison

7. **System Logs** (`/admin/logs`):

   - Monitor all system activities
   - Filter by user, product, or alert activities
   - Track recent updates and changes

8. **Product CRUD** (`/admin/manage`):

   - Search and filter products
   - Edit product details (price, category, brand)
   - Delete invalid or outdated products

9. **Reports Management** (`/admin/reports`):
   - View user and seller reported issues
   - Update report status (pending/in-progress/resolved)
   - Categorize reports by type

### 🔌 API Endpoints

**Admin APIs** (`/api/admin/*` - Requires admin authentication):

- `GET /admin/analytics` - Dashboard analytics
- `GET /admin/users` - All users with stats
- `GET /admin/sellers` - All sellers
- `GET /admin/products` - All products
- `GET /admin/trends` - Sales trends
- `GET /admin/logs` - System logs
- `DELETE /admin/users/:userId` - Delete user
- `DELETE /admin/products/:productId` - Delete product
- `PUT /admin/products/:productId` - Update product

**Seller APIs** (`/api/seller/*` - Requires seller authentication):

- `GET /seller/dashboard` - Seller dashboard data
- `GET /seller/competition` - Competitor analysis
- `GET /seller/trending` - Trending products
- `GET /seller/interests` - Customer interests
- `GET /seller/insights` - Sales insights

**User APIs** (Requires user authentication where noted):

- `GET /api/deals/search` - Search products (public)
- `GET /api/deals/live` - Get live deals (public)
- `GET /api/deals/product/:id` - Get product details (public)
- `GET /api/tracklist` - User's tracklist (auth)
- `POST /api/tracklist` - Add to tracklist (auth)
- `DELETE /api/tracklist/:id` - Remove from tracklist (auth)
- `GET /api/alerts` - User's alerts (auth)
- `POST /api/alerts` - Create price alert (auth)
- `GET /api/prices/:productId` - Price history (public)

## 🔧 Development

### Backend Development

```bash
cd backend
npm run dev          # Start development server with tsx watch mode
npm run build        # Build TypeScript to JavaScript
npm start           # Run production build
```

**Utility Scripts:**

```bash
# Generate mock data (run before first start)
npm run seed

# Clean invalid deals from database
npm run cleanup:deals
```

### Frontend Development

```bash
cd frontend
npm run dev          # Start development server (Vite)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Database Setup

**MongoDB:**

```bash
# Local MongoDB
mongod --dbpath /path/to/data

# Or use MongoDB Atlas (cloud)
# Update MONGO_URI in backend/.env
```

**Redis (Optional):**

```bash
# Start Redis server
redis-server

# Or use Redis Cloud
# Update REDIS_URL in backend/.env
```

**RabbitMQ (Optional):**

```bash
# Start RabbitMQ server
rabbitmq-server

# Access management UI
# http://localhost:15672
```

## 🧪 Testing

### Authentication

```bash
# Admin Login
curl -X POST http://localhost:5000/api/auth/admin \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# User Registration
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"password123"}'

# User Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Test Scrapers

```bash
# Test Amazon scraper
curl -X POST http://localhost:5000/api/scrape/amazon \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"url": "AMAZON_PRODUCT_URL"}'

# Test Flipkart scraper
curl -X POST http://localhost:5000/api/scrape/flipkart \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"url": "FLIPKART_PRODUCT_URL"}'
```

### Test Search & Deals

```bash
# Search for products
curl "http://localhost:5000/api/deals/search?query=iPhone%2015"

# Get live deals (no auth required)
curl "http://localhost:5000/api/deals/live?platform=amazon&limit=10"

# Get live deals with filters
curl "http://localhost:5000/api/deals/live?platform=flipkart&category=electronics&limit=20"
```

### Test Admin Endpoints

```bash
# Get admin analytics (requires admin token)
curl http://localhost:5000/api/admin/analytics \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Get all users
curl http://localhost:5000/api/admin/users \
  -H "Authorization: Bearer ADMIN_TOKEN"

# Get sales trends
curl http://localhost:5000/api/admin/trends \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- Rate limiting on API endpoints
- CORS protection
- Input validation and sanitization
- Protected routes with middleware

## 📈 Performance Optimizations

- Redis caching for search results (5-min TTL)
- MongoDB indexes for fast queries
- TTL indexes for automatic deal cleanup
- Efficient product matching algorithms
- Background job processing
- Optimized scraping with request throttling

## 🐛 Troubleshooting

**"No products displayed"**

- Run the seed script: `cd backend && npm run seed`
- Ensure MongoDB is running
- Check backend console for errors

**"Connection failed" / Database errors**

- Verify MongoDB is running: `mongod` or check MongoDB service
- Check MONGODB_URI in `backend/.env`
- Default: `mongodb://127.0.0.1:27017/markethub`

**"401 Unauthorized" errors**

- Ensure you're logged in
- Check JWT token in browser localStorage
- Try logging in again

**Frontend not loading**

- Check if backend is running on port 5000
- Verify CORS settings in backend
- Check browser console for errors

**No data after seeding**

- Ensure seed script completed successfully
- Check MongoDB for collections: `users`, `deals`, `pricehistories`, `alerts`
- Backend should show: "✅ Mock data generation completed successfully!"

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- shadcn/ui for beautiful UI components
- Puppeteer team for scraping capabilities
- MongoDB, Redis, and RabbitMQ communities

## 📧 Support

For support, email support@markethub.com or open an issue in the repository.

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Browser extension for quick price checks
- [ ] More e-commerce platforms
- [ ] Advanced price prediction with ML
- [ ] Social sharing of deals
- [ ] Wishlist sharing between users
