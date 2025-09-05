// Degen Pay Extension - The Ultimate Checkout Experience
class DegenPayExtension {
  constructor() {
    this.initializeElements();
    this.bindEvents();
    this.loadData();
    this.loadSubtotalFromURL();
  }

  initializeElements() {
    // Add your element selectors here as you build
    this.contentArea = document.querySelector(".content-area");
    this.subtotalDisplay = document.getElementById("subtotal-display");
    this.betInput = document.getElementById("bet-amount");
    this.betValidation = document.getElementById("bet-validation");
    this.placeBetBtn = document.getElementById("place-bet-btn");
    this.paymentInfoSection = document.getElementById("payment-info-section");
    this.paymentInfoDisplay = document.getElementById("payment-info-display");
    this.customInput = document.getElementById("custom-input");
    this.coinflipChoice = document.getElementById("coinflip-choice");
    this.maxBetAmount = 0;
    this.selectedBetOption = null;
    this.selectedCoinChoice = null;
  }

  bindEvents() {
    // Add your event listeners here as you build
    console.log("Degen Pay Extension initialized!");
    
    // Bet input validation
    if (this.betInput) {
      this.betInput.addEventListener('input', () => this.validateBetAmount());
      this.betInput.addEventListener('blur', () => this.validateBetAmount());
    }
    
    // Bet option buttons
    const betOptionButtons = document.querySelectorAll('.bet-option-btn');
    betOptionButtons.forEach(btn => {
      btn.addEventListener('click', (e) => this.handleBetOption(e.target.dataset.option));
    });
    
    // Coinflip choice buttons
    const coinflipButtons = document.querySelectorAll('.coinflip-btn');
    coinflipButtons.forEach(btn => {
      btn.addEventListener('click', (e) => this.handleCoinflipChoice(e.target.dataset.choice));
    });
    
    // Place bet button
    if (this.placeBetBtn) {
      this.placeBetBtn.addEventListener('click', () => this.placeBet());
    }
  }

  loadData() {
    // Load any saved data from Chrome storage
    chrome.storage.local.get(["degenPayData"], (result) => {
      if (result.degenPayData) {
        console.log("Loaded data:", result.degenPayData);
      }
    });
  }

  saveData(data) {
    // Save data to Chrome storage
    chrome.storage.local.set({ degenPayData: data });
  }

  // Utility methods for future use
  showMessage(message, type = "info") {
    console.log(`${type.toUpperCase()}: ${message}`);
    // You can add UI notifications here later
  }

  createElement(tag, className, textContent) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (textContent) element.textContent = textContent;
    return element;
  }

  loadSubtotalFromURL() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const subtotal = urlParams.get('subtotal');
      const raw = urlParams.get('raw');
      const numeric = urlParams.get('numeric');
      const paymentSubmitted = urlParams.get('paymentSubmitted');
      const cardNumber = urlParams.get('cardNumber');
      const cardholderName = urlParams.get('cardholderName');
      const email = urlParams.get('email');

      if (subtotal && this.subtotalDisplay) {
        this.displaySubtotal({
          amount: subtotal,
          raw: raw || `$${subtotal}`,
          numeric: numeric ? parseFloat(numeric) : parseFloat(subtotal)
        });
      } else {
        this.displayNoSubtotal();
      }
      
      // Display payment information if available
      if (paymentSubmitted === 'true') {
        this.displayPaymentInfo({
          cardNumber: cardNumber,
          cardholderName: cardholderName,
          email: email
        });
      }
    } catch (error) {
      console.error('Error loading data from URL:', error);
      this.displayNoSubtotal();
    }
  }

  displaySubtotal(subtotalData) {
    if (!this.subtotalDisplay) return;

    this.maxBetAmount = subtotalData.numeric;
    
    this.subtotalDisplay.innerHTML = `
      <div class="subtotal-info">
        <div class="subtotal-amount">$${subtotalData.amount}</div>
        <div class="subtotal-status success">✅ Total loaded</div>
      </div>
    `;
    
    // Enable bet input and set max value
    if (this.betInput) {
      this.betInput.disabled = false;
      this.betInput.max = this.maxBetAmount;
      this.betInput.placeholder = "0.00";
    }
    
    // Enable bet option buttons
    const betOptionButtons = document.querySelectorAll('.bet-option-btn');
    betOptionButtons.forEach(btn => {
      btn.disabled = false;
    });
    
    // Update validation message
    this.showBetValidation(`Choose a betting option above`, 'info');
  }

  displayNoSubtotal() {
    if (!this.subtotalDisplay) return;

    this.subtotalDisplay.innerHTML = `
      <div class="subtotal-info">
        <div class="subtotal-amount">No subtotal found</div>
        <div class="subtotal-details">
          <p>Could not find a subtotal on this page.</p>
          <p>Make sure you're on a checkout or cart page with a subtotal.</p>
        </div>
        <div class="subtotal-status error">❌ No subtotal detected</div>
      </div>
    `;
    
    // Keep bet input disabled if no subtotal
    if (this.betInput) {
      this.betInput.disabled = true;
      this.betInput.placeholder = "No subtotal found";
    }
    
    this.showBetValidation("Cannot place bet without a valid subtotal", 'error');
  }

  displayPaymentInfo(paymentData) {
    if (!this.paymentInfoDisplay || !this.paymentInfoSection) return;
    
    // Show the payment info section
    this.paymentInfoSection.style.display = 'block';
    
    // Mask the card number for security
    const maskedCardNumber = paymentData.cardNumber ? 
      '**** **** **** ' + paymentData.cardNumber.slice(-4) : 'N/A';
    
    this.paymentInfoDisplay.innerHTML = `
      <div class="payment-info">
        <div class="payment-details">
          <p><strong>Card:</strong> ${maskedCardNumber}</p>
          <p><strong>Name:</strong> ${paymentData.cardholderName || 'N/A'}</p>
          <p><strong>Email:</strong> ${paymentData.email || 'N/A'}</p>
        </div>
        <div class="payment-status success">✅ Payment information verified</div>
      </div>
    `;
  }

  validateBetAmount() {
    if (!this.betInput || !this.betValidation) return;
    
    const betAmount = parseFloat(this.betInput.value);
    
    if (isNaN(betAmount) || betAmount <= 0) {
      this.showBetValidation("Please enter a valid bet amount", 'error');
      this.placeBetBtn.disabled = true;
      return false;
    }
    
    if (betAmount > this.maxBetAmount) {
      this.showBetValidation(`Bet amount cannot exceed $${this.maxBetAmount.toFixed(2)}`, 'error');
      this.placeBetBtn.disabled = true;
      return false;
    }
    
    if (betAmount < 0.01) {
      this.showBetValidation("Minimum bet amount is $0.01", 'error');
      this.placeBetBtn.disabled = true;
      return false;
    }
    
    this.showBetValidation(`Valid bet: $${betAmount.toFixed(2)}`, 'success');
    this.placeBetBtn.disabled = false;
    return true;
  }

  showBetValidation(message, type) {
    if (!this.betValidation) return;
    
    this.betValidation.textContent = message;
    this.betValidation.className = `bet-validation ${type}`;
  }

  handleBetOption(option) {
    // Remove active class from all buttons
    const allButtons = document.querySelectorAll('.bet-option-btn');
    allButtons.forEach(btn => btn.classList.remove('active'));
    
    // Add active class to selected button
    const selectedButton = document.querySelector(`[data-option="${option}"]`);
    if (selectedButton) {
      selectedButton.classList.add('active');
    }
    
    this.selectedBetOption = option;
    
    // Hide all input sections first
    this.customInput.style.display = 'none';
    this.coinflipChoice.style.display = 'none';
    
    // Show appropriate input section and calculate bet
    switch (option) {
      case '25':
        this.setBetAmount(this.maxBetAmount * 0.25);
        this.validateBetAmount();
        break;
      case '50':
        this.setBetAmount(this.maxBetAmount * 0.50);
        this.validateBetAmount();
        break;
      case 'custom':
        this.customInput.style.display = 'block';
        if (this.betInput) {
          this.betInput.focus();
        }
        this.showBetValidation('Enter your custom bet amount', 'info');
        break;
      case 'coinflip':
        this.setBetAmount(this.maxBetAmount * 0.50); // 50% for coinflip
        this.coinflipChoice.style.display = 'block';
        this.showBetValidation('Choose heads or tails, then place your bet', 'info');
        break;
    }
  }
  
  handleCoinflipChoice(choice) {
    // Remove selected class from all coinflip buttons
    const allCoinButtons = document.querySelectorAll('.coinflip-btn');
    allCoinButtons.forEach(btn => btn.classList.remove('selected'));
    
    // Add selected class to chosen button
    const selectedButton = document.querySelector(`[data-choice="${choice}"]`);
    if (selectedButton) {
      selectedButton.classList.add('selected');
    }
    
    this.selectedCoinChoice = choice;
    this.showBetValidation(`Coinflip bet: $${(this.maxBetAmount * 0.50).toFixed(2)} on ${choice}`, 'success');
    this.placeBetBtn.disabled = false;
  }
  
  setBetAmount(amount) {
    if (this.betInput) {
      this.betInput.value = amount.toFixed(2);
    }
  }

  placeBet() {
    if (!this.validateBetAmount()) {
      return;
    }
    
    const betAmount = parseFloat(this.betInput.value);
    
    // Here you would implement the actual betting logic
    console.log(`🎯 Placing bet: $${betAmount.toFixed(2)}`);
    
    // Show success message
    this.showBetValidation(`🎉 Bet placed: $${betAmount.toFixed(2)}`, 'success');
    
    // Disable the place bet button temporarily
    this.placeBetBtn.disabled = true;
    this.placeBetBtn.textContent = '🎯 Bet Placed!';
    
    // Reset after 3 seconds
    setTimeout(() => {
      this.placeBetBtn.disabled = false;
      this.placeBetBtn.textContent = '🎯 Place Bet';
    }, 3000);
    
    // Save bet data
    this.saveData({
      lastBet: betAmount,
      maxBet: this.maxBetAmount,
      timestamp: Date.now()
    });
    
    // Show roulette game after a short delay
    setTimeout(() => {
      this.showRoulette(betAmount);
    }, 1000);
  }
  
  showRoulette(betAmount) {
    // Check if coinflip was selected
    if (this.selectedBetOption === 'coinflip' && this.selectedCoinChoice) {
      // Send message to content script to show coinflip
      window.parent.postMessage({ 
        type: 'SHOW_COINFLIP', 
        data: { 
          betAmount: betAmount,
          choice: this.selectedCoinChoice
        } 
      }, '*');
    } else {
      // Send message to content script to show roulette
      window.parent.postMessage({ 
        type: 'SHOW_ROULETTE', 
        data: { 
          betAmount: betAmount,
          totalAmount: this.maxBetAmount 
        } 
      }, '*');
    }
  }
}

// Initialize the extension when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.degenPayExtension = new DegenPayExtension();
});
