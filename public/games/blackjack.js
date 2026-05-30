function initBlackjack() {
    let deck = [];
    let playerCards = [];
    let dealerCards = [];
    let gameActive = true;
    let canHit = true;
    let roundInProgress = false;
    
    let playerWins = 0;
    let dealerWins = 0;
    const WIN_GOAL = 5;
    let lastPlayerScore = 21;
    
    function createDeck() {
        const suits = ['♠', '♥', '♦', '♣'];
        const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'В', 'Д', 'К', 'Т'];
        let newDeck = [];
        for(let set = 0; set < 6; set++) {
            for(let suit of suits) {
                for(let val of values) {
                    newDeck.push({ suit, value: val, full: `${suit}${val}` });
                }
            }
        }
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
    
    function resetRound() {
        if(deck.length < 20) {
            deck = createDeck();
        }
        playerCards = [];
        dealerCards = [];
        canHit = true;
        gameActive = true;
        roundInProgress = true;
        
        playerCards.push(deck.pop());
        dealerCards.push(deck.pop());
        playerCards.push(deck.pop());
        dealerCards.push(deck.pop());
        
        const playerScore = calculateScore(playerCards);
        if(playerScore === 21) {
            canHit = false;
            finishRound();
        } else {
            renderGame();
        }
    }
    
    function dealerTurn() {
        if(!roundInProgress) return;
        
        let dealerScore = calculateScore(dealerCards);
        
        while(dealerScore < 17 && roundInProgress) {
            dealerCards.push(deck.pop());
            dealerScore = calculateScore(dealerCards);
            renderGame();
        }
        
        finishRound();
    }
    
    function finishRound() {
        if(!roundInProgress) return;
        roundInProgress = false;
        gameActive = false;
        
        let playerScore = calculateScore(playerCards);
        let dealerScore = calculateScore(dealerCards);
        let roundWinner = null;
        
        if(playerScore > 21) {
            roundWinner = 'dealer';
        } else if(dealerScore > 21) {
            roundWinner = 'player';
            lastPlayerScore = playerScore;
        } else if(playerScore === dealerScore) {
            roundWinner = 'tie';
        } else if(playerScore > dealerScore) {
            roundWinner = 'player';
            lastPlayerScore = playerScore;
        } else {
            roundWinner = 'dealer';
        }
        
        if(roundWinner === 'player') {
            playerWins++;
        } else if(roundWinner === 'dealer') {
            dealerWins++;
        }
        
        if(playerWins >= WIN_GOAL) {
            gameActive = false;
            roundInProgress = false;
            winMinigame(lastPlayerScore, 4);
            renderGame();
            return;
        }
        
        if(dealerWins >= WIN_GOAL) {
            gameActive = false;
            roundInProgress = false;
            renderGame();
            setTimeout(() => {
                const msgDiv = document.getElementById("bjMsg");
                if(msgDiv) msgDiv.innerHTML = "💀 ДИЛЕР ПОБЕДИЛ! Перезапуск...";
                setTimeout(() => initBlackjack(), 2000);
            }, 100);
            return;
        }
        
        renderGame();
        
        if(playerWins < WIN_GOAL && dealerWins < WIN_GOAL) {
            setTimeout(() => {
                resetRound();
            }, 2000);
        }
    }
    
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
    
    function playerStand() {
        if(!roundInProgress || !canHit) return;
        canHit = false;
        renderGame();
        setTimeout(() => dealerTurn(), 500);
    }
    
    function getCardColor(suit) {
        if(suit === '♥' || suit === '♦') return '#ff8888';
        return '#ffffff';
    }
    
    function renderGame() {
        const playerScore = calculateScore(playerCards);
        const dealerScore = calculateScore(dealerCards);
        const gameWinner = (playerWins >= WIN_GOAL) ? 'player' : (dealerWins >= WIN_GOAL) ? 'dealer' : null;
        
        let html = `<div class="game-status">🎰 БЛЭКДЖЕК | Счет: ${playerWins} : ${dealerWins} | До ${WIN_GOAL} побед</div>`;
        
        // Карты дилера
        html += `<div style="margin-bottom: 20px; background:#0a1020; border-radius: 15px; padding: 15px;">`;
        html += `<strong style="color:#ffffff;">🤖 ДИЛЕР</strong><br>`;
        html += `<div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 10px;">`;
        
        if(roundInProgress && canHit) {
            if(dealerCards.length > 0) {
                const card = dealerCards[0];
                html += `<div class="bj-card" style="background: linear-gradient(145deg, #191e30, #0b0f1c); border: 1px solid gold; border-radius: 12px; padding: 12px 18px; font-size: 1.3rem; color: ${getCardColor(card.suit)};">${card.full}</div>`;
                html += `<div class="bj-card" style="background: linear-gradient(145deg, #2a1a3a, #1a0a2a); border: 1px solid #888; border-radius: 12px; padding: 12px 18px; font-size: 1.3rem; color: #aaa;">🃟?</div>`;
            }
        } else {
            dealerCards.forEach((card) => {
                html += `<div class="bj-card" style="background: linear-gradient(145deg, #191e30, #0b0f1c); border: 1px solid gold; border-radius: 12px; padding: 12px 18px; font-size: 1.3rem; color: ${getCardColor(card.suit)};">${card.full}</div>`;
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
        playerCards.forEach((card) => {
            html += `<div class="bj-card" style="background: linear-gradient(145deg, #191e30, #0b0f1c); border: 1px solid gold; border-radius: 12px; padding: 12px 18px; font-size: 1.3rem; color: ${getCardColor(card.suit)};">${card.full}</div>`;
        });
        html += `</div></div>`;
        
        // Кнопки действий
        if(roundInProgress && canHit && !gameWinner) {
            html += `<div class="flex-row" style="gap: 15px; margin-top: 10px;">`;
            html += `<button id="hitBtn" class="success-btn">📤 ВЗЯТЬ КАРТУ</button>`;
            html += `<button id="standBtn" class="danger-btn">✋ ОСТАНОВИТЬСЯ</button>`;
            html += `</div>`;
        }
        
        if(!roundInProgress && !gameWinner && playerWins < WIN_GOAL && dealerWins < WIN_GOAL) {
            html += `<div style="text-align:center; margin-top: 15px; color:#ffaa77;">⏳ Следующий раунд...</div>`;
        }
        
        if(gameWinner === 'player') {
            html += `<div style="text-align:center; margin-top: 20px; padding: 20px; background:#0a3a2a; border-radius: 20px;">`;
            html += `<div style="font-size: 1.5rem; color:#88ff88;">🏆 ПОБЕДА! 🏆</div>`;
            html += `</div>`;
        } else if(gameWinner === 'dealer') {
            html += `<div style="text-align:center; margin-top: 20px; padding: 20px; background:#3a0a1a; border-radius: 20px;">`;
            html += `<div style="font-size: 1.5rem; color:#ff8888;">💀 ПОРАЖЕНИЕ 💀</div>`;
            html += `</div>`;
        }
        
        html += `<div id="bjMsg" style="text-align:center; margin-top: 15px; color:#ffaa77;"></div>`;
        
        dom.gameWidget.innerHTML = html;
        
        const hitBtn = document.getElementById("hitBtn");
        if(hitBtn) {
            hitBtn.onclick = () => {
                if (typeof SoundManager !== 'undefined') SoundManager.play('click', 0.2);
                playerHit();
            };
        }
        
        const standBtn = document.getElementById("standBtn");
        if(standBtn) {
            standBtn.onclick = () => {
                if (typeof SoundManager !== 'undefined') SoundManager.play('click', 0.2);
                playerStand();
            };
        }
    }
    
    // Инициализация
    deck = createDeck();
    playerWins = 0;
    dealerWins = 0;
    resetRound();
}