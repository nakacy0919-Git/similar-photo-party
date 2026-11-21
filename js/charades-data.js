/* Original classroom-friendly charades prompts: no reference-site deck content is copied. */
(function (root) {
  'use strict';
  const LANGUAGES = [
    ['en', 'English'], ['ja', '日本語'], ['es', 'Español'],
    ['pt', 'Português'], ['fr', 'Français'], ['de', 'Deutsch'],
    ['ko', '한국어'], ['zh', '中文']
  ];
  const decks = [];
  function deck(id, emoji, enName, jaName, lines) {
    const rows = lines.trim().split('\n').map(line => line.split('|').map(word => word.trim()));
    if (rows.length !== LANGUAGES.length || rows.some(row => row.length !== rows[0].length || row.some(word => !word))) {
      throw new Error('Invalid charades translations for ' + id);
    }
    const words = rows[0].map((_, index) => Object.fromEntries(
      LANGUAGES.map(([lang], langIndex) => [lang, rows[langIndex][index]])
    ));
    decks.push({ id, emoji, names: { en: enName, ja: jaName }, words });
  }
  deck('animals','🐾','Animals','動物', `
cat|dog|rabbit|lion|elephant|monkey|penguin|dolphin|tiger|cow|horse|butterfly
猫|犬|ウサギ|ライオン|ゾウ|サル|ペンギン|イルカ|トラ|牛|馬|蝶
gato|perro|conejo|león|elefante|mono|pingüino|delfín|tigre|vaca|caballo|mariposa
gato|cachorro|coelho|leão|elefante|macaco|pinguim|golfinho|tigre|vaca|cavalo|borboleta
chat|chien|lapin|lion|éléphant|singe|manchot|dauphin|tigre|vache|cheval|papillon
Katze|Hund|Kaninchen|Löwe|Elefant|Affe|Pinguin|Delfin|Tiger|Kuh|Pferd|Schmetterling
고양이|개|토끼|사자|코끼리|원숭이|펭귄|돌고래|호랑이|소|말|나비
猫|狗|兔子|狮子|大象|猴子|企鹅|海豚|老虎|奶牛|马|蝴蝶
`);
  deck('food','🍕','Food','食べ物', `
pizza|sushi|hamburger|noodles|rice|salad|cake|ice cream|sandwich|curry|soup|bread
ピザ|寿司|ハンバーガー|麺|ご飯|サラダ|ケーキ|アイスクリーム|サンドイッチ|カレー|スープ|パン
pizza|sushi|hamburguesa|fideos|arroz|ensalada|pastel|helado|sándwich|curry|sopa|pan
pizza|sushi|hambúrguer|macarrão|arroz|salada|bolo|sorvete|sanduíche|curry|sopa|pão
pizza|sushi|hamburger|nouilles|riz|salade|gâteau|glace|sandwich|curry|soupe|pain
Pizza|Sushi|Hamburger|Nudeln|Reis|Salat|Kuchen|Eis|Sandwich|Curry|Suppe|Brot
피자|초밥|햄버거|국수|밥|샐러드|케이크|아이스크림|샌드위치|카레|수프|빵
披萨|寿司|汉堡包|面条|米饭|沙拉|蛋糕|冰淇淋|三明治|咖喱|汤|面包
`);
  deck('jobs','🧑‍🚒','Jobs','職業', `
teacher|doctor|nurse|firefighter|chef|police officer|pilot|farmer|musician|artist|scientist|photographer
教師|医師|看護師|消防士|料理人|警察官|パイロット|農家|音楽家|画家|科学者|写真家
profesor|médico|enfermera|bombero|cocinero|policía|piloto|agricultor|músico|artista|científico|fotógrafo
professor|médico|enfermeira|bombeiro|cozinheiro|policial|piloto|agricultor|músico|artista|cientista|fotógrafo
professeur|médecin|infirmière|pompier|cuisinier|policier|pilote|agriculteur|musicien|artiste|scientifique|photographe
Lehrer|Arzt|Pflegekraft|Feuerwehrmann|Koch|Polizist|Pilot|Landwirt|Musiker|Künstler|Wissenschaftler|Fotograf
선생님|의사|간호사|소방관|요리사|경찰관|조종사|농부|음악가|화가|과학자|사진작가
老师|医生|护士|消防员|厨师|警察|飞行员|农民|音乐家|画家|科学家|摄影师
`);
  deck('sports','⚽','Sports','スポーツ', `
soccer|basketball|tennis|baseball|volleyball|swimming|running|cycling|boxing|skiing|golf|badminton
サッカー|バスケットボール|テニス|野球|バレーボール|水泳|ランニング|サイクリング|ボクシング|スキー|ゴルフ|バドミントン
fútbol|baloncesto|tenis|béisbol|voleibol|natación|correr|ciclismo|boxeo|esquí|golf|bádminton
futebol|basquete|tênis|beisebol|vôlei|natação|corrida|ciclismo|boxe|esqui|golfe|badminton
football|basket-ball|tennis|base-ball|volley-ball|natation|course|cyclisme|boxe|ski|golf|badminton
Fußball|Basketball|Tennis|Baseball|Volleyball|Schwimmen|Laufen|Radfahren|Boxen|Skifahren|Golf|Badminton
축구|농구|테니스|야구|배구|수영|달리기|자전거 타기|복싱|스키|골프|배드민턴
足球|篮球|网球|棒球|排球|游泳|跑步|骑自行车|拳击|滑雪|高尔夫|羽毛球
`);
  deck('actions','🤸','Actions','動作', `
jump|dance|sing|sleep|laugh|cry|cook|read|write|swim|run|clap
ジャンプする|踊る|歌う|寝る|笑う|泣く|料理する|読む|書く|泳ぐ|走る|拍手する
saltar|bailar|cantar|dormir|reír|llorar|cocinar|leer|escribir|nadar|correr|aplaudir
pular|dançar|cantar|dormir|rir|chorar|cozinhar|ler|escrever|nadar|correr|aplaudir
sauter|danser|chanter|dormir|rire|pleurer|cuisiner|lire|écrire|nager|courir|applaudir
springen|tanzen|singen|schlafen|lachen|weinen|kochen|lesen|schreiben|schwimmen|laufen|klatschen
점프하기|춤추기|노래하기|잠자기|웃기|울기|요리하기|읽기|쓰기|수영하기|달리기|박수치기
跳跃|跳舞|唱歌|睡觉|大笑|哭泣|做饭|阅读|写字|游泳|跑步|鼓掌
`);
  deck('emotions','🎭','Emotions','感情', `
happy|sad|angry|surprised|nervous|excited|bored|afraid|proud|confused|shy|tired
幸せ|悲しい|怒っている|驚いた|緊張している|ワクワクしている|退屈|怖い|誇らしい|混乱した|恥ずかしい|疲れた
feliz|triste|enfadado|sorprendido|nervioso|emocionado|aburrido|asustado|orgulloso|confundido|tímido|cansado
feliz|triste|com raiva|surpreso|nervoso|animado|entediado|com medo|orgulhoso|confuso|tímido|cansado
heureux|triste|en colère|surpris|nerveux|enthousiaste|ennuyé|effrayé|fier|perdu|timide|fatigué
glücklich|traurig|wütend|überrascht|nervös|aufgeregt|gelangweilt|ängstlich|stolz|verwirrt|schüchtern|müde
행복한|슬픈|화난|놀란|긴장한|신난|지루한|무서운|자랑스러운|혼란스러운|수줍은|피곤한
开心|难过|生气|惊讶|紧张|兴奋|无聊|害怕|自豪|困惑|害羞|疲惫
`);
  deck('objects','🎒','Objects','身近な物', `
umbrella|key|clock|camera|backpack|glasses|scissors|phone|toothbrush|book|chair|bottle
傘|鍵|時計|カメラ|リュック|メガネ|はさみ|電話|歯ブラシ|本|椅子|ボトル
paraguas|llave|reloj|cámara|mochila|gafas|tijeras|teléfono|cepillo de dientes|libro|silla|botella
guarda-chuva|chave|relógio|câmera|mochila|óculos|tesoura|telefone|escova de dentes|livro|cadeira|garrafa
parapluie|clé|horloge|appareil photo|sac à dos|lunettes|ciseaux|téléphone|brosse à dents|livre|chaise|bouteille
Regenschirm|Schlüssel|Uhr|Kamera|Rucksack|Brille|Schere|Telefon|Zahnbürste|Buch|Stuhl|Flasche
우산|열쇠|시계|카메라|배낭|안경|가위|전화기|칫솔|책|의자|병
雨伞|钥匙|时钟|相机|背包|眼镜|剪刀|电话|牙刷|书|椅子|瓶子
`);
  deck('school','✏️','School','学校', `
pencil|notebook|exam|homework|library|classroom|dictionary|ruler|eraser|blackboard|school bus|lunchbox
鉛筆|ノート|試験|宿題|図書館|教室|辞書|定規|消しゴム|黒板|スクールバス|弁当箱
lápiz|cuaderno|examen|tarea|biblioteca|aula|diccionario|regla|goma|pizarra|autobús escolar|lonchera
lápis|caderno|prova|lição de casa|biblioteca|sala de aula|dicionário|régua|borracha|quadro-negro|ônibus escolar|lancheira
crayon|cahier|examen|devoirs|bibliothèque|salle de classe|dictionnaire|règle|gomme|tableau noir|bus scolaire|boîte à déjeuner
Bleistift|Heft|Prüfung|Hausaufgaben|Bibliothek|Klassenzimmer|Wörterbuch|Lineal|Radiergummi|Tafel|Schulbus|Brotdose
연필|공책|시험|숙제|도서관|교실|사전|자|지우개|칠판|통학버스|도시락
铅笔|笔记本|考试|作业|图书馆|教室|词典|尺子|橡皮|黑板|校车|饭盒
`);
  deck('transport','🚆','Transport','乗り物', `
airplane|train|bicycle|bus|taxi|car|ship|boat|motorcycle|helicopter|subway|rocket
飛行機|電車|自転車|バス|タクシー|車|船|ボート|バイク|ヘリコプター|地下鉄|ロケット
avión|tren|bicicleta|autobús|taxi|coche|barco|bote|motocicleta|helicóptero|metro|cohete
avião|trem|bicicleta|ônibus|táxi|carro|navio|barco|motocicleta|helicóptero|metrô|foguete
avion|train|vélo|bus|taxi|voiture|navire|bateau|moto|hélicoptère|métro|fusée
Flugzeug|Zug|Fahrrad|Bus|Taxi|Auto|Schiff|Boot|Motorrad|Hubschrauber|U-Bahn|Rakete
비행기|기차|자전거|버스|택시|자동차|배|보트|오토바이|헬리콥터|지하철|로켓
飞机|火车|自行车|公交车|出租车|汽车|轮船|小船|摩托车|直升机|地铁|火箭
`);
  deck('travel','🧳','Travel','旅行', `
passport|suitcase|hotel|airport|beach|museum|map|ticket|tour guide|souvenir|station|camping
パスポート|スーツケース|ホテル|空港|ビーチ|博物館|地図|チケット|観光ガイド|お土産|駅|キャンプ
pasaporte|maleta|hotel|aeropuerto|playa|museo|mapa|billete|guía turístico|recuerdo|estación|campamento
passaporte|mala|hotel|aeroporto|praia|museu|mapa|bilhete|guia turístico|lembrança|estação|acampamento
passeport|valise|hôtel|aéroport|plage|musée|carte|billet|guide touristique|souvenir|gare|camping
Reisepass|Koffer|Hotel|Flughafen|Strand|Museum|Karte|Ticket|Reiseführer|Souvenir|Bahnhof|Camping
여권|여행 가방|호텔|공항|해변|박물관|지도|표|관광 가이드|기념품|역|캠핑
护照|行李箱|酒店|机场|海滩|博物馆|地图|车票|导游|纪念品|车站|露营
`);
  deck('weather','🌦️','Weather','天気', `
rain|snow|sunshine|wind|thunder|rainbow|fog|storm|umbrella|cloud|heat|ice
雨|雪|日差し|風|雷|虹|霧|嵐|傘|雲|暑さ|氷
lluvia|nieve|sol|viento|trueno|arcoíris|niebla|tormenta|paraguas|nube|calor|hielo
chuva|neve|sol|vento|trovão|arco-íris|neblina|tempestade|guarda-chuva|nuvem|calor|gelo
pluie|neige|soleil|vent|tonnerre|arc-en-ciel|brouillard|tempête|parapluie|nuage|chaleur|glace
Regen|Schnee|Sonnenschein|Wind|Donner|Regenbogen|Nebel|Sturm|Regenschirm|Wolke|Hitze|Eis
비|눈|햇빛|바람|천둥|무지개|안개|폭풍|우산|구름|더위|얼음
雨|雪|阳光|风|雷声|彩虹|雾|暴风雨|雨伞|云|炎热|冰
`);
  deck('nature','🌿','Nature','自然', `
mountain|river|ocean|forest|waterfall|desert|volcano|island|tree|flower|lake|cave
山|川|海|森|滝|砂漠|火山|島|木|花|湖|洞窟
montaña|río|océano|bosque|cascada|desierto|volcán|isla|árbol|flor|lago|cueva
montanha|rio|oceano|floresta|cachoeira|deserto|vulcão|ilha|árvore|flor|lago|caverna
montagne|rivière|océan|forêt|cascade|désert|volcan|île|arbre|fleur|lac|grotte
Berg|Fluss|Ozean|Wald|Wasserfall|Wüste|Vulkan|Insel|Baum|Blume|See|Höhle
산|강|바다|숲|폭포|사막|화산|섬|나무|꽃|호수|동굴
山|河流|海洋|森林|瀑布|沙漠|火山|岛屿|树|花|湖泊|洞穴
`);
  deck('music','🎵','Music','音楽', `
guitar|piano|violin|drums|trumpet|flute|microphone|singer|concert|orchestra|DJ|headphones
ギター|ピアノ|バイオリン|ドラム|トランペット|フルート|マイク|歌手|コンサート|オーケストラ|DJ|ヘッドホン
guitarra|piano|violín|batería|trompeta|flauta|micrófono|cantante|concierto|orquesta|DJ|auriculares
violão|piano|violino|bateria|trompete|flauta|microfone|cantor|show|orquestra|DJ|fones de ouvido
guitare|piano|violon|batterie|trompette|flûte|micro|chanteur|concert|orchestre|DJ|casque audio
Gitarre|Klavier|Geige|Schlagzeug|Trompete|Flöte|Mikrofon|Sänger|Konzert|Orchester|DJ|Kopfhörer
기타|피아노|바이올린|드럼|트럼펫|플루트|마이크|가수|콘서트|오케스트라|DJ|헤드폰
吉他|钢琴|小提琴|架子鼓|小号|长笛|麦克风|歌手|演唱会|管弦乐队|DJ|耳机
`);
  deck('movies','🎬','Movie Characters','映画の登場人物', `
hero|villain|robot|alien|princess|detective|pirate|monster|wizard|ninja|astronaut|cowboy
ヒーロー|悪役|ロボット|宇宙人|お姫様|探偵|海賊|怪物|魔法使い|忍者|宇宙飛行士|カウボーイ
héroe|villano|robot|extraterrestre|princesa|detective|pirata|monstruo|mago|ninja|astronauta|vaquero
herói|vilão|robô|alienígena|princesa|detetive|pirata|monstro|mago|ninja|astronauta|caubói
héros|méchant|robot|extraterrestre|princesse|détective|pirate|monstre|magicien|ninja|astronaute|cow-boy
Held|Bösewicht|Roboter|Außerirdischer|Prinzessin|Detektiv|Pirat|Monster|Zauberer|Ninja|Astronaut|Cowboy
영웅|악당|로봇|외계인|공주|탐정|해적|괴물|마법사|닌자|우주비행사|카우보이
英雄|反派|机器人|外星人|公主|侦探|海盗|怪物|魔法师|忍者|宇航员|牛仔
`);
  deck('technology','💻','Technology','テクノロジー', `
computer|smartphone|robot|drone|keyboard|mouse|camera|charger|headphones|tablet|printer|smartwatch
パソコン|スマートフォン|ロボット|ドローン|キーボード|マウス|カメラ|充電器|ヘッドホン|タブレット|プリンター|スマートウォッチ
computadora|teléfono inteligente|robot|dron|teclado|ratón|cámara|cargador|auriculares|tableta|impresora|reloj inteligente
computador|celular|robô|drone|teclado|mouse|câmera|carregador|fones de ouvido|tablet|impressora|relógio inteligente
ordinateur|smartphone|robot|drone|clavier|souris|appareil photo|chargeur|casque|tablette|imprimante|montre connectée
Computer|Smartphone|Roboter|Drohne|Tastatur|Maus|Kamera|Ladegerät|Kopfhörer|Tablet|Drucker|Smartwatch
컴퓨터|스마트폰|로봇|드론|키보드|마우스|카메라|충전기|헤드폰|태블릿|프린터|스마트워치
电脑|智能手机|机器人|无人机|键盘|鼠标|相机|充电器|耳机|平板电脑|打印机|智能手表
`);
  deck('science','🔬','Science','科学', `
microscope|telescope|magnet|battery|laboratory|experiment|dinosaur|fossil|planet|atom|volcano|skeleton
顕微鏡|望遠鏡|磁石|電池|研究室|実験|恐竜|化石|惑星|原子|火山|骨格
microscopio|telescopio|imán|pila|laboratorio|experimento|dinosaurio|fósil|planeta|átomo|volcán|esqueleto
microscópio|telescópio|ímã|pilha|laboratório|experimento|dinossauro|fóssil|planeta|átomo|vulcão|esqueleto
microscope|télescope|aimant|pile|laboratoire|expérience|dinosaure|fossile|planète|atome|volcan|squelette
Mikroskop|Teleskop|Magnet|Batterie|Labor|Experiment|Dinosaurier|Fossil|Planet|Atom|Vulkan|Skelett
현미경|망원경|자석|배터리|실험실|실험|공룡|화석|행성|원자|화산|해골
显微镜|望远镜|磁铁|电池|实验室|实验|恐龙|化石|行星|原子|火山|骨架
`);
  // INSERT_MORE_DECKS_HERE
  const catalog = Object.freeze({ languages: LANGUAGES, decks });
  if (typeof module !== 'undefined' && module.exports) module.exports = catalog;
  root.CHARADES_DATA = catalog;
})(typeof window !== 'undefined' ? window : globalThis);
