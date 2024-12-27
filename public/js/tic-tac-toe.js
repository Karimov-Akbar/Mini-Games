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

    // Game state
    this.board = [
      ['', '', ''],
      ['', '', ''],
      ['', '', '']
    ];
    this.currentPlayer = 'X';
    this.gameOver = false;
    this.winner = null;
    this.gameMode = null; // 'single' or 'multi'
    this.isHost = false;
    this.inviteCode = null;
    this.opponentConnected = false;

    // Bind methods
    this.handleClick = this.handleClick.bind(this);
    this.showMenu = this.showMenu.bind(this);
    this.startSinglePlayerGame = this.startSinglePlayerGame.bind(this);
    this.showMultiplayerOptions = this.showMultiplayerOptions.bind(this);
    this.hostGame = this.hostGame.bind(this);
    this.joinGame = this.joinGame.bind(this);

    // Show the initial menu
    this.showMenu();
  }

  showMenu() {
    this.container.innerHTML = '';
    const menuDiv = document.createElement('div');
    menuDiv.style.textAlign = 'center';
    menuDiv.style.padding = '20px';

    const title = document.createElement('h2');
    title.textContent = 'Tic-Tac-Toe';
    title.style.marginBottom = '20px';

    const singlePlayerBtn = this.createButton('Single Player', this.startSinglePlayerGame);
    const multiplayerBtn = this.createButton('Multiplayer', this.showMultiplayerOptions);

    menuDiv.appendChild(title);
    menuDiv.appendChild(singlePlayerBtn);
    menuDiv.appendChild(multiplayerBtn);

    this.container.appendChild(menuDiv);
  }

  showMultiplayerOptions() {
    this.container.innerHTML = '';
    const optionsDiv = document.createElement('div');
    optionsDiv.style.textAlign = 'center';
    optionsDiv.style.padding = '20px';

    const title = document.createElement('h2');
    title.textContent = 'Multiplayer Options';
    title.style.marginBottom = '20px';

    const hostBtn = this.createButton('Host Game', this.hostGame);
    const joinBtn = this.createButton('Join Game', () => {
      const code = prompt('Enter the invite code:');
      if (code) this.joinGame(code);
    });
    const backBtn = this.createButton('Back', this.showMenu);

    optionsDiv.appendChild(title);
    optionsDiv.appendChild(hostBtn);
    optionsDiv.appendChild(joinBtn);
    optionsDiv.appendChild(backBtn);

    this.container.appendChild(optionsDiv);
  }

  createButton(text, onClick) {
    const button = document.createElement('button');
    button.textContent = text;
    button.style.margin = '10px';
    button.style.padding = '10px 20px';
    button.style.fontSize = '16px';
    button.style.cursor = 'pointer';
    button.addEventListener('click', onClick);
    return button;
  }

  startSinglePlayerGame() {
    this.gameMode = 'single';
    this.initializeGame();
  }

  hostGame() {
    this.gameMode = 'multi';
    this.isHost = true;
    this.inviteCode = Math.random().toString(36).substr(2, 6).toUpperCase();
    this.initializeGame();
    this.showWaitingScreen();
  }

  joinGame(code) {
    this.gameMode = 'multi';
    this.isHost = false;
    this.inviteCode = code;
    this.initializeGame();
    this.simulateOpponentConnection();
  }

  showWaitingScreen() {
    this.container.innerHTML = '';
    const waitingDiv = document.createElement('div');
    waitingDiv.style.textAlign = 'center';
    waitingDiv.style.padding = '20px';

    const title = document.createElement('h2');
    title.textContent = 'Waiting for opponent...';
    title.style.marginBottom = '20px';

    const codeDisplay = document.createElement('p');
    codeDisplay.textContent = `Invite Code: ${this.inviteCode}`;
    codeDisplay.style.fontSize = '24px';
    codeDisplay.style.fontWeight = 'bold';

    waitingDiv.appendChild(title);
    waitingDiv.appendChild(codeDisplay);

    this.container.appendChild(waitingDiv);

    // Simulate opponent connection after a short delay
    setTimeout(() => this.simulateOpponentConnection(), 3000);
  }

  simulateOpponentConnection() {
    this.opponentConnected = true;
    this.container.innerHTML = '';
    this.container.appendChild(this.canvas);
    this.draw();
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

    if (this.gameMode === 'single' || (this.gameMode === 'multi' && this.opponentConnected)) {
      this.container.innerHTML = '';
      this.container.appendChild(this.canvas);
      this.canvas.addEventListener('click', this.handleClick);
      this.draw();
    }
  }

  handleClick(event) {
    if (this.gameOver || (this.gameMode === 'multi' && this.currentPlayer !== (this.isHost ? 'X' : 'O'))) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const row = Math.floor(y / this.cellSize);
    const col = Math.floor(x / this.cellSize);

    if (this.board[row][col] === '') {
      this.makeMove(row, col);
    }
  }

  makeMove(row, col) {
    this.board[row][col] = this.currentPlayer;
    this.checkWinner();
    if (!this.gameOver) {
      this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
      if (this.gameMode === 'single' && this.currentPlayer === 'O') {
        this.makeAIMove();
      }
    }
    this.draw();

    if (this.gameMode === 'multi') {
      this.simulateSendMoveToOpponent(row, col);
    }
  }

  makeAIMove() {
    const emptyCells = [];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (this.board[i][j] === '') {
          emptyCells.push({row: i, col: j});
        }
      }
    }
    if (emptyCells.length > 0) {
      const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      this.makeMove(randomCell.row, randomCell.col);
    }
  }

  simulateSendMoveToOpponent(row, col) {
    // In a real implementation, this would send the move to the server
    console.log(`Sending move: row ${row}, col ${col}`);
    // Simulate receiving opponent's move after a short delay
    setTimeout(() => {
      if (!this.gameOver) {
        this.simulateReceiveOpponentMove();
      }
    }, 1000);
  }

  simulateReceiveOpponentMove() {
    // In a real implementation, this would receive the move from the server
    const emptyCells = [];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (this.board[i][j] === '') {
          emptyCells.push({row: i, col: j});
        }
      }
    }
    if (emptyCells.length > 0) {
      const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      this.makeMove(randomCell.row, randomCell.col);
    }
  }

  checkWinner() {
    const lines = [
      [[0,0], [0,1], [0,2]],
      [[1,0], [1,1], [1,2]],
      [[2,0], [2,1], [2,2]],
      [[0,0], [1,0], [2,0]],
      [[0,1], [1,1], [2,1]],
      [[0,2], [1,2], [2,2]],
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
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillRect(0, 0, this.width, this.height);

      this.ctx.fillStyle = '#fff';
      this.ctx.font = '30px Arial';
      const message = this.winner === 'Tie' ? "It's a tie!" : `${this.winner} wins!`;
      this.ctx.fillText(message, this.width / 2, this.height / 2 - 30);

      this.ctx.font = '20px Arial';
      this.ctx.fillText('Click to play again', this.width / 2, this.height / 2 + 20);

      this.canvas.addEventListener('click', () => this.showMenu(), { once: true });
    }
  }

  start() {
    this.showMenu();
  }

  destroy() {
    this.canvas.removeEventListener('click', this.handleClick);
  }
}

export default TicTacToeGame;