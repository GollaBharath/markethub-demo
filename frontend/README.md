# MarketHub Frontend

React + TypeScript frontend application for the MarketHub e-commerce price tracking platform.

## 🎯 Overview

Modern, responsive web application built with React and TypeScript, featuring:

- Multi-platform product search and comparison
- Real-time price tracking with interactive charts
- Live deals discovery and browsing
- User authentication and personalization
- Price alerts and watchlist management
- Beautiful UI with shadcn/ui components

## 🛠️ Tech Stack

- **Framework**: React 18.3
- **Language**: TypeScript 5.6
- **Build Tool**: Vite 6.0
- **UI Components**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS 3.4
- **State Management**: Zustand
- **Charts**: Recharts
- **HTTP Client**: Axios
- **Routing**: React Router DOM 6.x
- **Forms**: React Hook Form + Zod validation
- **Icons**: Lucide React

## 📁 Project Structure

```
frontend/
├── src/
│   ├── api/                 # API client functions
│   │   ├── axiosInstance.ts # Axios configuration
│   │   ├── authApi.ts       # Authentication APIs
│   │   ├── dealApi.ts       # Deals APIs
│   │   ├── productApi.ts    # Product scraping APIs
│   │   ├── alertApi.ts      # Price alerts APIs
│   │   ├── tracklistApi.ts  # Tracklist APIs
│   │   ├── historyApi.ts    # Price history APIs
│   │   └── summaryApi.ts    # Summary APIs
│   │
│   ├── components/          # React components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── common/         # Shared components
│   │   │   ├── PriceHistoryChart.tsx
│   │   │   ├── FloatingTicker.tsx
│   │   │   └── ...
│   │   ├── layouts/        # Layout components
│   │   ├── NavLink.tsx
│   │   └── ProtectedRoute.tsx
│   │
│   ├── pages/              # Page components
│   │   ├── Landing.tsx
│   │   ├── Index.tsx
│   │   ├── NotFound.tsx
│   │   ├── auth/           # Auth pages
│   │   │   ├── Login.tsx
│   │   │   └── Register.tsx
│   │   ├── user/           # User pages
│   │   │   ├── UserDashboard.tsx
│   │   │   ├── UserSearch.tsx
│   │   │   ├── UserAlerts.tsx
│   │   │   └── UserTracklist.tsx
│   │   ├── seller/         # Seller pages
│   │   └── admin/          # Admin pages
│   │
│   ├── hooks/              # Custom React hooks
│   │   ├── use-deals.ts
│   │   ├── use-mobile.tsx
│   │   └── use-toast.ts
│   │
│   ├── store/              # Zustand stores
│   │   ├── authStore.ts
│   │   └── appStore.ts
│   │
│   ├── lib/                # Utility functions
│   │   └── utils.ts
│   │
│   ├── data/               # Static data
│   │   ├── products.json
│   │   ├── sellers.json
│   │   └── admin.json
│   │
│   ├── App.tsx             # Main app component
│   ├── main.tsx            # Application entry
│   └── index.css           # Global styles
│
├── public/                 # Static assets
│   └── robots.txt
│
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── components.json         # shadcn/ui config
└── package.json
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager

### Installation

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment**

   ```bash
   # Create .env file
   echo "VITE_API_URL=http://localhost:5000" > .env
   ```

3. **Start development server**

   ```bash
   npm run dev
   ```

   The application will start at http://localhost:5173

### Build for Production

```bash
# Create optimized production build
npm run build

# Preview production build locally
npm run preview
```

### Linting

```bash
# Run ESLint
npm run lint
```

## 📱 Features

### Public Pages

- **Landing Page** - Hero section with featured deals
- **Product Discovery** - Browse live deals from all platforms
- **Authentication** - Login and registration

### User Dashboard

- **Overview** - Personalized dashboard with trending products
- **Smart Search** - Cross-platform product search with filters
- **Price History** - Interactive charts showing price trends
- **Tracklist** - Manage saved products
- **Price Alerts** - Set and manage price notifications
- **Profile** - User settings and preferences

### Seller Portal

- **Dashboard** - Sales and performance metrics
- **Product Management** - Add/edit products
- **Analytics** - Detailed insights

### Admin Portal

- **System Overview** - Platform health and metrics
- **User Management** - Manage users and roles
- **Scraper Control** - Monitor and control scrapers

## 🎨 UI Components

### shadcn/ui Components Used

- **Layout**: Card, Sheet, Dialog, Tabs, Accordion
- **Forms**: Input, Button, Select, Checkbox, Radio, Switch
- **Data Display**: Table, Badge, Avatar, Progress
- **Navigation**: NavigationMenu, Breadcrumb
- **Feedback**: Toast, Alert, Skeleton
- **Overlay**: DropdownMenu, Popover, HoverCard

### Custom Components

- **PriceHistoryChart** - Recharts-based price visualization
- **FloatingTicker** - Animated deals ticker
- **ProductCard** - Product display card with multi-platform support
- **DealCard** - Deal display with discount badges
- **PlatformBadge** - Platform-specific branded badges

## 🔌 API Integration

### Authentication Flow

```typescript
// Register
const response = await authApi.register({ name, email, password });

// Login
const { token, user } = await authApi.login({ email, password });

// Store in Zustand
useAuthStore.getState().setAuth(user, token);
```

### Product Search

```typescript
// Search across platforms
const deals = await dealApi.searchProducts({
	query: "iPhone 15",
	platforms: ["amazon", "flipkart"],
	sortBy: "price_low",
});
```

### Price Tracking

```typescript
// Get price history
const history = await historyApi.getPriceHistory(productId, 30);

// Add to tracklist
await tracklistApi.addToTracklist(productId);

// Set price alert
await alertApi.createAlert({ productId, targetPrice: 50000 });
```

## 🎯 State Management

### Zustand Stores

#### Auth Store (`authStore.ts`)

```typescript
interface AuthState {
	user: User | null;
	token: string | null;
	isAuthenticated: boolean;
	login: (user: User, token: string) => void;
	logout: () => void;
}
```

#### App Store (`appStore.ts`)

```typescript
interface AppState {
	theme: "light" | "dark";
	setTheme: (theme: "light" | "dark") => void;
	// Other app-wide state
}
```

## 🎨 Styling

### Tailwind CSS

- Customized color palette matching brand
- Responsive breakpoints
- Custom animations
- Dark mode support

### CSS Variables

```css
:root {
	--background: 0 0% 100%;
	--foreground: 222.2 84% 4.9%;
	--primary: 222.2 47.4% 11.2%;
	/* ... */
}
```

## 🔧 Custom Hooks

### `use-deals.ts`

```typescript
// Fetch and transform live deals
const { deals, loading } = useDeals(limit);
```

### `use-mobile.tsx`

```typescript
// Responsive design helper
const isMobile = useMobile();
```

### `use-toast.ts`

```typescript
// Toast notifications
const { toast } = useToast();
toast({ title: "Success!", description: "Product added" });
```

## 🚦 Routing

### Route Structure

```typescript
/ - Landing page
/login - User login
/register - User registration
/user/dashboard - User dashboard (protected)
/user/search - Product search (protected)
/user/alerts - Price alerts (protected)
/user/tracklist - Saved products (protected)
/seller/dashboard - Seller portal (protected)
/admin/dashboard - Admin portal (protected)
```

### Protected Routes

```typescript
<ProtectedRoute>
	<UserDashboard />
</ProtectedRoute>
```

## 🧪 Development Tips

### Hot Module Replacement

Vite provides instant HMR - changes reflect immediately without full reload.

### TypeScript Strict Mode

```json
{
	"compilerOptions": {
		"strict": true,
		"noUnusedLocals": true,
		"noUnusedParameters": true,
		"noFallthroughCasesInSwitch": true
	}
}
```

### Code Organization

- Keep components small and focused
- Use TypeScript interfaces for props
- Extract reusable logic into hooks
- Maintain consistent file naming

### Performance Optimization

- Lazy load routes with React.lazy()
- Memoize expensive computations
- Use React.memo for pure components
- Optimize images and assets

## 🐛 Troubleshooting

### Port Already in Use

```bash
# Kill process on port 5173
lsof -i :5173
kill -9 <PID>

# Or use different port
npm run dev -- --port 3000
```

### API Connection Issues

Check `VITE_API_URL` in `.env`:

```bash
VITE_API_URL=http://localhost:5000
```

### TypeScript Errors

```bash
# Clear TypeScript cache
rm -rf node_modules/.vite

# Reinstall dependencies
npm install
```

### Build Errors

```bash
# Clean build cache
rm -rf dist node_modules/.vite

# Rebuild
npm run build
```

## 📦 Adding shadcn/ui Components

```bash
# Add a new component
npx shadcn@latest add button

# Add multiple components
npx shadcn@latest add card dialog tabs
```

## 🎯 Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🔒 Security Best Practices

- Tokens stored in memory (not localStorage)
- CSRF protection via SameSite cookies
- XSS prevention with React's built-in escaping
- Content Security Policy headers
- HTTPS in production

## 📊 Performance Metrics

- Lighthouse Score: 90+
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Bundle size: < 500KB (gzipped)

## 🚀 Deployment

### Netlify

```bash
npm run build
# Deploy dist/ folder
```

### Vercel

```bash
npm run build
vercel --prod
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview"]
```

## 📝 Environment Variables

```env
# API Configuration
VITE_API_URL=http://localhost:5000

# Feature Flags (optional)
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_NOTIFICATIONS=true
```

## 📄 License

MIT License - see LICENSE file for details

## 📞 Support

For issues or questions:

- Open an issue on GitHub
- Email: support@markethub.com

## 🗺️ Roadmap

- [ ] Progressive Web App (PWA) support
- [ ] Dark mode toggle
- [ ] Advanced filtering options
- [ ] Social sharing features
- [ ] Internationalization (i18n)
- [ ] Accessibility improvements
