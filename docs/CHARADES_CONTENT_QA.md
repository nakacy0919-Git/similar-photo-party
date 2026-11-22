# Charades content and difficulty QA

## Game design
- Keep all 64 existing categories and eight supported languages.
- Offer **Standard** (default): an independent word or one short, performable action. Never concatenate unrelated words or display a sentence-style prompt.
- Offer **Challenge**: exactly two concepts drawn from the category's own curated terms (plus individually vetted related-category terms).
- The visible symbol `&` asks the actor to perform both concepts; `→` asks the actor to perform them **in order**. These are two distinct acting tasks rather than arbitrary prose.
- The same category always has **200 total cards**, divided between Standard and Challenge. It does **not** have 200 different independent words in each mode.
- Existing original source terms are preserved with all eight authored translations. Both prompt halves are assembled from those vetted translations; there are no translation network calls.
- Standard is intentionally shorter and smaller than Challenge until more independently authored words are reviewed.

## Examples
| Level | Examples | Instruction |
|---|---|---|
| Standard | `cat`, `soccer`, `brush teeth` | Act one item |
| Challenge | `cat & dog`, `happy → sad` | Act both, or act in order |

## Known limitations and editorial review
- Challenge intentionally combines within-category items. Category belonging does not guarantee that **every** pair is pedagogically interesting or natural, especially in narrow action categories. Review examples before considering deployment.
- There may be overlaps between categories, but All Categories removes exact duplicates in the currently selected language and difficulty.
- Combinatorial cards are not 12,800 unique vocabulary terms. Quality should be prioritized over keeping a quota if later reviews identify weak pairings.
- Verify mobile scrolling, Standard/Challenge selection, Japanese-English switching during play, screen reader labels, timer, pause, score and correct-answer audio.
- This work remains in a development branch and must **not** be merged or deployed without review.

## Test
```bash
node --test tests/*.test.cjs
node --check js/charades-curated-scenes.js
node --check js/charades.js
```
