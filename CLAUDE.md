# CLAUDE.md — lw.comm-server

Node.js project.

## Run

- `npm install`, then start the app (see package.json scripts).
- Env vars live in `.env` and are read by the app via dotenv — not loaded into the shell.

## Commits

- Conventional Commits: `type(scope): summary` (feat, fix, docs, style, refactor, perf, test, build, ci, chore).
- Imperative summary, under ~72 chars, no trailing period; body explains the "why" when useful.
- Commit in small, logical chunks. Never commit secrets, build artifacts, or dependencies.
- Only push when explicitly asked.

## Style

- Be concise and direct.
- Code comments: avoid the C-style block-comment delimiters; prefer line comments.
