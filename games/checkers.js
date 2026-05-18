function initCheckers() {
    // 8x8 поле, простая реализация шашек
    let board = Array(8).fill().map(() => Array(8).fill(null));
    let currentPlayer = 'white'; // белые ходят первыми (игрок)
    let selectedRow = null, selectedCol = null;
    let lastCaptureType = "простая шашка";
    let gameOver = false;
    
    // Инициализация фигур
    for(let row = 0; row < 8; row++) {
        for(let col = 0; col < 8; col++) {
            if((row+col)%2 === 1) {
                if(row < 3) board[row][col] = { type: 'black', king: false };
                else if(row > 4) board[row][col] = { type: 'white', king: false };
            }
        }
    }
    
    const renderBoard = () => {
        let html = '<div class="checkers-board">';
        for(let row = 0; row < 8; row++) {
            for(let col = 0; col < 8; col++) {
                const cell = board[row][col];
                const isDark = (row+col)%2 === 1;
                const isSelected = (selectedRow === row && selectedCol === col);
                let pieceHtml = '';
                if(cell) {
                    if(cell.type === 'white') pieceHtml = cell.king ? '👑' : '⚪';
                    else pieceHtml = cell.king ? '👑' : '⚫';
                }
                html += `<div class="checkers-cell ${isDark ? 'dark' : ''} ${isSelected ? 'selected' : ''}" data-row="${row}" data-col="${col}">${pieceHtml}</div>`;
            }
        }
        html += '</div><div id="checkersMsg" style="text-align:center; margin-top:10px;"></div>';
        dom.gameWidget.innerHTML = html;
        
        document.querySelectorAll('.checkers-cell').forEach(cell => {
            cell.onclick = () => {
                if(gameOver) return;
                const row = parseInt(cell.dataset.row);
                const col = parseInt(cell.dataset.col);
                handleCellClick(row, col);
                renderBoard();
            };
        });
    };
    
    const isValidMove = (fromRow, fromCol, toRow, toCol, piece) => {
        const dr = toRow - fromRow;
        const dc = toCol - fromCol;
        const isKing = piece.king;
        const dir = piece.type === 'white' ? -1 : 1;
        
        if(Math.abs(dc) !== 1 && Math.abs(dc) !== 2) return false;
        if(Math.abs(dr) !== Math.abs(dc)) return false;
        
        // Обычная шашка
        if(!isKing) {
            if(piece.type === 'white' && dr > 0) return false;
            if(piece.type === 'black' && dr < 0) return false;
        }
        
        if(Math.abs(dr) === 1) {
            return !board[toRow][toCol];
        }
        
        if(Math.abs(dr) === 2) {
            const midRow = (fromRow + toRow)/2;
            const midCol = (fromCol + toCol)/2;
            const target = board[midRow][midCol];
            if(target && target.type !== piece.type) {
                return !board[toRow][toCol];
            }
        }
        return false;
    };
    
    const makeMove = (fromRow, fromCol, toRow, toCol) => {
        const piece = board[fromRow][fromCol];
        const dr = Math.abs(toRow - fromRow);
        
        if(dr === 2) {
            const midRow = (fromRow + toRow)/2;
            const midCol = (fromCol + toCol)/2;
            board[midRow][midCol] = null;
            lastCaptureType = piece.king ? "дамка" : "простая шашка";
        }
        
        board[toRow][toCol] = piece;
        board[fromRow][fromCol] = null;
        
        // Коронация
        if((piece.type === 'white' && toRow === 0) || (piece.type === 'black' && toRow === 7)) {
            piece.king = true;
        }
        
        currentPlayer = currentPlayer === 'white' ? 'black' : 'white';
        
        // Проверка победы
        let whiteCount = 0, blackCount = 0;
        for(let r=0; r<8; r++) {
            for(let c=0; c<8; c++) {
                if(board[r][c]?.type === 'white') whiteCount++;
                if(board[r][c]?.type === 'black') blackCount++;
            }
        }
        if(whiteCount === 0) {
            document.getElementById("checkersMsg").innerHTML = "Вы проиграли! Перезапуск...";
            gameOver = true;
            setTimeout(()=> initCheckers(), 1500);
        } else if(blackCount === 0) {
            winMinigame(lastCaptureType, 2);
            gameOver = true;
        }
    };
    
    const handleCellClick = (row, col) => {
        if(gameOver) return;
        const cell = board[row][col];
        
        if(selectedRow === null) {
            if(cell && cell.type === currentPlayer) {
                selectedRow = row;
                selectedCol = col;
            }
        } else {
            const piece = board[selectedRow][selectedCol];
            if(isValidMove(selectedRow, selectedCol, row, col, piece)) {
                makeMove(selectedRow, selectedCol, row, col);
                selectedRow = null;
                selectedCol = null;
            } else {
                selectedRow = null;
                if(cell && cell.type === currentPlayer) {
                    selectedRow = row;
                    selectedCol = col;
                }
            }
        }
        renderBoard();
    };
    
    renderBoard();
}