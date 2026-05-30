function initCheckers() {
    // 8x8 поле
    let board = Array(8).fill().map(() => Array(8).fill(null));
    let currentPlayer = 'white'; // Белые (игрок) ходят первыми
    let selectedRow = null, selectedCol = null;
    let lastCaptureType = "простая шашка"; // Для викторины
    let gameOver = false;
    let waitingForAI = false;
    let forceContinueCapture = false; // Флаг принудительного продолжения взятия
    let continuingPiece = null; // Шашка, которая должна продолжить взятие

    // Инициализация фигур
    for(let row = 0; row < 8; row++) {
        for(let col = 0; col < 8; col++) {
            if((row + col) % 2 === 1) {
                if(row < 3) board[row][col] = { type: 'black', king: false };
                else if(row > 4) board[row][col] = { type: 'white', king: false };
            }
        }
    }

    // ================= ЛОГИКА ХОДОВ =================
    
    // Проверка, может ли шашка (или дамка) переместиться
    function isValidMove(piece, fromRow, fromCol, toRow, toCol, boardState, checkOnlyCapture = false) {
        const deltaRow = toRow - fromRow;
        const deltaCol = toCol - fromCol;
        const absDeltaRow = Math.abs(deltaRow);
        const absDeltaCol = Math.abs(deltaCol);
        
        if (boardState[toRow][toCol] !== null) return false;
        
        const direction = (piece.type === 'white') ? -1 : 1;
        
        // --- Логика ДАМКИ ---
        if (piece.king) {
            if (absDeltaRow !== absDeltaCol) return false;
            
            const stepRow = (deltaRow > 0) ? 1 : -1;
            const stepCol = (deltaCol > 0) ? 1 : -1;
            
            let currentRow = fromRow + stepRow;
            let currentCol = fromCol + stepCol;
            let enemyFound = false;
            
            while (currentRow !== toRow) {
                const cell = boardState[currentRow][currentCol];
                if (cell !== null) {
                    if (!enemyFound && cell.type !== piece.type) {
                        enemyFound = true;
                    } else {
                        return false;
                    }
                }
                currentRow += stepRow;
                currentCol += stepCol;
            }
            
            if (checkOnlyCapture && !enemyFound) return false;
            return true;
        }
        
        // --- Логика ОБЫЧНОЙ ШАШКИ ---
        if (!piece.king) {
            if (piece.type === 'white' && deltaRow > 0) return false;
            if (piece.type === 'black' && deltaRow < 0) return false;
        }
        
        if (absDeltaRow === 1 && absDeltaCol === 1) {
            if (checkOnlyCapture) return false;
            return true;
        }
        
        if (absDeltaRow === 2 && absDeltaCol === 2) {
            const midRow = (fromRow + toRow) / 2;
            const midCol = (fromCol + toCol) / 2;
            const targetPiece = boardState[midRow][midCol];
            
            if (targetPiece && targetPiece.type !== piece.type) {
                return true;
            }
        }
        
        return false;
    }

    // Получение всех возможных ходов для определенного цвета
    function getAllMovesForColor(boardState, color, onlyCapture = false) {
        let moves = [];
        for(let row = 0; row < 8; row++) {
            for(let col = 0; col < 8; col++) {
                const piece = boardState[row][col];
                if(piece && piece.type === color) {
                    for(let targetRow = 0; targetRow < 8; targetRow++) {
                        for(let targetCol = 0; targetCol < 8; targetCol++) {
                            if(row === targetRow && col === targetCol) continue;
                            if(isValidMove(piece, row, col, targetRow, targetCol, boardState, onlyCapture)) {
                                if(onlyCapture) {
                                    const deltaRow = Math.abs(targetRow - row);
                                    if(piece.king) {
                                        let hasEnemy = false;
                                        const stepRow = (targetRow > row) ? 1 : -1;
                                        const stepCol = (targetCol > col) ? 1 : -1;
                                        let r = row + stepRow, c = col + stepCol;
                                        while(r !== targetRow) {
                                            if(boardState[r][c] !== null && boardState[r][c].type !== piece.type) hasEnemy = true;
                                            r += stepRow; c += stepCol;
                                        }
                                        if(!hasEnemy) continue;
                                    } else {
                                        if(Math.abs(deltaRow) !== 2) continue;
                                    }
                                }
                                moves.push({ from: {row, col}, to: {row: targetRow, col: targetCol}, piece: piece });
                            }
                        }
                    }
                }
            }
        }
        return moves;
    }
    
    // Получение всех возможных взятий для конкретной шашки
    function getCaptureMovesForPiece(boardState, row, col) {
        const piece = boardState[row][col];
        if(!piece) return [];
        
        let captures = [];
        for(let targetRow = 0; targetRow < 8; targetRow++) {
            for(let targetCol = 0; targetCol < 8; targetCol++) {
                if(row === targetRow && col === targetCol) continue;
                if(isValidMove(piece, row, col, targetRow, targetCol, boardState, true)) {
                    const deltaRow = Math.abs(targetRow - row);
                    if(piece.king) {
                        let hasEnemy = false;
                        const stepRow = (targetRow > row) ? 1 : -1;
                        const stepCol = (targetCol > col) ? 1 : -1;
                        let r = row + stepRow, c = col + stepCol;
                        while(r !== targetRow) {
                            if(boardState[r][c] !== null && boardState[r][c].type !== piece.type) hasEnemy = true;
                            r += stepRow; c += stepCol;
                        }
                        if(hasEnemy) captures.push({ row: targetRow, col: targetCol });
                    } else {
                        if(Math.abs(deltaRow) === 2) captures.push({ row: targetRow, col: targetCol });
                    }
                }
            }
        }
        return captures;
    }
    
    // Выполнение хода
    function applyMove(boardState, from, to, piece) {
        const newBoard = copyBoard(boardState);
        const fromPiece = newBoard[from.row][from.col];
        let capturedPieceType = null;
        
        const deltaRow = Math.abs(to.row - from.row);
        
        // Обработка съедания для обычной шашки
        if (!fromPiece.king && deltaRow === 2) {
            const midRow = (from.row + to.row) / 2;
            const midCol = (from.col + to.col) / 2;
            const target = newBoard[midRow][midCol];
            if(target && target.type !== fromPiece.type) {
                capturedPieceType = target.king ? "дамка" : "простая шашка";
                newBoard[midRow][midCol] = null;
            }
        }
        // Обработка съедания для дамки
        else if (fromPiece.king && Math.abs(deltaRow) > 1) {
            const stepRow = (to.row > from.row) ? 1 : -1;
            const stepCol = (to.col > from.col) ? 1 : -1;
            let r = from.row + stepRow, c = from.col + stepCol;
            while(r !== to.row) {
                if(newBoard[r][c] !== null && newBoard[r][c].type !== fromPiece.type) {
                    capturedPieceType = newBoard[r][c].king ? "дамка" : "простая шашка";
                    newBoard[r][c] = null;
                    break;
                }
                r += stepRow; c += stepCol;
            }
        }
        
        // Перемещаем фигуру
        newBoard[to.row][to.col] = fromPiece;
        newBoard[from.row][from.col] = null;
        
        // Превращение в дамку
        if((fromPiece.type === 'white' && to.row === 0) || (fromPiece.type === 'black' && to.row === 7)) {
            newBoard[to.row][to.col].king = true;
        }
        
        return { newBoard, capturedPieceType };
    }

    function copyBoard(boardState) {
        return boardState.map(row => 
            row.map(cell => cell ? { ...cell } : null)
        );
    }

    // ================= ЛОГИКА ПОБЕДЫ =================
    function checkWinner(boardState) {
        let whiteCount = 0, blackCount = 0;
        for(let r = 0; r < 8; r++) {
            for(let c = 0; c < 8; c++) {
                if(boardState[r][c]?.type === 'white') whiteCount++;
                if(boardState[r][c]?.type === 'black') blackCount++;
            }
        }
        if(whiteCount === 0) return 'black';
        if(blackCount === 0) return 'white';
        return null;
    }

    function endGame(winner) {
        gameOver = true;
        if(winner === 'white') {
            winMinigame(lastCaptureType, 2);
        } else if(winner === 'black') {
            document.getElementById("checkersMsg").innerHTML = "❌ Вы проиграли! Шашки сломаны. Перезапуск...";
            setTimeout(() => initCheckers(), 2000);
        }
    }

    // ================= ХОД ИГРОКА =================
    function tryPlayerMove(fromRow, fromCol, toRow, toCol) {
        const piece = board[fromRow][fromCol];
        if(!piece || piece.type !== 'white') return false;
        
        // Если мы в режиме принудительного продолжения взятия
        if(forceContinueCapture) {
            if(continuingPiece && (continuingPiece.row !== fromRow || continuingPiece.col !== fromCol)) {
                document.getElementById("checkersMsg").innerHTML = "⚠️ Вы должны продолжать ходить той же шашкой!";
                setTimeout(() => { document.getElementById("checkersMsg").innerHTML = ""; }, 1000);
                return false;
            }
        }
        
        // Проверяем, обязан ли игрок атаковать
        const allCaptureMoves = getAllMovesForColor(board, 'white', true);
        const mustCapture = allCaptureMoves.length > 0;
        
        // Проверяем валидность конкретного хода
        const isValid = isValidMove(piece, fromRow, fromCol, toRow, toCol, board, mustCapture);
        if(!isValid) return false;
        
        // Если мы обязаны атаковать, проверяем, что этот ход действительно атакует
        if(mustCapture) {
            const isCapture = (Math.abs(toRow - fromRow) > 1) || 
                (piece.king && Math.abs(toRow - fromRow) > 1 && Math.abs(toCol - fromCol) > 1);
            if(!isCapture) return false;
        }
        
        // Выполняем ход
        const { newBoard, capturedPieceType } = applyMove(board, {row: fromRow, col: fromCol}, {row: toRow, col: toCol}, piece);
        if(capturedPieceType) lastCaptureType = capturedPieceType;
        board = newBoard;
        
        // Проверяем, может ли эта шашка продолжить взятие
        const movedPiece = board[toRow][toCol];
        const additionalCaptures = getCaptureMovesForPiece(board, toRow, toCol);
        
        if(additionalCaptures.length > 0 && movedPiece && mustCapture) {
            // Есть возможность продолжить взятие той же шашкой
            forceContinueCapture = true;
            continuingPiece = { row: toRow, col: toCol };
            selectedRow = toRow;
            selectedCol = toCol;
            document.getElementById("checkersMsg").innerHTML = "🔥 Продолжайте взятие той же шашкой!";
            setTimeout(() => { document.getElementById("checkersMsg").innerHTML = ""; }, 1500);
            renderBoard();
            return true;
        }
        
        // Смена хода
        forceContinueCapture = false;
        continuingPiece = null;
        selectedRow = null;
        selectedCol = null;
        currentPlayer = 'black';
        
        // Проверка победы
        const winner = checkWinner(board);
        if(winner) {
            endGame(winner);
            renderBoard();
            return true;
        }
        
        renderBoard();
        
        // Запускаем ход ИИ, если игра не окончена
        if(!gameOver && currentPlayer === 'black') {
            setTimeout(() => aiMove(), 100);
        }
        
        return true;
    }

    // ================= ХОД ИИ (черные) =================
    function aiMove() {
        if(gameOver || currentPlayer !== 'black' || waitingForAI) return;
        waitingForAI = true;
        
        // Если ИИ должен продолжить взятие той же шашкой
        if(forceContinueCapture && continuingPiece) {
            const piece = board[continuingPiece.row][continuingPiece.col];
            if(piece && piece.type === 'black') {
                const captures = getCaptureMovesForPiece(board, continuingPiece.row, continuingPiece.col);
                if(captures.length > 0) {
                    const randomCapture = captures[Math.floor(Math.random() * captures.length)];
                    const { newBoard, capturedPieceType } = applyMove(board, 
                        {row: continuingPiece.row, col: continuingPiece.col}, 
                        {row: randomCapture.row, col: randomCapture.col}, 
                        piece);
                    if(capturedPieceType) lastCaptureType = capturedPieceType;
                    board = newBoard;
                    
                    // Проверяем, может ли продолжить
                    const furtherCaptures = getCaptureMovesForPiece(board, randomCapture.row, randomCapture.col);
                    if(furtherCaptures.length > 0) {
                        continuingPiece = { row: randomCapture.row, col: randomCapture.col };
                        renderBoard();
                        waitingForAI = false;
                        setTimeout(() => aiMove(), 100);
                        return;
                    }
                }
            }
            // Завершаем цепочку взятий
            forceContinueCapture = false;
            continuingPiece = null;
            currentPlayer = 'white';
            
            const winner = checkWinner(board);
            if(winner) {
                endGame(winner);
                renderBoard();
                waitingForAI = false;
                return;
            }
            
            renderBoard();
            waitingForAI = false;
            return;
        }
        
        setTimeout(() => {
            if(gameOver || currentPlayer !== 'black') {
                waitingForAI = false;
                return;
            }
            
            let currentBoard = copyBoard(board);
            let mustCapture = false;
            let allMoves = getAllMovesForColor(currentBoard, 'black');
            let captureMoves = getAllMovesForColor(currentBoard, 'black', true);
            
            if(captureMoves.length > 0) {
                mustCapture = true;
                allMoves = captureMoves;
            }
            
            if(allMoves.length === 0) {
                const winner = checkWinner(currentBoard);
                if(winner === 'white') endGame('white');
                else if(winner === 'black') endGame('black');
                else {
                    endGame('white');
                }
                waitingForAI = false;
                renderBoard();
                return;
            }
            
            // Выбираем случайный ход
            const randomIndex = Math.floor(Math.random() * allMoves.length);
            const move = allMoves[randomIndex];
            const piece = currentBoard[move.from.row][move.from.col];
            
            const { newBoard, capturedPieceType } = applyMove(currentBoard, move.from, move.to, piece);
            if(capturedPieceType) lastCaptureType = capturedPieceType;
            board = newBoard;
            
            // Проверка дополнительных взятий для ИИ
            const movedPiece = board[move.to.row][move.to.col];
            const additionalCaptures = getCaptureMovesForPiece(board, move.to.row, move.to.col);
            
            if(additionalCaptures.length > 0 && movedPiece && mustCapture) {
                // ИИ должен продолжить взятие
                forceContinueCapture = true;
                continuingPiece = { row: move.to.row, col: move.to.col };
                renderBoard();
                waitingForAI = false;
                setTimeout(() => aiMove(), 100);
                return;
            }
            
            // Смена хода обратно игроку
            forceContinueCapture = false;
            continuingPiece = null;
            currentPlayer = 'white';
            selectedRow = null;
            selectedCol = null;
            
            const winner = checkWinner(board);
            if(winner) {
                endGame(winner);
                renderBoard();
                waitingForAI = false;
                return;
            }
            
            waitingForAI = false;
            renderBoard();
        }, 80);
    }

    // ================= ОТРИСОВКА И ОБРАБОТЧИК КЛИКОВ =================
    function renderBoard() {
        let html = '<div class="checkers-board">';
        for(let row = 0; row < 8; row++) {
            for(let col = 0; col < 8; col++) {
                const cell = board[row][col];
                const isDark = (row + col) % 2 === 1;
                const isSelected = (selectedRow === row && selectedCol === col);
                let pieceHtml = '';
                if(cell) {
                    if(cell.type === 'white') pieceHtml = cell.king ? '👑' : '⚪';
                    else pieceHtml = cell.king ? '👑' : '⚫';
                }
                html += `<div class="checkers-cell ${isDark ? 'dark' : ''} ${isSelected ? 'selected' : ''}" data-row="${row}" data-col="${col}">${pieceHtml}</div>`;
            }
        }
        html += '</div><div id="checkersMsg" style="text-align:center; margin-top:10px; color:#ffaa77;"></div>';
        
        const allCaptureMoves = getAllMovesForColor(board, 'white', true);
        if(currentPlayer === 'white' && !gameOver) {
            if(allCaptureMoves.length > 0) {
                html += '<div style="text-align:center; margin-top:8px; font-size:0.8rem; color:#ff8866;">⚠️ ОБЯЗАТЕЛЬНОЕ ВЗЯТИЕ! Вы должны съесть шашку противника</div>';
            } else {
                html += '<div style="text-align:center; margin-top:8px; font-size:0.8rem; color:#88ddff;">🎲 Ваш ход (белые)</div>';
            }
        }
        if(currentPlayer === 'black' && !gameOver) {
            html += '<div style="text-align:center; margin-top:8px; font-size:0.8rem; color:#88ddff;">🤖 ИИ думает...</div>';
        }
        
        dom.gameWidget.innerHTML = html;
        
        if(currentPlayer === 'white' && !gameOver) {
            document.querySelectorAll('.checkers-cell').forEach(cell => {
                cell.onclick = () => {
                    if(gameOver || currentPlayer !== 'white') return;
                    const row = parseInt(cell.dataset.row);
                    const col = parseInt(cell.dataset.col);
                    handleCellClick(row, col);
                };
            });
        } else {
            document.querySelectorAll('.checkers-cell').forEach(cell => {
                cell.onclick = null;
            });
        }
    }
    
    function handleCellClick(row, col) {
        if(gameOver || currentPlayer !== 'white') return;
        
        if(selectedRow !== null) {
            const success = tryPlayerMove(selectedRow, selectedCol, row, col);
            if(!success) {
                selectedRow = null;
                selectedCol = null;
                renderBoard();
            } else {
                renderBoard();
            }
        } 
        else {
            const piece = board[row][col];
            if(piece && piece.type === 'white') {
                const captureMoves = getAllMovesForColor(board, 'white', true);
                if(captureMoves.length > 0) {
                    const canThisCapture = captureMoves.some(move => move.from.row === row && move.from.col === col);
                    if(canThisCapture) {
                        selectedRow = row;
                        selectedCol = col;
                    } else {
                        document.getElementById("checkersMsg").innerHTML = "⚠️ Вы обязаны атаковать! Выберите другую шашку.";
                        setTimeout(() => { document.getElementById("checkersMsg").innerHTML = ""; }, 1000);
                    }
                } else {
                    selectedRow = row;
                    selectedCol = col;
                }
                renderBoard();
            }
        }
    }

    renderBoard();
}