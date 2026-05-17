# Backend MVP

Goal: make the game aware of real players instead of only local browser storage.

## What This Backend Does

- Serves the game files from the same URL.
- Accepts player sync at `POST /api/player/sync`.
- Returns leaderboard at `GET /api/leaderboard`.
- Validates Telegram `initData` when `BOT_TOKEN` is configured.
- Stores players in `.data/players.json` for the first test.

This is intentionally simple. The next production step is Supabase/Postgres.

## Local Run

```powershell
cd "C:\Users\komir\Documents\telegramtycoon"
node server.mjs
```

Then open:

```text
http://127.0.0.1:4173/
```

Health check:

```text
http://127.0.0.1:4173/api/health
```

## How The Flow Works

```text
Telegram user opens Mini App
-> frontend reads Telegram.WebApp.initData
-> frontend sends score/resources to /api/player/sync
-> backend validates initData with BOT_TOKEN
-> backend saves player
-> backend returns leaderboard
-> frontend renders Top list
```

## Deploy Path

For two-phone testing with real shared leaderboard:

1. Deploy this repo to Render or Railway as a Node app.
2. Start command: `node server.mjs`.
3. Set environment variable `BOT_TOKEN`.
4. Use the Render/Railway HTTPS URL as `PUBLIC_APP_URL`.
5. Run `npm run telegram:menu` again with the new `PUBLIC_APP_URL`.

After this, both phones should open the same backend URL and see each other in the leaderboard.

## Important

GitHub Pages can open the Mini App, but it cannot run this backend. For real shared progress and rankings, the Telegram menu URL should eventually point to the backend host, not GitHub Pages.
