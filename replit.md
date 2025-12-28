# MetaBalance - Metabolic Health Platform

## Overview
MetaBalance is a comprehensive metabolic health application combining personalized dietary guidance, intermittent fasting coaching, and AI-powered insights to help users achieve lasting weight normalization.

## Tech Stack
- **Frontend**: React + TypeScript with Vite
- **Backend**: Express + tRPC
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS + Radix UI components
- **Authentication**: Email/password with bcrypt password hashing

## Project Structure
```
├── client/               # React frontend
│   └── src/
│       ├── components/   # UI components
│       ├── pages/        # Page components
│       ├── hooks/        # React hooks (including use-auth.ts)
│       └── lib/          # Utilities
├── server/               # Express backend
│   ├── _core/            # Server core (vite, context)
│   ├── auth/             # Email/password authentication
│   └── routers/          # tRPC routers
├── drizzle/              # Database schema
└── shared/               # Shared types and constants
```

## Development
- Run: `npm run dev`
- Server runs on port 5000

## Authentication
Uses email/password authentication with bcrypt password hashing. Available routes:
- `POST /api/auth/register` - Register new user with email/password
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/user` - Get current authenticated user

## Database
Uses Replit's built-in PostgreSQL database. Schema is managed via Drizzle ORM.

To push schema changes:
```bash
npx drizzle-kit push
```

## Recent Changes
- **December 2024**: Converted from MySQL to PostgreSQL for Replit compatibility
- **December 2024**: Switched from Replit Auth to email/password authentication for better compatibility
- **December 2024**: Fixed PostgreSQL insert operations - added `.returning()` to all insert functions that return data (medications, mindfulness sessions, journey phases, fasting sessions, blood work, etc.)
- **December 2024**: Fixed variable naming conflicts in getUserStats function (renamed local variables to avoid conflicting with schema table names)
- Configured Vite and server for Replit proxy (0.0.0.0:5000, allowedHosts: true)
- Added sessions table for session management
- **December 2024**: Disabled Vite HMR (hot module replacement) to fix blank page issue through Replit proxy
- Added missing achievement and water intake database functions (getUnviewedAchievements, unlockAchievement, getUserStats, getWeeklyWaterIntake, markAchievementsViewed)

## Known Configurations
- **HMR Disabled**: Hot module replacement is disabled in `server/_core/vite.ts` due to WebSocket connection issues with Replit's proxy. Page refresh required after code changes in development.
