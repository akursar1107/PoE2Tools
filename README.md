# PoE2 Build Randomizer

A lightweight web app that randomly picks a **Path of Exile 2** ascendancy and skill gem when you want to try something new.

## Features
- Random ascendancy (all 12 across 6 classes)
- Random active skill gem
- Session roll history with clear button
- Clean, modern UI — mobile friendly

## Run Locally

Just open `index.html` in your browser. No build step required.

## Deploy to GitHub Pages

1. Push this repo to GitHub
2. Go to **Settings → Pages**
3. Set source to **Deploy from branch → main → / (root)**
4. Your app will be live at `https://<your-username>.github.io/<repo-name>/`

## Updating Data

- **Ascendancies**: edit `data.js` → `ascendancies` array
- **Skill gems**: edit `data.js` → `skillGems` array
