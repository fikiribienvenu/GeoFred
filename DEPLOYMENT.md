# GeoFredE-Terra State — Deployment Guide

## Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Cloudinary account
- Gmail / SMTP credentials
- Vercel account (for deployment)

---

## 1. Local Setup

```bash
# Navigate to project
cd geofred-terra

# Install dependencies
npm install

# Copy environment file
cp .env.example .env.local
```

Edit `.env.local` with your credentials (see section 3).

```bash
# Start development server
npm run dev
```

Open http://localhost:3000

---

## 2. MongoDB Atlas Setup

1. Go to https://cloud.mongodb.com
2. Create a new cluster (free M0 tier works)
3. Create a database user with read/write permissions
4. Add `0.0.0.0/0` to IP Access List (or your server IP)
5. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/geofred_terra`
6. Add to `MONGODB_URI` in your `.env.local`

---

## 3. Environment Variables

```env
# App
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app
NEXT_PUBLIC_APP_NAME=GeoFredE-Terra State

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/geofred_terra

# JWT (generate a random 64-char string)
JWT_SECRET=your_super_secret_minimum_32_characters_here
JWT_EXPIRES_IN=7d

# Email (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_gmail_app_password  # 16-char App Password from Google
EMAIL_FROM=noreply@geofred.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name

# Google Maps (optional, for map features)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

---

## 4. Create First Admin User

After starting the app, use MongoDB Compass or Atlas Data Explorer to manually create an admin:

```json
{
  "name": "Admin User",
  "email": "admin@geofred.com",
  "phone": "+250788000000",
  "password": "$2a$12$...",  // bcrypt hash of your password
  "role": "admin",
  "status": "active",
  "emailVerified": true
}
```

Or use the register endpoint and then update the role in MongoDB:
```bash
# Register normally, then in MongoDB update role to 'admin'
db.users.updateOne({ email: "admin@geofred.com" }, { $set: { role: "admin" } })
```

---

## 5. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (from project root)
vercel

# For production
vercel --prod
```

During deployment, add all environment variables in Vercel Dashboard → Project → Settings → Environment Variables.

---

## 6. Build for Production

```bash
npm run build
npm run start
```

---

## 7. Project Structure

```
geofred-terra/
├── app/
│   ├── (public)/           # Public pages (Home, Properties, Services, About, Contact)
│   │   ├── page.tsx        # Homepage
│   │   ├── properties/     # Property listing + detail
│   │   ├── services/       # Services page
│   │   ├── about/          # About Us
│   │   └── contact/        # Contact page
│   ├── admin/              # Admin dashboard
│   │   ├── page.tsx        # Admin overview + analytics
│   │   ├── agents/         # Agent management + approvals
│   │   ├── properties/     # Property management
│   │   ├── requests/       # Service request management
│   │   └── settings/       # Platform settings
│   ├── agent/              # Agent dashboard
│   ├── dashboard/          # Client dashboard
│   │   └── requests/new    # Submit service request
│   ├── auth/               # Authentication
│   │   ├── login/
│   │   ├── register/
│   │   ├── agent-register/
│   │   ├── forgot-password/
│   │   └── reset-password/
│   └── api/                # API Routes
│       ├── auth/           # Login, register, agent-register, logout, reset
│       ├── properties/     # CRUD + filtering
│       ├── service-requests/ # Create + manage
│       ├── admin/          # Admin-only endpoints (agents, stats)
│       └── upload/         # Cloudinary image upload
├── components/
│   ├── home/               # Homepage sections
│   ├── layout/             # Navbar, Footer
│   ├── providers/          # AuthProvider, ThemeProvider
│   └── ui/                 # ShadCN-style UI components
├── lib/
│   ├── mongodb.ts          # MongoDB connection
│   ├── auth.ts             # JWT utilities
│   ├── cloudinary.ts       # Image upload
│   ├── email.ts            # Email templates
│   ├── rwanda.ts           # Rwanda administrative data
│   ├── utils.ts            # Helper functions
│   └── apiMiddleware.ts    # Route protection helpers
└── models/                 # Mongoose schemas
    ├── User.ts
    ├── Agent.ts
    ├── Property.ts
    ├── ServiceRequest.ts
    ├── Message.ts
    └── ActivityLog.ts
```

---

## 8. User Roles & Access

| Feature | Admin | Agent | Client |
|---------|-------|-------|--------|
| Dashboard | `/admin` | `/agent` | `/dashboard` |
| Manage agents | ✅ | ❌ | ❌ |
| Add/edit properties | ✅ | ❌ | ❌ |
| Submit service requests | ❌ | ❌ | ✅ |
| Handle service requests | ✅ | ✅ | ❌ |
| Browse properties | ✅ | ✅ | ✅ |
| View analytics | ✅ | ❌ | ❌ |

---

## 9. Smart Agent Matching Algorithm

When a client submits a service request:
1. **Exact match** — Find approved agent in same province + district + sector
2. **District match** — If none, find agent in same province + district
3. **Province match** — If none, find agent in same province
4. **Admin notified** — If no agent found anywhere

Priority given to agents with most `completedRequests`.

---

## 10. Rwanda Administrative Coverage

All 5 provinces with 30+ districts and hundreds of sectors are pre-loaded in `lib/rwanda.ts`. The agent matching system uses this hierarchy for automatic routing.

---

## Support

📧 info@geofred.com  
🌐 https://geofred.com  
📍 Kigali, Rwanda
