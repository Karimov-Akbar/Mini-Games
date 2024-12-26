class TicTacToeGame {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.container.appendChild(this.canvas);

    // Set canvas size
    this.width = 300;
    this.height = 300;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.cellSize = this.width / 3;

    // Initialize game state
    this.initializeGame();
    
    // Bind the click handler to maintain context
    this.handleClick = this.handleClick.bind(this);
    this.canvas.addEventListener('click', this.handleClick);
  }

  initializeGame() {
    this.board = [
      ['', '', ''],
      ['', '', ''],
      ['', '', '']
    ];
    this.currentPlayer = 'X';
    this.gameOver = false;
    this.winner = null;
    this.draw(); // Initial draw of empty board
  }

  handleClick(event) {
    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // If game is over, reset and return
    if (this.gameOver) {
      this.initializeGame();
      return;
    }

    // Calculate board position
    const row = Math.floor(y / this.cellSize);
    const col = Math.floor(x / this.cellSize);

    // Validate position and make move
    if (row >= 0 && row < 3 && col >= 0 && col < 3 && this.board[row][col] === '') {
      this.board[row][col] = this.currentPlayer;
      this.checkWinner();
      if (!this.gameOver) {
        this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
      }
      this.draw();
    }
  }

  checkWinner() {
    // Check rows, columns, and diagonals
    const lines = [
      // Rows
      [[0,0], [0,1], [0,2]],
      [[1,0], [1,1], [1,2]],
      [[2,0], [2,1], [2,2]],
      // Columns
      [[0,0], [1,0], [2,0]],
      [[0,1], [1,1], [2,1]],
      [[0,2], [1,2], [2,2]],
      // Diagonals
      [[0,0], [1,1], [2,2]],
      [[0,2], [1,1], [2,0]]
    ];

    for (const line of lines) {
      const [a, b, c] = line;
      if (
        this.board[a[0]][a[1]] &&
        this.board[a[0]][a[1]] === this.board[b[0]][b[1]] &&
        this.board[a[0]][a[1]] === this.board[c[0]][c[1]]
      ) {
        this.gameOver = true;
        this.winner = this.board[a[0]][a[1]];
        return;
      }
    }

    // Check for tie
    if (this.board.every(row => row.every(cell => cell !== ''))) {
      this.gameOver = true;
      this.winner = 'Tie';
    }
  }

  draw() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Draw grid
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();

    // Vertical lines
    this.ctx.moveTo(this.cellSize, 0);
    this.ctx.lineTo(this.cellSize, this.height);
    this.ctx.moveTo(this.cellSize * 2, 0);
    this.ctx.lineTo(this.cellSize * 2, this.height);

    // Horizontal lines
    this.ctx.moveTo(0, this.cellSize);
    this.ctx.lineTo(this.width, this.cellSize);
    this.ctx.moveTo(0, this.cellSize * 2);
    this.ctx.lineTo(this.width, this.cellSize * 2);

    this.ctx.stroke();

    // Draw X's and O's
    this.ctx.font = '60px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillStyle = '#000';

    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const value = this.board[row][col];
        if (value) {
          const x = (col + 0.5) * this.cellSize;
          const y = (row + 0.5) * this.cellSize;
          this.ctx.fillText(value, x, y);
        }
      }
    }

    // Draw game over overlay
    if (this.gameOver) {
      // Semi-transparent overlay
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillRect(0, 0, this.width, this.height);

      // Game over text
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '30px Arial';
      const message = this.winner === 'Tie' ? "It's a tie!" : `${this.winner} wins!`;
      this.ctx.fillText(message, this.width / 2, this.height / 2 - 30);

      this.ctx.font = '20px Arial';
      this.ctx.fillText('Click to play again', this.width / 2, this.height / 2 + 20);
    }
  }

  start() {
    this.initializeGame();
  }

  // Clean up event listeners when game is destroyed
  destroy() {
    this.canvas.removeEventListener('click', this.handleClick);
  }
}

export default TicTacToeGame;