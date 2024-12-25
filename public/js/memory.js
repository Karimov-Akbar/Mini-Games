class MemoryGame {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.setupGameContainer();
    this.cards = [
      { value: 'A', image: 'https://picsum.photos/id/237/200/300' },
      { value: 'B', image: 'https://picsum.photos/id/238/200/300' },
      { value: 'C', image: 'https://picsum.photos/id/239/200/300' },
      { value: 'D', image: 'https://picsum.photos/id/240/200/300' },
    ];
    this.cards = [...this.cards, ...this.cards];
    this.shuffleCards();
    
    this.flippedCards = [];
    this.matchedPairs = 0;
    this.moves = 0;

    this.createBoard();
  }

  setupGameContainer() {
    this.container.style.display = 'flex';
    this.container.style.flexDirection = 'column';
    this.container.style.alignItems = 'center';
    this.container.style.padding = '0.5rem';
    this.container.style.width = '100%';
    this.container.style.maxWidth = '400px';
    this.container.style.margin = '0 auto';
    this.container.style.backgroundColor = '#f8f9fa';
    this.container.style.borderRadius = '12px';
    this.container.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    this.container.style.boxSizing = 'border-box';
  }

  shuffleCards() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  createBoard() {
    const gameBoard = document.createElement('div');
    gameBoard.classList.add('memory-game');
    gameBoard.style.display = 'grid';
    gameBoard.style.gridTemplateColumns = 'repeat(2, 1fr)';
    gameBoard.style.gap = '8px';
    gameBoard.style.width = '100%';
    gameBoard.style.maxWidth = '100%';
    gameBoard.style.padding = '8px';
    gameBoard.style.boxSizing = 'border-box';

    this.cards.forEach((card, index) => {
      const cardElement = document.createElement('div');
      cardElement.classList.add('card');
      cardElement.dataset.cardValue = card.value;
      cardElement.dataset.index = index;

      // Card styling
      cardElement.style.position = 'relative';
      cardElement.style.width = '100%';
      cardElement.style.aspectRatio = '3/4';
      cardElement.style.cursor = 'pointer';
      cardElement.style.transformStyle = 'preserve-3d';
      cardElement.style.transition = 'transform 0.5s';

      const cardFront = document.createElement('div');
      cardFront.classList.add('card-face', 'card-front');
      cardFront.textContent = '?';
      
      // Front face styling
      cardFront.style.position = 'absolute';
      cardFront.style.width = '100%';
      cardFront.style.height = '100%';
      cardFront.style.backfaceVisibility = 'hidden';
      cardFront.style.display = 'flex';
      cardFront.style.justifyContent = 'center';
      cardFront.style.alignItems = 'center';
      cardFront.style.fontSize = '1.5rem';
      cardFront.style.fontWeight = 'bold';
      cardFront.style.backgroundColor = '#6c5ce7';
      cardFront.style.color = 'white';
      cardFront.style.borderRadius = '8px';
      cardFront.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';

      const cardBack = document.createElement('div');
      cardBack.classList.add('card-face', 'card-back');
      
      // Back face styling
      cardBack.style.position = 'absolute';
      cardBack.style.width = '100%';
      cardBack.style.height = '100%';
      cardBack.style.backfaceVisibility = 'hidden';
      cardBack.style.transform = 'rotateY(180deg)';
      cardBack.style.backgroundColor = 'white';
      cardBack.style.borderRadius = '8px';
      cardBack.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.2)';
      cardBack.style.overflow = 'hidden';

      const img = document.createElement('img');
      img.src = card.image;
      img.alt = card.value;
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'cover';
      
      cardBack.appendChild(img);
      cardElement.appendChild(cardFront);
      cardElement.appendChild(cardBack);

      cardElement.addEventListener('click', () => this.flipCard(cardElement));
      gameBoard.appendChild(cardElement);
    });

    this.movesDisplay = document.createElement('div');
    this.movesDisplay.textContent = 'Moves: 0';
    this.movesDisplay.style.marginTop = '12px';
    this.movesDisplay.style.fontSize = '1rem';
    this.movesDisplay.style.fontWeight = 'bold';
    this.movesDisplay.style.color = '#2d3436';

    this.container.appendChild(gameBoard);
    this.container.appendChild(this.movesDisplay);
  }

  flipCard(card) {
    if (this.flippedCards.length < 2 && !this.flippedCards.includes(card) && !card.classList.contains('matched')) {
      card.style.transform = 'rotateY(180deg)';
      this.flippedCards.push(card);

      if (this.flippedCards.length === 2) {
        this.moves++;
        this.movesDisplay.textContent = `Moves: ${this.moves}`;
        this.checkForMatch();
      }
    }
  }

  checkForMatch() {
    const [card1, card2] = this.flippedCards;
    if (card1.dataset.cardValue === card2.dataset.cardValue) {
      card1.classList.add('matched');
      card2.classList.add('matched');
      this.matchedPairs++;
      this.flippedCards = [];

      if (this.matchedPairs === this.cards.length / 2) {
        setTimeout(() => this.endGame(), 500);
      }
    } else {
      setTimeout(() => {
        card1.style.transform = 'rotateY(0deg)';
        card2.style.transform = 'rotateY(0deg)';
        this.flippedCards = [];
      }, 1000);
    }
  }

  endGame() {
    this.container.innerHTML = '';
    const endMessage = document.createElement('div');
    endMessage.style.textAlign = 'center';
    endMessage.style.padding = '1.5rem';
    endMessage.style.width = '100%';
    endMessage.style.maxWidth = '300px';

    const title = document.createElement('h2');
    title.textContent = 'Congratulations!';
    title.style.fontSize = '1.5rem';
    title.style.color = '#2d3436';
    title.style.marginBottom = '1rem';

    const stats = document.createElement('p');
    stats.textContent = `You completed the game in ${this.moves} moves.`;
    stats.style.fontSize = '1rem';
    stats.style.marginBottom = '1.5rem';

    const playAgainBtn = document.createElement('button');
    playAgainBtn.textContent = 'Play Again';
    playAgainBtn.style.padding = '0.75rem 1.5rem';
    playAgainBtn.style.fontSize = '1rem';
    playAgainBtn.style.backgroundColor = '#6c5ce7';
    playAgainBtn.style.color = 'white';
    playAgainBtn.style.border = 'none';
    playAgainBtn.style.borderRadius = '8px';
    playAgainBtn.style.cursor = 'pointer';
    playAgainBtn.style.transition = 'all 0.3s ease';

    playAgainBtn.addEventListener('mouseover', () => {
      playAgainBtn.style.backgroundColor = '#5f4dd1';
      playAgainBtn.style.transform = 'translateY(-2px)';
    });

    playAgainBtn.addEventListener('mouseout', () => {
      playAgainBtn.style.backgroundColor = '#6c5ce7';
      playAgainBtn.style.transform = 'translateY(0)';
    });

    playAgainBtn.addEventListener('click', () => {
      this.container.innerHTML = '';
      this.flippedCards = [];
      this.matchedPairs = 0;
      this.moves = 0;
      this.shuffleCards();
      this.createBoard();
    });

    endMessage.appendChild(title);
    endMessage.appendChild(stats);
    endMessage.appendChild(playAgainBtn);
    this.container.appendChild(endMessage);
  }

  start() {
    // The game starts automatically when the board is created
  }
}

export default MemoryGame;

