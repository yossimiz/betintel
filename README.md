# BetIntel V2.1

Static GitHub Pages dashboard with automatic daily data updates.

## New in V2.1

- Compare two or three operators side by side.
- View stored public-offer history for every operator.
- `bot.js` now appends changed records to `history.json`.
- Daily workflow commits both `data.json` and `history.json`.
- No npm, React, build step or lock file required.

## GitHub Pages

Use **Settings → Pages → Deploy from a branch**, select `main` and `/ (root)`.

## Files

- `index.html` — dashboard structure
- `styles.css` — visual design
- `app.js` — search, filters, comparison and history
- `data.json` — latest scan
- `history.json` — stored historical records
- `bot.js` — daily updater
- `.github/workflows/update-data.yml` — scheduled GitHub Action

## Important

Automated text detection is not independent verification. Review records before treating them as accurate, current or available in a particular jurisdiction.
