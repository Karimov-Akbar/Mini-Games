const express = require('express');
const path = require('path');

const app = express();
const PORT = 10000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
  res.redirect('/main');
});

app.get('/main', (req, res) => {
  res.sendFile(__dirname + '/public/views/main.html');
});

// Запускаем сервер
app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
