# Khen Emotan — Developer Portfolio

A responsive, buildless portfolio for Khen Emotan, a second-year BSIT student at Leyte Normal University. Built with semantic HTML, CSS, and vanilla JavaScript for GitHub Pages at `/Portfolio/`.

## Preview locally

From the parent directory (`C:\portfolio`):

```powershell
python -m http.server 8000 --bind 127.0.0.1 --directory C:\portfolio
```

Open **http://localhost:8000/Portfolio/**. The Budget Tracker is at **http://localhost:8000/Portfolio/BudgetTracker/**. Stop the server with Ctrl+C.

Alternatively, from this repository, run `python -m http.server 8000 --bind 127.0.0.1` and open http://localhost:8000/. Use the parent-directory command to verify the GitHub Pages `/Portfolio/` prefix. No installation or build step is needed.

## Site structure

| File | Purpose |
| --- | --- |
| `index.html` | Hero, selected work, about, skills, education, and contact |
| `mainstyle.css` | Design tokens, portfolio layouts, responsive rules, reduced motion |
| `portfolio.js` | Mobile navigation, section indicators, current year |
| `assets/` | Local favicon, actual project screenshots, Open Graph preview |
| `download.jpg` | Existing portrait, reused in the about section |
| `myprojects.html` | Preserved entrance for old project-page bookmarks |
| `BudgetTracker/` | Existing browser-based budget application |

The old `style.css` and background assets are retained for compatibility, but the redesigned portfolio uses `mainstyle.css` and CSS gradients. No unrelated project files were removed.

## Project content and evidence

- **Barangay Eco Quest:** Educational 2D game using Python and Pygame, developed as a paid student commission, as supplied in the project brief. The project card displays Khen's actual main-menu screenshot, preserved without alterations and linked to the full-size image. No gameplay mechanics, source link, or demo are claimed without supporting evidence.
- **Budget Tracker:** A charcoal-and-teal dashboard with budget, spent, and remaining summary cards, a spending progress bar, labeled budget/purchase forms, inline feedback, and a responsive purchase list. Set or increase a budget; add items with quantities and unit prices; edit, cancel editing (including Escape), remove items, or clear data; switch between seven currency formats and refreshed light/dark themes. Fresh visits default to dark mode; existing theme choices are retained. State is saved under the original `budgetTrackerData_v1` key, including compatibility with older amount-only records. Selecting a currency formats numbers without converting their values. The screenshot shows the actual redesigned application with clearly labeled example data.
- **Personal Portfolio:** This site, with an actual homepage screenshot and a link to the existing repository.

The email address comes from the existing portfolio. The GitHub profile and source links match the repository remote and returned HTTP 200 during validation. The existing Budget Tracker storage key and data format are preserved.

## Information to add when available

- LinkedIn profile URL, after confirming it belongs to Khen.
- Actual resume PDF, if a download is desired.
- A shareable Eco Quest source/demo URL and verified details about implemented mechanics, interfaces, progression, and lessons learned. The supplied main-menu screenshot is already included.

These are omitted from the published-facing interface until real information is supplied. The Eco Quest project itself remains included. No fake links, employment history, proficiency percentages, testimonials, or project metrics are used.

## Validation

Browser checks were run in an isolated Microsoft Edge profile against the local site under `/Portfolio/`:

- Responsive layout at 320, 360, 390, 768, 1024, 1440, and 1920 CSS pixels; no horizontal page overflow.
- All local navigation targets, stylesheets, scripts, screenshots, and portrait load successfully.
- Mobile menu opens with Enter, closes with Escape or a navigation choice, and restores keyboard focus on Escape.
- Native project details expand using the keyboard; reduced-motion preferences disable the hero animation and smooth scrolling.
- Budget setting, top-ups, quantity × price calculations, editing, canceling, deletion, overspending indication, currency formatting, theme switching, and persistence after reload.
- Budget Tracker fixes: reject negative top-ups; preserve currency/theme and exit editing after Clear All; exit editing when the edited item is removed.
- Redesigned Budget Tracker layouts checked at 320, 390, 620, 768, 940, 1024, 1440, and 1920 CSS pixels, in both themes. Long purchase names and large amounts checked for overflow at 320, 390, and 1024 pixels. No sample data is inserted into the live app.
- No uncaught browser JavaScript errors or failing asset requests in the final checks.

Quick syntax checks:

```powershell
node --check portfolio.js
node --check BudgetTracker/app.js
git -c core.whitespace=cr-at-eol diff --check
```

To check the budgeting workflow manually: set a budget of 1000, add 3 items at 50 each (spent 150, remaining 850), edit to 2 at 100 (spent 200, remaining 800), top up by 500 (budget 1500), switch currency and theme, and reload. Check removal and clearing using disposable sample entries; these actions change locally saved data in the current browser.

## GitHub Pages

Keep `index.html`, the stylesheets, JavaScript, assets, and `BudgetTracker/` at the repository's Pages publishing root. Internal links are relative, so both repository-root hosting and `/Portfolio/` work. Canonical and Open Graph URLs use `https://khenemotan.github.io/Portfolio/`; update those if the hosting URL changes.

There are no external fonts, frameworks, runtime dependencies, or contact-form backend. Contact uses a working `mailto:` link. JavaScript-disabled visitors can still navigate, read project details, and contact Khen.

Changes are prepared on `portfolio-redesign`. Nothing is pushed or deployed automatically.
