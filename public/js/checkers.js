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
    this.availableMoves = [];
    this.isJumping = false;

    this.canvas.addEventListener('mousedown', this.handleInteraction.bind(this));
    this.canvas.addEventListener('touchstart', this.handleTouch.bind(this), { passive: false });

    this.crownImage = new Image();
    this.crownImage.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAACXBIWXMAAAsTAAALEwEAmpwYAAABp0lEQVR4nO2UO0sDQRDHf3dGMQkBG1/4KHwUvg3aKdjYWPkFLGzFzlbQb6FgZWOjjYVgYSGCLyxiSCRGkuDlkjvvLhc8TLzNXXKXhID/Zndmdv7M7MwsPOc/yxhzCGwAi865Cj8oY8wqcAZkwmcNWPgpgDFmDrgBZkSkANSAY2DqJwAp8JYAjsNa6acAu8BKwp6P/nPfBRhjloELIBeWHgCMMYvAKTAZbF+Bc+AeGABbwDYwHGxvwKZz7jUVYIzJAlfAWFi6Bs6cc/eRTQk4APLA+/+cc1UReQk2k8A+MBps74EN59ybD8gAV8B4WDoDTp1zDz0AqGoeuEREHPAUmxSBA2AkbL8Bq865NxGZAG6CcwWOVLXRK9mqWsA7XwL2RGRIVYeBA6AQ7OqqOquqh8Bw2HsEDlW10auKVHUOuI2cr6tqKbIpAkciMgzUnXMPqpqLbCaAPVUd7ddN80BZRIqqOgXsArnQ4GvAuXOu2cP3LHCiqpP9AHrK9/+i/pQ+AGvTglhh57eZAAAAAElFTkSuQmCC';
    this.crownImage.onload = () => this.draw();

    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
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

  resizeCanvas() {
    const containerWidth = this.container.clientWidth;
    const containerHeight = window.innerHeight * 0.7;
    const size = Math.min(containerWidth, containerHeight);
    
    this.cellSize = Math.floor(size / this.boardSize);
    this.width = this.boardSize * this.cellSize;
    this.height = this.boardSize * this.cellSize;
    
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    
    this.canvas.style.display = 'block';
    this.canvas.style.margin = '0 auto';
    
    this.draw();
  }

  handleTouch(event) {
    event.preventDefault();
    const touch = event.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    const x = (touch.clientX - rect.left) * (this.canvas.width / rect.width);
    const y = (touch.clientY - rect.top) * (this.canvas.height / rect.height);
    this.handleInteraction(x, y);
  }

  handleInteraction(x, y) {
    if (x instanceof MouseEvent) {
      const rect = this.canvas.getBoundingClientRect();
      const evt = x;
      x = (evt.clientX - rect.left) * (this.canvas.width / rect.width);
      y = (evt.clientY - rect.top) * (this.canvas.height / rect.height);
    }

    const col = Math.floor(x / this.cellSize);
    const row = Math.floor(y / this.cellSize);

    if (this.selectedPiece) {
      const move = this.availableMoves.find(m => m.toRow === row && m.toCol === col);
      if (move) {
        this.executeMove(move);
        if (this.isJumping && this.getJumps(row, col).length > 0) {
          this.selectedPiece = { row, col };
          this.availableMoves = this.getJumps(row, col);
        } else {
          this.endTurn();
        }
      } else {
        this.selectedPiece = null;
        this.availableMoves = [];
        this.selectPiece(row, col);
      }
    } else {
      this.selectPiece(row, col);
    }

    this.draw();
  }

  selectPiece(row, col) {
    const piece = this.board[row][col];
    if (piece && piece.color === this.currentPlayer) {
      this.selectedPiece = { row, col };
      this.availableMoves = this.getAvailableMoves(row, col);
      if (this.availableMoves.length === 0) {
        this.selectedPiece = null;
      }
    }
  }

  getAvailableMoves(row, col) {
    const jumps = this.getJumps(row, col);
    if (jumps.length > 0) {
      this.isJumping = true;
      return jumps;
    }
    this.isJumping = false;
    return this.getRegularMoves(row, col);
  }

  getJumps(row, col) {
    const piece = this.board[row][col];
    const jumps = [];
    const directions = piece.king ? [-1, 1] : piece.color === 'red' ? [-1] : [1];

    for (const rowDir of directions) {
      for (const colDir of [-1, 1]) {
        const jumpRow = row + rowDir * 2;
        const jumpCol = col + colDir * 2;
        const midRow = row + rowDir;
        const midCol = col + colDir;

        if (
          this.isValidPosition(jumpRow, jumpCol) &&
          this.board[jumpRow][jumpCol] === null &&
          this.board[midRow][midCol] &&
          this.board[midRow][midCol].color !== piece.color
        ) {
          jumps.push({ fromRow: row, fromCol: col, toRow: jumpRow, toCol: jumpCol, captureRow: midRow, captureCol: midCol });
        }
      }
    }

    return jumps;
  }

  getRegularMoves(row, col) {
    const piece = this.board[row][col];
    const moves = [];
    const directions = piece.king ? [-1, 1] : piece.color === 'red' ? [-1] : [1];

    for (const rowDir of directions) {
      for (const colDir of [-1, 1]) {
        const newRow = row + rowDir;
        const newCol = col + colDir;

        if (this.isValidPosition(newRow, newCol) && this.board[newRow][newCol] === null) {
          moves.push({ fromRow: row, fromCol: col, toRow: newRow, toCol: newCol });
        }
      }
    }

    return moves;
  }

  isValidPosition(row, col) {
    return row >= 0 && row < this.boardSize && col >= 0 && col < this.boardSize;
  }

  executeMove(move) {
    const piece = this.board[move.fromRow][move.fromCol];
    this.board[move.toRow][move.toCol] = piece;
    this.board[move.fromRow][move.fromCol] = null;

    if (move.captureRow !== undefined) {
      this.board[move.captureRow][move.captureCol] = null;
    }

    this.checkKingStatus(move.toRow, move.toCol);
  }

  checkKingStatus(row, col) {
    const piece = this.board[row][col];
    if (piece.color === 'red' && row === 0) {
      piece.king = true;
    } else if (piece.color === 'black' && row === this.boardSize - 1) {
      piece.king = true;
    }
  }

  endTurn() {
    this.currentPlayer = this.currentPlayer === 'red' ? 'black' : 'red';
    this.selectedPiece = null;
    this.availableMoves = [];
    this.isJumping = false;

    if (this.isGameOver()) {
      this.showGameOver();
    }
  }

  isGameOver() {
    for (let row = 0; row < this.boardSize; row++) {
      for (let col = 0; col < this.boardSize; col++) {
        const piece = this.board[row][col];
        if (piece && piece.color === this.currentPlayer) {
          if (this.getAvailableMoves(row, col).length > 0) {
            return false;
          }
        }
      }
    }
    return true;
  }

  showGameOver() {
    const winner = this.currentPlayer === 'red' ? 'Black' : 'Red';
    alert(`Game Over! ${winner} wins!`);
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

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

    if (this.selectedPiece) {
      const { row, col } = this.selectedPiece;
      this.ctx.strokeStyle = 'yellow';
      this.ctx.lineWidth = 3;
      this.ctx.strokeRect(col * this.cellSize, row * this.cellSize, this.cellSize, this.cellSize);
    }

    this.ctx.fillStyle = 'rgba(0, 255, 0, 0.3)';
    for (const move of this.availableMoves) {
      this.ctx.beginPath();
      this.ctx.arc(
        move.toCol * this.cellSize + this.cellSize / 2,
        move.toRow * this.cellSize + this.cellSize / 2,
        this.cellSize * 0.4,
        0,
        Math.PI * 2
      );
      this.ctx.fill();
    }
  }

  start() {
    this.draw();
  }
}

export default CheckersGame;

