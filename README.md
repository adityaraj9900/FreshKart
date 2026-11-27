# FreshKart

A full-stack quick-commerce grocery app built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, **Prisma** and **Tailwind CSS v4**. It has three role-based experiences: a storefront for shoppers, an admin dashboard, and a delivery-partner app.

**Live demo:** https://freshkart-two.vercel.app

## Features

**Storefront**
- Product catalog with category navigation, search (including voice search where the browser supports it), sorting, and a quick-view dialog
- Persistent cart (Zustand + localStorage) with free-delivery progress, coupon codes, an itemised bill and savings summary
- Checkout that sends only product IDs and quantities: the server re-prices every item, re-validates the coupon, checks stock and computes the total inside a database transaction
- Order tracking with a step-by-step status timeline, delivery-partner details, auto-refresh while an order is in progress, and cancellation before packing starts
- Accessible UI: labelled controls, keyboard support (Esc closes dialogs), visible focus states, `prefers-reduced-motion` support, and mobile-first responsive layouts

**Admin dashboard** (`/admin`)
- KPIs (revenue excluding cancelled orders, average order value, customers, partners online), orders-by-status breakdown and low-stock alerts
- Order management with status filters, search and inline status updates
- Product management with search, inline stock editing, and safe deletion (products that appear in past orders cannot be deleted)
- Delivery-partner availability, customer list and coupon overview

**Delivery partner app** (`/delivery`)
- Online/offline availability saved to the server
- Assigned orders with one-tap status progression (packing → picked up → delivered), directions and call shortcuts

## Security

- Every mutating or sensitive API route checks the session role (`src/lib/guards.ts`). Customers, partners and admins can only read or change what their role allows.
- Order status transitions are enforced on the server: partners can only move *their* orders one step forward; customers can only cancel their own orders before packing.
- Prices, discounts and delivery fees are never trusted from the client.

## Tech stack

| Layer | Tools |
| --- | --- |
| Framework | Next.js 16 App Router, React 19, TypeScript |
| Styling | Tailwind CSS v4 (`@theme` design tokens), lucide-react icons |
| State | Zustand (cart), NextAuth.js session |
| Data | Prisma ORM, SQLite (demo) |
| Auth | NextAuth.js credentials provider, bcrypt password hashing, JWT sessions |

## Getting started

```bash
npm install
cp .env.example .env          # set NEXTAUTH_SECRET to a random string
npx prisma generate
npm run dev                   # http://localhost:3000
```

The repository includes a seeded SQLite database (`prisma/dev.db`). To reseed: `npx prisma migrate reset` (this runs `npm run seed`).

### Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Customer | demo@freshkart.com | demo123 |
| Admin | admin@freshkart.com | admin123 |
| Delivery partner | ravi@freshkart.com | delivery123 |

The login page also has one-click buttons for each demo role. Seeded coupons: `FRESH10`, `NEWUSER50`, `SAVE100`, `WEEKEND15`.

## Project structure

```
src/
  app/
    page.tsx, home/HomeClient.tsx   storefront
    orders/                         order history and tracking
    admin/                          admin dashboard
    delivery/                       delivery partner app
    login/, register/               authentication
    api/                            route handlers (products, orders, promo, users, delivery, auth)
  components/                       Header, ProductCard, CartSidebar, AuthShell, StatusPill
  lib/                              auth, guards (role checks), pricing (coupon rules), catalog helpers
  store/cartStore.ts                cart state and derived totals
prisma/                             schema, migrations, seed
```

## Deploying to Vercel

1. In **Project → Settings → Environment Variables**, add `NEXTAUTH_SECRET` (generate one with `openssl rand -base64 32`). Login will not work without it. `DATABASE_URL` is optional for the demo.
2. Redeploy.

The seeded `prisma/dev.db` ships with each function and is copied to `/tmp` on first use (`src/lib/db.ts`), so browsing, login, sign-up and checkout all work. Because serverless instances don't share a disk, new sign-ups and orders are temporary. For durable data, point `DATABASE_URL` at a hosted database (for example PostgreSQL) and change the Prisma provider.

---

Built by Aditya Kumar Mehta.
