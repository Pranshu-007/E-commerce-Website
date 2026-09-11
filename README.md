# E-Commerce Web Application

A production-oriented full-stack e-commerce platform with a customer storefront, admin dashboard, and Express API. The project covers authentication, product management, cart and orders, payment integrations, and **enterprise patterns** that companies expect: Redis caching, rate limiting, API optimization, and load-balanced failover.

**Source repo:** [github.com/Pranshu-007/E-commerce-Website](https://github.com/Pranshu-007/E-commerce-Website)

---

## What This Project Does

| App | Folder | Port | Purpose |
|-----|--------|------|---------|
| Customer store | `frontend/` | 5173 | Browse products, cart, checkout, orders |
| Admin panel | `admin/` | 5174 | Add/remove products, manage orders |
| REST API | `backend/` | 4000 | Auth, products, cart, payments, health checks |

---

## Core Features

- User registration, login, and JWT-protected routes
- Product listing, search, filters, categories, and pagination
- Shopping cart stored per user
- Stripe and Razorpay payment flows
- Admin product CRUD with Cloudinary image uploads
- Order placement, tracking, and admin status updates
- Server-side validation and consistent API responses

---

## Production-Ready Additions

These are the features that make the project stand out in interviews and real deployments.

### 1. Redis Caching

Frequently accessed data is stored in Redis so the API responds faster and MongoDB handles less load.

| What is cached | TTL | Invalidated when |
|----------------|-----|------------------|
| Product list (`GET /api/product/list`) | 60 seconds | Product added or removed |
| Single product (`POST /api/product/single`) | 120 seconds | Product added or removed |

**How it works:**

```
User request → API checks Redis → Cache HIT? → Return cached JSON
                                → Cache MISS? → Query MongoDB → Store in Redis → Return
```

Response headers include `X-Cache: HIT` or `X-Cache: MISS` so you can verify caching in DevTools.

If Redis is down, the API still works — it skips caching and reads from MongoDB directly.

**Files:** `backend/config/redis.js`, `backend/services/cache.js`, `backend/controllers/productController.js`

---

### 2. Rate Limiting

Protects the API from abuse and brute-force attacks. Limits are shared across all API instances via Redis.

| Endpoint group | Limit | Window |
|----------------|-------|--------|
| All routes (global) | 100 requests | 15 minutes per IP |
| Auth (`/api/user/*`) | 5 requests | 15 minutes per IP |
| Checkout (`/api/order/*`) | 10 requests | 1 minute per IP |

When the limit is exceeded, the API returns **HTTP 429** with a clear error message.

**Files:** `backend/middleware/rateLimiter.js`

---

### 3. API Optimization

| Technique | What it does |
|-----------|--------------|
| **Gzip compression** | Shrinks JSON responses over the network |
| **Helmet** | Sets secure HTTP headers |
| **MongoDB indexes** | Faster product queries on `category`, `price`, `bestseller`, and text search |
| **`.lean()` queries** | Returns plain JS objects instead of full Mongoose documents (less memory) |
| **Request logging** | Morgan logs every request in development and production |

---

### 4. Load Balancing and Failover

When running with Docker, **nginx** sits in front of **two API replicas**. If one server crashes, traffic is automatically sent to the healthy one.

```
                    ┌─────────────┐
   User ──────────► │   nginx     │  Port 8080
                    │ (load balancer)
                    └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
        ┌──────────┐              ┌──────────┐
        │  api-1   │              │  api-2   │
        │ :4000    │              │ :4000    │
        └────┬─────┘              └────┬─────┘
             │                         │
             └──────────┬──────────────┘
                        ▼
              ┌─────────────────┐
              │  MongoDB + Redis │
              └─────────────────┘
```

**Failover behavior:**

- nginx uses `least_conn` — sends requests to the server with fewest active connections
- `max_fails=3` — after 3 failed requests, nginx marks a server as down for 30 seconds
- `proxy_next_upstream` — if a server returns 502/503/504, nginx retries on the other server
- `/health` endpoint — each API instance reports uptime and instance ID

**Files:** `docker-compose.yml`, `nginx/nginx.conf`, `backend/routes/healthRoute.js`

---

### 5. Server-Side Pagination

Product listing no longer loads every item at once. The API returns one page at a time with metadata.

```
GET /api/product/list?page=1&limit=12&category=Men&sort=low-high&search=shoes
```

| Param | Example | Purpose |
|-------|---------|---------|
| `page` | `1` | Page number |
| `limit` | `12` | Items per page (max 50) |
| `category` | `Men,Women` | Filter by category |
| `subCategory` | `Topwear` | Filter by type |
| `search` | `shoes` | Text search |
| `sort` | `low-high`, `high-low`, `relevant` | Sort order |
| `bestseller` | `true` | Best sellers only |

Response includes `pagination: { page, limit, total, totalPages, hasNext, hasPrev }`.

Paginated responses also send `Cache-Control: public, max-age=60` for browser/CDN caching.

**Files:** `backend/controllers/productController.js`, `frontend/src/pages/Collection.jsx`

---

### 6. CDN / Static Caching

In Docker, nginx serves the built React storefront and applies cache headers like a CDN edge would.

| Asset type | Cache header | Duration |
|------------|--------------|----------|
| `/assets/*` (hashed JS/CSS/images) | `public, max-age=31536000, immutable` | 1 year |
| Fonts, icons, SVG | `public, max-age=2592000` | 30 days |
| `index.html` (app shell) | `no-cache, must-revalidate` | Always fresh |
| API product list | `public, max-age=60` | 60 seconds |

```
User → nginx (port 8080)
         ├── /assets/*     → served from disk, cached 1 year
         ├── /api/*        → proxied to api-1 / api-2
         └── /*            → React SPA (index.html)
```

For production, put **Cloudflare** or **AWS CloudFront** in front of nginx — the same cache headers work at the CDN edge.

**Files:** `nginx/nginx.conf`, `nginx/Dockerfile`, `docker-compose.yml`

---

### 7. Monitoring and Health Checks

Full observability stack with multiple probe types and metrics export.

| Endpoint | Purpose | Returns |
|----------|---------|---------|
| `GET /live` | **Liveness** — is the process running? | `200` always if alive |
| `GET /health` | **Health** — uptime + dependency status | `200` with db/redis status |
| `GET /ready` | **Readiness** — can it serve traffic? | `200` if MongoDB connected, else `503` |
| `GET /status` | **Dashboard** — full system snapshot | JSON with memory, metrics, top endpoints |
| `GET /metrics` | **Prometheus** — scrape-compatible metrics | Text format (use `?format=json` for JSON) |

**Tracked metrics:**
- Total requests and error rate
- Average and max response time
- Redis cache hit/miss rate
- Memory usage (RSS, heap)
- Top 10 endpoints by traffic

Docker healthchecks use `/live` for API containers and `/health` for nginx. MongoDB and Redis have their own health probes.

**Example:**
```bash
curl http://localhost:8080/health
curl -H "x-ops-token: $METRICS_TOKEN" http://localhost:8080/status
curl -H "x-ops-token: $METRICS_TOKEN" http://localhost:8080/metrics
```

**Files:** `backend/routes/healthRoute.js`, `backend/services/metrics.js`, `backend/middleware/metricsMiddleware.js`

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, Tailwind CSS, React Router |
| Admin | React 18, Vite, Tailwind CSS |
| Backend | Node.js, Express (ES modules) |
| Database | MongoDB, Mongoose |
| Cache | Redis (ioredis) |
| Load balancer | nginx |
| Auth | JWT, bcrypt |
| Payments | Stripe, Razorpay |
| Media | Cloudinary, Multer |
| Containers | Docker, Docker Compose |

---

## Project Structure

```text
E-Commerce Web Application/
├── backend/                 # Express API
│   ├── config/              # MongoDB, Cloudinary, Redis
│   ├── controllers/
│   ├── middleware/          # Auth, rate limiting, uploads
│   ├── models/
│   ├── routes/
│   ├── services/            # Redis cache helpers
│   ├── Dockerfile
│   └── server.js
├── frontend/                # Customer React app
├── admin/                   # Admin React app
├── nginx/
│   └── nginx.conf           # Load balancer config
├── docker-compose.yml       # MongoDB + Redis + 2 API replicas + nginx
└── README.md
```

---

## API Routes

```text
# Monitoring
GET    /live                         # Liveness probe
GET    /health                       # Health + dependencies
GET    /ready                        # Readiness probe
GET    /status                       # Full status dashboard (requires x-ops-token)
GET    /metrics                      # Prometheus metrics (requires x-ops-token)

# Products (paginated)
GET    /api/product/list?page=1&limit=12&category=Men&sort=low-high&search=shoes
POST   /api/product/single
POST   /api/product/add          (admin)
POST   /api/product/remove       (admin)

# Auth
POST   /api/user/register
POST   /api/user/login
POST   /api/user/admin

# Cart
POST   /api/cart/get
POST   /api/cart/add
POST   /api/cart/update

# Orders
POST   /api/order/place
POST   /api/order/stripe
POST   /api/order/razorpay
POST   /api/order/verifyStripe
POST   /api/order/verifyRazorpay
POST   /api/order/stripe-webhook     # Stripe signature-verified webhook
POST   /api/order/userorders
POST   /api/order/list           (admin)
POST   /api/order/status         (admin)
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Redis (optional but recommended for caching and rate limiting)
- Docker Desktop (optional, for load-balanced setup)

### 1. Clone the repository

```bash
git clone https://github.com/Pranshu-007/E-commerce-Website.git
cd E-commerce-Website
```

### 2. Backend setup

```bash
cd backend
cp .env.example .env
# Edit .env with your MongoDB URI, JWT secret, Cloudinary keys, etc.
npm install
npm run server
```

API runs at `http://localhost:4000`

### 3. Frontend setup

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Storefront runs at `http://localhost:5173`

### 4. Admin setup

```bash
cd admin
cp .env.example .env
npm install
npm run dev
```

Admin panel runs at `http://localhost:5174`

---

## Docker Setup (Load Balancing + Redis)

Runs MongoDB, Redis, two API replicas, and nginx in one command. Copy `.env.example` to `.env` at the project root and set strong `JWT_SECRET` and `ADMIN_PASSWORD` first.

```bash
# From project root
docker compose up --build
```

| Service | URL |
|---------|-----|
| **Storefront + API** | `http://localhost:8080` |
| Health check | `http://localhost:8080/health` |
| Status dashboard | `http://localhost:8080/status` |
| Prometheus metrics | `http://localhost:8080/metrics` |
| MongoDB | `localhost:27017` |
| Redis | `localhost:6379` |

**Test failover:** Stop one API container (`docker stop ecommerce-api-1`) and hit `http://localhost:8080/health` — nginx routes to the surviving instance.

**Test static caching:** Open DevTools → Network → reload. `/assets/*` files show `Cache-Control: max-age=31536000, immutable`.

---

## Environment Variables

### Backend (`backend/.env`)

```env
PORT=4000
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_long_random_secret
JWT_EXPIRES_IN=7d
JWT_EXPIRES_ADMIN=8h
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_admin_password
CORS_ORIGINS=http://localhost:5173,http://localhost:5174,http://localhost:8080
METRICS_TOKEN=your_ops_token

REDIS_URL=redis://localhost:6379
CACHE_TTL_SECONDS=60
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100

CLOUDINARY_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_SECRET_KEY=your_secret_key

STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=...
```

### Frontend / Admin

```env
VITE_BACKEND_URL=http://localhost:4000
```

When using Docker, leave `VITE_BACKEND_URL` empty — nginx proxies `/api` on the same origin.

```env
VITE_BACKEND_URL=
```

---

## Security Checklist

- Passwords hashed with bcrypt
- JWT tokens expire (7d users, 8h admin); admin tokens never include the password
- Admin routes require `{ role: "admin" }` JWTs
- Rate limiting on auth and checkout endpoints
- Helmet security headers and origin-restricted CORS
- `/status` and `/metrics` require `x-ops-token` (hidden if `METRICS_TOKEN` is unset)
- Stripe webhook signature verification; checkout amounts come from MongoDB prices
- Razorpay payments verified with HMAC signatures
- Never commit `.env` files or real API keys
- Docker Compose binds MongoDB/Redis to localhost only and requires real `JWT_SECRET` / `ADMIN_PASSWORD`

---

## Demo Flow

1. Register and log in on the storefront
2. Browse products (check `X-Cache` header on repeat visits)
3. Add items to cart
4. Place an order (COD, Stripe, or Razorpay)
5. Log in to admin panel and update order status
6. Run `docker compose up` and test load balancing at port 8080

---

## Resume-Safe Description

> Built a full-stack e-commerce platform with React storefront, admin dashboard, and Express REST API. Implemented server-side pagination, Redis caching, CDN-style static caching via nginx, Prometheus-compatible monitoring with liveness/readiness probes, distributed rate limiting, and load-balanced failover across multiple API replicas using Docker Compose.

---

## License

Add a license if you want others to reuse this project.
