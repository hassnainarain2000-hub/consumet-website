# Consumet Website - Hostinger Deployment Guide

## Quick Deploy

1. Upload `deployment.zip` to Hostinger File Manager
2. Extract to your domain folder (e.g., `public_html/consumet/`)
3. Open Hostinger Terminal or SSH
4. Run: `npm install`
5. Set Node.js app:
   - Version: 18 or 20
   - Startup file: `dist/main.js`
   - Application root: `consumet` (or wherever you extracted)

## Files Included

- `dist/` - Compiled TypeScript (backend)
- `public/` - Static files (landing page, admin dashboard, API docs)
- `package.json` - Dependencies
- `package-lock.json` - Locked versions

## Environment Variables (.env)

```
PORT=3000
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_TTL=3600
REDIS_PASSWORD=
TMDB_KEY=
NODE_ENV=PRODUCTION
```

## Pages

- `/` - Landing page
- `/admin` - Admin dashboard
- `/docs` - API documentation
- `/swagger` - Swagger UI

## API Endpoints

- `/meta/anilist/info/:id` - AniList anime info
- `/meta/anilist/watch/:episodeId` - Streaming sources
- `/anime/anikoto/:query` - Search anime
- `/movies/flixhq/:query` - Search movies
- `/manga/mangadex/:query` - Search manga
- `/health` - Health check
- `/utils/providers` - List providers

## Troubleshooting

1. **"Cannot find module"** - Run `npm install` on server
2. **"Welcome to Consumet API"** at root - Expected! Test `/meta/anilist/info/21`
3. **500 errors** - Check server logs in hPanel
4. **CORS errors** - Already configured for all origins
