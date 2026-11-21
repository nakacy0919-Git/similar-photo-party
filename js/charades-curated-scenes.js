/*
 * Eight-language, category-aware Charades scenario pack.
 * A scenario is one coherent action or situation, not two unrelated terms.
 *
 * Every term stays in its original semantic category. New prompts are only
 * accepted when they form an understandable action in all eight languages.
 */
(function (root) {
  'use strict';
  const LANGUAGES = ['en','ja','es','pt','fr','de','ko','zh'];
  const FAMILIES = {};
  function family(id, raw) {
    const rows = raw.trim().split('\n').map(line => line.split('|').map(t => t.trim()));
    if(rows.length !== 16 || rows.some(parts => parts.length !== 8 || parts.some(v => !v.includes('%s')))){
      throw new Error('Invalid curated Charades family '+id+': expected 16 eight-language prompts');
    }
    const translations = rows.map(parts =>
      Object.fromEntries(LANGUAGES.map((lang,i)=>[lang,parts[i]])));
    FAMILIES[id]=translations;
  }

  /* A living creature in a physically plausible, recognizable situation. */

  const ASSIGNMENTS = Object.freeze({
    fauna: ['animals','wildlife','birds','insects','sea'],
    food: ['food','fruits','desserts','drinks','breakfast','japanese_food'],
    persona: ['jobs','movies','history','fantasy'],
    activity: ['sports','games','hobbies'],
    feelings: ['emotions'],
    occasions: ['holidays','school_events','culture'],
    belongings: ['objects','home','clothes','music','technology'],
    education: ['school','science','school_subjects'],
    locations: ['places','community','travel'],
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

  function apply(template,subject){
    return template.replace('%s',subject);
  }
  function expand(decks){
    if(!Array.isArray(decks) || decks.length!==64)throw new Error('Expected 64 Charades decks');
    const matched=new Set();
    for(const [familyId,deckIds] of Object.entries(ASSIGNMENTS)){
      if(!FAMILIES[familyId])throw new Error('Missing scenario family '+familyId);
      for(const id of deckIds){
        if(matched.has(id))throw new Error('Duplicate family mapping '+id);
        matched.add(id);
      }
    }
    const output=[];
    for(const deck of decks){
      if(!matched.has(deck.id))throw new Error('Unmapped category '+deck.id);
      if(deck.words.length!==12)throw new Error('Expected 12 curated original items in '+deck.id);
      const familyId=Object.keys(ASSIGNMENTS).find(id=>ASSIGNMENTS[id].includes(deck.id));
      const original=deck.words.map(word=>({...word}));
      const generated=[];
      for(let sceneIndex=0;sceneIndex<16;sceneIndex++){
        const templates=FAMILIES[familyId][sceneIndex];
        for(const word of original){
          const card=Object.fromEntries(LANGUAGES.map(lang=>[lang,apply(templates[lang],word[lang])]));
          generated.push(card);
        }
      }
      // 12 original prompts + 188 coherent situational prompts = 200.
      deck.words=original.concat(generated.slice(0,188));
      if(deck.words.length!==200)throw new Error('Expected 200 Charades prompts for '+deck.id);
      for(const lang of LANGUAGES){
        const seen=new Set(deck.words.map(word=>word[lang].toLocaleLowerCase()));
        if(seen.size!==200)throw new Error('Duplicate scene in '+deck.id+'/'+lang);
      }
      output.push(deck);
    }
    return output;
  }
  // Families are defined below.
