// Gambling Lovers Extension - Basic Foundation
class GamblingLoversExtension {
  constructor() {
    this.initializeElements();
    this.bindEvents();
    this.loadData();
  }

  initializeElements() {
    // Add your element selectors here as you build
    this.contentArea = document.querySelector(".content-area");
    this.dashboardButton = document.getElementById("viewDashboard");
  }

  bindEvents() {
    // Add your event listeners here as you build
    if (this.dashboardButton) {
      this.dashboardButton.addEventListener("click", () => {
        this.openDashboard();
      });
    }
    console.log("Gambling Lovers Extension initialized!");
  }

  loadData() {
    // Load any saved data from Chrome storage
    chrome.storage.local.get(["gamblingData"], (result) => {
      if (result.gamblingData) {
        console.log("Loaded data:", result.gamblingData);
      }
    });
  }

  saveData(data) {
    // Save data to Chrome storage
    chrome.storage.local.set({ gamblingData: data });
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

  openDashboard() {
    // Open the gambling dashboard in a new tab
    const dashboardUrl = "http://localhost:3000";
    chrome.tabs.create({ url: dashboardUrl });
    this.showMessage("Opening dashboard...", "info");
  }
}

// Initialize the extension when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  window.gamblingExtension = new GamblingLoversExtension();
});
