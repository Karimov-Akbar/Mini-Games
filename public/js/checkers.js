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
    this.canvas.addEventListener('touchstart', this.handleTouch.bind(this));

    // Load crown image
    this.crownImage = new Image();
    this.crownImage.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAABp0lEQVR4nO2UO0sDQRDHf3dGMQkBG1/4KHwUvg3aKdjYWPkFLGzFzlbQb6FgZWOjjYVgYSGCLyxiSCRGkuDlkjvvLhc8TLzNXXKXhID/Zndmdv7M7MwsPOc/yxhzCGwAi865Cj8oY8wqcAZkwmcNWPgpgDFmDrgBZkSkANSAY2DqJwAp8JYAjsNa6acAu8BKwp6P/nPfBRhjloELIBeWHgCMMYvAKTAZbF+Bc+AeGABbwDYwHGxvwKZz7jUVYIzJAlfAWFi6Bs6cc/eRTQk4APLA+/+cc1UReQk2k8A+MBpsb4ENINoEGGPmgdtg/AQcOecqPXzPAGWgGEEq3vkEsBds74EN59ybD8gAV8B4WDoDTp1zDz0AqGoeuEREHPAUmxSBA2AkbL8Bq865NxGZAG6CcwWOVLXRK9mqWsA7XwL2RGRIVYeBA6AQ7OqqOquqh8Bw2HsEDlW10auKVHUOuI2cr6tqKbIpAkciMgzUnXMPqpqLbCaAPVUd7ddN80BZRIqqOgXsArnQ4GvAuXOu2cP3LHCiqpP9AHrK9/+i/pQ+AGvTglhh57eZAAAAAElFTkSuQmCC';
    this.crownImage.onload = () => this.draw();
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

  draw() {
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

          if (piece.king) {
            this.ctx.drawImage(
              this.crownImage,
              col * this.cellSize + this.cellSize / 4,
              row * this.cellSize + this.cellSize / 4,
              this.cellSize / 2,
              this.cellSize / 2
            );
          }
        }
      }
    }
  }

  handleClick(event) {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    this.handleInteraction(x, y);
  }

  handleTouch(event) {
    event.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    const touch = event.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    this.handleInteraction(x, y);
  }

  handleInteraction(x, y) {
    const col = Math.floor(x / this.cellSize);
    const row = Math.floor(y / this.cellSize);

    if (this.selectedPiece) {
      this.movePiece(row, col);
    } else {
      this.selectPiece(row, col);
    }

    this.draw();
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

    const isValidMove = piece.king
      ? (Math.abs(rowDiff) === 1 && Math.abs(colDiff) === 1) || (Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 2)
      : (this.currentPlayer === 'red' && rowDiff === -1) || (this.currentPlayer === 'black' && rowDiff === 1);

    if (isValidMove && this.board[newRow][newCol] === null) {
      if (Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 2) {
        const jumpedRow = row + rowDiff / 2;
        const jumpedCol = col + colDiff / 2;
        if (this.board[jumpedRow][jumpedCol] && this.board[jumpedRow][jumpedCol].color !== this.currentPlayer) {
          this.board[jumpedRow][jumpedCol] = null;
        } else {
          this.selectedPiece = null;
          return;
        }
      }

      this.board[newRow][newCol] = piece;
      this.board[row][col] = null;
      this.checkKingStatus(newRow, newCol);
      this.currentPlayer = this.currentPlayer === 'red' ? 'black' : 'red';
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
    this.draw();
  }
}

export default CheckersGame;