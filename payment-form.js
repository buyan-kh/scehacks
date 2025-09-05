// Payment Form Handler for Degen Pay Extension
class PaymentFormHandler {
  constructor() {
    this.initializeElements();
    this.bindEvents();
    this.setupFormValidation();
  }

  initializeElements() {
    this.paymentForm = document.getElementById('payment-form');
    this.cardNumberInput = document.getElementById('card-number');
    this.expiryInput = document.getElementById('expiry-date');
    this.cvvInput = document.getElementById('cvv');
    this.cardholderInput = document.getElementById('cardholder-name');
    this.emailInput = document.getElementById('email');
    this.addressInput = document.getElementById('address');
    this.cityInput = document.getElementById('city');
    this.zipInput = document.getElementById('zip');
    this.submitBtn = document.getElementById('submit-btn');
    this.cancelBtn = document.getElementById('cancel-btn');
  }

  bindEvents() {
    // Card number formatting
    if (this.cardNumberInput) {
      this.cardNumberInput.addEventListener('input', (e) => this.formatCardNumber(e));
    }

    // Expiry date formatting
    if (this.expiryInput) {
      this.expiryInput.addEventListener('input', (e) => this.formatExpiryDate(e));
    }

    // CVV formatting (numbers only)
    if (this.cvvInput) {
      this.cvvInput.addEventListener('input', (e) => this.formatCVV(e));
    }

    // ZIP code formatting
    if (this.zipInput) {
      this.zipInput.addEventListener('input', (e) => this.formatZIP(e));
    }

    // Form submission
    if (this.paymentForm) {
      this.paymentForm.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    // Cancel button
    if (this.cancelBtn) {
      this.cancelBtn.addEventListener('click', () => this.handleCancel());
    }

    // Real-time validation
    const inputs = document.querySelectorAll('.form-input');
    inputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
      input.addEventListener('input', () => this.clearFieldError(input));
    });
  }

  setupFormValidation() {
    // Basic validation rules (no real validation as requested)
    this.validationRules = {
      'card-number': { required: true, minLength: 13 },
      'expiry-date': { required: true, pattern: /^\d{2}\/\d{2}$/ },
      'cvv': { required: true, minLength: 3 },
      'cardholder-name': { required: true, minLength: 2 },
      'email': { required: true, type: 'email' },
      'address': { required: true, minLength: 5 },
      'city': { required: true, minLength: 2 },
      'zip': { required: true, minLength: 3 }
    };
  }

  formatCardNumber(event) {
    let value = event.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
    
    if (formattedValue.length > 19) {
      formattedValue = formattedValue.substr(0, 19);
    }
    
    event.target.value = formattedValue;
  }

  formatExpiryDate(event) {
    let value = event.target.value.replace(/\D/g, '');
    
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    
    event.target.value = value;
  }

  formatCVV(event) {
    let value = event.target.value.replace(/[^0-9]/g, '');
    event.target.value = value;
  }

  formatZIP(event) {
    let value = event.target.value.replace(/[^0-9-]/g, '');
    event.target.value = value;
  }

  validateField(field) {
    const fieldId = field.id;
    const rules = this.validationRules[fieldId];
    
    if (!rules) return true;

    let isValid = true;
    let errorMessage = '';

    // Required check
    if (rules.required && !field.value.trim()) {
      isValid = false;
      errorMessage = 'This field is required';
    }
    // Length check
    else if (rules.minLength && field.value.length < rules.minLength) {
      isValid = false;
      errorMessage = `Minimum ${rules.minLength} characters required`;
    }
    // Pattern check
    else if (rules.pattern && !rules.pattern.test(field.value)) {
      isValid = false;
      errorMessage = 'Invalid format';
    }
    // Email check
    else if (rules.type === 'email' && field.value) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(field.value)) {
        isValid = false;
        errorMessage = 'Invalid email format';
      }
    }

    this.showFieldError(field, isValid ? '' : errorMessage);
    return isValid;
  }

  showFieldError(field, message) {
    // Remove existing error
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
      existingError.remove();
    }

    // Add new error if message exists
    if (message) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'field-error';
      errorDiv.textContent = message;
      field.parentNode.appendChild(errorDiv);
      field.classList.add('error');
    } else {
      field.classList.remove('error');
    }
  }

  clearFieldError(field) {
    field.classList.remove('error');
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
      existingError.remove();
    }
  }

  validateForm() {
    const inputs = document.querySelectorAll('.form-input[required]');
    let isFormValid = true;

    inputs.forEach(input => {
      if (!this.validateField(input)) {
        isFormValid = false;
      }
    });

    return isFormValid;
  }

  handleSubmit(event) {
    event.preventDefault();
    
    if (!this.validateForm()) {
      this.showFormError('Please fill in all required fields correctly');
      return;
    }

    // Collect form data
    const formData = {
      cardNumber: this.cardNumberInput.value,
      expiryDate: this.expiryInput.value,
      cvv: this.cvvInput.value,
      cardholderName: this.cardholderInput.value,
      email: this.emailInput.value,
      address: this.addressInput.value,
      city: this.cityInput.value,
      zip: this.zipInput.value,
      timestamp: Date.now()
    };

    console.log('💳 Payment form submitted:', formData);

    // Show loading state
    this.submitBtn.disabled = true;
    this.submitBtn.textContent = 'Processing...';

    // Simulate processing delay
    setTimeout(() => {
      // Pass data to parent window and close payment form
      if (window.parent && window.parent !== window) {
        // We're in an iframe, communicate with parent
        window.parent.postMessage({
          type: 'PAYMENT_FORM_SUBMITTED',
          data: formData
        }, '*');
      } else {
        // We're in a popup, communicate with content script
        chrome.runtime.sendMessage({
          type: 'PAYMENT_FORM_SUBMITTED',
          data: formData
        });
      }
    }, 1000);
  }

  handleCancel() {
    // Close the payment form
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'PAYMENT_FORM_CANCELLED'
      }, '*');
    } else {
      chrome.runtime.sendMessage({
        type: 'PAYMENT_FORM_CANCELLED'
      });
    }
  }

  showFormError(message) {
    // Remove existing error
    const existingError = document.querySelector('.form-error');
    if (existingError) {
      existingError.remove();
    }

    // Add new error
    const errorDiv = document.createElement('div');
    errorDiv.className = 'form-error';
    errorDiv.textContent = message;
    
    const formActions = document.querySelector('.form-actions');
    formActions.parentNode.insertBefore(errorDiv, formActions);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.paymentFormHandler = new PaymentFormHandler();
});
