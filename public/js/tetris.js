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
    this.controlType = null;

    // Tetromino shapes and colors
    this.shapes = {
      I: [[0,0,0,0], [1,1,1,1], [0,0,0,0], [0,0,0,0]],
      O: [[1,1], [1,1]],
      T: [[0,1,0], [1,1,1], [0,0,0]],
      S: [[0,1,1], [1,1,0], [0,0,0]],
      Z: [[1,1,0], [0,1,1], [0,0,0]],
      J: [[1,0,0], [1,1,1], [0,0,0]],
      L: [[0,0,1], [1,1,1], [0,0,0]]
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

    // Touch controls
    this.touchStartX = null;
    this.touchStartY = null;

    // Bind methods
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleTouchStart = this.handleTouchStart.bind(this);
    this.handleTouchEnd = this.handleTouchEnd.bind(this);
    this.gameLoop = this.gameLoop.bind(this);
    this.draw = this.draw.bind(this);

    // Setup
    this.createControlSelection();
  }

  createControlSelection() {
    // Check if control selection already exists
    if (this.container.querySelector('.control-selection')) return;

    const controlSelection = document.createElement('div');
    controlSelection.classList.add('control-selection');  // Add class for checking
    controlSelection.style.textAlign = 'center';
    controlSelection.style.marginBottom = '20px';

    const title = document.createElement('h2');
    title.textContent = 'Choose Control Type';
    controlSelection.appendChild(title);

    const pcButton = this.createButton('PC Controls', () => this.setupGame('pc'));
    const mobileButton = this.createButton('Mobile Controls', () => this.setupGame('mobile'));

    controlSelection.appendChild(pcButton);
    controlSelection.appendChild(mobileButton);

    this.container.insertBefore(controlSelection, this.canvas);
  }

  createButton(text, onClick) {
    const button = document.createElement('button');
    button.textContent = text;
    button.style.margin = '10px';
    button.style.padding = '15px 30px';
    button.style.fontSize = '16px';
    button.style.backgroundColor = '#4CAF50';
    button.style.color = 'white';
    button.style.border = 'none';
    button.style.borderRadius = '8px';
    button.style.cursor = 'pointer';
    button.style.transition = 'all 0.3s ease';
    
    button.addEventListener('mouseover', () => {
      button.style.backgroundColor = '#45a049';
      button.style.transform = 'translateY(-2px)';
    });
    
    button.addEventListener('mouseout', () => {
      button.style.backgroundColor = '#4CAF50';
      button.style.transform = 'translateY(0)';
    });
    
    button.addEventListener('click', onClick);
    return button;
  }

  setupGame(controlType) {
    this.controlType = controlType;
    this.container.querySelector('div').style.display = 'none';
    this.canvas.style.display = 'block';

    this.canvas.style.border = '2px solid #333';
    this.canvas.style.backgroundColor = '#fff';
    
    if (this.controlType === 'pc') {
      document.addEventListener('keydown', this.handleKeyPress);
    } else {
      this.canvas.addEventListener('touchstart', this.handleTouchStart);
      this.canvas.addEventListener('touchend', this.handleTouchEnd);
    }

    this.createScoreDisplay();
    this.updateScore(); // Move this here after scoreDisplay is created
    this.newPiece();
    this.gameLoop(performance.now());
  }

  createScoreDisplay() {
    this.scoreDisplay = document.createElement('div');
    this.scoreDisplay.style.marginTop = '10px';
    this.scoreDisplay.style.fontSize = '20px';
    this.scoreDisplay.style.fontWeight = 'bold';
    this.container.appendChild(this.scoreDisplay);
    this.updateScore();
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

  handleTouchStart(e) {
    if (this.gameOver) return;
    const touch = e.touches[0];
    this.touchStartX = touch.clientX;
    this.touchStartY = touch.clientY;
  }

  handleTouchEnd(e) {
    if (this.gameOver) return;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - this.touchStartX;
    const deltaY = touch.clientY - this.touchStartY;

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (deltaX > 50 && this.isValidMove(this.currentPiece, this.currentX + 1, this.currentY)) {
        this.currentX++;
      } else if (deltaX < -50 && this.isValidMove(this.currentPiece, this.currentX - 1, this.currentY)) {
        this.currentX--;
      }
    } else if (Math.abs(deltaY) > Math.abs(deltaX) && deltaY > 50) {
      // Downward swipe
      this.hardDrop();
    } else if (Math.abs(deltaX) < 10 && Math.abs(deltaY) < 10) {
      // Tap (rotate)
      const rotated = this.rotate(this.currentPiece);
      if (this.isValidMove(rotated, this.currentX, this.currentY)) {
        this.currentPiece = rotated;
      }
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
    
    // Hide the canvas initially
    this.canvas.style.display = 'none';
    
    // Remove the duplicate control selection creation
    // this.createControlSelection();  <- Remove this line
  }

  destroy() {
    if (this.controlType === 'pc') {
      document.removeEventListener('keydown', this.handleKeyPress);
    } else {
      this.canvas.removeEventListener('touchstart', this.handleTouchStart);
      this.canvas.removeEventListener('touchend', this.handleTouchEnd);
    }
  }
}

export default TetrisGame;

