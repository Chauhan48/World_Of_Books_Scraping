# Product Data Explorer

A full-stack product exploration platform that enables users to navigate from high-level headings → categories → products → product detail pages powered by live, on-demand scraping from World of Books.

## 🏗️ Architecture

- **Frontend**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Backend**: NestJS with TypeScript, PostgreSQL
- **Web Scraping**: Crawlee + Playwright
- **Deployment**: Frontend on Vercel, Backend on Railway/Fly.io

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### Local Development

1. **Clone and Install**
```bash
git clone <your-repo-url>
cd product-data-explorer
npm install
```

2. **Environment Setup**
```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your database credentials

# Frontend  
cp frontend/.env.example frontend/.env.local
# Edit frontend/.env.local with your backend URL
```

3. **Database Setup**
```bash
cd backend
npm run migration:run
npm run seed
```

4. **Start Development Servers**
```bash
# From root directory
npm run dev
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- API Docs: http://localhost:3001/api

## 📊 Database Schema

### Core Entities
- `navigation` - High-level navigation headings
- `category` - Product categories and subcategories  
- `product` - Product listings with basic info
- `product_detail` - Extended product information
- `review` - User reviews and ratings
- `scrape_job` - Background scraping job tracking
- `view_history` - User navigation history

## 🛠️ API Endpoints

### Navigation
- `GET /api/navigation` - Get all navigation headings
- `GET /api/navigation/:slug/categories` - Get categories for navigation

### Categories  
- `GET /api/categories/:id` - Get category details
- `GET /api/categories/:id/products` - Get products in category

### Products
- `GET /api/products` - Get products with pagination/filters
- `GET /api/products/:id` - Get product details
- `POST /api/products/:id/scrape` - Trigger product scrape

### Scraping
- `POST /api/scrape/navigation` - Scrape navigation structure
- `POST /api/scrape/category/:id` - Scrape category products
- `GET /api/scrape/jobs` - Get scrape job status

## 🎨 Frontend Features

- **Responsive Design** - Desktop and mobile optimized
- **Accessibility** - WCAG AA compliant
- **Loading States** - Skeleton loaders and smooth transitions
- **Navigation History** - Client-side and backend persistence
- **Data Fetching** - SWR for efficient caching and updates

## 🔧 Backend Features

- **Production Database** - PostgreSQL with proper indexing
- **RESTful API** - Clean endpoints with OpenAPI documentation
- **Real-time Scraping** - On-demand scraping with Crawlee + Playwright
- **Caching & Deduplication** - Efficient data management
- **Rate Limiting** - Respectful scraping with backoff strategies
- **Queue System** - Background job processing
- **Comprehensive Logging** - Request/error tracking

## 🚀 Deployment

### Frontend (Vercel)
```bash
# Automatic deployment via GitHub integration
# Or manual deployment:
cd frontend
npm run build
vercel --prod
```

### Backend (Railway/Fly.io)
```bash
# Railway
railway login
railway link
railway up

# Fly.io  
flyctl deploy
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

## 📝 Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/product_explorer
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-jwt-secret
SCRAPING_DELAY_MS=1000
MAX_CONCURRENT_SCRAPES=3
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_URL=http://localhost:3000
```