function initBlackjack() {
    let deck = [];
    let playerCards = [];
    let dealerCards = [];
    let gameActive = true;
    let canHit = true;
    
    function createDeck() {
        const suits = ['♠', '♥', '♦', '♣'];
        const values = ['2','3','4','5','6','7','8','9','10','В','Д','К','Т'];
        let newDeck = [];
        for(let suit of suits) {
            for(let val of values) {
                newDeck.push({ suit, value: val });
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
    
    function renderGame() {
        let playerScore = calculateScore(playerCards);
        let html = `<div class="game-status">🎴 БЛЭКДЖЕК (21)</div>`;
        html += `<div style="background:#0a1020; border-radius: 20px; padding: 15px; margin-bottom: 15px;">`;
        html += `<strong>Дилер:</strong> ${dealerCards.length > 0 ? dealerCards[0].suit+dealerCards[0].value + ' ?' : ''}<br>`;
        html += `</div>`;
        html += `<div style="margin-bottom: 20px;"><strong>Твои карты (${playerScore} очков):</strong><br>`;
        html += playerCards.map(c => `${c.suit}${c.value}`).join(' · ');
        html += `</div>`;
        
        if(gameActive && canHit) {
            html += `<div class="flex-row"><button id="hitBtn" class="success-btn">📤 ВЗЯТЬ КАРТУ</button>`;
            html += `<button id="standBtn" class="danger-btn">✋ ОСТАНОВИТЬСЯ</button></div>`;
        }
        
        dom.gameWidget.innerHTML = html;
        
        if(gameActive && canHit) {
            document.getElementById("hitBtn").onclick = () => {
                if(!canHit) return;
                playerCards.push(deck.pop());
                let score = calculateScore(playerCards);
                if(score > 21) {
                    document.getElementById("hitBtn").disabled = true;
                    canHit = false;
                    document.getElementById("gameStatus").innerHTML = "❌ ПЕРЕБОР! Проигрыш...";
                    setTimeout(()=> initBlackjack(), 1500);
                } else if(score === 21) {
                    canHit = false;
                    finishGame();
                }
                renderGame();
            };
            document.getElementById("standBtn").onclick = () => {
                canHit = false;
                finishGame();
            };
        }
    }
    
    function finishGame() {
        gameActive = false;
        let playerScore = calculateScore(playerCards);
        while(calculateScore(dealerCards) < 17 && dealerCards.length < 5) {
            dealerCards.push(deck.pop());
        }
        let dealerScore = calculateScore(dealerCards);
        
        let html = `<div class="game-status">🎴 РЕЗУЛЬТАТ</div>`;
        html += `<div>Дилер: ${dealerCards.map(c => `${c.suit}${c.value}`).join(' · ')} (${dealerScore} очков)</div>`;
        html += `<div>Ты: ${playerScore} очков</div>`;
        
        if(playerScore > 21) html += `<div>❌ Ты проиграл! Перезапуск...</div>`;
        else if(dealerScore > 21 || playerScore > dealerScore) {
            html += `<div>✅ Ты выиграл! Шлюз стабилизирован.</div>`;
            dom.gameWidget.innerHTML = html;
            winMinigame(21, 4);
            return;
        } else if(playerScore === dealerScore) {
            html += `<div>🤝 Ничья, играем заново...</div>`;
            setTimeout(()=> initBlackjack(), 1200);
            return;
        } else {
            html += `<div>❌ Дилер выиграл! Перезапуск...</div>`;
        }
        
        dom.gameWidget.innerHTML = html;
        setTimeout(()=> {
            if(playerScore > 21 || (dealerScore <= 21 && dealerScore > playerScore)) initBlackjack();
        }, 2000);
    }
    
    deck = createDeck();
    playerCards = [deck.pop(), deck.pop()];
    dealerCards = [deck.pop()];
    canHit = true;
    gameActive = true;
    
    let initialScore = calculateScore(playerCards);
    if(initialScore === 21) {
        canHit = false;
        finishGame();
    } else {
        renderGame();
    }
}