# SimilarPhoto photo-library import (development)

## Origin and approach

The source is the user's **nakacy0919-Git/SimilarPhoto** GitHub repository (public; `main` revision `53625ffce31f14200a3b4eced23e5fd2c3099211`). This is distinct from **nakacy0919-Git/similar-photo-party**.

The original project has **457 WebP assets**, occupying **71,144,652 bytes**. Its original 11 data files supply explanatory spots for **455 distinct images**, one duplicated record for `images/100/103.webp`, and no annotation records for two images (`images/100/101.webp` and `images/400/407.webp`).

The original Image Match mode chooses one correct photograph and three random distractors. It **does not encode fixed, verified four-picture sets**. Therefore the Party app constructs 111 candidate clusters from neighboring numbered pictures **inside the same teaching series**, usually four images and at most seven when the series has a remainder. Each picture can be the correct answer with at least three other pictures from its cluster. These clusters should receive a future visual editorial review for similarity.

## Imported library and learning categories

| Series | Topic | Images |
|---|---|---:|
| 000 | Positions / prepositions | 51 |
| 100 | Maps and charts | 28 |
| 200 | Infinitives and gerunds | 64 |
| 300 | Daily life and sports | 99 |
| 400 | Comparatives | 40 |
| 500 | Modals and choices | 28 |
| 600 | Passive voice | 14 |
| 700 | Perfect tenses | 56 |
| 800 | Relative clauses | 38 |
| 900 | Hypotheticals | 14 |
| 1000 | Conjunctions and logic | 25 |
| **Total** | **11 teaching topics** | **457** |

The Party app already contains 168 photographs in 42 groups. Combined, the game now has **625 indexed photos** and preserves the existing gameplay and Charades content.

Each imported photo has an immutable, unique ID, source path, source-series ID, group ID, title, one original English sentence, Japanese translation and any remaining English/Japanese explanatory spots. Two files lacking source text are flagged as `needsReview=true`, with neutral instructions rather than invented descriptive sentences.

## How images are delivered

The metadata is bundled directly in `js/similarphoto-library.js`. Source image **binaries are not duplicated** inside this repository. Only the actual image being viewed and its three distractors are requested remotely, using a **pinned commit revision**:

- Primary: `https://raw.githubusercontent.com/nakacy0919-Git/SimilarPhoto/53625ffce31f14200a3b4eced23e5fd2c3099211/images/...`
- Fallback: `https://cdn.jsdelivr.net/gh/nakacy0919-Git/SimilarPhoto@53625ffce31f14200a3b4eced23e5fd2c3099211/images/...`

Only these image origins were added to `img-src` in the Content Security Policy; executable scripts remain local. **The original repository must stay publicly accessible.** In a later phase, image files can be copied to dedicated storage or the Party repository for fully independent hosting. No private tokens or browser keys are used.

## Validation and remaining work

- Automated tests verify all 457 unique paths, 455 annotated entries, 2 review-required entries, 111 groups (4–7 images), category counts, and core play flow.
- Validate images visually in a real browser and compare each candidate cluster's four or more pictures before the production release.
- Annotate photos `100/101` and `400/407` accurately after visually inspecting them.
- The original `data/content.json` and all 168 existing photo assets remain untouched.

**Release control:** changes are on `feat/import-similarphoto-457-20261123` only. A preview deployment is allowed for inspection; the production `main` branch and `similar-photo.com` must not be modified without a separate request.
