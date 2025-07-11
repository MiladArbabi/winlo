# WINLO

Warehouse Inventory Locator (WINLO) is a B2B SaaS for warehouse-style shops to help customers find products fast, optimize repeat trips, and give shop owners heatmaps & insights.

## 🚀 Roadmap

This project is structured around clear milestones, each tracked by dedicated GitHub issues.  
We’re building WINLO (Warehouse Inventory Locator) with a professional, test-driven, milestone-focused approach.

---

### MVP FOUNDATION
- [#1](../../issues/1) Setup React Native hello world in `packages/app`
- [#2](../../issues/2) Setup Next.js admin dashboard in `packages/admin`
- [#3](../../issues/3) Setup shared TypeScript types in `packages/shared`

---

### CORE DB & API
- [#4](../../issues/4) Setup Knex migrations & DB connection in `packages/api`
- [#5](../../issues/5) Create products and shops tables with seeds
- [#6](../../issues/6) Build `/products` API endpoint returning aisle/bin/X/Y
- [#7](../../issues/7) Build `/route` endpoint with basic Dijkstra optimizer

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
- [#14](../../issues/14) Add multi-tenant shop auth with JWT in api
- [#15](../../issues/15) Add Kubernetes manifests for production scaling
- [#16](../../issues/16) Add monitoring with Prometheus, Grafana, Sentry

---

📌 **Progress is tracked via [GitHub Issues](../../issues) and [Milestones](../../milestones).**  
Each issue links to pull requests that implement it, with CI/CD validation, ensuring a clean, scalable architecture.
