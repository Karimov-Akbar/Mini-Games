class FlappyBirdGame {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.container.appendChild(this.canvas);

    this.width = 400;
    this.height = 600;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.bird = {
      x: 50,
      y: this.height / 2,
      width: 40,
      height: 30,
      velocity: 0,
      gravity: 0.6,
      jump: -10,
      speed: 5
    };

    this.pipes = [];
    this.pipeWidth = 50;
    this.pipeGap = 150;
    this.pipeSpawnInterval = 90;
    this.frameCount = 0;

    this.score = 0;
    this.gameOver = false;

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.canvas.addEventListener('click', () => this.jump());
    document.addEventListener('keydown', (e) => {
      if (e.code === 'Space') this.jump();
    });
  }

  jump() {
    if (this.gameOver) {
      this.resetGame();
    } else {
      this.bird.velocity = this.bird.jump;
    }
  }

  update() {
    if (this.gameOver) return;

    this.bird.velocity += this.bird.gravity;
    this.bird.y += this.bird.velocity;

    if (this.bird.y + this.bird.height > this.height) {
      this.bird.y = this.height - this.bird.height;
      this.gameOver = true;
    }

    if (this.bird.y < 0) {
      this.bird.y = 0;
    }

    if (this.frameCount % this.pipeSpawnInterval === 0) {
      this.spawnPipe();
    }

    this.pipes.forEach((pipe, index) => {
      pipe.x -= this.bird.speed;

      if (pipe.x + this.pipeWidth < 0) {
        this.pipes.splice(index, 1);
        this.score++;
      }

      if (this.checkCollision(pipe)) {
        this.gameOver = true;
      }
    });

    this.frameCount++;
  }

  spawnPipe() {
    const gapStart = Math.random() * (this.height - this.pipeGap);
    this.pipes.push({
      x: this.width,
      gapStart: gapStart,
      gapEnd: gapStart + this.pipeGap
    });
  }

  checkCollision(pipe) {
    return (
      this.bird.x < pipe.x + this.pipeWidth &&
      this.bird.x + this.bird.width > pipe.x &&
      (this.bird.y < pipe.gapStart || this.bird.y + this.bird.height > pipe.gapEnd)
    );
  }

  draw() {
    this.ctx.fillStyle = '#87CEEB';
    this.ctx.fillRect(0, 0, this.width, this.height);

    this.ctx.fillStyle = '#FFD700';
    this.ctx.fillRect(this.bird.x, this.bird.y, this.bird.width, this.bird.height);

    this.ctx.fillStyle = '#00FF00';
    this.pipes.forEach(pipe => {
      this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.gapStart);
      this.ctx.fillRect(pipe.x, pipe.gapEnd, this.pipeWidth, this.height - pipe.gapEnd);
    });

    this.ctx.fillStyle = '#000000';
    this.ctx.font = '24px Arial';
    this.ctx.fillText(`Score: ${this.score}`, 10, 30);

    if (this.gameOver) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      this.ctx.fillRect(0, 0, this.width, this.height);
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.font = '48px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('Game Over', this.width / 2, this.height / 2 - 50);
      this.ctx.font = '24px Arial';
      this.ctx.fillText(`Final Score: ${this.score}`, this.width / 2, this.height / 2 + 50);
      this.ctx.fillText('Click to Restart', this.width / 2, this.height / 2 + 100);
    }
  }

  resetGame() {
    this.bird.y = this.height / 2;
    this.bird.velocity = 0;
    this.pipes = [];
    this.score = 0;
    this.gameOver = false;
    this.frameCount = 0;
  }

  gameLoop() {
    this.update();
    this.draw();
    requestAnimationFrame(() => this.gameLoop());
  }

  start() {
    this.resetGame();
    this.gameLoop();
  }
}

export default FlappyBirdGame;