# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NTDB is an AI-powered personal fashion stylist web application built with Next.js 14, TypeScript, and Tailwind CSS. It provides personalized outfit recommendations based on user preferences, weather conditions, and context.

## Key Commands

### Development
```bash
npm run dev          # Start development server on localhost:3000
npm run build        # Build for production (includes Prisma generation and DB push)
npm run lint         # Run ESLint to check code quality
```

### Database Operations
```bash
npm run db:push      # Push Prisma schema changes to database (pulls env from Vercel first)
npm run db:generate  # Generate Prisma client types
npx prisma studio    # Open Prisma Studio to view/edit database
```

### Deployment
The project auto-deploys to Vercel on push to main branch. Manual deployment:
```bash
vercel              # Deploy to Vercel
```

## Architecture Overview

### Tech Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom glassmorphism design
- **Database**: PostgreSQL on Neon (accessed via Prisma ORM)
- **AI**: Google Gemini 2.0 Flash API
- **Weather**: OpenWeatherMap API

### Core Data Flow
1. User inputs (profile, context, preferences) → `/api/recommend` endpoint
2. Backend fetches weather data and constructs AI prompt
3. Gemini AI generates two outfit recommendations in JSON format
4. Frontend displays recommendations with save options
5. Users can save items to Dressing Room or Shopping List

### Key API Endpoints
- `/api/recommend`: Generate AI outfit recommendations
- `/api/analyze-text`: Process natural language "Considering" input
- `/api/dressing-room/*`: Manage saved outfits
- `/api/shopping-list/*`: Manage shopping list items
- `/api/recommendations/history/*`: Track recommendation history

### Database Schema (Prisma)
```prisma
model User {
  id        Int      @id @default(autoincrement())
  userId    String   @unique
  name      String?
  email     String?
  createdAt DateTime @default(now())
}

model DressingRoomItem {
  id          Int      @id @default(autoincrement())
  userId      String
  category    String   // top, bottom, dress, outer, shoes, accessories
  name        String
  description String?
  groupId     String?  // For outfit grouping
  createdAt   DateTime @default(now())
}

model ShoppingListItem {
  id          Int      @id @default(autoincrement())
  userId      String
  category    String
  name        String
  description String?
  createdAt   DateTime @default(now())
}
```

### State Management
- User profile stored in localStorage and React Context (`UserContext`)
- Recommendation results passed via URL parameters to results page
- Global state managed through Context API

## Development Guidelines

### Environment Variables Required
```env
DATABASE_URL          # PostgreSQL connection string
GEMINI_API_KEY       # Google Gemini API key
OPENWEATHERMAP_API_KEY # Weather API key
```

### Code Patterns
- API routes use standard Next.js App Router conventions in `src/app/api/`
- Components follow functional React patterns with TypeScript
- Database queries use Prisma client singleton pattern (`src/lib/prisma.ts`)
- AI prompts are structured for JSON output with specific schema

### Known Issues
- Weather API only provides current weather (not forecasts for future dates)
- Dressing room grouping feature has migration issues
- Some UI elements may need responsive design improvements

### Testing Approach
Currently no automated tests. Manual testing recommended for:
- AI recommendation generation with various inputs
- Database operations (save/delete items)
- UI responsiveness across devices
- API error handling scenarios

## Important Notes
- Always run `npm run db:push` after schema changes
- Gemini API has rate limits - handle 429 errors gracefully
- Weather API requires coordinates - geocoding happens client-side
- User IDs are generated client-side and stored in localStorage