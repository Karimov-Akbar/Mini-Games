class BilliardsGame {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.container.appendChild(this.canvas);

    this.width = 800;
    this.height = 400;
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    this.balls = [];
    this.pockets = [];
    this.cue = { x: 0, y: 0, angle: 0, power: 0 };
    this.gameState = 'aiming'; // 'aiming', 'charging', 'shooting', 'gameover'
    this.currentPlayer = 1; // 1 or 2
    this.playerTypes = { 1: '', 2: '' }; // 'solid', 'stripe', or ''
    this.message = '';

    this.setupGame();
    this.setupEventListeners();
  }

  setupGame() {
    const colors = [
      '#ffff00', '#0000ff', '#ff0000', '#800080', '#ffa500', '#008000', '#8b4513', '#000000',
      '#ffff00', '#0000ff', '#ff0000', '#800080', '#ffa500', '#008000', '#8b4513'
    ];
    
    // Create balls
    this.balls = [
      { x: 200, y: 200, radius: 10, color: '#ffffff', vx: 0, vy: 0, number: 0, type: 'cue' }, // Cue ball
    ];

    // Rack the other balls
    const startX = 600;
    const startY = 200;
    const rowSpacing = Math.sqrt(3) * 10;
    let ballIndex = 0;

    for (let row = 0; row < 5; row++) {
      for (let col = 0; col <= row; col++) {
        const x = startX + row * 20;
        const y = startY + (col - row / 2) * rowSpacing;
        const number = ballIndex + 1;
        const type = number < 8 ? 'solid' : (number > 8 ? 'stripe' : 'eight');
        this.balls.push({
          x, y, radius: 10, color: colors[ballIndex], vx: 0, vy: 0, number, type
        });
        ballIndex++;
      }
    }

    // Create pockets
    this.pockets = [
      { x: 0, y: 0 },
      { x: this.width / 2, y: 0 },
      { x: this.width, y: 0 },
      { x: 0, y: this.height },
      { x: this.width / 2, y: this.height },
      { x: this.width, y: this.height },
    ];
  }

  setupEventListeners() {
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('mousedown', () => this.handleMouseDown());
    this.canvas.addEventListener('mouseup', () => this.handleMouseUp());
  }

  handleMouseMove(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (this.gameState === 'aiming') {
      this.cue.x = x;
      this.cue.y = y;
      this.cue.angle = Math.atan2(y - this.balls[0].y, x - this.balls[0].x);
    }
  }

  handleMouseDown() {
    if (this.gameState === 'aiming') {
      this.gameState = 'charging';
      this.cue.power = 0;
    }
  }

  handleMouseUp() {
    if (this.gameState === 'charging') {
      this.gameState = 'shooting';
      this.shootCueBall();
    }
  }

  shootCueBall() {
    const power = Math.min(this.cue.power, 20);
    this.balls[0].vx = Math.cos(this.cue.angle) * power;
    this.balls[0].vy = Math.sin(this.cue.angle) * power;
  }

  update() {
    if (this.gameState === 'charging') {
      this.cue.power += 0.5;
    }

    if (this.gameState === 'shooting') {
      let allStopped = true;
      for (let ball of this.balls) {
        ball.x += ball.vx;
        ball.y += ball.vy;
        ball.vx *= 0.99;
        ball.vy *= 0.99;

        // Wall collisions
        if (ball.x - ball.radius < 0 || ball.x + ball.radius > this.width) {
          ball.vx *= -1;
        }
        if (ball.y - ball.radius < 0 || ball.y + ball.radius > this.height) {
          ball.vy *= -1;
        }

        // Check if the ball is still moving
        if (Math.abs(ball.vx) > 0.1 || Math.abs(ball.vy) > 0.1) {
          allStopped = false;
        }
      }

      // Ball-ball collisions
      for (let i = 0; i < this.balls.length; i++) {
        for (let j = i + 1; j < this.balls.length; j++) {
          this.checkCollision(this.balls[i], this.balls[j]);
        }
      }

      // Check for pocketed balls
      const pocketedBalls = this.balls.filter(ball => this.isPocketed(ball));
      this.balls = this.balls.filter(ball => !this.isPocketed(ball));

      if (pocketedBalls.length > 0) {
        this.handlePocketedBalls(pocketedBalls);
      }

      if (allStopped) {
        this.gameState = 'aiming';
        this.switchPlayer();
      }
    }

    // Check for game over
    if (this.balls.every(ball => ball.type !== 'eight') || !this.balls.some(ball => ball.type === 'cue')) {
      this.gameState = 'gameover';
    }
  }

  handlePocketedBalls(pocketedBalls) {
    let validPocket = false;
    let pocketedEight = false;

    for (let ball of pocketedBalls) {
      if (ball.type === 'cue') {
        this.balls.unshift({ ...ball, x: 200, y: 200, vx: 0, vy: 0 });
      } else if (ball.type === 'eight') {
        pocketedEight = true;
      } else {
        if (this.playerTypes[this.currentPlayer] === '') {
          this.playerTypes[this.currentPlayer] = ball.type;
          this.playerTypes[this.currentPlayer === 1 ? 2 : 1] = ball.type === 'solid' ? 'stripe' : 'solid';
        }
        if (ball.type === this.playerTypes[this.currentPlayer]) {
          validPocket = true;
        }
      }
    }

    if (pocketedEight) {
      if (this.balls.some(ball => ball.type === this.playerTypes[this.currentPlayer])) {
        this.message = `Player ${this.currentPlayer} loses! Pocketed the 8-ball too early.`;
        this.gameState = 'gameover';
      } else {
        this.message = `Player ${this.currentPlayer} wins!`;
        this.gameState = 'gameover';
      }
    } else if (!validPocket) {
      this.switchPlayer();
    }
  }

  switchPlayer() {
    this.currentPlayer = this.currentPlayer === 1 ? 2 : 1;
    this.message = `Player ${this.currentPlayer}'s turn`;
  }

  checkCollision(ball1, ball2) {
    const dx = ball2.x - ball1.x;
    const dy = ball2.y - ball1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < ball1.radius + ball2.radius) {
      const angle = Math.atan2(dy, dx);
      const sin = Math.sin(angle);
      const cos = Math.cos(angle);

      // Rotate ball velocities
      const vx1 = ball1.vx * cos + ball1.vy * sin;
      const vy1 = ball1.vy * cos - ball1.vx * sin;
      const vx2 = ball2.vx * cos + ball2.vy * sin;
      const vy2 = ball2.vy * cos - ball2.vx * sin;

      // Swap ball velocities
      ball1.vx = vx2 * cos - vy1 * sin;
      ball1.vy = vy1 * cos + vx2 * sin;
      ball2.vx = vx1 * cos - vy2 * sin;
      ball2.vy = vy2 * cos + vx1 * sin;

      // Move balls apart
      const overlap = (ball1.radius + ball2.radius - distance) / 2;
      ball1.x -= overlap * cos;
      ball1.y -= overlap * sin;
      ball2.x += overlap * cos;
      ball2.y += overlap * sin;
    }
  }

  isPocketed(ball) {
    for (let pocket of this.pockets) {
      const dx = ball.x - pocket.x;
      const dy = ball.y - pocket.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 20) {
        return true;
      }
    }
    return false;
  }

  draw() {
    // Clear canvas
    this.ctx.fillStyle = '#0a5c36';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw pockets
    this.ctx.fillStyle = '#000000';
    for (let pocket of this.pockets) {
      this.ctx.beginPath();
      this.ctx.arc(pocket.x, pocket.y, 20, 0, Math.PI * 2);
      this.ctx.fill();
    }

    // Draw balls
    for (let ball of this.balls) {
      this.ctx.fillStyle = ball.color;
      this.ctx.beginPath();
      this.ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      this.ctx.fill();

      // Draw number on ball
      if (ball.number > 0) {
        this.ctx.fillStyle = ball.number === 8 ? '#ffffff' : (ball.type === 'stripe' ? '#000000' : '#ffffff');
        this.ctx.font = '10px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(ball.number.toString(), ball.x, ball.y);
      }
    }

    // Draw cue
    if (this.gameState === 'aiming' || this.gameState === 'charging') {
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(this.balls[0].x, this.balls[0].y);
      this.ctx.lineTo(this.cue.x, this.cue.y);
      this.ctx.stroke();

      // Draw power meter
      if (this.gameState === 'charging') {
        this.ctx.fillStyle = '#ff0000';
        this.ctx.fillRect(10, 10, this.cue.power * 5, 10);
      }
    }

    // Draw message
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '20px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(this.message, this.width / 2, 30);

    // Draw player types
    this.ctx.font = '16px Arial';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`Player 1: ${this.playerTypes[1]}`, 10, this.height - 40);
    this.ctx.fillText(`Player 2: ${this.playerTypes[2]}`, 10, this.height - 20);

    // Draw game over message
    if (this.gameState === 'gameover') {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      this.ctx.fillRect(0, 0, this.width, this.height);
      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '48px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('Game Over!', this.width / 2, this.height / 2 - 50);
      this.ctx.font = '24px Arial';
      this.ctx.fillText(this.message, this.width / 2, this.height / 2 + 50);
    }
  }

  gameLoop() {
    this.update();
    this.draw();
    if (this.gameState !== 'gameover') {
      requestAnimationFrame(() => this.gameLoop());
    }
  }

  start() {
    this.message = "Player 1's turn";
    this.gameLoop();
  }
}

export default BilliardsGame;