/*
 * Original multilingual scene builder for classroom charades.
 *
 * Each existing category keeps its 12 single-concept cards and gains:
 *   66 unique two-concept combinations,
 *  120 acting scenes (10 prompts for each seed),
 *    2 three-concept challenges.
 * Total: 12 + 66 + 120 + 2 = 200 playable distinct prompts per category.
 *
 * The 8-language seeds are always taken from charades-data.js. Scene modifiers
 * are independently authored in all 8 languages; no machine translation or
 * network service is needed at runtime. No content is copied from other games.
 */
(function (root) {
  'use strict';
  const LANGUAGE_KEYS = ['en', 'ja', 'es', 'pt', 'fr', 'de', 'ko', 'zh'];
  const EXPECTED_BASE_SIZE = 12;
  const TARGET_PER_DECK = 200;

  // Each line represents one original acting scenario, translations in
  // English, Japanese, Spanish, Portuguese, French, German, Korean, Chinese.
  function parseScenes(label, lines) {
    const result = lines.trim().split('\n').map(line => line.split('|').map(value => value.trim()));
    if (result.length !== 10 || result.some(row => row.length !== LANGUAGE_KEYS.length || row.some(value => !value))) {
      throw new Error('Invalid 8-language acting scenes: ' + label);
    }
    for (const index of LANGUAGE_KEYS.keys()) {
      if (new Set(result.map(row => row[index].toLocaleLowerCase())).size !== result.length) {
        throw new Error('Duplicate acting scene in ' + label + '/' + LANGUAGE_KEYS[index]);
      }
    }
    return result.map(row => Object.fromEntries(LANGUAGE_KEYS.map((lang, i) => [lang, row[i]])));
  }

  const SCENES = Object.freeze({
    actors: parseScenes('actors', `
moving in slow motion|スローモーションで動く|moviéndose a cámara lenta|movendo-se em câmera lenta|se déplaçant au ralenti|in Zeitlupe unterwegs|슬로 모션으로 움직이기|慢动作移动
trying not to laugh|笑いをこらえている|intentando no reír|tentando não rir|essayant de ne pas rire|versucht nicht zu lachen|웃음을 참기|努力憋笑
searching for a lost key|なくした鍵を探している|buscando una llave perdida|procurando uma chave perdida|cherchant une clé perdue|sucht einen verlorenen Schlüssel|잃어버린 열쇠 찾기|寻找丢失的钥匙
rushing to catch a bus|バスに間に合おうと急ぐ|corriendo para alcanzar un autobús|correndo para pegar um ônibus|courant pour attraper un bus|rennt zum Bus|버스를 타려고 서두르기|赶公交车
at a surprise party|サプライズパーティーにいる|en una fiesta sorpresa|numa festa surpresa|à une fête surprise|auf einer Überraschungsparty|깜짝 파티에서|在惊喜派对上
floating in zero gravity|無重力でふわふわ浮く|flotando sin gravedad|flutuando sem gravidade|flottant en apesanteur|schwebt in Schwerelosigkeit|무중력에서 떠다니기|在失重状态下漂浮
pretending to be a robot|ロボットのふりをする|fingiendo ser un robot|fingindo ser um robô|faisant semblant d'être un robot|spielt einen Roboter|로봇 흉내 내기|假装成机器人
carrying a huge suitcase|大きなスーツケースを運んでいる|llevando una maleta enorme|carregando uma mala enorme|portant une énorme valise|trägt einen riesigen Koffer|거대한 여행 가방 나르기|搬着巨大的行李箱
hiding from a tiny spider|小さなクモから隠れている|escondiéndose de una araña diminuta|se escondendo de uma aranha minúscula|se cachant d'une petite araignée|versteckt sich vor einer winzigen Spinne|작은 거미를 피해 숨기|躲避一只小蜘蛛
celebrating a big victory|大勝利を喜んでいる|celebrando una gran victoria|comemorando uma grande vitória|fêtant une grande victoire|feiert einen großen Sieg|큰 승리를 축하하기|庆祝一场大胜利
`),
    actions: parseScenes('actions', `
in slow motion|スローモーションで|a cámara lenta|em câmera lenta|au ralenti|in Zeitlupe|슬로 모션으로|用慢动作
as fast as possible|できるだけ速く|lo más rápido posible|o mais rápido possível|aussi vite que possible|so schnell wie möglich|최대한 빠르게|尽可能快地
like a robot|ロボットのように|como un robot|como um robô|comme un robot|wie ein Roboter|로봇처럼|像机器人一样
with one hand behind your back|片手を背中に回したまま|con una mano a la espalda|com uma mão nas costas|avec une main dans le dos|mit einer Hand hinter dem Rücken|한 손을 등 뒤에 두고|一只手背在身后
while standing on one leg|片足で立ちながら|de pie sobre una pierna|em pé numa perna só|sur une seule jambe|auf einem Bein stehend|한 발로 서서|单脚站立时
in a strong wind|強い風の中で|con un viento muy fuerte|num vento muito forte|dans un vent violent|bei starkem Wind|강한 바람 속에서|在大风中
as if underwater|水中にいるつもりで|como si estuvieras bajo el agua|como se estivesse debaixo d'água|comme sous l'eau|als wäre man unter Wasser|물속에 있는 것처럼|仿佛在水下一样
while trying not to laugh|笑いをこらえながら|intentando no reírse|tentando não rir|en essayant de ne pas rire|ohne zu lachen|웃음을 참으면서|一边憋笑
in complete darkness|真っ暗な中で|en completa oscuridad|na escuridão total|dans le noir complet|in völliger Dunkelheit|깜깜한 곳에서|在完全黑暗中
as a team of two|2人組で|en pareja|em dupla|en duo|zu zweit|둘이 한 팀으로|两人合作
`),
    props: parseScenes('props', `
at the beach|海辺で|en la playa|na praia|à la plage|am Strand|해변에서|在海边
inside a spaceship|宇宙船の中で|dentro de una nave espacial|dentro de uma nave espacial|dans un vaisseau spatial|im Raumschiff|우주선 안에서|在宇宙飞船里
at a birthday party|誕生日パーティーで|en una fiesta de cumpleaños|numa festa de aniversário|à un anniversaire|auf einer Geburtstagsparty|생일 파티에서|在生日派对上
underwater|水中で|bajo el agua|debaixo d'água|sous l'eau|unter Wasser|물속에서|在水下
on a movie set|映画の撮影現場で|en un rodaje de cine|num set de filmagem|sur un plateau de cinéma|am Filmset|영화 촬영장에서|在电影拍摄现场
as a giant version|巨大な姿で|en versión gigante|numa versão gigante|en version géante|als Riesenversion|거대한 모습으로|变成巨大版本
as a tiny version|手のひらサイズになって|en versión diminuta|numa versão minúscula|en version miniature|als winzige Version|아주 작은 모습으로|变成迷你版本
in a haunted house|お化け屋敷で|en una casa encantada|numa casa mal-assombrada|dans une maison hantée|in einem Spukhaus|유령의 집에서|在鬼屋里
during a rainstorm|大雨の中で|durante una tormenta|durante uma tempestade|pendant un orage|während eines Gewitters|폭풍우 속에서|在暴雨中
in a museum|博物館で|en un museo|num museu|dans un musée|im Museum|박물관에서|在博物馆里
`),
    themes: parseScenes('themes', `
in a silent movie|無声映画の中で|en una película muda|num filme mudo|dans un film muet|in einem Stummfilm|무성영화 속에서|在无声电影里
in slow motion|スローモーションで|a cámara lenta|em câmera lenta|au ralenti|in Zeitlupe|슬로 모션으로|用慢动作
on a theater stage|劇場の舞台で|en un escenario de teatro|num palco de teatro|sur une scène de théâtre|auf einer Theaterbühne|극장 무대에서|在戏剧舞台上
during a festival|お祭りの最中に|durante un festival|durante um festival|pendant un festival|auf einem Fest|축제 도중에|在节日期间
in outer space|宇宙空間で|en el espacio exterior|no espaço sideral|dans l'espace|im Weltraum|우주 공간에서|在外太空
in a classroom|教室の中で|en un aula|numa sala de aula|dans une salle de classe|im Klassenzimmer|교실에서|在教室里
as a superhero scene|ヒーロー映画の一場面として|como escena de superhéroes|como cena de super-heróis|comme une scène de super-héros|als Superheldenszene|슈퍼히어로 장면처럼|像超级英雄场景一样
as a mysterious secret|不思議な秘密として|como un secreto misterioso|como um segredo misterioso|comme un mystérieux secret|als geheimnisvolles Rätsel|신비한 비밀처럼|像神秘的秘密一样
in a funny way|おもしろおかしく|de forma divertida|de um jeito engraçado|de façon comique|auf lustige Art|우스꽝스럽게|用搞笑的方式
with a surprise ending|最後に驚きが待っている|con un final sorpresa|com um final surpresa|avec une fin surprise|mit überraschendem Ende|반전 결말과 함께|带有意外结局
`)
  });

  const ACTOR_CATEGORIES = new Set([
    'animals', 'jobs', 'movies', 'fantasy', 'history', 'sea', 'birds', 'insects', 'wildlife'
  ]);
  const ACTION_CATEGORIES = new Set([
    'actions', 'daily', 'funny', 'farm_actions', 'classroom_actions', 'sports_moves',
    'fitness_moves', 'outdoor_fun', 'camping_actions', 'playground', 'household_chores',
    'cooking_actions', 'shopping_actions', 'restaurant_actions', 'airport_actions',
    'hotel_actions', 'travel_problems', 'city_adventures', 'eco_actions', 'healthy_habits',
    'digital_actions', 'social_situations', 'art_actions', 'magic_actions',
    'superhero_actions', 'comedy_situations'
  ]);
  const THEME_CATEGORIES = new Set([
    'sports', 'emotions', 'weather', 'nature', 'space', 'hobbies', 'holidays',
    'culture', 'school_subjects', 'school_events'
  ]);

  function groupForCategory(id) {
    if (ACTOR_CATEGORIES.has(id)) return 'actors';
    if (ACTION_CATEGORIES.has(id)) return 'actions';
    if (THEME_CATEGORIES.has(id)) return 'themes';
    return 'props';
  }

  function combine(terms, suffix) {
    const output = {};
    for (const key of LANGUAGE_KEYS) {
      output[key] = terms.map(item => item[key]).join(' + ') + (suffix ? ' — ' + suffix[key] : '');
    }
    return output;
  }

  function expandDecks(decks) {
    if (!Array.isArray(decks)) throw new TypeError('Expected charades decks');
    for (const deck of decks) {
      if (!Array.isArray(deck.words) || deck.words.length !== EXPECTED_BASE_SIZE) {
        throw new Error('Expected 12 original prompts for ' + deck.id);
      }
      const seeds = deck.words.slice();
      const additions = [];

      // 66 distinct two-part charades challenges. Combinations are unordered,
      // so "cat + dog" does not repeat as "dog + cat".
      for (let left = 0; left < seeds.length; left++) {
        for (let right = left + 1; right < seeds.length; right++) {
          additions.push(combine([seeds[left], seeds[right]]));
        }
      }

      // 120 fully translated imaginative action scenes (10 x 12).
      const scenes = SCENES[groupForCategory(deck.id)];
      for (let sceneIndex = 0; sceneIndex < scenes.length; sceneIndex++) {
        for (const subject of seeds) {
          additions.push(combine([subject], scenes[sceneIndex]));
        }
      }

      // Two three-part bonus cards round out the 200 prompts exactly.
      additions.push(combine([seeds[0], seeds[1], seeds[2]]));
      additions.push(combine([seeds[3], seeds[4], seeds[5]]));
      deck.words = seeds.concat(additions);

      if (deck.words.length !== TARGET_PER_DECK) {
        throw new Error('Invalid total for ' + deck.id + ': ' + deck.words.length);
      }
      for (const lang of LANGUAGE_KEYS) {
        const values = deck.words.map(word => word[lang].trim().toLocaleLowerCase());
        if (new Set(values).size !== TARGET_PER_DECK) {
          throw new Error('Non-unique ' + lang + ' card in ' + deck.id);
        }
      }
    }
    return decks;
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = expandDecks;
  root.CHARADES_EXPANSION = expandDecks;
})(typeof window !== 'undefined' ? window : globalThis);
