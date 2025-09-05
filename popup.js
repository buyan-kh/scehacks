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
  }

  bindEvents() {
    // Add your event listeners here as you build
    console.log("Degen Pay Extension initialized!");
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

      if (subtotal && this.subtotalDisplay) {
        this.displaySubtotal({
          amount: subtotal,
          raw: raw || `$${subtotal}`,
          numeric: numeric ? parseFloat(numeric) : parseFloat(subtotal)
        });
      } else {
        this.displayNoSubtotal();
      }
    } catch (error) {
      console.error('Error loading subtotal from URL:', error);
      this.displayNoSubtotal();
    }
  }

  displaySubtotal(subtotalData) {
    if (!this.subtotalDisplay) return;

    this.subtotalDisplay.innerHTML = `
      <div class="subtotal-info">
        <div class="subtotal-amount">$${subtotalData.amount}</div>
        <div class="subtotal-details">
          <p><strong>Raw text:</strong> ${subtotalData.raw}</p>
          <p><strong>Numeric value:</strong> ${subtotalData.numeric}</p>
        </div>
        <div class="subtotal-status success">✅ Successfully scraped!</div>
      </div>
    `;
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
  }
}

// Initialize the extension when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.degenPayExtension = new DegenPayExtension();
});
