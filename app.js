const express = require('express');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = 10000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.redirect('/main');
});

app.get('/main', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/views/main.html'));
});

// Логика лобби
const lobbies = {};

io.on('connection', (socket) => {
  console.log(`Игрок подключился: ${socket.id}`);

  socket.on('hostGame', () => {
    const code = Math.random().toString(36).substr(2, 6).toUpperCase();
    lobbies[code] = { host: socket, players: [socket], started: false };
    socket.join(code);
    socket.emit('lobbyCreated', { code, players: ['You (Host)'] });
    console.log(`Создано лобби: ${code}`);
  });

  socket.on('joinGame', (code) => {
    if (lobbies[code] && lobbies[code].players.length < 2) {
      lobbies[code].players.push(socket);
      socket.join(code);
      const players = ['Host', 'You'];
      io.to(code).emit('updateLobby', players);
      console.log(`Игрок ${socket.id} подключился к лобби: ${code}`);
    } else {
      socket.emit('errorMessage', 'Лобби недоступно или заполнено.');
    }
  });

  socket.on('startGame', (code) => {
    const lobby = lobbies[code];
    if (lobby && lobby.players.length === 2 && !lobby.started) {
      lobby.started = true;
      io.to(code).emit('gameStarted', { players: ['X', 'O'] });
      console.log(`Игра началась в лобби: ${code}`);
    }
  });

  socket.on('makeMove', ({ code, row, col }) => {
    if (lobbies[code]) {
      socket.to(code).emit('opponentMove', { row, col });
    }
  });

  socket.on('disconnect', () => {
    for (const code in lobbies) {
      const lobby = lobbies[code];
      lobby.players = lobby.players.filter((player) => player !== socket);
      if (lobby.players.length === 0) {
        delete lobbies[code];
        console.log(`Лобби ${code} закрыто.`);
      } else {
        io.to(code).emit('updateLobby', lobby.players.map((p) => (p === lobby.host ? 'Host' : 'Player')));
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
