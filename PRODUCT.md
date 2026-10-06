# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Engaged Sorcery: Contested Realm players who already know the card pool. They play the Daily as a short, repeatable ritual, often on their phone, and post their result in community spaces such as Discord and Reddit.

## Product Purpose

Sorcerify is a daily guessing game that runs in the browser. Players identify a hidden Sorcery: Contested Realm card from partial information. Success means players come back every UTC day, keep their streak, and share their result.

## Positioning

Instead of showing art, Sorcerify hides the card's text. A guess of a single letter, number, or elemental threshold (air, earth, fire, water) reveals every match across the whole card: name, type line, cost or life, stats, and rules text. Winning takes card knowledge as well as deduction. You recognise a card from fragments of its rules and stats, then commit to a name. The game only works for Sorcery, because it depends on Sorcery's card anatomy and threshold system.

## Operating Context

- Short daily sessions, mostly on mobile, with an on-screen keyboard. Desktop players can also type on a physical keyboard.
- The round ends with a results card. Its Share button copies a fixed emoji string to the clipboard, which players paste into community chats.
- After each round, a "View on curiosa.io" link (the community card database) is offered.
- The live site is sorcerify.com, deployed on Vercel.

## Capabilities and Constraints

- **Daily** (primary mode): one deterministic card per UTC day. Wins increase the daily streak and losses reset it. Progress for the day is saved in `localStorage` (`sorcerify:progress`, `sorcerify:streak`, `sorcerify:lastWinDate`).
- **Practice** (secondary mode): unlimited random cards with a win streak that lasts only for the session.
- 7 guesses per round. A correct name wins immediately. A wrong name uses a guess and is removed from the name list. At zero guesses the round is lost and the full card is revealed.
- Free, with no accounts and no backend. All player state stays on the device. This is a standing constraint.
- Card data comes from static JSON (`src/mocks/data/cards.json`) and is validated with valibot. Card images load from an external R2 bucket by variant slug.
- The share format is fixed: `Sorcerify <date key>`, then a row of result squares (🟩/🟥 for each guess, ending in ✅ or ❌), then `https://sorcerify.com`. Players rely on it, so don't change it.
- Stack: React 19, TypeScript, Vite 7, Tailwind CSS v4, Radix dialog primitives (shadcn-style `components/ui`), React Router 7, TanStack Query, Vitest, and Playwright.

## Brand Commitments

- Name: **Sorcerify**. Existing logo assets: `public/logo.png`, `public/logo-small.png`, and the favicon and app icons.
- Sorcerify is an **unofficial fan project**. It isn't affiliated with or endorsed by Erik's Curiosa. Card names, text, and art belong to their owners. Never present the site, or any surface of it, as official.

## Evidence on Hand

- The full card dataset and the official card art (hosted externally), used for gameplay only.
- Threshold element icons in `public/threshold-icons/` and the card-back placeholders in `public/card-placeholders/`.
- The repo has no testimonials, player counts, press, or usage statistics (Vercel Analytics is installed, but none of its data is recorded here). Don't invent any.

## Product Principles

1. **The Daily is the heart.** Decisions start from the daily ritual: one card, one shot, a streak worth protecting, and a result worth sharing.
2. **Respect what players know.** The audience knows Sorcery deeply. Reward recognition and deduction, and don't over-explain the game.
3. **Zero friction, zero accounts.** Open the page and play. No sign-ups, no backend, and player state stays on the device.
4. **The share string is a contract.** What players paste into community chats must stay stable and readable.
5. **A fan tribute, never an imposter.** Honour the game's world without claiming its brand.
