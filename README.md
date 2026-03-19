# Birthday Greetings Website

A 4-page romantic birthday website inspired by the YouTube tutorial you shared.

## Pages

- `index.html` - welcome page
- `memory-lane.html` - memory slideshow/cards + voice-note playback + memory quiz
- `cake.html` - interactive candle blow-out cake + microphone blow detection
- `letter.html` - typewriter letter + ending choice + romantic finale video + keepsake download

## Run Locally

Because this is a static site, you can open `index.html` directly in a browser.

## Deploy On GitHub Pages

1. Push this project to your GitHub repository.
2. In GitHub, open `Settings` -> `Pages`.
3. Under **Build and deployment**:
   - **Source**: `Deploy from a branch`
   - **Branch**: `main` (or your default branch)
   - **Folder**: `/ (root)`
4. Click **Save**.
5. Wait about 1-2 minutes, then open the URL GitHub gives you.

## Customize

- Replace placeholder memory images in `assets/memories/`.
- Add your background song file at:
  - `assets/audio/invisible-string-instrumental.mp3`
  - On GitHub Pages this filename/path is case-sensitive, so keep it exact.
- Edit text content in:
  - `scripts/memory-lane.js`
  - `scripts/letter.js`
- Adjust colors and fonts in `styles/base.css`.
- Personalization name is stored in localStorage key: `birthday_greetings_recipient`.
- Music mute/unmute preference is stored in localStorage key: `birthday_greetings_music_enabled`.
- Hidden easter eggs are page-specific and configured in each page script.
