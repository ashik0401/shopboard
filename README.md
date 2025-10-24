# Mini Dashboard Frontend

## 🧭 Overview

This project is a **Mini Dashboard** built with **Next.js** to manage Products and Orders. It features a clean, responsive, and industry-grade UI/UX with advanced table features, dynamic forms, and interactive visual indicators.

The dashboard includes:

- **Product Management:** Create, list, and manage products.
- **Order Management:** Create, list, and manage orders.
- **Responsive Dashboard Layout** with sidebar navigation and top bar (user avatar + theme toggle).
- **Modern UI components**, subtle animations, and clear visual hierarchy.

---

## 🧱 Tech Stack & Tools

- **Framework:** Next.js v14+
- **Styling:** Tailwind CSS
- **UI Library:** ShadCN UI (Card, Table, Badge, Avatar, Tooltip, etc.)
- **State Management & Form Validation:**
  - React Hook Form + Zod (validation)
  - TanStack Query (React Query) for data fetching & caching
- **Table Library:** TanStack Table (React Table v8)
- **Icons:** Lucide Icons
- **Charts:** Recharts (sparkline and overview charts)
- **API Integration:** Mock APIs via local JSON files or MockAPI.io

---

## 📁 Project Structure

src/
├─ app/
│ ├─ auth/
│ │ ├─ login/page.jsx
│ │ ├─ register/page.jsx
│ │ └─ authProvider.jsx
│ ├─ components/
│ │ ├─ DarkModeToggle.jsx
│ │ ├─ GoogleButton.jsx
│ │ └─ Navbar.jsx
│ ├─ dashboard/
│ │ ├─ orders/
│ │ │ ├─ create/page.jsx
│ │ │ ├─ layout.jsx
│ │ │ └─ page.jsx
│ │ ├─ products/
│ │ │ ├─ create/page.jsx
│ │ │ ├─ update/update... (unfinished?)
│ │ │ └─ page.jsx
│ │ └─ layout.jsx
│ └─ page.jsx
├─ lib/
│ └─ components... (shared helpers)
├─ redux/
│ ├─ authSlice.jsx
│ └─ store.jsx
├─ .env.local
├─ firebase.init.js
├─ globals.css
├─ layout.js
└─ page.js


---

## 🧩 Core Features

### 1️⃣ Dashboard Layout
- **Sidebar Navigation:** Products | Orders
- **Top Bar:** User avatar + light/dark mode toggle
- Fully responsive for **mobile, tablet, and desktop**

### 2️⃣ Product Create Page
- Multi-section form: **Basic Info → Inventory → Media**
- Form fields with validation:
  - Product Name (required, unique)
  - SKU (required, auto-uppercase)
  - Category (required dropdown)
  - Price (required, positive, currency formatted)
  - Stock Quantity (required, ≥0)
  - Description (optional)
  - Product Image (optional, preview required)
  - Active Status Toggle (default: Active)
- On submission: **success toast + redirect to Product List**

### 3️⃣ Product List Page
- **TanStack Table** with:
  - Pagination, sorting, filtering, column visibility, row selection
  - Action menu: Edit/Delete
- Responsive design with mobile-first approach
- **Visual Indicators:**
  - Stock: Green (>50), Yellow (<50), Red (<10)
  - Product Status: Active/Inactive chip
  - Client Satisfaction: Emoji rating
  - Delivery Progress: Mini horizontal progress bar
  - Sales Sparkline: 7-day trend per product

### 4️⃣ Order Create Page
- Form fields:
  - Order ID (auto-generated)
  - Product select (multi) with dynamic fetch
  - Quantity (required)
  - Client Name (required)
  - Delivery Address (required)
  - Payment Status (Paid/Pending/Refunded)
  - Delivery Status (Pending/Shipped/Delivered/Canceled)
  - Expected Delivery Date (required)
- **Features:**
  - Dynamic total amount calculation
  - Live summary card (order overview)
  - Form validation and UX feedback

### 5️⃣ Order List Page
- **TanStack Table** with extended metrics:
  - Order ID (clickable)
  - Client Name with initials avatar
  - Payment Status (colored badge)
  - Delivery Status (progress chip)
  - Total Amount (currency formatted)
  - Delivery Graph (mini progress bar)
  - Customer Feedback indicator
  - Created At (formatted timestamp)
- Optional:
  - Row expansion for product details
  - Overview charts: Total Orders, Delivered %, Pending Deliveries, Avg. Satisfaction

---

## 🎨 Design Choices
- Consistent typography, color palette, and spacing
- Subtle hover/press animations for buttons and cards
- Loading skeletons and empty states for better UX
- ShadCN UI components for reusable, modular design
- Mobile-first responsiveness with Tailwind CSS

---

## ⚙️ Setup Instructions

1. **Clone Repository**
```bash
git clone <your-repo-url>
cd <project-folder>
npm install
npm run dev 
```
## Build for Production
```bash
npm run build
npm start 
```
🌐 Environment Variables

If using MockAPI, set the base URL in .env.local:

NEXT_PUBLIC_API_BASE_URL=<mock-api-url>

💾 Bonus Features (Optional)

Theme persistence in local storage

Table filter & column state persistence

TanStack Query Devtools for state inspection

Order Details Page with delivery timeline

Mock authentication (login/logout flow)

📦 Deployment

Deployed on Vercel

Live Preview Link: <your-live-link>

GitHub Repository: <your-github-link>

✅ Evaluation Criteria

UI/UX quality: clean, modern, responsive

Code structure: modular, reusable components

Form handling: proper validation & feedback

Advanced table features: sorting, filtering, row actions

State management: proper usage of React Query

Design polish: animations, tooltips, badges, icons

🔗 References

Next.js Documentation

ShadCN UI

TanStack Table v8

Recharts

React Hook Form

Zod Validation


