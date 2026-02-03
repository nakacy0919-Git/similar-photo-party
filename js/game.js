document.addEventListener('DOMContentLoaded', () => {
    // === 定数 ===
    const MEMORY_TIME = 10;
    const EXPLAIN_TIME = 15;
    
    const I18N = {
        en: {
            howToPlay: "HOW TO PLAY",
            step1Title: "1. Memorize",
            step1Desc: "Player A looks at the image for 10s.",
            step2Title: "2. Explain",
            step2Desc: "Player A describes it in English (15s).",
            step3Title: "3. Choose",
            step3Desc: "Player B picks the correct image!",
            time: "Time",
            explainTitle: "Player A: Explain now!",
            explainDesc: "Describe the features to Player B."
        },
        ja: {
            howToPlay: "遊び方",
            step1Title: "1. 覚える",
            step1Desc: "Aさんは画像を10秒間で覚えます。",
            step2Title: "2. 説明する",
            step2Desc: "Aさんは英語で画像の特徴を説明します(15秒)。",
            step3Title: "3. 選ぶ",
            step3Desc: "Bさんは説明を聞いて正解の画像を選びます！",
            time: "残り時間",
            explainTitle: "Aさん：説明タイム！",
            explainDesc: "Bさんに画像の特徴を伝えてください。"
        }
    };

    // === 状態管理 ===
    const state = {
        quizData: [],
        currentSet: [],
        correctItem: null,
        timerInterval: null,
        lang: 'en',
        volumes: {
            menu: 0.1,  // 10%
            game: 0.05, // 5%
            voice: 0.2  // 20%
        },
        layout: {
            ratio: 60,  // Image width %
            textSize: 100 // Text scale %
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
            lang: document.getElementById('langToggle')
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
            resultTrans: document.getElementById('result-trans'),
            langLabel: document.getElementById('lang-text')
        },
        // 設定入力
        inputs: {
            menuVol: document.getElementById('vol-menu'),
            gameVol: document.getElementById('vol-game'),
            voiceVol: document.getElementById('vol-voice'),
            menuVal: document.getElementById('vol-menu-val'),
            gameVal: document.getElementById('vol-game-val'),
            voiceVal: document.getElementById('vol-voice-val'),
            // レイアウト設定
            ratio: document.getElementById('layout-ratio'),
            ratioVal: document.getElementById('layout-ratio-val'),
            textSize: document.getElementById('text-size'),
            textSizeVal: document.getElementById('text-size-val')
        },
        // レイアウト操作対象
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
        elements.audio.bgm.volume = state.volumes.menu;
        elements.audio.bgm.play().catch(()=>{});
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
    elements.btns.lang.addEventListener('click', toggleLanguage);

    // 音量スライダー
    elements.inputs.menuVol.addEventListener('input', (e) => updateVolume('menu', e.target.value));
    elements.inputs.gameVol.addEventListener('input', (e) => updateVolume('game', e.target.value));
    elements.inputs.voiceVol.addEventListener('input', (e) => updateVolume('voice', e.target.value));

    // レイアウトスライダー (New)
    elements.inputs.ratio.addEventListener('input', (e) => updateLayout('ratio', e.target.value));
    elements.inputs.textSize.addEventListener('input', (e) => updateLayout('text', e.target.value));

    // === ロジック ===

    function showView(viewName) {
        Object.values(elements.views).forEach(el => {
            if(el.id !== 'view-settings') el.classList.add('hidden');
        });
        elements.views[viewName].classList.remove('hidden');

        if (viewName === 'landing') {
            state.isPlaying = false;
            fadeBgmTo(state.volumes.menu);
        } else {
            state.isPlaying = true;
            fadeBgmTo(state.volumes.game);
        }
    }

    function fadeBgmTo(targetVol) {
        elements.audio.bgm.volume = targetVol;
    }

    function toggleLanguage() {
        state.lang = state.lang === 'en' ? 'ja' : 'en';
        elements.text.langLabel.textContent = state.lang === 'en' ? 'English' : '日本語';
        
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (I18N[state.lang][key]) {
                el.textContent = I18N[state.lang][key];
            }
        });
    }

    function openSettings() {
        const modal = elements.views.settings;
        modal.classList.remove('hidden');
        setTimeout(() => modal.classList.add('flex', 'opacity-100', 'scale-100'), 10);
    }

    function closeSettings() {
        const modal = elements.views.settings;
        modal.classList.remove('flex', 'opacity-100', 'scale-100');
        setTimeout(() => modal.classList.add('hidden'), 300);
    }

    function updateVolume(type, val) {
        const volume = val / 100;
        state.volumes[type] = volume;
        
        if (type === 'menu') elements.inputs.menuVal.textContent = val + '%';
        if (type === 'game') elements.inputs.gameVal.textContent = val + '%';
        if (type === 'voice') elements.inputs.voiceVal.textContent = val + '%';

        if (type === 'menu' && !state.isPlaying) elements.audio.bgm.volume = volume;
        if (type === 'game' && state.isPlaying) elements.audio.bgm.volume = volume;
        if (type === 'voice') {
            elements.audio.correct.volume = volume;
            elements.audio.wrong.volume = volume;
        }
    }

    function updateLayout(type, val) {
        if (type === 'ratio') {
            state.layout.ratio = val;
            elements.inputs.ratioVal.textContent = val + '%';
            // PC表示時のみ flex-basis を適用 (スマホは縦積みなので無視される)
            elements.layoutTargets.imgContainer.style.flexBasis = val + '%';
        }
        if (type === 'text') {
            state.layout.textSize = val;
            elements.inputs.textSizeVal.textContent = val + '%';
            // transform: scale() で文字サイズを拡縮
            const scale = val / 100;
            elements.text.resultPhrase.style.fontSize = `${scale * 2.25}rem`; // base 2.25rem (text-4xl)
            elements.text.resultPhrase.style.lineHeight = `${scale * 1.2}`;
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
        
        elements.timers.explain.textContent = timeLeft;
        elements.timers.explainProgress.style.strokeDashoffset = 0;

        state.timerInterval = setInterval(() => {
            timeLeft--;
            elements.timers.explain.textContent = timeLeft;
            const offset = 100 - (timeLeft / total) * 100;
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
        
        // 翻訳は隠す
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

    function speak(text) {
        const uttr = new SpeechSynthesisUtterance(text);
        uttr.lang = 'en-US';
        uttr.volume = state.volumes.voice;
        speechSynthesis.speak(uttr);
    }
});