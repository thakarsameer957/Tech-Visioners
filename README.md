# Civic Report - Static Web Prototype

This is a simple static web application prototype for the "Crowdsourced Civic Issue Reporting and Resolution System".
It's intended for hackathon/demo use and runs entirely in the browser (no server). Data is stored in `localStorage`.

## What is included
- `index.html` — Citizen reporting page (photo upload, GPS capture, submit).
- `admin.html` — Admin dashboard to view, assign, close, and delete reports.
- `styles.css` — Styling.
- `app.js` — JavaScript logic that powers both pages.
- `README.md` — This file.

## How to use
1. Download and unzip the files.
2. Open `index.html` in your browser to create reports. If your browser blocks local files from reading photos, open via a small static server (see below).
3. Open `admin.html` to view and manage reports.
4. Data is stored in browser localStorage under key `civic_reports_v1`.

## Recommended (if browsers block file access)
Run a simple local server from the folder (Python):
```bash
# Python 3
python -m http.server 8000
# Then open http://localhost:8000/index.html in your browser
```

## Next steps you can add
- Replace localStorage with a backend (Firebase / Node.js + DB).
- Add image upload to cloud storage.
- Integrate NLP/ML for auto-categorization.
- Add authentication and role-based access control.

---
Generated for your Smart India Hackathon prototype. Feel free to edit and extend.
