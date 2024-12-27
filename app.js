import express from 'express';
import path from 'path';
import { Server } from 'socket.io';
import { fileURLToPath } from 'url';
import http from 'http';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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

server.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
