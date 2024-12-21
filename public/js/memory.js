class MemoryGame {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.cards = [
      { value: 'A', image: 'https://picsum.photos/id/237/200/300' },
      { value: 'B', image: 'https://picsum.photos/id/238/200/300' },
      { value: 'C', image: 'https://picsum.photos/id/239/200/300' },
      { value: 'D', image: 'https://picsum.photos/id/240/200/300' },
      { value: 'E', image: 'https://picsum.photos/id/241/200/300' },
      { value: 'F', image: 'https://picsum.photos/id/242/200/300' },
      { value: 'G', image: 'https://picsum.photos/id/243/200/300' },
      { value: 'H', image: 'https://picsum.photos/id/244/200/300' },
    ];
    this.cards = [...this.cards, ...this.cards];
    this.shuffleCards();
    
    this.flippedCards = [];
    this.matchedPairs = 0;
    this.moves = 0;

    this.createBoard();
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

    this.cards.forEach((card, index) => {
      const cardElement = document.createElement('div');
      cardElement.classList.add('card');
      cardElement.dataset.cardValue = card.value;
      cardElement.dataset.index = index;

      const cardFront = document.createElement('div');
      cardFront.classList.add('card-face', 'card-front');
      cardFront.textContent = '?';

      const cardBack = document.createElement('div');
      cardBack.classList.add('card-face', 'card-back');
      const img = document.createElement('img');
      img.src = card.image;
      img.alt = card.value;
      cardBack.appendChild(img);

      cardElement.appendChild(cardFront);
      cardElement.appendChild(cardBack);

      cardElement.addEventListener('click', () => this.flipCard(cardElement));
      gameBoard.appendChild(cardElement);
    });

    this.movesDisplay = document.createElement('div');
    this.movesDisplay.textContent = 'Moves: 0';
    this.movesDisplay.style.marginTop = '20px';
    this.movesDisplay.style.fontSize = '18px';

    this.container.appendChild(gameBoard);
    this.container.appendChild(this.movesDisplay);
  }

  flipCard(card) {
    if (this.flippedCards.length < 2 && !this.flippedCards.includes(card) && !card.classList.contains('matched')) {
      card.classList.add('flipped');
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
        card1.classList.remove('flipped');
        card2.classList.remove('flipped');
        this.flippedCards = [];
      }, 1000);
    }
  }

  endGame() {
    this.container.innerHTML = '';
    const endMessage = document.createElement('div');
    endMessage.textContent = `Congratulations! You completed the game in ${this.moves} moves.`;
    endMessage.style.fontSize = '24px';
    endMessage.style.textAlign = 'center';
    endMessage.style.marginTop = '50px';
    this.container.appendChild(endMessage);
  }

  start() {
    // The game starts automatically when the board is created
  }
}

export default MemoryGame;