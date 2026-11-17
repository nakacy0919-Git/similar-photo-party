# Similar Photo Party review — 2026-11-17

## Scope
Reviewed all application source: index.html, privacy.html, js/game.js, css/style.css, lock.js, tools/update_json.py, and all 168 content records / 42 four-image groups. All referenced content images exist. Image-to-description semantic accuracy was not visually audited.

## Findings addressed
- Dormant public hard-coded password script: removed. It was commented out in HTML, so there was no active authentication to preserve. Public static assets cannot be protected by client-side passwords.
- External executable JavaScript: Tailwind runtime and canvas-confetti copied into js/vendor to freeze code loaded by the application. Tailwind CSS CDN and canvas-confetti 1.6.0 are the upstream sources; retain upstream license notices. Fonts/icon styles still use external providers.
- Content validation: reject malformed records, duplicate IDs/files, unsafe image paths and incomplete groups; disable start until loading succeeds; readable failure messages.
- Answer races: count attempts once per image, disable rejected options and lock all answers after success. Missing confetti and rejected audio playback no longer interrupt game flow.
- Lifecycle: cancel timers/result callbacks and obsolete image loads on home navigation; guard phase transitions; preload all four images before countdown. Pause countdown in settings/background.
- Speech synthesis: feature detection and cancellation prevent unsupported-browser errors and queued repeated readings.
- Privacy/accessibility: correct inaccurate advertising policy and malformed date, secure new-tab links, allow zoom, label choices and honor reduced motion.
- Maintenance script: fail on malformed existing JSON instead of overwriting it, exclude tutorial images, replace output atomically.

## Game improvements implemented
- Shuffle without replacement across all 168 images within a page session.
- Keep all four choices within the same visual group, with a proper Fisher–Yates shuffle.
- First-attempt correct count and per-round attempt feedback; scores reflect image selection, not automated evaluation of spoken English.
- Alternate speaker A/B every round, direct Next Game action, and English description scaffolds (color/count/position/action).
- Remind players that the listener must not see the memorization screen.

## Remaining design considerations
- One shared screen cannot prevent peeking. A teacher-controlled display or separate-device mode would require a different design; no networking/authentication was added.
- Initial 10-second memorization is fixed. Consider selectable memory time and guided/free-description difficulty after classroom trials.
- No account, upload, microphone recording, database, server scoring or analytics exists in this repository. Browser scores are not suitable for trusted grading.
- CDN font/icon styles remain externally loaded. The local Tailwind runtime remains a build-time migration candidate for performance. No blanket claim of vulnerability-free operation is made.

## Validation
`node --test tests/game.test.cjs` passes four suites covering content integrity, complete nonrepeating cycles, same-group choices, answer locking/attempt counting, role changes, home cleanup and malformed content rejection. `node --check js/game.js` and `git diff --check` pass.
Headless Chromium could not launch in this execution environment (socket permission denied). Visual/mobile layout, actual audio and browser background behavior still need real-browser verification. No production deployment performed.
