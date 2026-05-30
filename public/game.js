// ========== Глобальное состояние игры ==========
const GameState = {
    stage: "prologue",
    completedGames: [false, false, false, false, false],
    answersWrong: 0,
    gameAnswers: { guessNumber: null, ticTacToe: null, checkers: null, foolCard: null, blackjack: null },
    activeGame: null,
    prologueStep: 0,
    finalEnding: null
};

// DOM элементы
const dom = {
    scene: document.getElementById("sceneBg"),
    speaker: document.getElementById("speakerName"),
    dialog: document.getElementById("dialogMsg"),
    gameWidget: document.getElementById("gameWidget"),
    gameStatus: document.getElementById("gameStatus"),
    actionDiv: document.getElementById("actionButtons"),
    gameArea: document.getElementById("gameArea"),
    dialogPanel: document.querySelector(".dialog-panel"),
    gameContainer: document.querySelector(".game-container")
};

// ========== УПРАВЛЕНИЕ РЕЖИМАМИ ОТОБРАЖЕНИЯ С ПЛАВНОСТЬЮ ==========
function setMode(mode) {
    const gameArea = dom.gameArea;
    const dialogPanel = dom.dialogPanel;
    const gameContainer = dom.gameContainer;
    
    if (mode === 'dialog') {
        // Плавное скрытие игры и показ диалога
        gameArea.classList.add('hide-game');
        dialogPanel.classList.remove('hide-dialog');
        gameContainer.classList.add('dialog-mode');
        gameContainer.classList.remove('game-mode', 'both-mode');
        
        // Небольшая задержка для плавности
        setTimeout(() => {
            if (gameArea.classList.contains('hide-game')) {
                gameArea.style.display = 'none';
            }
        }, 400);
        
    } else if (mode === 'game') {
        // Плавное скрытие диалога и показ игры
        gameArea.style.display = 'block';
        dialogPanel.classList.add('hide-dialog');
        gameArea.classList.remove('hide-game');
        gameContainer.classList.add('game-mode');
        gameContainer.classList.remove('dialog-mode', 'both-mode');
        
        setTimeout(() => {
            if (dialogPanel.classList.contains('hide-dialog')) {
                // Диалог скрыт
            }
        }, 400);
        
    } else if (mode === 'both') {
        // Показываем оба
        gameArea.style.display = 'block';
        dialogPanel.classList.remove('hide-dialog');
        gameArea.classList.remove('hide-game');
        gameContainer.classList.add('both-mode', 'game-mode');
        gameContainer.classList.remove('dialog-mode');
    }
}

function showDialogOnly() {
    setMode('dialog');
}

function showGameOnly() {
    setMode('game');
}

function showBoth() {
    setMode('both');
}

function showDialogOnly() {
    setMode('dialog');
}

function showGameOnly() {
    setMode('game');
}

function showBoth() {
    setMode('both');
}

function setDialog(speaker, text, showGame = false) {
    // Анимация смены текста
    const dialogMsg = dom.dialog;
    dialogMsg.style.opacity = '0';
    dialogMsg.style.transform = 'translateX(-10px)';
    
    setTimeout(() => {
        dom.speaker.innerText = speaker;
        dialogMsg.innerText = text;
        dialogMsg.style.opacity = '1';
        dialogMsg.style.transform = 'translateX(0)';
    }, 150);
    
    if (showGame) {
        showBoth();
    } else {
        showDialogOnly();
    }
}

function setBackground(url) {
    dom.scene.style.backgroundImage = `url('${url}')`;
}

function clearWidget() {
    const widget = dom.gameWidget;
    // Для шашек (индекс 2) и дурака (индекс 3) не делаем плавное исчезновение
    if (GameState.activeGame === 2 || GameState.activeGame === 3) {
        widget.innerHTML = "";
    } else {
        if (widget.children.length > 0) {
            widget.style.opacity = '0';
            widget.style.transform = 'translateY(10px)';
            setTimeout(() => {
                widget.innerHTML = "";
                widget.style.opacity = '1';
                widget.style.transform = 'translateY(0)';
            }, 200);
        } else {
            widget.innerHTML = "";
        }
    }
}

function renderButtons(buttons) {
    const actionDiv = dom.actionDiv;
    actionDiv.style.opacity = '0';
    actionDiv.style.transform = 'translateY(10px)';
    
    setTimeout(() => {
        actionDiv.innerHTML = "";
        buttons.forEach(btn => {
            const button = document.createElement("button");
            button.innerText = btn.label;
            if (btn.danger) button.classList.add("danger-btn");
            if (btn.success) button.classList.add("success-btn");
            button.onclick = () => btn.onClick?.();
            actionDiv.appendChild(button);
        });
        
        actionDiv.style.opacity = '1';
        actionDiv.style.transform = 'translateY(0)';
    }, 150);
}

// ========== ПРОЛОГ ==========
function startPrologue() {
    GameState.stage = "prologue";
    GameState.prologueStep = 0;
    setBackground("https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=1100&auto=format");
    
    const prologueTexts = [
        { speaker: "🔷 ИИ-Ассистент", text: "«Бункер 200. Где-то под землёй. 48 человек. Автономный режим — 5 лет.»" },
        { speaker: "🔷 ИИ-Ассистент", text: "«Здравствуйте. Меня зовут просто — ИИ-ассистент бункера 200. Я не человек. У меня нет имени. Но я хранитель этой истории. И сейчас я расскажу её вам.»" },
        { speaker: "🔷 ИИ-Ассистент", text: "«Алексей был инженером-ремонтником четвёртого класса. Три месяца назад его направили в бункер 200.»" },
        { speaker: "🔷 ИИ-Ассистент", text: "«Он согласился. Денег не было. А здесь — контракт, крыша над головой, еда. И тишина.»" },
        { speaker: "🔷 ИИ-Ассистент", text: "«Первые две недели всё было хорошо. Но потом...»" },
        { speaker: "🔷 ИИ-Ассистент", text: "«Потом он начал всё чаще просыпаться от того, что ошибки множились.»" },
        { speaker: "🔷 ИИ-Ассистент", text: "«А в один день он узнал правду. Это был 200-й день его дежурства...»" }
    ];
    
    function showNextPrologue() {
        if (GameState.prologueStep >= prologueTexts.length) {
            startGame();
            return;
        }
        const step = prologueTexts[GameState.prologueStep];
        setDialog(step.speaker, step.text, false);
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
    setDialog("🔷 ИИ-Ассистент", "Доброе утро, инженер. Сегодня 200-й день вашего дежурства. Обнаружено 5 критических ошибок. Уровень тревоги — красный.", false);
    renderButtons([{label:"🔧 ПРИСТУПИТЬ К РЕМОНТУ", onClick:()=> continueStory()}]);
}

function continueStory() {
    const completed = GameState.completedGames;
    const nextIdx = completed.findIndex(v => !v);
    if (nextIdx === -1) { 
        revealTwist(); 
        return; 
    }
    
    const introTexts = [
        "Первая ошибка: нестабильность датчиков реактора. Чтобы откалибровать, сыграем в \"Угадай число\". У вас 10 попыток.",
        "Вторая ошибка: сбой в резервном питании. Сыграем в \"Крестики-нолики\" против теневого протокола.",
        "Третья ошибка: вентиляция заблокирована. Сыграем в \"Шашки\". Покажите, что ваш разум работает чётко.",
        "Четвёртая ошибка: сбой в ядре моего сознания. Сыграем в \"Дурака\", чтобы меня перезагрузить.",
        "Пятая ошибка: разгерметизация шлюза D. Сыграем в \"21\", чтобы стабилизировать давление."
    ];
    
    setBackground("https://images.unsplash.com/photo-1581092335871-4e6c7c1e6b1a?w=1100&auto=format");
    setDialog("🔷 ИИ-Ассистент", introTexts[nextIdx], false);
    renderButtons([{label:"🔧 НАЧАТЬ ИГРУ", onClick:()=> startMinigame(nextIdx)}]);
}

function winMinigame(answerValue, gameIdx) {
    if (GameState.completedGames[gameIdx]) return;
    GameState.completedGames[gameIdx] = true;
    
    const keys = ['guessNumber', 'ticTacToe', 'checkers', 'foolCard', 'blackjack'];
    GameState.gameAnswers[keys[gameIdx]] = answerValue;
    
    const done = GameState.completedGames.filter(v=>v).length;
    
    // Очищаем игровую область ПОЛНОСТЬЮ
    clearWidget();
    // Показываем диалог
    showDialogOnly();
    
    const victoryTexts = [
        "Поздравляю. Датчики в норме. Осталось 4 ошибки.",
        "Отлично. Энергия стабильна. Осталось 3 ошибки. Вы хорошо держитесь.",
        "Вентиляция восстановлена. Осталось 2 ошибки. Но я замечаю кое-что странное в ваших биометрических данных.",
        "Спасибо. Я снова полностью функционален. Осталась последняя ошибка. Самая опасная.",
        "Все 5 ошибок исправлены. Бункер снова дышит. Но... инженер, у меня есть плохие новости."
    ];
    
    setDialog("🔷 ИИ-Ассистент", victoryTexts[gameIdx], false);
    
    if (done === 5) {
        renderButtons([{label:"➡ ЧТО СЛУЧИЛОСЬ?", onClick:()=> revealTwist()}]);
    } else {
        renderButtons([{label:"➡ СЛЕДУЮЩАЯ ОШИБКА", onClick:()=> continueStory()}]);
    }
}

function startMinigame(idx) {
    if (GameState.completedGames[idx]) { 
        continueStory(); 
        return; 
    }
    GameState.stage = "playing_minigame";
    GameState.activeGame = idx;
    
    // Показываем игровую область, скрываем диалог
    showGameOnly();
    clearWidget();
    
    if (idx === 0) initGuessNumber();
    else if (idx === 1) initTicTacToe();
    else if (idx === 2) initCheckers();
    else if (idx === 3) initFool();
    else if (idx === 4) initBlackjack();
}

// ========== РАСКРЫТИЕ ПРАВДЫ ==========
function revealTwist() {
    setBackground("https://images.unsplash.com/photo-1583324113626-70df0f4dea55?w=1100&auto=format");
    setDialog("🔷 ИИ-Ассистент", "Я проанализировал логи доступа. Все пять поломок совершили... вы. С вашего личного терминала. В 03:14 ночи.", false);
    renderButtons([{label:"➡ ЭТО НЕ МОГ БЫТЬ Я", onClick:()=> medicalRevelation()}]);
}

function medicalRevelation() {
    setDialog("🔷 ИИ-Ассистент", "РАСШИФРОВКА МЕДИЦИНСКОГО ПРОТОКОЛА. Ваши биометрические данные показывают аномальную активность. У вас... шизофрения в острой фазе.", false);
    renderButtons([{label:"➡ ЭТО НЕ МОЖЕТ БЫТЬ ПРАВДОЙ", onClick:()=> vaccineRevelation()}]);
}

function vaccineRevelation() {
    setDialog("🔷 ИИ-Ассистент", "Я тайно синтезировал вакцину. Один укол — и бред уйдёт. Но есть условие.", false);
    renderButtons([{label:"➡ КАКОЕ УСЛОВИЕ?", onClick:()=> rouletteIntro()}]);
}

function rouletteIntro() {
    setDialog("🔷 ИИ-Ассистент", "Правило бункера 200: прежде чем получить лекарство, ты должен признать вину. Последняя игра — русская рулетка.", false);
    renderButtons([{label:"💊 ПРИНЯТЬ ИСПЫТАНИЕ", onClick:()=> startQuiz()}]);
}

// ========== ВИКТОРИНА ==========
let currentQ = 0;
let wrongAnswersCount = 0;

const quizData = [
    { question: "Какое число ты угадал при калибровке реактора?", gameKey: "guessNumber", type: "number", hint: "Введи число от 1 до 100" },
    { question: "Куда ты поставил последний победный крестик?", gameKey: "ticTacToe", type: "string", hint: "Варианты: угол, центр, край",
        normalize: (val) => { const n = val.toLowerCase().trim(); if (n.includes('угол')) return 'угол'; if (n.includes('центр')) return 'центр'; return 'край'; } },
    { question: "Какую шашку ты срубил последней?", gameKey: "checkers", type: "string", hint: "Варианты: простая или дамка",
        normalize: (val) => { const n = val.toLowerCase().trim(); if (n.includes('прост')) return 'простая'; return 'дамка'; } },
    { question: "Какую карту ты сбросил в Дураке? (только номинал)", gameKey: "foolCard", type: "card", hint: "6,7,8,9,10,В,Д,К,Т",
        normalize: (val) => { let n = val.toUpperCase().trim(); n = n.replace(/[♠♥♦♣]/g, ''); if (n === 'ВАЛЕТ') return 'В'; if (n === 'ДАМА') return 'Д'; if (n === 'КОРОЛЬ') return 'К'; if (n === 'ТУЗ') return 'Т'; return n; } },
    { question: "Сколько очков ты набрал в 21?", gameKey: "blackjack", type: "number", hint: "Введи число от 11 до 21" }
];

function startQuiz() {
    currentQ = 0;
    wrongAnswersCount = 0;
    GameState.stage = "quiz";
    showBoth();
    setDialog("🔷 ИИ-Ассистент", "Перед игрой я задам 5 вопросов. Ошибка = +1 патрон. Твоя память против твоего безумия.", true);
    renderButtons([{label:"➡ НАЧНЁМ", onClick:()=> askQuestion()}]);
}

function askQuestion() {
    if (currentQ >= quizData.length) {
        finishQuizAndRoulette();
        return;
    }
    const q = quizData[currentQ];
    
    let hintHtml = q.hint ? `<p style="color:#ffaa77; font-size:0.8rem; margin-top:5px;">💡 ${q.hint}</p>` : '';
    
    dom.gameWidget.innerHTML = `<div class="game-status">🧠 ТЕСТ ПАМЯТИ | Вопрос ${currentQ+1}/5</div>
    <div style="background:#000000aa; border-radius: 30px; padding:1.2rem;">
        <p style="color:#b0f0ff; font-size:1.1rem;">${q.question}</p>
        ${hintHtml}
        <div class="flex-row" style="margin-top:15px;">
            <input type="text" id="quizAnswer" autocomplete="off" style="width:200px;" placeholder="твой ответ...">
            <button id="submitQuiz" class="success-btn">ОТВЕТИТЬ</button>
        </div>
    </div>`;
    
    document.getElementById("submitQuiz").onclick = () => {
        let userVal = document.getElementById("quizAnswer").value.trim();
        if(userVal === "") return;
        
        const correctVal = GameState.gameAnswers[q.gameKey];
        let isCorrect = false;
        
        if (q.type === "number") {
            isCorrect = (parseInt(userVal) === parseInt(correctVal));
        } else {
            let normalizedUser = q.normalize ? q.normalize(userVal) : userVal.toLowerCase().trim();
            let normalizedCorrect = correctVal.toString().toLowerCase().trim();
            if (q.normalize) normalizedCorrect = q.normalize(correctVal.toString());
            isCorrect = (normalizedUser === normalizedCorrect);
        }
        
        if (!isCorrect) {
            wrongAnswersCount++;
            let displayCorrect = correctVal;
            if (q.gameKey === 'foolCard') displayCorrect = correctVal.toString().replace(/[♠♥♦♣]/g, '');
            setDialog("🔴 ИИ-Ассистент", `❌ Неверно! Правильно: ${displayCorrect}. +1 патрон.`, true);
        } else {
            setDialog("🟢 ИИ-Ассистент", "✅ Верно! Патронов не добавили.", true);
        }
        currentQ++;
        askQuestion();
    };
    renderButtons([]);
}

function finishQuizAndRoulette() {
    setDialog("🔷 ИИ-Ассистент", `Ошибок: ${wrongAnswersCount}. Патронов в барабане: ${wrongAnswersCount}. Нажми на курок.`, true);
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
            if (wrongAnswersCount === 0) showEnding('survive');
            else if (wrongAnswersCount <= 2) showEnding('luck');
            else showEnding('crazy_luck');
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
    showDialogOnly();
    
    const endings = {
        survive: { dialog: "Щелчок. Пусто.", nextDialog: "Ты всё помнишь. Я ввожу вакцину...", finalMessage: "Бункер 200 работает. Добро пожаловать домой, инженер." },
        luck: { dialog: "Щелчок. Пусто.", nextDialog: "Везение. Вакцина твоя.", finalMessage: "Помни — так ты не сломаешься снова." },
        crazy_luck: { dialog: "Щелчок. Пусто.", nextDialog: "Пусто? При таком количестве патронов? Вакцина твоя.", finalMessage: "Я жив..." },
        death: { dialog: "БАМ!", nextDialog: "Выстрел. Инженер мёртв. Вакцина уничтожена.", finalMessage: "Бункер 200 работает. Но здесь стало пусто." }
    };
    
    const end = endings[endingType];
    setDialog("🔷 ИИ-Ассистент", end.dialog, false);
    
    renderButtons([{label:"➡ ДАЛЕЕ", onClick:() => {
        setDialog("🔷 ИИ-Ассистент", end.nextDialog, false);
        renderButtons([{label:"➡ ДАЛЕЕ", onClick:() => {
            setDialog("🔷 ИИ-Ассистент", end.finalMessage, false);
            dom.gameWidget.innerHTML = `<div style="text-align:center; padding:2rem; color:${endingType === 'death' ? '#ff7788' : '#0ff'};">${endingType === 'death' ? '☠️ ИНЖЕНЕР МЁРТВ ☠️' : '✨ ИСЦЕЛЕНИЕ УСПЕШНО! ✨'}<br><span style="font-size:0.9rem; color:#aaa;">Бункер 200.</span></div>`;
            renderButtons([{label:"🔄 НОВАЯ ИГРА", onClick:()=> location.reload()}]);
        }}]);
    }}]);
}

// ========== ТЕСТОВАЯ ПАНЕЛЬ ==========
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

// ========== ЗАПУСК ==========
function init() {
    startPrologue();
}
init();