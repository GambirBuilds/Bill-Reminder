# 💳 Bill Reminder

> **“Never miss a payment again.”**
> A modern, responsive personal bill management and payment reminder platform for tracking upcoming obligations, recurring expenses, subscriptions, and monthly spending.

---
<img width="1907" height="904" alt="image" src="https://github.com/user-attachments/assets/750a4ae4-9dcb-43af-b05f-ecbe8558cc76" />

## 🌟 Features

- **Dashboard Overview**: Immediate visibility into Total Due, Due This Week, Overdue, and Paid This Month. Includes monthly budget progress bar, next payment highlight, and commitment breakdown.
- **Smart Status Calculation**: Automated, real-time status resolution based on due date:
  - 🟢 **Paid**
  - 🔵 **Upcoming**
  - 🟡 **Due Soon / Today**
  - 🔴 **Overdue**
- **Automated Recurring Cycles**: Mark recurring bills (Weekly, Monthly, Quarterly, Yearly) as paid to automatically advance to the next expected due date in JavaScript.
- **Dedicated Subscription Tracker**: Track streaming services, SaaS, gym memberships, and cloud storage with monthly spend and yearly projection, plus self-reported inactivity alerts.
- **Interactive Billing Calendar**: Monthly calendar with visual indicators for each bill status on their due dates, with an interactive detail pane and 1-click payment recording.
- **Spending Analytics (Recharts)**:
  - 6-Month spending history bar chart
  - Category breakdown donut chart
  - Paid vs. Unpaid balance comparisons
  - Recurring vs. One-Time liability ratio
- **Payment History & CSV Export**: Complete audit log with search, filters by category and payment method, and one-click CSV export.
- **Smart Insights Engine**: Dynamic, computed insights analyzing spending fluctuations, upcoming crunches, inactive subscriptions, and budget burn.
- **Client-Side Persistence & Portability**: Resilient `localStorage` caching with corrupted data recovery, JSON backup export/import, demo data reset, and clean start options.
- **Nepali Rupee (Rs.)**: Native support for Nepali currency formatting and decimal values.
- **Dark & Light Mode**: Financial UI aesthetic with persistent theme switching.

---

## 🚀 Vercel Deployment Safety

This project is a **100% frontend-only browser application** built with React, Vite, and JavaScript.

- **Zero backend dependencies**: No Express runtime, no database connections, and no external secrets required.
- **Single Page App Routing**: Preconfigured with `vercel.json` rewrites so that deep routes (`/bills`, `/calendar`, `/analytics`, `/settings`) refresh seamlessly without 404 errors.
- **Build Output**: Generates a standard production bundle in the `dist` folder.

### Deploying to Vercel

1. Push this repository to GitHub or GitLab.
2. Import the repository in [Vercel](https://vercel.com).
3. Framework Preset: **Vite**
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Deploy!

---

## 💻 Local Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build production bundle
npm run build

# Preview production build locally
npm run preview
```
