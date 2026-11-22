/* Validate classroom Charades labels before and after expansion.
 * Standard is one concept/action; Challenge is an intentional two-part mime task.
 */
(function (root) {
  'use strict';

  const LANGUAGES = Object.freeze(['en', 'ja', 'es', 'pt', 'fr', 'de', 'ko', 'zh']);
  const MULTI_PROMPT_SEPARATOR = /\s(?:\+|＋|—|–)\s/u;
  const MINIMUM_ITEMS = 12;

  function validateStandaloneDecks(decks) {
    if (!Array.isArray(decks) || decks.length === 0) {
      throw new TypeError('Expected Charades decks');
    }
    const deckIds = new Set();

    for (const deck of decks) {
      if (!deck || typeof deck.id !== 'string' || deckIds.has(deck.id)) {
        throw new Error('Invalid or repeated Charades category');
      }
      deckIds.add(deck.id);
      if (!Array.isArray(deck.words) || deck.words.length < MINIMUM_ITEMS) {
        throw new Error('Expected at least 12 curated prompts for ' + deck.id);
      }

      const used = Object.fromEntries(LANGUAGES.map(lang => [lang, new Set()]));
      for (const item of deck.words) {
        for (const lang of LANGUAGES) {
          const label = item && item[lang];
          if (typeof label !== 'string' || !label.trim()) {
            throw new Error('Missing Charades translation for ' + deck.id + '/' + lang);
          }
          if (label !== label.trim() || MULTI_PROMPT_SEPARATOR.test(label)) {
            throw new Error('Two-concept Charades prompt rejected: ' + deck.id + '/' + lang);
          }
          const level = item.level || 'standard';
          if (!['standard','challenge'].includes(level)) throw new Error('Invalid Charades level: '+deck.id);
          const pieces = label.split(/\s(?:&|→)\s/u);
          if (level === 'standard' && pieces.length !== 1) {
            throw new Error('Standard must contain one concept: '+deck.id+'/'+lang);
          }
          if (level === 'challenge' && (pieces.length !== 2 || pieces.some(x => !x.trim()))) {
            throw new Error('Challenge must contain two concise concepts: '+deck.id+'/'+lang);
          }
          if (level === 'challenge' && !['both','sequence'].includes(item.kind)) {
            throw new Error('Unknown Challenge kind: '+deck.id);
          }
          const normalized = label.toLocaleLowerCase();
          if (used[lang].has(normalized)) {
            throw new Error('Repeated Charades prompt: ' + deck.id + '/' + lang);
          }
          used[lang].add(normalized);
        }
      }
    }
    return decks;
  }

  if (typeof module !== 'undefined' && module.exports) module.exports = validateStandaloneDecks;
  root.CHARADES_EXPANSION = validateStandaloneDecks; // Retain existing module interface.
})(typeof window !== 'undefined' ? window : globalThis);
