# VERA QR: AI-Powered Restaurant Management Platform

<div align="center">

**Enterprise White-Label SaaS for Modern Restaurants**

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Powered-green)](https://supabase.com/)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-orange)](https://openai.com/)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-success)](/)

</div>

---

## 🎯 Overview

VERA QR is a **complete, production-ready** multi-tenant SaaS platform that revolutionizes restaurant operations with QR-based digital menus, AI-powered customer service, and comprehensive management tools.

Built with cutting-edge technologies: **Next.js 14**, **Supabase**, **OpenAI GPT-4o**, and **TypeScript**.

---

## ✨ Core Features

### 🤖 Advanced AI Capabilities
- **GPT-4o Chat Assistant** - Context-aware customer support with 5 personality types
- **Vision API Integration** - Menu photo recognition & dish identification
- **Auto-Translation** - 10+ languages with context-aware translation
- **Smart Recommendations** - Personalized menu suggestions

### 👨‍💼 Platform Admin Panel
- **Multi-tenant Dashboard** - Manage unlimited restaurants
- **Organization Management** - Full CRUD with branding customization
- **AI Personality Configuration** - Choose from 5 distinct chatbot personalities
- **Brand Customization** - Logo upload, color schemes (10 presets + custom)
- **Feature Toggles** - Enable/disable features per organization
- **Analytics Overview** - Cross-restaurant insights

### 🍴 Restaurant Admin Panel
- **Real-time Dashboard** - Today's sales, orders, revenue
- **Menu Management** - Categories, items, images, pricing, stock
- **Order Dashboard** - Live order tracking with audio notifications
- **Table Management** - QR code generation with branding
- **Call Management** - Real-time waiter call notifications
- **Multi-language Support** - Serve international customers

### 📱 Customer Experience
- **QR Menu Access** - Scan table QR to view menu
- **AI Assistant Chat** - Get instant help, recommendations
- **Multi-language Menu** - Translate menu to 10+ languages
- **Smart Cart** - Add items, customize orders
- **Waiter Call Button** - Request service instantly
- **Order Tracking** - Real-time order status

### 🔐 Security & Architecture
- **Row Level Security (RLS)** - Supabase data isolation
- **Multi-tenant Architecture** - Complete organization separation
- **Role-based Access** - Platform admin vs Restaurant admin
- **Session Management** - Secure authentication with Supabase Auth
- **API Rate Limiting** - Protection against abuse

### 📊 Real-time Features
- **Live Order Updates** - WebSocket-based notifications
- **Staff Alerts** - Audio & visual notifications
- **Table Call System** - Instant waiter notifications
- **Analytics Events** - Track user behavior in real-time

---

## 🏗️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Framework** | Next.js 14 (App Router, Server Components) |
| **Language** | TypeScript 5 |
| **Database** | Supabase (PostgreSQL + Realtime) |
| **Storage** | Supabase Storage (Image uploads) |
| **Authentication** | Supabase Auth (JWT) |
| **AI** | OpenAI GPT-4o, GPT-4o-mini |
| **Vision** | OpenAI Vision API |
| **Translation** | OpenAI Chat API |
| **Styling** | Tailwind CSS + shadcn/ui |
| **State** | React Hooks (useState, useEffect) |
| **Icons** | Lucide React |
| **Forms** | React Hook Form + Zod |

---

## 🚀 Quick Start

### Prerequisites

```bash
Node.js >= 18.0.0
npm >= 9.0.0
Supabase Account
OpenAI API Key
```

### Installation

```bash
# 1. Clone repository
git clone <your-repo-url>
cd Vera-QR

# 2. Install dependencies
npm install

# 3. Environment setup
cp .env.local.example .env.local
# Edit .env.local with your credentials
```

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI
OPENAI_API_KEY=sk-your-openai-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

Open [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)
2. Run migrations in Supabase SQL Editor:
   - `supabase/migrations/20240101000000_initial_schema.sql`
   - `supabase/migrations/20240101000001_rls_policies.sql`
3. (Optional) Run `supabase/seed.sql` for demo data

## 💻 Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Supabase** - Database, Auth, Storage
- **OpenAI GPT-4** - AI assistant
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components

## 📁 Project Structure

```
vera-qr/
├── app/                      # Next.js app directory
│   ├── [slug]/              # Customer pages (dynamic)
│   ├── api/                 # API routes
│   └── layout.tsx           # Root layout
├── components/              # React components
│   ├── ui/                  # Base UI components
│   └── customer/            # Customer-facing components
├── lib/                     # Utilities
│   ├── supabase/            # Supabase client
│   ├── openai.ts            # OpenAI integration
│   └── utils.ts             # Helper functions
└── supabase/                # Database files
    ├── migrations/          # SQL migrations
    └── seed.sql             # Seed data
```

## 🌐 Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables from `.env.local.example`
4. Deploy

## 📖 API Endpoints

### Customer APIs
- `GET /api/menu?slug={slug}` - Get restaurant menu
- `POST /api/orders` - Create order
- `POST /api/ai-chat` - Chat with AI assistant
- `GET /api/orders?session_id={id}` - Get orders by session

### Admin APIs
- Coming soon...

## 🎯 Features

### For Customers
✅ Scan QR → View menu  
✅ AI assistant for recommendations  
✅ Add to cart and order  
✅ Track order status  

### For Restaurant Owners
✅ Menu management  
✅ QR code generation  
✅ Real-time order management  
✅ Analytics and reports  

## 📄 License

MIT License - see LICENSE file for details

## 📞 Support

For support, email support@veraqr.com or open an issue

---

Made with ❤️ by the VERA-QR Team