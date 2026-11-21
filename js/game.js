document.addEventListener('DOMContentLoaded', () => {
    // === 定数 ===
    const MEMORY_TIME_OPTIONS = [5, 10, 15];
    const SPEAKING_MISSIONS = [
        {
            title: '1 · Name it / 何がある？',
            task: 'Name the main person or object clearly.',
            support: 'I can see ... / There is ...',
            question: 'What is the main thing in the picture?'
        },
        {
            title: '2 · Place it / どこにある？',
            task: 'Explain exactly where the person or object is.',
            support: 'It is next to ... / behind ... / between ...',
            question: 'Could you tell me exactly where it is?'
        },
        {
            title: '3 · Make it unique / 何が違う？',
            task: 'Describe a detail that helps your partner recognize the right photo.',
            support: 'Look at its color, number, shape, or action.',
            question: 'What special detail should I look for?'
        }
    ];
    const REVIEW_CRITERIA = ['subject', 'location', 'detail'];
    
    // チュートリアル用のデータ (英語/日本語)
    const TUTORIAL_DATA = {
        en: {
            title: 'HOW TO PLAY',
            steps: [
                { badge: 'STEP 1', title: 'Memorize', desc: 'Player A looks at the image for 10s. Memorize the details!', img: 'assets/images/tutorial_1.webp' },
                { badge: 'STEP 2', title: 'Explain', desc: 'Player A describes the image in English. Player B listens.', img: 'assets/images/tutorial_2.webp' },
                { badge: 'STEP 3', title: 'Choose', desc: 'Player B picks the correct image from 4 choices. Good luck!', img: 'assets/images/tutorial_3.webp' }
            ],
            btnNext: 'Next',
            btnStart: 'Start Game!',
            langLabel: '日本語',
            btnPrev: 'Back'
        },
        ja: {
            title: '遊び方',
            steps: [
                { badge: 'ステップ 1', title: '覚える', desc: 'Aさんは画像を10秒間見て、詳細まで覚えます。', img: 'assets/images/tutorial_1.webp' },
                { badge: 'ステップ 2', title: '説明する', desc: 'Aさんは英語で画像の特徴を説明します。Bさんは聞きます。', img: 'assets/images/tutorial_2.webp' },
                { badge: 'ステップ 3', title: '選ぶ', desc: 'Bさんは説明を聞いて、4枚の中から正解を選びます！', img: 'assets/images/tutorial_3.webp' }
            ],
            btnNext: '次へ',
            btnStart: 'ゲーム開始！',
            langLabel: 'English',
            btnPrev: '戻る'
        }
    };

    // === 状態管理 ===
    const state = {
        quizData: [],
        phase: "landing",
        round: 0,
        firstCorrect: 0,
        score: 0,
        lastPoints: 0,
        attempts: 0,
        remaining: [],
        resultTimeout: null,
        generation: 0,
        currentSet: [],
        correctItem: null,
        timerInterval: null,
        isBgmEnabled: true, 
        isSpeaking: false,
        speechToken: 0,
        speechTimeout: null,
        activeCountdown: null,
        clueUsed: false,
        missionIndex: 0,
        reviewSelection: {subject: false, location: false, detail: false},
        peerReviews: new Map(),
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
        tutLang: 'en',
        // 時間と英語ヒントの設定（初期値）
        memoryTime: 10,
        explainTime: 30,
        hintMode: 'guided'
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
            tutorial: document.getElementById('tutorial-btn'),
            tutClose: document.getElementById('tut-close-btn'),
            tutNext: document.getElementById('tut-next-btn'),
            tutPrev: document.getElementById('tut-prev-btn'),
            tutLang: document.getElementById('tut-lang-btn'),
            review: document.getElementById('reviewLink'),
            
            memorySkip: document.getElementById('memory-skip-btn'),
            explainSkip: document.getElementById('explain-skip-btn'),
            next: document.getElementById('next-btn'),
            speak: document.getElementById('speak-btn'),
            translationToggle: document.getElementById('translation-toggle-btn'),
            settings: document.getElementById('settingsBtn'),
            closeSettings: document.getElementById('closeSettingsBtn'),
            backHome: document.getElementById('backHomeBtn'),
            bgmToggle: document.getElementById('bgmBtn'),
            // 時間選択ボタン
            timeSelectors: document.querySelectorAll('.time-select-btn'),
            memorySelectors: document.querySelectorAll('.memory-time-select-btn'),
            hintSelectors: document.querySelectorAll('.hint-mode-btn'),
            clueRequest: document.getElementById('clue-request-btn'),
            feedbackChecks: document.querySelectorAll('.feedback-check')
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
            explainHint: document.getElementById('explain-hint'),
            audioStatus: document.getElementById('audio-status'),
            nextRole: document.getElementById('next-role'),
            memoryMission: document.getElementById('memory-mission'),
            explainMission: document.getElementById('explain-mission'),
            clueRequestNote: document.getElementById('clue-request-note'),
            feedbackProgress: document.getElementById('feedback-progress'),
            feedbackSession: document.getElementById('feedback-session'),
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
        roles: {
            memory: document.getElementById('role-memory'),
            explain: document.getElementById('role-explain'),
            choice: document.getElementById('role-choice'),
            result: document.getElementById('role-result')
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
    elements.btns.start.disabled = true;
    const loadStatus = document.getElementById('load-status');
    fetch('data/content.json')
        .then(res => { if (!res.ok) throw new Error('HTTP ' + res.status); return res.json(); })
        .then(data => {
            if (!Array.isArray(data)) throw new Error('Invalid data');
            const ids = new Set();
            const files = new Set();
            const groups = new Map();
            for (const item of data) {
                if (!item || !['id', 'filename', 'group', 'title', 'key_phrase', 'translation'].every(
                    key => typeof item[key] === 'string' && item[key].trim() && item[key].length <= 2000
                ) || !/^[a-zA-Z0-9_-]+\.(webp|png|jpe?g)$/.test(item.filename)
                    || ids.has(item.id) || files.has(item.filename)) throw new Error('Invalid item');
                ids.add(item.id); files.add(item.filename);
                if (!groups.has(item.group)) groups.set(item.group, []);
                groups.get(item.group).push(item);
            }
            state.quizData = [...groups.values()].filter(group => group.length >= 4).flat();
            if (state.quizData.length < 4) throw new Error('No complete image groups');
            loadStatus.textContent = 'ペアやグループで遊べます。説明役だけが写真を見て、回答役が4枚から選びます。';
            elements.btns.start.disabled = false;
        })
        .catch(err => {
            loadStatus.textContent = '教材を読み込めませんでした。ページを再読み込みしてください。';
            console.error('Load Error:', err);
        });

    document.body.addEventListener('click', initAudio, { once: true });
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            elements.audio.bgm.pause();
            if (state.isSpeaking) {
                stopSpeech();
                elements.text.audioStatus.textContent = '音声は一時停止しました。Listenで再生できます。';
            }
        } else {
            playBgm();
        }
    });
    
    function initAudio() {
        if(state.isBgmEnabled && elements.views.tutorial.classList.contains('hidden')) {
            playBgm();
        }
    }

    // === イベントリスナー ===
    elements.btns.start.addEventListener('click', startMemoryPhase);
    
    // Tutorial Events
    elements.btns.tutorial.addEventListener('click', openTutorial);
    elements.btns.tutClose.addEventListener('click', closeTutorial);
    elements.btns.tutNext.addEventListener('click', nextTutorialStep);
    elements.btns.tutPrev.addEventListener('click', prevTutorialStep);
    elements.btns.tutLang.addEventListener('click', toggleTutorialLang);

    // Review Link Event
    elements.btns.review.addEventListener('click', () => {
        elements.audio.bgm.pause();
    });

    // Game Flow Events
    elements.btns.memorySkip.addEventListener('click', startExplainPhase);
    elements.btns.explainSkip.addEventListener('click', startChoicePhase);
    elements.btns.next.addEventListener('click', startMemoryPhase);
    elements.btns.speak.addEventListener('click', () => { if (state.phase === 'result' && state.correctItem) speak(state.correctItem.key_phrase); });
    elements.btns.translationToggle.addEventListener('click', () => {
        if (state.phase !== 'result') return;
        const translation = elements.text.resultTrans;
        const show = translation.classList.contains('hidden');
        translation.classList.toggle('hidden', !show);
        elements.btns.translationToggle.setAttribute('aria-expanded', String(show));
    });
    elements.btns.clueRequest.addEventListener('click', askForOneMoreClue);
    elements.btns.feedbackChecks.forEach(input => {
        input.addEventListener('change', () => setPeerFeedback(input.getAttribute('data-criterion'), input.checked));
    });

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

    // 時間選択ボタンのイベント
    elements.btns.timeSelectors.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // 全てのボタンのデザインをリセット
            elements.btns.timeSelectors.forEach(b => {
                b.classList.remove('bg-indigo-500', 'text-white', 'border-indigo-500');
                b.classList.add('border-slate-200', 'text-slate-500');
            });
            // 選択されたボタンのデザインを変更
            e.target.classList.remove('border-slate-200', 'text-slate-500');
            e.target.classList.add('bg-indigo-500', 'text-white', 'border-indigo-500');
            
            // 状態を更新
            state.explainTime = parseInt(e.target.getAttribute('data-time'));
        });
    });


    // Selected classroom options are applied to the next round; current scoring is unchanged.
    function markSelectedButtons(buttons, attribute, selectedValue) {
        buttons.forEach(button => {
            const active = button.getAttribute(attribute) === String(selectedValue);
            button.classList[active ? 'add' : 'remove']('bg-indigo-500', 'text-white', 'border-indigo-500');
            button.classList[active ? 'remove' : 'add']('border-slate-200', 'text-slate-500');
            button.setAttribute('aria-pressed', String(active));
        });
    }

    function setMemoryTime(value) {
        const seconds = Number(value);
        if (!MEMORY_TIME_OPTIONS.includes(seconds)) return false;
        state.memoryTime = seconds;
        markSelectedButtons(elements.btns.memorySelectors, 'data-memory-time', seconds);
        if (!elements.views.tutorial.classList.contains('hidden') && state.tutStep === 0) {
            updateTutorialView();
        }
        return true;
    }

    function updateExplainHint() {
        if (state.hintMode === 'free') elements.text.explainHint.classList.add('hidden');
        else elements.text.explainHint.classList.remove('hidden');
        updateMissionPrompts();
    }

    function updateMissionPrompts() {
        const mission = SPEAKING_MISSIONS[state.missionIndex];
        elements.text.memoryMission.textContent = `${mission.title} · ${mission.task}`;
        elements.text.explainMission.textContent = state.hintMode === 'guided'
            ? `${mission.title}: ${mission.task} ${mission.support}`
            : `${mission.title}: ${mission.task}`;
    }

    function askForOneMoreClue() {
        if (state.phase !== 'explain' || state.clueUsed || !state.activeCountdown) return false;
        state.clueUsed = true;
        state.activeCountdown.remainingMs += 10000;
        state.activeCountdown.totalMs += 10000;
        elements.timers.explain.textContent = Math.ceil(state.activeCountdown.remainingMs / 1000);
        elements.btns.clueRequest.disabled = true;
        elements.text.clueRequestNote.textContent = `Listener: "${SPEAKING_MISSIONS[state.missionIndex].question}" (+10s)`;
        return true;
    }

    function setPeerFeedback(criterion, checked) {
        if (state.phase !== 'result' || !REVIEW_CRITERIA.includes(criterion)) return false;
        state.reviewSelection[criterion] = checked === true;
        const values = REVIEW_CRITERIA.map(key => state.reviewSelection[key]);
        if (values.some(Boolean)) {
            state.peerReviews.set(state.round, {
                speaker: state.round % 2 === 1 ? 'A' : 'B',
                count: values.filter(Boolean).length
            });
        } else {
            state.peerReviews.delete(state.round);
        }
        updatePeerReviewSummary();
        return true;
    }

    function updatePeerReviewSummary() {
        const count = REVIEW_CRITERIA.filter(key => state.reviewSelection[key]).length;
        elements.text.feedbackProgress.textContent = `説明できた項目：${count}/3（ペアによる確認）`;
        const stats = {A: {rounds: 0, points: 0}, B: {rounds: 0, points: 0}};
        for (const record of state.peerReviews.values()) {
            stats[record.speaker].rounds++;
            stats[record.speaker].points += record.count;
        }
        const line = speaker => stats[speaker].rounds
            ? `Player ${speaker}: ${stats[speaker].points}/${stats[speaker].rounds * 3}（${stats[speaker].rounds}回）`
            : `Player ${speaker}: 未確認`;
        elements.text.feedbackSession.textContent = `${line('A')} · ${line('B')}`;
    }

    function resetPeerFeedback() {
        state.reviewSelection = {subject: false, location: false, detail: false};
        elements.btns.feedbackChecks.forEach(input => { input.checked = false; });
        updatePeerReviewSummary();
    }

    function setHintMode(value) {
        if (!['guided', 'free'].includes(value)) return false;
        state.hintMode = value;
        markSelectedButtons(elements.btns.hintSelectors, 'data-hint-mode', value);
        updateExplainHint();
        return true;
    }

    elements.btns.memorySelectors.forEach(button => {
        button.addEventListener('click', () => setMemoryTime(button.getAttribute('data-memory-time')));
    });
    elements.btns.hintSelectors.forEach(button => {
        button.addEventListener('click', () => setHintMode(button.getAttribute('data-hint-mode')));
    });

    // === Tutorial Logic ===

    function openTutorial() {
        elements.audio.bgm.pause();
        stopSpeech();
        state.tutStep = 0;
        updateTutorialView();
        elements.views.tutorial.classList.remove('hidden');
    }

    function closeTutorial() {
        elements.views.tutorial.classList.add('hidden');
        if(state.isBgmEnabled) playBgm();
    }

    function nextTutorialStep() {
        if (state.tutStep < 2) {
            state.tutStep++;
            updateTutorialView();
        } else {
            closeTutorial();
            startMemoryPhase();
        }
    }

    function prevTutorialStep() {
        if (state.tutStep > 0) {
            state.tutStep--;
            updateTutorialView();
        }
    }

    function toggleTutorialLang() {
        state.tutLang = state.tutLang === 'en' ? 'ja' : 'en';
        updateTutorialView();
    }

    function setTutorialButton(button, label, iconClass, iconFirst) {
        // Never interpret labels as HTML, even if localized labels change later.
        button.textContent = '';
        const icon = document.createElement('i');
        icon.className = iconClass;
        const textLabel = document.createElement('span');
        textLabel.textContent = label;
        if (iconFirst) {
            button.appendChild(icon);
            button.appendChild(textLabel);
        } else {
            button.appendChild(textLabel);
            button.appendChild(icon);
        }
    }

    function updateTutorialView() {
        const data = TUTORIAL_DATA[state.tutLang];
        const stepData = data.steps[state.tutStep];

        elements.tutElements.header.textContent = data.title;
        elements.tutElements.badge.textContent = stepData.badge;
        elements.tutElements.title.textContent = stepData.title;
        elements.tutElements.desc.textContent = state.tutStep === 0
            ? (state.tutLang === 'en'
                ? `Player A looks at the image for ${state.memoryTime}s. Memorize the details!`
                : `Aさんは画像を${state.memoryTime}秒間見て、詳細まで覚えます。`)
            : stepData.desc;
        elements.tutElements.langText.textContent = data.langLabel;
        elements.tutElements.img.src = stepData.img;

        if (state.tutStep === 0) {
            elements.btns.tutPrev.disabled = true;
            elements.btns.tutPrev.classList.add('opacity-30', 'pointer-events-none');
        } else {
            elements.btns.tutPrev.disabled = false;
            elements.btns.tutPrev.classList.remove('opacity-30', 'pointer-events-none');
            setTutorialButton(elements.btns.tutPrev, data.btnPrev, 'fa-solid fa-chevron-left', true);
        }

        if (state.tutStep === 2) {
            setTutorialButton(elements.btns.tutNext, data.btnStart, 'fa-solid fa-play ml-2', false);
            elements.btns.tutNext.classList.remove('bg-indigo-600', 'hover:bg-indigo-700');
            elements.btns.tutNext.classList.add('bg-pink-500', 'hover:bg-pink-600');
        } else {
            setTutorialButton(elements.btns.tutNext, data.btnNext, 'fa-solid fa-chevron-right ml-2', false);
            elements.btns.tutNext.classList.add('bg-indigo-600', 'hover:bg-indigo-700');
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
            if (!state.isSpeaking && elements.views.tutorial.classList.contains('hidden')) playBgm();
        } else {
            icon.classList.remove('fa-music');
            icon.classList.add('fa-volume-xmark');
            icon.style.color = "#aaa";
            elements.audio.bgm.pause();
        }
    }

    function playBgm() {
        if (!state.isBgmEnabled || state.isSpeaking || document.hidden ||
            !elements.views.tutorial.classList.contains('hidden')) return;
        const targetVol = state.isPlaying ? state.volumes.game : state.volumes.menu;
        elements.audio.bgm.volume = targetVol;
        try {
            const pending = elements.audio.bgm.play();
            if (pending && typeof pending.catch === 'function') pending.catch(() => {});
        } catch {
            // Audio may be blocked until a user gesture (especially on iOS).
        }
    }

    function playEffect(audio) {
        if (document.hidden) return;
        try {
            audio.currentTime = 0;
            audio.volume = state.volumes.voice;
            const pending = audio.play();
            if (pending && typeof pending.catch === 'function') pending.catch(() => {});
        } catch {
            // Missing audio hardware / autoplay restrictions should never block the game.
        }
    }

    function updateRoleCues() {
        const speaker = state.round % 2 === 1 ? 'A' : 'B';
        const listener = speaker === 'A' ? 'B' : 'A';
        elements.roles.memory.textContent = `Player ${speaker}: 写真を記憶 ／ Player ${listener}: 画面を見ない`;
        elements.roles.explain.textContent = `Player ${speaker}: 英語で説明 ／ Player ${listener}: 聞くだけ`;
        elements.roles.choice.textContent = `Player ${listener}: 写真を選ぶ ／ Player ${speaker}: 答えを指ささない`;
        elements.roles.result.textContent = `次はPlayer ${listener}が説明役！ 2人で英語の違いを言ってみよう。`;
        elements.text.nextRole.textContent = `Next: Player ${listener} speaks`;
    }

    function openSettings() {
        const modal = elements.views.settings;
        modal.classList.remove('hidden');
        modal.classList.add('flex');
        modal.classList.add('opacity-100');
    }

    function closeSettings() {
        const modal = elements.views.settings;
        modal.classList.remove('opacity-100');
        modal.classList.remove('flex');
        modal.classList.add('hidden');
    }

    function updateVolume(type, val) {
        const volume = val / 100;
        state.volumes[type] = volume;
        
        if (type === 'menu') elements.inputs.menuVal.textContent = val + '%';
        if (type === 'game') elements.inputs.gameVal.textContent = val + '%';
        if (type === 'voice') elements.inputs.voiceVal.textContent = val + '%';

        if (state.isBgmEnabled && !state.isSpeaking && elements.views.tutorial.classList.contains('hidden')) {
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

    function stopSpeech() {
        // Invalidate callbacks from previous utterances before cancelling them.
        state.speechToken++;
        clearTimeout(state.speechTimeout);
        state.speechTimeout = null;
        state.isSpeaking = false;
        try {
            if (window.speechSynthesis && typeof window.speechSynthesis.cancel === 'function') {
                window.speechSynthesis.cancel();
            }
        } catch {
            // Some WebKit versions throw during tab/background transitions.
        }
    }

    function speak(text) {
        if (state.phase !== 'result' || !text) return false;
        if (document.hidden) {
            elements.text.audioStatus.textContent = 'タブを開いてListenを押すと音声を再生できます。';
            return false;
        }
        const synth = window.speechSynthesis;
        const Utterance = window.SpeechSynthesisUtterance;
        if (!synth || typeof synth.speak !== 'function' || typeof Utterance !== 'function') {
            elements.text.audioStatus.textContent = 'このブラウザでは読み上げを利用できません。英文を見て発音してください。';
            return false;
        }

        stopSpeech();
        const token = state.speechToken;
        const finish = (failed) => {
            if (token !== state.speechToken) return;
            clearTimeout(state.speechTimeout);
            state.speechTimeout = null;
            state.isSpeaking = false;
            if (state.phase !== 'result') return;
            elements.text.audioStatus.textContent = failed
                ? '音声を再生できませんでした。Listenで再試行できます。'
                : 'もう一度聞くにはListenを押してください。';
            playBgm();
        };
        try {
            const uttr = new Utterance(text);
            uttr.lang = 'en-US';
            uttr.volume = state.volumes.voice;
            uttr.rate = 0.9;
            uttr.onend = () => finish(false);
            uttr.onerror = () => finish(true);
            state.isSpeaking = true;
            elements.audio.bgm.pause();
            elements.text.audioStatus.textContent = '英文を読み上げています…';
            synth.speak(uttr);
            if (state.isSpeaking && token === state.speechToken) {
                // Web Speech may silently stall on mobile; never leave BGM muted indefinitely.
                const maxDuration = Math.max(12000, Math.min(30000, text.length * 130));
                state.speechTimeout = setTimeout(() => {
                    if (token !== state.speechToken || !state.isSpeaking) return;
                    stopSpeech();
                    elements.text.audioStatus.textContent = '音声が停止したため終了しました。Listenで再試行できます。';
                    playBgm();
                }, maxDuration);
            }
            return true;
        } catch {
            finish(true);
            return false;
        }
    }

    // === Game Logic ===

    function showView(viewName) {
        state.phase = viewName;
        Object.values(elements.views).forEach(el => {
            if(el.id !== 'view-settings' && el.id !== 'view-tutorial') el.classList.add('hidden');
        });
        elements.views[viewName].classList.remove('hidden');

        state.isPlaying = viewName !== 'landing';
        playBgm();
    }

    async function startMemoryPhase() {
        if (!['landing', 'result'].includes(state.phase) || elements.btns.start.disabled) return;
        clearInterval(state.timerInterval);
        clearTimeout(state.resultTimeout);
        stopSpeech();
        if (!prepareQuizData()) return;
        state.attempts = 0;
        state.round++;
        state.missionIndex = (state.round - 1) % SPEAKING_MISSIONS.length;
        state.clueUsed = false;
        state.activeCountdown = null;
        elements.btns.clueRequest.disabled = false;
        elements.text.clueRequestNote.textContent = '';
        resetPeerFeedback();
        updateMissionPrompts();
        updateRoleCues();
        document.getElementById('round-status').textContent = `Round ${state.round} · 説明役: Player ${state.round % 2 ? 'A' : 'B'} · SCORE ${state.score} pts · 初回正解 ${state.firstCorrect}/${state.round - 1}`;
        const generation = ++state.generation;
        showView('memory');
        elements.btns.memorySkip.disabled = true;
        elements.timers.memory.textContent = '…';
        try {
            // Load all four choices before the memory clock starts.
            await Promise.all(state.currentSet.map(item => new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = resolve;
                img.onerror = reject;
                img.src = `assets/images/${item.filename}`;
            })));
        } catch {
            if (generation !== state.generation) return;
            backToLanding();
            loadStatus.textContent = '画像を読み込めませんでした。通信を確認して再度開始してください。';
            return;
        }
        if (generation !== state.generation || state.phase !== 'memory') return;
        elements.imgs.memory.src = `assets/images/${state.correctItem.filename}`;
        elements.btns.memorySkip.disabled = false;
        runTimer(state.memoryTime, elements.timers.memory, startExplainPhase);
    }

    // Pause countdowns while settings are open or the page is in the background.
    function runTimer(seconds, display, done, progress) {
        clearInterval(state.timerInterval);
        const clock = {
            remainingMs: seconds * 1000,
            totalMs: seconds * 1000,
            last: performance.now()
        };
        state.activeCountdown = clock;
        display.textContent = seconds;
        state.timerInterval = setInterval(() => {
            if (state.activeCountdown !== clock) return;
            const now = performance.now();
            if (!document.hidden && elements.views.settings.classList.contains('hidden')) {
                clock.remainingMs = Math.max(0, clock.remainingMs - (now - clock.last));
            }
            clock.last = now;
            display.textContent = Math.ceil(clock.remainingMs / 1000);
            if (progress) {
                progress.style.strokeDashoffset = 283 * (1 - clock.remainingMs / clock.totalMs);
            }
            if (!clock.remainingMs) {
                clearInterval(state.timerInterval);
                state.activeCountdown = null;
                done();
            }
        }, 100);
    }

    function startExplainPhase() {
        if (state.phase !== 'memory' || elements.btns.memorySkip.disabled) return;
        showView('explain');
        updateExplainHint();
        elements.timers.explainProgress.style.strokeDashoffset = 0;
        runTimer(state.explainTime, elements.timers.explain, startChoicePhase, elements.timers.explainProgress);
    }

    function startChoicePhase() {
        if (state.phase !== 'explain') return;
        clearInterval(state.timerInterval);
        state.activeCountdown = null;
        showView('choice');
        renderGrid();
    }

    function renderGrid() {
        const grid = elements.imgs.grid;
        grid.innerHTML = '';
        state.currentSet.forEach((item, index) => {
            const btn = document.createElement('button');
            btn.className = 'relative w-full h-full overflow-hidden rounded-2xl border-4 border-white shadow-lg hover:scale-[1.02] transition-transform duration-200 group bg-slate-100';
            
            const img = document.createElement('img');
            img.src = `assets/images/${item.filename}`;
            img.className = 'w-full h-full object-contain';
            img.alt = `選択肢 ${index + 1}`;
            btn.setAttribute('aria-label', `選択肢 ${index + 1}`);
            
            const number = document.createElement('span');
            number.className = 'choice-index';
            number.textContent = String(index + 1);
            number.setAttribute('aria-hidden', 'true');
            btn.appendChild(img);
            btn.appendChild(number);
            btn.onclick = () => checkAnswer(item, btn);
            grid.appendChild(btn);
        });
    }

    function checkAnswer(item, btn) {
        if (state.phase !== 'choice' || btn.disabled) return;
        state.attempts++;
        btn.disabled = true;
        if (item.id === state.correctItem.id) {
            state.phase = 'feedback';
            if (state.attempts === 1) state.firstCorrect++;
            state.lastPoints = window.CHARADES_CORE
                ? window.CHARADES_CORE.pointsForPhotoAttempt(state.attempts)
                : ([100, 60, 30][state.attempts - 1] || 10);
            state.score += state.lastPoints;
            elements.imgs.grid.querySelectorAll('button').forEach(button => button.disabled = true);
            playEffect(elements.audio.correct);
            
            btn.className += ' border-yellow-400 ring-8 ring-yellow-200 z-20';
            triggerConfetti();
            state.resultTimeout = setTimeout(showResultPhase, 1500);
        } else {
            playEffect(elements.audio.wrong);
            btn.classList.add('opacity-40', 'grayscale');
        }
    }

    function showResultPhase() {
        if (state.phase !== 'feedback') return;
        document.getElementById('result-feedback').textContent = `+${state.lastPoints} pts! ` + (state.attempts === 1 ? '初回で正解！' : `${state.attempts}回目で正解。違いを表す英語を確認しよう。`);
        document.getElementById('round-status').textContent = `Round ${state.round} · TOTAL ${state.score} pts · 初回正解 ${state.firstCorrect}/${state.round} · 次は役割交代！`;
        showView('result');
        elements.imgs.result.src = `assets/images/${state.correctItem.filename}`;
        elements.text.resultTitle.textContent = state.correctItem.title;
        elements.text.resultPhrase.textContent = state.correctItem.key_phrase;
        elements.text.resultTrans.textContent = state.correctItem.translation;
        
        document.getElementById('result-trans').classList.add('hidden');
        elements.btns.translationToggle.setAttribute('aria-expanded', 'false');
        elements.text.audioStatus.textContent = '';
        resetPeerFeedback();
        speak(state.correctItem.key_phrase);
    }

    function backToLanding() {
        clearInterval(state.timerInterval);
        state.activeCountdown = null;
        clearTimeout(state.resultTimeout);
        state.generation++;
        stopSpeech();
        elements.text.audioStatus.textContent = '';
        showView('landing');
    }

    function prepareQuizData() {
        if (!state.quizData || state.quizData.length < 4) {
            alert("Data not loaded or insufficient (need 4 images).");
            return false;
        }
        if (!state.remaining.length) state.remaining = shuffle([...state.quizData]);
        state.correctItem = state.remaining.pop();
        const alternatives = shuffle(state.quizData.filter(item => item.group === state.correctItem.group && item.id !== state.correctItem.id));
        state.currentSet = shuffle([state.correctItem, ...alternatives.slice(0, 3)]);
        return true;
    }

    function shuffle(items) {
        for (let i = items.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [items[i], items[j]] = [items[j], items[i]];
        }
        return items;
    }

    function triggerConfetti() {
        if (typeof confetti !== "function" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        confetti({ particleCount: 200, spread: 80, origin: { y: 0.6 }, colors: ['#FFD700', '#FF69B4', '#00BFFF'] });
    }
});