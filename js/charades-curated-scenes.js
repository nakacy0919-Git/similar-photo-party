/* Short, eight-language Charades cards: independent Standard terms and two-part Challenge cards.
 * No full-sentence scene generator, cross-category random word mixing, or word-count inflation.
 * "&" = act out both concepts; "→" = act out the first, then the second.
 */
(function (root) {
  'use strict';
  const LANGUAGES = ['en','ja','es','pt','fr','de','ko','zh'];
  const ASSIGNMENTS = Object.freeze({
    fauna: ['animals','wildlife','birds','insects','sea'],
    food: ['food','fruits','desserts','drinks','breakfast','japanese_food'],
    persona: ['jobs','movies','history','fantasy'],
    activity: ['sports','games','hobbies'],
    feelings: ['emotions'],
    occasions: ['holidays','school_events','culture'],
    belongings: ['objects','home','clothes','music','technology'],
    education: ['school','science','school_subjects'],
    locations: ['places','community'],
    travel: ['travel'],
    vehicles: ['transport'],
    outdoors: ['weather','nature','space'],
    body: ['body'],
    action: ['actions','daily','funny','farm_actions','classroom_actions','sports_moves',
      'fitness_moves','outdoor_fun','camping_actions','playground','household_chores',
      'cooking_actions','shopping_actions','restaurant_actions','airport_actions',
      'hotel_actions','travel_problems','city_adventures','eco_actions','healthy_habits',
      'digital_actions','social_situations','art_actions','magic_actions',
      'superhero_actions','comedy_situations']
  });

  // Editorially reviewed source associations. Import complete, independently
  // authored cards from closely related categories BEFORE creating scene
  // variants, so a deck does not repeat the same twelve nouns all the time.
  // Relations must be semantic, not random keyword matches.
  const RELATED = Object.freeze({
    animals:['wildlife','birds','insects','sea'],
    wildlife:['animals','birds','insects','sea'],
    birds:['animals'],
    insects:['animals'],
    sea:['animals'],
    food:['fruits','desserts','drinks','breakfast','japanese_food'],
    desserts:['food','fruits','breakfast','japanese_food'],
    drinks:['breakfast'],
    breakfast:['food','drinks','japanese_food'],
    japanese_food:['food','breakfast'],
    movies:['fantasy','history','jobs'],
    fantasy:['movies','history'],
    history:['movies'],
    sports:[],
    games:['sports'],
    hobbies:['sports','games'],
    holidays:['school_events'],
    school_events:['holidays'],
    culture:['holidays','school_events'],
    objects:['home','clothes','music','technology'],
    home:['objects'],
    clothes:[],
    music:[],
    technology:[],
    school:['science','school_subjects'],
    science:[],
    school_subjects:[],
    places:['community'],
    community:['places'],
    weather:[],
    nature:['weather','space'],
    space:[],
    actions:['daily','classroom_actions','sports_moves','fitness_moves','funny'],
    daily:['household_chores','healthy_habits','digital_actions','social_situations','cooking_actions'],
    funny:['comedy_situations','magic_actions','travel_problems'],
    farm_actions:['eco_actions'],
    classroom_actions:['social_situations','art_actions'],
    sports_moves:['fitness_moves'],
    fitness_moves:['sports_moves'],
    outdoor_fun:['camping_actions','playground','sports_moves','eco_actions'],
    camping_actions:['outdoor_fun','eco_actions'],
    playground:['outdoor_fun','sports_moves'],
    household_chores:['cooking_actions','eco_actions'],
    cooking_actions:[],
    shopping_actions:[],
    restaurant_actions:['cooking_actions'],
    airport_actions:['travel_problems'],
    hotel_actions:['travel_problems','restaurant_actions'],
    travel_problems:['airport_actions','hotel_actions','city_adventures','comedy_situations'],
    city_adventures:['shopping_actions','travel_problems'],
    eco_actions:[],
    healthy_habits:['fitness_moves','daily'],
    digital_actions:[],
    social_situations:['digital_actions','comedy_situations'],
    art_actions:[],
    magic_actions:['superhero_actions','comedy_situations'],
    superhero_actions:['magic_actions','comedy_situations'],
    comedy_situations:['funny','magic_actions','superhero_actions','travel_problems']
  });


  function curatedBasePool(deck, sourceDecks) {
    const candidates = [deck.id,...(RELATED[deck.id] || [])];
    const selected = [];
    const used = Object.fromEntries(LANGUAGES.map(lang => [lang,new Set()]));
    for(const id of candidates) {
      const source = sourceDecks.get(id);
      if(!source)throw new Error('Unknown related Charades source '+id);
      for(const card of source){
        const normalized=Object.fromEntries(LANGUAGES.map(lang=>[lang,card[lang].toLocaleLowerCase()]));
        if(LANGUAGES.some(lang=>used[lang].has(normalized[lang])))continue;
        selected.push({...card});
        for(const lang of LANGUAGES)used[lang].add(normalized[lang]);
      }
    }
    return selected;
  }


  function expand(decks) {
    if (!Array.isArray(decks) || decks.length !== 64) throw new Error('Expected 64 Charades decks');
    const mapped = Object.values(ASSIGNMENTS).flat();
    if (mapped.length !== 64 || new Set(mapped).size !== 64) throw new Error('Invalid category mapping');
    const sourceDecks = new Map(decks.map(deck => [deck.id,deck.words.map(word => ({...word}))]));
    for (const deck of decks) {
      if (!mapped.includes(deck.id) || deck.words.length !== 12) {
        throw new Error('Invalid Charades original category '+deck.id);
      }
      const base = curatedBasePool(deck, sourceDecks);
      // Every Standard card is a single vocabulary concept or a single mimeable action.
      const standard = base.map(word => ({...word, level:'standard'}));
      const chosen = [...standard];
      const used = Object.fromEntries(LANGUAGES.map(lang =>
        [lang,new Set(standard.map(word => word[lang].toLocaleLowerCase()))]));
      const limit = 200;
      // Both halves are from one category's carefully selected related concept pool.
      // Distinguish doing BOTH (&) from doing them IN ORDER (→); no arbitrary sentences.
      function add(first, second, kind) {
        if (chosen.length >= limit) return;
        const separator = kind === 'both' ? ' & ' : ' → ';
        const card = {level:'challenge', kind};
        for (const lang of LANGUAGES) card[lang] = first[lang]+separator+second[lang];
        if (LANGUAGES.some(lang => used[lang].has(card[lang].toLocaleLowerCase()))) return;
        chosen.push(card);
        for (const lang of LANGUAGES) used[lang].add(card[lang].toLocaleLowerCase());
      }
      // Spread pairings across all terms rather than overusing the first terms.
      for (let gap=1; gap<base.length && chosen.length<limit; gap++) {
        for (let i=0; i<base.length && chosen.length<limit; i++) {
          const j = (i+gap)%base.length;
          if (i<j) add(base[i],base[j],'both');
        }
      }
      for (let gap=1; gap<base.length && chosen.length<limit; gap++) {
        for (let i=0; i<base.length && chosen.length<limit; i++) {
          add(base[i],base[(i+gap)%base.length],'sequence');
        }
      }
      if (chosen.length !== limit) throw new Error('Not enough genuine two-part prompts in '+deck.id);
      deck.words = chosen;
    }
    return decks;
  }
  const catalog = Object.freeze({ assignments:ASSIGNMENTS, related:RELATED, expand });
  root.CHARADES_SCENES = catalog; // Compatible script registration for browser and Node.
  if (typeof module !== 'undefined' && module.exports) module.exports = catalog;
})(typeof window !== 'undefined' ? window : globalThis);
