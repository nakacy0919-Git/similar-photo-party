# SimilarPhoto 457-image visual similarity audit

## Why this change was necessary

The 11 original teaching series provide English grammar/vocabulary organization, not fixed four-picture similarity sets. The source app's Image Match mode chose three distractors at random. A review of the **actual image contact sheets** shows many near-duplicate **pairs**, but not four near-identical images for every topic. Groups must therefore be treated as **recommendations for a four-choice game**, not as originally authored four-image bundles.

## Analysis performed

A read-only GitHub Actions job checked out all 457 original WebP photos at a pinned source commit. `tools/audit-photo-similarity.py` computed and combined:

- DCT perceptual hash (24% overall score)
- Resized image color and spatial distribution (33%)
- Local edge orientation and object layout (23%)
- Original English title and description similarity (20%; never invented)

The score uses **80% image evidence, 20% original written description**. Image numbers are used only for stable labeling of the finished groups, not to calculate similarity.

An optimization step finds visual-near neighbor groups within each source teaching series; it then uses candidate swaps to reduce the within-group distance and falls back to the existing number-based group if that group's average score would get worse.

## Results

| Property | Result |
|---|---:|
| Original images examined | 457 |
| Series checked | 11 |
| Candidate groups for four-choice play | 111 |
| Groups with four alternatives in the candidate pool | 98 groups with 4 pictures |
| Groups with five alternatives in the candidate pool | 13 groups with 5 pictures |
| Automatically prioritized candidate groups | 33 groups / 136 pictures |
| Candidate groups requiring visual review | 78 groups / 321 pictures |
| Average reduction in within-set dissimilarity across 11 series | 5.5% |
| Photos that received genuinely different group members vs. filename-neighbor grouping | 445 of 457 |

The heuristic that prioritizes candidates is **average image-only distance ≤ 0.27 AND worst image pair distance ≤ 0.36**. This is a relative machine-derived score threshold, **not a verified probability or human approval**. Even prioritized groups may need correction. The labels shown in the game are deliberately **「類似写真候補」 / "Visual similarity candidates"** rather than claiming every group is definitely alike.

## Gameplay integration

- Existing 168 photo assets and 42 original groups unchanged
- All 457 imported photos remain selectable through their existing 11 learning-series categories and the `追加教材・すべて` option
- The imported images' distractor-group relationships now come from the image analysis, not filename adjacency
- A new `類似写真候補` selector restricts the pool to 33 machine-selected candidate groups
- The actual answer still shows **exactly four images**, regardless of whether the candidate source pool has four or five pictures
- Every source photo remains available for use, but a weakly similar group is not silently presented as human-verified

## Example observations from contact sheets

- `000` includes a genuine-looking sequence of photographs of similar storage shelves, while many other sequences are naturally only two photos of a similar subject
- `600` includes a broken-window pair, but the remaining photos depict cakes, car washing, cooking, and other unrelated events, so 4-way matching there still requires manual review
- `100` has particularly coherent chart and pie-chart families; such groups are well suited for similar-image discrimination
- `300` includes both closely related classroom scenes and unrelated outdoor scenes

**Do not release merely on the basis of this score.** A teacher should inspect the contact sheets before claiming any four pictures are educationally equivalent distractors. Pairs with no suitable third/fourth match could be retained in the reference library instead of being forcibly grouped into low-quality gameplay.

## Review artifact

The GitHub Actions `Original SimilarPhoto image-similarity audit` uploads `original-similarphoto-visual-review` containing 11 JPG contact sheets, the group mapping and a quality report. Human checking is straightforward because the first four choices for each cluster are shown in one cell.

## Tests and release policy

- `tests/photo-visual-clusters.test.cjs` checks 457 unique paths, 111 groups, quality flags, labels and category filters
- `tests/game.test.cjs` verifies the READY → picture → 4 images sequence can play the 136-photo prioritized category
- This development branch builds on PR #12; production `main` and `similar-photo.com` are not modified

Future work: annotate the two original photos lacking captions, review flagged 78 groups and split poor groups or create new visually consistent photo variants only after the user approves their creation.
