(() => {
  'use strict';
  const DATA = window.CHARADES_DATA;
  const CORE = window.CHARADES_CORE;
  const $ = id => document.getElementById(id);
  const UI = {
    ja: {back:'Photo Party',language:'言語',hero:'世界中の言葉でシャレード！',tagline:'お題を見て、伝えて、当てよう！ペアでもチームでも楽しめます。',choose:'カテゴリーを選ぼう',settings:'ゲーム設定',roundLength:'1ラウンドの時間',playStyle:'遊び方',acting:'身ぶりで伝える（クラシック）',forehead:'額に当てて当てる（ヒントあり）',players:'参加方法',pair:'ペア／みんなで協力',teams:'2チーム対抗',teamA:'チームA',teamB:'チームB',start:'▶ ゲームスタート',how:'正解は右、パスは左をタップ。キーボードの ← / → にも対応。',time:'残り時間',score:'得点',pass:'パス',correct:'正解！',finish:'ラウンド終了',roundComplete:'ラウンド終了！',next:'次のラウンドへ',newGame:'設定に戻る',tilt:'傾き操作を有効にする',all:'全カテゴリーをミックス',words:'題',actingHint:'お題を見て、ジェスチャーで伝えよう！',foreheadHint:'額に当てて、仲間のヒントを聞こう！',streak:'連続正解',correctCount:'正解',passed:'パス',tiltEnabled:'傾き操作を有効化。端末を水平に戻してから傾けてください。',tiltUnavailable:'傾き操作は利用できません。画面のボタンで遊べます。',tiltDenied:'傾き操作の許可がありません。画面のボタンで遊べます。',noContent:'問題の読み込みに失敗しました。',teamTurn:'次のチームへ',pairTurn:'もう1ラウンド',tapHint:'タップまたは ← / → で操作'},
    en: {back:'Photo Party',language:'Language',hero:'Charades in eight languages!',tagline:'See it. Act it. Guess it. Play in pairs or teams!',choose:'Choose a category',settings:'Game settings',roundLength:'Round length',playStyle:'How to play',acting:'Act it out (classic)',forehead:'Phone on forehead (clues)',players:'Play with',pair:'Pairs / cooperative',teams:'Two teams',teamA:'Team A',teamB:'Team B',start:'▶ START GAME',how:'Tap right for correct and left to pass, or use ← / →.',time:'Time left',score:'Score',pass:'PASS',correct:'CORRECT!',finish:'End round',roundComplete:'Round complete!',next:'Next round',newGame:'Back to setup',tilt:'Enable tilt control',all:'Mix all categories',words:'prompts',actingHint:'Read the prompt and act it out!',foreheadHint:'Hold the phone up and listen to clues!',streak:'Streak',correctCount:'Correct',passed:'Passes',tiltEnabled:'Tilt enabled. Return to level between tilts.',tiltUnavailable:'Motion controls unavailable. Use the buttons.',tiltDenied:'Motion permission denied. Use the buttons.',noContent:'Could not load the prompt catalog.',teamTurn:'Next team',pairTurn:'Play again',tapHint:'Tap or use ← / →'},
    es: {back:'Fotos',language:'Idioma',hero:'¡Mímica en ocho idiomas!',tagline:'Mira, representa y adivina. ¡En parejas o equipos!',choose:'Elige una categoría',settings:'Ajustes',roundLength:'Duración',playStyle:'Cómo jugar',acting:'Hacer mímica',forehead:'Teléfono en la frente',players:'Participantes',pair:'Parejas / cooperativo',teams:'Dos equipos',teamA:'Equipo A',teamB:'Equipo B',start:'▶ EMPEZAR',how:'Derecha para acertar, izquierda para pasar. También ← / →.',time:'Tiempo',score:'Puntos',pass:'PASAR',correct:'¡BIEN!',finish:'Terminar ronda',roundComplete:'¡Fin de ronda!',next:'Siguiente ronda',newGame:'Configuración',tilt:'Activar inclinación',all:'Mezclar todas',words:'palabras',actingHint:'¡Representa la palabra!',foreheadHint:'¡Escucha las pistas de tus amigos!',streak:'Racha',correctCount:'Aciertos',passed:'Pasadas',tiltEnabled:'Inclinación activada. Vuelve al centro.',tiltUnavailable:'Usa los botones.',tiltDenied:'Permiso denegado. Usa los botones.',noContent:'No se pudieron cargar las palabras.',teamTurn:'Siguiente equipo',pairTurn:'Otra ronda',tapHint:'Toca o usa ← / →'},
    pt: {back:'Fotos',language:'Idioma',hero:'Mímica em oito idiomas!',tagline:'Veja, represente e adivinhe. Em duplas ou equipes!',choose:'Escolha uma categoria',settings:'Configurações',roundLength:'Duração da rodada',playStyle:'Como jogar',acting:'Mímica clássica',forehead:'Celular na testa',players:'Jogadores',pair:'Duplas / cooperativo',teams:'Duas equipes',teamA:'Equipe A',teamB:'Equipe B',start:'▶ COMEÇAR',how:'Direita para acertar, esquerda para passar. Ou ← / →.',time:'Tempo',score:'Pontos',pass:'PULAR',correct:'ACERTOU!',finish:'Encerrar rodada',roundComplete:'Rodada concluída!',next:'Próxima rodada',newGame:'Configurações',tilt:'Ativar inclinação',all:'Misturar tudo',words:'palavras',actingHint:'Faça mímica do desafio!',foreheadHint:'Ouça as dicas dos colegas!',streak:'Sequência',correctCount:'Acertos',passed:'Puladas',tiltEnabled:'Inclinação ativada. Volte ao centro.',tiltUnavailable:'Use os botões.',tiltDenied:'Sem permissão. Use os botões.',noContent:'Não foi possível carregar as palavras.',teamTurn:'Próxima equipe',pairTurn:'Jogar de novo',tapHint:'Toque ou use ← / →'},
    fr: {back:'Photos',language:'Langue',hero:'Mime en huit langues !',tagline:'Regardez, mimez et devinez, en duo ou en équipe !',choose:'Choisissez une catégorie',settings:'Paramètres',roundLength:'Durée de la manche',playStyle:'Comment jouer',acting:'Mime classique',forehead:'Téléphone sur le front',players:'Joueurs',pair:'Duo / coopératif',teams:'Deux équipes',teamA:'Équipe A',teamB:'Équipe B',start:'▶ COMMENCER',how:'Droite pour réussir, gauche pour passer. Ou ← / →.',time:'Temps',score:'Points',pass:'PASSER',correct:'BRAVO !',finish:'Terminer',roundComplete:'Manche terminée !',next:'Manche suivante',newGame:'Paramètres',tilt:'Activer inclinaison',all:'Mélanger tout',words:'mots',actingHint:'Mimez le mot !',foreheadHint:'Écoutez les indices de vos amis !',streak:'Série',correctCount:'Réussites',passed:'Passés',tiltEnabled:'Inclinaison activée. Revenez au centre.',tiltUnavailable:'Utilisez les boutons.',tiltDenied:'Permission refusée. Utilisez les boutons.',noContent:'Impossible de charger les mots.',teamTurn:'Équipe suivante',pairTurn:'Rejouer',tapHint:'Toucher ou ← / →'},
    de: {back:'Fotos',language:'Sprache',hero:'Scharade in acht Sprachen!',tagline:'Sehen, darstellen, raten – zu zweit oder im Team!',choose:'Kategorie wählen',settings:'Einstellungen',roundLength:'Rundenzeit',playStyle:'Spielweise',acting:'Pantomime',forehead:'Handy an die Stirn',players:'Spieler',pair:'Paare / gemeinsam',teams:'Zwei Teams',teamA:'Team A',teamB:'Team B',start:'▶ STARTEN',how:'Rechts für richtig, links zum Überspringen. Oder ← / →.',time:'Zeit',score:'Punkte',pass:'WEITER',correct:'RICHTIG!',finish:'Runde beenden',roundComplete:'Runde beendet!',next:'Nächste Runde',newGame:'Einstellungen',tilt:'Neigung aktivieren',all:'Alle Kategorien mischen',words:'Begriffe',actingHint:'Stelle den Begriff pantomimisch dar!',foreheadHint:'Höre auf die Hinweise!',streak:'Serie',correctCount:'Richtig',passed:'Übersprungen',tiltEnabled:'Neigung aktiv. Zur Mitte zurückkehren.',tiltUnavailable:'Bitte Tasten verwenden.',tiltDenied:'Kein Zugriff. Bitte Tasten verwenden.',noContent:'Die Begriffe konnten nicht geladen werden.',teamTurn:'Nächstes Team',pairTurn:'Nochmal spielen',tapHint:'Tippen oder ← / →'},
    ko: {back:'사진 게임',language:'언어',hero:'8개 언어로 즐기는 몸짓 퀴즈!',tagline:'보고, 표현하고, 맞혀 보세요! 짝이나 팀으로 즐길 수 있어요.',choose:'카테고리 선택',settings:'게임 설정',roundLength:'라운드 시간',playStyle:'플레이 방법',acting:'몸짓으로 설명하기',forehead:'이마에 휴대폰 대기',players:'참여 방법',pair:'짝 / 협동',teams:'두 팀 대결',teamA:'팀 A',teamB:'팀 B',start:'▶ 게임 시작',how:'정답은 오른쪽, 패스는 왼쪽. ← / → 키도 가능',time:'남은 시간',score:'점수',pass:'패스',correct:'정답!',finish:'라운드 종료',roundComplete:'라운드 완료!',next:'다음 라운드',newGame:'설정으로',tilt:'기울이기 사용',all:'전체 카테고리 섞기',words:'문제',actingHint:'몸짓으로 표현해 보세요!',foreheadHint:'친구들의 힌트를 들어 보세요!',streak:'연속 정답',correctCount:'정답',passed:'패스',tiltEnabled:'기울이기 준비 완료. 중앙으로 되돌려 주세요.',tiltUnavailable:'버튼을 사용하세요.',tiltDenied:'권한이 없습니다. 버튼을 사용하세요.',noContent:'문제를 불러오지 못했습니다.',teamTurn:'다음 팀',pairTurn:'다시 하기',tapHint:'터치 또는 ← / →'},
    zh: {back:'照片游戏',language:'语言',hero:'用八种语言玩猜词游戏！',tagline:'看一看，演一演，猜一猜！双人和团队都能玩。',choose:'选择类别',settings:'游戏设置',roundLength:'每轮时长',playStyle:'玩法',acting:'动作表演',forehead:'手机放在额头',players:'参与方式',pair:'双人 / 合作',teams:'双队对抗',teamA:'A队',teamB:'B队',start:'▶ 开始游戏',how:'答对点右侧，跳过点左侧，也可按 ← / →。',time:'剩余时间',score:'得分',pass:'跳过',correct:'答对了！',finish:'结束本轮',roundComplete:'本轮结束！',next:'下一轮',newGame:'返回设置',tilt:'启用倾斜操作',all:'混合全部类别',words:'道题',actingHint:'用动作表演这个词！',foreheadHint:'听同伴的提示来猜！',streak:'连续答对',correctCount:'答对',passed:'跳过',tiltEnabled:'倾斜操作已开启，请回到水平位置。',tiltUnavailable:'请使用屏幕按钮。',tiltDenied:'无权限，请使用屏幕按钮。',noContent:'无法加载题目。',teamTurn:'下一队',pairTurn:'再玩一次',tapHint:'点击或按 ← / →'}
  };
  const CAT_LABELS = {
    animals:['Animales','Animais','Animaux','Tiere','동물','动物'],food:['Comida','Comida','Nourriture','Essen','음식','食物'],
    jobs:['Profesiones','Profissões','Métiers','Berufe','직업','职业'],sports:['Deportes','Esportes','Sports','Sport','스포츠','运动'],
    actions:['Acciones','Ações','Actions','Aktionen','동작','动作'],emotions:['Emociones','Emoções','Émotions','Gefühle','감정','情绪'],
    objects:['Objetos','Objetos','Objets','Gegenstände','물건','物品'],school:['Escuela','Escola','École','Schule','학교','学校'],
    transport:['Transporte','Transporte','Transports','Verkehr','교통','交通'],travel:['Viajes','Viagens','Voyages','Reisen','여행','旅行'],
    weather:['Clima','Clima','Météo','Wetter','날씨','天气'],nature:['Naturaleza','Natureza','Nature','Natur','자연','自然'],
    music:['Música','Música','Musique','Musik','음악','音乐'],movies:['Personajes de cine','Cinema','Cinéma','Filmfiguren','영화 인물','电影人物'],
    technology:['Tecnología','Tecnologia','Technologie','Technik','기술','科技'],science:['Ciencia','Ciência','Science','Wissenschaft','과학','科学'],
    space:['Espacio','Espaço','Espace','Weltraum','우주','太空'],fantasy:['Fantasía','Fantasia','Fantaisie','Fantasie','판타지','奇幻'],
    holidays:['Celebraciones','Festas','Fêtes','Feste','축하','庆祝'],clothes:['Ropa','Roupas','Vêtements','Kleidung','옷','服装'],
    hobbies:['Pasatiempos','Passatempos','Loisirs','Hobbys','취미','爱好'],places:['Lugares','Lugares','Lieux','Orte','장소','地点'],
    body:['Cuerpo','Corpo','Corps','Körper','몸','身体'],daily:['Vida diaria','Dia a dia','Quotidien','Alltag','일상','日常'],
    funny:['Actuación divertida','Mímica engraçada','Mime drôle','Lustige Pantomime','재미있는 연기','搞笑表演'],
    history:['Historia','História','Histoire','Geschichte','역사','历史'],games:['Juegos','Jogos','Jeux','Spiele','게임','游戏'],
    home:['Hogar','Casa','Maison','Zuhause','집','家'],fruits:['Frutas y verduras','Frutas e legumes','Fruits et légumes','Obst und Gemüse','과일과 채소','水果蔬菜'],
    community:['Comunidad','Comunidade','Communauté','Gemeinschaft','지역 사회','社区'],
    culture:['Culturas del mundo','Culturas do mundo','Cultures du monde','Weltkulturen','세계 문화','世界文化'],
    sea:['Vida marina','Vida marinha','Vie marine','Meeresleben','바다 생물','海洋生物'],
    birds:['Aves','Aves','Oiseaux','Vögel','새','鸟类'],
    insects:['Insectos','Insetos','Insectes','Insekten','곤충','昆虫'],
    farm_actions:['En la granja','Na fazenda','À la ferme','Auf dem Bauernhof','농장 활동','农场活动'],
    wildlife:['Animales salvajes','Animais selvagens','Animaux sauvages','Wildtiere','야생 동물','野生动物'],
    desserts:['Postres','Sobremesas','Desserts','Nachspeisen','디저트','甜点'],
    drinks:['Bebidas','Bebidas','Boissons','Getränke','음료','饮品'],
    breakfast:['Desayuno','Café da manhã','Petit-déjeuner','Frühstück','아침 식사','早餐'],
    japanese_food:['Comida japonesa','Comida japonesa','Cuisine japonaise','Japanisches Essen','일본 음식','日本料理'],
    school_subjects:['Asignaturas','Matérias escolares','Matières scolaires','Schulfächer','학교 과목','学校科目'],
    school_events:['Eventos escolares','Eventos escolares','Événements scolaires','Schulveranstaltungen','학교 행사','学校活动'],
    classroom_actions:['Acciones de clase','Ações da sala','Actions en classe','Aktionen im Unterricht','교실 활동','课堂动作'],
    sports_moves:['Movimientos deportivos','Movimentos esportivos','Gestes sportifs','Sportbewegungen','스포츠 동작','体育动作'],
    fitness_moves:['Ejercicios','Exercícios','Exercices','Fitnessübungen','운동 동작','健身动作'],
    outdoor_fun:['Al aire libre','Ao ar livre','Plein air','Draußen','야외 활동','户外活动'],
    camping_actions:['Acampada','Acampamento','Camping','Camping','캠핑','露营'],
    playground:['Parque infantil','Brincadeiras no parque','Aire de jeux','Spielplatz','놀이터','游乐场'],
    household_chores:['Tareas domésticas','Tarefas domésticas','Tâches ménagères','Hausarbeit','집안일','家务'],
    cooking_actions:['Cocinando','Ações na cozinha','Gestes en cuisine','Kochen','요리 동작','做饭动作'],
    shopping_actions:['De compras','Compras','Courses','Einkaufen','쇼핑 상황','购物动作'],
    restaurant_actions:['En el restaurante','No restaurante','Au restaurant','Im Restaurant','식당에서','餐厅场景'],
    airport_actions:['En el aeropuerto','No aeroporto',"À l'aéroport",'Am Flughafen','공항에서','机场场景'],
    hotel_actions:['En el hotel','No hotel',"À l'hôtel",'Im Hotel','호텔에서','酒店场景'],
    travel_problems:['Problemas de viaje','Imprevistos de viagem','Pépins de voyage','Reisepannen','여행 실수','旅行意外'],
    city_adventures:['En la ciudad','Na cidade','En ville','In der Stadt','도시 활동','城市活动'],
    eco_actions:['Acciones ecológicas','Ações ecológicas','Gestes écologiques','Umweltaktionen','친환경 행동','环保行动'],
    healthy_habits:['Hábitos saludables','Hábitos saudáveis','Bonnes habitudes','Gesunde Gewohnheiten','건강 습관','健康习惯'],
    digital_actions:['Vida digital','Vida digital','Vie numérique','Digitaler Alltag','디지털 생활','数字生活'],
    social_situations:['Situaciones sociales','Situações sociais','Interactions sociales','Soziale Situationen','사교 상황','社交场景'],
    art_actions:['Taller de arte','Ateliê de arte',"Atelier d'art",'Kunstwerkstatt','미술 활동','艺术活动'],
    magic_actions:['Trucos de magia','Truques de mágica','Tours de magie','Zaubertricks','마술','魔术表演'],
    superhero_actions:['Acciones de superhéroes','Ações de super-heróis','Actions de super-héros','Superheldenaktionen','슈퍼히어로 동작','超级英雄动作'],
    comedy_situations:['Escenas divertidas','Cenas engraçadas','Scènes comiques','Lustige Szenen','코미디 상황','搞笑场景']

  };
  const EXTRA_LANGS = ['es','pt','fr','de','ko','zh'];
  const SEARCH_PLACEHOLDERS = {
    ja:'🔎 カテゴリーを検索…', en:'🔎 Search categories…', es:'🔎 Buscar categorías…',
    pt:'🔎 Buscar categorias…', fr:'🔎 Rechercher une catégorie…',
    de:'🔎 Kategorien suchen…', ko:'🔎 카테고리 검색…', zh:'🔎 搜索类别…'
  };
  const MOBILE_LABELS = {
    ja:{readyTitle:'準備はいい？',readyMessage:'端末を持つ人を確認して、準備ができたらスタート！',readyActing:'演技する人だけがお題を見て、ほかの人には見せないでください。',readyForehead:'答える人は画面を見ず、額に端末を当てます。周りの人がヒントを出します。',begin:'▶ お題スタート！',readyNote:'タイマーはこのボタンを押してから始まります。',pause:'⏸ 一時停止',resume:'▶ 再開する',pausedMessage:'一時停止中 · お題は非表示です'},
    en:{readyTitle:'Ready to play?',readyMessage:'Make sure everyone is in position.',readyActing:'Only the actor should see the prompt. Others look away.',readyForehead:'The guesser faces away from the screen, with the device on their forehead. Others give clues.',begin:'▶ START ROUND',readyNote:'The clock starts only when you tap Start.',pause:'⏸ Pause',resume:'▶ Resume',pausedMessage:'Paused · Prompt hidden'},
    es:{readyTitle:'¿Preparados?',readyMessage:'Prepara a los jugadores.',readyActing:'Solo quien actúa mira la palabra.',readyForehead:'Quien adivina no mira la pantalla. Los demás dan pistas.',begin:'▶ EMPEZAR',readyNote:'El reloj comienza al pulsar.',pause:'⏸ Pausa',resume:'▶ Continuar',pausedMessage:'En pausa · Palabra oculta'},
    pt:{readyTitle:'Tudo pronto?',readyMessage:'Prepare os jogadores.',readyActing:'Só quem faz mímica vê a palavra.',readyForehead:'Quem adivinha não olha a tela. Os colegas dão dicas.',begin:'▶ COMEÇAR',readyNote:'O relógio começa ao tocar.',pause:'⏸ Pausar',resume:'▶ Continuar',pausedMessage:'Pausado · Palavra oculta'},
    fr:{readyTitle:'Prêts à jouer ?',readyMessage:'Préparez les joueurs.',readyActing:'Seule la personne qui mime voit le mot.',readyForehead:'La personne qui devine ne regarde pas l’écran. Les autres donnent des indices.',begin:'▶ COMMENCER',readyNote:'Le temps commence au toucher.',pause:'⏸ Pause',resume:'▶ Reprendre',pausedMessage:'Pause · Mot masqué'},
    de:{readyTitle:'Bereit?',readyMessage:'Alle bereit machen.',readyActing:'Nur die darstellende Person sieht den Begriff.',readyForehead:'Die ratende Person schaut nicht auf den Bildschirm. Andere geben Hinweise.',begin:'▶ STARTEN',readyNote:'Die Zeit beginnt erst beim Tippen.',pause:'⏸ Pause',resume:'▶ Weiter',pausedMessage:'Pause · Begriff verborgen'},
    ko:{readyTitle:'준비됐나요?',readyMessage:'모두 준비해 주세요.',readyActing:'표현하는 사람만 문제를 봅니다.',readyForehead:'맞히는 사람은 화면을 보지 않고 이마에 기기를 댑니다. 다른 사람들이 힌트를 줍니다.',begin:'▶ 라운드 시작',readyNote:'시작 버튼을 누르면 시간이 흐릅니다.',pause:'⏸ 일시정지',resume:'▶ 계속하기',pausedMessage:'일시정지 · 문제가 숨겨졌습니다'},
    zh:{readyTitle:'准备好了吗？',readyMessage:'请做好准备。',readyActing:'只有表演者看题目，其他人不要看。',readyForehead:'猜题者不看屏幕，把设备放在额头。其他人提供提示。',begin:'▶ 开始本轮',readyNote:'点击开始后才开始计时。',pause:'⏸ 暂停',resume:'▶ 继续',pausedMessage:'已暂停 · 题目已隐藏'}
  };
  const state = {
    language: 'en', deck: 'all', stage: 'setup', playStyle: 'acting', mode: 'pair',
    duration: 60, teams: ['TEAM A','TEAM B'], scores: [0, 0], turn: 0, correct: 0, passed: 0,
    streak: 0, maxStreak: 0, shown: 0, current: null, remainingWords: [],
    remainingMs: 60000, lastTick: 0, interval: null, paused: false, wakeLock: null, tiltActive: false,
    tiltBaseline: null, tiltNeutral: true, lastTiltAt: 0
  };
  const t = key => (MOBILE_LABELS[state.language] || MOBILE_LABELS.en)[key] || (UI[state.language] || UI.en)[key] || UI.en[key] || key;
  function categoryLabel(deck) {
    if (state.language === 'ja' || state.language === 'en') return deck.names[state.language];
    const index = EXTRA_LANGS.indexOf(state.language);
    return CAT_LABELS[deck.id]?.[index] || deck.names.en;
  }
  function localize() {
    document.documentElement.lang = state.language;
    $('deckSearch').placeholder = SEARCH_PLACEHOLDERS[state.language];
    $('deckSearch').setAttribute('aria-label', SEARCH_PLACEHOLDERS[state.language]);
    document.querySelectorAll('[data-i18n]').forEach(node => {
      node.textContent = t(node.dataset.i18n);
    });
    renderDecks();
  }
  function renderDecks() {
    const target = $('decks');
    const previousScroll = target.scrollTop;
    const search = $('deckSearch').value.trim().toLocaleLowerCase();
    target.replaceChildren();
    const all = { id: 'all', emoji: '🎲', names: { en: 'All categories', ja: 'すべて' }, words: CORE.availableWords(DATA, 'all', state.language) };
    for (const item of [all, ...DATA.decks]) {
      const searchable = [item.id, item.names.en, item.names.ja,
        item.id === 'all' ? t('all') : categoryLabel(item)
      ].join(' ').toLocaleLowerCase();
      if (search && !searchable.includes(search)) continue;
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'deck' + (state.deck === item.id ? ' selected' : '');
      button.setAttribute('aria-pressed', String(state.deck === item.id));
      const emoji = document.createElement('span');
      emoji.className = 'deck-emoji'; emoji.textContent = item.emoji;
      const name = document.createElement('span');
      name.className = 'deck-name'; name.textContent = item.id === 'all' ? t('all') : categoryLabel(item);
      const count = document.createElement('span');
      count.className = 'deck-count'; count.textContent = item.words.length + ' ' + t('words');
      button.append(emoji, name, count);
      button.addEventListener('click', () => {
        state.deck = item.id;
        renderDecks();
      });
      target.append(button);
    }
    target.scrollTop = previousScroll;
    $('deckCount').textContent = DATA.decks.length + ' categories · ' + DATA.decks.reduce((sum, item) => sum + item.words.length, 0) + ' prompts';
  }
  function show(stage) {
    state.stage = stage;
    for (const name of ['setup','ready','play','result']) $(name).hidden = name !== stage;
    $('language').disabled = stage !== 'setup';
  }
  function updatePlayerInputs() {
    $('teamNames').hidden = document.querySelector('input[name="players"]:checked').value !== 'teams';
  }
  function stopTimer() {
    if (state.interval) clearInterval(state.interval);
    state.interval = null;
  }
  async function requestWakeLock() {
    if (typeof navigator === 'undefined' || !navigator.wakeLock || state.stage !== 'play' || state.paused || state.wakeLock) return;
    try {
      const sentinel = await navigator.wakeLock.request('screen');
      if (state.stage !== 'play' || state.paused || document.hidden) {
        await sentinel.release();
      } else {
        state.wakeLock = sentinel;
        sentinel.addEventListener('release', () => {
          if (state.wakeLock === sentinel) state.wakeLock = null;
        });
      }
    } catch {
      // Unsupported/denied wake locks must never interrupt play.
    }
  }
  function releaseWakeLock() {
    const sentinel = state.wakeLock;
    state.wakeLock = null;
    if (sentinel) Promise.resolve(sentinel.release()).catch(() => {});
  }
  function setPaused(paused) {
    if (state.stage !== 'play' || state.paused === paused) return;
    state.paused = paused;
    state.lastTick = performance.now();
    $('pauseShield').hidden = !paused;
    $('prompt').hidden = paused;
    $('hint').hidden = paused;
    $('pauseResume').textContent = t(paused ? 'resume' : 'pause');
    $('pauseResume').setAttribute('aria-pressed', String(paused));
    $('pass').disabled = paused;
    $('correct').disabled = paused;
    if (paused) releaseWakeLock();
    else requestWakeLock();
  }
  function beginRound() {
    if (state.stage !== 'ready') return;
    // Fullscreen can only be requested directly from a user gesture where supported.
    if (!document.fullscreenElement && document.documentElement?.requestFullscreen) {
      try { Promise.resolve(document.documentElement.requestFullscreen()).catch(() => {}); } catch { /* iOS Safari may not support Fullscreen API */ }
    }
    show('play');
    state.paused = false;
    $('pauseShield').hidden = true;
    $('prompt').hidden = false;
    $('hint').hidden = false;
    $('pauseResume').textContent = t('pause');
    $('pauseResume').setAttribute('aria-pressed', 'false');
    $('pass').disabled = false;
    $('correct').disabled = false;
    showNext();
    state.lastTick = performance.now();
    state.interval = window.setInterval(tick, 100);
    renderTimer();
    requestWakeLock();
  }
  function newSession() {
    stopTimer();
    state.language = $('language').value;
    state.mode = document.querySelector('input[name="players"]:checked').value;
    state.playStyle = document.querySelector('input[name="style"]:checked').value;
    state.duration = Number($('duration').value);
    state.teams = [String($('teamA').value).trim().slice(0, 24) || 'TEAM A', String($('teamB').value).trim().slice(0, 24) || 'TEAM B'];
    state.scores = [0, 0];
    state.turn = 0;
    state.tiltActive = false;
    startRound();
  }
  function startRound() {
    stopTimer();
    state.correct = 0; state.passed = 0; state.streak = 0; state.maxStreak = 0; state.shown = 0;
    state.paused = false;
    releaseWakeLock();
    state.remainingMs = state.duration * 1000;
    $('playLanguage').textContent = state.language === 'ja' ? 'English' : '日本語';
    $('playLanguage').setAttribute('aria-label', state.language === 'ja' ? 'Switch prompt language to English' : 'Switch prompt language to Japanese');
    state.remainingWords = CORE.shuffle(CORE.availableWords(DATA, state.deck, state.language));
    if (!state.remainingWords.length) {
      window.alert(t('noContent'));
      show('setup');
      return;
    }
    state.current = null; state.tiltNeutral = true; state.tiltBaseline = null;
    $('tiltEnable').hidden = state.playStyle !== 'forehead' || state.tiltActive;
    $('tiltFeedback').textContent = '';
    $('activeTeam').textContent = state.mode === 'teams' ? state.teams[state.turn] : 'PAIR / GROUP';
    $('categoryName').textContent = state.deck === 'all' ? t('all') : categoryLabel(DATA.decks.find(deck => deck.id === state.deck));
    $('playInstruction').textContent = state.playStyle === 'acting' ? t('actingHint') : t('foreheadHint');
    $('hint').textContent = t('tapHint');
    $('readyTeam').textContent = state.mode === 'teams' ? state.teams[state.turn] : 'PAIR / GROUP';
    $('readyInstruction').textContent = t(state.playStyle === 'acting' ? 'readyActing' : 'readyForehead');
    $('pauseShield').hidden = true;
    renderTimer();
    show('ready');
  }
  function showNext() {
    if (state.stage !== 'play') return;
    // Only recycle the same deck when a very fast team completes every card.
    if (!state.remainingWords.length) {
      state.remainingWords = CORE.shuffle(CORE.availableWords(DATA, state.deck, state.language));
    }
    state.current = state.remainingWords.pop();
    state.shown++;
    $('questionNo').textContent = '#' + state.shown;
    renderPrompt();
    $('score').textContent = state.correct;
    $('streak').textContent = state.streak > 1 ? '🔥 ' + state.streak + ' ' + t('streak') : '';
  }
  function renderPrompt() {
    if (!state.current) return;
    const prompt = $('prompt');
    const length = Array.from(state.current.text).length;
    prompt.textContent = state.current.text;
    prompt.lang = state.language;
    prompt.classList.remove('long-prompt', 'very-long-prompt');
    if (length > 32) prompt.classList.add('very-long-prompt');
    else if (length > 18) prompt.classList.add('long-prompt');
  }
  function switchPlayLanguage() {
    if (state.stage !== 'play') return;
    const oldLanguage = state.language;
    const newLanguage = oldLanguage === 'ja' ? 'en' : 'ja';
    // Build a single translation index instead of searching up to 200 items
    // for each of the 12,800 prompts when 'All categories' is selected.
    const byDeck = new Map(DATA.decks.map(deck => [
      deck.id, new Map(deck.words.map(word => [word[oldLanguage], word[newLanguage]]))
    ]));
    const translate = item => !item ? item : ({
      text: byDeck.get(item.deckId)?.get(item.text) || item.text,
      deckId: item.deckId
    });
    state.current = translate(state.current);
    state.remainingWords = state.remainingWords.map(translate);
    state.language = newLanguage;
    $('language').value = newLanguage;
    localize();
    $('categoryName').textContent = state.deck === 'all' ? t('all') : categoryLabel(DATA.decks.find(deck => deck.id === state.deck));
    $('playInstruction').textContent = state.playStyle === 'acting' ? t('actingHint') : t('foreheadHint');
    $('hint').textContent = t('tapHint');
    $('pauseResume').textContent = t(state.paused ? 'resume' : 'pause');
    $('playLanguage').textContent = newLanguage === 'ja' ? 'English' : '日本語';
    $('playLanguage').setAttribute('aria-label', newLanguage === 'ja' ? 'Switch prompt language to English' : 'Switch prompt language to Japanese');
    renderPrompt();
  }
  function answer(isCorrect) {
    if (state.stage !== 'play' || !state.current || state.paused) return;
    tick();
    if (state.stage !== 'play') return;
    if (isCorrect) {
      state.correct++;
      state.streak++;
      state.maxStreak = Math.max(state.maxStreak, state.streak);
      state.scores[state.turn]++;
    } else {
      state.passed++;
      state.streak = 0;
    }
    showNext();
  }
  function renderTimer() {
    $('timeLeft').textContent = String(Math.ceil(state.remainingMs / 1000));
    $('timeBar').style.width = Math.max(0, state.remainingMs / (state.duration * 1000) * 100) + '%';
  }
  function tick() {
    if (state.stage !== 'play') return;
    const now = performance.now();
    const elapsed = Math.max(0, now - state.lastTick);
    state.lastTick = now;
    if (!document.hidden && !state.paused) state.remainingMs = Math.max(0, state.remainingMs - elapsed);
    renderTimer();
    if (state.remainingMs === 0) finishRound();
  }
  function finishRound() {
    if (state.stage !== 'play') return;
    stopTimer();
    releaseWakeLock();
    state.tiltActive = false;
    show('result');
    $('resultTeam').textContent = state.mode === 'teams' ? state.teams[state.turn] : 'PAIR / GROUP';
    $('roundScore').textContent = '+' + state.correct;
    $('roundStats').textContent = t('correctCount') + ': ' + state.correct + ' · ' + t('passed') + ': ' + state.passed + ' · ' + t('streak') + ': ' + state.maxStreak;
    const board = $('leaderboard');
    board.replaceChildren();
    if (state.mode === 'teams') {
      state.teams.forEach((team, index) => {
        const row = document.createElement('div');
        row.className = 'team-score';
        const label = document.createElement('span'); label.textContent = team;
        const score = document.createElement('strong'); score.textContent = state.scores[index] + ' pts';
        row.append(label, score);
        board.append(row);
      });
    }
    $('nextRound').textContent = state.mode === 'teams' ? t('teamTurn') : t('pairTurn');
  }
  function nextRound() {
    if (state.mode === 'teams') state.turn = (state.turn + 1) % 2;
    startRound();
  }
  async function enableTilt() {
    if (state.stage !== 'play') return;
    if (typeof DeviceOrientationEvent === 'undefined') {
      $('tiltFeedback').textContent = t('tiltUnavailable'); return;
    }
    try {
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        const result = await DeviceOrientationEvent.requestPermission();
        if (result !== 'granted') {
          $('tiltFeedback').textContent = t('tiltDenied'); return;
        }
      }
      state.tiltActive = true; state.tiltBaseline = null; state.tiltNeutral = true;
      $('tiltEnable').hidden = true;
      $('tiltFeedback').textContent = t('tiltEnabled');
    } catch {
      $('tiltFeedback').textContent = t('tiltUnavailable');
    }
  }
  function normalizeDelta(angle, baseline) {
    return ((angle - baseline + 540) % 360) - 180;
  }
  function handleOrientation(event) {
    if (!state.tiltActive || state.stage !== 'play' || state.paused || document.hidden ||
        typeof event.beta !== 'number' || typeof event.gamma !== 'number') return;
    if (!state.tiltBaseline) {
      state.tiltBaseline = { beta: event.beta, gamma: event.gamma };
      return;
    }
    const beta = normalizeDelta(event.beta, state.tiltBaseline.beta);
    const gamma = normalizeDelta(event.gamma, state.tiltBaseline.gamma);
    const motion = Math.abs(beta) >= Math.abs(gamma) ? beta : gamma;
    if (Math.abs(motion) < 13) { state.tiltNeutral = true; return; }
    if (Math.abs(motion) < 30 || !state.tiltNeutral || performance.now() - state.lastTiltAt < 850) return;
    state.tiltNeutral = false; state.lastTiltAt = performance.now();
    answer(motion > 0);
  }
  if (!DATA || !CORE || !CORE.validateCatalog(DATA)) {
    $('setup').replaceChildren(document.createTextNode('Could not load the charades catalog.'));
    return;
  }
  $('deckSearch').addEventListener('input', () => {
    $('decks').scrollTop = 0;
    renderDecks();
  });
  $('language').addEventListener('change', event => {
    state.language = event.target.value;
    localize();
  });
  document.querySelectorAll('input[name="players"]').forEach(input => input.addEventListener('change', updatePlayerInputs));
  $('start').addEventListener('click', newSession);
  $('mobileStart').addEventListener('click', newSession);
  $('beginRound').addEventListener('click', beginRound);
  $('pauseResume').addEventListener('click', () => setPaused(!state.paused));
  $('playLanguage').addEventListener('click', switchPlayLanguage);
  $('correct').addEventListener('click', () => answer(true));
  $('pass').addEventListener('click', () => answer(false));
  $('endRound').addEventListener('click', finishRound);
  $('nextRound').addEventListener('click', nextRound);
  $('newGame').addEventListener('click', () => {
    stopTimer(); releaseWakeLock(); state.tiltActive = false;
    if (document.fullscreenElement && document.exitFullscreen) {
      Promise.resolve(document.exitFullscreen()).catch(() => {});
    }
    show('setup');
  });
  $('tiltEnable').addEventListener('click', enableTilt);
  window.addEventListener('deviceorientation', handleOrientation);
  document.addEventListener('keydown', event => {
    if (state.stage !== 'play' || event.repeat || ['INPUT','SELECT','TEXTAREA'].includes(document.activeElement?.tagName)) return;
    if (event.key === 'ArrowRight') { event.preventDefault(); answer(true); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); answer(false); }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (state.stage === 'play') setPaused(true);
      releaseWakeLock();
    }
    state.lastTick = performance.now();
  });
  window.addEventListener('pagehide', () => {
    stopTimer();
    releaseWakeLock();
  });
  localize();
})();
