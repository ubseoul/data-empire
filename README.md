# DATA EMPIRE — Product Analyst SQL Academy

A browser-based SQL learning game designed around Product Analyst interview readiness.

## What is included

- 4 curriculum eras / 32 campaign missions
- Real SQLite queries running in the browser through `sql.js`
- Product-style datasets: users, events, courses, enrollments, subscriptions, experiments
- Progressive hints instead of answer-first tutoring
- Boss investigations with written analyst findings
- 16 mixed SQL tactics for spaced retrieval
- Ranked mode with a 15-minute timer and no hints
- XP, ranks, skill mastery, streaks, and local save state
- Mastery states: LEARNED / PROVEN / INTERVIEW READY
- Graduation report for an external ChatGPT audit
- Responsive layout for desktop and phone

## Run locally

Because the SQLite engine loads WebAssembly, use a local web server rather than double-clicking `index.html`.

Python:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Publish on GitHub Pages

1. Create a GitHub repository.
2. Upload the contents of this folder to the repository root.
3. In GitHub: **Settings → Pages**.
4. Choose **Deploy from a branch**.
5. Select your default branch and `/ (root)`.
6. Save and open the generated Pages URL.

`.nojekyll` is included so GitHub Pages serves the static files directly.

## Learning design

The campaign moves from explicit instruction toward ambiguous analyst prompts:

1. **Apprentice Analyst** — SELECT, filtering, aggregation
2. **Product Investigator** — grain, joins, CASE, dates, CTEs, data quality
3. **Product Strategist** — activation, funnels, D7 retention, cohorts, segmentation
4. **Ranked Analyst** — window functions, experiments, revenue, ambiguity, interview-style cases

The game grades the *query result*, not exact query text, so alternate correct SQL solutions can pass.

## Important

Progress is saved to `localStorage` in the browser. Clearing site data or changing browsers will reset the save.

The SQL engine is loaded from cdnjs:
`sql.js 1.14.2`

No backend, account, or API key is required.
