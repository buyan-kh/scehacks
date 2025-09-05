// Content script for Degen Pay Chrome MV3 extension
// Adds "Degen Pay" buttons under checkout buttons on web pages

(function() {
  'use strict';
  
  let overlay = null;
  let isPopupOpen = false;
  let degenButtons = new Set(); // Track added buttons to avoid duplicates
  let isAddingDegenButton = false; // Flag to prevent mutation observer from triggering
  
  /**
   * Scrapes the subtotal from the page
   */
  function scrapeSubtotal() {
    try {
      // Look for the transaction summary footer with subtotal
      const subtotalRow = document.querySelector('tr.transaction-summary-footer[data-testid="transaction-summary-footer"]');
      
      if (subtotalRow) {
        const amountCell = subtotalRow.querySelector('td.transaction-summary-item-amount');
        if (amountCell) {
          const priceText = amountCell.textContent.trim();
          // Extract just the dollar amount (e.g., "$100.00" -> "100.00")
          const priceMatch = priceText.match(/\$?([\d,]+\.?\d*)/);
          if (priceMatch) {
            return {
              raw: priceText,
              amount: priceMatch[1],
              numeric: parseFloat(priceMatch[1].replace(/,/g, ''))
            };
          }
        }
      }
      
      // Fallback: look for any element containing "Subtotal" and a price
      const subtotalElements = Array.from(document.querySelectorAll('*')).filter(el => 
        el.textContent && el.textContent.toLowerCase().includes('subtotal')
      );
      
      for (const element of subtotalElements) {
        const text = element.textContent;
        const priceMatch = text.match(/subtotal[^$]*\$?([\d,]+\.?\d*)/i);
        if (priceMatch) {
          return {
            raw: priceMatch[0],
            amount: priceMatch[1],
            numeric: parseFloat(priceMatch[1].replace(/,/g, ''))
          };
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error scraping subtotal:', error);
      return null;
    }
  }

  /**
   * Creates and shows a full-screen overlay with the extension popup
   * Is idempotent - does nothing if already open
   */
  function showExtensionPopup() {
    // Check if popup is already open (idempotent)
    if (isPopupOpen || overlay) {
      return;
    }
    
    // Scrape the subtotal before showing popup
    const subtotalData = scrapeSubtotal();
    console.log('Scraped subtotal:', subtotalData);
    
    // Create overlay container
    overlay = document.createElement('div');
    overlay.id = 'extension-popup-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background-color: rgba(0, 0, 0, 0.8);
      z-index: 2147483647;
      display: flex;
      justify-content: center;
      align-items: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    `;
    
    // Create iframe container
    const iframeContainer = document.createElement('div');
    iframeContainer.style.cssText = `
      position: relative;
      width: 90%;
      max-width: 800px;
      height: 80%;
      max-height: 600px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      overflow: hidden;
    `;
    
    // Create close button
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.style.cssText = `
      position: absolute;
      top: 15px;
      right: 15px;
      width: 40px;
      height: 40px;
      border: none;
      background: rgba(0, 0, 0, 0.1);
      border-radius: 50%;
      font-size: 24px;
      font-weight: bold;
      color: #666;
      cursor: pointer;
      z-index: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    `;
    
    // Add hover effects to close button
    closeButton.addEventListener('mouseenter', () => {
      closeButton.style.background = 'rgba(0, 0, 0, 0.2)';
      closeButton.style.color = '#333';
    });
    
    closeButton.addEventListener('mouseleave', () => {
      closeButton.style.background = 'rgba(0, 0, 0, 0.1)';
      closeButton.style.color = '#666';
    });
    
    // Create iframe with subtotal data as URL parameter
    const iframe = document.createElement('iframe');
    let popupUrl = chrome.runtime.getURL('popup.html');
    
    if (subtotalData) {
      const params = new URLSearchParams({
        subtotal: subtotalData.amount,
        raw: subtotalData.raw,
        numeric: subtotalData.numeric.toString()
      });
      popupUrl += '?' + params.toString();
    }
    
    iframe.src = popupUrl;
    iframe.style.cssText = `
      width: 100%;
      height: 100%;
      border: none;
      border-radius: 12px;
    `;
    
    // Assemble the overlay
    iframeContainer.appendChild(closeButton);
    iframeContainer.appendChild(iframe);
    overlay.appendChild(iframeContainer);
    
    // Add to document
    document.body.appendChild(overlay);
    isPopupOpen = true;
    
    // Add event listeners
    closeButton.addEventListener('click', hideExtensionPopup);
    overlay.addEventListener('click', (e) => {
      // Close when clicking on overlay background (not the iframe container)
      if (e.target === overlay) {
        hideExtensionPopup();
      }
    });
    
    // Close on Escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        hideExtensionPopup();
      }
    };
    document.addEventListener('keydown', handleEscape);
    
    // Store the escape handler for cleanup
    overlay._escapeHandler = handleEscape;
    
    // Prevent body scroll when overlay is open
    document.body.style.overflow = 'hidden';
  }
  
  /**
   * Hides the extension popup overlay
   */
  function hideExtensionPopup() {
    if (!overlay || !isPopupOpen) {
      return;
    }
    
    // Remove escape key listener
    if (overlay._escapeHandler) {
      document.removeEventListener('keydown', overlay._escapeHandler);
    }
    
    // Remove overlay from DOM
    document.body.removeChild(overlay);
    overlay = null;
    isPopupOpen = false;
    
    // Restore body scroll
    document.body.style.overflow = '';
  }
  
  /**
   * Checks if an element or its children contain "checkout" text
   */
  function containsCheckoutText(element) {
    const text = element.textContent.toLowerCase();
    const href = element.getAttribute('href') || '';
    const title = element.getAttribute('title') || '';
    const alt = element.getAttribute('alt') || '';
    const value = element.getAttribute('value') || '';
    
    return text.includes('checkout') || 
           href.toLowerCase().includes('checkout') ||
           title.toLowerCase().includes('checkout') ||
           alt.toLowerCase().includes('checkout') ||
           value.toLowerCase().includes('checkout');
  }

  /**
   * Creates a Degen Pay button
   */
  function createDegenPayButton() {
    const button = document.createElement('button');
    button.textContent = '💎 Degen Pay';
    button.className = 'degen-pay-button';
    button.style.cssText = `
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      margin: 8px 0;
      width: 100%;
      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
      transition: all 0.3s ease;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    `;
    
    // Add hover effects
    button.addEventListener('mouseenter', () => {
      button.style.transform = 'translateY(-2px)';
      button.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.transform = 'translateY(0)';
      button.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
    });
    
    // Add click handler
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      showExtensionPopup();
    });
    
    return button;
  }

  /**
   * Adds Degen Pay button under a checkout element
   */
  function addDegenPayButton(checkoutElement) {
    // Check if we already added a button for this element
    if (degenButtons.has(checkoutElement)) {
      return;
    }
    
    // Check if there's already a Degen Pay button nearby
    const existingDegenButton = checkoutElement.parentElement?.querySelector('.degen-pay-button');
    if (existingDegenButton) {
      degenButtons.add(checkoutElement); // Mark as processed to avoid future attempts
      return;
    }
    
    // Set flag to prevent mutation observer from triggering
    isAddingDegenButton = true;
    
    // Find the best place to insert the button
    let insertTarget = checkoutElement;
    
    // If it's a button or input, try to find its container
    if (checkoutElement.tagName === 'BUTTON' || checkoutElement.tagName === 'INPUT') {
      // Look for a parent container (form, div with specific classes, etc.)
      let parent = checkoutElement.parentElement;
      while (parent && parent !== document.body) {
        const tagName = parent.tagName.toLowerCase();
        const className = parent.className.toLowerCase();
        
        // Good containers to add the button to
        if (tagName === 'form' || 
            tagName === 'div' || 
            className.includes('checkout') ||
            className.includes('cart') ||
            className.includes('payment') ||
            className.includes('button') ||
            className.includes('action')) {
          insertTarget = parent;
          break;
        }
        parent = parent.parentElement;
      }
    }
    
    // Create the Degen Pay button
    const degenButton = createDegenPayButton();
    
    // Insert the button after the checkout element or at the end of its container
    if (insertTarget === checkoutElement) {
      // Insert after the checkout element
      checkoutElement.parentNode.insertBefore(degenButton, checkoutElement.nextSibling);
    } else {
      // Insert at the end of the container
      insertTarget.appendChild(degenButton);
    }
    
    // Mark this element as having a Degen Pay button
    degenButtons.add(checkoutElement);
    
    // Clear the flag after a short delay to allow DOM to settle
    setTimeout(() => {
      isAddingDegenButton = false;
    }, 100);
    
    console.log('💎 Added Degen Pay button under checkout element');
  }

  /**
   * Scans the page for checkout elements and adds Degen Pay buttons
   */
  function scanAndAddDegenButtons() {
    // Find all potential checkout elements
    const checkoutSelectors = [
      'button[class*="checkout"]',
      'a[class*="checkout"]',
      'input[value*="checkout" i]',
      'button[class*="pay"]',
      'a[class*="pay"]',
      'input[value*="pay" i]',
      'button[class*="buy"]',
      'a[class*="buy"]',
      'input[value*="buy" i]',
      'button[class*="purchase"]',
      'a[class*="purchase"]',
      'input[value*="purchase" i]',
      'button[class*="order"]',
      'a[class*="order"]',
      'input[value*="order" i]'
    ];
    
    const foundElements = new Set();
    
    // Search by selectors first
    checkoutSelectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => foundElements.add(el));
      } catch (e) {
        // Ignore invalid selectors
      }
    });
    
    // Also search by text content (excluding our own Degen Pay buttons)
    const allElements = document.querySelectorAll('button:not(.degen-pay-button), a, input[type="button"], input[type="submit"]');
    allElements.forEach(element => {
      if (containsCheckoutText(element)) {
        foundElements.add(element);
      }
    });
    
    // Add Degen Pay buttons for each found element
    foundElements.forEach(element => {
      addDegenPayButton(element);
    });
    
    console.log(`💎 Found ${foundElements.size} checkout elements, added Degen Pay buttons`);
  }
  
  /**
   * Initialize the Degen Pay extension
   */
  function initializeDegenPay() {
    // Initial scan for checkout elements
    scanAndAddDegenButtons();
    
    // Set up mutation observer to watch for dynamically added content
    const observer = new MutationObserver((mutations) => {
      // Skip if we're currently adding our own buttons
      if (isAddingDegenButton) {
        return;
      }
      
      let shouldRescan = false;
      
      mutations.forEach(mutation => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Check if any added nodes contain checkout elements
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Skip if this is one of our Degen Pay buttons
              if (node.classList && node.classList.contains('degen-pay-button')) {
                return;
              }
              
              const hasCheckoutElements = node.querySelector && (
                node.querySelector('button:not(.degen-pay-button), a, input[type="button"], input[type="submit"]') ||
                containsCheckoutText(node)
              );
              if (hasCheckoutElements) {
                shouldRescan = true;
              }
            }
          });
        }
      });
      
      if (shouldRescan) {
        // Debounce the rescan to avoid excessive calls
        clearTimeout(window.degenPayRescanTimeout);
        window.degenPayRescanTimeout = setTimeout(() => {
          scanAndAddDegenButtons();
        }, 500);
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeDegenPay);
  } else {
    initializeDegenPay();
  }
  
  // Expose functions globally for debugging/testing
  window.showExtensionPopup = showExtensionPopup;
  window.hideExtensionPopup = hideExtensionPopup;
  
  console.log('💎 Degen Pay extension loaded successfully!');
  console.log('✅ Degen Pay buttons have been added under checkout elements on this page.');
  console.log('🔍 Click any "Degen Pay" button to open the popup.');
  
  // Add a visual indicator that the script is loaded
  const indicator = document.createElement('div');
  indicator.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: #4CAF50;
    color: white;
    padding: 8px 12px;
    border-radius: 4px;
    font-size: 12px;
    z-index: 999999;
    font-family: Arial, sans-serif;
  `;
  indicator.textContent = '💎 Degen Pay Loaded';
  document.body.appendChild(indicator);
  
  // Remove indicator after 3 seconds
  setTimeout(() => {
    if (indicator.parentNode) {
      indicator.parentNode.removeChild(indicator);
    }
  }, 3000);
  
})();
