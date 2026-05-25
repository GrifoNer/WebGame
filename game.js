// Глобальное состояние игры
const GameState = {
    stage: "story",
    completedGames: [false, false, false, false, false],
    answersWrong: 0,
    gameAnswers: { guessNumber: null, ticTacToe: null, checkers: null, foolCard: null, blackjack: null },
    activeGame: null
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

function winMinigame(answerValue, gameIdx) {
    if (GameState.completedGames[gameIdx]) return;
    GameState.completedGames[gameIdx] = true;
    
    const keys = ['guessNumber', 'ticTacToe', 'checkers', 'foolCard', 'blackjack'];
    GameState.gameAnswers[keys[gameIdx]] = answerValue;
    
    const done = GameState.completedGames.filter(v=>v).length;
    setDialog("🔷 ИИ-Ассистент", `✅ ПОЛОМКА УСТРАНЕНА! Осталось ошибок: ${5-done}.`);
    
    if (done === 5) {
        setDialog("🔷 ИИ-Ассистент", "Все 5 ошибок исправлены. Но я должен сообщить правду...");
        renderButtons([{label:"▶ ПРИНЯТЬ ПРАВДУ", onClick:()=> revealTwist()}]);
    } else {
        renderButtons([{label:"➡ СЛЕДУЮЩАЯ ОШИБКА", onClick:()=> continueStory()}]);
    }
    clearWidget();
    GameState.stage = "story";
}

function continueStory() {
    const completed = GameState.completedGames;
    const nextIdx = completed.findIndex(v => !v);
    if (nextIdx === -1) { revealTwist(); return; }
    
    const titles = ["⚛️ РЕАКТОР (Угадай число)", "🔌 ПИТАНИЕ (Крестики-нолики)", "🌀 ВЕНТИЛЯЦИЯ (Шашки)", "🧠 СБОЙ ИИ (Дурак)", "💨 ШЛЮЗ (21 очко)"];
    setBackground("https://images.unsplash.com/photo-1581092335871-4e6c7c1e6b1a?w=1100&auto=format");
    setDialog("🔷 ИИ-Ассистент", `Ошибка ${nextIdx+1}/5: ${titles[nextIdx]}. Начинаем исправление.`);
    renderButtons([{label:"🔧 НАЧАТЬ", onClick:()=> startMinigame(nextIdx)}]);
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

function revealTwist() {
    setBackground("https://images.unsplash.com/photo-1583324113626-70df0f4dea55?w=1100&auto=format");
    setDialog("🔷 ИИ-Ассистент", "Анализ завершён: все поломки совершены тобой во время приступов шизофрении. Но я синтезировал вакцину. Чтобы исцелиться — пройди русскую рулетку.");
    renderButtons([{label:"💊 ПРИНЯТЬ ИСПЫТАНИЕ", onClick:()=> startQuiz()}]);
}

let currentQ = 0;
let wrongAnswersCount = 0;

const quizData = [
    { question: "Какое число ты угадал при калибровке реактора?", gameKey: "guessNumber", type: "number" },
    { question: "Куда ты поставил последний победный крестик? (центр, угол и т.д.)", gameKey: "ticTacToe", type: "string" },
    { question: "Какую шашку ты срубил последней? ('простая' или 'дамка')", gameKey: "checkers", type: "string" },
    { question: "Какую карту ты сбросил в Дураке?", gameKey: "foolCard", type: "string" },
    { question: "Сколько очков набрал в 21?", gameKey: "blackjack", type: "number" }
];

function startQuiz() {
    currentQ = 0;
    wrongAnswersCount = 0;
    GameState.stage = "quiz";
    askQuestion();
}

function askQuestion() {
    if (currentQ >= quizData.length) {
        finishQuizAndRoulette();
        return;
    }
    const q = quizData[currentQ];
    dom.gameWidget.innerHTML = `<div class="game-status">🧠 ТЕСТ ПАМЯТИ | Вопрос ${currentQ+1}/5</div>
    <div style="background:#000000aa; border-radius: 30px; padding:1.5rem;">
        <p style="color:#b0f0ff; font-size:1.2rem">${q.question}</p>
        <div class="flex-row"><input type="text" id="quizAnswer" autocomplete="off" style="width:260px;" placeholder="твой ответ..."><button id="submitQuiz" class="success-btn">ОТВЕТИТЬ</button></div>
    </div>`;
    document.getElementById("submitQuiz").onclick = () => {
        let userVal = document.getElementById("quizAnswer").value.trim();
        if(userVal === "") return;
        const correctVal = GameState.gameAnswers[q.gameKey];
        let isCorrect = false;
        if(q.type === "number") isCorrect = (parseInt(userVal) === correctVal);
        else isCorrect = (userVal.toLowerCase() === correctVal.toString().toLowerCase());
        
        if(!isCorrect) {
            wrongAnswersCount++;
            setDialog("🔴 ИИ-Ассистент", `❌ Неверно! Правильно: ${correctVal}. +1 патрон.`);
        } else {
            setDialog("🟢 ИИ-Ассистент", "✅ Верно! Патронов не добавили.");
        }
        currentQ++;
        askQuestion();
    };
    renderButtons([]);
}

function finishQuizAndRoulette() {
    setDialog("🔷 ИИ-Ассистент", `Ошибок: ${wrongAnswersCount}. В барабане ${wrongAnswersCount} патронов. Нажми на курок.`);
    clearWidget();
    dom.gameWidget.innerHTML = `<div class="roulette-dramatic">🔫 РУССКАЯ РУЛЕТКА 🔫</div>
    <div class="game-status">⚡ Патроны: ${wrongAnswersCount} из 6</div>
    <div style="text-align:center; margin-top: 25px;"><button id="rouletteBtn" style="background:#a1222f; font-size:1.3rem; padding:12px 38px;">💥 ВЫСТРЕЛИТЬ 💥</button></div>`;
    
    document.getElementById("rouletteBtn").onclick = () => {
        let fired = false;
        if (wrongAnswersCount > 0) {
            let chamber = Math.floor(Math.random() * 6);
            if (chamber < wrongAnswersCount) fired = true;
        }
        if (!fired) {
            setDialog("🟢 ИИ-Ассистент", "Щелчок... ПУСТО! Вакцина введена. Шизофрения побеждена. Бункер 200 спасён.");
            dom.gameWidget.innerHTML = `<div style="text-align:center; padding:2rem; color:#0ff;">✨ ИСЦЕЛЕНИЕ УСПЕШНО! ✨</div>`;
            renderButtons([{label:"♻️ НОВАЯ ИГРА", onClick:()=> location.reload()}]);
        } else {
            setDialog("💀 ИИ-Ассистент", "БАМ! Выстрел... Инженер мёртв. Бункер 200 потерян.");
            dom.gameWidget.innerHTML = `<div style="text-align:center; padding:2rem; color:#ff7788;">☠️ ВЫ НЕ ВЫЖИЛИ ☠️</div>`;
            renderButtons([{label:"🔄 ПЕРЕЗАПУСК", onClick:()=> location.reload()}]);
        }
    };
    renderButtons([]);
}

// ========== СЕКРЕТНАЯ ПАНЕЛЬ ДЛЯ ТЕСТИРОВАНИЯ (Shift + T) ==========
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
    title.style.cssText = `
        text-align: center;
        font-size: 0.75rem;
        margin-bottom: 10px;
        border-bottom: 1px solid #0ff;
        padding-bottom: 5px;
    `;
    testPanelElement.appendChild(title);
    
    const levels = [
        { name: "⚛️ Угадай число", idx: 0, game: "guessNumber" },
        { name: "🔌 Крестики-нолики", idx: 1, game: "ticTacToe" },
        { name: "🌀 Шашки", idx: 2, game: "checkers" },
        { name: "🧠 Дурак", idx: 3, game: "foolCard" },
        { name: "💨 Блэкджек", idx: 4, game: "blackjack" },
        { name: "📖 Сюжет (начало)", idx: -1, game: "story" },
        { name: "🧪 Викторина (финал)", idx: -2, game: "quiz" },
        { name: "✨ Сбросить прогресс", idx: -3, game: "reset" }
    ];
    
    levels.forEach(level => {
        const btn = document.createElement("button");
        btn.innerText = level.name;
        btn.style.cssText = `
            background: #1f2a46;
            border: 1px solid cyan;
            border-radius: 20px;
            padding: 6px 12px;
            color: #bbf0ff;
            cursor: pointer;
            font-family: 'Orbitron', monospace;
            font-size: 0.7rem;
            transition: 0.1s;
        `;
        btn.onmouseenter = () => { btn.style.background = "#2f3f60"; btn.style.transform = "scale(0.98)"; };
        btn.onmouseleave = () => { btn.style.background = "#1f2a46"; btn.style.transform = "scale(1)"; };
        
        btn.onclick = () => {
            jumpToLevel(level.idx, level.game);
            toggleTestPanel();
        };
        testPanelElement.appendChild(btn);
    });
    
    document.body.appendChild(testPanelElement);
}

function toggleTestPanel() {
    if(!testPanelElement) {
        createTestPanel();
    }
    if(testPanelVisible) {
        testPanelElement.style.display = "none";
        testPanelVisible = false;
    } else {
        testPanelElement.style.display = "flex";
        testPanelVisible = true;
    }
}

function jumpToLevel(levelIdx, gameType) {
    if(gameType === "story") {
        GameState.stage = "story";
        GameState.completedGames = [false, false, false, false, false];
        GameState.answersWrong = 0;
        GameState.gameAnswers = { guessNumber: null, ticTacToe: null, checkers: null, foolCard: null, blackjack: null };
        GameState.activeGame = null;
        setDialog("🔷 ИИ-Ассистент", "КРИТИЧЕСКИЙ СБОЙ! 5 ошибок в бункере 200. Ты — инженер. Исправляй поломки через мини-игры.");
        renderButtons([{label:"🚀 НАЧАТЬ РЕМОНТ", onClick:()=> continueStory()}]);
        setBackground("https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=1100&auto=format");
        clearWidget();
    } 
    else if(gameType === "quiz") {
        if(!GameState.gameAnswers.guessNumber) GameState.gameAnswers.guessNumber = 42;
        if(!GameState.gameAnswers.ticTacToe) GameState.gameAnswers.ticTacToe = "центр";
        if(!GameState.gameAnswers.checkers) GameState.gameAnswers.checkers = "простая шашка";
        if(!GameState.gameAnswers.foolCard) GameState.gameAnswers.foolCard = "♠ Туз";
        if(!GameState.gameAnswers.blackjack) GameState.gameAnswers.blackjack = 21;
        startQuiz();
    }
    else if(gameType === "reset") {
        location.reload();
    }
    else if(levelIdx >= 0 && levelIdx <= 4) {
        GameState.stage = "playing_minigame";
        GameState.activeGame = levelIdx;
        GameState.completedGames[levelIdx] = false;
        
        const keys = ['guessNumber', 'ticTacToe', 'checkers', 'foolCard', 'blackjack'];
        GameState.gameAnswers[keys[levelIdx]] = null;
        
        setDialog("🔷 ИИ-Ассистент", `🔧 ТЕСТ: Запуск ${levelIdx+1}/5`);
        
        if (levelIdx === 0) initGuessNumber();
        else if (levelIdx === 1) initTicTacToe();
        else if (levelIdx === 2) initCheckers();
        else if (levelIdx === 3) initFool();
        else if (levelIdx === 4) initBlackjack();
        
        renderButtons([]);
    }
}

// Обработчик нажатия клавиш
document.addEventListener("keydown", function(event) {
    if(event.shiftKey && (event.key === 'T' || event.key === 't')) {
        event.preventDefault();
        toggleTestPanel();
    }
});

function init() {
    setDialog("🔷 ИИ-Ассистент", "КРИТИЧЕСКИЙ СБОЙ! 5 ошибок в бункере 200. Ты — инженер. Исправляй поломки через мини-игры.");
    renderButtons([{label:"🚀 НАЧАТЬ РЕМОНТ", onClick:()=> continueStory()}]);
}
init();