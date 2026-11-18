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

## Security hardening round — 2026-11-18 (review branch only)

- Confirmed `lock.js` is removed from this branch. The file (including its hard-coded password) **still exists on `main` and in repository history** until the user explicitly authorizes merging/updating the production branch. If the password is reused anywhere else, rotate it; deleting a commit/file does not revoke an exposed secret.
- Both `index.html` and `privacy.html` now have a restrictive **CSP meta policy**. Executable scripts must be same-origin, network `connect-src` is same-origin, object/frame embedding and form submission are disabled, and media/image sources are restricted. `worker-src blob:` is retained for the vendored confetti library.
- Removed Google Fonts links and CSS import, replacing them with system-font fallbacks. The icon stylesheet remains a known, fixed version from cdnjs, now pinned to an SHA-512 SRI digest with `crossorigin=anonymous` and `referrerpolicy=no-referrer`.
- Added `tests/security.test.cjs` and included all `tests/*.test.cjs` in the read-only GitHub Actions workflow. The tests prohibit reintroducing a public password gate, external scripts, executable inline HTML handlers and permissive CSP, and require SRI on the remaining external icon CSS.
- No production merges, GitHub Pages publishing operations, hosting changes, or Vercel deployments were performed.

### Remaining technical limitations — do not describe as production-secure
- The runtime Tailwind compiler has now been replaced with a pinned static stylesheet (details below). Visual parity on real phone/iPad/desktop browsers remains **unverified** and is a pre-release requirement.
- The CSP `style-src 'unsafe-inline'` exemption has been removed. Browser-level CSP enforcement and JS/CSSOM behavior still need real-browser testing.
- A meta-delivered CSP **cannot set `frame-ancestors` or HTTP security headers**; these require hosting-layer configuration when supported. It also does not establish an actual-browser security test result.
- Font Awesome is still loaded from an external CDN (though version pinned and integrity checked); its font files remain third-party network requests.
- No real device / browser visual + audio testing or penetration testing was run.

## Static CSS migration — 2026-11-18 (PR review branch only)

**Implemented, but not deployed:**
- Generated `css/tailwind-static.css` (~45 KB) from Tailwind CSS **4.1.10** with **281 explicit utility candidates** in `tools/tailwind-candidates.txt`. All 281 candidate selectors are present, including media-query, hover/active, color opacity and arbitrary value classes.
- Updated both `index.html` and `privacy.html` to load the local static CSS before `css/style.css`. Removed the browser-side `js/vendor/tailwind.js` compiler (~400 KB), so the browser no longer compiles Tailwind on every load.
- Moved the inline result image flex-basis value to `css/style.css`. Removed the `style-src 'unsafe-inline'` CSP exception on both pages, while retaining explicitly permitted CDN icon CSS with SHA-512 SRI.
- Introduced `tools/build-static-css.cjs` as a reproducible build script. It pins the compiler to Tailwind **4.1.10**, accepts the explicit class list, checks core utilities and writes the frozen CSS.
- Used a temporary **review-branch-only** GitHub Actions workflow to create the static CSS file once; then deleted that workflow, including its temporary write permissions. No automatic CSS compiler or deployment workflow remains in the repository. `gameplay-checks.yml` retains **contents: read** and only runs checks.
- Security regression tests now verify static CSS presence, script/CSP restrictions, full safelist coverage, source class inventory and read-only CI. **26 automated tests** (16 game + 10 security) passed on the review branch.

### Maintenance

When UI classes change, edit `tools/tailwind-candidates.txt` and rebuild offline with Node 22:
```sh
npm install --no-save --ignore-scripts --no-audit --no-fund tailwindcss@4.1.10
node tools/build-static-css.cjs
node --test tests/*.test.cjs
```
Commit the updated `css/tailwind-static.css` on the development branch. The CI verifies the safelist and fails if UI code gains a class that is not represented.

### Still to check manually

- **Visual regression**: compare results on iPhone Safari, Android Chrome, iPad Safari and desktop Chrome. Tailwind 4 static CSS may differ in defaults from the previous Tailwind runtime; examine landing, settings, timer, image grid, Japanese text, feedback and result. Static CI cannot prove visual parity.
- **Browser security**: test CSP enforcement, image/audio/speech playback, confetti and background/foreground transitions in browsers. External icon assets still load through cdnjs.
- **Hosting policy**: HTTP response headers such as `frame-ancestors` are not set by a CSP meta tag and may need separate hosting support. Publishing from the review branch was not attempted.
- **Passwords**: `lock.js` is absent only from this PR branch; main and historical public commits are untouched. Rotate any reused password.
