# Calorie Deficit Tracker

A full-stack web application for tracking daily calorie deficit with Apple Health integration, AI-powered food search, and weekly analytics.

## Features

✅ **Daily Food Logging** - Log foods consumed with calorie tracking
✅ **AI-Powered Food Search** - Get calorie estimates for unknown foods using AI
✅ **Quick Logging Dashboard** - One-click logging for your favorite foods
✅ **Weekly Summary** - View your weekly calorie deficit and analytics
✅ **Apple Health Integration** - Sync with Apple Health/Watch data (placeholder)
✅ **Calorie Deficit Tracking** - Monitor your daily and weekly deficit

## Tech Stack

- **Frontend**: Next.js 14 + React + TypeScript
- **Backend**: Next.js API Routes
- **Database**: SQLite with better-sqlite3
- **Styling**: Custom CSS with responsive design
- **AI Integration**: OpenAI API (placeholder for food calorie estimation)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Initialize the database:
   ```bash
   npm run db:init
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
├── app/
│   ├── api/               # API routes
│   │   ├── logs/          # Food logging endpoints
│   │   ├── foods/         # Food database endpoints
│   │   ├── health-sync/   # Apple Health sync
│   │   ├── weekly-summary/ # Weekly analytics
│   │   └── frequent-foods/ # Quick log data
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Dashboard page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── FoodLogger.tsx     # Food logging component
│   ├── DailyStats.tsx     # Daily statistics display
│   ├── QuickLogDashboard.tsx # Frequent foods quick logger
│   └── WeeklySummary.tsx  # Weekly summary display
├── lib/
│   └── db.ts              # Database setup and queries
├── scripts/
│   └── init-db.js         # Database initialization script
└── public/                # Static assets
```

## API Endpoints

### Food Logging
- `GET /api/logs` - Get daily logs for a user
- `POST /api/logs` - Log a food item

### Food Database
- `GET /api/foods?q=search` - Search foods
- `POST /api/foods` - Add a new food

### AI Food Search
- `POST /api/foods/search` - Get calorie estimate via AI

### Frequent Foods
- `GET /api/frequent-foods` - Get user's favorite foods

### Health Sync
- `GET /api/health-sync` - Get synced health data
- `POST /api/health-sync` - Sync Apple Health data

### Weekly Summary
- `GET /api/weekly-summary` - Get weekly deficit analytics

## Configuration

### Environment Variables

Create a `.env.local` file in the project root:

```env
# OpenAI API Key (for AI food search)
OPENAI_API_KEY=your_api_key_here

# Apple Health Integration (future)
APPLE_HEALTH_API_KEY=your_key_here
```

## Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linter
npm run lint

# Initialize database
npm run db:init
```

## Database Schema

### Foods Table
- id, name, caloriesPerServing, servingSize, createdAt

### Daily Logs Table
- id, userId, foodId, foodName, caloriesConsumed, servings, logDate, source, createdAt

### Health Sync Table
- id, userId, syncDate, totalCaloriesConsumed, totalCaloriesBurned, deficit, source, syncedAt

### Frequent Foods Table
- id, userId, foodId, logCount, lastLoggedAt

### Weekly Summary Table
- id, userId, weekStartDate, totalCaloriesConsumed, totalCaloriesBurned, totalDeficit, averageDailyDeficit, generatedAt

## Integration Points

### Apple Health Integration
Located in `/app/api/health-sync/route.ts` - Currently a placeholder. Connect to Apple HealthKit API to pull:
- Total calories consumed
- Total calories burned
- Daily health metrics

### AI Food Search
Located in `/app/api/foods/search/route.ts` - Currently a placeholder. Integrate with OpenAI API to:
- Estimate calories for food descriptions
- Handle food portion sizes
- Provide confidence scores

## Future Enhancements

- [ ] Full Apple HealthKit integration with OAuth
- [ ] OpenAI food calorie estimation
- [ ] Push notifications for daily goals
- [ ] Mobile app with React Native
- [ ] Advanced analytics and charting
- [ ] Export weekly/monthly reports
- [ ] User authentication and accounts
- [ ] Customizable daily calorie goals

## License

MIT
