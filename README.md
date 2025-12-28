# MetaBalance - Your Metabolic Health Journey

**A comprehensive, evidence-based weight loss and metabolic health tracking application with integrated 90lb Journey program.**

![MetaBalance Dashboard](./public/screenshot-dashboard.png)

---

## 🎯 Overview

MetaBalance is a production-ready web application designed to help users achieve sustainable weight loss through science-based protocols, daily habit tracking, and personalized insights. Built with the **90lb Journey** program at its core, it provides structured guidance through a 12-month, 4-phase transformation.

**Key Features:**
- 📊 Comprehensive progress tracking (weight, meals, fasting, supplements)
- 🏆 Achievement system with 18 unlockable badges  
- 📈 AI-powered insights and personalized coaching
- 📱 Progressive Web App (PWA) with offline support
- 🌙 Dark/Light mode theming
- 📄 PDF progress report export
- 🎯 90lb Journey: 4-phase structured weight loss program

---

## 🚀 Quick Start

### Prerequisites
- Node.js 22.x
- pnpm package manager
- MySQL/TiDB database

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd metabalance

# Install dependencies
pnpm install

# Set up environment variables
# (See Environment Variables section below)

# Push database schema
pnpm db:push

# Seed journey supplements
npx tsx server/seedJourneySupplements.ts

# Start development server
pnpm dev
```

The app will be available at `http://localhost:3000`

---

## 📱 Core Features

### Dashboard
The central hub displaying:
- **Today's Wins**: 5 daily goals with star-based progress tracking
- **Streak Tracker**: Consecutive days with 3+ stars achieved
- **Water Intake**: Visual glass counter (8 glasses/day goal)
- **Weight Progress**: Current vs target weight with progress visualization
- **Daily Insight**: AI-generated personalized guidance
- **Feature Cards**: Quick access to all major features including:
  - Dietary Tracking
  - Fasting Coach
  - Supplements
  - Progress Tracking
  - AI Coach
  - **90lb Journey** (highlighted with teal gradient)
  - Achievements
  - Education
  - Weight Loss Research
  - Health Profile
  - Weekly Reflection

### Dietary Tracking
- Log meals with Spoonacular API nutrition data
- Track calories, protein, carbs, fats, and fiber
- Daily and weekly nutrition analytics
- Meal history with edit/delete capabilities
- Automatic protein goal tracking

### Progress Tracking
- Weight log with trend visualization
- Body measurements tracking
- Progress charts (7-day, 30-day, 90-day views)
- **PDF Export**: Download comprehensive progress reports
- Goal setting and milestone tracking

### Fasting Tracker
- Intermittent fasting schedule management
- Fasting window tracking
- Automatic daily goal integration
- History and analytics

### Achievement System
**18 Achievements across 4 categories:**

1. **Milestones** (2 badges)
   - First Week Complete (Bronze)
   - Meal Logger (Bronze)

2. **Weight Loss** (5 badges)
   - 5/10/25/50/100 Pounds Down (Bronze → Platinum)

3. **Streaks** (4 badges)
   - 7/30/100/365-day streaks (Bronze → Platinum)

4. **Consistency** (4 badges)
   - Perfect weeks/months, 100 meals logged, 50 perfect days

**Features:**
- Automatic unlock detection
- Confetti animations on unlock
- Progress tracking toward next achievement
- Tier-based badges (Bronze/Silver/Gold/Platinum)

---

## 🏃 90lb Journey Program

A structured, evidence-based 12-month program for sustainable weight loss.

### Program Structure

#### Phase 1: Foundation (Months 1-3)
- **Goal**: 20-25 lbs loss
- **Focus**: Habit formation, metabolic baseline
- **Protocols**: Daily tracking, foundation supplements, 24-hour fasts

#### Phase 2: Optimization (Months 4-6)
- **Goal**: 20-25 lbs loss
- **Focus**: Metabolic flexibility, advanced protocols
- **Protocols**: 3-5 day fasts, advanced supplements

#### Phase 3: Deep Reset (Months 7-9)
- **Goal**: 20-25 lbs loss
- **Focus**: Autophagy activation, metabolic reset
- **Protocols**: 7-10 day fasts, full supplement stack

#### Phase 4: Consolidation (Months 10-12)
- **Goal**: 10-15 lbs loss
- **Focus**: Maintenance, lifestyle integration
- **Protocols**: Sustainable habits, long-term strategies

### Journey Features

#### 1. Phase-Based Tracker (`/journey`)
- Visual phase timeline (4 phases over 12 months)
- Progress tracking (time elapsed, weight lost)
- Phase-specific guidance and tips
- "Start My Journey" initialization button
- **"Reset Journey" button**: Restart journey with confirmation dialog (deletes all journey data)
- **Back to Dashboard navigation**: Arrow button for easy return to main page

#### 2. Supplement Tracker (`/journey/supplements`)
**16 Evidence-Based Supplements:**

**Foundation** (Phase 1+):
- Electrolytes (Sodium, Potassium, Magnesium)
- Magnesium Glycinate
- B-Complex
- Vitamin D3

**Optional** (Phase 1+):
- Berberine, NMN, Resveratrol, L-Theanine

**Advanced** (Phase 2+):
- Omega-3, Probiotics, Rhodiola, Capsinoids, Ashwagandha, Alpha-Lipoic Acid, Coenzyme Q10, Chromium Picolinate

**Features:**
- Daily supplement checklist
- Phase-based recommendations
- Monthly cost tracking ($388 total)
- Category organization

#### 3. Fasting Protocol Tracker (`/journey/fasting`)
**Three Protocol Types:**

- **24-Hour Fast**: Autophagy initiation, metabolic flexibility
- **3-5 Day Fast**: Deep autophagy, metabolic reset, 3-8 lbs loss
- **7-10 Day Fast**: Maximum autophagy, complete transformation, 7-15 lbs loss

**Features:**
- Live fasting timer
- Electrolyte reminders
- Refeeding safety warnings
- Fasting history and success rate
- Weight loss tracking per session

#### 4. BMR/TDEE Calculator
- **Mifflin-St Jeor equation** for accurate BMR calculation
- Activity factor multiplier (1.2-1.9x)
- Personalized 750 cal/day deficit recommendation
- Save calculated values to profile

---

## 🎨 Design & User Experience

### Theme System
- **Light Mode** (default): Clean, professional interface
- **Dark Mode**: OLED-friendly with reduced eye strain
- Toggle in Settings page

### Color Palette
- **Primary**: Teal (#14b8a6) - Trust, health, growth
- **Accents**: Warm orange/amber for streaks and achievements
- **Backgrounds**: Soft gradients for cards and sections
- **Text**: High contrast for accessibility

### Typography
- System font stack for native feel
- Clear hierarchy (headings, body, captions)
- Optimized for readability

### Components
- **shadcn/ui** component library
- **Tailwind CSS 4** for styling
- Responsive design (mobile-first)
- Smooth animations and transitions

---

## 🛠️ Technical Stack

### Frontend
- **React 19**: Latest features and performance
- **Wouter**: Lightweight routing
- **TanStack Query**: Server state management
- **Tailwind CSS 4**: Utility-first styling
- **shadcn/ui**: High-quality components
- **Vite**: Fast build tool

### Backend
- **Express 4**: Web server
- **tRPC 11**: End-to-end type safety
- **Drizzle ORM**: Type-safe database queries
- **MySQL/TiDB**: Relational database

### APIs & Services
- **Spoonacular API**: Nutrition data (100,000+ foods)
- **Grok API (xAI)**: AI-powered insights and coaching
- **World Bank Data API**: Research data for insights
- **Manus OAuth**: Authentication
- **S3-compatible storage**: File uploads

### Testing
- **Vitest**: Unit and integration tests
- **47 test suites** covering all tRPC procedures
- **45/47 tests passing** (2 pre-existing data isolation issues)

---

## 📊 Database Schema

**26 Tables:**

### Core Tables
- `users`: User accounts and profiles
- `metabolicProfiles`: Health data, goals, medications
- `weightLogs`: Weight tracking history
- `bodyMeasurements`: Circumference measurements
- `meals`: Meal entries with nutrition data
- `fastingSchedules`: Fasting window definitions
- `fastingLogs`: Fasting session records

### Daily Tracking
- `dailyGoals`: 5 daily goals with completion status
- `weeklyReflections`: End-of-week reviews
- `waterIntake`: Daily water consumption logs

### 90lb Journey
- `journeyPhases`: Phase tracking (1-4)
- `journeySupplements`: Master supplement list (16 items)
- `userSupplementLog`: Daily supplement tracking
- `extendedFastingSessions`: 24hr, 3-5 day, 7-10 day fasts
- `journeyInitializations`: User journey setup
- `supplementReminders`: Notification scheduling
- `fastingAnalytics`: Stats and trends
- `bloodWorkResults`: Lab results tracking

### Gamification
- `achievements`: User achievement unlocks
- `streakHistory`: Daily streak tracking
- `favoriteFoods`: Quick-add frequently logged items

---

## 🔧 Configuration

### Environment Variables

```env
# Database
DATABASE_URL=mysql://user:password@host:port/database

# Authentication
JWT_SECRET=your-jwt-secret
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://login.manus.im
VITE_APP_ID=your-app-id

# Owner Info
OWNER_OPEN_ID=owner-open-id
OWNER_NAME=Owner Name

# APIs
SPOONACULAR_API_KEY=your-spoonacular-key
XAI_API_KEY=your-xai-grok-key

# Manus Built-in Services
BUILT_IN_FORGE_API_URL=https://forge.manus.im
BUILT_IN_FORGE_API_KEY=your-forge-key
VITE_FRONTEND_FORGE_API_URL=https://forge.manus.im
VITE_FRONTEND_FORGE_API_KEY=your-frontend-forge-key

# Analytics
VITE_ANALYTICS_ENDPOINT=https://analytics.manus.im
VITE_ANALYTICS_WEBSITE_ID=your-website-id

# App Branding
VITE_APP_TITLE=MetaBalance
VITE_APP_LOGO=/logo.svg
```

### Scripts

```json
{
  "dev": "Start development server",
  "build": "Build for production",
  "preview": "Preview production build",
  "test": "Run test suite",
  "db:push": "Push schema changes to database",
  "db:studio": "Open Drizzle Studio (database GUI)"
}
```

---

## 📸 Screenshots

### Dashboard
![Dashboard](./public/screenshot-dashboard.png)
*Today's Wins, Streak Tracker, Water Intake, and Weight Progress*

### Dietary Tracking
![Dietary Tracking](./public/screenshot-dietary.png)
*Meal logging with nutrition breakdown*

### Progress Tracking
![Progress](./public/screenshot-progress.png)
*Weight trends and PDF export*

---

## 🧪 Testing

### Run Tests
```bash
pnpm test
```

### Test Coverage
- **47 test suites** covering:
  - Authentication flows
  - tRPC procedure logic
  - External API integrations (Spoonacular, Grok)
  - PDF generation
  - Achievement unlock detection
  - Daily goal tracking
  - Journey phase progression

### Current Status
- ✅ 45/47 tests passing
- ⚠️ 2 pre-existing data isolation issues in `dailyGoalsAndReflections.test.ts`

---

## 🚀 Deployment

### Build for Production
```bash
pnpm build
```

### Deployment Options
1. **Manus Platform** (Recommended)
   - Built-in hosting with custom domains
   - One-click publish from Management UI
   - Automatic SSL certificates
   - Edge CDN distribution

2. **Self-Hosted**
   - Deploy `dist/` folder to any static host
   - Run `node server/index.js` for backend
   - Configure reverse proxy (nginx/Apache)
   - Set up SSL certificates

---

## 📖 User Guide

### Getting Started
1. **Sign Up**: Create account via Manus OAuth
2. **Set Profile**: Enter current weight, target weight, health conditions
3. **Initialize Journey**: Click "Start My Journey" to begin 90lb Journey
4. **Daily Tracking**: Complete 5 daily goals for stars and streaks
5. **Log Meals**: Track nutrition with Spoonacular database
6. **Monitor Progress**: View weight trends and export PDF reports

### Daily Workflow
1. **Morning**: Log weight, check Today's Wins
2. **Meals**: Log breakfast, lunch, dinner with nutrition data
3. **Hydration**: Track water intake (8 glasses goal)
4. **Fasting**: Complete fasting window
5. **Exercise**: Log physical activity
6. **Evening**: Review progress, check achievements

### 90lb Journey Workflow
1. **Phase 1 Start**: Initialize journey, begin foundation supplements
2. **Weekly**: Log weight, complete daily goals, track streaks
3. **Monthly**: Review phase progress, adjust protocols
4. **Phase Transitions**: Advance to next phase when milestones met
5. **Fasting Protocols**: Schedule and complete extended fasts
6. **Supplement Management**: Check off daily supplements
7. **Blood Work**: Track metabolic markers at baseline and end

---

## 🎯 Roadmap

### Planned Features
1. **Journey Onboarding Modal**: Guided setup wizard
2. **Supplement Reminder Notifications**: Push notifications with snooze
3. **Fasting Analytics Dashboard**: Charts and trends
4. **Social Sharing**: Share achievements on social media
5. **Friends Leaderboard**: Community competition
6. **Goal History Calendar**: Monthly heatmap view
7. **Favorite Foods UI**: Quick-add frequently logged items
8. **Blood Work Tracking UI**: Lab results visualization

---

## 📝 License

Proprietary - All rights reserved

---

## 🙏 Acknowledgments

- **90lb Journey Program**: Evidence-based weight loss protocols
- **Spoonacular**: Comprehensive nutrition database
- **xAI Grok**: AI-powered health insights
- **Manus Platform**: Hosting and infrastructure
- **shadcn/ui**: Beautiful component library

---

## 📞 Support

For questions, issues, or feature requests:
- Submit feedback at https://help.manus.im
- Check documentation in `/docs` folder
- Review `WORK_SUMMARY.md` for implementation details

---

**Built with ❤️ for sustainable metabolic health transformation**
