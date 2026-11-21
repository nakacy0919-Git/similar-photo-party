/* Pure helpers shared by the browser game and Node regression tests. */
(function (root) {
  'use strict';
  function shuffle(items, random = Math.random) {
    const result = items.slice();
    for (let index = result.length - 1; index > 0; index--) {
      const target = Math.floor(random() * (index + 1));
      [result[index], result[target]] = [result[target], result[index]];
    }
    return result;
  }
  function availableWords(catalog, deckId, language) {
    if (!catalog || !Array.isArray(catalog.decks) || !catalog.languages.some(row => row[0] === language)) {
      return [];
    }
    const decks = deckId === 'all' ? catalog.decks : catalog.decks.filter(deck => deck.id === deckId);
    const seen = new Set();
    return decks.flatMap(deck => deck.words.map(word => {
      const term = word[language];
      if (!term || !term.trim()) return null;
      const identity = term.trim().toLocaleLowerCase();
      if (seen.has(identity)) return null;
      seen.add(identity);
      return { text: term.trim(), deckId: deck.id };
    }).filter(Boolean));
  }
  function pointsForPhotoAttempt(attempts) {
    if (!Number.isInteger(attempts) || attempts < 1) return 0;
    return [100, 60, 30][attempts - 1] || 10;
  }
  function validateCatalog(catalog) {
    if (!catalog || !Array.isArray(catalog.decks) || !Array.isArray(catalog.languages)) return false;
    const ids = new Set();
    return catalog.decks.length > 0 && catalog.decks.every(deck => {
      if (!deck.id || ids.has(deck.id) || !Array.isArray(deck.words) || deck.words.length < 10) return false;
      ids.add(deck.id);
      return deck.words.every(word => catalog.languages.every(([lang]) => (
        typeof word[lang] === 'string' && word[lang].trim().length > 0
      )));
    });
  }
  const core = Object.freeze({ shuffle, availableWords, pointsForPhotoAttempt, validateCatalog });
  if (typeof module !== 'undefined' && module.exports) module.exports = core;
  root.CHARADES_CORE = core;
})(typeof window !== 'undefined' ? window : globalThis);
