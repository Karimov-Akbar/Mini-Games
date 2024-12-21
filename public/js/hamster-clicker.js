class HamsterClickerGame {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.clicks = 0;
    this.createGameElements();
    this.setupEventListeners();
    this.updateGame();
  }

  createGameElements() {
    this.container.innerHTML = `
      <div class="hamster-clicker">
        <h2>Hamster Clicker</h2>
        <div class="hamster-container">
          <img src="https://wallpapers.com/images/high/funny-hamster-png-qgy-g3ki6zffiekmvi3m.png" alt="Hamster" class="hamster-image">
        </div>
        <div class="stats">
          <p>Clicks: <span id="click-count">0</span></p>
        </div>
      </div>
    `;

    this.clickCount = document.getElementById('click-count');
  }

  setupEventListeners() {
    const hamsterImage = this.container.querySelector('.hamster-image');
    hamsterImage.addEventListener('click', () => this.clickHamster());
  }

  clickHamster() {
    this.clicks++;
    this.updateGame();
  }

  updateGame() {
    this.clickCount.textContent = this.clicks;
  }

  start() {
    
  }
}

export default HamsterClickerGame;