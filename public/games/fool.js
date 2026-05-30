function initFool() {
    // Колода 36 карт (6,7,8,9,10,В,Д,К,Т)
    const suits = ['♠', '♣', '♥', '♦'];
    const values = ['6', '7', '8', '9', '10', 'В', 'Д', 'К', 'Т'];
    const valueOrder = {'6':0, '7':1, '8':2, '9':3, '10':4, 'В':5, 'Д':6, 'К':7, 'Т':8};
    
    let deck = [];
    let trumpSuit = null;
    let trumpCard = null;
    
    let playerHand = [];
    let computerHand = [];
    
    let attackCards = [];      // Карты, которые сейчас атакуют
    let defenseCards = [];     // Карты, которыми отбиваются (в паре с атакой)
    let currentAttacker = 'player'; // Кто атакует в текущем раунде ('player' или 'computer')
    let roundActive = false;    // Идет ли текущий раунд (есть атака)
    let gameActive = true;
    
    let lastPlayedCardValue = null;   // Для викторины (только номинал!)
    
    // Функция создания и перемешивания колоды
    function createDeck() {
        let newDeck = [];
        for(let suit of suits) {
            for(let val of values) {
                newDeck.push({ suit, value: val, full: `${suit}${val}` });
            }
        }
        for(let i = newDeck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
        }
        return newDeck;
    }
    
    function setTrump(deckArr) {
        trumpCard = deckArr[deckArr.length - 1];
        trumpSuit = trumpCard.suit;
    }
    
    function sortPlayerHand(hand) {
        const suitWeight = (suit) => {
            if(suit === '♠') return 0;
            if(suit === '♣') return 1;
            if(suit === '♥') return 2;
            if(suit === '♦') return 3;
            return 4;
        };
        
        const isTrump = (card) => card.suit === trumpSuit;
        
        return hand.sort((a, b) => {
            const aIsTrump = isTrump(a);
            const bIsTrump = isTrump(b);
            
            if(aIsTrump && !bIsTrump) return 1;
            if(!aIsTrump && bIsTrump) return -1;
            
            const suitCompare = suitWeight(a.suit) - suitWeight(b.suit);
            if(suitCompare !== 0) return suitCompare;
            
            return valueOrder[a.value] - valueOrder[b.value];
        });
    }
    
    function getCardWeight(card) {
        return valueOrder[card.value];
    }
    
    function canBeat(attackCard, defenseCard) {
        if(defenseCard.suit !== attackCard.suit && defenseCard.suit !== trumpSuit) return false;
        if(defenseCard.suit === attackCard.suit) {
            return getCardWeight(defenseCard) > getCardWeight(attackCard);
        }
        if(defenseCard.suit === trumpSuit && attackCard.suit !== trumpSuit) return true;
        return false;
    }
    
    function drawCards(hand, count) {
        for(let i = 0; i < count && deck.length > 0; i++) {
            hand.push(deck.shift());
        }
        if(hand === playerHand) {
            sortPlayerHand(playerHand);
        }
    }
    
    function dealCards() {
        for(let i = 0; i < 6; i++) {
            if(deck.length > 0) playerHand.push(deck.shift());
            if(deck.length > 0) computerHand.push(deck.shift());
        }
        sortPlayerHand(playerHand);
    }
    
    function clearTable() {
        attackCards = [];
        defenseCards = [];
        roundActive = false;
    }
    
    function finishRound() {
        clearTable();
        
        drawCards(playerHand, 6 - playerHand.length);
        drawCards(computerHand, 6 - computerHand.length);
        
        const gameEnded = checkGameOver();
        
        if(!gameEnded && gameActive) {
            currentAttacker = (currentAttacker === 'player') ? 'computer' : 'player';
            renderGame();
            
            if(currentAttacker === 'computer' && computerHand.length > 0 && gameActive) {
                setTimeout(() => computerTurn(), 500);
            }
        } else {
            renderGame();
        }
    }
    
    function playerTakeCards() {
        if(!gameActive) return;
        if(!roundActive) return;
        if(currentAttacker === 'player') return;
        if(attackCards.length === 0) return;
        
        playerHand.push(...attackCards);
        playerHand.push(...defenseCards);
        clearTable();
        sortPlayerHand(playerHand);
        
        drawCards(playerHand, 6 - playerHand.length);
        drawCards(computerHand, 6 - computerHand.length);
        
        const gameEnded = checkGameOver();
        
        if(!gameEnded && gameActive) {
            renderGame();
            
            if(currentAttacker === 'computer' && computerHand.length > 0) {
                setTimeout(() => computerTurn(), 500);
            } else if(currentAttacker === 'player') {
                renderGame();
            }
        } else {
            renderGame();
        }
    }
    
    function playerFinishDefense() {
        if(!gameActive) return;
        if(!roundActive) return;
        if(currentAttacker !== 'player') return;
        if(attackCards.length !== defenseCards.length) return;
        if(attackCards.length === 0) return;
        
        finishRound();
    }
    
    function computerFinishDefense() {
        if(!gameActive) return;
        if(!roundActive) return;
        if(currentAttacker !== 'computer') return;
        if(attackCards.length !== defenseCards.length) return;
        if(attackCards.length === 0) return;
        
        finishRound();
    }
    
    function checkGameOver() {
        const playerHasCards = playerHand.length > 0;
        const computerHasCards = computerHand.length > 0;
        const deckEmpty = deck.length === 0;
        
        if(!playerHasCards && (!computerHasCards || deckEmpty)) {
            gameActive = false;
            winMinigame(lastPlayedCardValue || "Т", 3);
            return true;
        }
        
        if(!computerHasCards && deckEmpty) {
            gameActive = false;
            winMinigame(lastPlayedCardValue || "Т", 3);
            return true;
        }
        
        return false;
    }
    
    function computerTurn() {
        if(!gameActive) return;
        
        if(roundActive && currentAttacker === 'player' && attackCards.length > defenseCards.length) {
            computerDefense();
            return;
        }
        
        if(!roundActive && currentAttacker === 'computer') {
            computerAttack();
            return;
        }
        
        if(roundActive && currentAttacker === 'computer' && attackCards.length === defenseCards.length && attackCards.length > 0) {
            computerAddCard();
            return;
        }
        
        if(roundActive && currentAttacker === 'computer' && attackCards.length === defenseCards.length && attackCards.length > 0) {
            const allValues = [...attackCards, ...defenseCards].map(c => c.value);
            const canAdd = computerHand.some(card => allValues.includes(card.value));
            if(!canAdd) {
                computerFinishDefense();
            }
            return;
        }
    }
    
    function computerAttack() {
        if(computerHand.length === 0) return;
        
        let bestCard = computerHand[0];
        for(let card of computerHand) {
            if(getCardWeight(card.value) < getCardWeight(bestCard.value)) {
                bestCard = card;
            }
        }
        
        attackCards = [bestCard];
        const index = computerHand.indexOf(bestCard);
        computerHand.splice(index, 1);
        roundActive = true;
        lastPlayedCardValue = bestCard.value;
        
        renderGame();
    }
    
    function computerAddCard() {
        if(computerHand.length === 0) {
            computerFinishDefense();
            return;
        }
        
        const allValues = [...attackCards, ...defenseCards].map(c => c.value);
        const addableCards = computerHand.filter(card => allValues.includes(card.value));
        
        if(addableCards.length > 0) {
            let cardToAdd = addableCards[0];
            for(let card of addableCards) {
                if(getCardWeight(card.value) < getCardWeight(cardToAdd.value)) {
                    cardToAdd = card;
                }
            }
            attackCards.push(cardToAdd);
            const index = computerHand.indexOf(cardToAdd);
            computerHand.splice(index, 1);
            lastPlayedCardValue = cardToAdd.value;
            renderGame();
        } else {
            computerFinishDefense();
        }
    }
    
    function computerDefense() {
        const currentAttackCard = attackCards[defenseCards.length];
        
        let beatCard = null;
        for(let card of computerHand) {
            if(canBeat(currentAttackCard, card)) {
                if(beatCard === null) beatCard = card;
                else if(getCardWeight(card.value) < getCardWeight(beatCard.value)) beatCard = card;
            }
        }
        
        if(beatCard) {
            defenseCards.push(beatCard);
            const index = computerHand.indexOf(beatCard);
            computerHand.splice(index, 1);
            lastPlayedCardValue = beatCard.value;
            renderGame();
            
            if(attackCards.length === defenseCards.length) {
                setTimeout(() => computerTurn(), 300);
            }
        } else {
            computerHand.push(...attackCards);
            computerHand.push(...defenseCards);
            clearTable();
            
            drawCards(playerHand, 6 - playerHand.length);
            drawCards(computerHand, 6 - computerHand.length);
            
            const gameEnded = checkGameOver();
            
            if(!gameEnded && gameActive) {
                renderGame();
                
                if(currentAttacker === 'computer' && computerHand.length > 0) {
                    setTimeout(() => computerTurn(), 500);
                }
            } else {
                renderGame();
            }
        }
    }
    
    function playerAction(cardIndex) {
        if(!gameActive) return;
        
        const card = playerHand[cardIndex];
        if(!card) return;
        
        if((!roundActive && currentAttacker === 'player') || 
           (roundActive && currentAttacker === 'player' && attackCards.length === defenseCards.length && attackCards.length > 0)) {
            
            if(!roundActive) {
                attackCards = [card];
                playerHand.splice(cardIndex, 1);
                roundActive = true;
                currentAttacker = 'player';
                lastPlayedCardValue = card.value;
                sortPlayerHand(playerHand);
                renderGame();
                setTimeout(() => computerTurn(), 300);
                return;
            }
            
            if(roundActive && attackCards.length === defenseCards.length) {
                const allValues = [...attackCards, ...defenseCards].map(c => c.value);
                if(allValues.includes(card.value)) {
                    attackCards.push(card);
                    playerHand.splice(cardIndex, 1);
                    lastPlayedCardValue = card.value;
                    sortPlayerHand(playerHand);
                    renderGame();
                    setTimeout(() => computerTurn(), 300);
                } else {
                    const msgDiv = document.getElementById("foolMsg");
                    if(msgDiv) msgDiv.innerHTML = "❌ Нельзя подкинуть эту карту!";
                    setTimeout(() => { if(msgDiv) msgDiv.innerHTML = ""; }, 1000);
                }
                return;
            }
        }
        
        if(roundActive && currentAttacker !== 'player' && attackCards.length > defenseCards.length) {
            const currentAttackCard = attackCards[defenseCards.length];
            
            if(canBeat(currentAttackCard, card)) {
                defenseCards.push(card);
                playerHand.splice(cardIndex, 1);
                lastPlayedCardValue = card.value;
                sortPlayerHand(playerHand);
                renderGame();
                
                if(attackCards.length === defenseCards.length) {
                    renderGame();
                } else {
                    setTimeout(() => computerTurn(), 300);
                }
            } else {
                const msgDiv = document.getElementById("foolMsg");
                if(msgDiv) msgDiv.innerHTML = "❌ Нельзя побить этой картой!";
                setTimeout(() => { if(msgDiv) msgDiv.innerHTML = ""; }, 1000);
            }
            return;
        }
    }
    
    function renderGame() {
        const remainingCards = deck.length;
        const trumpDisplay = trumpCard ? `${trumpCard.suit}${trumpCard.value}` : '?';
        
        let html = `<div class="game-status">🃏 ДУРАК | Козырь: ${trumpSuit} (${trumpDisplay}) | Колода: ${remainingCards} карт</div>`;
        
        html += `<div style="margin-bottom: 20px; background:#0a1020; border-radius: 15px; padding: 10px;">`;
        html += `<strong style="color:#ffffff;">🤖 Противник:</strong> <span style="color:#ffffff;">${computerHand.length} карт</span>`;
        if(computerHand.length > 0) html += ` <span style="color:#ffffff;">(${'? '.repeat(computerHand.length)})</span>`;
        html += `</div>`;
        
        html += `<div style="margin: 15px 0; min-height: 100px; background:#0a1020; border-radius: 20px; padding: 10px;">`;
        if(attackCards.length > 0) {
            html += `<div style="margin-bottom: 8px;"><span style="color:#ff8866;">⚔️ Атака:</span> <span style="color:#ffffff;">${attackCards.map(c => c.full).join(' · ')}</span></div>`;
        }
        if(defenseCards.length > 0) {
            html += `<div><span style="color:#66ff88;">🛡️ Защита:</span> <span style="color:#ffffff;">${defenseCards.map(c => c.full).join(' · ')}</span></div>`;
        }
        if(attackCards.length === 0) {
            html += `<div style="text-align:center; color:#888;">⚡ Начните раунд или дождитесь хода соперника</div>`;
        }
        html += `</div>`;
        
        html += `<div style="margin-top: 15px;"><strong style="color:#ffffff;">🎴 Твои карты (${playerHand.length}):</strong></div>`;
        html += `<div class="cards-area" style="margin-bottom: 15px; animation: none;">`;
        playerHand.forEach((card, idx) => {
            let cardClass = "card";
            if(card.suit === trumpSuit) cardClass += " trump-card";
            html += `<div class="${cardClass}" data-card-idx="${idx}" style="animation: none; transition: none;">${card.full}</div>`;
        });
        html += `</div>`;
        
        if(roundActive && currentAttacker !== 'player' && attackCards.length > defenseCards.length && gameActive) {
            html += `<div class="flex-row" style="margin-top: 10px;"><button id="takeBtn" class="danger-btn" style="background:#a1222f;">📥 ВЗЯТЬ КАРТЫ</button></div>`;
        }
        
        if(roundActive && attackCards.length === defenseCards.length && attackCards.length > 0 && gameActive) {
            if(currentAttacker === 'player') {
                html += `<div class="flex-row" style="margin-top: 10px;"><button id="finishDefenseBtn" class="success-btn">✅ БИТО (закончить ход)</button></div>`;
            } else {
                html += `<div class="flex-row" style="margin-top: 10px;"><button id="finishDefenseBtn" class="success-btn">✅ БИТО (закончить раунд)</button></div>`;
            }
        }
        
        html += `<div id="foolMsg" style="text-align:center; margin-top: 10px; color:#ffaa77;"></div>`;
        
        if(gameActive) {
            if(!roundActive && currentAttacker === 'player') {
                html += `<div style="text-align:center; margin-top:8px; font-size:0.8rem; color:#88ddff;">🎯 Ваш ход: нажмите на карту, чтобы атаковать</div>`;
            } else if(roundActive && currentAttacker === 'player' && attackCards.length === defenseCards.length) {
                html += `<div style="text-align:center; margin-top:8px; font-size:0.8rem; color:#88ddff;">📤 Подкиньте карту или нажмите "БИТО"</div>`;
            } else if(roundActive && currentAttacker !== 'player' && attackCards.length > defenseCards.length) {
                html += `<div style="text-align:center; margin-top:8px; font-size:0.8rem; color:#88ddff;">🛡️ Защититесь, возьмите карты или нажмите "БИТО" если отбились</div>`;
            } else if(roundActive && currentAttacker !== 'player' && attackCards.length === defenseCards.length) {
                html += `<div style="text-align:center; margin-top:8px; font-size:0.8rem; color:#88ddff;">⚡ Противник может подкинуть карту или нажать "БИТО"</div>`;
            }
        }
        
        dom.gameWidget.innerHTML = html;
        
        document.querySelectorAll('.card[data-card-idx]').forEach(cardDiv => {
            cardDiv.onclick = () => {
                if(!gameActive) return;
                const idx = parseInt(cardDiv.dataset.cardIdx);
                playerAction(idx);
            };
        });
        
        const takeBtn = document.getElementById("takeBtn");
        if(takeBtn) {
            takeBtn.onclick = () => {
                if(!gameActive) return;
                playerTakeCards();
            };
        }
        
        const finishBtn = document.getElementById("finishDefenseBtn");
        if(finishBtn) {
            finishBtn.onclick = () => {
                if(!gameActive) return;
                if(roundActive && attackCards.length === defenseCards.length && attackCards.length > 0) {
                    if(currentAttacker === 'player') {
                        playerFinishDefense();
                    } else {
                        computerFinishDefense();
                    }
                }
            };
        }
        document.querySelectorAll('.card[data-card-idx]').forEach(cardDiv => {
    cardDiv.onclick = () => {
        if(!gameActive) return;
        // Звук клика по карте
        if (typeof SoundManager !== 'undefined') {
            SoundManager.play('click', 0.15);
        }
        const idx = parseInt(cardDiv.dataset.cardIdx);
        playerAction(idx);
    };
});
    }
    
    function init() {
        deck = createDeck();
        setTrump(deck);
        playerHand = [];
        computerHand = [];
        attackCards = [];
        defenseCards = [];
        roundActive = false;
        gameActive = true;
        currentAttacker = 'player';
        lastPlayedCardValue = null;
        
        dealCards();
        sortPlayerHand(playerHand);
        
        renderGame();
        
        if(currentAttacker === 'computer' && gameActive) {
            setTimeout(() => computerTurn(), 500);
        }
    }
    
    init();
}