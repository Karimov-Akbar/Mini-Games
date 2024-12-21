class CheckersGame {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.container.appendChild(this.canvas);

    this.boardSize = 8;
    this.cellSize = 50;
    this.width = this.boardSize * this.cellSize;
    this.height = this.boardSize * this.cellSize;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.board = this.initializeBoard();
    this.currentPlayer = 'red';
    this.selectedPiece = null;

    this.canvas.addEventListener('click', this.handleClick.bind(this));
  }

  initializeBoard() {
    const board = [];
    for (let row = 0; row < this.boardSize; row++) {
      board[row] = [];
      for (let col = 0; col < this.boardSize; col++) {
        if ((row + col) % 2 === 1) {
          if (row < 3) {
            board[row][col] = { color: 'black', king: false };
          } else if (row > 4) {
            board[row][col] = { color: 'red', king: false };
          } else {
            board[row][col] = null;
          }
        } else {
          board[row][col] = null;
        }
      }
    }
    return board;
  }

  drawBoard() {
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        this.ctx.fillStyle = (row + col) % 2 === 0 ? '#f0d9b5' : '#b58863';
        this.ctx.fillRect(col * this.cellSize, row * this.cellSize, this.cellSize, this.cellSize);

        const piece = this.board[row][col];
        if (piece) {
          this.ctx.fillStyle = piece.color;
          this.ctx.beginPath();
          this.ctx.arc(
            col * this.cellSize + this.cellSize / 2,
            row * this.cellSize + this.cellSize / 2,
            this.cellSize * 0.4,
            0,
            Math.PI * 2
          );
          this.ctx.fill();

          // Draw a crown if the piece is a king
          if (piece.king) {
            this.ctx.fillStyle = 'gold';
            this.ctx.font = '20px Arial';
            this.ctx.fillText('K', col * this.cellSize + this.cellSize / 2 - 6, row * this.cellSize + this.cellSize / 2 + 6);
          }
        }
      }
    }
  }

  handleClick(event) {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const col = Math.floor(x / this.cellSize);
    const row = Math.floor(y / this.cellSize);

    if (this.selectedPiece) {
      this.movePiece(row, col);
    } else {
      this.selectPiece(row, col);
    }

    this.drawBoard();
  }

  selectPiece(row, col) {
    const piece = this.board[row][col];
    if (piece && piece.color === this.currentPlayer) {
      this.selectedPiece = { row, col };
      this.ctx.strokeStyle = 'yellow';
      this.ctx.lineWidth = 3;
      this.ctx.strokeRect(col * this.cellSize, row * this.cellSize, this.cellSize, this.cellSize);
    }
  }

  movePiece(newRow, newCol) {
    const { row, col } = this.selectedPiece;
    const piece = this.board[row][col];
    const rowDiff = newRow - row;
    const colDiff = newCol - col;

    const validMoveForKing = Math.abs(rowDiff) === 1 && Math.abs(colDiff) === 1;
    const validMoveForPawn =
      (this.currentPlayer === 'red' && rowDiff === -1) ||
      (this.currentPlayer === 'black' && rowDiff === 1);

    if (
      Math.abs(rowDiff) === 1 &&
      Math.abs(colDiff) === 1 &&
      this.board[newRow][newCol] === null &&
      (piece.king || validMoveForPawn)
    ) {
      this.board[newRow][newCol] = piece;
      this.board[row][col] = null;
      this.checkKingStatus(newRow, newCol);
      this.currentPlayer = this.currentPlayer === 'red' ? 'black' : 'red';
    } else if (
      Math.abs(rowDiff) === 2 &&
      Math.abs(colDiff) === 2 &&
      this.board[newRow][newCol] === null
    ) {
      const jumpedRow = row + rowDiff / 2;
      const jumpedCol = col + colDiff / 2;
      if (this.board[jumpedRow][jumpedCol] && this.board[jumpedRow][jumpedCol].color !== this.currentPlayer) {
        this.board[newRow][newCol] = piece;
        this.board[row][col] = null;
        this.board[jumpedRow][jumpedCol] = null;
        this.checkKingStatus(newRow, newCol);
        this.currentPlayer = this.currentPlayer === 'red' ? 'black' : 'red';
      }
    }

    this.selectedPiece = null;
  }

  checkKingStatus(row, col) {
    const piece = this.board[row][col];
    if (piece.color === 'red' && row === 0) {
      piece.king = true;
    } else if (piece.color === 'black' && row === this.boardSize - 1) {
      piece.king = true;
    }
  }

  start() {
    this.drawBoard();
  }
}

export default CheckersGame;