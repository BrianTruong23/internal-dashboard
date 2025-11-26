# Internal Dashboard

A Next.js internal dashboard application with user authentication, analytics, and data management.

## Features

- 🔐 **Authentication**: Email/password login with NextAuth.js
- 📊 **Analytics Dashboard**: Visual charts showing order trends over time
- 📋 **Orders Management**: View and track product orders
- 👥 **User Management**: Manage internal users
- 🎨 **Modern UI**: Built with Tailwind CSS and custom components

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Ensure the `.env` file exists with:
   ```
   NEXTAUTH_SECRET=supersecretkey123
   NEXTAUTH_URL=http://localhost:3000
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Login Credentials

For demo purposes, you can login with:
- **Email**: `admin@example.com`
- **Password**: `password`

(Or any other email/password - authentication is mocked for demonstration)

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Authentication**: NextAuth.js v4
- **Styling**: Tailwind CSS v4
- **Charts**: Recharts
- **Icons**: Lucide React
- **TypeScript**: Full type safety

## Project Structure

```
app/
  (auth)/login/          # Login page
  (dashboard)/           # Protected dashboard routes
    layout.tsx           # Dashboard layout with sidebar
    page.tsx             # Analytics overview
    orders/page.tsx      # Orders table
    users/page.tsx       # Users table
  api/auth/[...nextauth] # NextAuth API routes
components/
  dashboard/             # Dashboard-specific components
  ui/                    # Reusable UI components
lib/
  auth.ts                # NextAuth configuration
  utils.ts               # Utility functions
```

## Building for Production

```bash
npm run build
npm start
```

## Notes

- This is a demonstration project with mock data
- In production, replace mock authentication with a real user database
- Update the NEXTAUTH_SECRET to a strong random value
