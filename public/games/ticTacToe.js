function initTicTacToe() {
    let board = Array(9).fill(null);
    let playerTurn = true;
    let gameActive = true;
    let lastMovePos = "центр";
    
    const positions = [
        "угол", "угол", "угол",
        "угол", "центр", "угол",
        "угол", "угол", "угол"
    ];
    
    // Функция определения типа позиции
    function getPositionType(idx) {
        if (idx === 4) return "центр";
        if (idx === 0 || idx === 2 || idx === 6 || idx === 8) return "угол";
        return "край";
    }
    
    const renderBoard = () => {
        let html = '<div class="game-status">❌ КРЕСТИКИ-НОЛИКИ | Ваш ход: X</div>';
        html += '<div class="grid-3x3">';
        for(let i = 0; i < 9; i++) {
            let sym = board[i] === 'X' ? '❌' : (board[i] === 'O' ? '⭕' : '');
            html += `<div class="cell" data-idx="${i}">${sym}</div>`;
        }
        html += '</div><div id="tttMsg" style="text-align:center; margin-top:10px;"></div>';
        dom.gameWidget.innerHTML = html;
        
        document.querySelectorAll('.cell').forEach(cell => {
            cell.onclick = () => {
                if(!playerTurn || !gameActive) return;
                let idx = parseInt(cell.dataset.idx);
                if(board[idx]) return;
                board[idx] = 'X';
                lastMovePos = getPositionType(idx);
                if(checkWin('X')) {
                    winMinigame(lastMovePos, 1);
                    return;
                }
                if(board.every(c=>c!==null)) { resetTie(); return; }
                playerTurn = false;
                setTimeout(aiMove, 300);
                renderBoard();
            };
        });
    };
    
    const checkWin = (p) => {
        const lines = [
            [0,1,2], [3,4,5], [6,7,8],
            [0,3,6], [1,4,7], [2,5,8],
            [0,4,8], [2,4,6]
        ];
        if(lines.some(line => line.every(i=>board[i]===p))) {
            gameActive = false;
            return p === 'X';
        }
        return false;
    };
    
    const resetTie = () => {
        document.getElementById("tttMsg").innerHTML = "Ничья! Переигровка";
        setTimeout(()=> initTicTacToe(), 1000);
    };
    
    const aiMove = () => {
        if(!gameActive) return;
        let empty = board.map((v,i)=>v===null?i:null).filter(v=>v!==null);
        if(empty.length===0) { resetTie(); return; }
        let idx = empty[Math.floor(Math.random()*empty.length)];
        board[idx] = 'O';
        if(checkWin('O')) { 
            document.getElementById("tttMsg").innerHTML = "Поражение! Перезапуск";
            setTimeout(()=> initTicTacToe(), 1200);
            gameActive = false;
            return;
        }
        if(board.every(c=>c!==null)) { resetTie(); return; }
        playerTurn = true;
        renderBoard();
    };
    renderBoard();
}