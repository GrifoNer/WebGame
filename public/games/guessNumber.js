function initGuessNumber() {
    const secret = Math.floor(Math.random() * 100) + 1;
    let attemptsLeft = 8;
    
    dom.gameWidget.innerHTML = `
        <div class="game-status">🎯 УГАДАЙ ЧИСЛО (1-100) | Попыток: ${attemptsLeft}</div>
        <div class="flex-row"><input type="number" id="guessInput" placeholder="число"><button id="guessBtn" class="success-btn">ПРОВЕРИТЬ</button></div>
        <div id="hintMsg" style="margin-top:20px; text-align:center; color:#aaf0ff;"></div>
    `;
    
    const updateStatus = () => { dom.gameStatus.innerText = `🎲 Попыток: ${attemptsLeft}`; };
    updateStatus();
    
    document.getElementById("guessBtn").onclick = () => {
        let val = parseInt(document.getElementById("guessInput").value);
        const hintDiv = document.getElementById("hintMsg");
        if (isNaN(val)) { hintDiv.innerHTML = "Введи число!"; return; }
        if (attemptsLeft <= 0) {
            hintDiv.innerHTML = "Попытки кончились! Перезапуск...";
            setTimeout(()=> initGuessNumber(), 1200);
            return;
        }
        attemptsLeft--;
        updateStatus();
        
        if (val === secret) {
            hintDiv.innerHTML = "✅ ТОЧНО! Калибровка завершена!";
            winMinigame(secret, 0);
        } else {
            let diff = Math.abs(val - secret);
            let hint = diff <= 3 ? "🔥 Очень горячо!" : diff <= 10 ? "🌡️ Тепло" : diff <= 25 ? "❄️ Холодно" : "🥶 Ледяной ветер";
            let direction = val < secret ? "БОЛЬШЕ" : "МЕНЬШЕ";
            hintDiv.innerHTML = `❌ Неверно. Нужно ${direction}. ${hint} Осталось: ${attemptsLeft}`;
            if (attemptsLeft === 0) setTimeout(()=> initGuessNumber(), 1500);
        }
        document.getElementById("guessInput").value = "";
    };
    renderButtons([]);
}