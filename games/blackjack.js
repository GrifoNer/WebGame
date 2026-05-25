function initBlackjack() {
    // Состояние игры
    let deck = [];
    let playerCards = [];
    let dealerCards = [];
    let gameActive = true;
    let canHit = true;
    let roundInProgress = false;
    
    // Счет побед
    let playerWins = 0;
    let dealerWins = 0;
    let roundsPlayed = 0;
    const WIN_GOAL = 5;
    
    // Для викторины
    let lastPlayerScore = 0;
    
    // Функция создания колоды (6 колод для насыщенности)
    function createDeck() {
        const suits = ['♠', '♥', '♦', '♣'];
        const values = ['2','3','4','5','6','7','8','9','10','В','Д','К','Т'];
        let newDeck = [];
        // Используем 6 колод для более интересной игры
        for(let set = 0; set < 6; set++) {
            for(let suit of suits) {
                for(let val of values) {
                    newDeck.push({ suit, value: val, full: `${suit}${val}` });
                }
            }
        }
        // Перемешивание
        for(let i = newDeck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
        }
        return newDeck;
    }
    
    function getCardValue(card) {
        if(card.value === 'В' || card.value === 'Д' || card.value === 'К') return 10;
        if(card.value === 'Т') return 11;
        return parseInt(card.value);
    }
    
    function calculateScore(cards) {
        let score = 0;
        let aces = 0;
        for(let card of cards) {
            let val = getCardValue(card);
            if(val === 11) aces++;
            score += val;
        }
        while(score > 21 && aces > 0) {
            score -= 10;
            aces--;
        }
        return score;
    }
    
    // Сброс раунда
    function resetRound() {
        if(deck.length < 20) {
            deck = createDeck();
        }
        playerCards = [];
        dealerCards = [];
        canHit = true;
        gameActive = true;
        roundInProgress = true;
        
        // Начальная раздача
        playerCards.push(deck.pop());
        dealerCards.push(deck.pop());
        playerCards.push(deck.pop());
        dealerCards.push(deck.pop());
        
        // Проверка на блэкджек у игрока
        if(calculateScore(playerCards) === 21) {
            canHit = false;
            finishRound();
        } else {
            renderGame();
        }
    }
    
    // Ход дилера (ИИ)
    function dealerTurn() {
        if(!roundInProgress) return;
        
        let dealerScore = calculateScore(dealerCards);
        let playerScore = calculateScore(playerCards);
        
        // Дилер берет карты пока не наберет 17 или больше
        while(dealerScore < 17 && roundInProgress) {
            dealerCards.push(deck.pop());
            dealerScore = calculateScore(dealerCards);
            renderGame();
        }
        
        finishRound();
    }
    
    // Завершение раунда и подсчет очков
    function finishRound() {
        if(!roundInProgress) return;
        roundInProgress = false;
        gameActive = false;
        
        let playerScore = calculateScore(playerCards);
        let dealerScore = calculateScore(dealerCards);
        let roundWinner = null;
        let message = "";
        
        // Определение победителя раунда
        if(playerScore > 21) {
            roundWinner = 'dealer';
            message = "❌ ПЕРЕБОР! Вы проиграли раунд.";
        } else if(dealerScore > 21) {
            roundWinner = 'player';
            message = "✅ Дилер перебрал! Вы выиграли раунд!";
            lastPlayerScore = playerScore;
        } else if(playerScore === dealerScore) {
            roundWinner = 'tie';
            message = "🤝 НИЧЬЯ! Раунд переигрывается.";
        } else if(playerScore > dealerScore) {
            roundWinner = 'player';
            message = "✅ ПОБЕДА! Вы выиграли раунд!";
            lastPlayerScore = playerScore;
        } else {
            roundWinner = 'dealer';
            message = "❌ Дилер выиграл раунд.";
        }
        
        // Обновление счета
        if(roundWinner === 'player') {
            playerWins++;
        } else if(roundWinner === 'dealer') {
            dealerWins++;
        }
        
        roundsPlayed++;
        
        // Проверка на общую победу
        if(playerWins >= WIN_GOAL) {
            gameActive = false;
            roundInProgress = false;
            winMinigame(lastPlayerScore || 21, 4);
            renderGame();
            return;
        }
        
        if(dealerWins >= WIN_GOAL) {
            gameActive = false;
            roundInProgress = false;
            renderGame();
            setTimeout(() => {
                document.getElementById("bjMsg").innerHTML = "💀 ДИЛЕР ПОБЕДИЛ В ИГРЕ! Перезапуск...";
                setTimeout(() => initBlackjack(), 2000);
            }, 100);
            return;
        }
        
        renderGame();
        
        // Автоматический запуск следующего раунда через 2 секунды
        if(playerWins < WIN_GOAL && dealerWins < WIN_GOAL) {
            setTimeout(() => {
                resetRound();
            }, 2000);
        }
    }
    
    // Игрок берет карту
    function playerHit() {
        if(!roundInProgress || !canHit) return;
        
        playerCards.push(deck.pop());
        let score = calculateScore(playerCards);
        renderGame();
        
        if(score > 21) {
            canHit = false;
            finishRound();
        } else if(score === 21) {
            canHit = false;
            finishRound();
        }
    }
    
    // Игрок останавливается
    function playerStand() {
        if(!roundInProgress || !canHit) return;
        canHit = false;
        renderGame();
        setTimeout(() => dealerTurn(), 500);
    }
    
    // Получение цвета карты
    function getCardColor(suit) {
        if(suit === '♥' || suit === '♦') return '#ff8888';
        return '#ffffff';
    }
    
    // Отрисовка игры
    function renderGame() {
        const playerScore = calculateScore(playerCards);
        const dealerScore = calculateScore(dealerCards);
        const gameWinner = (playerWins >= WIN_GOAL) ? 'player' : (dealerWins >= WIN_GOAL) ? 'dealer' : null;
        
        let html = `<div class="game-status">🎰 БЛЭКДЖЕК | Счет: Игрок ${playerWins} : ${dealerWins} Дилер | До ${WIN_GOAL} побед</div>`;
        
        // Карты дилера
        html += `<div style="margin-bottom: 20px; background:#0a1020; border-radius: 15px; padding: 15px;">`;
        html += `<strong style="color:#ffffff;">🤖 ДИЛЕР</strong><br>`;
        html += `<div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 10px;">`;
        
        if(roundInProgress && canHit) {
            // Показываем только первую карту дилера
            if(dealerCards.length > 0) {
                const card = dealerCards[0];
                html += `<div style="background: linear-gradient(145deg, #191e30, #0b0f1c); border: 1px solid gold; border-radius: 12px; padding: 12px 18px; font-size: 1.3rem; color: ${getCardColor(card.suit)};">${card.full}</div>`;
                html += `<div style="background: linear-gradient(145deg, #2a1a3a, #1a0a2a); border: 1px solid #888; border-radius: 12px; padding: 12px 18px; font-size: 1.3rem; color: #aaa;">🃟?</div>`;
            }
        } else {
            dealerCards.forEach((card, idx) => {
                html += `<div style="background: linear-gradient(145deg, #191e30, #0b0f1c); border: 1px solid gold; border-radius: 12px; padding: 12px 18px; font-size: 1.3rem; color: ${getCardColor(card.suit)};">${card.full}</div>`;
            });
        }
        
        if(!roundInProgress && dealerCards.length > 0) {
            html += `<div style="margin-top: 10px;"><span style="color:#88ff88;">Очки: ${dealerScore}</span></div>`;
        }
        html += `</div></div>`;
        
        // Карты игрока
        html += `<div style="margin-bottom: 20px; background:#0a1020; border-radius: 15px; padding: 15px;">`;
        html += `<strong style="color:#ffffff;">🎴 ВАШИ КАРТЫ (${playerScore} очков)</strong><br>`;
        html += `<div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 10px;">`;
        playerCards.forEach((card, idx) => {
            html += `<div class="bj-card" data-card-idx="${idx}" style="background: linear-gradient(145deg, #191e30, #0b0f1c); border: 1px solid gold; border-radius: 12px; padding: 12px 18px; font-size: 1.3rem; color: ${getCardColor(card.suit)};">${card.full}</div>`;
        });
        html += `</div></div>`;
        
        // Кнопки действий (только если раунд активен)
        if(roundInProgress && canHit && !gameWinner) {
            html += `<div class="flex-row" style="gap: 15px; margin-top: 10px;">`;
            html += `<button id="hitBtn" class="success-btn" style="background:#0f4a3a;">📤 ВЗЯТЬ КАРТУ</button>`;
            html += `<button id="standBtn" class="danger-btn" style="background:#4a1025;">✋ ОСТАНОВИТЬСЯ</button>`;
            html += `</div>`;
        }
        
        // Сообщение о результате раунда
        if(!roundInProgress && !gameWinner && playerWins < WIN_GOAL && dealerWins < WIN_GOAL) {
            html += `<div style="text-align:center; margin-top: 15px; color:#ffaa77;">⏳ Следующий раунд через 2 секунды...</div>`;
        }
        
        // Сообщение о победе в игре
        if(gameWinner === 'player') {
            html += `<div style="text-align:center; margin-top: 20px; padding: 20px; background:#0a3a2a; border-radius: 20px;">`;
            html += `<div style="font-size: 1.5rem; color:#88ff88;">🏆 ПОБЕДА! 🏆</div>`;
            html += `<div style="margin-top: 10px;">Вы первым достигли ${WIN_GOAL} побед! Шлюз стабилизирован.</div>`;
            html += `</div>`;
        } else if(gameWinner === 'dealer') {
            html += `<div style="text-align:center; margin-top: 20px; padding: 20px; background:#3a0a1a; border-radius: 20px;">`;
            html += `<div style="font-size: 1.5rem; color:#ff8888;">💀 ПОРАЖЕНИЕ 💀</div>`;
            html += `<div style="margin-top: 10px;">Дилер первым достиг ${WIN_GOAL} побед. Перезапуск...</div>`;
            html += `</div>`;
        }
        
        html += `<div id="bjMsg" style="text-align:center; margin-top: 15px; color:#ffaa77;"></div>`;
        
        dom.gameWidget.innerHTML = html;
        
        // Навешиваем обработчики
        const hitBtn = document.getElementById("hitBtn");
        if(hitBtn) {
            hitBtn.onclick = () => playerHit();
        }
        
        const standBtn = document.getElementById("standBtn");
        if(standBtn) {
            standBtn.onclick = () => playerStand();
        }
    }
    
    // Инициализация игры
    deck = createDeck();
    playerWins = 0;
    dealerWins = 0;
    roundsPlayed = 0;
    resetRound();
}