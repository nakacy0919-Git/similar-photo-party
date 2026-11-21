# Charades content quality review

## Scope and transparency

- 64 unchanged categories.
- Exactly 200 localized **playable cards per category** (12,800 category cards).
- Eight language labels: English, Japanese, Spanish, Portuguese, French, German, Korean, Simplified Chinese.
- A card is an acting prompt, **not necessarily a new vocabulary word**. The content includes existing independent terms and distinct, contextually relevant acting scenes based on those terms.
- Categories may overlap on a term (for example, *lion* belongs to Animals and Wild Animals). **All Categories** uses text-based deduplication so the same prompt is not shown twice.
- No machine translations or remote calls are needed when playing. The scene text is packaged in the app.

## Content policy implemented

1. Preserve the original 12 translated independent concepts in every category.
2. Where appropriate, prefer independently authored concepts from a semantically neighboring category (e.g., Animals can use Birds, Insects, and Sea Life). Never import unrelated sports, art, or shopping terms merely to reach 200.
3. Complete the total with **one coherent situation per card**. A butterfly may be looking for food or sleeping; it must never be paired mechanically with a human task such as catching a bus.
4. Do not assemble two disconnected labels separated by ` + ` or ` — `.
5. Retain a consistent translation of the original subject across all eight languages.
6. Reject empty labels, duplicate labels within each category and locale, unsupported categories, and incomplete template families.

## Category-aware scenario families

| Family | Category examples | Review focus |
|---|---|---|
| Fauna | Animals, Birds, Insects, Sea Life, Wild Animals | Biological behaviors, natural survival scenes |
| Food | Food, Desserts, Drinks, Breakfast, Japanese Food, Fruit & Vegetables | Tasting, serving, buying, sharing |
| Persona | Jobs, Movie Characters, History, Fantasy | Complete character scenes |
| Activity | Sports, Games, Hobbies | Practice, instruction, competition, participation |
| Feelings | Emotions | Acting one feeling in a recognizable context |
| Occasions | Celebrations, School Events, World Cultures | Attending, presenting, preparing, learning |
| Belongings | Objects, Home, Clothes, Music, Technology | Learning, using, describing, comparing |
| Education | School, Science, School Subjects | Study or demonstration scenes |
| Locations | Places, Community | Going to, finding, observing or describing a place |
| Vehicles | Transport | Travel, safety, arrival, maintenance |
| Outdoors | Weather, Nature, Space | Observation, exploration and representation |
| Body | Body Parts | Pointing, checking, examining, caring |
| Travel | Travel | Preparing, locating and explaining travel essentials |
| Action | Everyday and themed acting categories | A single action modified by a clear acting direction |

## Examples to review visually

| Category | Good card | Why it works |
|---|---|---|
| Animals | The butterfly is searching for food | An animal performing a plausible action |
| Animals | The elephant is drinking water | Natural action to mime |
| Food | Someone is tasting pizza | One food-related action |
| Jobs | The teacher is telling a funny story | A complete scene |
| Emotions | Someone suddenly feels happy | One recognizable emotion |
| Cooking Actions | Slowly chop vegetables | A single cooking action |
| Travel | Someone is getting ready for the passport | Travel preparation |
| Community | Someone is giving directions to the hospital | One community-related scene |

**Rejected:** `butterfly — rushing to catch a bus`, `cat + dog`, `cooking vegetables + flying a kite`.

## Remaining review limitations

- Automated tests check structure, locale completeness, category family mapping, deduplication and known bad examples. They **do not prove every one of the 12,800 cards is idiomatic or equally engaging**.
- Some scenes are situation variants built around the same underlying term. They should not be described as 200 independent vocabulary words per category.
- Playability and naturalness in all eight languages benefit from native-speaker and classroom review before any production release.
- Keep this work as a development-only PR until the teacher has checked a representative selection on iPhone and iPad.

## Test commands

```bash
node --test tests/*.test.cjs
node --check js/charades-curated-scenes.js
node --check js/charades-data.js
```
