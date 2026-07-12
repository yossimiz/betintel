# BetIntel V2.0

A static, product-style operator intelligence dashboard for GitHub Pages.

## Upload to GitHub

Upload the **contents** of this folder to the repository root. Keep the hidden `.github` directory.

## GitHub Pages

Open **Settings → Pages**, choose **Deploy from a branch**, select `main` and `/ (root)`.

## Daily updater

The workflow `.github/workflows/update-data.yml` runs `node bot.js` daily and commits `data.json` when it changes. No npm installation or lock file is required.

## Files

- `index.html` — dashboard
- `styles.css` — responsive design
- `app.js` — search, filtering, detail dialog and data loading
- `data.json` — current dataset
- `bot.js` — scheduled updater
- `methodology.html`, `about.html`, `contact.html` — supporting pages

## Important

Automated extraction is not independent verification. Review detected text before publishing it as accurate. Replace the placeholder email in `contact.html`.
