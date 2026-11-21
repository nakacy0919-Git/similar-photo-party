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
  deck('space','🪐','Space','宇宙', `
sun|moon|earth|Mars|Jupiter|Saturn|star|galaxy|comet|astronaut|spaceship|black hole
太陽|月|地球|火星|木星|土星|星|銀河|彗星|宇宙飛行士|宇宙船|ブラックホール
sol|luna|Tierra|Marte|Júpiter|Saturno|estrella|galaxia|cometa|astronauta|nave espacial|agujero negro
sol|lua|Terra|Marte|Júpiter|Saturno|estrela|galáxia|cometa|astronauta|nave espacial|buraco negro
soleil|lune|Terre|Mars|Jupiter|Saturne|étoile|galaxie|comète|astronaute|vaisseau spatial|trou noir
Sonne|Mond|Erde|Mars|Jupiter|Saturn|Stern|Galaxie|Komet|Astronaut|Raumschiff|Schwarzes Loch
태양|달|지구|화성|목성|토성|별|은하|혜성|우주비행사|우주선|블랙홀
太阳|月亮|地球|火星|木星|土星|星星|银河系|彗星|宇航员|宇宙飞船|黑洞
`);
  deck('fantasy','🧙','Fantasy','ファンタジー', `
dragon|unicorn|fairy|mermaid|wizard|witch|castle|treasure|magic wand|giant|ghost|elf
ドラゴン|ユニコーン|妖精|人魚|魔法使い|魔女|城|宝物|魔法の杖|巨人|幽霊|エルフ
dragón|unicornio|hada|sirena|mago|bruja|castillo|tesoro|varita mágica|gigante|fantasma|elfo
dragão|unicórnio|fada|sereia|mago|bruxa|castelo|tesouro|varinha mágica|gigante|fantasma|elfo
dragon|licorne|fée|sirène|sorcier|sorcière|château|trésor|baguette magique|géant|fantôme|elfe
Drache|Einhorn|Fee|Meerjungfrau|Zauberer|Hexe|Schloss|Schatz|Zauberstab|Riese|Geist|Elf
용|유니콘|요정|인어|마법사|마녀|성|보물|마법 지팡이|거인|유령|엘프
龙|独角兽|仙女|美人鱼|巫师|女巫|城堡|宝藏|魔杖|巨人|幽灵|精灵
`);
  deck('holidays','🎉','Celebrations','お祝い', `
birthday|Christmas|Halloween|New Year|wedding|fireworks|gift|party|cake|candle|balloon|costume
誕生日|クリスマス|ハロウィーン|新年|結婚式|花火|プレゼント|パーティー|ケーキ|ろうそく|風船|仮装
cumpleaños|Navidad|Halloween|Año Nuevo|boda|fuegos artificiales|regalo|fiesta|pastel|vela|globo|disfraz
aniversário|Natal|Halloween|Ano Novo|casamento|fogos de artifício|presente|festa|bolo|vela|balão|fantasia
anniversaire|Noël|Halloween|Nouvel An|mariage|feu d'artifice|cadeau|fête|gâteau|bougie|ballon|déguisement
Geburtstag|Weihnachten|Halloween|Neujahr|Hochzeit|Feuerwerk|Geschenk|Party|Kuchen|Kerze|Luftballon|Kostüm
생일|크리스마스|핼러윈|새해|결혼식|불꽃놀이|선물|파티|케이크|양초|풍선|의상
生日|圣诞节|万圣节|新年|婚礼|烟花|礼物|派对|蛋糕|蜡烛|气球|服装
`);
  deck('clothes','👗','Clothes','服装', `
hat|shoes|jacket|shirt|dress|socks|gloves|scarf|sunglasses|boots|uniform|pajamas
帽子|靴|ジャケット|シャツ|ドレス|靴下|手袋|マフラー|サングラス|ブーツ|制服|パジャマ
sombrero|zapatos|chaqueta|camisa|vestido|calcetines|guantes|bufanda|gafas de sol|botas|uniforme|pijama
chapéu|sapatos|jaqueta|camisa|vestido|meias|luvas|cachecol|óculos de sol|botas|uniforme|pijama
chapeau|chaussures|veste|chemise|robe|chaussettes|gants|écharpe|lunettes de soleil|bottes|uniforme|pyjama
Hut|Schuhe|Jacke|Hemd|Kleid|Socken|Handschuhe|Schal|Sonnenbrille|Stiefel|Uniform|Schlafanzug
모자|신발|재킷|셔츠|드레스|양말|장갑|목도리|선글라스|부츠|교복|잠옷
帽子|鞋子|夹克|衬衫|连衣裙|袜子|手套|围巾|太阳镜|靴子|制服|睡衣
`);
  deck('hobbies','🎨','Hobbies','趣味', `
drawing|painting|fishing|gardening|knitting|photography|hiking|reading|dancing|cooking|chess|video games
絵を描く|絵の具で描く|釣り|園芸|編み物|写真撮影|ハイキング|読書|ダンス|料理|チェス|テレビゲーム
dibujar|pintar|pescar|jardinería|tejer|fotografía|senderismo|leer|bailar|cocinar|ajedrez|videojuegos
desenhar|pintar|pescar|jardinagem|tricô|fotografia|caminhada|leitura|dança|culinária|xadrez|videogames
dessin|peinture|pêche|jardinage|tricot|photographie|randonnée|lecture|danse|cuisine|échecs|jeux vidéo
Zeichnen|Malen|Angeln|Gärtnern|Stricken|Fotografieren|Wandern|Lesen|Tanzen|Kochen|Schach|Videospiele
그림 그리기|그림 물감으로 그리기|낚시|정원 가꾸기|뜨개질|사진 촬영|등산|독서|춤추기|요리|체스|비디오 게임
画画|绘画|钓鱼|园艺|编织|摄影|徒步旅行|阅读|跳舞|烹饪|国际象棋|电子游戏
`);
  deck('places','🏙️','Places','場所', `
hospital|school|park|restaurant|supermarket|zoo|stadium|theater|airport|library|museum|bakery
病院|学校|公園|レストラン|スーパー|動物園|スタジアム|劇場|空港|図書館|博物館|パン屋
hospital|escuela|parque|restaurante|supermercado|zoológico|estadio|teatro|aeropuerto|biblioteca|museo|panadería
hospital|escola|parque|restaurante|supermercado|zoológico|estádio|teatro|aeroporto|biblioteca|museu|padaria
hôpital|école|parc|restaurant|supermarché|zoo|stade|théâtre|aéroport|bibliothèque|musée|boulangerie
Krankenhaus|Schule|Park|Restaurant|Supermarkt|Zoo|Stadion|Theater|Flughafen|Bibliothek|Museum|Bäckerei
병원|학교|공원|식당|슈퍼마켓|동물원|경기장|극장|공항|도서관|박물관|빵집
医院|学校|公园|餐厅|超市|动物园|体育场|剧院|机场|图书馆|博物馆|面包店
`);
  deck('body','🖐️','Body Parts','体', `
head|eyes|ears|nose|mouth|hands|legs|feet|shoulders|knees|fingers|heart
頭|目|耳|鼻|口|手|脚|足|肩|膝|指|心臓
cabeza|ojos|orejas|nariz|boca|manos|piernas|pies|hombros|rodillas|dedos|corazón
cabeça|olhos|orelhas|nariz|boca|mãos|pernas|pés|ombros|joelhos|dedos|coração
tête|yeux|oreilles|nez|bouche|mains|jambes|pieds|épaules|genoux|doigts|cœur
Kopf|Augen|Ohren|Nase|Mund|Hände|Beine|Füße|Schultern|Knie|Finger|Herz
머리|눈|귀|코|입|손|다리|발|어깨|무릎|손가락|심장
头|眼睛|耳朵|鼻子|嘴巴|手|腿|脚|肩膀|膝盖|手指|心脏
`);
  deck('daily','☀️','Daily Life','日常生活', `
wake up|brush teeth|wash hands|take a shower|eat breakfast|catch a bus|study|clean a room|go shopping|watch TV|do laundry|go to bed
起きる|歯を磨く|手を洗う|シャワーを浴びる|朝食を食べる|バスに乗る|勉強する|部屋を掃除する|買い物に行く|テレビを見る|洗濯する|寝る
despertarse|cepillarse los dientes|lavarse las manos|ducharse|desayunar|tomar el autobús|estudiar|limpiar la habitación|ir de compras|ver la televisión|lavar la ropa|acostarse
acordar|escovar os dentes|lavar as mãos|tomar banho|tomar café da manhã|pegar o ônibus|estudar|limpar o quarto|fazer compras|assistir TV|lavar roupa|ir dormir
se réveiller|se brosser les dents|se laver les mains|se doucher|prendre le petit-déjeuner|prendre le bus|étudier|nettoyer sa chambre|faire les courses|regarder la télé|faire la lessive|se coucher
aufwachen|Zähne putzen|Hände waschen|duschen|frühstücken|Bus fahren|lernen|Zimmer aufräumen|einkaufen gehen|fernsehen|Wäsche waschen|schlafen gehen
일어나기|양치하기|손 씻기|샤워하기|아침 먹기|버스 타기|공부하기|방 청소하기|쇼핑하기|TV 보기|빨래하기|잠자리에 들기
起床|刷牙|洗手|洗澡|吃早餐|乘公交车|学习|打扫房间|去购物|看电视|洗衣服|上床睡觉
`);
  deck('funny','🤣','Funny Acting','おもしろ演技', `
walk like a penguin|act like a robot|dance like a chicken|pretend to sneeze|fake a yawn|hop on one foot|pretend to fly|touch an invisible wall|pretend to slip|pretend to sleep|make a silly face|walk in slow motion
ペンギンのように歩く|ロボットのまね|ニワトリダンス|くしゃみのふり|あくびのふり|片足跳び|飛ぶふり|見えない壁に触る|滑るふり|寝たふり|変顔をする|スローモーションで歩く
caminar como pingüino|actuar como robot|bailar como gallina|fingir un estornudo|fingir un bostezo|saltar en un pie|fingir que vuelas|tocar una pared invisible|fingir que resbalas|fingir que duermes|poner cara graciosa|caminar a cámara lenta
andar como pinguim|imitar um robô|dançar como galinha|fingir espirrar|fingir bocejar|pular com um pé|fingir voar|tocar uma parede invisível|fingir escorregar|fingir dormir|fazer careta|andar em câmera lenta
marcher comme un pingouin|imiter un robot|danser comme une poule|faire semblant d'éternuer|faire semblant de bâiller|sauter à cloche-pied|faire semblant de voler|toucher un mur invisible|faire semblant de glisser|faire semblant de dormir|faire une grimace|marcher au ralenti
wie ein Pinguin laufen|Roboter spielen|wie ein Huhn tanzen|Niesen vortäuschen|Gähnen vortäuschen|auf einem Bein hüpfen|Fliegen spielen|eine unsichtbare Wand berühren|Ausrutschen spielen|Schlafen spielen|eine Grimasse schneiden|in Zeitlupe gehen
펭귄처럼 걷기|로봇 흉내 내기|닭처럼 춤추기|재채기하는 척하기|하품하는 척하기|한 발로 뛰기|나는 척하기|보이지 않는 벽 만지기|미끄러지는 척하기|자는 척하기|웃긴 표정 짓기|슬로 모션으로 걷기
像企鹅一样走路|模仿机器人|像鸡一样跳舞|假装打喷嚏|假装打哈欠|单脚跳|假装飞翔|触摸看不见的墙|假装滑倒|假装睡觉|做鬼脸|慢动作走路
`);
  deck('history','🏰','History','歴史', `
king|queen|knight|samurai|pirate|explorer|emperor|castle|temple|pyramid|ancient city|crown
王様|女王|騎士|侍|海賊|探検家|皇帝|城|寺院|ピラミッド|古代都市|王冠
rey|reina|caballero|samurái|pirata|explorador|emperador|castillo|templo|pirámide|ciudad antigua|corona
rei|rainha|cavaleiro|samurai|pirata|explorador|imperador|castelo|templo|pirâmide|cidade antiga|coroa
roi|reine|chevalier|samouraï|pirate|explorateur|empereur|château|temple|pyramide|ville antique|couronne
König|Königin|Ritter|Samurai|Pirat|Entdecker|Kaiser|Burg|Tempel|Pyramide|antike Stadt|Krone
왕|여왕|기사|사무라이|해적|탐험가|황제|성|사원|피라미드|고대 도시|왕관
国王|女王|骑士|武士|海盗|探险家|皇帝|城堡|寺庙|金字塔|古城|王冠
`);
  deck('games','🎲','Games','ゲーム', `
chess|playing cards|dice|puzzle|video game|board game|hide and seek|tag|treasure hunt|bowling|darts|jigsaw puzzle
チェス|トランプ|サイコロ|パズル|テレビゲーム|ボードゲーム|かくれんぼ|鬼ごっこ|宝探し|ボウリング|ダーツ|ジグソーパズル
ajedrez|naipes|dados|rompecabezas|videojuego|juego de mesa|escondite|pilla-pilla|búsqueda del tesoro|bolos|dardos|puzle
xadrez|baralho|dados|quebra-cabeça|videogame|jogo de tabuleiro|esconde-esconde|pega-pega|caça ao tesouro|boliche|dardos|quebra-cabeça de peças
échecs|cartes|dés|casse-tête|jeu vidéo|jeu de société|cache-cache|chat|chasse au trésor|bowling|fléchettes|puzzle
Schach|Spielkarten|Würfel|Rätsel|Videospiel|Brettspiel|Verstecken|Fangen|Schatzsuche|Bowling|Darts|Puzzle
체스|트럼프 카드|주사위|퍼즐|비디오 게임|보드게임|숨바꼭질|술래잡기|보물찾기|볼링|다트|직소 퍼즐
国际象棋|扑克牌|骰子|谜题|电子游戏|桌游|捉迷藏|抓人游戏|寻宝|保龄球|飞镖|拼图
`);
  deck('home','🏠','Home','家', `
bed|sofa|table|refrigerator|washing machine|lamp|mirror|pillow|stairs|kitchen|bathroom|window
ベッド|ソファ|テーブル|冷蔵庫|洗濯機|ランプ|鏡|枕|階段|キッチン|浴室|窓
cama|sofá|mesa|nevera|lavadora|lámpara|espejo|almohada|escaleras|cocina|baño|ventana
cama|sofá|mesa|geladeira|máquina de lavar|lâmpada|espelho|travesseiro|escada|cozinha|banheiro|janela
lit|canapé|table|réfrigérateur|machine à laver|lampe|miroir|oreiller|escalier|cuisine|salle de bains|fenêtre
Bett|Sofa|Tisch|Kühlschrank|Waschmaschine|Lampe|Spiegel|Kissen|Treppe|Küche|Badezimmer|Fenster
침대|소파|탁자|냉장고|세탁기|램프|거울|베개|계단|부엌|욕실|창문
床|沙发|桌子|冰箱|洗衣机|台灯|镜子|枕头|楼梯|厨房|浴室|窗户
`);
  deck('fruits','🥝','Fruit & Vegetables','果物と野菜', `
apple|banana|orange|strawberry|pineapple|watermelon|grapes|lemon|peach|mango|carrot|potato
りんご|バナナ|オレンジ|いちご|パイナップル|スイカ|ぶどう|レモン|桃|マンゴー|にんじん|じゃがいも
manzana|plátano|naranja|fresa|piña|sandía|uvas|limón|melocotón|mango|zanahoria|patata
maçã|banana|laranja|morango|abacaxi|melancia|uvas|limão|pêssego|manga|cenoura|batata
pomme|banane|orange|fraise|ananas|pastèque|raisins|citron|pêche|mangue|carotte|pomme de terre
Apfel|Banane|Orange|Erdbeere|Ananas|Wassermelone|Trauben|Zitrone|Pfirsich|Mango|Karotte|Kartoffel
사과|바나나|오렌지|딸기|파인애플|수박|포도|레몬|복숭아|망고|당근|감자
苹果|香蕉|橙子|草莓|菠萝|西瓜|葡萄|柠檬|桃子|芒果|胡萝卜|土豆
`);
  deck('community','🏘️','Community','地域社会', `
post office|crosswalk|bus stop|city hall|hospital|police station|fire station|market|playground|train station|community center|recycling bin
郵便局|横断歩道|バス停|市役所|病院|警察署|消防署|市場|遊び場|駅|公民館|リサイクル箱
oficina de correos|paso de peatones|parada de autobús|ayuntamiento|hospital|comisaría|estación de bomberos|mercado|parque infantil|estación de tren|centro comunitario|contenedor de reciclaje
correios|faixa de pedestres|ponto de ônibus|prefeitura|hospital|delegacia|quartel de bombeiros|mercado|parquinho|estação de trem|centro comunitário|lixeira de reciclagem
bureau de poste|passage piéton|arrêt de bus|mairie|hôpital|commissariat|caserne de pompiers|marché|aire de jeux|gare|centre communautaire|bac de recyclage
Postamt|Zebrastreifen|Bushaltestelle|Rathaus|Krankenhaus|Polizeiwache|Feuerwache|Markt|Spielplatz|Bahnhof|Gemeindezentrum|Recyclingbehälter
우체국|횡단보도|버스 정류장|시청|병원|경찰서|소방서|시장|놀이터|기차역|주민센터|재활용 쓰레기통
邮局|人行横道|公交站|市政府|医院|警察局|消防站|市场|游乐场|火车站|社区中心|回收箱
`);
  deck('culture','🌏','World Cultures','世界の文化', `
kimono|sari|flamenco|samba|taekwondo|origami|yoga|tea ceremony|carnival|festival|drum dance|mask
着物|サリー|フラメンコ|サンバ|テコンドー|折り紙|ヨガ|茶道|カーニバル|祭り|太鼓踊り|仮面
kimono|sari|flamenco|samba|taekwondo|origami|yoga|ceremonia del té|carnaval|festival|baile de tambores|máscara
quimono|sári|flamenco|samba|taekwondo|origami|ioga|cerimônia do chá|carnaval|festival|dança dos tambores|máscara
kimono|sari|flamenco|samba|taekwondo|origami|yoga|cérémonie du thé|carnaval|festival|danse du tambour|masque
Kimono|Sari|Flamenco|Samba|Taekwondo|Origami|Yoga|Teezeremonie|Karneval|Fest|Trommeltanz|Maske
기모노|사리|플라멩코|삼바|태권도|종이접기|요가|다도|카니발|축제|북춤|가면
和服|纱丽|弗拉门戈|桑巴舞|跆拳道|折纸|瑜伽|茶道|狂欢节|节日|鼓舞|面具
`);
  deck('sea','🐠','Sea Life','海の生き物', `
fish|shark|octopus|whale|dolphin|sea turtle|crab|jellyfish|seahorse|starfish|seal|penguin
魚|サメ|タコ|クジラ|イルカ|ウミガメ|カニ|クラゲ|タツノオトシゴ|ヒトデ|アザラシ|ペンギン
pez|tiburón|pulpo|ballena|delfín|tortuga marina|cangrejo|medusa|caballito de mar|estrella de mar|foca|pingüino
peixe|tubarão|polvo|baleia|golfinho|tartaruga marinha|caranguejo|água-viva|cavalo-marinho|estrela-do-mar|foca|pinguim
poisson|requin|pieuvre|baleine|dauphin|tortue marine|crabe|méduse|hippocampe|étoile de mer|phoque|manchot
Fisch|Hai|Krake|Wal|Delfin|Meeresschildkröte|Krabbe|Qualle|Seepferdchen|Seestern|Robbe|Pinguin
물고기|상어|문어|고래|돌고래|바다거북|게|해파리|해마|불가사리|물개|펭귄
鱼|鲨鱼|章鱼|鲸鱼|海豚|海龟|螃蟹|水母|海马|海星|海豹|企鹅
`);

  const catalog = Object.freeze({ languages: LANGUAGES, decks });
  if (typeof module !== 'undefined' && module.exports) module.exports = catalog;
  root.CHARADES_DATA = catalog;
})(typeof window !== 'undefined' ? window : globalThis);
