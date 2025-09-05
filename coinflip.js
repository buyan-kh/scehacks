// Coinflip Animation Game
class CoinflipGame {
  constructor() {
    this.coin = document.getElementById('coin');
    this.flipBtn = document.getElementById('flip-btn');
    this.resultSection = document.getElementById('result-section');
    this.resultText = document.getElementById('result-text');
    this.resultDescription = document.getElementById('result-description');
    this.coinResult = document.getElementById('coin-result');
    this.playAgainBtn = document.getElementById('play-again-btn');
    this.betInfo = document.getElementById('bet-info');
    
    this.betAmount = 0;
    this.userChoice = '';
    this.isFlipping = false;
    
    this.initializeFromURL();
    this.bindEvents();
  }

  initializeFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    this.betAmount = parseFloat(urlParams.get('betAmount')) || 0;
    this.userChoice = urlParams.get('choice') || 'heads';
    
    this.betInfo.textContent = `Your bet: $${this.betAmount.toFixed(2)} on ${this.userChoice.charAt(0).toUpperCase() + this.userChoice.slice(1)}`;
  }

  bindEvents() {
    this.flipBtn.addEventListener('click', () => this.flipCoin());
    this.playAgainBtn.addEventListener('click', () => this.playAgain());
  }

  flipCoin() {
    if (this.isFlipping) return;
    
    this.isFlipping = true;
    this.flipBtn.disabled = true;
    this.flipBtn.textContent = 'FLIPPING...';
    
    // Add flipping animation
    this.coin.classList.add('flipping');
    
    // Determine result (50/50 chance)
    const coinResult = Math.random() < 0.5 ? 'heads' : 'tails';
    const isWinner = coinResult === this.userChoice;
    
    // Show result after animation completes
    setTimeout(() => {
      this.coin.classList.remove('flipping');
      
      // Show the result side of the coin
      if (coinResult === 'heads') {
        this.coin.classList.add('show-heads');
        this.coin.classList.remove('show-tails');
      } else {
        this.coin.classList.add('show-tails');
        this.coin.classList.remove('show-heads');
      }
      
      // Show result after a brief pause
      setTimeout(() => {
        this.showResult(coinResult, isWinner);
        this.isFlipping = false;
        this.flipBtn.disabled = false;
        this.flipBtn.textContent = '🎯 FLIP AGAIN';
      }, 500);
      
    }, 2000); // Animation duration
  }

  showResult(coinResult, isWinner) {
    const resultDisplay = document.querySelector('.result-display');
    
    // Debug logging
    console.log('Coinflip Debug:', {
      coinResult: coinResult,
      userChoice: this.userChoice,
      isWinner: isWinner,
      match: coinResult === this.userChoice
    });
    
    // Set coin result emoji
    this.coinResult.textContent = coinResult === 'heads' ? '👑' : '🔄';
    
    if (isWinner) {
      this.resultText.textContent = '🎉 YOU WON!';
      this.resultDescription.textContent = `The coin landed on ${coinResult}! You won $${this.betAmount.toFixed(2)}!`;
      resultDisplay.className = 'result-display win';
    } else {
      this.resultText.textContent = '😞 YOU LOST';
      this.resultDescription.textContent = `The coin landed on ${coinResult}. You chose ${this.userChoice}. Better luck next time!`;
      resultDisplay.className = 'result-display lose';
    }
    
    this.resultSection.style.display = 'block';
  }

  playAgain() {
    // Send message to parent window to go back to main popup
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'PLAY_AGAIN'
      }, '*');
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.coinflipGame = new CoinflipGame();
});
