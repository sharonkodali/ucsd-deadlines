# UCSD Deadlines

A browser extension that pulls your upcoming UCSD Canvas assignments into one popup, so you can see what's due today, what's late, and what's coming this week without clicking through every course.

## How it works

- When you visit `canvas.ucsd.edu`, a content script calls Canvas's Planner API (`/api/v1/planner/items`) with your existing session. No passwords or API tokens are stored.
- Deadlines are cached in `browser.storage.local` with a last-updated timestamp.
- The React popup reads the cache and shows three views:
  - **Today**: items due today, plus anything late
  - **List**: everything upcoming, filterable by course
  - **Week**: a 7-day calendar layout
- Dark mode supported.

## Tech stack

TypeScript, React, [WXT](https://wxt.dev) (cross-browser extension framework), Manifest V3. Works in Chrome and Firefox.

## Run locally

```bash
npm install
npm run dev            # Chrome, with hot reload
npm run dev:firefox    # Firefox
```

Open Canvas once to sync, then click the extension icon.

## Roadmap

- Background refresh with `alarms` and due-soon notifications
- Gradescope and other course platforms
