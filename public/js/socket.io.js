const socket = io();

class TicTacToeGame {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.socket = io(); // Подключение к серверу
    this.bindSocketEvents();
    this.isHost = false;
    this.inviteCode = null;
    this.lobby = [];
    // Другие свойства...
  }

  bindSocketEvents() {
    this.socket.on('connect', () => {
      console.log('Подключено к серверу');
    });

    this.socket.on('lobbyCreated', ({ code, players }) => {
      this.isHost = true;
      this.inviteCode = code;
      this.lobby = players;
      this.showLobby();
    });

    this.socket.on('updateLobby', (players) => {
      this.lobby = players;
      this.updateLobbyUI();
    });

    this.socket.on('gameStarted', ({ players }) => {
      this.opponentConnected = true;
      this.opponentName = players.find((p) => p !== (this.isHost ? 'X' : 'O'));
      this.initializeGame();
    });

    this.socket.on('errorMessage', (message) => {
      alert(message);
    });
  }

  hostGame() {
    this.socket.emit('hostGame');
  }

  joinGame(code) {
    this.socket.emit('joinGame', code);
  }

  startMultiplayerGame() {
    if (this.lobby.length < 2) {
      alert('Ожидайте подключения второго игрока.');
      return;
    }
    this.socket.emit('startGame', this.inviteCode);
  }

  updateLobbyUI() {
    // Обновление интерфейса для отображения игроков в лобби
    const lobbyList = document.querySelector('#lobbyList');
    lobbyList.innerHTML = '';
    this.lobby.forEach((player) => {
      const listItem = document.createElement('li');
      listItem.textContent = player;
      lobbyList.appendChild(listItem);
    });

    // Активируем кнопку "Start Game" только для хоста
    if (this.isHost) {
      const startBtn = document.querySelector('#startGameBtn');
      startBtn.disabled = this.lobby.length < 2;
    }
  }
}
