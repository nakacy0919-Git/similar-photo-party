document.addEventListener('DOMContentLoaded', () => {
    // === 定数 ===
    const SESSION_TIME_OPTIONS = [90, 120, 150, 180];
    const PHOTO_EXPLAIN_SECONDS = 20;
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
    const PHOTO_GENRES = window.PHOTO_CATEGORIES;
    const PHOTO_I18N = window.PHOTO_I18N;
    const photoText = (key,vars={}) => PHOTO_I18N.text(state.tutLang,key,vars);
    // Original SimilarPhoto repository: public image assets only, revision pinned.
    // The imported data is a local manifest; no remote JavaScript is executed.
    const SOURCE_IMAGE_ROOT = 'https://raw.githubusercontent.com/nakacy0919-Git/SimilarPhoto/53625ffce31f14200a3b4eced23e5fd2c3099211/';
    const SOURCE_CDN_ROOT = 'https://cdn.jsdelivr.net/gh/nakacy0919-Git/SimilarPhoto@53625ffce31f14200a3b4eced23e5fd2c3099211/';
    const SOURCE_PATH_PATTERN = /^images\/(?:000|100|200|300|400|500|600|700|800|900|1000)\/\d{3,4}\.webp$/;
    const sourceFallbacks = new Set();
    function photoUrl(item) {
        if (!item.sourcePath) return `assets/images/${item.filename}`;
        if (!SOURCE_PATH_PATTERN.test(item.sourcePath)) throw new Error('Invalid original image path');
        return (sourceFallbacks.has(item.sourcePath) ? SOURCE_CDN_ROOT : SOURCE_IMAGE_ROOT) + item.sourcePath;
    }
    function setPhotoImage(img, item) {
        img.onerror = () => {
            if (!item.sourcePath || sourceFallbacks.has(item.sourcePath)) return;
            sourceFallbacks.add(item.sourcePath);
            img.src = photoUrl(item);
        };
        img.src = photoUrl(item);
    }

    
    // === 状態管理 ===
    const state = {
        quizData: [],
        phase: "landing",
        sessionDuration: 90,
        sessionRemainingMs: 90000,
        sessionTimerInterval: null,
        sessionLast: 0,
        sessionStarted: false,
        answeredCount: 0,
        lastAnswerCorrect: false,
        round: 0,
        firstCorrect: 0,
        score: 0,
        correctCount: 0,
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
        selectedGenre: 'all',
        activePool: [],
        paused: false,
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
        memoryTime: PHOTO_EXPLAIN_SECONDS,
        explainTime: PHOTO_EXPLAIN_SECONDS,
        handoffAlert: 'sound',
        handoffAudio: null,
        handoffTimer: null,
        hintMode: 'guided'
    };

    // === DOM要素 ===
    const elements = {
        views: {
            landing: document.getElementById('view-landing'),
            photoSetup: document.getElementById('view-photo-setup'),
            photoReady: document.getElementById('view-photo-ready'),
            photoNext: document.getElementById('view-photo-next'),
            photoSummary: document.getElementById('view-photo-summary'),
            tutorial: document.getElementById('view-tutorial'),
            memory: document.getElementById('view-memory'),
            explain: document.getElementById('view-explain'),
            choice: document.getElementById('view-choice'),
            result: document.getElementById('view-result'),
            settings: document.getElementById('view-settings')
        },
        btns: {
            start: document.getElementById('start-btn'),
            photoSetupHome: document.getElementById('photo-setup-home'),
            photoSetupNext: document.getElementById('photo-setup-next'),
            photoReadyStart: document.getElementById('photo-ready-start'),
            photoNextStart: document.getElementById('photo-next-start'),
            photoEnd: document.getElementById('photo-end'),
            photoBack: document.getElementById('photo-back'),
            photoPause: document.getElementById('photo-pause'),
            photoResume: document.getElementById('photo-resume'),
            photoPauseEnd: document.getElementById('photo-pause-end'),
            photoSummaryReplay: document.getElementById('photo-summary-replay'),
            photoSummaryChange: document.getElementById('photo-summary-change'),
            photoSummaryHome: document.getElementById('photo-summary-home'),
            tutorial: document.getElementById('tutorial-btn'),
            tutClose: document.getElementById('tut-close-btn'),
            tutNext: document.getElementById('tut-next-btn'),
            tutPrev: document.getElementById('tut-prev-btn'),
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
            photoBgmSetup: document.getElementById('photo-bgm-btn'),
            photoBgmPlay: document.getElementById('photo-bgm-play'),
            photoLanguage: document.getElementById('photo-language'),
            tutorialLanguage: document.getElementById('tut-lang-select'),
            // 時間選択ボタン
            timeSelectors: document.querySelectorAll('.time-select-btn'),
            memorySelectors: document.querySelectorAll('.memory-time-select-btn'),
            hintSelectors: document.querySelectorAll('.hint-mode-btn'),
            clueRequest: document.getElementById('clue-request-btn'),
            photoDuration: document.querySelectorAll('.photo-duration-btn')
        },
        tutElements: {
            header: document.getElementById('tut-header'),
            img: document.getElementById('tut-img'),
            badge: document.getElementById('tut-step-badge'),
            title: document.getElementById('tut-title'),
            desc: document.getElementById('tut-desc')
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
            resultTitle: document.getElementById('result-title'),
            resultPhrase: document.getElementById('result-phrase'),
            resultTrans: document.getElementById('result-trans')
        },
        inputs: {
            menuVol: document.getElementById('vol-menu'),
            gameVol: document.getElementById('vol-game'),
            voiceVol: document.getElementById('vol-voice'),
            handoffAlert: document.getElementById('handoffAlert'),
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
    elements.btns.photoSetupNext.disabled = true;
    const loadStatus = document.getElementById('load-status');
    applyPhotoLanguage();
    syncPhotoMusicButtons();
    fetch('data/content.json')
        .then(res => { if (!res.ok) throw new Error('HTTP ' + res.status); return res.json(); })
        .then(data => {
            if (!Array.isArray(data)) throw new Error('Invalid data');
            const imported = Array.isArray(window.SIMILAR_PHOTO_LIBRARY) ? window.SIMILAR_PHOTO_LIBRARY : [];
            const visual = window.SIMILARPHOTO_VISUAL_GROUPS;
            if (visual && imported.length) {
                const expected = new Set(imported.map(item => item.sourcePath));
                if (Object.keys(visual).length !== expected.size ||
                    [...expected].some(path => !visual[path] || !/^sp_\d{3,4}_v\d{2}$/.test(visual[path].group))) {
                    throw new Error('Incomplete visual photo grouping');
                }
            }
            const importedForPlay = imported.map(item => {
                const match = visual && visual[item.sourcePath];
                return match ? {...item,
                    group: match.group,
                    visualDistance: match.distance,
                    needsVisualReview: match.needsReview === true
                } : item;
            });
            const combined = [...data, ...importedForPlay];
            const ids = new Set();
            const files = new Set();
            const groups = new Map();
            for (const item of combined) {
                if (!item || !['id', 'filename', 'group', 'title', 'key_phrase', 'translation'].every(
                    key => typeof item[key] === 'string' && item[key].trim() && item[key].length <= 2000
                ) || !/^[a-zA-Z0-9_-]+\.(webp|png|jpe?g)$/.test(item.filename)
                    || ids.has(item.id) || files.has(item.filename)
                    || (item.sourcePath && !SOURCE_PATH_PATTERN.test(item.sourcePath))
                    || (item.sourcePath && !/^\d{3,4}$/.test(item.sourceSeries || ''))) throw new Error('Invalid item');
                ids.add(item.id); files.add(item.filename);
                if (!groups.has(item.group)) groups.set(item.group, []);
                groups.get(item.group).push(item);
            }
            state.quizData = [...groups.values()].filter(group => group.length >= 4).flat();
            state.activePool = state.quizData;
            renderPhotoCategories();
            if (state.quizData.length < 4) throw new Error('No complete image groups');
            loadStatus.textContent = `${state.quizData.length}枚の写真からジャンルを選べます。説明役が写真を説明し、回答役が4枚から選びます。`;
            elements.btns.start.disabled = false;
            elements.btns.photoSetupNext.disabled = false;
        })
        .catch(err => {
            loadStatus.textContent = '教材を読み込めませんでした。ページを再読み込みしてください。';
            console.error('Load Error:', err);
        });

    document.body.addEventListener('click', initAudio, { once: true });
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            if (['memory', 'choice', 'photoNext', 'feedback'].includes(state.phase)) setPhotoPaused(true);
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
    elements.btns.start.addEventListener('click', openPhotoSetup);
    elements.btns.photoSetupHome.addEventListener('click', backToLanding);
    elements.btns.photoSetupNext.addEventListener('click', preparePhotoReady);
    elements.btns.photoReadyStart.addEventListener('click', startMemoryPhase);
    elements.btns.photoNextStart.addEventListener('click', startMemoryPhase);
    elements.btns.photoEnd.addEventListener('click', finishPhotoGame);
    elements.btns.photoBack.addEventListener('click', returnPhotoToSetup);
    elements.btns.photoPause.addEventListener('click', () => setPhotoPaused(!state.paused));
    elements.btns.photoResume.addEventListener('click', () => setPhotoPaused(false));
    elements.btns.photoPauseEnd.addEventListener('click', finishPhotoGame);
    elements.btns.photoSummaryReplay.addEventListener('click', preparePhotoReady);
    elements.btns.photoSummaryChange.addEventListener('click', openPhotoSetup);
    elements.btns.photoSummaryHome.addEventListener('click', backToLanding);
    elements.btns.photoDuration.forEach(button => button.addEventListener('click', () => setSessionDuration(button.getAttribute('data-photo-duration'))));
    
    // Tutorial Events
    elements.btns.tutorial.addEventListener('click', openTutorial);
    elements.btns.tutClose.addEventListener('click', closeTutorial);
    elements.btns.tutNext.addEventListener('click', nextTutorialStep);
    elements.btns.tutPrev.addEventListener('click', prevTutorialStep);
    elements.btns.photoLanguage.addEventListener('change', e => setPhotoLanguage(e.target.value));
    elements.btns.tutorialLanguage.addEventListener('change', e => setPhotoLanguage(e.target.value));

    // Review Link Event
    elements.btns.review.addEventListener('click', () => {
        elements.audio.bgm.pause();
    });

    // Game Flow Events
    elements.btns.memorySkip.addEventListener('click', startChoicePhase);
    elements.btns.explainSkip.addEventListener('click', startChoicePhase);
    // The legacy English result screen is not part of rapid-play sessions.
    elements.btns.next.addEventListener('click', showPhotoNext);
    elements.btns.speak.addEventListener('click', () => { if (state.phase === 'result' && state.correctItem) speak(state.correctItem.key_phrase); });
    elements.btns.translationToggle.addEventListener('click', () => {
        if (state.phase !== 'result') return;
        const translation = elements.text.resultTrans;
        const show = translation.classList.contains('hidden');
        translation.classList.toggle('hidden', !show);
        elements.btns.translationToggle.setAttribute('aria-expanded', String(show));
    });
    elements.btns.clueRequest.addEventListener('click', askForOneMoreClue);

    // Settings & Controls
    elements.btns.settings.addEventListener('click', openSettings);
    elements.btns.closeSettings.addEventListener('click', closeSettings);
    elements.btns.backHome.addEventListener('click', () => {
        closeSettings();
        if(state.isPlaying) backToLanding();
    });
    
    elements.btns.bgmToggle.addEventListener('click', toggleBgm);
    elements.btns.photoBgmSetup.addEventListener('click', toggleBgm);
    elements.btns.photoBgmPlay.addEventListener('click', toggleBgm);

    elements.inputs.menuVol.addEventListener('input', (e) => updateVolume('menu', e.target.value));
    elements.inputs.gameVol.addEventListener('input', (e) => updateVolume('game', e.target.value));
    elements.inputs.voiceVol.addEventListener('input', (e) => updateVolume('voice', e.target.value));
    elements.inputs.handoffAlert.addEventListener('change', e => { state.handoffAlert = e.target.value; });

    elements.inputs.ratio.addEventListener('input', (e) => updateLayout('ratio', e.target.value));
    elements.inputs.textSize.addEventListener('input', (e) => updateLayout('text', e.target.value));

    // The overall session clock is separate from each fixed ten-second photo.
    elements.btns.timeSelectors.forEach(button => {
        button.addEventListener('click', () => setSessionDuration(button.getAttribute('data-time')));
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

    function setSessionDuration(value) {
        const seconds = Number(value);
        if (!SESSION_TIME_OPTIONS.includes(seconds) || state.sessionStarted) return false;
        state.sessionDuration = seconds;
        state.sessionRemainingMs = seconds * 1000;
        const display = document.getElementById('photo-total-time');
        display.textContent = String(seconds);
        markSelectedButtons(elements.btns.timeSelectors, 'data-time', seconds);
        markSelectedButtons(elements.btns.photoDuration, 'data-photo-duration', seconds);
        if (!elements.views.tutorial.classList.contains('hidden') && state.tutStep === 0) {
            updateTutorialView();
        }
        if (state.phase === 'photoReady') updateReadyText();
        return true;
    }

    // Original API alias; each photo is now limited to twenty seconds.
    function setMemoryTime(value) {
        return setSessionDuration(value);
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
            openPhotoSetup();
        }
    }

    function prevTutorialStep() {
        if (state.tutStep > 0) {
            state.tutStep--;
            updateTutorialView();
        }
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
        const data = PHOTO_I18N.languages[state.tutLang] || PHOTO_I18N.languages.en;
        const step = data.tutSteps[state.tutStep];
        elements.tutElements.header.textContent = data.howTitle;
        elements.tutElements.badge.textContent = step[0];
        elements.tutElements.title.textContent = step[1];
        elements.tutElements.desc.textContent = step[2];
        elements.tutElements.img.src = 'assets/images/tutorial_' + (state.tutStep + 1) + '.webp';
        elements.btns.tutorialLanguage.value = state.tutLang;
        if (state.tutStep === 0) {
            elements.btns.tutPrev.disabled = true;
            elements.btns.tutPrev.classList.add('opacity-30','pointer-events-none');
        } else {
            elements.btns.tutPrev.disabled = false;
            elements.btns.tutPrev.classList.remove('opacity-30','pointer-events-none');
            setTutorialButton(elements.btns.tutPrev,data.tutPrev,'fa-solid fa-chevron-left',true);
        }
        const last = state.tutStep === 2;
        setTutorialButton(elements.btns.tutNext,last?data.tutStart:data.tutNext,
            last?'fa-solid fa-play ml-2':'fa-solid fa-chevron-right ml-2',false);
        elements.btns.tutNext.classList.toggle('bg-pink-500',last);
        elements.btns.tutNext.classList.toggle('bg-indigo-600',!last);
    }

    function setPhotoLanguage(code) {
        if (!PHOTO_I18N.codes.includes(code)) return false;
        state.tutLang = code;
        applyPhotoLanguage();
        if (!elements.views.tutorial.classList.contains('hidden')) updateTutorialView();
        if (state.quizData.length) renderPhotoCategories();
        if (state.phase === 'photoReady') updateReadyText();
        if (state.phase === 'photoNext') updatePhotoNextText();
        if (state.phase === 'memory') updateRoleCues();
        if (state.phase === 'photoSummary') updatePhotoSummaryText();
        return true;
    }

    function applyPhotoLanguage() {
        document.documentElement.lang = state.tutLang;
        elements.btns.photoLanguage.value = state.tutLang;
        elements.btns.tutorialLanguage.value = state.tutLang;
        document.querySelectorAll('[data-photo-i18n]').forEach(node => {
            const key = node.getAttribute('data-photo-i18n');
            node.textContent = photoText(key);
        });
        const btn = elements.btns.memorySkip;
        btn.setAttribute('aria-label',photoText('readyGuess'));
        syncPhotoMusicButtons();
    }

    function updateReadyText() {
        const upcoming = state.round + 1;
        const speaker = upcoming % 2 ? 'A':'B';
        const listener = speaker === 'A'?'B':'A';
        const genre = PHOTO_GENRES.options(state.quizData).find(item => item.id === state.selectedGenre);
        document.getElementById('photo-ready-round').textContent = 'ROUND '+upcoming;
        document.getElementById('photo-ready-roles').textContent = photoText('roleExplain',{speaker,listener});
        document.getElementById('photo-ready-summary').textContent =
            photoText('summaryLine',{genre:genre?(state.tutLang==='ja'?genre.ja:genre.en):photoText('categories'),seconds:state.sessionDuration});
    }

    function updatePhotoNextText() {
        const feedback = document.getElementById('photo-next-feedback');
        feedback.textContent = photoText(state.lastAnswerCorrect?'correct':'wrong');
        const upcoming=state.round+1,speaker=upcoming%2?'A':'B',listener=speaker==='A'?'B':'A';
        document.getElementById('photo-next-roles').textContent = photoText('nextRole',{speaker,listener});
    }

    function updatePhotoSummaryText() {
        document.getElementById('photo-summary-rounds').textContent =
            photoText('attempts',{count:state.answeredCount,seconds:state.sessionDuration});
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

    function unlockHandoffSound() {
        if (state.handoffAlert !== 'sound' && state.handoffAlert !== 'both') return;
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        try {
            if (!state.handoffAudio) state.handoffAudio = new AudioContextClass();
            if (state.handoffAudio.state === 'suspended') {
                const result = state.handoffAudio.resume();
                if (result && typeof result.catch === 'function') result.catch(() => {});
            }
        } catch { /* Unsupported audio should never interrupt a classroom round. */ }
    }

    function playHandoffCue() {
        if (document.hidden) return;
        if (state.handoffAlert === 'vibrate' || state.handoffAlert === 'both') {
            try { window.navigator?.vibrate?.([100, 60, 120]); } catch {}
        }
        if (state.handoffAlert !== 'sound' && state.handoffAlert !== 'both') return;
        const context = state.handoffAudio;
        if (!context) return;
        try {
            const oscillator = context.createOscillator();
            const gain = context.createGain();
            const start = context.currentTime;
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, start);
            oscillator.frequency.exponentialRampToValueAtTime(1320, start + .11);
            gain.gain.setValueAtTime(.0001, start);
            gain.gain.exponentialRampToValueAtTime(.08, start + .018);
            gain.gain.exponentialRampToValueAtTime(.0001, start + .28);
            oscillator.connect(gain);
            gain.connect(context.destination);
            oscillator.start(start);
            oscillator.stop(start + .29);
        } catch { /* Unavailable Web Audio is not a game blocker. */ }
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
        elements.roles.memory.textContent = `Player ${speaker}: 写真を見ながら説明 ／ Player ${listener}: 画面を見ない`;
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

    // === Similar Photo genre selection and classroom handoff ===

    function renderPhotoCategories() {
        const list = document.getElementById('photo-category-list');
        list.innerHTML = '';
        if (!PHOTO_GENRES || !state.quizData.length) return;
        const genres = PHOTO_GENRES.options(state.quizData);
        if (!genres.some(genre => genre.id === state.selectedGenre)) state.selectedGenre = 'all';
        for (const genre of genres) {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'photo-genre-card';
            button.setAttribute('aria-pressed', String(genre.id === state.selectedGenre));
            const emoji = document.createElement('span');
            emoji.className = 'photo-genre-emoji';
            emoji.textContent = genre.emoji;
            emoji.setAttribute('aria-hidden', 'true');
            const label = document.createElement('span');
            label.className = 'photo-genre-copy';
            const title = document.createElement('strong');
            title.textContent = genre.ja;
            const subtitle = document.createElement('small');
            subtitle.textContent = PHOTO_GENRES.pool(state.quizData, genre.id).length + '枚 · ' + genre.en;
            label.appendChild(title);
            label.appendChild(subtitle);
            button.appendChild(emoji);
            button.appendChild(label);
            button.addEventListener('click', () => selectPhotoGenre(genre.id));
            list.appendChild(button);
        }
        document.getElementById('photo-genre-count').textContent = state.quizData.length + '枚の写真';
    }

    function selectPhotoGenre(id) {
        const selected = PHOTO_GENRES.options(state.quizData).find(genre => genre.id === id);
        if (!selected) return false;
        if (state.selectedGenre !== id) state.remaining = [];
        state.selectedGenre = id;
        state.activePool = PHOTO_GENRES.pool(state.quizData, id);
        renderPhotoCategories();
        return true;
    }

    function openPhotoSetup() {
        stopSessionClock();
        clearInterval(state.timerInterval);
        state.activeCountdown = null;
        clearTimeout(state.resultTimeout);
        clearTimeout(state.handoffTimer);
        state.generation++;
        stopSpeech();
        state.paused = false;
        document.getElementById('photo-pause-overlay').hidden = true;
        showView('photoSetup');
        renderPhotoCategories();
    }

    function preparePhotoReady() {
        if (!['photoSetup', 'result', 'photoSummary'].includes(state.phase)) return;
        if (state.phase !== 'result') {
            stopSessionClock();
            state.round = 0;
            state.answeredCount = 0;
            state.correctCount = 0;
            state.firstCorrect = 0;
            state.score = 0;
            state.remaining = [];
            state.sessionStarted = false;
            state.sessionRemainingMs = state.sessionDuration * 1000;
            document.getElementById('photo-total-time').textContent = String(state.sessionDuration);
            document.getElementById('photo-total-correct').textContent = '0';
        }
        state.activePool = PHOTO_GENRES.pool(state.quizData, state.selectedGenre);
        if (state.activePool.length < 4) {
            openPhotoSetup();
            return;
        }
        clearTimeout(state.resultTimeout);
        clearTimeout(state.handoffTimer);
        stopSpeech();
        state.paused = false;
        document.getElementById('photo-pause-overlay').hidden = true;
        const nextRound = state.round + 1;
        const speaker = nextRound % 2 ? 'A' : 'B';
        const listener = speaker === 'A' ? 'B' : 'A';
        const chosen = PHOTO_GENRES.options(state.quizData).find(item => item.id === state.selectedGenre);
        document.getElementById('photo-ready-round').textContent = 'ROUND ' + nextRound;
        document.getElementById('photo-ready-roles').textContent =
            'Player ' + speaker + ' が説明 ／ Player ' + listener + ' は画面を見ない';
        document.getElementById('photo-ready-summary').textContent =
            (chosen ? chosen.ja : 'すべて') + ' · ' + state.sessionDuration + '秒チャレンジ · 1枚10秒';
        showView('photoReady');
    }

    function setPhotoPaused(paused) {
        if (!['memory', 'choice', 'photoNext', 'feedback'].includes(state.phase)) return;
        state.paused = !!paused;
        if (state.activeCountdown) state.activeCountdown.last = performance.now();
        state.sessionLast = performance.now();
        document.getElementById('photo-pause-overlay').hidden = !state.paused;
        elements.btns.photoPause.textContent = state.paused ? '▶' : '⏸';
        elements.btns.photoPause.setAttribute('aria-pressed', String(state.paused));
    }

    // One uninterrupted Charades-style session clock survives photo/answer/NEXT.
    // It starts with the first loaded photo and counts down even on NEXT.
    // Pausing or backgrounding stops elapsed-time accounting, not the game.
    function updateSessionHud() {
        document.getElementById('photo-total-time').textContent =
            String(Math.ceil(Math.max(0, state.sessionRemainingMs) / 1000));
        document.getElementById('photo-total-correct').textContent = String(state.correctCount);
    }

    function stopSessionClock() {
        if (state.sessionTimerInterval !== null) {
            clearInterval(state.sessionTimerInterval);
            state.sessionTimerInterval = null;
        }
        state.sessionStarted = false;
    }

    function startSessionClock() {
        if (state.sessionStarted) return;
        state.sessionStarted = true;
        state.sessionLast = performance.now();
        updateSessionHud();
        const interval = setInterval(() => {
            if (!state.sessionStarted || state.sessionTimerInterval !== interval) return;
            const now = performance.now();
            if (!document.hidden && !state.paused &&
                elements.views.settings.classList.contains('hidden')) {
                state.sessionRemainingMs = Math.max(0, state.sessionRemainingMs - (now - state.sessionLast));
            }
            state.sessionLast = now;
            updateSessionHud();
            if (state.sessionRemainingMs <= 0) {
                finishPhotoGame();
            }
        }, 100);
        state.sessionTimerInterval = interval;
    }

    function returnPhotoToSetup() {
        if (!['photoReady','memory','choice','photoNext','feedback','result'].includes(state.phase)) return;
        stopSessionClock();
        clearInterval(state.timerInterval);
        clearTimeout(state.resultTimeout);
        clearTimeout(state.handoffTimer);
        state.generation++;
        state.activeCountdown = null;
        state.paused = false;
        stopSpeech();
        document.getElementById('photo-pause-overlay').hidden = true;
        document.getElementById('choice-success-overlay').hidden = true;
        document.getElementById('handoff-announcement').hidden = true;
        if (document.fullscreenElement && document.exitFullscreen) {
            Promise.resolve(document.exitFullscreen()).catch(() => {});
        }
        openPhotoSetup();
    }

    function finishPhotoGame() {
        if (!['photoReady', 'memory', 'choice', 'photoNext', 'feedback', 'result'].includes(state.phase)) return;
        stopSessionClock();
        clearInterval(state.timerInterval);
        state.timerInterval = null;
        clearTimeout(state.resultTimeout);
        clearTimeout(state.handoffTimer);
        state.generation++;
        state.activeCountdown = null;
        state.paused = false;
        stopSpeech();
        document.getElementById('photo-pause-overlay').hidden = true;
        document.getElementById('choice-success-overlay').hidden = true;
        document.getElementById('handoff-announcement').hidden = true;
        document.getElementById('photo-summary-correct').textContent = String(state.correctCount);
        document.getElementById('photo-summary-rounds').textContent = '挑戦 ' + state.answeredCount + ' 問 ／ ' + state.sessionDuration + ' 秒';
        if (document.fullscreenElement && document.exitFullscreen) {
            Promise.resolve(document.exitFullscreen()).catch(() => {});
        }
        showView('photoSummary');
    }

    // === Game Logic ===

    function showView(viewName) {
        state.phase = viewName;
        Object.values(elements.views).forEach(el => {
            if(el.id !== 'view-settings' && el.id !== 'view-tutorial') el.classList.add('hidden');
        });
        elements.views[viewName].classList.remove('hidden');

        state.isPlaying = viewName !== 'landing';
        const active = ['photoReady','memory','choice','photoNext','result'].includes(viewName);
        document.getElementById('photo-session-hud').hidden =
            !['memory','choice','photoNext','result'].includes(viewName);
        document.getElementById('photo-game-tools').hidden = !active;
        elements.btns.photoPause.hidden = !['memory','choice','photoNext'].includes(viewName);
        if (!['memory', 'choice', 'photoNext'].includes(viewName)) {
            state.paused = false;
            document.getElementById('photo-pause-overlay').hidden = true;
        }
        playBgm();
    }

    async function startMemoryPhase() {
        if (!['landing', 'result', 'photoReady', 'photoNext'].includes(state.phase) || elements.btns.start.disabled || state.paused) return;
        // Try native fullscreen on browsers that support it; fixed-viewport CSS is the Safari fallback.
        if (!document.fullscreenElement && document.documentElement?.requestFullscreen) {
            try { Promise.resolve(document.documentElement.requestFullscreen()).catch(() => {}); } catch { /* unsupported or blocked */ }
        }
        clearInterval(state.timerInterval);
        clearTimeout(state.resultTimeout);
        clearTimeout(state.handoffTimer);
        document.getElementById('choice-success-overlay').hidden = true;
        document.getElementById('handoff-announcement').hidden = true;
        unlockHandoffSound();
        stopSpeech();
        if (state.sessionStarted && state.sessionRemainingMs <= 0) {
            finishPhotoGame();
            return;
        }
        if (!prepareQuizData()) return;
        state.attempts = 0;
        state.round++;
        state.missionIndex = (state.round - 1) % SPEAKING_MISSIONS.length;
        state.clueUsed = false;
        state.activeCountdown = null;
        elements.btns.clueRequest.disabled = false;
        elements.text.clueRequestNote.textContent = '';
        updateMissionPrompts();
        updateRoleCues();
        document.getElementById('round-status').textContent = `Round ${state.round} · 説明役: Player ${state.round % 2 ? 'A' : 'B'} · 正解 ${state.correctCount}問`;
        const generation = ++state.generation;
        showView('memory');
        elements.btns.memorySkip.disabled = true;
        elements.timers.memory.textContent = '…';
        try {
            // Load all four choices before the memory clock starts.
            await Promise.all(state.currentSet.map(item => new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = resolve;
                let retried = false;
                img.onerror = () => {
                    if (item.sourcePath && !retried) {
                        retried = true;
                        sourceFallbacks.add(item.sourcePath);
                        img.src = photoUrl(item);
                    } else reject(new Error('Photo load failed'));
                };
                img.src = photoUrl(item);
            })));
        } catch {
            if (generation !== state.generation) return;
            backToLanding();
            loadStatus.textContent = '画像を読み込めませんでした。通信を確認して再度開始してください。';
            return;
        }
        if (generation !== state.generation || state.phase !== 'memory') return;
        setPhotoImage(elements.imgs.memory, state.correctItem);
        elements.btns.memorySkip.disabled = false;
        updateSessionHud();
        if (!state.sessionStarted) startSessionClock();
        runTimer(PHOTO_EXPLAIN_SECONDS, elements.timers.memory, startChoicePhase);
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
            if (!document.hidden && !state.paused && elements.views.settings.classList.contains('hidden')) {
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

    // Legacy entry point kept for existing integrations; there is no longer a
    // separate, photo-less explanation screen.
    function startExplainPhase() {
        startChoicePhase();
    }

    function startChoicePhase() {
        if (state.phase !== 'memory' || state.paused) return;
        clearInterval(state.timerInterval);
        state.timerInterval = null;
        state.activeCountdown = null;
        playHandoffCue();
        showView('choice');
        renderGrid();
        const banner = document.getElementById('handoff-announcement');
        banner.hidden = false;
        clearTimeout(state.handoffTimer);
        state.handoffTimer = setTimeout(() => { banner.hidden = true; state.handoffTimer = null; }, 1400);
    }

    function renderGrid() {
        const grid = elements.imgs.grid;
        grid.innerHTML = '';
        state.currentSet.forEach((item, index) => {
            const btn = document.createElement('button');
            btn.className = 'relative w-full h-full overflow-hidden rounded-2xl border-4 border-white shadow-lg hover:scale-[1.02] transition-transform duration-200 group bg-slate-100';
            
            const img = document.createElement('img');
            setPhotoImage(img, item);
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
        // The first answer finishes this question. No repeat guesses for points.
        if (state.phase !== 'choice' || btn.disabled || state.paused || !state.sessionStarted) return;
        state.phase = 'feedback';
        state.attempts = 1;
        state.answeredCount++;
        state.lastAnswerCorrect = item.id === state.correctItem.id;
        btn.disabled = true;
        elements.imgs.grid.querySelectorAll('button').forEach(button => { button.disabled = true; });
        document.getElementById('handoff-announcement').hidden = true;
        elements.btns.photoPause.hidden = true;

        const overlay = document.getElementById('choice-success-overlay');
        const check = overlay.querySelector('.success-check');
        const label = overlay.querySelector('strong');
        const detail = overlay.querySelector('small');
        if (state.lastAnswerCorrect) {
            state.firstCorrect++;
            state.correctCount++;
            state.score = state.correctCount;
            playEffect(elements.audio.correct);
            check.textContent = '✓';
            label.textContent = 'CORRECT!';
            detail.textContent = '正解！';
            overlay.classList.remove('is-wrong');
            triggerConfetti();
        } else {
            playEffect(elements.audio.wrong);
            check.textContent = '✕';
            label.textContent = 'NEXT!';
            detail.textContent = '不正解 · 次の問題へ';
            overlay.classList.add('is-wrong');
            btn.classList.add('shake-wrong');
        }
        updateSessionHud();
        overlay.hidden = false;
        clearTimeout(state.resultTimeout);
        state.resultTimeout = setTimeout(showPhotoNext, 750);
    }

    function showPhotoNext() {
        if (state.phase !== 'feedback' && state.phase !== 'result') return;
        clearTimeout(state.resultTimeout);
        state.resultTimeout = null;
        stopSpeech();
        document.getElementById('choice-success-overlay').hidden = true;
        document.getElementById('handoff-announcement').hidden = true;
        const feedback = document.getElementById('photo-next-feedback');
        feedback.textContent = state.lastAnswerCorrect ? '✓ 正解！' : '✕ おしい！';
        feedback.classList.toggle('wrong', !state.lastAnswerCorrect);
        const upcoming = state.round + 1;
        const speaker = upcoming % 2 ? 'A' : 'B';
        const listener = speaker === 'A' ? 'B' : 'A';
        document.getElementById('photo-next-roles').textContent =
            '次はPlayer ' + speaker + 'が説明 ／ Player ' + listener + 'は見ない';
        showView('photoNext');
        updateSessionHud();
    }

    function showResultPhase() {
        if (state.phase !== 'feedback') return;
        document.getElementById('choice-success-overlay').hidden = true;
        document.getElementById('result-feedback').textContent =
            `正解！ 合計${state.correctCount}問 ` + (state.attempts === 1 ? '初回で正解！' : `${state.attempts}回目で正解。`);
        document.getElementById('round-status').textContent =
            `Round ${state.round} · 正解 ${state.correctCount}問 · 初回正解 ${state.firstCorrect}/${state.round} · 次は役割交代！`;
        showView('result');
        setPhotoImage(elements.imgs.result, state.correctItem);
        elements.text.resultTitle.textContent = state.correctItem.title;
        elements.text.resultPhrase.textContent = state.correctItem.key_phrase;
        elements.text.resultTrans.textContent = state.correctItem.translation;
        
        document.getElementById('result-trans').classList.add('hidden');
        elements.btns.translationToggle.setAttribute('aria-expanded', 'false');
        elements.text.audioStatus.textContent = '';
        speak(state.correctItem.key_phrase);
    }

    function backToLanding() {
        stopSessionClock();
        clearInterval(state.timerInterval);
        state.paused = false;
        document.getElementById('photo-pause-overlay').hidden = true;
        state.activeCountdown = null;
        clearTimeout(state.resultTimeout);
        clearTimeout(state.handoffTimer);
        document.getElementById('choice-success-overlay').hidden = true;
        document.getElementById('handoff-announcement').hidden = true;
        state.generation++;
        stopSpeech();
        if (document.fullscreenElement && document.exitFullscreen) {
            Promise.resolve(document.exitFullscreen()).catch(() => {});
        }
        elements.text.audioStatus.textContent = '';
        showView('landing');
    }

    function prepareQuizData() {
        const pool = state.activePool.length >= 4 ? state.activePool : state.quizData;
        if (!pool || pool.length < 4) {
            alert("Data not loaded or insufficient (need 4 images).");
            return false;
        }
        if (!state.remaining.length) state.remaining = shuffle([...pool]);
        state.correctItem = state.remaining.pop();
        const alternatives = shuffle(pool.filter(item => item.group === state.correctItem.group && item.id !== state.correctItem.id));
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