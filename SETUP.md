# MetaBalance Setup Guide

This guide explains how to set up MetaBalance for local development or self-hosting.

## Prerequisites

- Node.js 22+ and pnpm
- MySQL or PostgreSQL database
- API keys for external services (see below)

## Required Environment Variables

Create a `.env` file in the project root with the following variables:

### Database Configuration

```bash
DATABASE_URL=mysql://user:password@host:port/database
```

**Note:** MetaBalance uses Drizzle ORM and supports MySQL, PostgreSQL, or TiDB. For production, we recommend PostgreSQL (e.g., Neon, Supabase) or TiDB Cloud.

### Authentication

```bash
JWT_SECRET=your-random-secret-key-here
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://login.manus.im
VITE_APP_ID=your-manus-app-id
```

**Note:** MetaBalance uses Manus OAuth for authentication. If you want to use a different auth provider, you'll need to modify `server/_core/auth.ts`.

### External API Keys

#### Spoonacular API (Food & Nutrition Data)

```bash
SPOONACULAR_API_KEY=your-spoonacular-api-key
```

- **Get your key:** https://spoonacular.com/food-api
- **Free tier:** 150 requests/day
- **Used for:** Meal logging, nutrition data, recipe search

#### Grok AI API (AI Coaching)

```bash
XAI_API_KEY=your-grok-api-key
```

- **Get your key:** https://x.ai
- **Used for:** AI health coaching, personalized advice, research generation

### Optional: Manus Built-in Services

If deploying on Manus platform, these are auto-configured:

```bash
BUILT_IN_FORGE_API_URL=https://api.manus.im
BUILT_IN_FORGE_API_KEY=your-forge-api-key
VITE_FRONTEND_FORGE_API_KEY=your-frontend-key
VITE_FRONTEND_FORGE_API_URL=https://api.manus.im
VITE_ANALYTICS_ENDPOINT=your-analytics-endpoint
VITE_ANALYTICS_WEBSITE_ID=your-website-id
```

### App Configuration

```bash
VITE_APP_TITLE=MetaBalance
VITE_APP_LOGO=/logo.svg
OWNER_OPEN_ID=your-user-id
OWNER_NAME=Your Name
```

## Installation Steps

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Huskyauto/MetaBalance.git
   cd MetaBalance
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Set up environment variables:**
   - Copy the variables above into a `.env` file
   - Fill in your API keys and database credentials

4. **Initialize the database:**
   ```bash
   pnpm db:push
   ```

5. **Run the development server:**
   ```bash
   pnpm dev
   ```

6. **Open your browser:**
   - Navigate to `http://localhost:3000`

## Testing

Run the test suite to verify everything is working:

```bash
pnpm test
```

All 45 tests should pass.

## Production Deployment

### Option 1: Manus Platform (Recommended)

The easiest way to deploy MetaBalance is on the Manus platform, which provides:
- Automatic database provisioning
- Built-in authentication
- One-click deployment
- Custom domain support

Visit https://manus.im to get started.

### Option 2: Self-Hosting

1. **Build the production bundle:**
   ```bash
   pnpm build
   ```

2. **Deploy to your hosting provider:**
   - Vercel, Railway, Render, or any Node.js host
   - Ensure environment variables are configured
   - Point to a production database (PostgreSQL recommended)

3. **Set up database migrations:**
   ```bash
   pnpm drizzle-kit migrate
   ```

## Troubleshooting

### Database Connection Issues

- Verify your `DATABASE_URL` format matches your database type
- Ensure the database server is accessible from your deployment
- Check firewall rules if using a cloud database

### API Key Errors

- Verify API keys are correctly copied (no extra spaces)
- Check API key quotas and rate limits
- Ensure keys are active and not expired

### Build Errors

- Clear node_modules and reinstall: `rm -rf node_modules && pnpm install`
- Ensure Node.js version is 22 or higher
- Check for TypeScript errors: `pnpm tsc --noEmit`

## Support

For issues or questions:
- Open an issue on GitHub: https://github.com/Huskyauto/MetaBalance/issues
- Check the README for feature documentation

## License

MIT License - see LICENSE file for details
