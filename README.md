# Family Learning Stars

A fuller production-style starter for a family learning game:
- GitHub-ready Next.js repo
- Vercel deployable
- static export friendly
- offline-capable PWA
- Android Studio wrapper included
- 4 learner profiles
- age bands from 5-6 to adult
- 240 levels per age band
- 12 topic areas
- star celebration every 3 overall levels
- 9x points boost for 3 minutes every 6 stars
- local save import/export

## Topic coverage
- English
- Poetry
- Maths
- Science
- History
- Geography
- Civics and Citizenship
- Health
- Digital Technologies
- The Arts
- Languages
- Money Skills

## Run locally

```bash
npm install
npm run dev
```

## Build static export

```bash
npm install
npm run build
```

This creates `/out` for static hosting or Android bundling.

## Deploy to GitHub + Vercel
1. Create a GitHub repository.
2. Push this folder.
3. Import the repo in Vercel.
4. Use the default Next.js settings.

## Offline support
- Browser offline: service worker caches the app shell after first load.
- Android offline: bundle the exported static `/out` files into `android-studio/app/src/main/assets/site/`.

## Notes
This app uses a large offline procedural question generator rather than a cloud database. That keeps it simple, private, and usable offline, while still producing a large number of variants with recent-question avoidance.
