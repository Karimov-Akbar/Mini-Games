import io from 'socket.io-client';

class TicTacToeGame {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.socket = io(); // Инициализация подключения к серверу
    this.bindSocketEvents();
    // Остальные свойства...
  }

  bindSocketEvents() {
    // Подключение к серверу
    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    // Обновление лобби при подключении игрока
    this.socket.on('updateLobby', (lobby) => {
      this.lobby = lobby;
      this.updateLobbyUI();
      if (this.isHost && this.lobby.length === 2) {
        this.playBtn.disabled = false;
      }
    });

    // Начало игры
    this.socket.on('startGame', (opponentName) => {
      this.opponentConnected = true;
      this.opponentName = opponentName;
      this.initializeGame();
    });

    // Получение хода оппонента
    this.socket.on('opponentMove', ({ row, col }) => {
      this.makeMove(row, col);
    });
  }

  hostGame() {
    this.gameMode = 'multi';
    this.isHost = true;
    this.socket.emit('hostGame');
    this.showLobby();
  }

  joinGame(code) {
    this.gameMode = 'multi';
    this.isHost = false;
    this.socket.emit('joinGame', code);
    this.showLobby();
  }

  addPlayerToLobby(playerName) {
    // Элементы списка обновляются через события сокета
    const playerItem = document.createElement('li');
    playerItem.textContent = playerName;
    playerItem.style.fontSize = '18px';
    playerItem.style.margin = '10px 0';
    this.lobbyList.appendChild(playerItem);
  }

  startMultiplayerGame() {
    if (this.lobby.length < 2) return;
    this.socket.emit('startGame');
  }

  makeMove(row, col) {
    if (this.gameMode === 'multi' && this.currentPlayer === (this.isHost ? 'X' : 'O')) {
      this.socket.emit('makeMove', { row, col });
    }
    // Остальная логика хода...
  }
}
