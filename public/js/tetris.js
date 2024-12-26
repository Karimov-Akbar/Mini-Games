class TetrisGame {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.container.appendChild(this.canvas);

    // Game dimensions
    this.blockSize = 30;
    this.rows = 20;
    this.cols = 10;
    this.canvas.width = this.cols * this.blockSize;
    this.canvas.height = this.rows * this.blockSize;

    // Game state
    this.board = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
    this.score = 0;
    this.gameOver = false;
    this.paused = false;

    // Tetromino shapes and colors
    this.shapes = {
      I: [[1, 1, 1, 1]],
      O: [[1, 1], [1, 1]],
      T: [[0, 1, 0], [1, 1, 1]],
      S: [[0, 1, 1], [1, 1, 0]],
      Z: [[1, 1, 0], [0, 1, 1]],
      J: [[1, 0, 0], [1, 1, 1]],
      L: [[0, 0, 1], [1, 1, 1]]
    };

    this.colors = {
      I: '#00f0f0',
      O: '#f0f000',
      T: '#a000f0',
      S: '#00f000',
      Z: '#f00000',
      J: '#0000f0',
      L: '#f0a000'
    };

    // Current piece
    this.currentPiece = null;
    this.currentX = 0;
    this.currentY = 0;
    this.currentShape = null;

    // Game speed
    this.dropInterval = 1000;
    this.lastDrop = 0;

    // Bind methods
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.gameLoop = this.gameLoop.bind(this);
    this.draw = this.draw.bind(this);

    // Setup
    this.setupGame();
    this.setupControls();
    this.createScoreDisplay();
  }

  setupGame() {
    this.canvas.style.border = '2px solid #333';
    this.canvas.style.backgroundColor = '#fff';
    this.newPiece();
  }

  createScoreDisplay() {
    this.scoreDisplay = document.createElement('div');
    this.scoreDisplay.style.marginTop = '10px';
    this.scoreDisplay.style.fontSize = '20px';
    this.scoreDisplay.style.fontWeight = 'bold';
    this.container.appendChild(this.scoreDisplay);
    this.updateScore();
  }

  setupControls() {
    document.addEventListener('keydown', this.handleKeyPress);
  }

  handleKeyPress(e) {
    if (this.gameOver) return;

    switch (e.key) {
      case 'ArrowLeft':
        if (this.isValidMove(this.currentPiece, this.currentX - 1, this.currentY)) {
          this.currentX--;
        }
        break;
      case 'ArrowRight':
        if (this.isValidMove(this.currentPiece, this.currentX + 1, this.currentY)) {
          this.currentX++;
        }
        break;
      case 'ArrowDown':
        if (this.isValidMove(this.currentPiece, this.currentX, this.currentY + 1)) {
          this.currentY++;
        }
        break;
      case 'ArrowUp':
        const rotated = this.rotate(this.currentPiece);
        if (this.isValidMove(rotated, this.currentX, this.currentY)) {
          this.currentPiece = rotated;
        }
        break;
      case ' ':
        this.hardDrop();
        break;
      case 'p':
        this.togglePause();
        break;
    }
    this.draw();
  }

  rotate(piece) {
    const N = piece.length;
    const rotated = Array(N).fill().map(() => Array(N).fill(0));
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N; j++) {
        rotated[j][N - 1 - i] = piece[i][j];
      }
    }
    return rotated;
  }

  isValidMove(piece, x, y) {
    for (let r = 0; r < piece.length; r++) {
      for (let c = 0; c < piece[r].length; c++) {
        if (!piece[r][c]) continue;
        
        const newX = x + c;
        const newY = y + r;
        
        if (newX < 0 || newX >= this.cols || newY >= this.rows) return false;
        if (newY < 0) continue;
        if (this.board[newY][newX]) return false;
      }
    }
    return true;
  }

  hardDrop() {
    while (this.isValidMove(this.currentPiece, this.currentX, this.currentY + 1)) {
      this.currentY++;
    }
    this.placePiece();
  }

  newPiece() {
    const pieces = Object.keys(this.shapes);
    this.currentShape = pieces[Math.floor(Math.random() * pieces.length)];
    this.currentPiece = this.shapes[this.currentShape];
    this.currentX = Math.floor((this.cols - this.currentPiece[0].length) / 2);
    this.currentY = 0;

    if (!this.isValidMove(this.currentPiece, this.currentX, this.currentY)) {
      this.gameOver = true;
    }
  }

  placePiece() {
    for (let r = 0; r < this.currentPiece.length; r++) {
      for (let c = 0; c < this.currentPiece[r].length; c++) {
        if (this.currentPiece[r][c]) {
          if (this.currentY + r < 0) {
            this.gameOver = true;
            return;
          }
          this.board[this.currentY + r][this.currentX + c] = this.currentShape;
        }
      }
    }

    this.clearLines();
    this.newPiece();
  }

  clearLines() {
    let linesCleared = 0;
    
    for (let r = this.rows - 1; r >= 0; r--) {
      if (this.board[r].every(cell => cell !== 0)) {
        this.board.splice(r, 1);
        this.board.unshift(Array(this.cols).fill(0));
        linesCleared++;
        r++;
      }
    }

    if (linesCleared > 0) {
      this.score += [40, 100, 300, 1200][linesCleared - 1];
      this.updateScore();
      this.dropInterval = Math.max(100, 1000 - (this.score / 100));
    }
  }

  updateScore() {
    this.scoreDisplay.textContent = `Score: ${this.score}`;
  }

  togglePause() {
    this.paused = !this.paused;
    if (!this.paused) {
      this.lastDrop = performance.now();
      requestAnimationFrame(this.gameLoop);
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw board
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.board[r][c]) {
          this.ctx.fillStyle = this.colors[this.board[r][c]];
          this.ctx.fillRect(c * this.blockSize, r * this.blockSize, this.blockSize - 1, this.blockSize - 1);
        }
      }
    }

    // Draw current piece
    if (this.currentPiece) {
      this.ctx.fillStyle = this.colors[this.currentShape];
      for (let r = 0; r < this.currentPiece.length; r++) {
        for (let c = 0; c < this.currentPiece[r].length; c++) {
          if (this.currentPiece[r][c]) {
            this.ctx.fillRect(
              (this.currentX + c) * this.blockSize,
              (this.currentY + r) * this.blockSize,
              this.blockSize - 1,
              this.blockSize - 1
            );
          }
        }
      }
    }

    if (this.gameOver) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '20px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('Game Over!', this.canvas.width / 2, this.canvas.height / 2 - 30);
      this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2);
      this.ctx.fillText('Press R to restart', this.canvas.width / 2, this.canvas.height / 2 + 30);
    }

    if (this.paused) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '20px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
    }
  }

  gameLoop(timestamp) {
    if (this.gameOver || this.paused) return;

    if (timestamp - this.lastDrop > this.dropInterval) {
      if (this.isValidMove(this.currentPiece, this.currentX, this.currentY + 1)) {
        this.currentY++;
      } else {
        this.placePiece();
      }
      this.lastDrop = timestamp;
      this.draw();
    }

    requestAnimationFrame(this.gameLoop);
  }

  start() {
    this.board = Array(this.rows).fill().map(() => Array(this.cols).fill(0));
    this.score = 0;
    this.gameOver = false;
    this.paused = false;
    this.dropInterval = 1000;
    this.updateScore();
    this.newPiece();
    this.lastDrop = performance.now();
    requestAnimationFrame(this.gameLoop);
  }

  destroy() {
    document.removeEventListener('keydown', this.handleKeyPress);
  }
}

export default TetrisGame;

