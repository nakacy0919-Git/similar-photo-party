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


  // Expansion pack A: animals and food, with every prompt translated into all eight languages.
  deck('birds','🦜','Birds','鳥', `
parrot|owl|eagle|flamingo|peacock|swan|duck|goose|seagull|woodpecker|crow|sparrow
オウム|フクロウ|ワシ|フラミンゴ|クジャク|白鳥|アヒル|ガチョウ|カモメ|キツツキ|カラス|スズメ
loro|búho|águila|flamenco|pavo real|cisne|pato|ganso|gaviota|pájaro carpintero|cuervo|gorrión
papagaio|coruja|águia|flamingo|pavão|cisne|pato|ganso|gaivota|pica-pau|corvo|pardal
perroquet|hibou|aigle|flamant rose|paon|cygne|canard|oie|mouette|pic-vert|corbeau|moineau
Papagei|Eule|Adler|Flamingo|Pfau|Schwan|Ente|Gans|Möwe|Specht|Krähe|Spatz
앵무새|부엉이|독수리|플라밍고|공작|백조|오리|거위|갈매기|딱따구리|까마귀|참새
鹦鹉|猫头鹰|老鹰|火烈鸟|孔雀|天鹅|鸭子|鹅|海鸥|啄木鸟|乌鸦|麻雀
`);
  deck('insects','🐝','Insects','昆虫', `
ant|bee|mosquito|grasshopper|dragonfly|ladybug|beetle|moth|caterpillar|firefly|praying mantis|cricket
アリ|ハチ|蚊|バッタ|トンボ|テントウムシ|カブトムシ|ガ|イモムシ|ホタル|カマキリ|コオロギ
hormiga|abeja|mosquito|saltamontes|libélula|mariquita|escarabajo|polilla|oruga|luciérnaga|mantis religiosa|grillo
formiga|abelha|mosquito|gafanhoto|libélula|joaninha|besouro|mariposa|lagarta|vaga-lume|louva-a-deus|grilo
fourmi|abeille|moustique|sauterelle|libellule|coccinelle|scarabée|papillon de nuit|chenille|luciole|mante religieuse|grillon
Ameise|Biene|Mücke|Heuschrecke|Libelle|Marienkäfer|Käfer|Motte|Raupe|Glühwürmchen|Gottesanbeterin|Grille
개미|벌|모기|메뚜기|잠자리|무당벌레|딱정벌레|나방|애벌레|반딧불이|사마귀|귀뚜라미
蚂蚁|蜜蜂|蚊子|蚱蜢|蜻蜓|瓢虫|甲虫|飞蛾|毛毛虫|萤火虫|螳螂|蟋蟀
`);
  deck('farm_actions','🚜','On the Farm','農場の動き', `
milk a cow|feed chickens|drive a tractor|collect eggs|plant seeds|pick apples|ride a horse|water crops|shear a sheep|harvest corn|carry hay|chase a goat
牛の乳を搾る|鶏に餌をやる|トラクターを運転する|卵を集める|種をまく|りんごを収穫する|馬に乗る|作物に水をやる|羊の毛を刈る|トウモロコシを収穫する|干し草を運ぶ|ヤギを追いかける
ordeñar una vaca|alimentar gallinas|conducir un tractor|recoger huevos|sembrar semillas|recoger manzanas|montar a caballo|regar cultivos|esquilar una oveja|cosechar maíz|cargar heno|perseguir una cabra
ordenhar uma vaca|alimentar galinhas|dirigir um trator|recolher ovos|plantar sementes|colher maçãs|andar a cavalo|regar plantações|tosquiar uma ovelha|colher milho|carregar feno|perseguir uma cabra
traire une vache|nourrir des poules|conduire un tracteur|ramasser des œufs|semer des graines|cueillir des pommes|monter à cheval|arroser les cultures|tondre un mouton|récolter du maïs|porter du foin|poursuivre une chèvre
eine Kuh melken|Hühner füttern|Traktor fahren|Eier sammeln|Samen säen|Äpfel pflücken|reiten|Felder bewässern|ein Schaf scheren|Mais ernten|Heu tragen|eine Ziege jagen
젖소 젖 짜기|닭에게 모이 주기|트랙터 운전하기|달걀 모으기|씨앗 심기|사과 따기|말 타기|농작물에 물 주기|양털 깎기|옥수수 수확하기|건초 나르기|염소 쫓아가기
挤牛奶|喂鸡|开拖拉机|捡鸡蛋|播种|摘苹果|骑马|给农作物浇水|剪羊毛|收玉米|搬干草|追山羊
`);
  deck('wildlife','🦒','Wild Animals','野生動物', `
giraffe|zebra|hippopotamus|rhinoceros|crocodile|cheetah|gorilla|kangaroo|koala|panda|camel|bear
キリン|シマウマ|カバ|サイ|ワニ|チーター|ゴリラ|カンガルー|コアラ|パンダ|ラクダ|クマ
jirafa|cebra|hipopótamo|rinoceronte|cocodrilo|guepardo|gorila|canguro|koala|panda|camello|oso
girafa|zebra|hipopótamo|rinoceronte|crocodilo|guepardo|gorila|canguru|coala|panda|camelo|urso
girafe|zèbre|hippopotame|rhinocéros|crocodile|guépard|gorille|kangourou|koala|panda|chameau|ours
Giraffe|Zebra|Nilpferd|Nashorn|Krokodil|Gepard|Gorilla|Känguru|Koala|Panda|Kamel|Bär
기린|얼룩말|하마|코뿔소|악어|치타|고릴라|캥거루|코알라|판다|낙타|곰
长颈鹿|斑马|河马|犀牛|鳄鱼|猎豹|大猩猩|袋鼠|考拉|熊猫|骆驼|熊
`);
  deck('desserts','🍩','Desserts','スイーツ', `
donut|chocolate pudding|cupcake|macaron|cheesecake|apple pie|waffle|pancake|brownie|chocolate fountain|crepe|parfait
ドーナツ|チョコプリン|カップケーキ|マカロン|チーズケーキ|アップルパイ|ワッフル|パンケーキ|ブラウニー|チョコレートファウンテン|クレープ|パフェ
dona|pudín de chocolate|magdalena|macarrón dulce|tarta de queso|tarta de manzana|gofre|panqueque|brownie|fuente de chocolate|crepe|parfait
rosquinha|pudim de chocolate|bolinho|macaron|cheesecake|torta de maçã|waffle|panqueca|brownie|fonte de chocolate|crepe|parfait
beignet|pudding au chocolat|cupcake|macaron|cheesecake|tarte aux pommes|gaufre|pancake|brownie|fontaine de chocolat|crêpe|parfait
Donut|Schokoladenpudding|Cupcake|Macaron|Käsekuchen|Apfelkuchen|Waffel|Pfannkuchen|Brownie|Schokoladenbrunnen|Crêpe|Parfait
도넛|초콜릿 푸딩|컵케이크|마카롱|치즈케이크|사과 파이|와플|팬케이크|브라우니|초콜릿 분수|크레페|파르페
甜甜圈|巧克力布丁|纸杯蛋糕|马卡龙|芝士蛋糕|苹果派|华夫饼|煎饼|布朗尼|巧克力喷泉|可丽饼|芭菲
`);
  deck('drinks','🥤','Drinks','飲み物', `
bubble tea|lemonade|orange juice|smoothie|milkshake|hot chocolate|green tea|iced coffee|coconut water|strawberry juice|sparkling water|herbal tea
タピオカミルクティー|レモネード|オレンジジュース|スムージー|ミルクシェイク|ホットチョコレート|緑茶|アイスコーヒー|ココナッツウォーター|イチゴジュース|炭酸水|ハーブティー
té de burbujas|limonada|zumo de naranja|batido de frutas|batido de leche|chocolate caliente|té verde|café helado|agua de coco|zumo de fresa|agua con gas|infusión
chá de bolhas|limonada|suco de laranja|vitamina de frutas|milk-shake|chocolate quente|chá verde|café gelado|água de coco|suco de morango|água com gás|chá de ervas
thé aux perles|limonade|jus d'orange|smoothie|milk-shake|chocolat chaud|thé vert|café glacé|eau de coco|jus de fraise|eau gazeuse|tisane
Bubble Tea|Limonade|Orangensaft|Smoothie|Milchshake|heiße Schokolade|grüner Tee|Eiskaffee|Kokoswasser|Erdbeersaft|Sprudelwasser|Kräutertee
버블티|레모네이드|오렌지 주스|스무디|밀크셰이크|핫초코|녹차|아이스커피|코코넛 워터|딸기 주스|탄산수|허브차
珍珠奶茶|柠檬水|橙汁|冰沙|奶昔|热巧克力|绿茶|冰咖啡|椰子水|草莓汁|气泡水|花草茶
`);
  deck('breakfast','🥞','Breakfast','朝ごはん', `
fried egg|scrambled eggs|toast with jam|cereal with milk|oatmeal|breakfast sandwich|boiled egg|grilled sausage|yogurt bowl|buttered toast|fruit salad|rice porridge
目玉焼き|スクランブルエッグ|ジャムトースト|牛乳入りシリアル|オートミール|朝食サンド|ゆで卵|焼きソーセージ|ヨーグルトボウル|バタートースト|フルーツサラダ|おかゆ
huevo frito|huevos revueltos|tostada con mermelada|cereales con leche|avena cocida|sándwich de desayuno|huevo cocido|salchicha a la parrilla|bol de yogur|tostada con mantequilla|ensalada de frutas|gachas de arroz
ovo frito|ovos mexidos|torrada com geleia|cereal com leite|mingau de aveia|sanduíche de café da manhã|ovo cozido|salsicha grelhada|tigela de iogurte|torrada com manteiga|salada de frutas|mingau de arroz
œuf au plat|œufs brouillés|toast à la confiture|céréales au lait|porridge|sandwich du matin|œuf dur|saucisse grillée|bol de yaourt|toast beurré|salade de fruits|bouillie de riz
Spiegelei|Rührei|Toast mit Marmelade|Müsli mit Milch|Haferbrei|Frühstückssandwich|gekochtes Ei|gegrillte Wurst|Joghurtschale|Buttertoast|Obstsalat|Reisbrei
달걀프라이|스크램블에그|잼 바른 토스트|우유에 말아 먹는 시리얼|오트밀|아침 샌드위치|삶은 달걀|구운 소시지|요거트 볼|버터 토스트|과일 샐러드|쌀죽
煎蛋|炒鸡蛋|果酱吐司|牛奶麦片|燕麦粥|早餐三明治|水煮蛋|烤香肠|酸奶碗|黄油吐司|水果沙拉|米粥
`);
  deck('japanese_food','🍱','Japanese Food','日本料理', `
ramen|tempura|udon|soba|onigiri|takoyaki|okonomiyaki|miso soup|yakitori|mochi|bento box|taiyaki
ラーメン|天ぷら|うどん|そば|おにぎり|たこ焼き|お好み焼き|味噌汁|焼き鳥|餅|お弁当|たい焼き
ramen|tempura|udon|soba|onigiri|takoyaki|okonomiyaki|sopa de miso|yakitori|mochi|caja bento|taiyaki
ramen|tempurá|udon|soba|onigiri|takoyaki|okonomiyaki|sopa de missô|yakitori|mochi|marmita bento|taiyaki
ramen|tempura|udon|soba|onigiri|takoyaki|okonomiyaki|soupe miso|yakitori|mochi|boîte bento|taiyaki
Ramen|Tempura|Udon|Soba|Onigiri|Takoyaki|Okonomiyaki|Misosuppe|Yakitori|Mochi|Bento-Box|Taiyaki
라멘|튀김|우동|소바|주먹밥|타코야키|오코노미야키|미소된장국|야키토리|모치|도시락|타이야키
拉面|天妇罗|乌冬面|荞麦面|饭团|章鱼烧|大阪烧|味噌汤|烤鸡串|麻糬|便当盒|鲷鱼烧
`);


  // Expansion pack B: school and movement.
  deck('school_subjects','📚','School Subjects','教科', `
mathematics|English class|science class|history class|geography|art class|music class|physical education|computer science|chemistry|biology|literature
数学|英語の授業|理科の授業|歴史の授業|地理|美術の授業|音楽の授業|体育|情報科学|化学|生物|文学
matemáticas|clase de inglés|clase de ciencias|clase de historia|geografía|clase de arte|clase de música|educación física|informática|química|biología|literatura
matemática|aula de inglês|aula de ciências|aula de história|geografia|aula de arte|aula de música|educação física|informática|química|biologia|literatura
mathématiques|cours d'anglais|cours de sciences|cours d'histoire|géographie|cours d'arts plastiques|cours de musique|éducation physique|informatique|chimie|biologie|littérature
Mathematik|Englischunterricht|Naturwissenschaften|Geschichtsunterricht|Geografie|Kunstunterricht|Musikunterricht|Sportunterricht|Informatik|Chemie|Biologie|Literatur
수학|영어 수업|과학 수업|역사 수업|지리|미술 수업|음악 수업|체육|컴퓨터 과학|화학|생물학|문학
数学|英语课|科学课|历史课|地理|美术课|音乐课|体育课|计算机科学|化学|生物学|文学
`);
  deck('school_events','🏫','School Events','学校行事', `
sports day|school festival|graduation ceremony|entrance ceremony|field trip|class presentation|school play|music contest|science fair|debate contest|school assembly|career day
運動会|文化祭|卒業式|入学式|遠足|クラス発表|学芸会|音楽コンクール|科学発表会|ディベート大会|全校集会|職業体験の日
día deportivo|festival escolar|graduación|ceremonia de bienvenida|excursión escolar|presentación de clase|obra escolar|concurso de música|feria científica|torneo de debate|asamblea escolar|día de las profesiones
dia esportivo|festival escolar|formatura|cerimônia de entrada|excursão escolar|apresentação de turma|peça escolar|concurso de música|feira de ciências|torneio de debate|assembleia escolar|dia das profissões
journée sportive|fête de l'école|remise des diplômes|cérémonie de rentrée|sortie scolaire|présentation de classe|pièce de théâtre scolaire|concours de musique|foire scientifique|concours de débat|assemblée scolaire|journée des métiers
Sportfest|Schulfest|Abschlussfeier|Einschulungsfeier|Schulausflug|Klassenvortrag|Schultheater|Musikwettbewerb|Wissenschaftsmesse|Debattierwettbewerb|Schulversammlung|Berufsinformationstag
체육대회|학교 축제|졸업식|입학식|현장 학습|학급 발표|학교 연극|음악 경연 대회|과학 발표회|토론 대회|전교 조회|진로 체험의 날
运动会|校园文化节|毕业典礼|入学典礼|郊游|班级展示|校园话剧|音乐比赛|科学展览|辩论比赛|全校大会|职业体验日
`);
  deck('classroom_actions','🧑‍🏫','Classroom Actions','教室の動作', `
raise your hand|open your textbook|erase the board|sharpen a pencil|hand in homework|ask a question|take notes|work in pairs|give a speech|turn the page|pack your bag|borrow an eraser
手を挙げる|教科書を開く|黒板を消す|鉛筆を削る|宿題を提出する|質問する|メモを取る|ペアで活動する|スピーチをする|ページをめくる|かばんを詰める|消しゴムを借りる
levantar la mano|abrir el libro de texto|borrar la pizarra|afilar un lápiz|entregar la tarea|hacer una pregunta|tomar apuntes|trabajar en parejas|dar un discurso|pasar la página|preparar la mochila|pedir una goma
levantar a mão|abrir o livro didático|apagar o quadro|apontar um lápis|entregar a lição|fazer uma pergunta|anotar|trabalhar em duplas|fazer um discurso|virar a página|arrumar a mochila|pedir uma borracha
lever la main|ouvrir le manuel|effacer le tableau|tailler un crayon|rendre les devoirs|poser une question|prendre des notes|travailler en binôme|faire un discours|tourner la page|préparer son sac|emprunter une gomme
die Hand heben|das Lehrbuch öffnen|die Tafel wischen|einen Bleistift spitzen|Hausaufgaben abgeben|eine Frage stellen|Notizen machen|zu zweit arbeiten|eine Rede halten|umblättern|die Tasche packen|einen Radiergummi leihen
손 들기|교과서 펴기|칠판 지우기|연필 깎기|숙제 제출하기|질문하기|필기하기|짝 활동하기|발표하기|책장 넘기기|가방 싸기|지우개 빌리기
举手|打开课本|擦黑板|削铅笔|交作业|提问|记笔记|两人合作|发表演讲|翻页|整理书包|借橡皮
`);
  deck('sports_moves','🏅','Sports Moves','スポーツの動作', `
kick a ball|shoot a basket|serve a tennis ball|swing a bat|spike a volleyball|dive into a pool|jump over a hurdle|throw a javelin|catch a frisbee|do a handstand|skate backwards|hit a golf ball
ボールを蹴る|シュートを決める|テニスのサーブを打つ|バットを振る|バレーボールをスパイクする|プールに飛び込む|ハードルを跳ぶ|やりを投げる|フリスビーをキャッチする|逆立ちする|後ろ向きに滑る|ゴルフボールを打つ
patear una pelota|encestar|sacar en tenis|batear|rematar en voleibol|tirarse a la piscina|saltar una valla|lanzar una jabalina|atrapar un frisbee|hacer el pino|patinar hacia atrás|golpear una pelota de golf
chutar uma bola|acertar uma cesta|sacar no tênis|rebater com taco|cortar no vôlei|mergulhar na piscina|saltar uma barreira|lançar um dardo|pegar um frisbee|plantar bananeira|patinar para trás|bater numa bola de golfe
tirer dans un ballon|marquer un panier|servir au tennis|frapper à la batte|smasher au volley|plonger dans une piscine|franchir une haie|lancer un javelot|attraper un frisbee|faire le poirier|patiner en arrière|frapper une balle de golf
einen Ball kicken|einen Korb werfen|beim Tennis aufschlagen|einen Schläger schwingen|beim Volleyball schmettern|ins Becken springen|über eine Hürde springen|einen Speer werfen|eine Frisbee fangen|Handstand machen|rückwärts Schlittschuh laufen|einen Golfball schlagen
공 차기|농구 슛 넣기|테니스 서브 넣기|방망이 휘두르기|배구 스파이크 하기|수영장으로 다이빙하기|허들 넘기|창 던지기|프리스비 잡기|물구나무서기|뒤로 스케이트 타기|골프공 치기
踢球|投篮|网球发球|挥球棒|排球扣球|跳进泳池|跨栏|投标枪|接飞盘|倒立|倒着滑冰|打高尔夫球
`);
  deck('fitness_moves','💪','Fitness Moves','フィットネス', `
push-up|sit-up|squat|lunge|stretch arms|jumping jack|plank|lift dumbbells|run in place|touch your toes|do yoga|jump rope
腕立て伏せ|腹筋運動|スクワット|ランジ|腕を伸ばす|ジャンピングジャック|プランク|ダンベルを持ち上げる|その場で走る|つま先に触る|ヨガをする|縄跳びをする
flexiones|abdominales|sentadillas|zancadas|estirar los brazos|saltos de tijera|plancha|levantar pesas|correr en el sitio|tocarse los dedos de los pies|hacer yoga|saltar a la cuerda
flexão|abdominal|agachamento|avanço|alongar os braços|polichinelo|prancha|levantar halteres|correr no lugar|tocar os pés|fazer ioga|pular corda
pompes|abdominaux|squats|fentes|étirer les bras|sauts écartés|gainage|soulever des haltères|courir sur place|toucher ses orteils|faire du yoga|sauter à la corde
Liegestütze|Sit-ups|Kniebeugen|Ausfallschritte|Arme dehnen|Hampelmänner|Unterarmstütz|Hanteln heben|auf der Stelle laufen|Zehen berühren|Yoga machen|Seilspringen
팔굽혀펴기|윗몸 일으키기|스쿼트|런지|팔 스트레칭|팔 벌려 뛰기|플랭크|아령 들기|제자리 뛰기|발끝 만지기|요가 하기|줄넘기
俯卧撑|仰卧起坐|深蹲|弓步|伸展双臂|开合跳|平板支撑|举哑铃|原地跑|摸脚尖|做瑜伽|跳绳
`);
  deck('outdoor_fun','🏕️','Outdoor Activities','アウトドア', `
fly a kite|climb a hill|walk a dog|watch birds|skip stones|collect shells|build a sandcastle|pick wildflowers|ride a scooter|have a picnic|feed ducks|look at the stars
凧を揚げる|丘を登る|犬を散歩させる|野鳥を観察する|水切りをする|貝殻を集める|砂の城を作る|野花を摘む|キックボードに乗る|ピクニックをする|アヒルに餌をやる|星を眺める
volar una cometa|subir una colina|pasear al perro|observar aves|hacer rebotar piedras en el agua|recoger conchas|construir un castillo de arena|recoger flores silvestres|montar en patinete|hacer un pícnic|dar de comer a los patos|mirar las estrellas
empinar pipa|subir uma colina|passear com o cachorro|observar pássaros|quicar pedras na água|coletar conchas|construir castelo de areia|colher flores silvestres|andar de patinete|fazer piquenique|alimentar patos|observar estrelas
faire voler un cerf-volant|monter une colline|promener un chien|observer les oiseaux|faire des ricochets|ramasser des coquillages|construire un château de sable|cueillir des fleurs sauvages|faire de la trottinette|faire un pique-nique|nourrir les canards|regarder les étoiles
einen Drachen steigen lassen|einen Hügel besteigen|einen Hund ausführen|Vögel beobachten|Steine übers Wasser springen lassen|Muscheln sammeln|eine Sandburg bauen|Wildblumen pflücken|Roller fahren|picknicken|Enten füttern|Sterne beobachten
연날리기|언덕 오르기|개 산책시키기|새 관찰하기|물수제비 뜨기|조개껍데기 모으기|모래성 만들기|야생화 따기|킥보드 타기|소풍 가기|오리에게 먹이 주기|별 보기
放风筝|爬山坡|遛狗|观鸟|打水漂|捡贝壳|堆沙堡|摘野花|骑滑板车|野餐|喂鸭子|看星星
`);
  deck('camping_actions','🔥','Camping','キャンプ', `
pitch a tent|light a campfire|roast marshmallows|unroll a sleeping bag|read a compass|use a flashlight|cook over a fire|fill a water bottle|walk with a backpack|cross a stream|look for firewood|pack a tent
テントを張る|キャンプファイヤーを起こす|マシュマロを焼く|寝袋を広げる|コンパスを読む|懐中電灯を使う|たき火で料理する|水筒に水を入れる|リュックを背負って歩く|小川を渡る|薪を探す|テントを片付ける
montar una tienda|encender una fogata|asar malvaviscos|desenrollar un saco de dormir|leer una brújula|usar una linterna|cocinar al fuego|llenar una botella de agua|caminar con mochila|cruzar un arroyo|buscar leña|guardar una tienda
montar uma barraca|acender uma fogueira|assar marshmallows|abrir um saco de dormir|ler uma bússola|usar uma lanterna|cozinhar na fogueira|encher uma garrafa de água|caminhar com mochila|atravessar um riacho|procurar lenha|guardar uma barraca
monter une tente|allumer un feu de camp|griller des guimauves|dérouler un sac de couchage|lire une boussole|utiliser une lampe de poche|cuisiner sur le feu|remplir une gourde|marcher avec un sac à dos|traverser un ruisseau|chercher du bois|ranger une tente
ein Zelt aufbauen|ein Lagerfeuer anzünden|Marshmallows rösten|einen Schlafsack ausrollen|einen Kompass ablesen|eine Taschenlampe benutzen|am Feuer kochen|eine Wasserflasche füllen|mit Rucksack wandern|einen Bach überqueren|Feuerholz suchen|ein Zelt einpacken
텐트 치기|모닥불 피우기|마시멜로 굽기|침낭 펼치기|나침반 읽기|손전등 사용하기|불에 요리하기|물병 채우기|배낭 메고 걷기|시냇물 건너기|땔감 찾기|텐트 접기
搭帐篷|生篝火|烤棉花糖|展开睡袋|看指南针|使用手电筒|篝火做饭|装满水瓶|背包徒步|过小溪|找柴火|收帐篷
`);
  deck('playground','🛝','Playground Fun','公園の遊び', `
slide down a slide|swing high|climb monkey bars|jump in a puddle|play hopscotch|ride a seesaw|spin on a merry-go-round|play tag|race to the tree|balance on a beam|dig in a sandbox|skip with a rope
滑り台を滑る|ブランコを高くこぐ|うんていを渡る|水たまりに飛び込む|けんけんぱをする|シーソーに乗る|回転遊具で回る|鬼ごっこをする|木まで競走する|平均台でバランスを取る|砂場を掘る|縄跳びで跳ぶ
bajar por un tobogán|columpiarse alto|cruzar barras de juego|saltar en un charco|jugar a la rayuela|montar en un balancín|girar en el tiovivo|jugar a pillar|correr hasta el árbol|equilibrarse en una barra|cavar en el arenero|saltar a la comba
descer no escorregador|balançar alto|atravessar barras suspensas|pular numa poça|brincar de amarelinha|brincar na gangorra|girar no gira-gira|brincar de pega-pega|correr até a árvore|equilibrar-se numa barra|cavar na caixa de areia|pular corda
descendre un toboggan|se balancer très haut|traverser une échelle horizontale|sauter dans une flaque|jouer à la marelle|faire de la balançoire à bascule|tourner sur un manège|jouer à chat|courir jusqu'à l'arbre|marcher en équilibre|creuser dans le bac à sable|sauter à la corde
rutschen|hoch schaukeln|am Klettergerüst hangeln|in eine Pfütze springen|Himmel und Hölle spielen|Wippe fahren|Karussell fahren|Fangen spielen|zum Baum rennen|auf einem Balken balancieren|im Sandkasten graben|Seilspringen
미끄럼틀 타기|그네 높이 타기|구름사다리 건너기|물웅덩이에 뛰어들기|사방치기|시소 타기|회전 놀이기구 타기|술래잡기|나무까지 달리기|평균대 위 걷기|모래 놀이터 파기|줄넘기
滑滑梯|荡高秋千|爬猴架|跳进水坑|跳房子|玩跷跷板|坐旋转木马|玩抓人游戏|跑到树边|走平衡木|挖沙坑|跳绳
`);


  // Expansion pack C: everyday experiences and travel scenarios.
  deck('household_chores','🧹','Household Chores','家事', `
vacuum the floor|wash the dishes|fold laundry|make the bed|mop the floor|clean the windows|take out the trash|iron a shirt|hang up clothes|dust a shelf|water houseplants|change a light bulb
掃除機をかける|皿を洗う|洗濯物をたたむ|ベッドを整える|床をモップで拭く|窓を拭く|ゴミを出す|シャツにアイロンをかける|洗濯物を干す|棚のほこりを払う|観葉植物に水をやる|電球を交換する
pasar la aspiradora|lavar los platos|doblar la ropa|hacer la cama|fregar el suelo|limpiar las ventanas|sacar la basura|planchar una camisa|tender la ropa|quitar el polvo|regar plantas de interior|cambiar una bombilla
passar aspirador|lavar a louça|dobrar roupas|arrumar a cama|passar pano no chão|limpar janelas|tirar o lixo|passar uma camisa|estender roupas|tirar o pó da estante|regar plantas de casa|trocar uma lâmpada
passer l'aspirateur|faire la vaisselle|plier le linge|faire le lit|passer la serpillière|nettoyer les vitres|sortir les poubelles|repasser une chemise|étendre le linge|dépoussiérer une étagère|arroser les plantes|changer une ampoule
Staub saugen|Geschirr spülen|Wäsche falten|Bett machen|Boden wischen|Fenster putzen|Müll rausbringen|ein Hemd bügeln|Wäsche aufhängen|ein Regal abstauben|Zimmerpflanzen gießen|eine Glühbirne wechseln
진공청소기 돌리기|설거지하기|빨래 개기|침대 정리하기|바닥 걸레질하기|창문 닦기|쓰레기 버리기|셔츠 다림질하기|빨래 널기|선반 먼지 털기|화분에 물 주기|전구 갈기
吸尘|洗碗|叠衣服|整理床铺|拖地|擦窗户|倒垃圾|熨衬衫|晾衣服|擦架子上的灰尘|给盆栽浇水|换灯泡
`);
  deck('cooking_actions','🍳','Cooking Actions','料理の動作', `
chop vegetables|peel a potato|stir a pot|flip a pancake|crack an egg|knead dough|grate cheese|taste the soup|set the table|open a can|pour a drink|wash lettuce
野菜を刻む|じゃがいもの皮をむく|鍋をかき混ぜる|パンケーキをひっくり返す|卵を割る|生地をこねる|チーズをおろす|スープを味見する|食卓を整える|缶詰を開ける|飲み物を注ぐ|レタスを洗う
picar verduras|pelar una patata|remover una olla|dar la vuelta a una tortita|romper un huevo|amasar|rallar queso|probar la sopa|poner la mesa|abrir una lata|servir una bebida|lavar lechuga
picar legumes|descascar uma batata|mexer uma panela|virar uma panqueca|quebrar um ovo|sovar massa|ralar queijo|provar a sopa|pôr a mesa|abrir uma lata|servir bebida|lavar alface
couper des légumes|éplucher une pomme de terre|remuer une casserole|retourner une crêpe|casser un œuf|pétrir la pâte|râper du fromage|goûter la soupe|mettre la table|ouvrir une boîte|verser une boisson|laver la laitue
Gemüse schneiden|Kartoffeln schälen|im Topf rühren|einen Pfannkuchen wenden|ein Ei aufschlagen|Teig kneten|Käse reiben|Suppe probieren|den Tisch decken|eine Dose öffnen|ein Getränk einschenken|Salat waschen
채소 다지기|감자 껍질 벗기기|냄비 젓기|팬케이크 뒤집기|달걀 깨기|반죽 치대기|치즈 갈기|수프 맛보기|식탁 차리기|캔 따기|음료 따르기|양상추 씻기
切蔬菜|削土豆皮|搅拌锅里的食物|翻煎饼|打鸡蛋|揉面|擦奶酪丝|尝汤|摆餐桌|开罐头|倒饮料|洗生菜
`);
  deck('shopping_actions','🛍️','Shopping','買い物の場面', `
try on shoes|push a shopping cart|scan a barcode|pay with a card|look for a bargain|compare prices|carry shopping bags|return an item|wrap a gift|count coins|use a coupon|stand in a checkout line
靴を試着する|買い物カートを押す|バーコードを読み取る|カードで払う|お買い得品を探す|値段を比べる|買い物袋を運ぶ|商品を返品する|プレゼントを包む|小銭を数える|クーポンを使う|レジに並ぶ
probarse zapatos|empujar un carrito|escanear un código de barras|pagar con tarjeta|buscar ofertas|comparar precios|llevar bolsas|devolver un artículo|envolver un regalo|contar monedas|usar un cupón|hacer cola en caja
experimentar sapatos|empurrar carrinho de compras|ler código de barras|pagar com cartão|procurar promoção|comparar preços|carregar sacolas|devolver um produto|embrulhar presente|contar moedas|usar cupom|ficar na fila do caixa
essayer des chaussures|pousser un chariot|scanner un code-barres|payer par carte|chercher une bonne affaire|comparer les prix|porter des sacs|rendre un article|emballer un cadeau|compter des pièces|utiliser un bon de réduction|faire la queue à la caisse
Schuhe anprobieren|Einkaufswagen schieben|Barcode scannen|mit Karte zahlen|Schnäppchen suchen|Preise vergleichen|Einkaufstüten tragen|einen Artikel zurückgeben|Geschenk einpacken|Münzen zählen|Gutschein benutzen|an der Kasse anstehen
신발 신어 보기|쇼핑 카트 밀기|바코드 스캔하기|카드로 결제하기|할인 상품 찾기|가격 비교하기|쇼핑백 나르기|물건 반품하기|선물 포장하기|동전 세기|쿠폰 사용하기|계산대 줄 서기
试鞋|推购物车|扫描条形码|刷卡付款|找特价商品|比较价格|提购物袋|退货|包装礼物|数硬币|用优惠券|排队结账
`);
  deck('restaurant_actions','🍽️','At a Restaurant','レストラン', `
read the menu|order food|call the waiter|use chopsticks|cut a steak|taste spicy food|share a dessert|ask for the bill|drink from a straw|spill a drink|take a food photo|leave a tip
メニューを読む|料理を注文する|店員を呼ぶ|箸を使う|ステーキを切る|辛い料理を味見する|デザートを分ける|お会計を頼む|ストローで飲む|飲み物をこぼす|料理の写真を撮る|チップを置く
leer el menú|pedir comida|llamar al camarero|usar palillos|cortar un filete|probar comida picante|compartir un postre|pedir la cuenta|beber con pajita|derramar una bebida|fotografiar la comida|dejar propina
ler o cardápio|pedir comida|chamar o garçom|usar hashis|cortar um bife|provar comida apimentada|dividir uma sobremesa|pedir a conta|beber com canudo|derramar bebida|tirar foto da comida|deixar gorjeta
lire le menu|commander un plat|appeler le serveur|utiliser des baguettes|couper un steak|goûter un plat épicé|partager un dessert|demander l'addition|boire avec une paille|renverser un verre|photographier un plat|laisser un pourboire
Speisekarte lesen|Essen bestellen|den Kellner rufen|Essstäbchen benutzen|ein Steak schneiden|scharfes Essen probieren|Nachtisch teilen|um die Rechnung bitten|durch einen Strohhalm trinken|ein Getränk verschütten|Essen fotografieren|Trinkgeld geben
메뉴판 읽기|음식 주문하기|직원 부르기|젓가락 사용하기|스테이크 썰기|매운 음식 맛보기|디저트 나눠 먹기|계산서 요청하기|빨대로 마시기|음료 쏟기|음식 사진 찍기|팁 남기기
看菜单|点菜|叫服务员|用筷子|切牛排|尝辣菜|分享甜点|买单|用吸管喝|打翻饮料|拍美食照片|留小费
`);
  deck('airport_actions','✈️','At the Airport','空港での行動', `
check in a suitcase|show a passport|go through security|find the departure gate|watch the luggage belt|board an airplane|fasten a seat belt|put a bag overhead|read a boarding pass|wave goodbye|look out of a plane window|wait for a delayed flight
スーツケースを預ける|パスポートを見せる|保安検査を通る|搭乗ゲートを探す|手荷物受取レーンを見る|飛行機に搭乗する|シートベルトを締める|荷物を頭上に入れる|搭乗券を読む|手を振って別れる|飛行機の窓から外を見る|遅延した便を待つ
facturar una maleta|mostrar el pasaporte|pasar el control de seguridad|buscar la puerta de embarque|mirar la cinta de equipajes|subir al avión|abrochar el cinturón|guardar una bolsa arriba|leer la tarjeta de embarque|despedirse con la mano|mirar por la ventanilla|esperar un vuelo retrasado
despachar uma mala|mostrar passaporte|passar pela segurança|procurar portão de embarque|olhar esteira de bagagem|embarcar no avião|afivelar cinto de segurança|guardar mala no bagageiro|ler cartão de embarque|acenar adeus|olhar pela janela do avião|esperar voo atrasado
enregistrer une valise|montrer son passeport|passer le contrôle de sécurité|chercher la porte d'embarquement|regarder le tapis à bagages|monter dans l'avion|attacher sa ceinture|ranger un sac en hauteur|lire sa carte d'embarquement|faire signe au revoir|regarder par le hublot|attendre un vol retardé
einen Koffer aufgeben|Reisepass vorzeigen|Sicherheitskontrolle passieren|das Gate suchen|am Gepäckband warten|ins Flugzeug steigen|Sicherheitsgurt anlegen|Gepäck oben verstauen|Bordkarte lesen|zum Abschied winken|aus dem Flugzeugfenster schauen|auf einen verspäteten Flug warten
여행 가방 부치기|여권 보여 주기|보안 검색 통과하기|탑승구 찾기|수하물 컨베이어 벨트 보기|비행기 탑승하기|안전벨트 매기|짐을 선반에 넣기|탑승권 읽기|손 흔들어 작별하기|비행기 창밖 보기|지연된 비행기 기다리기
托运行李箱|出示护照|通过安检|寻找登机口|看行李传送带|登机|系安全带|把行李放到头顶行李架|看登机牌|挥手告别|看飞机窗外|等延误航班
`);
  deck('hotel_actions','🛎️','At the Hotel','ホテルでの行動', `
ring the reception bell|check in at the hotel|carry a suitcase upstairs|open a hotel door|find the room number|use a key card|order room service|ask for extra towels|turn on the air conditioner|unpack clothes|call reception|check out
受付のベルを鳴らす|ホテルにチェックインする|スーツケースを階上へ運ぶ|ホテルのドアを開ける|部屋番号を探す|カードキーを使う|ルームサービスを頼む|タオルの追加を頼む|エアコンをつける|服を荷ほどきする|フロントに電話する|チェックアウトする
tocar el timbre de recepción|registrarse en el hotel|subir una maleta|abrir la puerta del hotel|buscar el número de habitación|usar una tarjeta llave|pedir servicio de habitaciones|pedir toallas extra|encender el aire acondicionado|deshacer la maleta|llamar a recepción|salir del hotel
tocar sino da recepção|fazer check-in no hotel|levar mala escada acima|abrir porta do hotel|procurar número do quarto|usar cartão-chave|pedir serviço de quarto|pedir toalhas extras|ligar ar-condicionado|desfazer a mala|ligar para a recepção|fazer check-out
sonner à la réception|s'enregistrer à l'hôtel|monter une valise|ouvrir la porte de l'hôtel|chercher le numéro de chambre|utiliser une carte-clé|commander au service d'étage|demander des serviettes|allumer la climatisation|défaire sa valise|appeler la réception|quitter l'hôtel
an der Rezeption klingeln|im Hotel einchecken|Koffer nach oben tragen|Hoteltür öffnen|Zimmernummer suchen|Schlüsselkarte benutzen|Zimmerservice bestellen|zusätzliche Handtücher verlangen|Klimaanlage einschalten|Koffer auspacken|Rezeption anrufen|auschecken
프런트 벨 누르기|호텔 체크인하기|짐가방 위층으로 옮기기|호텔 문 열기|객실 번호 찾기|카드키 사용하기|룸서비스 주문하기|수건 더 요청하기|에어컨 켜기|짐 풀기|프런트에 전화하기|체크아웃하기
按前台铃|办理酒店入住|把行李箱搬上楼|打开酒店房门|找房间号|使用房卡|叫客房服务|要更多毛巾|开空调|打开行李箱整理衣物|打电话给前台|办理退房
`);
  deck('travel_problems','😵','Travel Mishaps','旅行のハプニング', `
miss the train|lose your passport|forget your luggage|read a map upside down|get lost in a city|run after a bus|drop your phone|break a suitcase wheel|forget your room key|run out of battery|take the wrong bus|get caught in the rain
電車に乗り遅れる|パスポートをなくす|荷物を忘れる|地図を逆さに読む|街で道に迷う|バスを追いかける|携帯を落とす|スーツケースの車輪が壊れる|部屋の鍵を忘れる|充電が切れる|違うバスに乗る|雨に降られる
perder el tren|perder el pasaporte|olvidar el equipaje|leer un mapa al revés|perderse en la ciudad|correr detrás de un autobús|dejar caer el móvil|romper una rueda de la maleta|olvidar la llave|quedarse sin batería|tomar el autobús equivocado|mojarse bajo la lluvia
perder o trem|perder o passaporte|esquecer a bagagem|ler mapa de cabeça para baixo|se perder na cidade|correr atrás do ônibus|deixar cair o celular|quebrar a rodinha da mala|esquecer a chave do quarto|ficar sem bateria|pegar o ônibus errado|ser pego pela chuva
rater le train|perdre son passeport|oublier ses bagages|lire une carte à l'envers|se perdre en ville|courir après un bus|faire tomber son téléphone|casser une roue de valise|oublier sa clé|ne plus avoir de batterie|prendre le mauvais bus|se faire surprendre par la pluie
den Zug verpassen|Reisepass verlieren|Gepäck vergessen|eine Karte verkehrt herum lesen|sich in der Stadt verlaufen|dem Bus hinterherrennen|das Handy fallen lassen|ein Kofferrad zerbrechen|Zimmerschlüssel vergessen|leeren Akku haben|den falschen Bus nehmen|in den Regen geraten
기차 놓치기|여권 잃어버리기|짐 두고 오기|지도 거꾸로 보기|도시에서 길 잃기|버스 뒤쫓아 뛰기|휴대폰 떨어뜨리기|캐리어 바퀴 부러지기|객실 열쇠 잊기|배터리 방전되기|버스 잘못 타기|비 맞기
错过火车|丢护照|忘带行李|把地图拿反|在城市迷路|追公交车|手机掉地上|行李箱轮子坏了|忘带房间钥匙|电池没电|坐错公交车|淋雨
`);
  deck('city_adventures','🚦','City Adventures','街での行動', `
hail a taxi|cross at a crosswalk|wait at a traffic light|buy a subway ticket|ask for directions|find a street sign|ride an escalator|wait for an elevator|read a bus timetable|take a city bus|look up at skyscrapers|find a public restroom
タクシーを止める|横断歩道を渡る|信号で待つ|地下鉄の切符を買う|道を尋ねる|道路標識を探す|エスカレーターに乗る|エレベーターを待つ|バスの時刻表を読む|市バスに乗る|高層ビルを見上げる|公衆トイレを探す
parar un taxi|cruzar un paso de peatones|esperar en el semáforo|comprar un billete de metro|preguntar direcciones|buscar una señal|subir una escalera mecánica|esperar el ascensor|leer el horario de autobús|tomar un autobús urbano|mirar rascacielos|buscar un baño público
chamar um táxi|atravessar na faixa|esperar no semáforo|comprar bilhete de metrô|pedir informação|procurar placa de rua|subir escada rolante|esperar elevador|ler horário de ônibus|pegar ônibus urbano|olhar arranha-céus|procurar banheiro público
héler un taxi|traverser au passage piéton|attendre au feu rouge|acheter un ticket de métro|demander son chemin|chercher une plaque de rue|prendre un escalator|attendre l'ascenseur|lire les horaires du bus|prendre un bus de ville|regarder les gratte-ciel|chercher des toilettes publiques
ein Taxi heranwinken|am Zebrastreifen überqueren|an der Ampel warten|ein U-Bahn-Ticket kaufen|nach dem Weg fragen|Straßenschilder suchen|Rolltreppe fahren|auf den Aufzug warten|den Busfahrplan lesen|Stadtbus fahren|Wolkenkratzer anschauen|eine öffentliche Toilette suchen
택시 잡기|횡단보도 건너기|신호등 앞에서 기다리기|지하철 표 사기|길 물어보기|도로 표지판 찾기|에스컬레이터 타기|엘리베이터 기다리기|버스 시간표 읽기|시내버스 타기|고층 건물 올려다보기|공중화장실 찾기
招手打车|过人行横道|等红绿灯|买地铁票|问路|找路牌|乘扶梯|等电梯|看公交时刻表|坐市内公交|仰望摩天楼|找公共厕所
`);


  // Expansion pack D: environment, modern life, creative play and performance.
  deck('eco_actions','🌱','Eco Actions','エコ活動', `
sort recyclables|pick up litter|plant a tree|turn off the lights|reuse a shopping bag|ride a bicycle to school|save water|collect plastic bottles|repair a broken toy|carry a reusable bottle|compost food scraps|clean a beach
資源ごみを分別する|ごみを拾う|木を植える|電気を消す|買い物袋を再利用する|自転車で通学する|節水する|ペットボトルを集める|壊れたおもちゃを直す|マイボトルを持つ|生ごみを堆肥にする|浜辺を掃除する
separar reciclables|recoger basura|plantar un árbol|apagar las luces|reutilizar una bolsa|ir en bici a clase|ahorrar agua|recoger botellas de plástico|arreglar un juguete|llevar botella reutilizable|hacer compost|limpiar una playa
separar recicláveis|recolher lixo|plantar uma árvore|apagar as luzes|reutilizar sacola|ir de bicicleta à escola|economizar água|recolher garrafas plásticas|consertar brinquedo quebrado|levar garrafa reutilizável|fazer compostagem|limpar uma praia
trier les déchets|ramasser les déchets|planter un arbre|éteindre les lumières|réutiliser un sac|aller à vélo à l'école|économiser l'eau|ramasser des bouteilles en plastique|réparer un jouet cassé|porter une gourde réutilisable|faire du compost|nettoyer une plage
Müll trennen|Abfall aufsammeln|einen Baum pflanzen|Licht ausschalten|Einkaufstasche wiederverwenden|mit dem Fahrrad zur Schule fahren|Wasser sparen|Plastikflaschen sammeln|kaputtes Spielzeug reparieren|Mehrwegflasche mitnehmen|kompostieren|einen Strand säubern
재활용 쓰레기 분리하기|쓰레기 줍기|나무 심기|불 끄기|장바구니 다시 쓰기|자전거로 등교하기|물 아끼기|페트병 모으기|고장 난 장난감 고치기|다회용 물병 들고 다니기|음식물 퇴비 만들기|해변 청소하기
垃圾分类|捡垃圾|种树|关灯|重复使用购物袋|骑自行车上学|节约用水|收集塑料瓶|修理坏玩具|带可重复使用的水瓶|堆肥|清理海滩
`);
  deck('healthy_habits','🧘','Healthy Habits','健康習慣', `
stretch after waking|wash your hands|eat vegetables|go for a walk|drink water|breathe deeply|take a nap|brush your teeth|wear sunscreen|check your heartbeat|rest your eyes|sleep early
起きたらストレッチする|手を洗う|野菜を食べる|散歩する|水を飲む|深呼吸する|昼寝する|歯を磨く|日焼け止めを塗る|脈を測る|目を休める|早寝する
estirarse al despertar|lavarse las manos|comer verduras|salir a caminar|beber agua|respirar profundamente|echarse una siesta|cepillarse los dientes|ponerse protector solar|tomarse el pulso|descansar la vista|dormir temprano
alongar ao acordar|lavar as mãos|comer legumes|fazer caminhada|beber água|respirar fundo|tirar uma soneca|escovar os dentes|passar protetor solar|medir o pulso|descansar os olhos|dormir cedo
s'étirer au réveil|se laver les mains|manger des légumes|faire une promenade|boire de l'eau|respirer profondément|faire une sieste|se brosser les dents|mettre de la crème solaire|prendre son pouls|reposer ses yeux|se coucher tôt
sich morgens dehnen|Hände waschen|Gemüse essen|spazieren gehen|Wasser trinken|tief atmen|Mittagsschlaf machen|Zähne putzen|Sonnencreme auftragen|Puls messen|Augen ausruhen|früh schlafen gehen
일어나서 스트레칭하기|손 씻기|채소 먹기|산책하기|물 마시기|깊게 숨쉬기|낮잠 자기|양치하기|선크림 바르기|맥박 재기|눈 쉬게 하기|일찍 잠들기
起床后伸展|洗手|吃蔬菜|散步|喝水|深呼吸|午睡|刷牙|涂防晒霜|测脉搏|让眼睛休息|早睡
`);
  deck('digital_actions','📱','Digital Life','デジタル生活', `
take a selfie|scan a QR code|type a password|plug in a charger|join a video call|mute a microphone|scroll a screen|send an emoji|unlock a phone|take a screenshot|record a voice message|use face recognition
自撮りをする|QRコードを読み取る|パスワードを打つ|充電器を挿す|ビデオ通話に参加する|マイクをミュートにする|画面をスクロールする|絵文字を送る|スマホのロックを解除する|スクリーンショットを撮る|音声メッセージを録る|顔認証を使う
hacerse un selfi|escanear un código QR|escribir una contraseña|enchufar el cargador|entrar en videollamada|silenciar el micrófono|deslizar la pantalla|enviar un emoji|desbloquear el móvil|hacer una captura de pantalla|grabar un mensaje de voz|usar reconocimiento facial
tirar selfie|ler um código QR|digitar senha|conectar carregador|entrar em videochamada|silenciar microfone|rolar a tela|enviar emoji|desbloquear celular|tirar captura de tela|gravar mensagem de voz|usar reconhecimento facial
prendre un selfie|scanner un QR code|saisir un mot de passe|brancher un chargeur|rejoindre un appel vidéo|couper le micro|faire défiler l'écran|envoyer un emoji|déverrouiller un téléphone|faire une capture d'écran|enregistrer un message vocal|utiliser la reconnaissance faciale
Selfie machen|QR-Code scannen|Passwort eingeben|Ladegerät anschließen|an einem Videoanruf teilnehmen|Mikrofon stummschalten|auf dem Bildschirm scrollen|Emoji senden|Handy entsperren|Screenshot machen|Sprachnachricht aufnehmen|Gesichtserkennung nutzen
셀카 찍기|QR 코드 스캔하기|비밀번호 입력하기|충전기 꽂기|영상 통화 참여하기|마이크 음소거하기|화면 스크롤하기|이모지 보내기|휴대폰 잠금 해제하기|스크린샷 찍기|음성 메시지 녹음하기|얼굴 인식 사용하기
自拍|扫描二维码|输入密码|插充电器|加入视频通话|静音麦克风|滑动屏幕|发送表情符号|解锁手机|截屏|录语音消息|使用人脸识别
`);
  deck('social_situations','🤝','Social Situations','人とのやり取り', `
introduce yourself|shake hands|give a high five|apologize to a friend|make a new friend|give someone directions|hold a door open|say thank you|cheer for a teammate|lend a pen|invite someone to a party|congratulate a friend
自己紹介する|握手する|ハイタッチする|友達に謝る|新しい友達を作る|道を教える|ドアを開けて待つ|ありがとうと言う|チームメイトを応援する|ペンを貸す|パーティーに招待する|友達を祝う
presentarse|dar la mano|chocar los cinco|pedir perdón a un amigo|hacer un nuevo amigo|indicar el camino|sujetar la puerta|dar las gracias|animar a un compañero|prestar un bolígrafo|invitar a una fiesta|felicitar a un amigo
apresentar-se|apertar as mãos|dar um toque de mãos|pedir desculpas a um amigo|fazer um novo amigo|indicar o caminho|segurar a porta|agradecer|torcer por colega|emprestar caneta|convidar para uma festa|parabenizar um amigo
se présenter|serrer la main|taper dans la main|s'excuser auprès d'un ami|se faire un nouvel ami|indiquer le chemin|tenir la porte|dire merci|encourager un coéquipier|prêter un stylo|inviter à une fête|féliciter un ami
sich vorstellen|Hände schütteln|High Five geben|sich bei einem Freund entschuldigen|einen neuen Freund finden|den Weg erklären|die Tür aufhalten|Danke sagen|einen Teamkollegen anfeuern|einen Stift verleihen|zu einer Party einladen|einem Freund gratulieren
자기소개하기|악수하기|하이파이브하기|친구에게 사과하기|새 친구 사귀기|길 알려 주기|문 잡아 주기|고맙다고 말하기|팀원 응원하기|펜 빌려주기|파티에 초대하기|친구 축하하기
自我介绍|握手|击掌|向朋友道歉|交新朋友|给别人指路|帮人扶门|说谢谢|为队友加油|借笔给别人|邀请参加派对|祝贺朋友
`);
  deck('art_actions','🎨','Art Studio','アートの動作', `
paint a portrait|draw a cartoon|mix paint colors|cut paper shapes|make origami|sculpt with clay|use a paintbrush|erase a drawing|make a collage|take a photo|frame a painting|sketch a landscape
肖像画を描く|漫画を描く|絵の具を混ぜる|紙を形に切る|折り紙を折る|粘土で形を作る|筆を使う|絵を消す|コラージュを作る|写真を撮る|絵を額縁に入れる|風景をスケッチする
pintar un retrato|dibujar un cómic|mezclar pinturas|recortar figuras de papel|hacer origami|modelar arcilla|usar un pincel|borrar un dibujo|hacer un collage|sacar una foto|enmarcar un cuadro|dibujar un paisaje
pintar retrato|desenhar quadrinhos|misturar tintas|recortar formas de papel|fazer origami|modelar argila|usar pincel|apagar desenho|fazer colagem|tirar foto|emoldurar pintura|desenhar paisagem
peindre un portrait|dessiner une BD|mélanger des couleurs|découper des formes|faire de l'origami|sculpter de l'argile|utiliser un pinceau|gommer un dessin|faire un collage|prendre une photo|encadrer un tableau|dessiner un paysage
ein Porträt malen|Comic zeichnen|Farben mischen|Papierformen ausschneiden|Origami falten|Ton formen|Pinsel benutzen|Zeichnung radieren|Collage gestalten|Foto machen|Bild einrahmen|Landschaft skizzieren
초상화 그리기|만화 그리기|물감 섞기|종이 모양 오리기|종이접기하기|찰흙 조각하기|붓 사용하기|그림 지우기|콜라주 만들기|사진 찍기|그림 액자에 넣기|풍경 스케치하기
画肖像画|画漫画|调颜料|剪纸形状|折纸|用黏土塑形|用画笔|擦掉画|做拼贴画|拍照片|给画装框|画风景速写
`);
  deck('magic_actions','🪄','Magic Tricks','魔法と手品', `
pull a rabbit from a hat|wave a magic wand|disappear in smoke|cast a spell|levitate a book|turn invisible|transform into a frog|open a secret door|ride a broomstick|mix a magic potion|make a coin vanish|predict a playing card
帽子からウサギを出す|魔法の杖を振る|煙の中で消える|呪文を唱える|本を浮かせる|透明になる|カエルに変身する|隠し扉を開ける|ほうきに乗って飛ぶ|魔法の薬を混ぜる|コインを消す|トランプを予言する
sacar un conejo del sombrero|agitar la varita mágica|desaparecer entre humo|lanzar un hechizo|hacer flotar un libro|volverse invisible|convertirse en rana|abrir una puerta secreta|volar en escoba|mezclar una poción mágica|hacer desaparecer una moneda|adivinar una carta
tirar coelho da cartola|agitar varinha mágica|sumir na fumaça|lançar feitiço|fazer livro flutuar|ficar invisível|virar sapo|abrir porta secreta|voar de vassoura|misturar poção mágica|fazer moeda sumir|adivinhar uma carta
sortir un lapin du chapeau|agiter une baguette magique|disparaître dans la fumée|lancer un sort|faire léviter un livre|devenir invisible|se transformer en grenouille|ouvrir une porte secrète|voler sur un balai|préparer une potion|faire disparaître une pièce|deviner une carte
Kaninchen aus dem Hut zaubern|Zauberstab schwingen|im Rauch verschwinden|einen Zauber sprechen|Buch schweben lassen|unsichtbar werden|sich in einen Frosch verwandeln|Geheimtür öffnen|auf einem Besen fliegen|Zaubertrank mischen|Münze verschwinden lassen|eine Spielkarte vorhersagen
모자에서 토끼 꺼내기|마법 지팡이 흔들기|연기 속으로 사라지기|주문 외우기|책 공중에 띄우기|투명 인간 되기|개구리로 변신하기|비밀 문 열기|빗자루 타고 날기|마법 물약 섞기|동전 사라지게 하기|카드 맞히기
从帽子里变出兔子|挥魔杖|在烟雾中消失|念咒语|让书漂浮|变透明|变成青蛙|打开密门|骑扫帚飞|调魔法药水|让硬币消失|猜扑克牌
`);
  deck('superhero_actions','🦸','Superhero Moves','ヒーローの動き', `
fly over a city|stop a speeding train|lift a car|shoot laser beams|climb a wall|rescue a kitten|stop a giant robot|protect with a shield|run at super speed|freeze a waterfall|jump over a building|make a superhero landing
街の上を飛ぶ|暴走列車を止める|車を持ち上げる|レーザーを放つ|壁を登る|子猫を助ける|巨大ロボットを止める|盾で守る|超高速で走る|滝を凍らせる|建物を飛び越える|ヒーロー着地をする
volar sobre una ciudad|parar un tren veloz|levantar un coche|disparar láseres|escalar una pared|rescatar un gatito|detener un robot gigante|protegerse con escudo|correr a supervelocidad|congelar una cascada|saltar un edificio|aterrizar como superhéroe
voar sobre a cidade|parar trem veloz|levantar um carro|disparar lasers|escalar parede|salvar gatinho|parar robô gigante|proteger com escudo|correr super-rápido|congelar cachoeira|pular prédio|pousar como super-herói
voler au-dessus d'une ville|arrêter un train rapide|soulever une voiture|tirer des lasers|grimper au mur|sauver un chaton|arrêter un robot géant|se protéger avec un bouclier|courir très vite|geler une cascade|sauter par-dessus un bâtiment|atterrir en super-héros
über eine Stadt fliegen|einen schnellen Zug stoppen|ein Auto hochheben|Laser schießen|eine Wand hochklettern|Kätzchen retten|einen Riesenroboter stoppen|mit Schild schützen|superschnell rennen|Wasserfall einfrieren|über ein Haus springen|wie ein Superheld landen
도시 위를 날기|폭주 기차 멈추기|자동차 들어 올리기|레이저 쏘기|벽 타기|아기 고양이 구하기|거대 로봇 멈추기|방패로 막기|초고속으로 달리기|폭포 얼리기|건물 뛰어넘기|슈퍼히어로 착지하기
飞越城市|拦住飞驰的火车|举起汽车|发射激光|爬墙|救小猫|阻止巨型机器人|用盾牌防御|超高速奔跑|冻住瀑布|跳过大楼|超级英雄式落地
`);
  deck('comedy_situations','😂','Comedy Scenes','おもしろシーン', `
walk on an invisible tightrope|fight an invisible mosquito|carry a giant balloon|eat an extremely sour lemon|pretend the floor is lava|open a very heavy door|run from a tiny spider|talk to a sleepy robot|balance a tower of books|sneak past a sleeping dragon|dance with a broom|find a surprise in your shoe
見えない綱渡りをする|見えない蚊と戦う|巨大な風船を運ぶ|とても酸っぱいレモンを食べる|床が溶岩のふりをする|すごく重い扉を開ける|小さなクモから逃げる|眠そうなロボットに話す|本を高く積んでバランスを取る|寝ているドラゴンの前を忍び足で通る|ほうきと踊る|靴の中の思わぬ物を見つける
caminar por una cuerda invisible|luchar contra un mosquito invisible|llevar un globo gigante|comer un limón muy ácido|fingir que el suelo es lava|abrir una puerta muy pesada|huir de una araña diminuta|hablar con un robot dormilón|equilibrar una torre de libros|pasar a hurtadillas junto a un dragón dormido|bailar con una escoba|encontrar una sorpresa en el zapato
andar na corda invisível|lutar com mosquito invisível|carregar balão gigante|comer limão muito azedo|fingir que o chão é lava|abrir porta muito pesada|fugir de aranha minúscula|conversar com robô sonolento|equilibrar pilha de livros|passar escondido por dragão dormindo|dançar com vassoura|achar surpresa no sapato
marcher sur une corde invisible|combattre un moustique invisible|porter un ballon géant|manger un citron très acide|faire semblant que le sol est en lave|ouvrir une porte très lourde|fuir une petite araignée|parler à un robot endormi|équilibrer une pile de livres|passer devant un dragon endormi|danser avec un balai|trouver une surprise dans sa chaussure
auf einem unsichtbaren Seil balancieren|gegen eine unsichtbare Mücke kämpfen|einen Riesenballon tragen|eine sehr saure Zitrone essen|so tun als wäre der Boden Lava|eine schwere Tür öffnen|vor einer winzigen Spinne fliehen|mit einem schläfrigen Roboter reden|einen Bücherstapel balancieren|an einem schlafenden Drachen vorbeischleichen|mit einem Besen tanzen|eine Überraschung im Schuh finden
보이지 않는 줄 위 걷기|보이지 않는 모기와 싸우기|거대한 풍선 옮기기|아주 신 레몬 먹기|바닥이 용암인 척하기|아주 무거운 문 열기|작은 거미 피해서 도망가기|졸린 로봇과 대화하기|책 탑 균형 잡기|잠든 용 옆을 살금살금 지나가기|빗자루와 춤추기|신발 속의 뜻밖의 물건 찾기
走隐形钢丝|和看不见的蚊子搏斗|搬巨大气球|吃特别酸的柠檬|假装地板是岩浆|打开很重的门|躲避小蜘蛛|和犯困的机器人说话|平衡一摞书|悄悄走过睡着的龙|和扫帚跳舞|在鞋里发现意外之物
`);

  // Validate curated prompts only; never generate random two-concept combinations.
  const validateStandaloneDecks = root.CHARADES_EXPANSION ||
    (typeof module !== 'undefined' && module.exports ? require('./charades-expansion.js') : null);
  if (typeof validateStandaloneDecks !== 'function') throw new Error('Missing Charades prompt validator');
  validateStandaloneDecks(decks);

  // Standard uses independently-authored short labels; Challenge combines two
  // curated concepts in the SAME category. The former sentence templates are gone.
  const sceneCatalog = root.CHARADES_SCENES ||
    (typeof module !== 'undefined' && module.exports ? require('./charades-curated-scenes.js') : null);
  if (!sceneCatalog || typeof sceneCatalog.expand !== 'function') {
    throw new Error('Missing Charades two-level card catalog');
  }
  sceneCatalog.expand(decks);
  validateStandaloneDecks(decks);

  const catalog = Object.freeze({ languages: LANGUAGES, decks });
  if (typeof module !== 'undefined' && module.exports) module.exports = catalog;
  root.CHARADES_DATA = catalog;
})(typeof window !== 'undefined' ? window : globalThis);
