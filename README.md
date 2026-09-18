# FundHub - Cloud-Based NGO Donation & Distribution Tracker

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18-cyan.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7-purple.svg)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-teal.svg)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **FundHub** is a transparent, real-time donation and resource distribution tracking platform for grassroots non-governmental organizations (NGOs) and transparent philanthropy. It replaces manual ledgers with an end-to-end audit trail—from the initial donor payment to physical ground relief distribution with verifiable proof documents and geo-tagged telemetry.

---

## 🌟 Key Features

- **🔐 Unified Direct Login Portal**: Single, professional sign-in interface with automated role detection and routing.
- **🛡️ 3-Tier Role Architecture**:
  - **Donor**: Browse verified NGOs, filter by cause and location, contribute with INR presets (₹250–₹5,000), download Section 80G tax receipts, and view live impact radar.
  - **NGO Admin**: Register legal organization entity, submit KYC / verification proofs, receive donations, and log resource distribution milestones with receipt proofs.
  - **App Admin**: Single platform administrator (`admin@fundhub.com`) managing NGO onboarding approvals, fraud alerts (auto-flagging transactions > ₹50,000), and platform telemetry.
- **🇮🇳 Indian Rupee (₹ / INR) Localization**: Full formatting in Indian numbering (`en-IN`), Section 80G Indian Income Tax compliance receipts, and Razorpay payment integration.
- **📡 Interactive Telemetry Radar**: Real-time dark-mode geographic hub telemetry and regional distribution tracker with GPS coordinates.
- **⚡ Zero-Config Offline Demo Mode**: Out-of-the-box self-contained mock fallback registry ensures complete functionality even without live external third-party API accounts.

---

## 🏗️ Tech Stack

- **Frontend**: React 18, React Router 6 (SPA), TypeScript, Vite 7, TailwindCSS 3, Lucide Icons, Radix UI.
- **Backend**: Express.js integrated on Vite dev server (port 8080), Helmet security headers, rate limiting.
- **Database & Storage**: Supabase PostgreSQL with Row Level Security (RLS) & local resilient storage registry.
- **Payments**: Razorpay Gateway (INR UPI/Cards) with simulated instant sandbox fallback.
- **Visualizations**: Recharts analytics, SVG Telemetry Radar, Mapbox GL.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or higher recommended)
- `pnpm` (or `npx corepack enable && corepack pnpm`)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/fundhub.git
cd fundhub
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Environment Configuration
Copy the example environment template:
```bash
cp .env.example .env
```
*(The project includes complete offline/demo fallbacks, so you can run the app immediately even with default or empty keys!)*

### 4. Start Development Server
```bash
pnpm dev
```
Open your browser at **[http://localhost:8080](http://localhost:8080)**.

---

## 🧪 Demo Credentials

For quick testing and presentations, use these pre-seeded accounts:

| Role | Email | Password | Access / Destination |
| :--- | :--- | :--- | :--- |
| **App Admin** | `admin@fundhub.com` | `admin123` *(or any)* | Platform Analytics, NGO Approvals, Fraud Auditing (`/dashboard`) |
| **NGO Admin** | `ngo@careandhope.org` | `ngo123` *(or any)* | NGO Funds, Distribution Proofs, Relief Logging (`/dashboard`) |
| **Donor** | `donor@example.com` | `donor123` *(or any)* | NGO Catalog, INR Donations, 80G Receipts (`/browse`) |

> **Note**: Public account registration ("Create Account" tab) allows signing up as a **Donor** or **NGO Admin**. The App Admin account is pre-configured and restricted from public registration.

---

## 🛠️ Available Scripts

| Command | Description |
| :--- | :--- |
| `pnpm dev` | Starts client and Express backend simultaneously on port 8080 |
| `pnpm build:client` | Compiles production Vite client bundle to `dist/spa` |
| `pnpm build:server` | Compiles Express backend for production |
| `pnpm build` | Builds both frontend and backend |
| `pnpm typecheck` | Validates TypeScript types across the entire project |
| `pnpm test` | Executes Vitest test suite |

---

## 📂 Project Structure

```
project/
├── client/                      # React SPA Frontend
│   ├── components/              # Reusable UI & 80G Receipt components
│   │   ├── DonationReceipt.tsx  # Section 80G Printable Tax Receipt
│   │   └── ui/                  # Tailored Radix UI component library
│   ├── context/                 # State management
│   │   ├── AuthContext.tsx      # Multi-role authentication & user registry
│   │   ├── DonationContext.tsx  # INR donations & distribution proofs
│   │   ├── LocationContext.tsx  # Geolocation & reverse geocoding
│   │   └── NGOContext.tsx       # Verified NGO catalog & status updates
│   ├── pages/                   # Application views
│   │   ├── Auth.tsx             # Direct unified access portal
│   │   ├── AppAdminDashboard.tsx# Platform health, verification queue & fraud alerts
│   │   ├── NGODashboard.tsx     # NGO funds, disbursements & proof uploads
│   │   ├── DonorDashboard.tsx   # Donor history, analytics & receipt viewer
│   │   ├── NGOBrowse.tsx        # NGO discovery & donation modal
│   │   ├── MapsTracking.tsx     # Interactive Telemetry Radar
│   │   └── NGOOnboarding.tsx    # KYC & registration form
│   ├── App.tsx                  # Router & layout entry point
│   └── global.css               # Design system & Tailwind theme
├── server/                      # Express Backend
│   ├── index.ts                 # Server setup, middleware & security
│   └── routes/                  # API endpoints
│       ├── donations.ts         # Razorpay order initiate & verify
│       └── notifications.ts     # Email dispatcher & fallback logger
├── database/
│   └── schema.sql               # Consolidated PostgreSQL database schema
├── .env.example                 # Sanitized environment template
└── .gitignore                   # Production-grade git ignore rules
```

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).
