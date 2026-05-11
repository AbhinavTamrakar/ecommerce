# ShakTa — Next.js Ecommerce

A full-featured ecommerce site built with Next.js 15, Tailwind CSS v4, and Zustand.

## API
- Base URL: `http://194.146.12.71:8008/api`
- Auth: Bearer token

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Set environment variable (already set in .env.local)
# NEXT_PUBLIC_API_URL=http://194.146.12.71:8008/api

# 3. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Features
- 🏠 Homepage with hero banner (auto-slides from API), categories, featured products
- 🛍️ Product listing with category + type filters
- 🔍 Search
- 📦 Product detail page with image gallery
- 🛒 Cart (add, update qty, remove, clear)
- 👤 Auth (login, register, profile update)
- 📋 Order history
- 📱 Fully responsive

## Stack
- **Next.js 15** (App Router)
- **Tailwind CSS v4**
- **Zustand** — auth + cart state
- **Axios** — API calls
- **react-hot-toast** — notifications
- **lucide-react** — icons
