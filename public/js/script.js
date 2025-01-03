import SnakeGame from './snake.js';
import CheckersGame from './checkers.js';
import MemoryGame from './memory.js';
import TetrisGame from './tetris.js';
import FlappyBirdGame from './flappy-bird.js';
import HamsterClickerGame from './hamster-clicker.js';
import TicTacToeGame from './tic-tac-toe.js';
import ColoringPage from './coloring-page.js';

document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('game-modal');
  const modalTitle = document.getElementById('modal-title');
  const gameContainer = document.getElementById('game-container');
  const closeBtn = document.getElementsByClassName('close')[0];
  const playButtons = document.querySelectorAll('.play-btn');

  let currentGame = null;

  playButtons.forEach(button => {
    button.addEventListener('click', () => {
      const gameId = button.parentElement.id;
      openGameModal(gameId);
    });
  });

  closeBtn.addEventListener('click', closeModal);

  window.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  function openGameModal(gameId) {
    modal.style.display = 'block';
    modalTitle.textContent = gameId.charAt(0).toUpperCase() + gameId.slice(1);
    gameContainer.innerHTML = '';

    switch (gameId) {
      case 'snake':
        currentGame = new SnakeGame('game-container');
        currentGame.start();
        break;
      case 'checkers':
        currentGame = new CheckersGame('game-container');
        currentGame.start();
        break;
      case 'cards':
        currentGame = new MemoryGame('game-container');
        currentGame.start();
        break;
      case 'tetris':
        currentGame = new TetrisGame('game-container');
        currentGame.start();
        break;
      case 'flappybird':
        currentGame = new FlappyBirdGame('game-container');
        currentGame.start();
        break;
      case 'hamsterclicker':
        currentGame = new HamsterClickerGame('game-container');
        currentGame.start();
        break;
      case 'tictactoe':
        currentGame = new TicTacToeGame('game-container');
        currentGame.start();
        break;
      case 'coloringpage':
        currentGame = new ColoringPage('game-container');
        currentGame.start();
        break;
    }
  }

  function closeModal() {
    modal.style.display = 'none';
    if (currentGame) {
      if (currentGame.destroy) {
        currentGame.destroy();
      }
      if (currentGame.gameLoop) {
        cancelAnimationFrame(currentGame.gameLoop);
      }
    }
    currentGame = null;
    gameContainer.innerHTML = '';
  }
});

document.addEventListener('touchmove', function (event) {
  if (event.scale !== 1) {
      event.preventDefault();
  }
}, { passive: false });

var lastTouchEnd = 0;
document.addEventListener('touchend', function (event) {
  var now = (new Date()).getTime();
  if (now - lastTouchEnd <= 300) {
      event.preventDefault();
  }
  lastTouchEnd = now;
}, false);