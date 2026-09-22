# DATA EMPIRE — Beginner-First SQL Game

A browser-based SQL game designed to take a complete beginner from "what is a table?" to Product Analyst SQL without dumping the whole curriculum on screen at once.

## V2 learning design

The learner sees **one question, one concept, one small win** at a time.

Each new idea progresses through:

1. **See it** — a complete query is demonstrated.
2. **Change it** — edit one small piece.
3. **Build it** — complete an incomplete query.
4. **Use it** — retrieve the idea later without being told which SQL technique to use.

The built-in Coach has three levels:

- **Nudge me** — directional hint only.
- **Teach me** — explains the missing concept.
- **Show me** — fills in one valid solution, while marking the lesson as assisted rather than independent.

SQL errors are translated into beginner-friendly feedback while still showing the real database error underneath.

## Curriculum

The later curriculum exists from day one but stays hidden until the learner reaches it:

1. Show Me Stuff — `SELECT`, `FROM`
2. Find Stuff — `WHERE`, comparisons, `AND`, `OR`
3. Organize Stuff — `ORDER BY`, `LIMIT`, `DISTINCT`
4. Count Stuff — `COUNT`, `AVG`, `GROUP BY`
5. Connect Stuff — `JOIN`, `LEFT JOIN`, `CASE`, CTEs
6. Read the Product — activation, funnels, D7 retention, cohorts
7. Interview Mode — window functions, experiments, multi-metric analysis

There are 42 tiny lessons total.

## Run locally

The real SQLite engine runs in WebAssembly, so serve the folder rather than double-clicking the HTML file:

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## GitHub Pages

1. Create a repository.
2. Upload the contents of this folder to the repository root.
3. Go to **Settings → Pages**.
4. Choose **Deploy from a branch**.
5. Select the default branch and `/ (root)`.

No backend or API key is required. Progress saves to `localStorage` in the browser.


## V3 — Growing SQL Cheat Sheet

Every lesson now includes a side reference containing only SQL concepts introduced up to that point. It includes plain-English meanings, copyable syntax patterns, and the query order learned so far. Looking at the cheat sheet has **no mastery or XP penalty**; Coach help remains tracked separately.
