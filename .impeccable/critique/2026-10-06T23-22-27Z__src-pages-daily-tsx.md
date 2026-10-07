---
target: Daily gameplay
total_score: 21
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 4
target_identity: "file:C:\\Users\\itech\\.t3\\worktrees\\sorcerify\\t3code-e4f87317\\src\\pages\\Daily.tsx"
target_fingerprint: "sha256:6248e4abe65340e37413cdc1b30a41cbecbf52c3c0623c005c06c130fc2fe1d6"
target_path: "C:\\Users\\itech\\.t3\\worktrees\\sorcerify\\t3code-e4f87317\\src\\pages\\Daily.tsx"
timestamp: 2026-10-06T23-22-27Z
slug: src-pages-daily-tsx
closed: true
---
Method: dual-agent (A: /root/design_review · B: /root/detector_evidence)

Target: src/pages/Daily.tsx and shared gameplay components. Desktop 1280×800/900; phones 390×844 and 320×568. Operate mode. Screenshot capture failed; evidence is live DOM, geometry, interaction outcomes, computed styles and source.

## Design specificity and overall impression

Sorcerify feels authored for its game. Masked card anatomy, preserved word shapes and elemental pieces support the Scrying Table direction. Keep that identity. The largest opportunity is to bring clues and controls together and make consequential transitions understandable.

## Design health

| # | Heuristic | /4 | Key finding |
|---|---|---:|---|
| 1 | Visibility of system status | 2 | Wrong names and final-attempt restriction lack explanations |
| 2 | Match with the real world | 3 | Card anatomy fits players; slot editing is unfamiliar |
| 3 | User control and freedom | 2 | Small-phone help loses its visible close control |
| 4 | Consistency and standards | 2 | Instructions describe a removed dropdown |
| 5 | Error prevention | 2 | Invisible name suffixes can be submitted |
| 6 | Recognition rather than recall | 2 | Name modal hides rules/stat clues |
| 7 | Flexibility and efficiency | 3 | Physical and touch keyboards work |
| 8 | Aesthetic and minimalist design | 2 | Oversized logo separates clues from controls |
| 9 | Error recovery | 2 | Wrong/duplicate names and clipboard failures lack clear recovery |
| 10 | Help and documentation | 1 | Winning instructions are obsolete |
| **Total** | **Acceptable** | **21/40** | Significant usability improvements needed |

## What works

- Card structure and elemental icons reward Sorcery knowledge.
- Seven-segment meter, remaining count and used-key states communicate the ordinary guess budget.
- No account barrier, saved Daily progress, and a stable share format support the daily ritual.

## Priority issues

1. **[P1] Help teaches an interaction that no longer exists.** InfoModal.tsx:38–41 promises a dropdown and “Guess name”; the actual dialog has typed slots and “Submit”. Players seeking guidance receive unusable directions. Rewrite help around actual controls, whole-name entry and the final-attempt rule. Suggested command: $impeccable clarify.

2. **[P1] The final guess and wrong-name outcomes are unexplained.** GameBoard.tsx:363–364 reserves the last attempt; :495 disables every clue key while the counter still says one guess remains. Wrong names close the dialog and decrement the count without explanation (:414–417, :514). Add “Final guess — name the card”, explicit wrong-name feedback, and a polite live status. Used-key outcomes need a non-color equivalent. Suggested command: $impeccable harden.

3. **[P1] Small-phone help extends outside the screen.** At 320×568, the help dialog measured 273×730, from y=−81 to 649; Close was above the viewport. Body scrolling was locked and dialog overflow was visible. Escape works, but touch users lose the visible close action and opening content. Bound the shared dialog height to the viewport and make its body scroll while keeping Close visible (ui/dialog.tsx:58). Suggested command: $impeccable adapt.

4. **[P1] Name entry can submit text players cannot see.** On today's three-slot name, eleven typed characters remained in the hidden input while only ABC appeared; Submit enabled. A separate test submitted forty x characters and spent an attempt. NameGuessModal.tsx:83–85 displays only slot indices; :160–168 checks coverage without rejecting excess input; :179–182 sanitizes without length limits. Use a visible standard text field with the clue above, or make slot editing, focus and length constraints explicit. Explain whether to type the complete name. Suggested command: $impeccable harden.

5. **[P2] The logo pushes the gameplay controls below the fold.** At desktop width 1280, logo height was about 299px; Guess card started y=878 and keyboard y=938. At 390×844, logo height was 229px and digits/thresholds were below the fold. Reduce the in-board logo footprint and vertical gaps so clues and core input can be used together (Daily.tsx:191–197, GameBoard.tsx:464). Suggested command: $impeccable layout, then $impeccable adapt.

## Detector evidence

CLI scan of src: four advisory findings, no warnings/errors. Two type-ramp exceptions (10px and 11px inline cost numerals, SorceryCard.tsx:105); a 2px win-particle radius (global.css:133); a win-ring color (global.css:148). These warrant documenting intentional exceptions, not redesigning the coin or permitted win celebration.

Browser scan: six findings. One valid low-contrast caption, “Come back tomorrow…”, measured 4.2:1 against a required 4.5:1 for its small text. Inter usage and nested card panels are explicit design commitments. Two SVG-illustration findings and a glow finding came from TanStack Query devtools, outside the product UI.

Detector injection succeeded, but browser visibility stayed false; no reliable user-visible overlay was available. The overlay was removed.

## Cognitive load and emotional journey

Three literal checklist failures: chunking (26 letters, 10 digits), minimal choices (40 clue tokens), and working memory (rules/stats hidden during name entry). Familiar keyboard choices are intrinsic game complexity; do not hide letters just to meet a numerical checklist. Reduce scroll travel and carry useful clues into the name decision.

The card creates curiosity and reveals reward deduction. Unexplained wrong-name and final-attempt transitions interrupt that momentum. Results restore closure with answer, artwork and sharing.

## Persona red flags

- **Casey, mobile:** repeated scroll travel between clues and input; help Close is inaccessible on the small-phone viewport. Main game keys do measure 44px.
- **Jordan, new to Sorcerify:** obsolete dropdown directions and sudden disabled keys make the rules hard to learn.
- **Sam, accessibility:** no dedicated live status for guesses; color-only meter/history; hidden name input lacks a visible editing caret.

## Minor observations

- Footer caption needs higher contrast.
- Phone navigation links are 32px high, smaller than the 44px game controls.
- Clipboard failures are silently caught (ResultsModal.tsx:129–137); provide retry and selectable share text. This is source evidence, not a reproduced denial.
- Completed boards retain disabled input controls; foreground answer, share and next reset instead.
- Native phone keyboard behavior and win-celebration timing were not verified.

## Questions to consider

1. Which should lead: gameplay clarity, mobile usability, or name-entry editing?
2. Which scope: all five priorities, the four P1 issues, or one focused fix?
