class TicTacToeGame {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.container.appendChild(this.canvas);

    this.width = 300;
    this.height = 300;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.board = [
      ['', '', ''],
      ['', '', ''],
      ['', '', '']
    ];
    this.currentPlayer = 'X';
    this.gameOver = false;

    this.setupEventListeners();
    this.draw();
  }

  setupEventListeners() {
    this.canvas.addEventListener('click', (e) => this.handleClick(e));
  }

  handleClick(e) {
    if (this.gameOver) {
      this.resetGame();
      return;
    }
  
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
  
    const col = Math.floor(x / (this.width / 3));
    const row = Math.floor(y / (this.height / 3));
  
    if (this.board[row][col] === '') {
      this.board[row][col] = this.currentPlayer;
      this.checkWinner();
      this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
      this.draw();
    }
  }

  checkWinner() {
    const winningCombos = [
      [[0,0], [0,1], [0,2]],
      [[1,0], [1,1], [1,2]],
      [[2,0], [2,1], [2,2]],
      [[0,0], [1,0], [2,0]],
      [[0,1], [1,1], [2,1]],
      [[0,2], [1,2], [2,2]],
      [[0,0], [1,1], [2,2]],
      [[0,2], [1,1], [2,0]]
    ];

    for (let combo of winningCombos) {
      const [a, b, c] = combo;
      if (
        this.board[a[0]][a[1]] &&
        this.board[a[0]][a[1]] === this.board[b[0]][b[1]] &&
        this.board[a[0]][a[1]] === this.board[c[0]][c[1]]
      ) {
        this.gameOver = true;
        this.winner = this.currentPlayer;
        break;
      }
    }

    if (!this.gameOver && this.board.every(row => row.every(cell => cell !== ''))) {
      this.gameOver = true;
      this.winner = 'Tie';
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Draw grid
    this.ctx.strokeStyle = '#000';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(this.width / 3, 0);
    this.ctx.lineTo(this.width / 3, this.height);
    this.ctx.moveTo(2 * this.width / 3, 0);
    this.ctx.lineTo(2 * this.width / 3, this.height);
    this.ctx.moveTo(0, this.height / 3);
    this.ctx.lineTo(this.width, this.height / 3);
    this.ctx.moveTo(0, 2 * this.height / 3);
    this.ctx.lineTo(this.width, 2 * this.height / 3);
    this.ctx.stroke();

    // Draw X's and O's
    this.ctx.font = '60px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';

    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        const cellValue = this.board[row][col];
        if (cellValue) {
          const x = (col + 0.5) * this.width / 3;
          const y = (row + 0.5) * this.height / 3;
          this.ctx.fillText(cellValue, x, y);
        }
      }
    }

    // Draw game over message
    if (this.gameOver) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillRect(0, 0, this.width, this.height);
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '30px Arial';
      if (this.winner === 'Tie') {
        this.ctx.fillText("It's a tie!", this.width / 2, this.height / 2 - 20);
      } else {
        this.ctx.fillText(`${this.winner} wins!`, this.width / 2, this.height / 2 - 20);
      }
      this.ctx.font = '20px Arial';
      this.ctx.fillText('Click to play again', this.width / 2, this.height / 2 + 20);
    }
  }

  resetGame() {
    this.board = [
      ['', '', ''],
      ['', '', ''],
      ['', '', '']
    ];
    this.currentPlayer = 'X';
    this.gameOver = false;
    this.winner = null;
    this.draw();
  }

  start() {
    this.resetGame();
  }
}

export default TicTacToeGame;