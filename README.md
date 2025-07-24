# WINLO

Warehouse Inventory Locator (WINLO) is a B2B SaaS for warehouse‑style shops to help customers find products fast, optimize repeat trips, and give shop owners heatmaps & insights.

---

## 🛠️ Getting Started

### Prerequisites

- **Node.js** v16+  
- **PostgreSQL**  
- **Redis** _(optional, for caching)_  
- **Docker & Docker Compose** _(for local containerized development)_

### Installation

```bash
# Clone & install
git clone https://github.com/MiladArbabi/winlo.git
cd winlo/packages/api
npm install

# Database (Postgres)
PGHOST=localhost
PGUSER=postgres
PGPASSWORD=postgres
PGDATABASE=winlo

# Redis (optional)
REDIS_URL=redis://localhost:6379

# HTTP server
PORT=3000
ALLOWED_ORIGINS=http://localhost:3000

# JWT auth (Issue #14)
JWT_SECRET=your-very-secure-random-string
JWT_EXPIRES_IN=1h

# Caching & rate‑limiting
REDIS_URL=redis://localhost:6379

# Run migrations & seed data
npm run migrate

# seed initial data
npm run seed

# Start in watch mode (TS → JS on the fly)
npm run dev

# or build & run:
npm run build
npm start

# or test
npm test

# Run in Docker
# From project root:
docker-compose up --build

# Wait for the API to become healthy, then:
curl http://localhost:3000/health
curl http://localhost:3000/v1/products

# Tear down:
docker-compose down

## Roadmap
This project is structured around clear milestones, each tracked by dedicated GitHub issues.
We’re building WINLO with a professional, test-driven, milestone-focused approach.

### API Documentation
Swagger UI available at http://localhost:3000/docs
OpenAPI spec: see src/openapi.yaml
All endpoints under /v1/* will soon require a Bearer‑JWT token scoped to your shop. See Issue #14.

## 🚀 Local development with Docker Compose

We maintain a single `.env.example` at the repo root; copy it to `.env` and fill in any secrets:

```bash
cp .env.example .env
# (edit .env to add your values, e.g. JWT_SECRET)

# Build and start all services (API, Postgres, Redis)
docker-compose up --build -d

# Verify API health
curl -f http://localhost:3000/health

# Get a JWT for shop #1
TOKEN=$(
  curl -s -XPOST http://localhost:3000/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"shopId":1,"secret":"<your-shop-secret>"}' \
  | jq -r .token
)

# List products
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/v1/products | jq

# Teardown when done
docker-compose down

Ports exposed:
    3000 → API
    5433 → Postgres (inside container is 5432)
    6379 → Redis
---

🚧 Roadmap
### MVP FOUNDATION
- [#1](../../issues/1) Setup React Native hello world in `packages/app`  
- [#2](../../issues/2) Setup Next.js admin dashboard in `packages/admin`  
- [#3](../../issues/3) Setup shared TypeScript types in `packages/shared`  

---

### CORE DB & API
- [#4](../../issues/4) Setup Knex migrations & DB connection in `packages/api`  
- [#5](../../issues/5) Create products and shops tables with seeds   
- [#6](../../issues/6) Build `/products` endpoint returning product + shop + location 
- [#7](../../issues/7) Build `/route` endpoint with nearest-neighbor optimizer  
- [#27](../../issues/27) Add input validation & sanitization to all endpoints  
- [#28](../../issues/28) Implement structured request logging & error reporting  
- [#29](../../issues/29) Add pagination, filtering & sorting to `/products` endpoint  
- [#30](../../issues/30) Introduce caching layer (Redis) for hot queries  
- [#31](../../issues/31) Add DB indexes on `products.shop_id` and `(x,y)` coordinates  
- [#32](../../issues/32) Implement API versioning (e.g. `/v1/products`)  
- [#21](../../issues/21) Containerize API with Docker & Docker Compose  
- [#20](../../issues/20) Document API with OpenAPI/Swagger UI  

---

### CUSTOMER FLOW
- [#8](../../issues/8) Build `SearchScreen` in React Native app  
- [#9](../../issues/9) Build `MapScreen` with floor plan and product pins  
- [#10](../../issues/10) Add repeat trip feature to mobile app  

---

### ADMIN FLOW
- [#11](../../issues/11) Build CSV upload for products in admin dashboard  
- [#12](../../issues/12) Upload & render floor plan in admin dashboard  
- [#13](../../issues/13) Show heatmaps of searches and popular routes  

---

### SCALE & SECURITY
- [#14](../../issues/14) Add multi-tenant shop auth with JWT in API  
- [#23](../../issues/23) Harden security: CORS, rate-limiting & HTTP headers  
- [#24](../../issues/24) Perform OWASP Top 10 security audit  
- [#15](../../issues/15) Add Kubernetes manifests for production scaling  
- [#16](../../issues/16) Add monitoring with Prometheus, Grafana, Sentry  

---

### CI & DX
- [#33](../../issues/33) Isolate test database migrations & seeds in CI  
- [#34](../../issues/34) Automate CI/CD pipeline with GitHub Actions  
- [#35](../../issues/35) Add code coverage reporting and enforce threshold  
- [#36](../../issues/36) Set up commit lint and pre-commit hooks  

---

### FRONTEND & SDK
- [#17](../../issues/17) Build `@winlo/sdk-js` for embedding pick flow in websites  
- [#18](../../issues/18) Build `@winlo/sdk-react-native` for mobile integration  
- [#19](../../issues/19) Build configurable WINLO web widget generator  
- [#25](../../issues/25) Set up E2E tests for mobile & admin interfaces  
- [#26](../../issues/26) Conduct accessibility audit on key screens  

---

📌 **Progress is tracked via [GitHub Issues](../../issues) and [Milestones](../../milestones).**  
Each issue links to its PR, with CI/CD validation ensuring a clean, scalable architecture.  
