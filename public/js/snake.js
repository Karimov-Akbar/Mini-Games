class SnakeGame {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.setupGameContainer();
    this.controlType = null; // Will be either 'arrows' or 'buttons'
    this.showControlSelection();
  }

  setupGameContainer() {
    this.container.style.display = 'flex';
    this.container.style.flexDirection = 'column';
    this.container.style.alignItems = 'center';
    this.container.style.gap = '1rem';
    this.container.style.padding = '1rem';
    this.container.style.maxWidth = '100%';
    this.container.style.margin = '0 auto';
  }

  showControlSelection() {
    this.container.innerHTML = '';
    
    const selectionContainer = document.createElement('div');
    selectionContainer.style.textAlign = 'center';
    selectionContainer.style.padding = '2rem';
    selectionContainer.style.backgroundColor = '#ffffff';
    selectionContainer.style.borderRadius = '12px';
    selectionContainer.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    selectionContainer.style.maxWidth = '400px';
    selectionContainer.style.width = '100%';

    const title = document.createElement('h2');
    title.textContent = 'Choose Your Controls';
    title.style.marginBottom = '2rem';
    title.style.color = '#333';
    title.style.fontSize = '1.5rem';

    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.gap = '1rem';
    buttonContainer.style.justifyContent = 'center';
    buttonContainer.style.flexWrap = 'wrap';

    const createChoiceButton = (text, value, icon) => {
      const button = document.createElement('button');
      button.style.display = 'flex';
      button.style.flexDirection = 'column';
      button.style.alignItems = 'center';
      button.style.padding = '1.5rem';
      button.style.backgroundColor = '#4CAF50';
      button.style.color = 'white';
      button.style.border = 'none';
      button.style.borderRadius = '8px';
      button.style.cursor = 'pointer';
      button.style.transition = 'transform 0.2s, background-color 0.2s';
      button.style.width = '150px';

      const iconDiv = document.createElement('div');
      iconDiv.innerHTML = icon;
      iconDiv.style.fontSize = '2rem';
      iconDiv.style.marginBottom = '0.5rem';

      const textDiv = document.createElement('div');
      textDiv.textContent = text;
      textDiv.style.fontSize = '1rem';
      textDiv.style.fontWeight = 'bold';

      button.appendChild(iconDiv);
      button.appendChild(textDiv);

      button.addEventListener('mouseover', () => {
        button.style.backgroundColor = '#45a049';
        button.style.transform = 'translateY(-2px)';
      });

      button.addEventListener('mouseout', () => {
        button.style.backgroundColor = '#4CAF50';
        button.style.transform = 'translateY(0)';
      });

      button.addEventListener('click', () => {
        this.controlType = value;
        this.initializeGame();
      });

      return button;
    };

    const arrowsButton = createChoiceButton(
      'Keyboard Arrows',
      'arrows',
      '⌨️'
    );

    const touchButton = createChoiceButton(
      'Touch Buttons',
      'buttons',
      '👆'
    );

    buttonContainer.appendChild(arrowsButton);
    buttonContainer.appendChild(touchButton);

    selectionContainer.appendChild(title);
    selectionContainer.appendChild(buttonContainer);
    this.container.appendChild(selectionContainer);
  }

  initializeGame() {
    this.container.innerHTML = '';
    this.setupCanvas();
    this.setupScoreDisplay();

    this.size = 20;
    this.width = 20;
    this.height = 20;

    this.snake = [{ x: 10, y: 10 }];
    this.direction = 'right';
    this.food = this.generateFood();
    this.score = 0;
    this.highScore = parseInt(localStorage.getItem('snakeHighScore')) || 0;

    this.gameSpeed = 'ontouchstart' in window ? 150 : 100;
    this.gameLoop = null;

    if (this.controlType === 'arrows') {
      this.setupKeyboardControls();
    } else if (this.controlType === 'buttons') {
      this.setupTouchControls();
    }

    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());
    this.start();
  }

  setupKeyboardControls() {
    // Add keyboard instructions
    const instructions = document.createElement('div');
    instructions.style.textAlign = 'center';
    instructions.style.marginTop = '1rem';
    instructions.style.color = '#666';
    instructions.textContent = 'Use arrow keys to control the snake';
    this.container.appendChild(instructions);

    document.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowUp':
          if (this.direction !== 'down') this.direction = 'up';
          break;
        case 'ArrowDown':
          if (this.direction !== 'up') this.direction = 'down';
          break;
        case 'ArrowLeft':
          if (this.direction !== 'right') this.direction = 'left';
          break;
        case 'ArrowRight':
          if (this.direction !== 'left') this.direction = 'right';
          break;
      }
    });
  }

  setupCanvas() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.style.display = 'block';
    this.canvas.style.backgroundColor = '#ffffff';
    this.canvas.style.borderRadius = '8px';
    this.canvas.style.boxShadow = '0 0 10px rgba(0,0,0,0.1)';
    this.container.appendChild(this.canvas);
    this.canvas.width = this.width * this.size;
    this.canvas.height = this.height * this.size;
  }

  setupScoreDisplay() {
    this.scoreElement = document.createElement('div');
    this.scoreElement.style.fontSize = '1.2rem';
    this.scoreElement.style.fontWeight = 'bold';
    this.scoreElement.style.color = '#333';
    this.scoreElement.style.textAlign = 'center';
    this.scoreElement.style.padding = '0.5rem';
    this.scoreElement.style.width = '100%';
    this.container.appendChild(this.scoreElement);
    this.updateScore();
  }

  setupTouchControls() {
    const touchControls = document.createElement('div');
    touchControls.className = 'touch-controls';
    touchControls.style.display = 'grid';
    touchControls.style.gridTemplateColumns = 'repeat(3, 1fr)';
    touchControls.style.gap = '0.5rem';
    touchControls.style.width = '180px';
    touchControls.style.margin = '1rem auto';

    const buttonStyles = {
      up: { gridColumn: '2', gridRow: '1' },
      left: { gridColumn: '1', gridRow: '2' },
      right: { gridColumn: '3', gridRow: '2' },
      down: { gridColumn: '2', gridRow: '3' }
    };

    ['Up', 'Down', 'Left', 'Right'].forEach(direction => {
      const button = document.createElement('button');
      button.textContent = direction;
      button.style.padding = '0.5rem';
      button.style.backgroundColor = '#4CAF50';
      button.style.color = 'white';
      button.style.border = 'none';
      button.style.borderRadius = '8px';
      button.style.cursor = 'pointer';
      button.style.fontSize = '1rem';
      button.style.fontWeight = 'bold';
      button.style.touchAction = 'manipulation';
      button.style.userSelect = 'none';

      const lowerDirection = direction.toLowerCase();
      if (buttonStyles[lowerDirection]) {
        Object.assign(button.style, buttonStyles[lowerDirection]);
      }

      button.addEventListener('touchstart', (e) => {
        e.preventDefault();
        this.handleTouchControl(direction.toLowerCase());
        button.style.backgroundColor = '#45a049';
      });

      button.addEventListener('touchend', () => {
        button.style.backgroundColor = '#4CAF50';
      });

      // Add mouse support for desktop testing
      button.addEventListener('mousedown', (e) => {
        e.preventDefault();
        this.handleTouchControl(direction.toLowerCase());
        button.style.backgroundColor = '#45a049';
      });

      button.addEventListener('mouseup', () => {
        button.style.backgroundColor = '#4CAF50';
      });

      touchControls.appendChild(button);
    });

    this.container.appendChild(touchControls);
  }

  handleTouchControl(direction) {
    switch (direction) {
      case 'up':
        if (this.direction !== 'down') this.direction = 'up';
        break;
      case 'down':
        if (this.direction !== 'up') this.direction = 'down';
        break;
      case 'left':
        if (this.direction !== 'right') this.direction = 'left';
        break;
      case 'right':
        if (this.direction !== 'left') this.direction = 'right';
        break;
    }
  }

  generateFood() {
    let newFood;
    do {
      newFood = {
        x: Math.floor(Math.random() * this.width),
        y: Math.floor(Math.random() * this.height)
      };
    } while (this.snake.some(part => part.x === newFood.x && part.y === newFood.y));
    return newFood;
  }

  gameStep() {
    this.update();
    this.draw();
  }

  update() {
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

    if (this.checkCollision(head)) {
      this.gameOver();
      return;
    }

    this.snake.unshift(head);

    if (head.x === this.food.x && head.y === this.food.y) {
      this.score++;
      this.updateScore();
      this.food = this.generateFood();
      this.gameSpeed = Math.max(50, this.gameSpeed - 2);
      clearInterval(this.gameLoop);
      this.gameLoop = setInterval(() => this.gameStep(), this.gameSpeed);
    } else {
      this.snake.pop();
    }
  }

  checkCollision(head) {
    return (
      head.x < 0 ||
      head.x >= this.width ||
      head.y < 0 ||
      head.y >= this.height ||
      this.snake.some((part, index) => index > 0 && part.x === head.x && part.y === head.y)
    );
  }

  draw() {
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.strokeStyle = '#f0f0f0';
    this.ctx.lineWidth = 1;

    for (let i = 0; i <= this.width; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(i * this.cellSize, 0);
      this.ctx.lineTo(i * this.cellSize, this.canvas.height);
      this.ctx.stroke();
    }

    for (let i = 0; i <= this.height; i++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, i * this.cellSize);
      this.ctx.lineTo(this.canvas.width, i * this.cellSize);
      this.ctx.stroke();
    }

    this.snake.forEach((part, index) => {
      this.ctx.fillStyle = index === 0 ? '#4CAF50' : '#8BC34A';
      this.ctx.fillRect(
        part.x * this.cellSize + 1,
        part.y * this.cellSize + 1,
        this.cellSize - 2,
        this.cellSize - 2
      );
    });

    this.ctx.fillStyle = '#FF5722';
    this.ctx.fillRect(
      this.food.x * this.cellSize + 1,
      this.food.y * this.cellSize + 1,
      this.cellSize - 2,
      this.cellSize - 2
    );
  }

  updateScore() {
    if (this.score > this.highScore) {
      this.highScore = this.score;
      localStorage.setItem('snakeHighScore', this.highScore);
    }
    this.scoreElement.textContent = `Score: ${this.score} | High Score: ${this.highScore}`;
  }

  gameOver() {
    clearInterval(this.gameLoop);

    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = 'bold 30px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Game Over', this.canvas.width / 2, this.canvas.height / 2 - 15);
    this.ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 25);

    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.gap = '1rem';
    buttonContainer.style.marginTop = '1rem';

    const replayBtn = document.createElement('button');
    replayBtn.textContent = 'Play Again';
    replayBtn.style.padding = '0.75rem 1.5rem';
    replayBtn.style.fontSize = '1.1rem';
    replayBtn.style.backgroundColor = '#4CAF50';
    replayBtn.style.color = '#fff';
    replayBtn.style.border = 'none';
    replayBtn.style.borderRadius = '8px';
    replayBtn.style.cursor = 'pointer';
    replayBtn.style.fontWeight = 'bold';

    const changeControlsBtn = document.createElement('button');
    changeControlsBtn.textContent = 'Change Controls';
    changeControlsBtn.style.padding = '0.75rem 1.5rem';
    changeControlsBtn.style.fontSize = '1.1rem';
    changeControlsBtn.style.backgroundColor = '#2196F3';
    changeControlsBtn.style.color = '#fff';
    changeControlsBtn.style.border = 'none';
    changeControlsBtn.style.borderRadius = '8px';
    changeControlsBtn.style.cursor = 'pointer';
    changeControlsBtn.style.fontWeight = 'bold';

    const buttonHoverEffect = (btn, originalColor) => {
      btn.addEventListener('mouseover', () => {
        btn.style.backgroundColor = originalColor === '#4CAF50' ? '#45a049' : '#1976D2';
        btn.style.transform = 'translateY(-2px)';
      });

      btn.addEventListener('mouseout', () => {
        btn.style.backgroundColor = originalColor;
        btn.style.transform = 'translateY(0)';
      });
    };

    buttonHoverEffect(replayBtn, '#4CAF50');
    buttonHoverEffect(changeControlsBtn, '#2196F3');

    replayBtn.addEventListener('click', () => this.start());
    changeControlsBtn.addEventListener('click', () => this.showControlSelection());

    buttonContainer.appendChild(replayBtn);
    buttonContainer.appendChild(changeControlsBtn);
    this.container.appendChild(buttonContainer);
  }

  resizeCanvas() {
    const maxSize = Math.min(
      this.container.clientWidth - 40,
      window.innerHeight - 200
    );

    const size = Math.floor(maxSize / this.width);
    this.canvas.width = this.width * size;
    this.canvas.height = this.height * size;

    this.cellSize = size;

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.draw();
  }

  start() {
    this.snake = [{ x: 10, y: 10 }];
    this.direction = 'right';
    this.food = this.generateFood();
    this.score = 0;
    this.updateScore();
    this.gameSpeed = 'ontouchstart' in window ? 150 : 100;

    clearInterval(this.gameLoop);

    const buttonContainer = this.container.querySelector('div[style*="display: flex"]');
    if (buttonContainer && buttonContainer.parentNode === this.container) {
      this.container.removeChild(buttonContainer);
    }

    this.gameLoop = setInterval(() => this.gameStep(), this.gameSpeed);
  }
}

export default SnakeGame;