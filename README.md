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
   cp .env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

3. **Setup Frontend**

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access the Application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000

### Environment Variables

#### Backend (.env)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/markethub
JWT_SECRET=your-secret-key-here
REDIS_URL=redis://localhost:6379
RABBITMQ_URL=amqp://localhost
NODE_ENV=development
```

#### Frontend (.env)

```env
VITE_API_URL=http://localhost:5000
```

## 📚 Documentation

- [Backend README](./backend/README.md) - Backend setup and API overview
- [Frontend README](./frontend/README.md) - Frontend setup and components
- [API Documentation](./backend/API_DOCUMENTATION.md) - Complete API reference

## 🎯 Usage

### For Users

1. **Register/Login** - Create an account or login
2. **Search Products** - Search for products across platforms
3. **View Live Deals** - Browse automatically scraped deals
4. **Track Products** - Add products to your tracklist
5. **Set Price Alerts** - Get notified when prices drop
6. **View Analytics** - Check price history and trends

### For Admins

1. **Admin Login** - Access admin portal with credentials
2. **Monitor System** - View scraping jobs and system health
3. **Manage Users** - User management capabilities

## 🔧 Development

### Backend Development

```bash
cd backend
npm run dev          # Start development server
npm run build        # Build for production
npm start           # Run production build
npm run cleanup:deals # Clean invalid deals from database
```

### Frontend Development

```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

## 🧪 Testing

### Test Scrapers

```bash
# Test individual platform scrapers
curl -X POST http://localhost:5000/api/scrape/amazon \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"url": "AMAZON_PRODUCT_URL"}'
```

### Test Search

```bash
# Search for products
curl "http://localhost:5000/api/deals/search?query=iPhone%2015"
```

### Test Live Deals

```bash
# Get live deals
curl "http://localhost:5000/api/deals/live?platform=amazon&limit=10"
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
