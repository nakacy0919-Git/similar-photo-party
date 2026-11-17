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

## Follow-up changes — 2026-11-17 (chat development)
- Added selectable memorization time: 5, 10, or 15 seconds (default remains 10). The new setting applies to the next memorization countdown and updates the tutorial description.
- Added Guided and Free speaking modes (default Guided). Free mode removes the suggested English sentence frames in the explanation phase, not the target English answer displayed after the round.
- Left the existing first-attempt scoring and automatic speaker alternation unchanged.
- Added a fifth Node regression test for valid/invalid time settings, guided/free hints and cleanup.
- Added a read-only GitHub Actions workflow to run the JavaScript syntax check and Node tests on pull requests. A successful workflow run must be checked on GitHub; authoring the workflow does not prove tests passed.
- No merge to main or intentional production deployment was performed.

## Follow-up improvements — 2026-11-18 (mobile / audio / pair roles)

Implemented in PR #1, not merged:
- Mobile portrait/landscape: removed the previous 75%-scale / 133vw landscape workaround. Small viewports now keep the game in the viewport and allow vertical scrolling for memorization, explanation, 2×2 answers and results without forcing the images/buttons to shrink offscreen. Result panels stack vertically, while large screens keep the original wide layout.
- Visual role guidance: each game phase now clearly displays which player remembers/describes/chooses, tells the listener not to look at the memory image, and identifies the next speaker when roles switch.
- Speaking follow-up: the results phase explicitly prompts pairs to compare incorrect pictures aloud in English. This does not pretend to measure or score spoken proficiency.
- Speech synthesis: cancel stale utterances, ignore outdated end/error callbacks, handle missing APIs and exceptions, pause voice/BGM on background transitions, offer user-visible replay/error information, and recover with a watchdog if a mobile speech engine silently stalls. BGM playback is guarded against background or simultaneous speech; sound effects no longer interrupt a round if audio playback fails.
- Regression tests: role rotation, mobile CSS rules, missing browser speech, repeated/stale voice callbacks, tab background behaviour and hung speech recovery. Existing content integrity and scoring tests are preserved.

### Before classroom/public rollout
- Verify on **real devices** (iPhone Safari, Android Chrome, iPad Safari, desktop Chrome): portrait and short-height landscape layout; 2×2 touch targets; scroll-to-next / settings overlay; memorize → explain → choose → result → role switch; optional English TTS, repeated Listen taps, BGM mute, and tab/background return.
- The automated tests validate code and state logic; they do not establish that an actual phone speaker outputs audio or that a browser looks correct. No live-browser or hardware verification was performed here.
- Do not merge or deploy until these device checks are complete.

## Speaking-focused gameplay follow-up — 2026-11-18

Added to the review branch; no merge or production deployment:
- **Speaking Mission**: each round cycles through three generic communication targets: identify the main subject, describe its location, and give a distinguishing detail. Prompts deliberately do **not** reveal a specific correct answer before the listener chooses. In Guided mode the active goal has an English sentence frame; in Free mode only the goal remains.
- **Listener clarification**: during the explanation stage, the listener may press *Ask for one more clue*, revealing a question in English and extending the **current** explanation timer by 10 seconds. Available once per round; not available during memory, selection, or result; timer continues respecting existing background/settings pausing.
- **Peer feedback**: after the answer, the listener can check up to three observation categories (who/what, where, distinguishing detail). Optional, editable within the round and kept as per-player session totals for A/B. Blank feedback is **not** counted as an assessed round. This is a partner observation—not a speech-recognition score, automated grading, or teacher-verifiable record.
- **Responsive UI**: compressed, wrapped feedback checkboxes and focus prompts on small screens, with touch-friendly clarification control.
- **Regression coverage**: 14 Node tests for content, game flow, speech, mobile styling, rotating speaking missions, once-only time bonus, empty/edited feedback, and speaker-specific totals.

The repository remains a static front-end game: no account, microphone capture, speech scoring, database, or persistent analytics was added. Session feedback resets on page reload. Test automation does not substitute for an actual Safari/Chrome mobile/device inspection.
