# Internal Dashboard

A modern, full-stack internal dashboard application built with **Next.js 16** and **Supabase**, featuring real-time analytics, user management, and order tracking.

## Features

- 🔐 **Authentication**: Secure email/password login powered by Supabase Auth.
- 📊 **Analytics Dashboard**: Visual charts showing revenue, orders, and product trends using Recharts.
- 🛍️ **Order Management**: Comprehensive view of customer orders with status tracking.
- 👥 **User Management**: Admin interface to manage internal users and roles.
- ⚡ **Real-time Data**: Leveraging Supabase's real-time capabilities for instant updates.
- 🤖 **Database Automation**: extensive use of PostgreSQL triggers and functions for data consistency.
- 🎨 **Modern UI**: Built with Tailwind CSS v4 and custom accessible components.

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- A Supabase project

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd internal-dashboard
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**

   Create a `.env` file in the root directory and add your Supabase credentials:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Database Setup**

   This project relies on several SQL scripts for setting up tables, triggers, and seeding data. You can find these in the root directory:

   - `supabase_schema.sql`: Core database schema.
   - `seed_sample_data.sql`: Sample data for testing.
   - `create_store_stats_triggers.sql`: Triggers for maintaining store statistics.
   - `fix_triggers_v2.sql`: Latest fixes for database triggers.

   Run these scripts in your Supabase SQL Editor to set up your database.

5. **Run the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/
│   ├── (auth)/             # Authentication routes (login)
│   ├── (dashboard)/        # Protected dashboard routes
│   │   ├── layout.tsx      # Dashboard shell with sidebar
│   │   ├── page.tsx        # Main analytics dashboard
│   │   ├── orders/         # Orders management
│   │   └── users/          # User management
│   └── api/                # API routes
├── components/
│   ├── dashboard/          # Dashboard-specific widgets
│   └── ui/                 # Reusable UI components
├── lib/
│   ├── supabase/           # Supabase client configuration
│   │   ├── client.ts       # Browser client
│   │   └── server.ts       # Server client (SSR/Actions)
│   └── utils.ts            # Helper functions
├── public/                 # Static assets
└── *.sql                   # Database schema and migration scripts
```

## Scripts

- `npm run dev`: Starts the development server.
- `npm run build`: Builds the application for production.
- `npm start`: Runs the built production application.
- `npm run lint`: Runs ESLint to check for code quality issues.
