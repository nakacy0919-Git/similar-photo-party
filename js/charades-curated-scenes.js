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
    const sourceDecks=new Map(decks.map(deck=>[deck.id,deck.words.map(word=>({...word}))]));
    for(const deck of decks){
      if(!matched.has(deck.id))throw new Error('Unmapped category '+deck.id);
      if(deck.words.length!==12)throw new Error('Expected 12 curated original items in '+deck.id);
      const familyId=Object.keys(ASSIGNMENTS).find(id=>ASSIGNMENTS[id].includes(deck.id));
      const original=curatedBasePool(deck,sourceDecks);
      const generated=[];
      for(let sceneIndex=0;sceneIndex<16;sceneIndex++){
        const templates=FAMILIES[familyId][sceneIndex];
        for(const word of original){
          const card=Object.fromEntries(LANGUAGES.map(lang=>[lang,apply(templates[lang],word[lang])]));
          generated.push(card);
        }
      }
      // Target 200 tasks: original standalone concepts from closely related
      // decks, then meaningful category-aware scenes as needed.
      deck.words=original.concat(generated.slice(0,200-original.length)).slice(0,200);
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

family('fauna', `
The %s is sleeping|眠っている%s|%s está durmiendo|%s está dormindo|%s dort|%s schläft|잠자는 %s|正在睡觉的%s
The %s is searching for food|食べ物を探す%s|%s busca comida|%s procura comida|%s cherche de la nourriture|%s sucht Futter|먹이를 찾는 %s|正在寻找食物的%s
The %s is drinking water|水を飲む%s|%s bebe agua|%s bebe água|%s boit de l'eau|%s trinkt Wasser|물을 마시는 %s|正在喝水的%s
The %s is hiding from danger|危険から身を隠す%s|%s se esconde del peligro|%s se esconde do perigo|%s se cache du danger|%s versteckt sich vor Gefahr|위험을 피해 숨는 %s|正在躲避危险的%s
The %s is moving cautiously|慎重に動く%s|%s se mueve con cuidado|%s se move com cuidado|%s se déplace prudemment|%s bewegt sich vorsichtig|조심스럽게 움직이는 %s|小心翼翼移动的%s
The %s is startled by a loud noise|大きな音に驚く%s|%s se asusta por un ruido fuerte|%s se assusta com um barulho alto|%s sursaute à un grand bruit|%s erschrickt vor einem lauten Geräusch|큰 소리에 놀란 %s|被巨大声响吓到的%s
The %s is meeting another animal|ほかの動物と出会う%s|%s se encuentra con otro animal|%s encontra outro animal|%s rencontre un autre animal|%s begegnet einem anderen Tier|다른 동물을 만난 %s|遇见另一只动物的%s
The %s is cleaning itself|体をきれいにしている%s|%s se está limpiando|%s está se limpando|%s fait sa toilette|%s putzt sich|몸을 깨끗이 하는 %s|正在清洁身体的%s
The %s is looking for a safe place|安全な場所を探している%s|%s busca un lugar seguro|%s procura um lugar seguro|%s cherche un endroit sûr|%s sucht einen sicheren Ort|안전한 곳을 찾는 %s|正在寻找安全地方的%s
The %s is exploring unfamiliar surroundings|知らない場所を探検する%s|%s explora un lugar desconocido|%s explora um lugar desconhecido|%s explore un lieu inconnu|%s erkundet unbekanntes Gelände|낯선 곳을 탐험하는 %s|正在探索陌生环境的%s
The %s is following a friend|仲間の後をついていく%s|%s sigue a un amigo|%s segue um amigo|%s suit un ami|%s folgt einem Freund|친구를 따라가는 %s|跟着同伴走的%s
The %s is escaping a predator|天敵から逃げる%s|%s escapa de un depredador|%s foge de um predador|%s fuit un prédateur|%s flieht vor einem Raubtier|천적에게서 도망치는 %s|正在逃离天敌的%s
The %s is resting in the sunshine|日なたで休んでいる%s|%s descansa al sol|%s descansa ao sol|%s se repose au soleil|%s ruht sich in der Sonne aus|햇볕 아래 쉬는 %s|正在阳光下休息的%s
The %s is resting after a long journey|長い移動の後で休む%s|%s descansa después de un largo viaje|%s descansa depois de uma longa viagem|%s se repose après un long voyage|%s ruht sich nach einer langen Reise aus|긴 이동 후 쉬는 %s|长途跋涉后休息的%s
The %s is reacting to falling rain|雨が降ってきて驚く%s|%s reacciona a la lluvia|%s reage à chuva|%s réagit à la pluie|%s reagiert auf den Regen|비가 내려 반응하는 %s|对突然下雨作出反应的%s
The %s is watching another animal closely|別の動物をじっと見つめる%s|%s observa atentamente a otro animal|%s observa outro animal atentamente|%s observe attentivement un autre animal|%s beobachtet ein anderes Tier genau|다른 동물을 유심히 보는 %s|仔细观察另一只动物的%s
`);

family('food', `
Someone is tasting %s|誰かが%sを味見する|Alguien prueba %s|Alguém prova %s|Quelqu'un goûte %s|Jemand probiert %s|%s 맛보기|品尝%s
Someone is ordering %s|誰かが%sを注文する|Alguien pide %s|Alguém pede %s|Quelqu'un commande %s|Jemand bestellt %s|%s 주문하기|点一份%s
Someone is sharing %s with a friend|友達と%sを分け合う|Alguien comparte %s con un amigo|Alguém divide %s com um amigo|Quelqu'un partage %s avec un ami|Jemand teilt %s mit einem Freund|친구와 %s 나눠 먹기|和朋友分享%s
Someone is carefully serving %s|誰かが%sを丁寧に盛り付ける|Alguien sirve %s con cuidado|Alguém serve %s com cuidado|Quelqu'un sert %s avec soin|Jemand serviert %s vorsichtig|%s 정성껏 담아내기|小心地端上%s
Someone is choosing %s at a shop|店で%sを選んでいる|Alguien elige %s en una tienda|Alguém escolhe %s numa loja|Quelqu'un choisit %s au magasin|Jemand wählt %s im Laden aus|가게에서 %s 고르기|在商店挑选%s
Someone is trying %s for the first time|初めて%sを食べたり飲んだりする|Alguien prueba %s por primera vez|Alguém prova %s pela primeira vez|Quelqu'un découvre %s pour la première fois|Jemand probiert %s zum ersten Mal|처음으로 %s 맛보기|第一次尝试%s
Someone is taking a photo of %s|誰かが%sの写真を撮っている|Alguien fotografía %s|Alguém fotografa %s|Quelqu'un photographie %s|Jemand fotografiert %s|%s 사진 찍기|给%s拍照
Someone is buying %s for a picnic|ピクニック用に%sを買う|Alguien compra %s para un picnic|Alguém compra %s para um piquenique|Quelqu'un achète %s pour un pique-nique|Jemand kauft %s für ein Picknick|소풍용 %s 사기|为野餐购买%s
Someone is offering %s to a guest|お客さんに%sをすすめる|Alguien ofrece %s a un invitado|Alguém oferece %s a um convidado|Quelqu'un offre %s à un invité|Jemand bietet einem Gast %s an|손님에게 %s 권하기|给客人端上%s
Someone is describing the taste of %s|%sの味を説明する|Alguien describe el sabor de %s|Alguém descreve o sabor de %s|Quelqu'un décrit le goût de %s|Jemand beschreibt den Geschmack von %s|%s 맛 설명하기|描述%s的味道
Someone is enjoying %s at a celebration|お祝いの席で%sを楽しむ|Alguien disfruta de %s en una fiesta|Alguém saboreia %s numa festa|Quelqu'un savoure %s à une fête|Jemand genießt %s auf einer Feier|축하 자리에서 %s 즐기기|在庆祝会上享用%s
Someone is preparing %s for friends|友達のために%sを用意する|Alguien prepara %s para sus amigos|Alguém prepara %s para os amigos|Quelqu'un prépare %s pour ses amis|Jemand bereitet %s für Freunde zu|친구를 위해 %s 준비하기|为朋友准备%s
Someone is refusing to try %s|%sを食べるのを断っている|Alguien se niega a probar %s|Alguém se recusa a provar %s|Quelqu'un refuse de goûter %s|Jemand weigert sich %s zu probieren|%s 맛보기를 거절하기|拒绝品尝%s
Someone is carrying %s very carefully|%sを慎重に運んでいる|Alguien lleva %s con mucho cuidado|Alguém carrega %s com muito cuidado|Quelqu'un transporte %s avec soin|Jemand trägt %s sehr vorsichtig|%s 조심해서 나르기|小心搬运%s
Someone is smelling %s to guess what it is|匂いで%sを当てようとしている|Alguien huele %s para adivinar qué es|Alguém cheira %s para adivinhar o que é|Quelqu'un sent %s pour le reconnaître|Jemand riecht an %s um es zu erraten|냄새로 %s 맞히기|通过闻气味猜%s
Someone is putting %s into a lunchbox|お弁当に%sを詰める|Alguien pone %s en una fiambrera|Alguém coloca %s numa marmita|Quelqu'un met %s dans une boîte-repas|Jemand packt %s in eine Brotdose|도시락에 %s 담기|把%s装进饭盒
`);

family('persona', `
The %s is entering a mysterious room|不思議な部屋に入る%s|%s entra en una sala misteriosa|%s entra numa sala misteriosa|%s entre dans une pièce mystérieuse|%s betritt einen geheimnisvollen Raum|신비한 방에 들어가는 %s|走进神秘房间的%s
The %s is looking for a missing friend|いなくなった友達を探す%s|%s busca a un amigo desaparecido|%s procura um amigo desaparecido|%s cherche un ami disparu|%s sucht einen vermissten Freund|사라진 친구를 찾는 %s|寻找失踪朋友的%s
The %s is trying to keep a secret|秘密を守ろうとする%s|%s intenta guardar un secreto|%s tenta guardar um segredo|%s essaie de garder un secret|%s versucht ein Geheimnis zu bewahren|비밀을 지키려는 %s|努力保守秘密的%s
The %s is surprised by a sudden noise|突然の物音に驚く%s|%s se sorprende con un ruido repentino|%s se assusta com um barulho repentino|%s est surpris par un bruit soudain|%s erschrickt über ein plötzliches Geräusch|갑작스러운 소리에 놀란 %s|被突然的响声吓到的%s
The %s is giving a confident speech|自信満々にスピーチする%s|%s da un discurso seguro|%s faz um discurso confiante|%s prononce un discours assuré|%s hält eine selbstbewusste Rede|자신 있게 연설하는 %s|自信满满发表演讲的%s
The %s is celebrating a victory|勝利を喜ぶ%s|%s celebra una victoria|%s comemora uma vitória|%s fête une victoire|%s feiert einen Sieg|승리를 축하하는 %s|庆祝胜利的%s
The %s is trying to solve a mystery|謎を解こうとする%s|%s intenta resolver un misterio|%s tenta resolver um mistério|%s tente de résoudre une énigme|%s versucht ein Rätsel zu lösen|수수께끼를 풀려는 %s|努力解开谜团的%s
The %s is searching for a hidden treasure|隠された宝物を探す%s|%s busca un tesoro escondido|%s procura um tesouro escondido|%s cherche un trésor caché|%s sucht einen versteckten Schatz|숨겨진 보물을 찾는 %s|寻找隐藏宝藏的%s
The %s is learning an unusual dance|変わったダンスを習う%s|%s aprende un baile extraño|%s aprende uma dança estranha|%s apprend une danse étrange|%s lernt einen ungewöhnlichen Tanz|이상한 춤을 배우는 %s|学习奇怪舞蹈的%s
The %s is helping someone in trouble|困っている人を助ける%s|%s ayuda a alguien en apuros|%s ajuda alguém em apuros|%s aide une personne en difficulté|%s hilft jemandem in Not|곤란한 사람을 돕는 %s|帮助遇到困难的人的%s
The %s is getting lost in a huge building|大きな建物で迷子になる%s|%s se pierde en un edificio enorme|%s se perde num prédio enorme|%s se perd dans un grand bâtiment|%s verirrt sich in einem riesigen Gebäude|큰 건물에서 길을 잃은 %s|在巨大建筑里迷路的%s
The %s is waiting for important news|大切な知らせを待っている%s|%s espera noticias importantes|%s espera notícias importantes|%s attend une nouvelle importante|%s wartet auf wichtige Nachrichten|중요한 소식을 기다리는 %s|等待重要消息的%s
The %s is protecting a precious object|大切な物を守る%s|%s protege un objeto valioso|%s protege um objeto precioso|%s protège un objet précieux|%s beschützt einen wertvollen Gegenstand|소중한 물건을 지키는 %s|保护珍贵物品的%s
The %s is saying goodbye to a friend|友達に別れを告げる%s|%s se despide de un amigo|%s se despede de um amigo|%s dit au revoir à un ami|%s verabschiedet sich von einem Freund|친구에게 작별 인사하는 %s|向朋友告别的%s
The %s is discovering something amazing|驚くべきものを発見する%s|%s descubre algo increíble|%s descobre algo incrível|%s découvre quelque chose d'incroyable|%s entdeckt etwas Erstaunliches|놀라운 것을 발견한 %s|发现惊人事物的%s
The %s is telling a funny story|面白い話をする%s|%s cuenta una historia divertida|%s conta uma história engraçada|%s raconte une histoire drôle|%s erzählt eine lustige Geschichte|재미있는 이야기를 들려주는 %s|讲有趣故事的%s
`);

family('activity', `
Someone is trying %s for the first time|初めて%sに挑戦する|Alguien prueba %s por primera vez|Alguém experimenta %s pela primeira vez|Quelqu'un essaie %s pour la première fois|Jemand versucht %s zum ersten Mal|처음으로 %s 도전하기|第一次尝试%s
Someone is practicing %s very seriously|真剣に%sを練習する|Alguien practica %s muy seriamente|Alguém pratica %s com muita seriedade|Quelqu'un pratique %s très sérieusement|Jemand übt %s ganz ernsthaft|진지하게 %s 연습하기|非常认真地练习%s
Someone is teaching %s to a friend|友達に%sを教える|Alguien enseña %s a un amigo|Alguém ensina %s a um amigo|Quelqu'un enseigne %s à un ami|Jemand bringt einem Freund %s bei|친구에게 %s 가르치기|教朋友%s
Someone is getting ready for the %s|%sの準備をする|Alguien se prepara para %s|Alguém se prepara para %s|Quelqu'un se prépare pour %s|Jemand bereitet sich auf %s vor|%s 준비하기|为%s做准备
Someone is feeling nervous before %s|%sの前に緊張している|Alguien se pone nervioso antes de %s|Alguém fica nervoso antes de %s|Quelqu'un est nerveux avant %s|Jemand ist vor %s nervös|%s 전에 긴장하기|在%s之前感到紧张
Someone is celebrating after %s|%sが終わって喜ぶ|Alguien celebra después de %s|Alguém comemora depois de %s|Quelqu'un fête la fin de %s|Jemand feiert nach %s|%s 끝나고 축하하기|在%s之后庆祝
Someone is making a mistake during %s|%sをしていて失敗する|Alguien comete un error durante %s|Alguém erra durante %s|Quelqu'un se trompe pendant %s|Jemand macht bei %s einen Fehler|%s 도중 실수하기|在%s时出错
Someone is asking for help with the %s|%sについて助けを求める|Alguien pide ayuda con %s|Alguém pede ajuda com %s|Quelqu'un demande de l'aide pour %s|Jemand bittet bei %s um Hilfe|%s 도움 요청하기|请求别人帮助完成%s
Someone is demonstrating %s to an audience|みんなの前で%sを実演する|Alguien demuestra %s ante un público|Alguém demonstra %s para uma plateia|Quelqu'un fait une démonstration de %s|Jemand führt %s vor Publikum vor|사람들 앞에서 %s 시범 보이기|当众演示%s
Someone is making a surprising discovery while doing %s|%sの最中に思わぬ発見をする|Alguien descubre algo sorprendente durante %s|Alguém descobre algo surpreendente durante %s|Quelqu'un fait une découverte pendant %s|Jemand entdeckt bei %s etwas Überraschendes|%s 하다가 놀라운 것 발견하기|在进行%s时发现惊喜
Someone is inviting a friend to join %s|友達を%sに誘う|Alguien invita a un amigo a %s|Alguém convida um amigo para %s|Quelqu'un invite un ami à faire %s|Jemand lädt einen Freund zu %s ein|친구에게 %s 같이 하자고 하기|邀请朋友一起参加%s
Someone is showing how to start %s|%sの始め方を見せる|Alguien muestra cómo empezar %s|Alguém mostra como começar %s|Quelqu'un montre comment commencer %s|Jemand zeigt wie man mit %s anfängt|%s 시작하는 방법 보여주기|演示如何开始%s
Someone is struggling to finish %s|%sを終えるのに苦戦している|Alguien tiene dificultades para terminar %s|Alguém tem dificuldade para terminar %s|Quelqu'un a du mal à terminer %s|Jemand hat Mühe %s zu beenden|%s 마무리하기 힘들어하기|很难完成%s
Someone is recovering from a long session of %s|長時間%sをして疲れている|Alguien descansa después de mucho %s|Alguém descansa depois de muito %s|Quelqu'un récupère après une longue séance de %s|Jemand erholt sich nach langem %s|오랫동안 %s 하고 쉬기|长时间进行%s后休息
Someone is enjoying %s with family|家族と一緒に%sを楽しむ|Alguien disfruta de %s con su familia|Alguém aproveita %s com a família|Quelqu'un profite de %s en famille|Jemand genießt %s mit der Familie|가족과 %s 즐기기|和家人一起享受%s
Someone is explaining the basic rules of %s|%sの基本ルールを説明する|Alguien explica las reglas básicas de %s|Alguém explica as regras básicas de %s|Quelqu'un explique les règles de base de %s|Jemand erklärt die Grundregeln von %s|%s 기본 규칙 설명하기|讲解%s的基本规则
`);

family('feelings', `
Someone suddenly feels %s|急に%sな気持ちになる|Alguien se siente %s de repente|Alguém se sente %s de repente|Quelqu'un se sent soudain %s|Jemand fühlt sich plötzlich %s|갑자기 %s 감정을 느끼기|突然感到%s
Someone is trying to hide feeling %s|%sな気持ちを隠そうとする|Alguien intenta ocultar que está %s|Alguém tenta esconder que está %s|Quelqu'un essaie de cacher qu'il est %s|Jemand versucht zu verbergen dass er %s ist|%s 감정을 숨기려 하기|努力掩饰自己感到%s
Someone looks %s without saying a word|ひと言も話さず%sな表情をする|Alguien parece %s sin decir nada|Alguém parece %s sem dizer nada|Quelqu'un a l'air %s sans parler|Jemand sieht %s aus ohne etwas zu sagen|말없이 %s 표정 짓기|一言不发地显得%s
Someone feels %s before a big performance|大きな舞台の前に%sと感じる|Alguien se siente %s antes de actuar|Alguém se sente %s antes de se apresentar|Quelqu'un se sent %s avant un spectacle|Jemand fühlt sich vor einem Auftritt %s|큰 공연 전에 %s 감정 느끼기|上台表演前感到%s
Someone becomes %s after reading a message|メッセージを読んで%sな気持ちになる|Alguien se pone %s al leer un mensaje|Alguém fica %s depois de ler uma mensagem|Quelqu'un devient %s après un message|Jemand wird nach einer Nachricht %s|메시지를 보고 %s 감정 느끼기|读完消息后变得%s
Someone is pretending to be %s|%sなふりをする|Alguien finge estar %s|Alguém finge estar %s|Quelqu'un fait semblant d'être %s|Jemand tut so als wäre er %s|%s 척하기|假装自己很%s
Someone feels %s without knowing why|理由もなく%sな気持ちになる|Alguien se siente %s sin saber por qué|Alguém se sente %s sem saber por quê|Quelqu'un se sent %s sans savoir pourquoi|Jemand fühlt sich ohne Grund %s|이유 없이 %s 감정 느끼기|莫名其妙地感到%s
Someone feels %s while waiting for a result|結果を待ちながら%sと感じる|Alguien se siente %s al esperar un resultado|Alguém se sente %s esperando um resultado|Quelqu'un se sent %s en attendant un résultat|Jemand fühlt sich beim Warten auf ein Ergebnis %s|결과를 기다리며 %s 감정 느끼기|等待结果时感到%s
Someone wakes up feeling %s|目覚めたときに%sな気分になる|Alguien se despierta sintiéndose %s|Alguém acorda sentindo-se %s|Quelqu'un se réveille en se sentant %s|Jemand wacht auf und fühlt sich %s|일어나자마자 %s 감정 느끼기|醒来时觉得%s
Someone feels %s after a phone call|電話が終わって%sな気持ちになる|Alguien se siente %s después de llamar|Alguém se sente %s depois de telefonar|Quelqu'un se sent %s après un appel|Jemand fühlt sich nach einem Telefonat %s|통화 후 %s 감정 느끼기|打完电话后感到%s
Someone is explaining why they feel %s|どうして%sなのか説明する|Alguien explica por qué se siente %s|Alguém explica por que se sente %s|Quelqu'un explique pourquoi il se sent %s|Jemand erklärt warum er sich %s fühlt|왜 %s 감정인지 설명하기|解释为什么感到%s
Someone feels %s among strangers|知らない人たちの中で%sな気分になる|Alguien se siente %s entre desconocidos|Alguém se sente %s entre desconhecidos|Quelqu'un se sent %s parmi des inconnus|Jemand fühlt sich unter Fremden %s|낯선 사람들 사이에서 %s 감정 느끼기|在陌生人中间感到%s
Someone is acting %s on a theater stage|舞台の上で%sな人物を演じる|Alguien actúa %s en el teatro|Alguém atua como %s no teatro|Quelqu'un joue une personne %s au théâtre|Jemand spielt auf einer Bühne eine %s Person|무대에서 %s 역할 연기하기|在舞台上扮演%s的人
Someone is feeling %s in a new place|初めての場所で%sと感じる|Alguien se siente %s en un lugar nuevo|Alguém se sente %s num lugar novo|Quelqu'un se sent %s dans un lieu nouveau|Jemand fühlt sich an einem neuen Ort %s|새로운 장소에서 %s 감정 느끼기|在新地方感到%s
Someone is remembering a time they felt %s|%sだったときを思い出している|Alguien recuerda cuando se sintió %s|Alguém lembra de quando se sentiu %s|Quelqu'un se souvient d'avoir été %s|Jemand erinnert sich daran einmal %s gewesen zu sein|%s 감정을 느꼈던 때 회상하기|回忆曾经感到%s的时刻
Someone feels %s during a surprise party|サプライズパーティーで%sな気分になる|Alguien se siente %s en una fiesta sorpresa|Alguém se sente %s numa festa surpresa|Quelqu'un se sent %s à une fête surprise|Jemand fühlt sich auf einer Überraschungsparty %s|깜짝 파티에서 %s 감정 느끼기|在惊喜派对上感到%s
`);

family('occasions', `
Someone is preparing a display about %s|%sについて展示を準備する|Alguien prepara una exposición sobre %s|Alguém prepara uma exposição sobre %s|Quelqu'un prépare une exposition sur %s|Jemand bereitet eine Ausstellung über %s vor|%s 주제로 전시 준비하기|准备关于%s的展览
Someone is explaining the meaning of %s|%sの意味を説明する|Alguien explica el significado de %s|Alguém explica o significado de %s|Quelqu'un explique la signification de %s|Jemand erklärt die Bedeutung von %s|%s 의미 설명하기|解释%s的含义
Someone is trying %s for the first time|初めて%sを体験する|Alguien prueba %s por primera vez|Alguém experimenta %s pela primeira vez|Quelqu'un découvre %s pour la première fois|Jemand erlebt %s zum ersten Mal|처음 %s 체험하기|第一次体验%s
Someone is teaching a child about %s|子どもに%sを教えている|Alguien enseña %s a un niño|Alguém ensina %s a uma criança|Quelqu'un apprend %s à un enfant|Jemand erklärt einem Kind %s|아이에게 %s 가르치기|教孩子认识%s
Someone is making a poster about %s|%sのポスターを作る|Alguien hace un cartel sobre %s|Alguém faz um cartaz sobre %s|Quelqu'un crée une affiche sur %s|Jemand gestaltet ein Plakat über %s|%s 포스터 만들기|制作关于%s的海报
Someone is showing %s to a visitor|訪問者に%sを紹介する|Alguien muestra %s a un visitante|Alguém mostra %s a um visitante|Quelqu'un présente %s à un visiteur|Jemand zeigt einem Besucher %s|방문객에게 %s 소개하기|向游客展示%s
Someone is inviting a friend to experience %s|友達を%sの体験に誘う|Alguien invita a un amigo a experimentar %s|Alguém convida um amigo para conhecer %s|Quelqu'un invite un ami à découvrir %s|Jemand lädt einen Freund ein %s zu erleben|친구에게 %s 체험 권하기|邀请朋友体验%s
Someone is asking questions about %s|%sについて質問をする|Alguien hace preguntas sobre %s|Alguém faz perguntas sobre %s|Quelqu'un pose des questions sur %s|Jemand stellt Fragen zu %s|%s에 관해 질문하기|询问关于%s的问题
Someone is telling a story connected to %s|%sにまつわる話をする|Alguien cuenta una historia sobre %s|Alguém conta uma história sobre %s|Quelqu'un raconte une histoire liée à %s|Jemand erzählt eine Geschichte über %s|%s 관련 이야기 들려주기|讲一个与%s有关的故事
Someone is watching a demonstration of %s|%sの実演を見学する|Alguien observa una demostración de %s|Alguém assiste a uma demonstração de %s|Quelqu'un regarde une démonstration de %s|Jemand sieht eine Vorführung von %s|%s 시연 구경하기|观看%s的演示
Someone is taking a souvenir photo of %s|%sの記念写真を撮る|Alguien toma una foto de recuerdo de %s|Alguém tira uma foto de lembrança de %s|Quelqu'un prend une photo souvenir de %s|Jemand macht ein Erinnerungsfoto von %s|%s 기념사진 찍기|给%s拍纪念照片
Someone is comparing two traditions involving %s|%sに関わる二つの伝統を比べる|Alguien compara dos tradiciones de %s|Alguém compara duas tradições de %s|Quelqu'un compare deux traditions liées à %s|Jemand vergleicht zwei Traditionen rund um %s|%s 관련 두 전통 비교하기|比较与%s有关的两种传统
Someone is rehearsing for a presentation about %s|%sの発表を練習する|Alguien ensaya una presentación sobre %s|Alguém ensaia uma apresentação sobre %s|Quelqu'un répète un exposé sur %s|Jemand übt einen Vortrag über %s|%s 발표 연습하기|排练关于%s的介绍
Someone is remembering a special moment of %s|%sの特別な思い出を振り返る|Alguien recuerda un momento especial de %s|Alguém lembra um momento especial de %s|Quelqu'un se rappelle un moment spécial de %s|Jemand erinnert sich an einen besonderen Moment mit %s|%s 특별한 추억 떠올리기|回忆关于%s的特别时刻
Someone is learning how to participate in %s|%sへの参加方法を学んでいる|Alguien aprende a participar en %s|Alguém aprende como participar de %s|Quelqu'un apprend à participer à %s|Jemand lernt wie man bei %s mitmacht|%s 참여 방법 배우기|学习如何参与%s
Someone is sharing an interesting fact about %s|%sについて面白い事実を教える|Alguien comparte un dato curioso sobre %s|Alguém conta uma curiosidade sobre %s|Quelqu'un raconte un fait intéressant sur %s|Jemand erzählt etwas Interessantes über %s|%s 흥미로운 사실 소개하기|分享一个关于%s的趣闻
`);

family('belongings', `
Someone is trying to learn how to use the %s|%sの使い方を習っている|Alguien aprende a utilizar %s|Alguém aprende a usar %s|Quelqu'un apprend à utiliser %s|Jemand lernt %s zu benutzen|%s 사용법 배우기|学习使用%s
Someone is searching for the %s|%sを一生懸命探している|Alguien busca %s|Alguém procura %s|Quelqu'un cherche %s|Jemand sucht nach %s|%s 열심히 찾기|努力寻找%s
Someone is explaining how the %s works|%sの仕組みを説明する|Alguien explica cómo funciona %s|Alguém explica como funciona %s|Quelqu'un explique comment fonctionne %s|Jemand erklärt wie %s funktioniert|%s 작동 원리 설명하기|解释%s的工作原理
Someone is showing the %s to a friend|友達に%sを見せている|Alguien muestra %s a un amigo|Alguém mostra %s a um amigo|Quelqu'un montre %s à un ami|Jemand zeigt einem Freund %s|친구에게 %s 보여주기|向朋友展示%s
Someone is asking for help with %s|%sについて助けを求める|Alguien pide ayuda con %s|Alguém pede ajuda com %s|Quelqu'un demande de l'aide avec %s|Jemand bittet um Hilfe bei %s|%s 사용 도와달라고 하기|请求别人帮忙处理%s
Someone is taking a photo of %s|%sの写真を撮る|Alguien fotografía %s|Alguém fotografa %s|Quelqu'un photographie %s|Jemand fotografiert %s|%s 사진 찍기|给%s拍照
Someone is shopping for the %s|買い物で%sを選ぶ|Alguien compra %s|Alguém compra %s|Quelqu'un achète %s|Jemand kauft %s|%s 쇼핑하기|购买%s
Someone is explaining why the %s is useful|%sが便利な理由を説明する|Alguien explica por qué sirve %s|Alguém explica por que %s é útil|Quelqu'un explique pourquoi %s est utile|Jemand erklärt warum %s nützlich ist|%s 유용한 이유 설명하기|解释%s为什么有用
Someone is presenting a new version of the %s|新しい%sを紹介する|Alguien presenta una versión nueva de %s|Alguém apresenta uma nova versão de %s|Quelqu'un présente une nouvelle version de %s|Jemand stellt eine neue Version von %s vor|새로운 %s 소개하기|介绍新版%s
Someone is comparing the %s with something similar|%sと似た物を比べている|Alguien compara %s con algo parecido|Alguém compara %s com algo parecido|Quelqu'un compare %s à quelque chose de semblable|Jemand vergleicht %s mit etwas Ähnlichem|%s 비슷한 물건과 비교하기|把%s与相似物品比较
Someone is imagining an unusual design for the %s|変わった%sのデザインを考える|Alguien imagina un diseño extraño de %s|Alguém imagina um desenho diferente para %s|Quelqu'un imagine un modèle original de %s|Jemand denkt sich ein ungewöhnliches Design für %s aus|특별한 %s 디자인 상상하기|想象一种特别设计的%s
Someone is deciding whether to keep the %s|%sを残すか迷っている|Alguien decide si conservar %s|Alguém decide se guarda %s|Quelqu'un hésite à garder %s|Jemand überlegt ob er %s behalten soll|%s 보관할지 고민하기|犹豫是否保留%s
Someone is giving a talk about the %s|%sについて話をする|Alguien da una charla sobre %s|Alguém faz uma palestra sobre %s|Quelqu'un fait un exposé sur %s|Jemand hält einen Vortrag über %s|%s에 대해 발표하기|做关于%s的介绍
Someone is receiving the %s as a surprise gift|%sをサプライズでプレゼントされる|Alguien recibe %s como regalo sorpresa|Alguém ganha %s como presente surpresa|Quelqu'un reçoit %s comme cadeau surprise|Jemand bekommt %s überraschend geschenkt|%s 깜짝 선물 받기|意外收到%s作为礼物
Someone is learning to recognize the %s|%sを見分ける練習をしている|Alguien aprende a reconocer %s|Alguém aprende a reconhecer %s|Quelqu'un apprend à reconnaître %s|Jemand lernt %s zu erkennen|%s 알아보는 연습하기|练习辨认%s
Someone is discovering a surprising fact about the %s|%sの意外な特徴を知って驚く|Alguien descubre algo sorprendente sobre %s|Alguém descobre algo surpreendente sobre %s|Quelqu'un découvre un fait surprenant sur %s|Jemand erfährt etwas Erstaunliches über %s|%s 의외의 특징 발견하기|发现%s的惊人特点
`);

family('education', `
Someone is learning about %s in class|授業で%sについて学んでいる|Alguien aprende sobre %s en clase|Alguém aprende sobre %s na aula|Quelqu'un étudie %s en classe|Jemand lernt im Unterricht etwas über %s|수업에서 %s 배우기|在课堂上学习%s
Someone is asking a teacher about %s|先生に%sについて質問する|Alguien pregunta al profesor por %s|Alguém pergunta ao professor sobre %s|Quelqu'un interroge son professeur sur %s|Jemand fragt die Lehrkraft nach %s|선생님에게 %s 질문하기|向老师请教%s
Someone is explaining %s to a classmate|クラスメートに%sを説明する|Alguien explica %s a un compañero|Alguém explica %s a um colega|Quelqu'un explique %s à un camarade|Jemand erklärt einem Mitschüler %s|친구에게 %s 설명하기|给同学解释%s
Someone is searching for information about %s|%sについて調べものをする|Alguien busca información sobre %s|Alguém pesquisa sobre %s|Quelqu'un recherche des informations sur %s|Jemand recherchiert über %s|%s 자료 조사하기|查找关于%s的资料
Someone is making a diagram about %s|%sについて図を描く|Alguien dibuja un esquema sobre %s|Alguém desenha um esquema sobre %s|Quelqu'un dessine un schéma de %s|Jemand zeichnet eine Skizze zu %s|%s 그림 도식 만들기|画关于%s的示意图
Someone is preparing a presentation about %s|%sの発表を準備する|Alguien prepara una presentación sobre %s|Alguém prepara uma apresentação sobre %s|Quelqu'un prépare un exposé sur %s|Jemand bereitet einen Vortrag über %s vor|%s 발표 준비하기|准备关于%s的演讲
Someone is making a model related to %s|%sに関する模型を作る|Alguien construye un modelo de %s|Alguém monta um modelo de %s|Quelqu'un construit une maquette de %s|Jemand baut ein Modell zu %s|%s 관련 모형 만들기|制作与%s有关的模型
Someone is checking the meaning of %s|%sの意味を確認する|Alguien comprueba qué significa %s|Alguém confere o significado de %s|Quelqu'un vérifie le sens de %s|Jemand prüft die Bedeutung von %s|%s 뜻 확인하기|查清%s的含义
Someone is remembering a lesson about %s|%sについて習ったことを思い出す|Alguien recuerda una lección sobre %s|Alguém lembra uma aula sobre %s|Quelqu'un se rappelle une leçon sur %s|Jemand erinnert sich an eine Lektion über %s|%s 수업 기억하기|回忆关于%s的课程
Someone is discussing %s in a group|グループで%sについて話し合う|Alguien debate %s en grupo|Alguém debate %s em grupo|Quelqu'un discute de %s en groupe|Jemand diskutiert %s in einer Gruppe|조별로 %s 토론하기|小组讨论%s
Someone is wondering how %s works|%sの仕組みが気になっている|Alguien se pregunta cómo funciona %s|Alguém se pergunta como funciona %s|Quelqu'un se demande comment fonctionne %s|Jemand fragt sich wie %s funktioniert|%s 원리 궁금해하기|好奇%s如何运作
Someone is trying to demonstrate %s|%sを実演しようとする|Alguien intenta demostrar %s|Alguém tenta demonstrar %s|Quelqu'un essaie de démontrer %s|Jemand versucht %s zu demonstrieren|%s 실험 시연하기|尝试演示%s
Someone is writing notes about %s|%sについてノートを取る|Alguien toma apuntes sobre %s|Alguém faz anotações sobre %s|Quelqu'un prend des notes sur %s|Jemand macht sich Notizen über %s|%s 필기하기|做关于%s的笔记
Someone is creating a quiz about %s|%sに関するクイズを作る|Alguien crea un cuestionario sobre %s|Alguém cria um quiz sobre %s|Quelqu'un crée un quiz sur %s|Jemand erstellt ein Quiz über %s|%s 퀴즈 만들기|制作关于%s的测验
Someone is excited to discover %s|%sを発見して喜ぶ|Alguien se entusiasma al descubrir %s|Alguém fica animado ao descobrir %s|Quelqu'un est ravi de découvrir %s|Jemand freut sich %s zu entdecken|%s 발견하고 기뻐하기|因发现%s而兴奋
Someone is teaching a younger student about %s|年下の生徒に%sを教える|Alguien enseña %s a un alumno menor|Alguém ensina %s a um aluno mais novo|Quelqu'un enseigne %s à un plus jeune élève|Jemand erklärt einem jüngeren Schüler %s|어린 학생에게 %s 가르치기|教低年级学生%s
`);

family('locations', `
Someone is looking for the %s|%sの場所を探している|Alguien busca %s|Alguém procura %s|Quelqu'un cherche %s|Jemand sucht %s|%s 찾기|正在寻找%s
Someone is giving directions to the %s|%sへの道順を教える|Alguien explica cómo llegar a %s|Alguém explica como chegar a %s|Quelqu'un explique le chemin vers %s|Jemand erklärt den Weg zu %s|%s 가는 길 알려주기|告诉别人怎么去%s
Someone is waiting for a friend near the %s|%sの近くで友達を待つ|Alguien espera a un amigo cerca de %s|Alguém espera um amigo perto de %s|Quelqu'un attend un ami près de %s|Jemand wartet bei %s auf einen Freund|%s 근처에서 친구 기다리기|在%s附近等朋友
Someone is photographing the %s|%sの写真を撮る|Alguien fotografía %s|Alguém fotografa %s|Quelqu'un photographie %s|Jemand fotografiert %s|%s 사진 찍기|拍摄%s的照片
Someone is walking past the %s|%sの前を通り過ぎる|Alguien pasa caminando por %s|Alguém passa caminhando por %s|Quelqu'un passe devant %s|Jemand geht an %s vorbei|%s 앞을 지나가기|从%s旁边走过
Someone is arriving at the %s|%sに到着する|Alguien llega a %s|Alguém chega a %s|Quelqu'un arrive à %s|Jemand kommt bei %s an|%s 도착하기|抵达%s
Someone is explaining the purpose of the %s|%sが何のための場所か説明する|Alguien explica para qué sirve %s|Alguém explica a função de %s|Quelqu'un explique à quoi sert %s|Jemand erklärt wozu %s dient|%s 용도 설명하기|解释%s的用途
Someone is meeting a stranger near the %s|%sの近くで知らない人と会う|Alguien conoce a un desconocido cerca de %s|Alguém conhece um estranho perto de %s|Quelqu'un rencontre un inconnu près de %s|Jemand trifft einen Fremden bei %s|%s 근처에서 낯선 사람 만나기|在%s附近遇见陌生人
Someone is searching for the %s on a map|地図で%sを見つけようとする|Alguien busca %s en un mapa|Alguém procura %s num mapa|Quelqu'un cherche %s sur une carte|Jemand sucht %s auf einer Karte|지도에서 %s 찾기|在地图上寻找%s
Someone is getting lost near the %s|%sの近くで道に迷う|Alguien se pierde cerca de %s|Alguém se perde perto de %s|Quelqu'un se perd près de %s|Jemand verirrt sich bei %s|%s 근처에서 길 잃기|在%s附近迷路
Someone is observing people at the %s|%sにいる人々を観察する|Alguien observa a la gente en %s|Alguém observa as pessoas em %s|Quelqu'un observe les gens à %s|Jemand beobachtet Menschen bei %s|%s 사람들 관찰하기|观察%s附近的人
Someone is finding a lost item near the %s|%sの近くで落とし物を見つける|Alguien encuentra un objeto perdido cerca de %s|Alguém encontra um objeto perdido perto de %s|Quelqu'un trouve un objet perdu près de %s|Jemand findet bei %s einen verlorenen Gegenstand|%s 근처에서 분실물 찾기|在%s附近捡到失物
Someone is describing the %s to a visitor|訪問者に%sを説明する|Alguien describe %s a un visitante|Alguém descreve %s a um visitante|Quelqu'un décrit %s à un visiteur|Jemand beschreibt einem Besucher %s|방문객에게 %s 설명하기|向游客介绍%s
Someone is asking for help near the %s|%sの近くで助けを求める|Alguien pide ayuda cerca de %s|Alguém pede ajuda perto de %s|Quelqu'un demande de l'aide près de %s|Jemand bittet bei %s um Hilfe|%s 근처에서 도움 요청하기|在%s附近求助
Someone is planning a visit to the %s|%sへの訪問を計画している|Alguien planea visitar %s|Alguém planeja visitar %s|Quelqu'un prévoit de visiter %s|Jemand plant einen Besuch bei %s|%s 방문 계획 세우기|计划参观%s
Someone is leaving the %s in a hurry|急いで%sを立ち去る|Alguien sale de %s con prisa|Alguém sai de %s com pressa|Quelqu'un quitte %s en vitesse|Jemand verlässt %s in Eile|서둘러 %s 떠나기|匆忙离开%s
`);

family('vehicles', `
Someone is learning to travel by %s|%sで移動する方法を学ぶ|Alguien aprende a viajar en %s|Alguém aprende a viajar de %s|Quelqu'un apprend à voyager en %s|Jemand lernt mit %s zu reisen|%s 이용해 이동하는 법 배우기|学习乘坐%s出行
Someone is waiting for the %s|%sが来るのを待つ|Alguien espera %s|Alguém espera %s|Quelqu'un attend %s|Jemand wartet auf %s|%s 기다리기|等待%s
Someone is watching the %s arrive|%sが到着するのを見る|Alguien observa llegar %s|Alguém observa %s chegar|Quelqu'un regarde arriver %s|Jemand beobachtet die Ankunft von %s|%s 도착하는 모습 보기|看着%s抵达
Someone is fixing a problem with the %s|%sの故障を直そうとする|Alguien arregla un problema con %s|Alguém conserta um problema em %s|Quelqu'un répare un problème de %s|Jemand repariert einen Defekt an %s|%s 고장 고치기|修理出了故障的%s
Someone is taking a photo of %s|%sの写真を撮る|Alguien fotografía %s|Alguém fotografa %s|Quelqu'un photographie %s|Jemand fotografiert %s|%s 사진 찍기|给%s拍照
Someone is planning a journey with the %s|%sで行く旅行を計画する|Alguien planea viajar en %s|Alguém planeja viajar de %s|Quelqu'un prévoit de voyager en %s|Jemand plant eine Reise mit %s|%s 여행 계획하기|计划乘坐%s旅行
Someone is explaining the safety rules for the %s|%sの安全ルールを説明する|Alguien explica las normas de seguridad de %s|Alguém explica as regras de segurança de %s|Quelqu'un explique les règles de sécurité de %s|Jemand erklärt die Sicherheitsregeln für %s|%s 안전수칙 설명하기|解释乘坐%s的安全规则
Someone is hurrying to get on the %s|%sに乗り遅れないよう急ぐ|Alguien corre para alcanzar %s|Alguém corre para pegar %s|Quelqu'un se dépêche d'attraper %s|Jemand beeilt sich um %s zu erreichen|%s 놓치지 않으려고 서두르기|赶着去搭乘%s
Someone is looking for a place to park the %s|%sを停める場所を探す|Alguien busca dónde aparcar %s|Alguém procura onde estacionar %s|Quelqu'un cherche où garer %s|Jemand sucht einen Parkplatz für %s|%s 주차할 곳 찾기|寻找停放%s的地方
Someone is comparing two types of %s|二種類の%sを比べている|Alguien compara dos tipos de %s|Alguém compara dois tipos de %s|Quelqu'un compare deux types de %s|Jemand vergleicht zwei Arten von %s|두 종류의 %s 비교하기|比较两种%s
Someone is showing a friend how the %s works|友達に%sの仕組みを見せる|Alguien enseña cómo funciona %s|Alguém mostra como %s funciona|Quelqu'un montre le fonctionnement de %s|Jemand zeigt wie %s funktioniert|친구에게 %s 작동 방식 보여주기|向朋友展示%s的工作方式
Someone is traveling by %s for the first time|初めて%sに乗って旅をする|Alguien viaja en %s por primera vez|Alguém viaja de %s pela primeira vez|Quelqu'un voyage en %s pour la première fois|Jemand reist zum ersten Mal mit %s|처음으로 %s 타고 여행하기|第一次乘坐%s旅行
Someone is cleaning the %s before a trip|旅行前に%sを掃除する|Alguien limpia %s antes de viajar|Alguém limpa %s antes de viajar|Quelqu'un nettoie %s avant un voyage|Jemand reinigt %s vor einer Reise|여행 전에 %s 청소하기|出发前清洁%s
Someone is enjoying the view while traveling by %s|%sの窓から外を眺める|Alguien mira por la ventana de %s|Alguém olha pela janela de %s|Quelqu'un regarde par la fenêtre de %s|Jemand schaut aus dem Fenster von %s|%s 창밖 보기|从%s的窗户往外看
Someone is imagining a future version of %s|未来の%sを想像する|Alguien imagina una versión futura de %s|Alguém imagina uma versão futura de %s|Quelqu'un imagine %s dans le futur|Jemand stellt sich %s in der Zukunft vor|미래의 %s 상상하기|想象未来的%s
Someone is excited to ride the %s|%sに乗るのが楽しみで仕方ない|Alguien está emocionado por subir a %s|Alguém está animado para andar de %s|Quelqu'un est impatient de monter à bord de %s|Jemand freut sich darauf mit %s zu fahren|%s 타기 전 신나 하기|兴奋地期待乘坐%s
`);

family('outdoors', `
Someone is looking closely at %s|%sをじっくり観察する|Alguien observa atentamente %s|Alguém observa %s com atenção|Quelqu'un observe attentivement %s|Jemand betrachtet %s genau|%s 자세히 관찰하기|仔细观察%s
Someone is trying to photograph %s|%sの写真を撮ろうとする|Alguien intenta fotografiar %s|Alguém tenta fotografar %s|Quelqu'un essaie de photographier %s|Jemand versucht %s zu fotografieren|%s 사진 찍으려고 하기|尝试拍摄%s
Someone is describing %s to a friend|友達に%sの様子を説明する|Alguien describe %s a un amigo|Alguém descreve %s a um amigo|Quelqu'un décrit %s à un ami|Jemand beschreibt einem Freund %s|친구에게 %s 설명하기|向朋友描述%s
Someone is drawing a picture of %s|%sの絵を描く|Alguien dibuja %s|Alguém desenha %s|Quelqu'un dessine %s|Jemand zeichnet %s|%s 그림 그리기|画一幅%s的画
Someone is learning surprising facts about %s|%sの意外な事実を学ぶ|Alguien aprende datos curiosos sobre %s|Alguém aprende fatos curiosos sobre %s|Quelqu'un découvre des faits étonnants sur %s|Jemand lernt Erstaunliches über %s|%s 흥미로운 사실 배우기|了解%s的惊人事实
Someone is telling a story involving %s|%sが登場する物語を語る|Alguien cuenta una historia sobre %s|Alguém conta uma história sobre %s|Quelqu'un raconte une histoire avec %s|Jemand erzählt eine Geschichte über %s|%s 이야기 들려주기|讲一个关于%s的故事
Someone is pointing to %s in a picture|写真の中の%sを指さす|Alguien señala %s en una imagen|Alguém aponta para %s numa foto|Quelqu'un montre %s sur une image|Jemand zeigt auf %s in einem Bild|사진 속 %s 가리키기|指着照片里的%s
Someone is asking questions about %s|%sについて質問する|Alguien hace preguntas sobre %s|Alguém faz perguntas sobre %s|Quelqu'un pose des questions sur %s|Jemand stellt Fragen über %s|%s 질문하기|询问关于%s的问题
Someone is dreaming about %s|%sの夢を見る|Alguien sueña con %s|Alguém sonha com %s|Quelqu'un rêve de %s|Jemand träumt von %s|%s 꿈꾸기|梦见%s
Someone is writing a poem about %s|%sをテーマに詩を書く|Alguien escribe un poema sobre %s|Alguém escreve um poema sobre %s|Quelqu'un écrit un poème sur %s|Jemand schreibt ein Gedicht über %s|%s 시 쓰기|写一首关于%s的诗
Someone is researching %s for a school project|学校の課題で%sを調べる|Alguien investiga %s para un proyecto escolar|Alguém pesquisa %s para um projeto escolar|Quelqu'un étudie %s pour un projet scolaire|Jemand recherchiert %s für ein Schulprojekt|학교 과제로 %s 조사하기|为学校项目研究%s
Someone is showing a visitor %s|訪問者に%sを紹介する|Alguien muestra %s a un visitante|Alguém mostra %s a um visitante|Quelqu'un montre %s à un visiteur|Jemand zeigt einem Besucher %s|방문객에게 %s 보여주기|向游客展示%s
Someone is checking a map or chart of %s|%sの地図や図表を確認する|Alguien consulta un mapa o gráfico de %s|Alguém consulta um mapa ou gráfico de %s|Quelqu'un consulte une carte ou un graphique de %s|Jemand prüft eine Karte oder Grafik von %s|%s 지도나 도표 확인하기|查看%s的地图或图表
Someone is explaining why %s is important|%sが大切な理由を話す|Alguien explica la importancia de %s|Alguém explica a importância de %s|Quelqu'un explique pourquoi %s est important|Jemand erklärt warum %s wichtig ist|%s 중요성 설명하기|解释%s的重要性
Someone is imagining %s a thousand years ago|千年前の%sを想像する|Alguien imagina %s hace mil años|Alguém imagina %s há mil anos|Quelqu'un imagine %s il y a mille ans|Jemand stellt sich %s vor tausend Jahren vor|천 년 전 %s 상상하기|想象一千年前的%s
Someone is comparing %s with a similar phenomenon|%sと似た現象を比較する|Alguien compara %s con un fenómeno parecido|Alguém compara %s com um fenômeno semelhante|Quelqu'un compare %s à un phénomène semblable|Jemand vergleicht %s mit einem ähnlichen Phänomen|%s 비슷한 현상과 비교하기|把%s与相似现象比较
`);

family('body', `
Someone is pointing to %s|%sを指さす|Alguien señala %s|Alguém aponta para %s|Quelqu'un montre %s du doigt|Jemand zeigt auf %s|%s 가리키기|指着%s
Someone is checking %s in a mirror|鏡で%sを確認する|Alguien mira %s en un espejo|Alguém olha %s no espelho|Quelqu'un regarde %s dans un miroir|Jemand betrachtet %s im Spiegel|거울로 %s 확인하기|照镜子检查%s
Someone is washing %s carefully|%sを丁寧に洗う|Alguien lava %s con cuidado|Alguém lava %s com cuidado|Quelqu'un lave soigneusement %s|Jemand wäscht %s vorsichtig|%s 깨끗이 씻기|仔细清洗%s
Someone is protecting %s from the cold|寒さから%sを守ろうとする|Alguien protege %s del frío|Alguém protege %s do frio|Quelqu'un protège %s du froid|Jemand schützt %s vor Kälte|추위에서 %s 보호하기|保护%s免受寒冷
Someone is feeling pain in %s|%sが痛くて困っている|Alguien siente dolor en %s|Alguém sente dor em %s|Quelqu'un a mal à %s|Jemand hat Schmerzen an %s|%s 아파하기|感到%s疼痛
Someone is explaining the function of %s|%sの働きを説明する|Alguien explica la función de %s|Alguém explica a função de %s|Quelqu'un explique la fonction de %s|Jemand erklärt die Funktion von %s|%s 역할 설명하기|解释%s的作用
Someone is showing a doctor %s|医師に%sを見せる|Alguien muestra %s a un médico|Alguém mostra %s a um médico|Quelqu'un montre %s à un médecin|Jemand zeigt einem Arzt %s|의사에게 %s 보여주기|给医生看%s
Someone is drawing %s in an anatomy lesson|人体の授業で%sを描く|Alguien dibuja %s en una clase de anatomía|Alguém desenha %s na aula de anatomia|Quelqu'un dessine %s en cours d'anatomie|Jemand zeichnet %s im Anatomieunterricht|해부학 시간에 %s 그리기|在人体课上画%s
Someone is covering %s to avoid dust|ほこりが入らないように%sを覆う|Alguien cubre %s para evitar el polvo|Alguém cobre %s para evitar poeira|Quelqu'un couvre %s contre la poussière|Jemand bedeckt %s gegen Staub|먼지 막으려고 %s 가리기|为了防尘遮住%s
Someone is carefully touching %s|%sをそっと触る|Alguien toca %s con cuidado|Alguém toca %s com cuidado|Quelqu'un touche doucement %s|Jemand berührt %s ganz vorsichtig|%s 살짝 만지기|轻轻触摸%s
Someone is asking a question about %s|%sについて質問する|Alguien pregunta sobre %s|Alguém pergunta sobre %s|Quelqu'un pose une question sur %s|Jemand stellt eine Frage über %s|%s에 관해 질문하기|询问关于%s的问题
Someone is applying lotion to %s|%sに保湿クリームを塗る|Alguien aplica crema en %s|Alguém passa creme em %s|Quelqu'un applique une crème sur %s|Jemand trägt Lotion auf %s auf|%s 로션 바르기|给%s涂润肤霜
Someone is trying not to scratch %s|かゆい%sをかかずに我慢する|Alguien intenta no rascarse %s|Alguém tenta não coçar %s|Quelqu'un essaie de ne pas gratter %s|Jemand versucht %s nicht zu kratzen|%s 긁지 않으려고 참기|忍住不抓痒的%s
Someone is learning the name of %s|%sの名前を覚える|Alguien aprende el nombre de %s|Alguém aprende o nome de %s|Quelqu'un apprend le nom de %s|Jemand lernt den Namen von %s|%s 이름 배우기|学习%s的名称
Someone is testing how %s moves|%sがどう動くか試す|Alguien prueba cómo se mueve %s|Alguém testa como %s se move|Quelqu'un teste le mouvement de %s|Jemand testet wie sich %s bewegt|%s 움직임 시험하기|测试%s如何活动
Someone is noticing a change in %s|%sの変化に気づく|Alguien nota un cambio en %s|Alguém percebe uma mudança em %s|Quelqu'un remarque un changement de %s|Jemand bemerkt eine Veränderung an %s|%s 변화 알아채기|察觉%s的变化
`);

family('travel', `
Someone is getting ready for %s|%sの準備をする|Alguien se prepara para %s|Alguém se prepara para %s|Quelqu'un se prépare pour %s|Jemand bereitet sich auf %s vor|%s 준비하기|为%s做准备
Someone is searching for %s on a trip|旅行中に%sを探す|Alguien busca %s durante un viaje|Alguém procura %s durante uma viagem|Quelqu'un cherche %s pendant un voyage|Jemand sucht unterwegs nach %s|여행 중 %s 찾기|旅途中寻找%s
Someone is worried about %s while traveling|旅行中に%sのことで心配する|Alguien se preocupa por %s mientras viaja|Alguém se preocupa com %s numa viagem|Quelqu'un s'inquiète à propos de %s en voyage|Jemand macht sich unterwegs Sorgen um %s|여행 중 %s 걱정하기|旅行中担心%s
Someone is asking a question about %s|%sについて質問する|Alguien pregunta por %s|Alguém pergunta sobre %s|Quelqu'un pose une question sur %s|Jemand fragt nach %s|%s에 관해 질문하기|询问%s的情况
Someone is checking information about %s|%sについて情報を確認する|Alguien consulta información sobre %s|Alguém consulta informações sobre %s|Quelqu'un vérifie les informations sur %s|Jemand prüft Informationen zu %s|%s 정보 확인하기|查看关于%s的信息
Someone is showing a picture of %s|%sの写真を見せる|Alguien muestra una foto de %s|Alguém mostra uma foto de %s|Quelqu'un montre une photo de %s|Jemand zeigt ein Foto von %s|%s 사진 보여주기|展示%s的照片
Someone is explaining %s to a travel partner|旅の仲間に%sを説明する|Alguien explica %s a su compañero de viaje|Alguém explica %s ao companheiro de viagem|Quelqu'un explique %s à son compagnon de voyage|Jemand erklärt seinem Reisepartner %s|여행 동반자에게 %s 설명하기|向旅伴解释%s
Someone is excited about %s|%sが楽しみでわくわくする|Alguien está entusiasmado con %s|Alguém está animado com %s|Quelqu'un est enthousiaste à propos de %s|Jemand freut sich auf %s|%s 기대하며 설레기|为%s感到兴奋
Someone is comparing two options for %s|%sについて二つの選択肢を比べる|Alguien compara dos opciones para %s|Alguém compara duas opções para %s|Quelqu'un compare deux options pour %s|Jemand vergleicht zwei Möglichkeiten für %s|%s 두 가지 선택지 비교하기|比较%s的两种选择
Someone is confused about %s|%sのことで混乱している|Alguien está confundido por %s|Alguém está confuso sobre %s|Quelqu'un est perdu à propos de %s|Jemand ist wegen %s verwirrt|%s 때문에 혼란스러워하기|对%s感到困惑
Someone is discussing %s with a travel agent|旅行会社の人と%sについて話す|Alguien habla de %s con un agente de viajes|Alguém conversa sobre %s com um agente de viagens|Quelqu'un parle de %s à une agence de voyages|Jemand bespricht %s mit einem Reisebüro|여행사 직원과 %s 상담하기|和旅行社讨论%s
Someone is pointing to %s in a brochure|パンフレットで%sを指さす|Alguien señala %s en un folleto|Alguém aponta para %s num folheto|Quelqu'un montre %s sur une brochure|Jemand zeigt auf %s in einem Prospekt|안내 책자에서 %s 가리키기|指着宣传册上的%s
Someone is making a travel checklist about %s|%sについて旅行用チェックリストを作る|Alguien hace una lista de viaje sobre %s|Alguém faz uma lista de viagem para %s|Quelqu'un fait une liste de voyage concernant %s|Jemand erstellt eine Reiseliste für %s|%s 여행 체크리스트 만들기|制作关于%s的旅行清单
Someone is remembering %s from a previous trip|前の旅行での%sを思い出す|Alguien recuerda %s de un viaje anterior|Alguém lembra de %s numa viagem passada|Quelqu'un se souvient de %s lors d'un ancien voyage|Jemand erinnert sich an %s von einer früheren Reise|지난 여행의 %s 기억하기|回忆上次旅行中的%s
Someone is telling a funny travel story about %s|%sについて面白い旅行話をする|Alguien cuenta una historia divertida de viaje sobre %s|Alguém conta uma história engraçada de viagem sobre %s|Quelqu'un raconte une anecdote drôle de voyage sur %s|Jemand erzählt eine lustige Reisegeschichte über %s|%s 재미있는 여행 이야기 들려주기|讲关于%s的有趣旅行故事
Someone is trying to explain %s without speaking|声を出さずに%sを説明しようとする|Alguien explica %s sin hablar|Alguém explica %s sem falar|Quelqu'un explique %s sans parler|Jemand erklärt %s ohne zu sprechen|말없이 %s 설명하기|不说话解释%s
`);

family('action', `
Slowly %s|ゆっくり%s|%s lentamente|%s lentamente|%s lentement|Langsam %s|천천히 %s|慢慢地%s
Quickly %s|急いで%s|%s rápidamente|%s rapidamente|%s rapidement|Schnell %s|빨리 %s|快速地%s
Carefully %s|慎重に%s|%s con cuidado|%s com cuidado|%s avec soin|Vorsichtig %s|조심스럽게 %s|小心地%s
Silently %s|声を出さずに%s|%s en silencio|%s em silêncio|%s en silence|Leise %s|조용히 %s|悄悄地%s
Confidently %s|自信満々に%s|%s con confianza|%s com confiança|%s avec confiance|Selbstbewusst %s|자신 있게 %s|自信满满地%s
Nervously %s|緊張しながら%s|%s nerviosamente|%s nervosamente|%s nerveusement|Nervös %s|긴장하면서 %s|紧张地%s
Dramatically %s|大げさに%s|%s de forma dramática|%s de forma dramática|%s de façon théâtrale|Dramatisch %s|과장되게 %s|夸张地%s
%s in front of a mirror|鏡を見ながら%s|%s frente a un espejo|%s diante de um espelho|%s devant un miroir|%s vor einem Spiegel|거울 앞에서 %s|对着镜子%s
%s with a friend|友達と一緒に%s|%s con un amigo|%s com um amigo|%s avec un ami|%s mit einem Freund|친구와 함께 %s|和朋友一起%s
%s while everyone watches|みんなに見られながら%s|%s mientras todos miran|%s enquanto todos olham|%s sous les regards de tous|%s während alle zusehen|모두가 지켜보는 가운데 %s|在大家注视下%s
%s while trying not to laugh|笑いをこらえながら%s|%s intentando no reír|%s tentando não rir|%s en essayant de ne pas rire|%s ohne zu lachen|웃음을 참으면서 %s|一边憋笑一边%s
%s as if floating in zero gravity|無重力で浮いているつもりで%s|%s como si no hubiera gravedad|%s como se não houvesse gravidade|%s comme en apesanteur|%s wie in Schwerelosigkeit|무중력 상태인 듯 %s|仿佛失重般%s
%s while feeling very sleepy|とても眠そうに%s|%s con mucho sueño|%s com muito sono|%s en ayant très sommeil|%s während man sehr müde ist|졸린 듯이 %s|困倦地%s
%s as if a strong wind is blowing|強い風が吹いているつもりで%s|%s como si soplara un viento fuerte|%s como se ventasse muito|%s comme si un vent fort soufflait|%s wie bei starkem Wind|강한 바람 속에서 %s|仿佛刮着大风般%s
%s as if it is the first attempt|初めて挑戦するつもりで%s|%s como si fuera la primera vez|%s como se fosse a primeira vez|%s comme pour la première fois|%s wie beim ersten Versuch|처음 하는 듯이 %s|仿佛第一次尝试般%s
%s with a look of total surprise|とても驚いた顔で%s|%s con cara de gran sorpresa|%s com uma cara de espanto|%s avec un air très étonné|%s mit völlig überraschter Miene|깜짝 놀란 얼굴로 %s|带着十分惊讶的表情%s
`);

  // Verify every family was explicitly authored and every category assigned.
  const EXPECTED_FAMILIES = Object.keys(ASSIGNMENTS);
  if (Object.keys(FAMILIES).length !== EXPECTED_FAMILIES.length ||
      EXPECTED_FAMILIES.some(id => !FAMILIES[id])) {
    throw new Error('Incomplete Charades semantic-scene catalog');
  }
  root.CHARADES_SCENES = Object.freeze({ families:FAMILIES, assignments:ASSIGNMENTS, expand });
  if (typeof module !== 'undefined' && module.exports) module.exports = root.CHARADES_SCENES;
})(typeof window !== 'undefined' ? window : globalThis);
