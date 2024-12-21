class SnakeGame {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.container.appendChild(this.canvas);

    this.tileSize = 20;
    this.width = 400;
    this.height = 400;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.snake = [{ x: 5, y: 5 }];
    this.food = this.generateFood();
    this.direction = 'right';
    this.score = 0;

    this.gameLoop = null;
    this.gameSpeed = 100;

    this.setupEventListeners();
  }

  setupEventListeners() {
    document.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          if (this.direction !== 'down') this.direction = 'up';
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (this.direction !== 'up') this.direction = 'down';
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (this.direction !== 'right') this.direction = 'left';
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (this.direction !== 'left') this.direction = 'right';
          break;
      }
    });
  }

  generateFood() {
    return {
      x: Math.floor(Math.random() * (this.width / this.tileSize)),
      y: Math.floor(Math.random() * (this.height / this.tileSize)),
    };
  }

  moveSnake() {
    const head = { ...this.snake[0] };

    switch (this.direction) {
      case 'up':
        head.y--;
        break;
      case 'down':
        head.y++;
        break;
      case 'left':
        head.x--;
        break;
      case 'right':
        head.x++;
        break;
    }

    this.snake.unshift(head);

    if (head.x === this.food.x && head.y === this.food.y) {
      this.score++;
      this.food = this.generateFood();
      this.gameSpeed = Math.max(50, this.gameSpeed - 2);
      clearInterval(this.gameLoop);
      this.gameLoop = setInterval(() => this.gameStep(), this.gameSpeed);
    } else {
      this.snake.pop();
    }
  }

  checkCollision() {
    const head = this.snake[0];

    if (
      head.x < 0 ||
      head.x >= this.width / this.tileSize ||
      head.y < 0 ||
      head.y >= this.height / this.tileSize
    ) {
      return true;
    }

    for (let i = 1; i < this.snake.length; i++) {
      if (head.x === this.snake[i].x && head.y === this.snake[i].y) {
        return true;
      }
    }

    return false;
  }

  draw() {
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
    this.ctx.lineWidth = 1;

    for (let i = 0; i < this.width; i += this.tileSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(i, 0);
      this.ctx.lineTo(i, this.height);
      this.ctx.stroke();
    }
    
    for (let i = 0; i < this.height; i += this.tileSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, i);
      this.ctx.lineTo(this.width, i);
      this.ctx.stroke();
    }

    this.ctx.fillStyle = '#4ecca3';
    this.snake.forEach((segment, index) => {
      const x = segment.x * this.tileSize;
      const y = segment.y * this.tileSize;
      
      if (index === 0) {
        this.ctx.beginPath();
        this.ctx.arc(x + this.tileSize / 2, y + this.tileSize / 2, this.tileSize / 2, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.fillStyle = '#4ecca3';
        const eyeSize = this.tileSize / 6;
        this.ctx.beginPath();
        this.ctx.arc(x + this.tileSize / 3, y + this.tileSize / 3, eyeSize, 0, Math.PI * 2);
        this.ctx.arc(x + this.tileSize * 2 / 3, y + this.tileSize / 3, eyeSize, 0, Math.PI * 2);
        this.ctx.fill();
      } else {
        this.ctx.fillRect(x + 1, y + 1, this.tileSize - 2, this.tileSize - 2);
      }
    });

    this.ctx.fillStyle = '#e94560';
    const foodX = this.food.x * this.tileSize;
    const foodY = this.food.y * this.tileSize;
    this.ctx.beginPath();
    this.ctx.arc(foodX + this.tileSize / 2, foodY + this.tileSize / 2, this.tileSize / 2 - 1, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.fillStyle = '#000';
    this.ctx.font = '20px Arial';
    this.ctx.fillText(`Score: ${this.score}`, 10, 30);
  }

  gameOver() {
    clearInterval(this.gameLoop);
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '30px Arial';
    this.ctx.fillText('Game Over', this.width / 2 - 70, this.height / 2 - 15);
    this.ctx.fillText(`Score: ${this.score}`, this.width / 2 - 50, this.height / 2 + 25);

    const replayBtn = document.createElement('button');
    replayBtn.textContent = 'Play Again';
    replayBtn.style.position = 'absolute';
    replayBtn.style.left = '50%';
    replayBtn.style.top = '60%';
    replayBtn.style.transform = 'translate(-50%, -50%)';
    replayBtn.style.padding = '10px 20px';
    replayBtn.style.fontSize = '18px';
    replayBtn.style.backgroundColor = '#6a5acd';
    replayBtn.style.color = '#fff';
    replayBtn.style.border = 'none';
    replayBtn.style.borderRadius = '5px';
    replayBtn.style.cursor = 'pointer';
    replayBtn.addEventListener('click', () => this.start());
    this.container.appendChild(replayBtn);
  }

  gameStep() {
    this.moveSnake();
    if (this.checkCollision()) {
      this.gameOver();
      return;
    }
    this.draw();
  }

  start() {
    this.snake = [{ x: 5, y: 5 }];
    this.food = this.generateFood();
    this.direction = 'right';
    this.score = 0;
    this.gameSpeed = 100;

    clearInterval(this.gameLoop);
    const replayBtn = this.container.querySelector('button');
    if (replayBtn) {
      this.container.removeChild(replayBtn);
    }

    this.gameLoop = setInterval(() => this.gameStep(), this.gameSpeed);
  }
}

export default SnakeGame;