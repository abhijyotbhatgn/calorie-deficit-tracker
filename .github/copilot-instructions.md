# Calorie Deficit Tracker - Project Setup

## Project Overview
A full-stack web app for tracking daily calorie deficit with features:
- Apple Health/Watch integration for total calories consumed
- Manual food logging with AI-powered calorie search
- Quick logging dashboard for frequently consumed foods
- Weekly deficit summary and analytics

## Stack
- **Frontend**: Next.js 14 + TypeScript + React
- **Backend**: Next.js API Routes
- **Database**: SQLite with better-sqlite3
- **AI Integration**: OpenAI API for food calorie estimation
- **Health Sync**: Apple HealthKit adapter layer

## Setup Progress
- [x] Project scaffolding created
- [ ] Install dependencies
- [ ] Configure database
- [ ] Run development server
- [ ] Verify all features working

## Development Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:init` - Initialize database
- `npm run lint` - Run linter

## Key Files
- `/lib/db.ts` - SQLite database setup
- `/app/api/` - API routes for all backend features
- `/app/(dashboard)/` - Main app pages and components
- `/components/` - Reusable UI components
