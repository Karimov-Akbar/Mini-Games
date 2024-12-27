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
  res.sendFile(__dirname + '/public/views/main.html');
});

// Лобби и мультиплеерная логика
const lobbies = {};

io.on('connection', (socket) => {
  console.log(`Игрок подключился: ${socket.id}`);

  socket.on('hostGame', () => {
    const code = Math.random().toString(36).substr(2, 6).toUpperCase();
    lobbies[code] = [socket];
    socket.join(code);
    socket.emit('lobbyCreated', { code, players: ['You (Host)'] });
    console.log(`Создано лобби: ${code}`);
  });

  socket.on('joinGame', (code) => {
    if (lobbies[code] && lobbies[code].length < 2) {
      lobbies[code].push(socket);
      socket.join(code);
      const players = ['Host', 'You'];
      io.to(code).emit('updateLobby', players);
      console.log(`Игрок ${socket.id} подключился к лобби: ${code}`);
    } else {
      socket.emit('errorMessage', 'Лобби недоступно или заполнено.');
    }
  });

  socket.on('startGame', (code) => {
    if (lobbies[code] && lobbies[code].length === 2) {
      io.to(code).emit('gameStarted', { players: ['X', 'O'] });
      console.log(`Игра началась в лобби: ${code}`);
    }
  });

  socket.on('makeMove', ({ code, row, col }) => {
    if (lobbies[code]) {
      socket.to(code).emit('opponentMove', { row, col });
      console.log(`Ход игрока в лобби ${code}: строка ${row}, колонка ${col}`);
    }
  });

  socket.on('disconnect', () => {
    for (const code in lobbies) {
      lobbies[code] = lobbies[code].filter((player) => player !== socket);
      if (lobbies[code].length === 0) {
        delete lobbies[code];
        console.log(`Лобби ${code} закрыто из-за выхода игроков.`);
      }
    }
  });
});

// Запуск сервера
server.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});