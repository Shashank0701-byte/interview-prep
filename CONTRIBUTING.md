# Contributing to Interview Prep AI

Thanks for considering a contribution! This doc covers how the project is set up and the conventions used here.

## Project Structure

This is a multi-service app:

| Service | Path | Stack |
|---|---|---|
| Backend API | `backend/` | Node.js, Express, MongoDB |
| Frontend | `frontend/interview-perp-ai/` | React, Vite, Tailwind CSS |
| AI / RAG service | `ai-training/` | Python, FastAPI |

## Getting Set Up

Follow the [Getting Started](README.md#getting-started) section in the README — either the manual per-service setup, or `docker compose up --build` to run everything at once.

Environment variables for the backend are documented in [`backend/ENV_CONFIG.md`](backend/ENV_CONFIG.md); each service also has a `.env.example` you can copy to `.env`.

## Making Changes

1. Fork the repository (or create a branch if you have write access)
2. Branch off `dev`, not `prod` — `prod` is the deployed default branch, `dev` is where work lands first:
   ```bash
   git checkout -b fix/short-description dev
   ```
3. Make your change. Keep PRs focused — one fix or feature per PR rather than bundling unrelated changes.
4. Commit using a [Conventional Commits](https://www.conventionalcommits.org/) prefix (`fix:`, `feat:`, `docs:`, `ci:`, `refactor:`, `chore:`) — this is the convention already used throughout the project's history.
5. Push and open a PR **against `dev`**.

## Before Opening a PR

- Run the relevant service locally and confirm your change works (`npm run dev` for backend/frontend, or via Docker).
- If you touched backend routes/controllers, sanity-check the affected endpoints manually — there's no automated test suite yet, so manual verification is the current bar.
- Keep documentation in sync: if you add or remove an env var, update `backend/ENV_CONFIG.md` and the relevant `.env.example`.

## Reporting Issues

Open a GitHub issue with:
- What you expected vs. what happened
- Steps to reproduce
- Relevant logs/screenshots if it's a runtime error

## Code Style

Match the conventions already in the file you're editing (naming, comment density, error-handling patterns) rather than introducing a new style. There's no enforced linter/formatter config checked into the repo yet, so consistency with surrounding code is the guideline.
