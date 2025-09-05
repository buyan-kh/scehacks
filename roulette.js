// Roulette Wheel Game
class RouletteWheel {
  constructor() {
    this.canvas = document.getElementById('wheel-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.spinBtn = document.getElementById('spin-btn');
    this.resultSection = document.getElementById('result-section');
    this.resultText = document.getElementById('result-text');
    this.resultDescription = document.getElementById('result-description');
    this.closeBtn = document.getElementById('close-btn');
    this.betInfo = document.getElementById('bet-info');
    
    this.betAmount = 0;
    this.totalAmount = 0;
    this.winPercentage = 0;
    this.isSpinning = false;
    
    this.initializeFromURL();
    this.drawWheel();
    this.bindEvents();
  }

  initializeFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    this.betAmount = parseFloat(urlParams.get('betAmount')) || 0;
    this.totalAmount = parseFloat(urlParams.get('totalAmount')) || 100;
    this.winPercentage = (this.betAmount / this.totalAmount) * 100;
    
    this.betInfo.textContent = `Your bet: $${this.betAmount.toFixed(2)} of $${this.totalAmount.toFixed(2)} (${this.winPercentage.toFixed(1)}% chance to win)`;
  }

  drawWheel() {
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    const radius = 140;
    
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Calculate angles
    const winAngle = (this.winPercentage / 100) * 2 * Math.PI;
    const loseAngle = 2 * Math.PI - winAngle;
    
    // Draw losing section (red)
    this.ctx.beginPath();
    this.ctx.moveTo(centerX, centerY);
    this.ctx.arc(centerX, centerY, radius, 0, loseAngle);
    this.ctx.closePath();
    this.ctx.fillStyle = '#f44336';
    this.ctx.fill();
    this.ctx.strokeStyle = '#333';
    this.ctx.lineWidth = 3;
    this.ctx.stroke();
    
    // Draw winning section (green)
    this.ctx.beginPath();
    this.ctx.moveTo(centerX, centerY);
    this.ctx.arc(centerX, centerY, radius, loseAngle, 2 * Math.PI);
    this.ctx.closePath();
    this.ctx.fillStyle = '#4caf50';
    this.ctx.fill();
    this.ctx.strokeStyle = '#333';
    this.ctx.lineWidth = 3;
    this.ctx.stroke();
    
    // Draw center circle
    this.ctx.beginPath();
    this.ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI);
    this.ctx.fillStyle = '#333';
    this.ctx.fill();
    this.ctx.strokeStyle = '#ffd700';
    this.ctx.lineWidth = 3;
    this.ctx.stroke();
    
    // Add text labels
    this.ctx.fillStyle = 'white';
    this.ctx.font = 'bold 16px Arial';
    this.ctx.textAlign = 'center';
    
    // Win text
    if (this.winPercentage > 5) {
      const winTextAngle = loseAngle + (winAngle / 2);
      const winTextX = centerX + Math.cos(winTextAngle) * (radius * 0.7);
      const winTextY = centerY + Math.sin(winTextAngle) * (radius * 0.7);
      this.ctx.fillText('WIN', winTextX, winTextY);
    }
    
    // Lose text
    const loseTextAngle = loseAngle / 2;
    const loseTextX = centerX + Math.cos(loseTextAngle) * (radius * 0.7);
    const loseTextY = centerY + Math.sin(loseTextAngle) * (radius * 0.7);
    this.ctx.fillText('LOSE', loseTextX, loseTextY);
  }

  bindEvents() {
    this.spinBtn.addEventListener('click', () => this.spin());
    this.closeBtn.addEventListener('click', () => this.close());
  }

  spin() {
    if (this.isSpinning) return;
    
    this.isSpinning = true;
    this.spinBtn.disabled = true;
    this.spinBtn.textContent = 'SPINNING...';
    
    // Random spin amount (multiple rotations + final position)
    const minSpins = 5;
    const maxSpins = 10;
    const spins = Math.random() * (maxSpins - minSpins) + minSpins;
    
    // Determine if player wins (based on their win percentage)
    const isWinner = Math.random() * 100 < this.winPercentage;
    
    // Calculate final angle
    const winAngle = (this.winPercentage / 100) * 2 * Math.PI;
    const loseAngle = 2 * Math.PI - winAngle;
    
    let finalAngle;
    if (isWinner) {
      // Land in green (winning) section - first part of circle
      finalAngle = Math.random() * winAngle;
    } else {
      // Land in red (losing) section - second part of circle
      finalAngle = winAngle + (Math.random() * loseAngle);
    }
    
    const totalRotation = (spins * 2 * Math.PI) + finalAngle;
    const degrees = (totalRotation * 180 / Math.PI);
    
    // Apply rotation
    this.canvas.style.transform = `rotate(${degrees}deg)`;
    
    // Show result after animation
    setTimeout(() => {
      this.showResult(isWinner);
      this.isSpinning = false;
      this.spinBtn.disabled = false;
      this.spinBtn.textContent = '🎯 Play Again';
      this.spinBtn.onclick = () => this.playAgain();
    }, 3000);
  }

  showResult(isWinner) {
    const resultDisplay = document.querySelector('.result-display');
    
    if (isWinner) {
      this.resultText.textContent = '🎉 YOU WON!';
      this.resultDescription.textContent = `Congratulations! You won $${this.betAmount.toFixed(2)}!`;
      resultDisplay.className = 'result-display win';
    } else {
      this.resultText.textContent = '😞 YOU LOST';
      this.resultDescription.textContent = `Better luck next time! You lost $${this.betAmount.toFixed(2)}.`;
      resultDisplay.className = 'result-display lose';
    }
    
    this.resultSection.style.display = 'block';
  }

  close() {
    // Send message to parent window to close roulette
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'CLOSE_ROULETTE'
      }, '*');
    }
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
  window.rouletteWheel = new RouletteWheel();
});