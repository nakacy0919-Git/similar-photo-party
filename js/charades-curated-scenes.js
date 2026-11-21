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
Someone is getting ready for %s|%sの準備をする|Alguien se prepara para %s|Alguém se prepara para %s|Quelqu'un se prépare pour %s|Jemand bereitet sich auf %s vor|%s 준비하기|为%s做准备
Someone is feeling nervous before %s|%sの前に緊張している|Alguien se pone nervioso antes de %s|Alguém fica nervoso antes de %s|Quelqu'un est nerveux avant %s|Jemand ist vor %s nervös|%s 전에 긴장하기|在%s之前感到紧张
Someone is celebrating after %s|%sが終わって喜ぶ|Alguien celebra después de %s|Alguém comemora depois de %s|Quelqu'un fête la fin de %s|Jemand feiert nach %s|%s 끝나고 축하하기|在%s之后庆祝
Someone is making a mistake during %s|%sをしていて失敗する|Alguien comete un error durante %s|Alguém erra durante %s|Quelqu'un se trompe pendant %s|Jemand macht bei %s einen Fehler|%s 도중 실수하기|在%s时出错
Someone is asking for help with %s|%sについて助けを求める|Alguien pide ayuda con %s|Alguém pede ajuda com %s|Quelqu'un demande de l'aide pour %s|Jemand bittet bei %s um Hilfe|%s 도움 요청하기|请求别人帮助完成%s
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
Someone is trying to learn how to use %s|%sの使い方を習っている|Alguien aprende a utilizar %s|Alguém aprende a usar %s|Quelqu'un apprend à utiliser %s|Jemand lernt %s zu benutzen|%s 사용법 배우기|学习使用%s
Someone is searching for %s|%sを一生懸命探している|Alguien busca %s|Alguém procura %s|Quelqu'un cherche %s|Jemand sucht nach %s|%s 열심히 찾기|努力寻找%s
Someone is explaining how %s works|%sの仕組みを説明する|Alguien explica cómo funciona %s|Alguém explica como funciona %s|Quelqu'un explique comment fonctionne %s|Jemand erklärt wie %s funktioniert|%s 작동 원리 설명하기|解释%s的工作原理
Someone is showing %s to a friend|友達に%sを見せている|Alguien muestra %s a un amigo|Alguém mostra %s a um amigo|Quelqu'un montre %s à un ami|Jemand zeigt einem Freund %s|친구에게 %s 보여주기|向朋友展示%s
Someone is asking for help with %s|%sについて助けを求める|Alguien pide ayuda con %s|Alguém pede ajuda com %s|Quelqu'un demande de l'aide avec %s|Jemand bittet um Hilfe bei %s|%s 사용 도와달라고 하기|请求别人帮忙处理%s
Someone is taking a photo of %s|%sの写真を撮る|Alguien fotografía %s|Alguém fotografa %s|Quelqu'un photographie %s|Jemand fotografiert %s|%s 사진 찍기|给%s拍照
Someone is shopping for %s|買い物で%sを選ぶ|Alguien compra %s|Alguém compra %s|Quelqu'un achète %s|Jemand kauft %s|%s 쇼핑하기|购买%s
Someone is explaining why %s is useful|%sが便利な理由を説明する|Alguien explica por qué sirve %s|Alguém explica por que %s é útil|Quelqu'un explique pourquoi %s est utile|Jemand erklärt warum %s nützlich ist|%s 유용한 이유 설명하기|解释%s为什么有用
Someone is presenting a new version of %s|新しい%sを紹介する|Alguien presenta una versión nueva de %s|Alguém apresenta uma nova versão de %s|Quelqu'un présente une nouvelle version de %s|Jemand stellt eine neue Version von %s vor|새로운 %s 소개하기|介绍新版%s
Someone is comparing %s with something similar|%sと似た物を比べている|Alguien compara %s con algo parecido|Alguém compara %s com algo parecido|Quelqu'un compare %s à quelque chose de semblable|Jemand vergleicht %s mit etwas Ähnlichem|%s 비슷한 물건과 비교하기|把%s与相似物品比较
Someone is imagining an unusual design for %s|変わった%sのデザインを考える|Alguien imagina un diseño extraño de %s|Alguém imagina um desenho diferente para %s|Quelqu'un imagine un modèle original de %s|Jemand denkt sich ein ungewöhnliches Design für %s aus|특별한 %s 디자인 상상하기|想象一种特别设计的%s
Someone is deciding whether to keep %s|%sを残すか迷っている|Alguien decide si conservar %s|Alguém decide se guarda %s|Quelqu'un hésite à garder %s|Jemand überlegt ob er %s behalten soll|%s 보관할지 고민하기|犹豫是否保留%s
Someone is giving a talk about %s|%sについて話をする|Alguien da una charla sobre %s|Alguém faz uma palestra sobre %s|Quelqu'un fait un exposé sur %s|Jemand hält einen Vortrag über %s|%s에 대해 발표하기|做关于%s的介绍
Someone is receiving %s as a surprise gift|%sをサプライズでプレゼントされる|Alguien recibe %s como regalo sorpresa|Alguém ganha %s como presente surpresa|Quelqu'un reçoit %s comme cadeau surprise|Jemand bekommt %s überraschend geschenkt|%s 깜짝 선물 받기|意外收到%s作为礼物
Someone is learning to recognize %s|%sを見分ける練習をしている|Alguien aprende a reconocer %s|Alguém aprende a reconhecer %s|Quelqu'un apprend à reconnaître %s|Jemand lernt %s zu erkennen|%s 알아보는 연습하기|练习辨认%s
Someone is discovering a surprising fact about %s|%sの意外な特徴を知って驚く|Alguien descubre algo sorprendente sobre %s|Alguém descobre algo surpreendente sobre %s|Quelqu'un découvre un fait surprenant sur %s|Jemand erfährt etwas Erstaunliches über %s|%s 의외의 특징 발견하기|发现%s的惊人特点
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
