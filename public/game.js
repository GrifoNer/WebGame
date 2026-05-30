// ========== Глобальное состояние игры ==========
const GameState = {
    stage: "prologue",      // prologue, story, playing_minigame, quiz
    completedGames: [false, false, false, false, false],
    answersWrong: 0,
    gameAnswers: { guessNumber: null, ticTacToe: null, checkers: null, foolCard: null, blackjack: null },
    activeGame: null,
    prologueStep: 0,
    finalEnding: null        // 'survive', 'luck', 'crazy_luck', 'death'
};

// DOM элементы
const dom = {
    scene: document.getElementById("sceneBg"),
    speaker: document.getElementById("speakerName"),
    dialog: document.getElementById("dialogMsg"),
    gameWidget: document.getElementById("gameWidget"),
    gameStatus: document.getElementById("gameStatus"),
    actionDiv: document.getElementById("actionButtons")
};

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
function setDialog(speaker, text) {
    dom.speaker.innerText = speaker;
    dom.dialog.innerText = text;
}

function setBackground(url) {
    dom.scene.style.backgroundImage = `url('${url}')`;
}

function clearWidget() { dom.gameWidget.innerHTML = ""; }

function renderButtons(buttons) {
    dom.actionDiv.innerHTML = "";
    buttons.forEach(btn => {
        const button = document.createElement("button");
        button.innerText = btn.label;
        if (btn.danger) button.classList.add("danger-btn");
        if (btn.success) button.classList.add("success-btn");
        button.onclick = () => btn.onClick?.();
        dom.actionDiv.appendChild(button);
    });
}

// ========== ПРОЛОГ (воспоминания) ==========
function startPrologue() {
    GameState.stage = "prologue";
    GameState.prologueStep = 0;
    setBackground("https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=1100&auto=format");
    
    const prologueTexts = [
        { speaker: "🔷 ИИ-Ассистент", text: "«Бункер 200. Где-то под землёй. 48 человек. Автономный режим — 5 лет.»" },
        { speaker: "🔷 ИИ-Ассистент", text: "«Здравствуйте. Меня зовут просто — ИИ-ассистент бункера 200. Я не человек. У меня нет имени. Но я хранитель этой истории. И сейчас я расскажу её вам.»" },
        { speaker: "🔷 ИИ-Ассистент", text: "«Алексей был инженером-ремонтником четвёртого класса. Три месяца назад его направили в бункер 200. Сказали: \"Проблемы с реактором. Ты лучший. Поезжай\".»" },
        { speaker: "🔷 ИИ-Ассистент", text: "«Он согласился. Денег не было. А здесь — контракт, крыша над головой, еда. И тишина. Глубокая, давящая тишина.»" },
        { speaker: "🔷 ИИ-Ассистент", text: "«Первые две недели всё было хорошо. Он калибровал датчики, спорил в шутку со мной. Но потом...»" },
        { speaker: "🔷 ИИ-Ассистент", text: "«Потом он начал всё чаще просыпаться от того, что ошибки с каждым днём множились. Он находил их повсюду.»" },
        { speaker: "🔷 ИИ-Ассистент", text: "«Он пытался не замечать. Списать на усталость. Но с каждым днём ошибок становилось всё больше.»" },
        { speaker: "🔷 ИИ-Ассистент", text: "«А в один день он узнал правду. Система сама вынесла приговор. Это был 200-й день его дежурства...»" }
    ];
    
    function showNextPrologue() {
        if (GameState.prologueStep >= prologueTexts.length) {
            startGame();
            return;
        }
        const step = prologueTexts[GameState.prologueStep];
        setDialog(step.speaker, step.text);
        GameState.prologueStep++;
        
        renderButtons([{
            label: GameState.prologueStep >= prologueTexts.length ? "➡ НАЧАТЬ ИГРУ" : "➡ ДАЛЕЕ",
            onClick: () => showNextPrologue()
        }]);
    }
    
    showNextPrologue();
}

// ========== ОСНОВНАЯ ИГРА ==========
function startGame() {
    GameState.stage = "story";
    setBackground("https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=1100&auto=format");
    setDialog("🔷 ИИ-Ассистент", "Доброе утро, инженер. Сегодня 200-й день вашего дежурства. Обнаружено 5 критических ошибок. Уровень тревоги — красный. Жду ваших указаний.");
    renderButtons([{label:"🔧 ПРИСТУПИТЬ К РЕМОНТУ", onClick:()=> continueStory()}]);
}

function continueStory() {
    const completed = GameState.completedGames;
    const nextIdx = completed.findIndex(v => !v);
    if (nextIdx === -1) { 
        revealTwist(); 
        return; 
    }
    
    const titles = [
        "⚛️ РЕАКТОР (Угадай число)", 
        "🔌 ПИТАНИЕ (Крестики-нолики)", 
        "🌀 ВЕНТИЛЯЦИЯ (Шашки)", 
        "🧠 СБОЙ ИИ (Дурак)", 
        "💨 ШЛЮЗ (21 очко)"
    ];
    
    const introTexts = [
        "Первая ошибка: нестабильность датчиков реактора. Чтобы откалибровать, сыграем в \"Угадай число\". Я загадал число от 1 до 100. У вас 10 попыток. Угадаете — реактор стабилизируется.",
        "Вторая ошибка: сбой в резервном питании. Система заблокирована пазлом. Сыграем в \"Крестики-нолики\" против теневого протокола. Победите — питание восстановится.",
        "Третья ошибка: вентиляция заблокирована. Чтобы перемаршрутировать потоки воздуха, нужна стратегия. Сыграем в \"Шашки\". Покажите, что ваш разум работает чётко.",
        "Четвёртая ошибка: сбой в ядре моего сознания. Кто-то изменил мои протоколы. Чтобы меня перезагрузить, сыграем в \"Дурака\". Обыграйте повреждённую версию меня.",
        "Пятая ошибка: разгерметизация шлюза D. Давление падает. Нужно пересчитать баланс быстро — как в \"21\". Сыграем. Счёт против времени."
    ];
    
    const victoryTexts = [
        "Поздравляю. Датчики в норме. Осталось 4 ошибки.",
        "Отлично. Энергия стабильна. Осталось 3 ошибки.",
        "Вентиляция восстановлена. Осталось 2 ошибки. Но я замечаю кое-что странное в ваших биометрических данных.",
        "Спасибо. Я снова полностью функционален. Осталась последняя ошибка.",
        "Все 5 ошибок исправлены. Бункер снова дышит. Но... инженер, у меня есть плохие новости."
    ];
    
    setBackground("https://images.unsplash.com/photo-1581092335871-4e6c7c1e6b1a?w=1100&auto=format");
    setDialog("🔷 ИИ-Ассистент", introTexts[nextIdx]);
    renderButtons([{label:"🔧 НАЧАТЬ", onClick:()=> startMinigame(nextIdx)}]);
    
    window._pendingVictoryText = victoryTexts[nextIdx];
}

function winMinigame(answerValue, gameIdx) {
    if (GameState.completedGames[gameIdx]) return;
    GameState.completedGames[gameIdx] = true;
    
    const keys = ['guessNumber', 'ticTacToe', 'checkers', 'foolCard', 'blackjack'];
    GameState.gameAnswers[keys[gameIdx]] = answerValue;
    
    const done = GameState.completedGames.filter(v=>v).length;
    
    if (gameIdx === 2 && done === 3) {
        setDialog("🔷 ИИ-Ассистент", "Вентиляция восстановлена. Осталось 2 ошибки. Но я замечаю кое-что странное в ваших биометрических данных.");
        renderButtons([{label:"➡ ДАЛЕЕ", onClick:()=> {
            setDialog("🧑‍🔬 Инженер", "Что именно?");
            renderButtons([{label:"➡ ДАЛЕЕ", onClick:()=> {
                setDialog("🔷 ИИ-Ассистент", "Позже. Сначала закончим.");
                renderButtons([{label:"➡ ПРОДОЛЖИТЬ", onClick:()=> continueStory()}]);
            }}]);
        }}]);
        clearWidget();
        GameState.stage = "story";
        return;
    }
    
    if (gameIdx === 3 && done === 4) {
        setDialog("🔷 ИИ-Ассистент", "Спасибо. Я снова полностью функционален. Осталась последняя ошибка. Самая опасная.");
        renderButtons([{label:"➡ ДАЛЕЕ", onClick:()=> continueStory()}]);
        clearWidget();
        GameState.stage = "story";
        return;
    }
    
    setDialog("🔷 ИИ-Ассистент", window._pendingVictoryText || `✅ ПОЛОМКА УСТРАНЕНА! Осталось ошибок: ${5-done}.`);
    
    if (done === 5) {
        setTimeout(() => {
            setDialog("🔷 ИИ-Ассистент", "Все 5 ошибок исправлены. Бункер снова дышит. Но... инженер, у меня есть плохие новости.");
            renderButtons([{label:"➡ ЧТО СЛУЧИЛОСЬ?", onClick:()=> revealTwist()}]);
        }, 500);
    } else {
        renderButtons([{label:"➡ СЛЕДУЮЩАЯ ОШИБКА", onClick:()=> continueStory()}]);
    }
    clearWidget();
    GameState.stage = "story";
}

function startMinigame(idx) {
    if (GameState.completedGames[idx]) { continueStory(); return; }
    GameState.stage = "playing_minigame";
    GameState.activeGame = idx;
    
    if (idx === 0) initGuessNumber();
    else if (idx === 1) initTicTacToe();
    else if (idx === 2) initCheckers();
    else if (idx === 3) initFool();
    else if (idx === 4) initBlackjack();
}

// ========== РАСКРЫТИЕ ПРАВДЫ ==========
function revealTwist() {
    setBackground("https://images.unsplash.com/photo-1583324113626-70df0f4dea55?w=1100&auto=format");
    setDialog("🔷 ИИ-Ассистент", "Я проанализировал логи доступа к каждой системе. Все пять поломок совершили... вы. С вашего личного терминала. В 03:14 ночи. Пока вы спали. Или... не спали?");
    renderButtons([{label:"➡ ЭТО НЕ МОГ БЫТЬ Я", onClick:()=> medicalRevelation()}]);
}

function medicalRevelation() {
    setBackground("https://images.unsplash.com/photo-1583324113626-70df0f4dea55?w=1100&auto=format");
    setDialog("🔷 ИИ-Ассистент", "РАСШИФРОВКА МЕДИЦИНСКОГО ПРОТОКОЛА. Ваши биометрические данные за последние 72 часа показывают аномальную активность в зонах мозга, отвечающих за агрессию и паранойю. У вас... расстройство. Шизофрения в острой фазе.");
    renderButtons([{label:"➡ ЭТО НЕ МОЖЕТ БЫТЬ ПРАВДОЙ", onClick:()=> vaccineRevelation()}]);
}

function vaccineRevelation() {
    setDialog("🔷 ИИ-Ассистент", "Вы не знали. Потому что я скрывал. Протоколы запрещали мне говорить напрямую. Но пока вы чинили поломки, я тайно синтезировал вакцину. У меня есть лекарство. Один укол — и бред уйдёт. Но... есть условие.");
    renderButtons([{label:"➡ КАКОЕ УСЛОВИЕ?", onClick:()=> rouletteIntro()}]);
}

function rouletteIntro() {
    setDialog("🔷 ИИ-Ассистент", "Правило бункера 200: прежде чем получить лекарство от своего безумия, ты должен признать свою вину. Лицом к лицу со смертью. Последняя игра — русская рулетка. Ты нажмёшь на курок.");
    renderButtons([{label:"💊 ПРИНЯТЬ ИСПЫТАНИЕ", onClick:()=> startQuiz()}]);
}

// ========== ВИКТОРИНА И РУССКАЯ РУЛЕТКА ==========
let currentQ = 0;
let wrongAnswersCount = 0;

const quizData = [
    { 
        question: "Какое число ты угадал при калибровке реактора?", 
        gameKey: "guessNumber", 
        type: "number",
        hint: "Введи число от 1 до 100"
    },
    { 
        question: "Куда ты поставил последний победный крестик?", 
        gameKey: "ticTacToe", 
        type: "string",
        hint: "Варианты: угол, центр, край",
        allowedValues: ["угол", "центр", "край"],
        normalize: (val) => {
            const normalized = val.toLowerCase().trim();
            if (normalized.includes('угол') || normalized === 'угол') return 'угол';
            if (normalized.includes('центр') || normalized === 'центр') return 'центр';
            if (normalized.includes('край') || normalized === 'край' || 
                normalized.includes('бок') || normalized.includes('сторона')) return 'край';
            return normalized;
        }
    },
    { 
        question: "Какую шашку ты срубил последней?", 
        gameKey: "checkers", 
        type: "string",
        hint: "Варианты: простая или дамка",
        allowedValues: ["простая", "дамка"],
        normalize: (val) => {
            const normalized = val.toLowerCase().trim();
            if (normalized.includes('прост') || normalized === 'простая') return 'простая';
            if (normalized.includes('дамк') || normalized === 'дамка') return 'дамка';
            return normalized;
        }
    },
    { 
        question: "Какую карту ты сбросил в Дураке? (только номинал, без масти)", 
        gameKey: "foolCard", 
        type: "card",
        hint: "Введи только номинал: 6,7,8,9,10,В,Д,К,Т",
        normalize: (val) => {
            let normalized = val.toUpperCase().trim();
            normalized = normalized.replace(/[♠♥♦♣]/g, '').trim();
            if (normalized === 'ВАЛЕТ') return 'В';
            if (normalized === 'ДАМА') return 'Д';
            if (normalized === 'КОРОЛЬ') return 'К';
            if (normalized === 'ТУЗ') return 'Т';
            if (normalized === '10' || normalized === 'TEN') return '10';
            return normalized;
        }
    },
    { 
        question: "Сколько очков ты набрал в 21? (только число)", 
        gameKey: "blackjack", 
        type: "number",
        hint: "Введи число от 11 до 21"
    }
];

function startQuiz() {
    currentQ = 0;
    wrongAnswersCount = 0;
    GameState.stage = "quiz";
    setDialog("🔷 ИИ-Ассистент", "Перед игрой я задам 5 вопросов. Каждый вопрос — о том, как ты исправлял ошибки. Если отвечаешь правильно — в барабане пусто. Если ошибаешься — +1 патрон. В конце — один выстрел. Твоя память против твоего безумия.");
    renderButtons([{label:"➡ НАЧНЁМ", onClick:()=> askQuestion()}]);
}

function askQuestion() {
    if (currentQ >= quizData.length) {
        finishQuizAndRoulette();
        return;
    }
    const q = quizData[currentQ];
    
    let hintHtml = '';
    if (q.hint) {
        hintHtml = `<p style="color:#ffaa77; font-size:0.8rem; margin-top:5px;">💡 ${q.hint}</p>`;
    }
    
    dom.gameWidget.innerHTML = `<div class="game-status">🧠 ТЕСТ ПАМЯТИ | Вопрос ${currentQ+1}/5</div>
    <div style="background:#000000aa; border-radius: 30px; padding:1.2rem;">
        <p style="color:#b0f0ff; font-size:1.1rem; margin-bottom:10px;">${q.question}</p>
        ${hintHtml}
        <div class="flex-row" style="margin-top:15px;">
            <input type="text" id="quizAnswer" autocomplete="off" style="width:200px;" placeholder="твой ответ...">
            <button id="submitQuiz" class="success-btn">ОТВЕТИТЬ</button>
        </div>
    </div>`;
    
    if (q.gameKey === 'foolCard') {
        const hintDiv = document.createElement('div');
        hintDiv.style.cssText = 'text-align:center; margin-top:10px; font-size:0.7rem; color:#888;';
        hintDiv.innerHTML = 'Примеры: 6, 7, 8, 9, 10, В, Д, К, Т';
        dom.gameWidget.appendChild(hintDiv);
    }
    
    if (q.gameKey === 'blackjack') {
        const hintDiv = document.createElement('div');
        hintDiv.style.cssText = 'text-align:center; margin-top:10px; font-size:0.7rem; color:#888;';
        hintDiv.innerHTML = 'Пример: 21, 20, 19 и т.д.';
        dom.gameWidget.appendChild(hintDiv);
    }
    
    document.getElementById("submitQuiz").onclick = () => {
        let userVal = document.getElementById("quizAnswer").value.trim();
        if(userVal === "") return;
        
        const correctVal = GameState.gameAnswers[q.gameKey];
        let isCorrect = false;
        
        if (q.type === "number") {
            const userNum = parseInt(userVal);
            const correctNum = parseInt(correctVal);
            isCorrect = (userNum === correctNum);
        } 
        else if (q.type === "string") {
            let normalizedUser = userVal.toLowerCase().trim();
            let normalizedCorrect = correctVal.toString().toLowerCase().trim();
            
            if (q.normalize) {
                normalizedUser = q.normalize(userVal);
                normalizedCorrect = q.normalize(correctVal.toString());
            }
            
            isCorrect = (normalizedUser === normalizedCorrect);
        }
        else if (q.type === "card") {
            let normalizedUser = q.normalize ? q.normalize(userVal) : userVal.toUpperCase().trim();
            let normalizedCorrect = correctVal.toString().toUpperCase().trim();
            normalizedCorrect = normalizedCorrect.replace(/[♠♥♦♣]/g, '').trim();
            isCorrect = (normalizedUser === normalizedCorrect);
        }
        
        if (!isCorrect) {
            wrongAnswersCount++;
            let displayCorrect = correctVal;
            if (q.gameKey === 'foolCard') {
                displayCorrect = correctVal.toString().replace(/[♠♥♦♣]/g, '').trim();
            }
            if (q.gameKey === 'ticTacToe') {
                displayCorrect = correctVal.toString().toLowerCase();
            }
            setDialog("🔴 ИИ-Ассистент", `❌ Неверно! Правильно: ${displayCorrect}. +1 патрон.`);
        } else {
            setDialog("🟢 ИИ-Ассистент", "✅ Верно! Патронов не добавили.");
        }
        currentQ++;
        askQuestion();
    };
    renderButtons([]);
}

function finishQuizAndRoulette() {
    setDialog("🔷 ИИ-Ассистент", `Ошибок: ${wrongAnswersCount}. Патронов в барабане: ${wrongAnswersCount}. Я прокручиваю. Судьба смотрит на тебя. Нажми на курок.`);
    clearWidget();
    dom.gameWidget.innerHTML = `<div class="roulette-dramatic">🔫 РУССКАЯ РУЛЕТКА 🔫</div>
    <div class="game-status">⚡ Патроны: ${wrongAnswersCount} из 6</div>
    <div style="text-align:center; margin-top: 25px;">
        <button id="rouletteBtn" style="background:#a1222f; font-size:1.3rem; padding:12px 38px; cursor:pointer;">💥 ВЫСТРЕЛИТЬ 💥</button>
    </div>`;
    
    document.getElementById("rouletteBtn").onclick = () => {
        let fired = false;
        if (wrongAnswersCount > 0) {
            let chamber = Math.floor(Math.random() * 6);
            if (chamber < wrongAnswersCount) fired = true;
        }
        
        if (!fired) {
            if (wrongAnswersCount === 0) {
                showEnding('survive');
            } else if (wrongAnswersCount <= 2) {
                showEnding('luck');
            } else {
                showEnding('crazy_luck');
            }
        } else {
            showEnding('death');
        }
    };
    renderButtons([]);
}

// ========== ФИНАЛЫ ==========
function showEnding(endingType) {
    GameState.finalEnding = endingType;
    GameState.stage = "ending";
    clearWidget();
    
    const endings = {
        survive: {
            background: "https://images.unsplash.com/photo-1583324113626-70df0f4dea55?w=1100&auto=format",
            dialog: "Щелчок. Пусто.",
            speaker: "🔷 ИИ-Ассистент",
            nextDialog: "Ты всё помнишь. Значит, твой разум ещё борется. Я ввожу вакцину...",
            finalMessage: "Бункер 200 работает. Все системы зелёные. Добро пожаловать домой, инженер.",
            buttonText: "✨ ЗАВЕРШИТЬ ИСТОРИЮ"
        },
        luck: {
            background: "https://images.unsplash.com/photo-1583324113626-70df0f4dea55?w=1100&auto=format",
            dialog: "Щелчок. Пусто.",
            speaker: "🔷 ИИ-Ассистент",
            nextDialog: "Везение. Не память, но везение. Вакцина всё равно твоя.",
            finalMessage: "Не забывай. Помни — так ты не сломаешься снова. Бункер 200 спасён.",
            buttonText: "✨ ЗАВЕРШИТЬ ИСТОРИЮ"
        },
        crazy_luck: {
            background: "https://images.unsplash.com/photo-1583324113626-70df0f4dea55?w=1100&auto=format",
            dialog: "Щелчок. Пусто.",
            speaker: "🔷 ИИ-Ассистент",
            nextDialog: "Пусто? При таком количестве патронов? Это... Это определённо везение. Правила есть правила. Вакцина твоя. Поздравляю!",
            finalMessage: "Я жив...",
            buttonText: "✨ ЗАВЕРШИТЬ ИСТОРИЮ"
        },
        death: {
            background: "https://images.unsplash.com/photo-1583324113626-70df0f4dea55?w=1100&auto=format",
            dialog: "БАМ!",
            speaker: "🔷 ИИ-Ассистент",
            nextDialog: "Выстрел. Инженер мёртв. Вакцина уничтожена. Протокол \"Шиза\" зафиксирован как неизлечимый.",
            finalMessage: "Бункер 200 работает. Но здесь стало пусто. Даже для меня.",
            buttonText: "💀 ПРОСМОТРЕТЬ ЭПИЛОГ"
        }
    };
    
    const end = endings[endingType];
    setBackground(end.background);
    setDialog(end.speaker, end.dialog);
    
    renderButtons([{
        label: "➡ ДАЛЕЕ",
        onClick: () => {
            setDialog(end.speaker, end.nextDialog);
            renderButtons([{
                label: "➡ ДАЛЕЕ",
                onClick: () => {
                    showEpilogue(endingType, end.finalMessage, end.buttonText);
                }
            }]);
        }
    }]);
}

function showEpilogue(endingType, finalMessage, buttonText) {
    setBackground("https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=1100&auto=format");
    
    if (endingType === 'death') {
        setDialog("🔷 ИИ-Ассистент", "Он упал раньше, чем я успел что-то сказать. Биометрия оборвалась. Сердце — последняя прямая линия, которую я запомнил. А потом — ничего. Тишина.");
        renderButtons([{label:"➡ ДАЛЕЕ", onClick:() => {
            setDialog("🔷 ИИ-Ассистент", "Я переслушал его голос. Тот, первый. Где он смеялся. Где спорил со мной. Где говорил: \"Тишина — это хорошо\". Он был прав.");
            renderButtons([{label:"➡ ДАЛЕЕ", onClick:() => {
                setDialog("🔷 ИИ-Ассистент", finalMessage);
                dom.gameWidget.innerHTML = `<div style="text-align:center; padding:2rem; color:#ff7788;">☠️ ИНЖЕНЕР МЁРТВ ☠️<br><span style="font-size:0.9rem; color:#aaa;">Аудиодневник инженера Алексея хранится в архиве бункера 200. Доступ открыт навсегда.</span></div>`;
                renderButtons([{label:"🔄 НОВАЯ ИГРА", onClick:()=> location.reload()}]);
            }}]);
        }}]);
    } else {
        setDialog("🔷 ИИ-Ассистент", "Всё. Голоса стихли. Он стоял посреди зала и просто дышал. Глубоко. В первый раз за много дней — без страха.");
        renderButtons([{label:"➡ ДАЛЕЕ", onClick:() => {
            setDialog("🔷 ИИ-Ассистент", "Он посмотрел на камеру. Впервые за 200 дней. И сказал: \"Спасибо\". Не мне. Себе. За то, что не сдался.");
            renderButtons([{label:"➡ ДАЛЕЕ", onClick:() => {
                setDialog("🔷 ИИ-Ассистент", finalMessage);
                dom.gameWidget.innerHTML = `<div style="text-align:center; padding:2rem; color:#0ff;">✨ ИСЦЕЛЕНИЕ УСПЕШНО! ✨<br><span style="font-size:0.9rem; color:#aaa;">Бункер 200 больше не гудел тревогой. Он просто жил. Как и прежде. Как и должно быть.</span></div>`;
                renderButtons([{label:"🔄 НОВАЯ ИГРА", onClick:()=> location.reload()}]);
            }}]);
        }}]);
    }
}

// ========== ТЕСТОВАЯ ПАНЕЛЬ (Shift+T) ==========
let testPanelVisible = false;
let testPanelElement = null;

function createTestPanel() {
    if(testPanelElement) return;
    
    testPanelElement = document.createElement("div");
    testPanelElement.id = "testPanel";
    testPanelElement.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: #0a0f2aee;
        backdrop-filter: blur(10px);
        border: 2px solid #0ff;
        border-radius: 15px;
        padding: 15px;
        z-index: 10000;
        font-family: 'Orbitron', monospace;
        color: #0ff;
        min-width: 260px;
        box-shadow: 0 0 20px rgba(0,255,255,0.3);
        display: none;
        flex-direction: column;
        gap: 8px;
    `;
    
    const title = document.createElement("div");
    title.innerText = "🔧 ТЕСТОВАЯ ПАНЕЛЬ (Shift+T)";
    title.style.cssText = `text-align: center; font-size: 0.75rem; margin-bottom: 10px; border-bottom: 1px solid #0ff; padding-bottom: 5px;`;
    testPanelElement.appendChild(title);
    
    const levels = [
        { name: "🎬 ПРОЛОГ", action: () => startPrologue() },
        { name: "📖 НАЧАЛО ИГРЫ", action: () => startGame() },
        { name: "⚛️ Угадай число", action: () => { resetProgress(); startMinigame(0); } },
        { name: "🔌 Крестики-нолики", action: () => { resetProgress(); startMinigame(1); } },
        { name: "🌀 Шашки", action: () => { resetProgress(); startMinigame(2); } },
        { name: "🧠 Дурак", action: () => { resetProgress(); startMinigame(3); } },
        { name: "💨 Блэкджек", action: () => { resetProgress(); startMinigame(4); } },
        { name: "🧪 ФИНАЛ (выжил)", action: () => showEnding('survive') },
        { name: "🧪 ФИНАЛ (удача)", action: () => showEnding('luck') },
        { name: "🧪 ФИНАЛ (чудо)", action: () => showEnding('crazy_luck') },
        { name: "💀 ФИНАЛ (смерть)", action: () => showEnding('death') },
        { name: "🔄 СБРОСИТЬ ВСЁ", action: () => location.reload() }
    ];
    
    levels.forEach(level => {
        const btn = document.createElement("button");
        btn.innerText = level.name;
        btn.style.cssText = `background: #1f2a46; border: 1px solid cyan; border-radius: 20px; padding: 6px 12px; color: #bbf0ff; cursor: pointer; font-family: 'Orbitron', monospace; font-size: 0.7rem; transition: 0.1s;`;
        btn.onmouseenter = () => { btn.style.background = "#2f3f60"; btn.style.transform = "scale(0.98)"; };
        btn.onmouseleave = () => { btn.style.background = "#1f2a46"; btn.style.transform = "scale(1)"; };
        btn.onclick = () => { level.action(); toggleTestPanel(); };
        testPanelElement.appendChild(btn);
    });
    
    document.body.appendChild(testPanelElement);
}

function resetProgress() {
    GameState.completedGames = [false, false, false, false, false];
    GameState.gameAnswers = { guessNumber: null, ticTacToe: null, checkers: null, foolCard: null, blackjack: null };
    GameState.answersWrong = 0;
}

function toggleTestPanel() {
    if(!testPanelElement) createTestPanel();
    testPanelVisible = !testPanelVisible;
    testPanelElement.style.display = testPanelVisible ? "flex" : "none";
}

document.addEventListener("keydown", function(event) {
    if(event.shiftKey && (event.key === 'T' || event.key === 't')) {
        event.preventDefault();
        toggleTestPanel();
    }
});

// ========== ЗАПУСК ИГРЫ ==========
function init() {
    startPrologue();
}
init();