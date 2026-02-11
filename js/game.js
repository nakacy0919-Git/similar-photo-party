document.addEventListener('DOMContentLoaded', () => {
    // === 定数 ===
    const MEMORY_TIME = 10;
    const EXPLAIN_TIME = 15;
    
    // チュートリアル用のデータ (英語/日本語)
    const TUTORIAL_DATA = {
        en: {
            title: 'HOW TO PLAY',
            steps: [
                { badge: 'STEP 1', title: 'Memorize', desc: 'Player A looks at the image for 10s. Memorize the details!', img: 'assets/images/tutorial_1.webp' },
                { badge: 'STEP 2', title: 'Explain', desc: 'Player A describes the image in English (15s). Player B listens.', img: 'assets/images/tutorial_2.webp' },
                { badge: 'STEP 3', title: 'Choose', desc: 'Player B picks the correct image from 4 choices. Good luck!', img: 'assets/images/tutorial_3.webp' }
            ],
            btnNext: 'Next',
            btnStart: 'Start Game!',
            langLabel: '日本語'
        },
        ja: {
            title: '遊び方',
            steps: [
                { badge: 'ステップ 1', title: '覚える', desc: 'Aさんは画像を10秒間見て、詳細まで覚えます。', img: 'assets/images/tutorial_1.webp' },
                { badge: 'ステップ 2', title: '説明する', desc: 'Aさんは英語で画像の特徴を説明します(15秒)。Bさんは聞きます。', img: 'assets/images/tutorial_2.webp' },
                { badge: 'ステップ 3', title: '選ぶ', desc: 'Bさんは説明を聞いて、4枚の中から正解を選びます！', img: 'assets/images/tutorial_3.webp' }
            ],
            btnNext: '次へ',
            btnStart: 'ゲーム開始！',
            langLabel: 'English'
        }
    };

    // === 状態管理 ===
    const state = {
        quizData: [],
        currentSet: [],
        correctItem: null,
        timerInterval: null,
        isBgmEnabled: true, 
        isSpeaking: false,
        volumes: {
            menu: 0.1,
            game: 0.05,
            voice: 0.2
        },
        layout: {
            ratio: 60,
            textSize: 100
        },
        isPlaying: false,
        // チュートリアル状態
        tutStep: 0,
        tutLang: 'en'
    };

    // === DOM要素 ===
    const elements = {
        views: {
            landing: document.getElementById('view-landing'),
            tutorial: document.getElementById('view-tutorial'),
            memory: document.getElementById('view-memory'),
            explain: document.getElementById('view-explain'),
            choice: document.getElementById('view-choice'),
            result: document.getElementById('view-result'),
            settings: document.getElementById('view-settings')
        },
        btns: {
            start: document.getElementById('start-btn'),
            tutorial: document.getElementById('tutorial-btn'), // LandingのHow to Playボタン
            tutClose: document.getElementById('tut-close-btn'),
            tutNext: document.getElementById('tut-next-btn'),
            tutLang: document.getElementById('tut-lang-btn'),
            
            memorySkip: document.getElementById('memory-skip-btn'),
            explainSkip: document.getElementById('explain-skip-btn'),
            next: document.getElementById('next-btn'),
            speak: document.getElementById('speak-btn'),
            settings: document.getElementById('settingsBtn'),
            closeSettings: document.getElementById('closeSettingsBtn'),
            backHome: document.getElementById('backHomeBtn'),
            bgmToggle: document.getElementById('bgmBtn')
        },
        tutElements: {
            header: document.getElementById('tut-header'),
            img: document.getElementById('tut-img'),
            badge: document.getElementById('tut-step-badge'),
            title: document.getElementById('tut-title'),
            desc: document.getElementById('tut-desc'),
            langText: document.getElementById('tut-lang-text')
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

    document.body.addEventListener('click', initAudio, { once: true });
    
    function initAudio() {
        if(state.isBgmEnabled) {
            playBgm();
        }
    }

    // === イベントリスナー ===
    elements.btns.start.addEventListener('click', startMemoryPhase);
    
    // Tutorial Events
    elements.btns.tutorial.addEventListener('click', openTutorial);
    elements.btns.tutClose.addEventListener('click', closeTutorial);
    elements.btns.tutNext.addEventListener('click', nextTutorialStep);
    elements.btns.tutLang.addEventListener('click', toggleTutorialLang);

    // Game Flow Events
    elements.btns.memorySkip.addEventListener('click', startExplainPhase);
    elements.btns.explainSkip.addEventListener('click', startChoicePhase);
    elements.btns.next.addEventListener('click', backToLanding);
    elements.btns.speak.addEventListener('click', () => speak(state.correctItem.key_phrase));

    // Settings & Controls
    elements.btns.settings.addEventListener('click', openSettings);
    elements.btns.closeSettings.addEventListener('click', closeSettings);
    elements.btns.backHome.addEventListener('click', () => {
        closeSettings();
        if(state.isPlaying) backToLanding();
    });
    
    elements.btns.bgmToggle.addEventListener('click', toggleBgm);

    elements.inputs.menuVol.addEventListener('input', (e) => updateVolume('menu', e.target.value));
    elements.inputs.gameVol.addEventListener('input', (e) => updateVolume('game', e.target.value));
    elements.inputs.voiceVol.addEventListener('input', (e) => updateVolume('voice', e.target.value));

    elements.inputs.ratio.addEventListener('input', (e) => updateLayout('ratio', e.target.value));
    elements.inputs.textSize.addEventListener('input', (e) => updateLayout('text', e.target.value));

    // === Tutorial Logic ===

    function openTutorial() {
        state.tutStep = 0;
        updateTutorialView();
        elements.views.tutorial.classList.remove('hidden');
    }

    function closeTutorial() {
        elements.views.tutorial.classList.add('hidden');
    }

    function nextTutorialStep() {
        if (state.tutStep < 2) {
            state.tutStep++;
            updateTutorialView();
        } else {
            closeTutorial();
        }
    }

    function toggleTutorialLang() {
        state.tutLang = state.tutLang === 'en' ? 'ja' : 'en';
        updateTutorialView();
    }

    function updateTutorialView() {
        const data = TUTORIAL_DATA[state.tutLang];
        const stepData = data.steps[state.tutStep];

        // テキスト更新
        elements.tutElements.header.textContent = data.title;
        elements.tutElements.badge.textContent = stepData.badge;
        elements.tutElements.title.textContent = stepData.title;
        elements.tutElements.desc.textContent = stepData.desc;
        elements.tutElements.langText.textContent = data.langLabel;
        
        // 画像更新 (プレースホルダー対応)
        // ※画像がない場合は仮のアイコン等を表示するロジックを入れても良いですが
        // 今回はassets内の画像を読み込む前提です
        elements.tutElements.img.src = stepData.img;

        // ボタン更新
        if (state.tutStep === 2) {
            elements.btns.tutNext.innerHTML = `${data.btnStart} <i class="fa-solid fa-play ml-2"></i>`;
            elements.btns.tutNext.classList.remove('bg-indigo-500', 'hover:bg-indigo-600');
            elements.btns.tutNext.classList.add('bg-pink-500', 'hover:bg-pink-600');
        } else {
            elements.btns.tutNext.innerHTML = `${data.btnNext} <i class="fa-solid fa-chevron-right ml-2"></i>`;
            elements.btns.tutNext.classList.add('bg-indigo-500', 'hover:bg-indigo-600');
            elements.btns.tutNext.classList.remove('bg-pink-500', 'hover:bg-pink-600');
        }
    }


    // === Common Functions ===

    function toggleBgm() {
        state.isBgmEnabled = !state.isBgmEnabled;
        const icon = elements.btns.bgmToggle.querySelector('i');
        
        if (state.isBgmEnabled) {
            icon.classList.remove('fa-volume-xmark');
            icon.classList.add('fa-music');
            icon.style.color = "";
            if (!state.isSpeaking) playBgm();
        } else {
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