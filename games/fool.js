function initFool() {
    const suits = ['♠', '♥', '♦', '♣'];
    const values = ['6', '7', '8', '9', '10', 'В', 'Д', 'К', 'Т'];
    let deck = [];
    for(let suit of suits) {
        for(let val of values) {
            deck.push({ suit, value: val, full: `${suit} ${val}` });
        }
    }
    deck = shuffle(deck);
    
    let playerHand = deck.splice(0, 6);
    let computerHand = deck.splice(0, 6);
    let trump = deck[Math.floor(Math.random() * deck.length)];
    let trumpSuit = trump.suit;
    let attackCards = [];
    let defenseCard = null;
    let turn = 'player'; // кто атакует
    let gameActive = true;
    let lastPlayedCard = null;
    
    function shuffle(arr) {
        for(let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }
    
    function getCardValue(card) {
        const order = ['6','7','8','9','10','В','Д','К','Т'];
        return order.indexOf(card.value);
    }
    
    function canBeat(attack, defense, trumpSuit) {
        if(defense.suit === attack.suit && getCardValue(defense) > getCardValue(attack)) return true;
        if(defense.suit === trumpSuit && attack.suit !== trumpSuit) return true;
        return false;
    }
    
    function renderGame() {
        let html = `<div class="game-status">🃏 ДУРАК | Козырь: ${trumpSuit}</div>`;
        html += `<div style="margin-bottom: 20px;"><strong>Компьютер:</strong> ${computerHand.length} карт`;
        if(computerHand.length > 0) html += ` (${computerHand.map(c=>'?').join(' ')})`;
        html += `</div>`;
        
        html += `<div style="margin: 15px 0; min-height: 80px; background:#0a1020; border-radius: 20px; padding: 10px;">`;
        if(attackCards.length > 0) {
            html += `<strong>Атака:</strong> ${attackCards.map(c=>c.full).join(', ')}<br>`;
        }
        if(defenseCard) {
            html += `<strong>Защита:</strong> ${defenseCard.full}<br>`;
        }
        html += `</div>`;
        
        html += `<div><strong>Твои карты:</strong></div><div class="cards-area">`;
        playerHand.forEach((card, idx) => {
            html += `<div class="card" data-card-idx="${idx}">${card.full}</div>`;
        });
        html += `</div>`;
        
        if(defenseCard === null && turn === 'player' && gameActive) {
            html += `<div style="margin-top: 15px;"><button id="endTurnBtn" class="danger-btn">ЗАКОНЧИТЬ ХОД</button></div>`;
        }
        if(attackCards.length > 0 && defenseCard !== null && turn === 'computer' && gameActive) {
            html += `<div style="margin-top: 15px;"><button id="continueAttackBtn" class="success-btn">ПРОДОЛЖИТЬ АТАКУ</button></div>`;
        }
        
        dom.gameWidget.innerHTML = html;
        
        document.querySelectorAll('.card[data-card-idx]').forEach(cardDiv => {
            cardDiv.onclick = () => {
                if(!gameActive) return;
                const idx = parseInt(cardDiv.dataset.cardIdx);
                const card = playerHand[idx];
                if(turn === 'player' && defenseCard === null) {
                    attackCards.push(card);
                    playerHand.splice(idx, 1);
                    turn = 'computer';
                    renderGame();
                    setTimeout(computerDefense, 300);
                } else if(turn === 'player' && defenseCard !== null && attackCards.length > 0) {
                    if(canBeat(attackCards[attackCards.length-1], card, trumpSuit)) {
                        defenseCard = card;
                        playerHand.splice(idx, 1);
                        renderGame();
                        setTimeout(()=> {
                            attackCards = [];
                            defenseCard = null;
                            if(playerHand.length === 0) {
                                winMinigame(lastPlayedCard?.full || "♠ Туз", 3);
                                gameActive = false;
                                return;
                            }
                            if(computerHand.length === 0 && attackCards.length === 0) {
                                winMinigame(lastPlayedCard?.full || "♠ Туз", 3);
                                gameActive = false;
                                return;
                            }
                            turn = 'computer';
                            renderGame();
                            setTimeout(computerAttack, 300);
                        }, 200);
                    } else {
                        document.getElementById("foolMsg").innerHTML = "Нельзя побить!";
                        setTimeout(()=> renderGame(), 500);
                    }
                }
            };
        });
        
        const endBtn = document.getElementById("endTurnBtn");
        if(endBtn) {
            endBtn.onclick = () => {
                if(attackCards.length > 0 && defenseCard === null && turn === 'player') {
                    computerHand.push(...attackCards);
                    attackCards = [];
                    drawCards();
                    turn = 'computer';
                    renderGame();
                    setTimeout(computerAttack, 300);
                }
            };
        }
        
        const continueBtn = document.getElementById("continueAttackBtn");
        if(continueBtn) {
            continueBtn.onclick = () => {
                if(attackCards.length === 0 && defenseCard !== null && turn === 'computer') {
                    attackCards = [];
                    defenseCard = null;
                    drawCards();
                    turn = 'player';
                    renderGame();
                }
            };
        }
    }
    
    function computerDefense() {
        if(!gameActive) return;
        const lastAttack = attackCards[attackCards.length-1];
        let canBeatCard = computerHand.find(card => canBeat(lastAttack, card, trumpSuit));
        if(canBeatCard) {
            defenseCard = canBeatCard;
            computerHand = computerHand.filter(c => c !== canBeatCard);
            lastPlayedCard = canBeatCard;
            renderGame();
            setTimeout(()=> {
                attackCards = [];
                defenseCard = null;
                if(computerHand.length === 0) {
                    winMinigame(lastPlayedCard?.full || "♠ Туз", 3);
                    gameActive = false;
                    return;
                }
                if(playerHand.length === 0) {
                    winMinigame(lastPlayedCard?.full || "♠ Туз", 3);
                    gameActive = false;
                    return;
                }
                turn = 'computer';
                renderGame();
                setTimeout(computerAttack, 300);
            }, 300);
        } else {
            playerHand.push(...attackCards);
            attackCards = [];
            drawCards();
            turn = 'player';
            renderGame();
        }
    }
    
    function computerAttack() {
        if(!gameActive || turn !== 'computer') return;
        if(computerHand.length > 0) {
            attackCards = [computerHand[0]];
            computerHand.shift();
            turn = 'player';
            defenseCard = null;
            renderGame();
        } else {
            winMinigame(lastPlayedCard?.full || "♠ Туз", 3);
            gameActive = false;
        }
    }
    
    function drawCards() {
        while(playerHand.length < 6 && deck.length > 0) playerHand.push(deck.shift());
        while(computerHand.length < 6 && deck.length > 0) computerHand.push(deck.shift());
    }
    
    renderGame();
}