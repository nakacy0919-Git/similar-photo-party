document.addEventListener('DOMContentLoaded', () => {
    // === 定数 ===
    const MEMORY_TIME = 10;
    const EXPLAIN_TIME = 15;
    
    // 多言語データ
    const LANGUAGES = [
        { code: 'en', flag: '🇺🇸', label: 'English', title: 'HOW TO PLAY', s1:'1. Memorize', s1d:'Player A looks at the image for 10s.', s2:'2. Explain', s2d:'Player A describes it in English (15s).', s3:'3. Choose', s3d:'Player B picks the correct image!' },
        { code: 'ja', flag: '🇯🇵', label: '日本語', title: '遊び方', s1:'1. 覚える', s1d:'Aさんは画像を10秒間で覚えます。', s2:'2. 説明する', s2d:'Aさんは英語で画像の特徴を説明します(15秒)。', s3:'3. 選ぶ', s3d:'Bさんは説明を聞いて正解の画像を選びます！' },
        { code: 'es', flag: '🇪🇸', label: 'Español', title: 'CÓMO JUGAR', s1:'1. Memorizar', s1d:'Jugador A mira la imagen por 10s.', s2:'2. Explicar', s2d:'Jugador A describe en inglés (15s).', s3:'3. Elegir', s3d:'¡Jugador B elige la imagen correcta!' },
        { code: 'fr', flag: '🇫🇷', label: 'Français', title: 'COMMENT JOUER', s1:'1. Mémoriser', s1d:'Joueur A regarde l\'image pendant 10s.', s2:'2. Expliquer', s2d:'Joueur A décrit en anglais (15s).', s3:'3. Choisir', s3d:'Joueur B choisit la bonne image!' },
        { code: 'de', flag: '🇩🇪', label: 'Deutsch', title: 'SPIELANLEITUNG', s1:'1. Merken', s1d:'Spieler A schaut das Bild 10s an.', s2:'2. Erklären', s2d:'Spieler A beschreibt es auf Englisch (15s).', s3:'3. Wählen', s3d:'Spieler B wählt das richtige Bild!' },
        { code: 'it', flag: '🇮🇹', label: 'Italiano', title: 'COME GIOCARE', s1:'1. Memorizza', s1d:'Giocatore A guarda l\'immagine per 10s.', s2:'2. Spiega', s2d:'Giocatore A descrive in inglese (15s).', s3:'3. Scegli', s3d:'Giocatore B sceglie l\'immagine corretta!' },
        { code: 'pt', flag: '🇧🇷', label: 'Português', title: 'COMO JOGAR', s1:'1. Memorizar', s1d:'Jogador A olha a imagem por 10s.', s2:'2. Explicar', s2d:'Jogador A descreve em inglês (15s).', s3:'3. Escolher', s3d:'Jogador B escolhe a imagem correta!' },
        { code: 'cn', flag: '🇨🇳', label: '中文', title: '游戏规则', s1:'1. 记忆', s1d:'玩家A看图10秒。', s2:'2. 描述', s2d:'玩家A用英语描述图片（15秒）。', s3:'3. 选择', s3d:'玩家B选择正确的图片！' },
        { code: 'kr', flag: '🇰🇷', label: '한국어', title: '게임 방법', s1:'1. 기억하기', s1d:'플레이어 A는 10초 동안 이미지를 봅니다.', s2:'2. 설명하기', s2d:'플레이어 A는 영어로 설명합니다 (15초).', s3:'3. 선택하기', s3d:'플레이어 B는 정답 이미지를 선택합니다!' },
        { code: 'ru', flag: '🇷🇺', label: 'Русский', title: 'КАК ИГРАТЬ', s1:'1. Запомнить', s1d:'Игрок А смотрит на картинку 10с.', s2:'2. Объяснить', s2d:'Игрок А описывает её на английском (15с).', s3:'3. Выбрать', s3d:'Игрок Б выбирает правильную картинку!' },
        { code: 'id', flag: '🇮🇩', label: 'Indonesia', title: 'CARA BERMAIN', s1:'1. Mengingat', s1d:'Pemain A melihat gambar selama 10 detik.', s2:'2. Menjelaskan', s2d:'Pemain A mendeskripsikan dalam Bhs Inggris.', s3:'3. Memilih', s3d:'Pemain B memilih gambar yang benar!' },
        { code: 'th', flag: '🇹🇭', label: 'ไทย', title: 'วิธีการเล่น', s1:'1. จดจำ', s1d:'ผู้เล่น A ดูภาพเป็นเวลา 10 วินาที', s2:'2. อธิบาย', s2d:'ผู้เล่น A อธิบายเป็นภาษาอังกฤษ (15 วินาที)', s3:'3. เลือก', s3d:'ผู้เล่น B เลือกภาพที่ถูกต้อง!' },
        { code: 'vn', flag: '🇻🇳', label: 'Tiếng Việt', title: 'CÁCH CHƠI', s1:'1. Ghi nhớ', s1d:'Người chơi A nhìn hình trong 10 giây.', s2:'2. Giải thích', s2d:'Người chơi A mô tả bằng tiếng Anh (15 giây).', s3:'3. Chọn', s3d:'Người chơi B chọn hình đúng!' },
        { code: 'tr', flag: '🇹🇷', label: 'Türkçe', title: 'NASIL OYNANIR', s1:'1. Ezberle', s1d:'Oyuncu A resme 10 saniye bakar.', s2:'2. Açıkla', s2d:'Oyuncu A İngilizce tarif eder (15sn).', s3:'3. Seç', s3d:'Oyuncu B doğru resmi seçer!' },
        { code: 'ar', flag: '🇸🇦', label: 'العربية', title: 'كيف العب', s1:'1. حفظ', s1d:'اللاعب أ ينظر للصورة لمدة 10 ثوان.', s2:'2. شرح', s2d:'اللاعب أ يصفها بالإنجليزية (15 ثانية).', s3:'3. اختيار', s3d:'اللاعب ب يختار الصورة الصحيحة!' },
        { code: 'hi', flag: '🇮🇳', label: 'हिन्दी', title: 'कैसे खेलें', s1:'1. याद रखें', s1d:'खिलाड़ी A 10 सेकंड तक चित्र देखता है।', s2:'2. समझाएं', s2d:'खिलाड़ी A अंग्रेजी में वर्णन करता है।', s3:'3. चुनें', s3d:'खिलाड़ी B सही चित्र चुनता है!' },
        { code: 'nl', flag: '🇳🇱', label: 'Nederlands', title: 'HOE TE SPELEN', s1:'1. Onthouden', s1d:'Speler A kijkt 10s naar de afbeelding.', s2:'2. Uitleggen', s2d:'Speler A beschrijft het in het Engels.', s3:'3. Kiezen', s3d:'Speler B kiest de juiste afbeelding!' },
        { code: 'sv', flag: '🇸🇪', label: 'Svenska', title: 'SÅ HÄR SPELAR DU', s1:'1. Memorera', s1d:'Spelare A tittar på bilden i 10s.', s2:'2. Förklara', s2d:'Spelare A beskriver den på engelska.', s3:'3. Välj', s3d:'Spelare B väljer rätt bild!' },
        { code: 'pl', flag: '🇵🇱', label: 'Polski', title: 'JAK GRAĆ', s1:'1. Zapamiętaj', s1d:'Gracz A patrzy na obrazek przez 10s.', s2:'2. Wyjaśnij', s2d:'Gracz A opisuje go po angielsku.', s3:'3. Wybierz', s3d:'Gracz B wybiera poprawny obrazek!' },
        { code: 'uk', flag: '🇺🇦', label: 'Українська', title: 'ЯК ГРАТИ', s1:'1. Запам\'ятати', s1d:'Гравець А дивиться на малюнок 10с.', s2:'2. Пояснити', s2d:'Гравець А описує англійською.', s3:'3. Вибрати', s3d:'Гравець Б вибирає правильний малюнок!' }
    ];

    // === 状態管理 ===
    const state = {
        quizData: [],
        currentSet: [],
        correctItem: null,
        timerInterval: null,
        langIndex: 0,
        isBgmEnabled: true, 
        isSpeaking: false,
        volumes: {
            menu: 0.1,  // 10%
            game: 0.05, // 5%
            voice: 0.2  // 20%
        },
        layout: {
            ratio: 60,
            textSize: 100
        },
        isPlaying: false
    };

    // === DOM要素 ===
    const elements = {
        views: {
            landing: document.getElementById('view-landing'),
            memory: document.getElementById('view-memory'),
            explain: document.getElementById('view-explain'),
            choice: document.getElementById('view-choice'),
            result: document.getElementById('view-result'),
            settings: document.getElementById('view-settings')
        },
        btns: {
            start: document.getElementById('start-btn'),
            memorySkip: document.getElementById('memory-skip-btn'),
            explainSkip: document.getElementById('explain-skip-btn'),
            next: document.getElementById('next-btn'),
            speak: document.getElementById('speak-btn'),
            settings: document.getElementById('settingsBtn'),
            closeSettings: document.getElementById('closeSettingsBtn'),
            backHome: document.getElementById('backHomeBtn'),
            lang: document.getElementById('langToggle'),
            bgmToggle: document.getElementById('bgmBtn')
        },
        timers: {
            memory: document.getElementById('memory-timer'),
            explain: document.getElementById('explain-timer'),
            explainProgress: document.getElementById('explain-progress')
        },
        imgs: {
            memory: document.getElementById('memory-img'),
            result: document.getElementById('result-img'),
            grid: document.getElementById('choice-grid')
        },
        text: {
            resultTitle: document.getElementById('result-title'),
            resultPhrase: document.getElementById('result-phrase'),
            resultTrans: document.getElementById('result-trans')
        },
        i18n: {
            title: document.getElementById('how-title'),
            s1t: document.getElementById('step1-title'),
            s1d: document.getElementById('step1-desc'),
            s2t: document.getElementById('step2-title'),
            s2d: document.getElementById('step2-desc'),
            s3t: document.getElementById('step3-title'),
            s3d: document.getElementById('step3-desc')
        },
        inputs: {
            menuVol: document.getElementById('vol-menu'),
            gameVol: document.getElementById('vol-game'),
            voiceVol: document.getElementById('vol-voice'),
            menuVal: document.getElementById('vol-menu-val'),
            gameVal: document.getElementById('vol-game-val'),
            voiceVal: document.getElementById('vol-voice-val'),
            ratio: document.getElementById('layout-ratio'),
            ratioVal: document.getElementById('layout-ratio-val'),
            textSize: document.getElementById('text-size'),
            textSizeVal: document.getElementById('text-size-val')
        },
        layoutTargets: {
            imgContainer: document.getElementById('result-layout-img'),
            textContainer: document.getElementById('result-layout-text')
        },
        audio: {
            bgm: document.getElementById('bgmAudio'),
            correct: document.getElementById('seCorrect'),
            wrong: document.getElementById('seWrong')
        }
    };

    // === 初期化 ===
    fetch('data/content.json')
        .then(res => res.json())
        .then(data => { state.quizData = data; })
        .catch(err => console.error("Load Error:", err));

    // 初回インタラクションでBGM開始
    document.body.addEventListener('click', initAudio, { once: true });
    
    function initAudio() {
        if(state.isBgmEnabled) {
            playBgm();
        }
    }

    // === イベントリスナー ===
    elements.btns.start.addEventListener('click', startMemoryPhase);
    elements.btns.memorySkip.addEventListener('click', startExplainPhase);
    elements.btns.explainSkip.addEventListener('click', startChoicePhase);
    elements.btns.next.addEventListener('click', backToLanding);
    elements.btns.speak.addEventListener('click', () => speak(state.correctItem.key_phrase));

    elements.btns.settings.addEventListener('click', openSettings);
    elements.btns.closeSettings.addEventListener('click', closeSettings);
    elements.btns.backHome.addEventListener('click', () => {
        closeSettings();
        if(state.isPlaying) backToLanding();
    });
    
    // 言語切り替え
    elements.btns.lang.addEventListener('click', toggleLanguage);
    
    // BGM切り替え
    elements.btns.bgmToggle.addEventListener('click', toggleBgm);

    // 音量スライダー (inputイベントで即時反映)
    elements.inputs.menuVol.addEventListener('input', (e) => updateVolume('menu', e.target.value));
    elements.inputs.gameVol.addEventListener('input', (e) => updateVolume('game', e.target.value));
    elements.inputs.voiceVol.addEventListener('input', (e) => updateVolume('voice', e.target.value));

    // レイアウトスライダー
    elements.inputs.ratio.addEventListener('input', (e) => updateLayout('ratio', e.target.value));
    elements.inputs.textSize.addEventListener('input', (e) => updateLayout('text', e.target.value));

    // === 機能関数 ===

    function toggleBgm() {
        state.isBgmEnabled = !state.isBgmEnabled;
        const icon = elements.btns.bgmToggle.querySelector('i');
        
        if (state.isBgmEnabled) {
            // ONの見た目
            icon.classList.remove('fa-volume-xmark');
            icon.classList.add('fa-music');
            icon.style.color = "";
            if (!state.isSpeaking) playBgm();
        } else {
            // OFFの見た目
            icon.classList.remove('fa-music');
            icon.classList.add('fa-volume-xmark');
            icon.style.color = "#aaa";
            elements.audio.bgm.pause();
        }
    }

    function playBgm() {
        if (!state.isBgmEnabled) return;
        const targetVol = state.isPlaying ? state.volumes.game : state.volumes.menu;
        elements.audio.bgm.volume = targetVol;
        elements.audio.bgm.play().catch(()=>{});
    }

    function toggleLanguage() {
        state.langIndex = (state.langIndex + 1) % LANGUAGES.length;
        const current = LANGUAGES[state.langIndex];
        
        elements.btns.lang.textContent = current.flag;
        
        elements.i18n.title.textContent = current.title;
        elements.i18n.s1t.textContent = current.s1;
        elements.i18n.s1d.textContent = current.s1d;
        elements.i18n.s2t.textContent = current.s2;
        elements.i18n.s2d.textContent = current.s2d;
        elements.i18n.s3t.textContent = current.s3;
        elements.i18n.s3d.textContent = current.s3d;
    }

    function openSettings() {
        const modal = elements.views.settings;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        setTimeout(() => modal.classList.add('opacity-100'), 10);
    }

    function closeSettings() {
        const modal = elements.views.settings;
        modal.classList.remove('opacity-100');
        setTimeout(() => {
            modal.classList.remove('flex');
            modal.classList.add('hidden');
        }, 300);
    }

    function updateVolume(type, val) {
        const volume = val / 100;
        state.volumes[type] = volume;
        
        if (type === 'menu') elements.inputs.menuVal.textContent = val + '%';
        if (type === 'game') elements.inputs.gameVal.textContent = val + '%';
        if (type === 'voice') elements.inputs.voiceVal.textContent = val + '%';

        if (state.isBgmEnabled && !state.isSpeaking) {
            if (type === 'menu' && !state.isPlaying) elements.audio.bgm.volume = volume;
            if (type === 'game' && state.isPlaying) elements.audio.bgm.volume = volume;
        }
        
        if (type === 'voice') {
            elements.audio.correct.volume = volume;
            elements.audio.wrong.volume = volume;
        }
    }

    function updateLayout(type, val) {
        if (type === 'ratio') {
            state.layout.ratio = val;
            elements.inputs.ratioVal.textContent = val + '%';
            elements.layoutTargets.imgContainer.style.flexBasis = val + '%';
        }
        if (type === 'text') {
            state.layout.textSize = val;
            elements.inputs.textSizeVal.textContent = val + '%';
            const scale = val / 100;
            elements.text.resultPhrase.style.fontSize = `${scale * 2.25}rem`; 
            elements.text.resultPhrase.style.lineHeight = `${scale * 1.2}`;
        }
    }

    function speak(text) {
        state.isSpeaking = true;
        if (state.isBgmEnabled) {
            elements.audio.bgm.pause();
        }

        const uttr = new SpeechSynthesisUtterance(text);
        uttr.lang = 'en-US';
        uttr.volume = state.volumes.voice;

        uttr.onend = () => {
            state.isSpeaking = false;
            if (state.isBgmEnabled) {
                playBgm();
            }
        };
        
        uttr.onerror = () => {
            state.isSpeaking = false;
            if (state.isBgmEnabled) playBgm();
        };

        speechSynthesis.speak(uttr);
    }

    // === Game Logic ===

    function showView(viewName) {
        Object.values(elements.views).forEach(el => {
            if(el.id !== 'view-settings') el.classList.add('hidden');
        });
        elements.views[viewName].classList.remove('hidden');

        if (viewName === 'landing') {
            state.isPlaying = false;
            if (state.isBgmEnabled) {
                elements.audio.bgm.volume = state.volumes.menu;
                elements.audio.bgm.play().catch(()=>{});
            }
        } else {
            state.isPlaying = true;
            if (state.isBgmEnabled) {
                elements.audio.bgm.volume = state.volumes.game;
                elements.audio.bgm.play().catch(()=>{});
            }
        }
    }

    function startMemoryPhase() {
        if (!prepareQuizData()) return;
        showView('memory');
        elements.imgs.memory.src = `assets/images/${state.correctItem.filename}`;
        
        let timeLeft = MEMORY_TIME;
        elements.timers.memory.textContent = timeLeft;
        
        clearInterval(state.timerInterval);
        state.timerInterval = setInterval(() => {
            timeLeft--;
            elements.timers.memory.textContent = timeLeft;
            if (timeLeft <= 0) startExplainPhase();
        }, 1000);
    }

    function startExplainPhase() {
        clearInterval(state.timerInterval);
        showView('explain');
        
        let timeLeft = EXPLAIN_TIME;
        const total = EXPLAIN_TIME;
        const maxDash = 283;
        
        elements.timers.explain.textContent = timeLeft;
        elements.timers.explainProgress.style.strokeDashoffset = 0;

        state.timerInterval = setInterval(() => {
            timeLeft--;
            elements.timers.explain.textContent = timeLeft;
            const offset = maxDash - (timeLeft / total) * maxDash;
            elements.timers.explainProgress.style.strokeDashoffset = offset;
            
            if (timeLeft <= 0) startChoicePhase();
        }, 1000);
    }

    function startChoicePhase() {
        clearInterval(state.timerInterval);
        showView('choice');
        renderGrid();
    }

    function renderGrid() {
        const grid = elements.imgs.grid;
        grid.innerHTML = '';
        state.currentSet.forEach(item => {
            const btn = document.createElement('button');
            btn.className = 'relative w-full h-full overflow-hidden rounded-2xl border-4 border-white shadow-lg hover:scale-[1.02] transition-transform duration-200 group bg-slate-100';
            
            const img = document.createElement('img');
            img.src = `assets/images/${item.filename}`;
            img.className = 'w-full h-full object-contain';
            
            btn.appendChild(img);
            btn.onclick = () => checkAnswer(item, btn);
            grid.appendChild(btn);
        });
    }

    function checkAnswer(item, btn) {
        if (item.id === state.correctItem.id) {
            elements.audio.correct.currentTime = 0;
            elements.audio.correct.volume = state.volumes.voice;
            elements.audio.correct.play();
            
            btn.className += ' border-yellow-400 ring-8 ring-yellow-200 z-20';
            triggerConfetti();
            setTimeout(showResultPhase, 1500);
        } else {
            elements.audio.wrong.currentTime = 0;
            elements.audio.wrong.volume = state.volumes.voice;
            elements.audio.wrong.play();
            btn.classList.add('opacity-40', 'grayscale');
        }
    }

    function showResultPhase() {
        showView('result');
        elements.imgs.result.src = `assets/images/${state.correctItem.filename}`;
        elements.text.resultTitle.textContent = state.correctItem.title;
        elements.text.resultPhrase.textContent = state.correctItem.key_phrase;
        elements.text.resultTrans.textContent = state.correctItem.translation;
        
        document.getElementById('result-trans').classList.add('hidden');
        
        speak(state.correctItem.key_phrase);
    }

    function backToLanding() {
        showView('landing');
    }

    function prepareQuizData() {
        if (!state.quizData || state.quizData.length < 4) {
            alert("Data not loaded or insufficient (need 4 images).");
            return false;
        }
        state.correctItem = state.quizData[Math.floor(Math.random() * state.quizData.length)];
        let opts = state.quizData.filter(i => i.group === state.correctItem.group);
        while(opts.length < 4) {
            let r = state.quizData[Math.floor(Math.random() * state.quizData.length)];
            if(!opts.includes(r)) opts.push(r);
        }
        state.currentSet = opts.sort(() => Math.random() - 0.5).slice(0, 4);
        if(!state.currentSet.includes(state.correctItem)) {
            state.currentSet[0] = state.correctItem;
            state.currentSet.sort(() => Math.random() - 0.5);
        }
        return true;
    }

    function triggerConfetti() {
        confetti({ particleCount: 200, spread: 80, origin: { y: 0.6 }, colors: ['#FFD700', '#FF69B4', '#00BFFF'] });
    }
});