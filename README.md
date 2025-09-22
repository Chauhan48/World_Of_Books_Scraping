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

## 🕷️ Web Scraping

### Target: World of Books
- **Respectful Scraping**: Follows robots.txt and implements delays
- **Data Extraction**: 
  - Navigation structure
  - Product categories
  - Product details (title, price, images, descriptions)
  - User reviews and ratings
  - Related products
- **Caching Strategy**: TTL-based with smart refresh
- **Error Handling**: Retry logic with exponential backoff

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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

MIT License - see LICENSE file for details.

## 🔗 Links

- **Live Demo**: TBD (Deploy to Vercel/Netlify)
- **API Documentation**: TBD (Deploy backend)/api  
- **GitHub Repository**: [Submit your GitHub repo URL]

## 📋 Assignment Submission

This project fulfills all requirements of the AbleSpace Web Scraping Engineer assignment:

### ✅ Completed Requirements

**Frontend (Must Have)**
- ✅ React with Next.js 14 + App Router
- ✅ TypeScript throughout
- ✅ Tailwind CSS for styling
- ✅ Responsive design (desktop & mobile)
- ✅ Accessibility basics (WCAG AA)
- ✅ Loading states and smooth transitions
- ✅ SWR for data fetching
- ✅ Navigation history persistence
- ✅ Core pages: Home, Categories, Products, Product Detail, About

**Backend (Must Have)**
- ✅ NestJS with TypeScript
- ✅ PostgreSQL production database
- ✅ RESTful API endpoints
- ✅ Real-time scraping with Crawlee + Playwright
- ✅ Caching and deduplication
- ✅ Rate limiting and backoff
- ✅ DTO validation and error handling
- ✅ Logging and resource cleanup
- ✅ Queue system for background jobs

**Web Scraping (Must Have)**
- ✅ Targets World of Books (https://www.worldofbooks.com)
- ✅ Crawlee + Playwright implementation
- ✅ Extracts navigation, categories, products, details
- ✅ Reviews and ratings scraping
- ✅ Related products extraction
- ✅ Database persistence with relationships
- ✅ Caching with TTL and smart refresh
- ✅ Ethical scraping practices

**Database Schema (Must Have)**
- ✅ All required entities implemented
- ✅ Proper relationships and constraints
- ✅ Indexes on key fields
- ✅ Unique constraints on source IDs

**Non-functional Requirements**
- ✅ Security: Input sanitization, env vars, CORS
- ✅ Performance: Caching layer, optimized queries
- ✅ Observability: Logging, error tracking
- ✅ Reliability: Queue system, idempotent jobs
- ✅ Accessibility: Semantic HTML, keyboard nav

**Deliverables**
- ✅ GitHub repo with frontend/ and backend/ folders
- ✅ CI/CD pipeline (GitHub Actions)
- ✅ README with architecture and deployment
- ✅ Database schema and relationships
- ✅ API documentation structure
- ✅ Dockerfiles for both services
- ✅ Docker Compose setup

**Bonus Features Implemented**
- ✅ Full Docker setup with compose
- ✅ API documentation structure
- ✅ Comprehensive project architecture
- ✅ Production-ready configuration
- ✅ Ethical scraping implementation

### 🚀 Quick Demo Setup

1. **Clone the repository**
2. **Set up environment variables** (copy .env.example files)
3. **Run with Docker**: `docker-compose up --build`
4. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - API Docs: http://localhost:3001/api

### 📝 Technical Implementation Highlights

- **Scalable Architecture**: Separated concerns with proper layering
- **Production Ready**: Error handling, logging, monitoring
- **Ethical Scraping**: Respects robots.txt, implements delays
- **Performance**: Caching, deduplication, background processing
- **Security**: Input validation, sanitization, rate limiting
- **Maintainable**: TypeScript, proper abstractions, clean code
