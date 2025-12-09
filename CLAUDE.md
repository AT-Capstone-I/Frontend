# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm run lint     # ESLint (next/core-web-vitals config)
npm start        # Run production server
```

## Tech Stack

- **Next.js 16** (App Router)
- **React 19** with TypeScript
- **styled-components** for styling (SSR setup via StyledComponentsRegistry)
- **Supabase** for authentication (implicit flow)
- **Google Maps API** (@vis.gl/react-google-maps) for map features
- **@dnd-kit** for drag-and-drop functionality

## Project Architecture

### Route Groups
- `(main)/` - Primary pages with BottomNavigation and ChatFab
- `(planning)/` - Planning flow pages (notes)
- Standalone routes: `/chat`, `/login`, `/signup`, `/survey`

### Core Directories
```
app/
├── lib/
│   ├── api.ts        # All API functions and type definitions
│   ├── supabase.ts   # Supabase client setup
│   └── routes.ts     # Google Routes API integration
├── hooks/            # Custom React hooks (useContentDetail, usePlaceDetailStream)
├── styles/
│   ├── theme.ts      # Design tokens (colors, typography, spacing)
│   └── StyledComponentsRegistry.tsx
└── components/       # Shared UI components
    ├── cards/        # Card components (PlaceCard, TravelCard, etc.)
    └── map/          # GoogleMapView
```

### Key Patterns

**API Layer** (`app/lib/api.ts`):
- Backend URL: `https://moodtrip-production.up.railway.app`
- All API types and functions centralized here
- SSE events for AI chat streaming (`SSEEvent`, `SSEEventType`)
- User state stored in localStorage (`STORAGE_KEYS`)

**Styling**:
- Theme accessed via `styled-components` ThemeProvider
- Mobile-first design (max-width: 430px)
- Use theme tokens: `theme.colors`, `theme.typography`, `theme.spacing`

**Imports**:
- Path alias: `@/*` maps to project root
- Example: `import { theme } from '@/app/styles/theme'`

## Environment Variables

Required in `.env`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`

## Notes

- UI is in Korean (한국어)
- Client components require `"use client"` directive
- Google Maps uses TRANSIT mode (DRIVING unsupported in Korea)
