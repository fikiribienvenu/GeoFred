# GeoFredE-Terra State 🏠

Rwanda's premier real estate and land survey management platform.

## 🌍 Live Demo
**Website:** [https://geofred.com](https://geofred.com)

## 🚀 Tech Stack
- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS, ShadCN UI, Framer Motion
- **Backend:** Next.js API Routes, Node.js
- **Database:** MongoDB Atlas + Mongoose
- **Auth:** JWT + Cookie-based sessions
- **Storage:** Cloudinary (images)
- **Email:** NodeMailer (SMTP)

## 📦 Features
- 🏘️ Property listings (buy, sell, rent)
- 📐 Land survey & topographic survey
- 🏗️ Construction permit assistance
- 💰 Property valuation
- 🤖 Smart agent matching (Province → District → Sector)
- 👤 Three user roles: Admin, Agent, Client
- 📊 Admin analytics dashboard
- 💬 Real-time messaging
- 🌐 Multi-language (English, French, Kinyarwanda)
- 🌙 Dark/Light mode

## 🏃 Getting Started

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Fill in your credentials in .env.local

# Create admin user
npm run seed

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🔑 Default Admin Credentials
```
Email:    admin@geofred.com
Password: Admin@123!
```
> ⚠️ Change this after first login!

## 📁 Project Structure
```
geofred-terra/
├── app/                    # Next.js App Router
│   ├── (public)/          # Public pages
│   ├── admin/             # Admin dashboard
│   ├── agent/             # Agent dashboard
│   ├── dashboard/         # Client dashboard
│   ├── auth/              # Authentication
│   └── api/               # API routes
├── components/            # Reusable components
├── lib/                   # Utilities & helpers
├── models/                # Mongoose schemas
└── DEPLOYMENT.md          # Deployment guide
```

## 🚀 Deploy to Vercel
See [DEPLOYMENT.md](./DEPLOYMENT.md) for full deployment instructions.

## 📄 License
MIT © GeoFredE-Terra State 2024
