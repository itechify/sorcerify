---
name: Sorcerify
description: A dark scrying table where one veiled Sorcery card gives up its text a letter at a time.
colors:
  midnight-table: "oklch(0.145 0 0)"
  table-raised: "oklch(0.269 0 0)"
  moonlight: "oklch(0.985 0 0)"
  pale-lamp: "oklch(0.922 0 0)"
  lamp-ink: "oklch(0.205 0 0)"
  ash: "oklch(0.708 0 0)"
  hairline: "oklch(1 0 0 / 10%)"
  spellbook-ink: "#0b1220"
  ink-panel: "#000000"
  panel-rule: "oklch(44.6% 0.043 257.281 / 50%)"
  card-rim: "oklch(37.2% 0.044 257.287 / 60%)"
  vellum: "oklch(96.8% 0.007 247.896)"
  bone-tile: "oklch(92.9% 0.013 255.508)"
  bone-white: "#ffffff"
  tile-ink: "oklch(20.8% 0.042 265.755)"
  dusk-caption: "oklch(70.4% 0.04 256.788)"
  reveal-green: "oklch(62.7% 0.194 149.214)"
  miss-red: "oklch(57.7% 0.245 27.325)"
  meter-hit: "oklch(69.6% 0.17 162.48)"
  meter-miss: "oklch(63.7% 0.237 25.331)"
  meter-empty: "oklch(44.6% 0.043 257.281 / 50%)"
  focus-sky: "oklch(74.6% 0.16 232.661)"
typography:
  title:
    fontFamily: "Inter, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1
  card-name:
    fontFamily: "Inter, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.5
    letterSpacing: "0.05em"
  card-text:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.375
    letterSpacing: "0.05em"
  body:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.25
    fontFeature: "\"tnum\" 1"
  caption:
    fontFamily: "Inter, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.333
rounded:
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "14px"
  slab: "24px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.pale-lamp}"
    textColor: "{colors.lamp-ink}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
    height: "36px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.moonlight}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "32px"
  button-ghost-hover:
    backgroundColor: "{colors.table-raised}"
  button-guess:
    backgroundColor: "{colors.bone-white}"
    textColor: "{colors.tile-ink}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  key-tile:
    backgroundColor: "{colors.bone-tile}"
    textColor: "{colors.tile-ink}"
    rounded: "{rounded.md}"
    size: "40px"
  key-tile-hit:
    backgroundColor: "{colors.reveal-green}"
    textColor: "{colors.bone-white}"
  key-tile-miss:
    backgroundColor: "{colors.miss-red}"
    textColor: "{colors.bone-white}"
  streak-chip:
    backgroundColor: "{colors.tile-ink}"
    textColor: "{colors.bone-white}"
    typography: "{typography.caption}"
    rounded: "{rounded.md}"
    padding: "4px 8px"
  card-slab:
    backgroundColor: "{colors.spellbook-ink}"
    rounded: "{rounded.slab}"
    width: "380px"
  card-panel:
    backgroundColor: "{colors.ink-panel}"
    textColor: "{colors.vellum}"
    typography: "{typography.card-text}"
    rounded: "{rounded.xl}"
    padding: "8px 12px"
  dialog:
    backgroundColor: "{colors.midnight-table}"
    textColor: "{colors.moonlight}"
    rounded: "{rounded.lg}"
    padding: "24px"
  name-slot:
    backgroundColor: "{colors.bone-tile}"
    textColor: "{colors.tile-ink}"
    rounded: "{rounded.md}"
    height: "40px"
    width: "36px"
---

# Design System: Sorcerify

## Overview

**Creative North Star: "The Scrying Table"**

Sorcerify is a dark table lit by a single focus. In the middle of the room is one veiled card, its text hidden behind blanks, and the player leans in to read it by candlelight. Everything around the card is near-black, neutral and quiet. The page chrome takes no part in the magic. It holds the card, counts the guesses and gets out of the way. The arcane mood comes from three things the system does not draw itself: the Sorcerify logo, the dimmed Sorcery card back behind the masked card, and the four elemental threshold icons. The UI's job is to frame them, not compete with them.

The density is that of a single-column game board: the logo, the date, the card, the guess meter, the guess button, the keyboard. There's one decision on screen at a time, read top to bottom. The interface currently ships dark only (the `dark` class is hardcoded on `<html>`; the light tokens in `:root` are never shown), and the neutral tokens have zero chroma, so the only colour a player sees comes from the card itself and from feedback: green for a reveal, red for a miss. The pale bone tiles of the keyboard sit on the table like physical game pieces. They are the brightest objects after the card, because they are what the player touches.

Bright, busy chrome is rejected. No gradients, glows or neon on navigation, buttons, panels or backgrounds. Two things are allowed to sparkle. The logo is a brand asset and stays as drawn. The win burst is feedback, and it happens once.

**Key Characteristics:**
- Achromatic near-black stage. Colour only shows up as game feedback.
- One lifted object, the masked card. Everything else lies flat on the table.
- Pale, solid key tiles that change colour decisively once used.
- Masked text keeps the shape of every word: underscores stand in for letters and digits, and punctuation and spacing stay visible.
- Elemental thresholds are always shown as the four icon images, never as letters or emoji.
- One sans family (Inter) everywhere. Tracking is widened on card text so the blanks read as discrete slots.

## Colors

The palette is a neutral, zero-chroma night with a cold blue-black card at its centre. Saturated colour is reserved for game feedback.

### Primary
- **Bone Tile** (`oklch(92.9% 0.013 255.508)`): the face of every unplayed keyboard key and every letter slot in the name-guess dialog. It is the "game piece" colour: the brightest thing after the card, because it's what the player touches.
- **Bone White** (`#ffffff`): the "Guess card", "Results" and "Next Card" action buttons, with a thin slate-300 rim. These are the decisive moves in a round, so they get the purest light.
- **Tile Ink** (`oklch(20.8% 0.042 265.755)`): text on bone tiles and bone buttons. It's also the background of the navbar streak chip.

### Secondary
- **Reveal Green** (`oklch(62.7% 0.194 149.214)`): a key whose guess revealed something on the card. Its lighter sibling **Meter Hit** (`oklch(69.6% 0.17 162.48)`) fills the matching segment of the guess meter. The win banner uses green-700 at 80% opacity.
- **Miss Red** (`oklch(57.7% 0.245 27.325)`): a key whose guess revealed nothing. Its sibling **Meter Miss** (`oklch(63.7% 0.237 25.331)`) fills the guess meter. The loss banner uses red-700 at 80% opacity.

### Tertiary
- **Spellbook Ink** (`#0b1220`): the face of the masked card. It's drawn as a 72–78% blue-black wash (`rgba(9, 13, 23, …)`) over the dimmed Spellbook or Atlas card-back image, with this colour as the fallback underneath.
- **Ink Panel** (`#000000`): pure black text panels inside the card (cost and threshold pill, name bar, type line and rules box, stat pill). They're divided by a **Panel Rule** hairline (`oklch(44.6% 0.043 257.281 / 50%)`), and the whole card is rimmed by **Card Rim** (`oklch(37.2% 0.044 257.287 / 60%)`).
- **Vellum** (`oklch(96.8% 0.007 247.896)`): the card name and stats. The type line and rules text use the slightly cooler Bone Tile value at 90% opacity.

### Neutral
- **Midnight Table** (`oklch(0.145 0 0)`): the page and dialog background. Everything sits on it.
- **Table Raised** (`oklch(0.269 0 0)`): hover fill for ghost buttons and the secondary button surface.
- **Moonlight** (`oklch(0.985 0 0)`): default foreground text and inactive nav labels.
- **Pale Lamp** (`oklch(0.922 0 0)`) on **Lamp Ink** (`oklch(0.205 0 0)`): the default button. In practice that's the active nav pill and the Submit button in the name-guess dialog.
- **Ash** (`oklch(0.708 0 0)`): muted copy such as dialog descriptions.
- **Dusk Caption** (`oklch(70.4% 0.04 256.788)`): small captions such as "Daily card for 2026-10-06 (UTC)".
- **Hairline** (`oklch(1 0 0 / 10%)`): default borders on dialogs and outline buttons.
- **Meter Empty** (`oklch(44.6% 0.043 257.281 / 50%)`): unused segments of the guess meter.
- **Focus Sky** (`oklch(74.6% 0.16 232.661)`): a 2px focus outline with a 2px offset on custom action buttons and the How-to-play button.

### Named Rules
**The Feedback-Only Colour Rule.** Chrome is achromatic. Hue appears only when it reports a game outcome (a revealed letter, a miss, a win or a loss) or when it comes from the card's own art and icons. A coloured nav bar, coloured panel or tinted page background breaks the table.

**The Two Signals Rule.** Green means "this revealed something", red means "this didn't". They keep that meaning everywhere: keys, meter, banners and the share squares. Never reuse them for decoration or for unrelated status.

## Typography

**Display Font:** none. The wordmark is the `logo.png` illustration, not set type.
**Body Font:** Inter (variable, 100–900, self-hosted from `/Inter.woff2`, `font-display: swap`), with a generic `sans-serif` fallback.

**Character:** a single neutral grotesque that recedes behind the card. The only typographic flourish is widened tracking (`0.05em`) on card text, which turns each underscore into a readable slot.

### Hierarchy
- **Title** (600, 18px, line-height 1): dialog titles ("Guess the card", "How to play Sorcerify", "Daily Results").
- **Card Name** (600, 16px → 18px from 640px, 0.05em tracking): the masked name bar on the card.
- **Card Text** (400, 12px → 14px from 640px, line-height 1.375, 0.05em tracking, `white-space: pre-line`): the type line and rules text on the card. Line breaks from the card data are kept.
- **Body** (400, 14px, line-height 1.5): instructions, dialog copy, button labels (500).
- **Label** (600, 14px, tabular numerals): "Guesses left: 4" and the bone action buttons.
- **Caption** (400–600, 12px): the date line, "Come back tomorrow" and the streak chip.

### Named Rules
**The Tabular Count Rule.** Every number that changes during play (guesses left, streaks, cost, life, attack/defence) uses tabular numerals, so the layout never jitters as values tick.

**The Slot Tracking Rule.** Masked card text always keeps `0.05em` tracking. Without it, runs of underscores merge into a single line and the word shapes, which are the game's main clue, disappear.

## Layout

There's a single centred column, `max-width: 48rem` (768px), with 16px side padding, under a fixed navbar about 56px tall (`--navbar-height`). The navbar is transparent with a backdrop blur, holding the logo on the left and the Daily/Practice tabs plus the streak chip on the right.

From top to bottom, the board is: logo (max 448px wide), date caption, the masked card, the 7-segment guess meter (max 448px), the guesses-left chip or end-of-round action, the "Guess card" button, the keyboard, and a closing caption. Vertical gap is 16px on mobile and 24px from 640px.

- **Card sizing:** portrait cards are max 275px wide on mobile and 380px from 640px, in a fixed `380 / 531` aspect ratio. Site cards turn landscape (`531 / 380`), max 384px on mobile and 531px from 640px.
- **Keyboard:** three wrapping, centred rows: A–Z, 0–9, then the four threshold tiles. Gap is 4px on mobile and 8px from 640px.
- **Touch targets:** below 640px every `button` and `[role="button"]` is forced to at least 44 × 44px, which turns the keyboard into larger, wrapped rows on phones. The dialog close icon is the one exemption.
- **Breakpoints:** `sm` 640px is the main switch (key, card and text sizes, navbar labels). `md` 768px only widens the name-guess dialog.
- **Spacing rhythm:** a 4px base step (Tailwind's scale), used mostly at 4/8/12/16/24px.

## Elevation & Depth

There's one lifted object. The page, navbar, keyboard and controls all lie flat on the Midnight Table. The masked card is the only thing that floats: a rounded slab with a thin slate rim and a large, soft drop shadow. Dialogs are temporary layers that rise above everything on a 50% black scrim with their own shadow. Small shadows elsewhere (on buttons, and the inset on the cost coin) only add tactility; they don't create a layer.

### Shadow Vocabulary
- **Card lift** (`box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)`): the masked card only.
- **Dialog layer** (`box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)`): dialog content above the `rgb(0 0 0 / 0.5)` scrim.
- **Piece press** (`box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)`): bone action buttons and outcome banners.
- **Coin inset** (`box-shadow: inset 0 2px 4px 0 rgb(0 0 0 / 0.05)`): the cost coin, inline cost coins in rules text, and the name bar.

### Named Rules
**The Single Lift Rule.** Only the card casts a structural shadow on the table. If a new panel, sheet or tile needs to stand out, give it tone or position, not a second big shadow. Dialogs are the only exception, because they are temporary.

## Shapes

The shapes are soft but not bubbly. The base radius is `--radius: 0.625rem` (10px), with steps derived from it.

- **Slab** (24px): the card itself, and the outcome overlay that covers it.
- **Panel** (14px): the type-line/rules box inside the card.
- **Dialog** (10px): dialog content.
- **Piece** (8px): buttons, keys, chips, name slots and the name bar.
- **Meter** (6px): guess meter segments and masked threshold placeholders.
- **Round** (full): the cost coin, the stat pill, the cost/threshold pill, the outcome banners and the How-to-play button.

Card internals copy a real card's layout: a cost coin plus threshold icons top-left (or a blood-drop life marker for Avatars), a stat pill top-right, the name bar below, an empty "art window" in the middle that shows the dimmed card back, and the type/rules box at the bottom. This copies the arrangement of information, not the official trade dress.

## Components

### Buttons
Tactile game pieces. Solid, pale, and unmistakably pressable against the dark table.
- **Shape:** gently rounded pieces (8px).
- **Bone action** ("Guess card", "Results", "Next Card"): Bone White fill, Tile Ink 600 label, thin slate-300 rim, Piece press shadow, `8px 16px` padding. Hover drops to slate-100 and active to slate-200. The focus outline is Focus Sky (2px, 2px offset). Full width on mobile, natural width from 640px.
- **Primary** (shadcn default): Pale Lamp on Lamp Ink, 36px tall. Used for the active nav tab (32px "sm") and the dialog Submit button. Hover lowers it to 90% opacity.
- **Ghost:** transparent, Moonlight label. Hover fills with Table Raised at 50%. Used for inactive nav tabs.
- **Outline:** a hairline border over a translucent input fill, used for Cancel and Share.
- **Disabled:** 50% opacity and no pointer events.

### Keyboard keys (signature)
- **Unplayed:** Bone Tile face, Tile Ink 500 label, 40px square (32px on mobile, then raised to 44px by the touch-target rule). Hover goes to slate-300 and press to slate-400.
- **Revealed:** solid Reveal Green, white label, disabled.
- **Missed:** solid Miss Red, white label, disabled. Because played keys are disabled, they render at 50% opacity and look darker than the raw token.
- **Locked** (round won, or only the final name guess left): slate-300 face, slate-500 label.
- **Threshold keys:** the same tile with the element PNG (16px → 20px) in place of a letter, labelled "air/earth/fire/water threshold".
- Colour changes use a plain `transition-colors`. There's no bounce or flip.

### Masked card (signature)
- **Corner style:** slab (24px), with a Card Rim border and Card lift shadow.
- **Background:** the dimmed Spellbook back (portrait) or Atlas back (Site), under a Spellbook Ink wash.
- **Panels:** Ink Panel black, separated by Panel Rule hairlines, with Vellum text in the Card Text style.
- **Masking:** every unguessed letter or digit becomes `_`. Spaces, punctuation and arrows stay visible. Unrevealed threshold icons become 12–16px square placeholders at `slate-200 / 30%`. Inline costs become small Bone Tile coins showing `_` until guessed.
- **End of round:** the masked rendering is swapped for the official card image (same aspect ratio). A pill banner ("You win!" in green-700/80 or "You lose!" in red-700/80, 18px bold) is centred over it.

### Guess meter
Seven equal segments, 8px tall, 4px apart, 6px corners, max 448px wide. Segments fill left to right in Meter Hit or Meter Miss as guesses are spent, and the rest stay Meter Empty. It's the visual twin of the emoji share row.

### Chips
- **Streak chip** (navbar): Tile Ink background, white 12px semibold label, `4px 8px`, 8px corners. It reads "Daily Streak: n" from 640px and "Streak: n" below that.
- **Guesses-left chip:** black at 40% opacity, slate-100 label, 8px corners.
- **Practice streak:** green-600 at 10% opacity, green-200 label. This is the one place chrome borrows the feedback hue, because it reports a win count.

### Dialogs
Midnight Table surface, hairline border, 10px corners, 24px padding, max 512px wide (the name-guess dialog widens to 672px, then 768px from 768px). They sit on a 50% black scrim. Opening and closing fade with a 95% zoom over 200ms. The close button is a 32px (36px from 640px) ghost square at 70% opacity, rising to 100% on hover.

### Name-guess slots
A slate-800 tray holding one Bone Tile slot (`bone-tile` at 80%, 40px × 32–36px, 8px corners) per letter, grouped into words that wrap together. Hyphens and apostrophes are pre-filled symbol slots at 60%. Letters already revealed on the card show as faint hints at 40% opacity until the player types over them. A visually hidden input captures what the player types.

### Navigation
A fixed, transparent bar with a backdrop blur and `16px / 12px` padding. The logo mark (32px) and the "Sorcerify" wordmark in 18px semibold Moonlight appear on the left. The wordmark is hidden below 640px. The Daily/Practice tabs use the Primary "sm" style when active and Ghost when inactive.

### Win burst
A single burst on the card when the player wins: 16 sparkle dots in random hues, 8 confetti bars and an emerald ring. Particles pop in over 120ms, then fly out over 880–950ms with `cubic-bezier(0.16, 1, 0.3, 1)`; the ring expands 3.2× over 900ms. It plays once, with no pointer events. It doesn't yet check `prefers-reduced-motion`.

### Known drift (recorded, not endorsed)
- There are two focus treatments: shadcn primitives use a 3px ring at `ring / 50%`, while hand-styled buttons use the 2px Focus Sky outline.
- The bone action buttons pass long utility strings on top of `Button` instead of a named variant, so their styling is duplicated across GameBoard and Practice.
- The `theme-color` in `index.html` (`#0f172a`) and the `theme_color` in `manifest.webmanifest` (`#BD34FE`) don't match each other or the Midnight Table.
- The closing caption uses slate-500 at 12px on Midnight Table, which is below 4.5:1 contrast.

## Do's and Don'ts

### Do:
- **Do** keep the page, navbar and dialogs on Midnight Table (`oklch(0.145 0 0)`), with zero-chroma neutrals for all chrome.
- **Do** reserve green and red for reveal/miss and win/loss outcomes, in keys, meter, banners and share squares alike.
- **Do** make the masked card the only object with a structural shadow (Card lift). Every other element lies flat.
- **Do** style new interactive game pieces (keys, slots, decisive actions) as pale bone tiles with Tile Ink labels and 8px corners, so they read as things to touch.
- **Do** keep `0.05em` tracking and `pre-line` wrapping on masked card text, so word shapes survive masking.
- **Do** show elements with the four threshold icon images (`/threshold-icons/*.png`), in keys, on the card and inline in rules text.
- **Do** use tabular numerals for every changing count.
- **Do** keep every tap target at least 44 × 44px below 640px.
- **Do** keep secondary copy at slate-400 (Dusk Caption) or lighter on Midnight Table.

### Don't:
- **Don't** put gradients, glows, neon or tinted backgrounds on chrome (navbar, buttons, panels, page). The logo and the one-shot win burst are the only things that sparkle.
- **Don't** use green or red for decoration, branding or unrelated status.
- **Don't** add a second lifted surface competing with the card, such as floating panels, elevated keyboards or shadowed cards in lists.
- **Don't** redraw, recolour or restyle the logo illustration. The logo images in `public/` are the identity. The navbar's live-type "Sorcerify" label is plain UI text, not a second wordmark.
- **Don't** replace threshold icons with letters, emoji or new icon sets.
