# Sorcerify

A small browser game where you guess the Sorcery: Contested Realm card. Play the Daily to keep your streak, or Practice for unlimited rounds.

## Tech stack

- React 19 + TypeScript on Vite 7
- Tailwind CSS v4 for styling
- TanStack Query for data fetching/caching
- React Router v7 for routing
- Vitest + Testing Library for unit/integration tests
- Playwright for end-to-end tests
- Biome for formatting and linting

Absolute imports are configured with the `@` alias to `src` (see `vite.config.ts`).

## Gameplay

- **Daily**: A deterministic daily card based on the current UTC date. Win to increase your daily streak. Streak is stored in `localStorage` under `sorcerify:streak` and `sorcerify:lastWinDate`.
- **Practice**: Infinite random cards with a session-only win streak.
- **Goal**: Reveal the card enough to select its exact name from the dropdown. A correct name guess wins the round; running out of guesses loses it.
- **Input**: Click on-screen keys or use your keyboard. You can also guess elemental thresholds by using tokens: `air`, `earth`, `fire`, `water`.

Card data is loaded from static JSON (`src/mocks/data/cards.json`).

## Getting started

Prerequisites:

- Node 18+ (or 20+ recommended)
- `pnpm` (the repo uses `pnpm@10`)

Install dependencies:

```sh
pnpm install
```

Start the dev server:

```sh
pnpm dev
```

The app runs at `http://localhost:5173` by default.

## Scripts

- `pnpm dev`: Start the development server (opens browser)
- `pnpm build`: Build the production bundle to `dist/`
- `pnpm preview`: Preview the production build locally
- `pnpm test`: Run unit/integration tests in watch mode
- `pnpm test:ci`: Run all unit/integration tests once
- `pnpm test:e2e`: Run Playwright tests with the UI
- `pnpm test:e2e:ci`: Run Playwright tests headlessly
- `pnpm lint`: Type-check and run Biome checks (with safe fixes)
- `pnpm format`: Format the codebase with Biome
- `pnpm validate`: Run lint, unit, and e2e tests in CI mode

## Project structure

- `src/pages/` — Routes: `Home` (redirects to Daily), `Daily`, `Practice`
- `src/components/` — UI components like `GameBoard`, `Keyboard`, `NavBar`, `SorceryCard`
- `src/api/cards.ts` — Card schema validation and data loading
- `src/mocks/data/cards.json` — Static card dataset
- `tests/` — Playwright e2e tests

Key behaviors:

- Daily selection is derived from the UTC date; progress for the Daily round is persisted under `sorcerify:progress` in `localStorage` per day key.
- Practice mode stores only in-memory progress and a session win streak.

## Testing

- Unit/integration tests use Vitest with a `happy-dom` environment. Test files live under `src/**/*.test.ts?(x)`.
- E2E tests use Playwright (`tests/`), which boots the dev server automatically.

Run unit tests:

```sh
pnpm test
```

Run e2e tests (headless):

```sh
pnpm test:e2e:ci
```

## Deployment

This is a static site. Any static host will work (GitHub Pages, Netlify, Vercel, etc.).

```sh
pnpm build
# deploy the contents of dist/
```

If your host expects a different base path, configure it via Vite’s `base` option.

## Contributing

1. Create a feature branch
2. Make changes and add tests where relevant
3. Run `pnpm validate`
4. Open a PR

## License

MIT. See `LICENSE`.
