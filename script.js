// UC Packages data
const ucPackages = [
    { id: 1, uc: 50, price: 0.99, popular: false },
    { id: 2, uc: 100, price: 1.99, popular: false },
    { id: 3, uc: 250, price: 4.99, popular: true },
    { id: 4, uc: 500, price: 9.99, popular: false },
    { id: 5, uc: 1000, price: 19.99, popular: true },
    { id: 6, uc: 2500, price: 49.99, popular: false },
    { id: 7, uc: 5000, price: 99.99, popular: true },
    { id: 8, uc: 10000, price: 199.99, popular: false }
];

// Payment methods data
const paymentMethods = [
    { id: 'visa', name: 'Visa', icon: 'fa-cc-visa' },
    { id: 'mastercard', name: 'MasterCard', icon: 'fa-cc-mastercard' },
    { id: 'paypal', name: 'PayPal', icon: 'fa-cc-paypal' },
    { id: 'googlepay', name: 'Google Pay', icon: 'fa-google' },
    { id: 'applepay', name: 'Apple Pay', icon: 'fa-apple' },
    { id: 'cod', name: 'Cash on Delivery', icon: 'fa-money-bill' }
];

// App State
const AppState = {
    selectedUcPackage: null,
    selectedPaymentMethod: null,
    currentUcBalance: 0,
    playerId: '',
    playerName: '',
    transactionHistory: []
};

// DOM Elements
const DOM = {
    ucOptionsContainer: document.getElementById('uc-options'),
    paymentMethodsContainer: document.getElementById('payment-methods'),
    historyListContainer: document.getElementById('history-list'),
    topupBtn: document.getElementById('topup-btn'),
    saveUserBtn: document.getElementById('save-user-btn'),
    resetDataBtn: document.getElementById('reset-data-btn'),
    ucBalanceElement: document.getElementById('uc-balance'),
    playerIdInput: document.getElementById('player-id'),
    playerNameInput: document.getElementById('player-name'),
    customAmountInput: document.getElementById('custom-amount'),
    savedUserInfo: document.getElementById('saved-user-info'),
    displayPlayerId: document.getElementById('display-player-id'),
    displayPlayerName: document.getElementById('display-player-name'),
    transactionSummary: document.getElementById('transaction-summary'),
    summaryDetails: document.getElementById('summary-details'),
    notification: document.getElementById('notification'),
    notificationTitle: document.getElementById('notification-title'),
    notificationMessage: document.getElementById('notification-message'),
    confirmationPopup: document.getElementById('confirmation-popup'),
    processingPopup: document.getElementById('processing-popup'),
    successPopup: document.getElementById('success-popup'),
    confirmPaymentBtn: document.getElementById('confirm-payment-btn'),
    cancelPaymentBtn: document.getElementById('cancel-payment-btn'),
    successOkBtn: document.getElementById('success-ok-btn'),
    confirmPlayerId: document.getElementById('confirm-player-id'),
    confirmPlayerName: document.getElementById('confirm-player-name'),
    confirmUcAmount: document.getElementById('confirm-uc-amount'),
    confirmPrice: document.getElementById('confirm-price'),
    confirmMethod: document.getElementById('confirm-method'),
    confirmNewBalance: document.getElementById('confirm-new-balance'),
    successTransactionId: document.getElementById('success-transaction-id'),
    successUcAmount: document.getElementById('success-uc-amount'),
    successNewBalance: document.getElementById('success-new-balance'),
    processingText: document.getElementById('processing-text')
};

// Initialize the app
function initApp() {
    loadFromLocalStorage();
    renderUcOptions();
    renderPaymentMethods();
    renderHistory();
    updateUcBalanceDisplay();
    updateUserInfoDisplay();
    setupEventListeners();
}

// Load data from local storage
function loadFromLocalStorage() {
    // Load UC balance
    const savedBalance = localStorage.getItem('freeFireUcBalance');
    AppState.currentUcBalance = savedBalance ? parseInt(savedBalance) : 0;
    
    // Load player info
    AppState.playerId = localStorage.getItem('freeFirePlayerId') || '';
    AppState.playerName = localStorage.getItem('freeFirePlayerName') || '';
    
    // Update input fields
    DOM.playerIdInput.value = AppState.playerId;
    DOM.playerNameInput.value = AppState.playerName;
    
    // Load selected package and payment method
    AppState.selectedUcPackage = JSON.parse(localStorage.getItem('selectedUcPackage')) || null;
    AppState.selectedPaymentMethod = localStorage.getItem('selectedPaymentMethod') || null;
    
    // Load transaction history
    AppState.transactionHistory = JSON.parse(localStorage.getItem('topUpHistory')) || [];
}

// Save data to local storage
function saveToLocalStorage() {
    localStorage.setItem('freeFireUcBalance', AppState.currentUcBalance.toString());
    localStorage.setItem('freeFirePlayerId', AppState.playerId);
    localStorage.setItem('freeFirePlayerName', AppState.playerName);
    
    if (AppState.selectedUcPackage) {
        localStorage.setItem('selectedUcPackage', JSON.stringify(AppState.selectedUcPackage));
    }
    
    if (AppState.selectedPaymentMethod) {
        localStorage.setItem('selectedPaymentMethod', AppState.selectedPaymentMethod);
    }
    
    localStorage.setItem('topUpHistory', JSON.stringify(AppState.transactionHistory));
}

// Render UC options
function renderUcOptions() {
    DOM.ucOptionsContainer.innerHTML = '';
    
    ucPackages.forEach(pkg => {
        const optionElement = document.createElement('div');
        optionElement.className = `uc-option ${AppState.selectedUcPackage && AppState.selectedUcPackage.id === pkg.id ? 'selected' : ''}`;
        optionElement.dataset.id = pkg.id;
        
        let popularBadge = '';
        if (pkg.popular) {
            popularBadge = '<div class="popular-badge">Most Popular</div>';
        }
        
        optionElement.innerHTML = `
            ${popularBadge}
            <div class="uc-amount">${pkg.uc} UC</div>
            <div class="uc-price">$${pkg.price.toFixed(2)}</div>
        `;
        
        optionElement.addEventListener('click', () => selectUcPackage(pkg));
        DOM.ucOptionsContainer.appendChild(optionElement);
    });
}

// Render payment methods
function renderPaymentMethods() {
    DOM.paymentMethodsContainer.innerHTML = '';
    
    paymentMethods.forEach(method => {
        const methodElement = document.createElement('div');
        methodElement.className = `payment-method ${AppState.selectedPaymentMethod === method.id ? 'selected' : ''}`;
        methodElement.dataset.id = method.id;
        
        methodElement.innerHTML = `
            <i class="fab ${method.icon}"></i>
            <div>${method.name}</div>
        `;
        
        methodElement.addEventListener('click', () => selectPaymentMethod(method.id));
        DOM.paymentMethodsContainer.appendChild(methodElement);
    });
}

// Render transaction history
function renderHistory() {
    if (AppState.transactionHistory.length === 0) {
        DOM.historyListContainer.innerHTML = '<div class="empty-history">No top-up history yet</div>';
        return;
    }
    
    DOM.historyListContainer.innerHTML = '';
    
    // Show only the last 10 transactions
    const recentHistory = AppState.transactionHistory.slice(-10).reverse();
    
    recentHistory.forEach(item => {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        
        const date = new Date(item.date);
        const formattedDate = date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        historyItem.innerHTML = `
            <div class="history-header">
                <div class="history-uc">${item.uc} UC</div>
                <div class="history-price">$${item.price.toFixed(2)}</div>
            </div>
            <div class="history-date">${formattedDate}</div>
            <div class="history-method">Via ${item.method}</div>
            <div class="history-id" style="font-size: 0.8rem; color: #888; margin-top: 5px;">ID: ${item.id}</div>
        `;
        
        DOM.historyListContainer.appendChild(historyItem);
    });
}

// Select UC package
function selectUcPackage(pkg) {
    AppState.selectedUcPackage = pkg;
    DOM.customAmountInput.value = ''; // Clear custom amount
    renderUcOptions();
    updateTransactionSummary();
}

// Select payment method
function selectPaymentMethod(methodId) {
    AppState.selectedPaymentMethod = methodId;
    renderPaymentMethods();
    updateTransactionSummary();
}

// Handle custom amount input
function handleCustomAmount() {
    const customValue = parseInt(DOM.customAmountInput.value);
    
    if (customValue && customValue > 0) {
        // Deselect any selected package
        AppState.selectedUcPackage = null;
        renderUcOptions();
        
        // Calculate price (approximate based on standard rates)
        const calculatedPrice = (customValue * 0.02).toFixed(2);
        
        // Create a custom package object
        AppState.selectedUcPackage = {
            id: 'custom',
            uc: customValue > 10000 ? 10000 : customValue,
            price: parseFloat(calculatedPrice),
            custom: true
        };
        
        updateTransactionSummary();
    } else if (!customValue) {
        AppState.selectedUcPackage = null;
        DOM.transactionSummary.classList.remove('show');
    }
}

// Update transaction summary
function updateTransactionSummary() {
    if (AppState.selectedUcPackage && AppState.selectedPaymentMethod) {
        DOM.transactionSummary.classList.add('show');
        
        const methodName = paymentMethods.find(m => m.id === AppState.selectedPaymentMethod)?.name || AppState.selectedPaymentMethod;
        
        DOM.summaryDetails.innerHTML = `
            <div class="summary-item">
                <strong>UC Amount:</strong> <span style="color: #ffd166;">${AppState.selectedUcPackage.uc} UC</span>
            </div>
            <div class="summary-item">
                <strong>Price:</strong> <span style="color: #4dff88;">$${AppState.selectedUcPackage.price.toFixed(2)}</span>
            </div>
            <div class="summary-item">
                <strong>Payment Method:</strong> <span style="color: #c0c0e0;">${methodName}</span>
            </div>
            <div class="summary-item">
                <strong>Player ID:</strong> <span style="color: #c0c0e0;">${AppState.playerId || 'Not set'}</span>
            </div>
        `;
    } else {
        DOM.transactionSummary.classList.remove('show');
    }
}

// Show confirmation popup
function showConfirmationPopup() {
    // Validate player info
    if (!AppState.playerId || AppState.playerId.trim() === '') {
        showNotification('Error', 'Please enter your Player ID first', 'error');
        return;
    }
    
    if (!AppState.selectedUcPackage) {
        showNotification('Error', 'Please select a UC package or enter a custom amount', 'error');
        return;
    }
    
    if (!AppState.selectedPaymentMethod) {
        showNotification('Error', 'Please select a payment method', 'error');
        return;
    }
    
    // Update confirmation popup details
    const methodName = paymentMethods.find(m => m.id === AppState.selectedPaymentMethod)?.name || AppState.selectedPaymentMethod;
    const newBalance = AppState.currentUcBalance + AppState.selectedUcPackage.uc;
    
    DOM.confirmPlayerId.textContent = AppState.playerId;
    DOM.confirmPlayerName.textContent = AppState.playerName || 'Unknown Player';
    DOM.confirmUcAmount.textContent = `${AppState.selectedUcPackage.uc} UC`;
    DOM.confirmPrice.textContent = `$${AppState.selectedUcPackage.price.toFixed(2)}`;
    DOM.confirmMethod.textContent = methodName;
    DOM.confirmNewBalance.textContent = `${newBalance} UC`;
    
    // Show the confirmation popup
    DOM.confirmationPopup.classList.add('active');
    document.body.style.overflow = 'hidden';
}

// Close confirmation popup
function closeConfirmationPopup() {
    DOM.confirmationPopup.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Process payment after confirmation
function processPayment() {
    closeConfirmationPopup();
    
    // Show processing popup
    DOM.processingPopup.classList.add('active');
    
    // Simulate payment processing delay
    const processingMessages = [
        "Processing payment...",
        "Verifying transaction...",
        "Adding UC to your account...",
        "Almost done..."
    ];
    
    let messageIndex = 0;
    const messageInterval = setInterval(() => {
        DOM.processingText.textContent = processingMessages[messageIndex];
        messageIndex = (messageIndex + 1) % processingMessages.length;
    }, 1500);
    
    // Simulate network delay
    setTimeout(() => {
        clearInterval(messageInterval);
        DOM.processingPopup.classList.remove('active');
        
        // Complete the transaction
        completeTransaction();
    }, 3000);
}

// Complete the transaction
function completeTransaction() {
    // Add UC to balance
    AppState.currentUcBalance += AppState.selectedUcPackage.uc;
    
    // Generate transaction ID
    const transactionId = 'TX' + Date.now() + Math.floor(Math.random() * 1000);
    
    // Create transaction record
    const transaction = {
        id: transactionId,
        date: new Date().toISOString(),
        uc: AppState.selectedUcPackage.uc,
        price: AppState.selectedUcPackage.price,
        method: paymentMethods.find(m => m.id === AppState.selectedPaymentMethod)?.name || AppState.selectedPaymentMethod,
        playerId: AppState.playerId,
        custom: AppState.selectedUcPackage.custom || false
    };
    
    // Add to history
    AppState.transactionHistory.push(transaction);
    
    // Save to local storage
    saveToLocalStorage();
    
    // Update success popup
    DOM.successTransactionId.textContent = transactionId;
    DOM.successUcAmount.textContent = `${AppState.selectedUcPackage.uc} UC`;
    DOM.successNewBalance.textContent = `${AppState.currentUcBalance} UC`;
    
    // Show success popup
    setTimeout(() => {
        DOM.successPopup.classList.add('active');
    }, 300);
    
    // Update UI
    updateUcBalanceDisplay();
    renderHistory();
    
    // Reset selection
    AppState.selectedUcPackage = null;
    AppState.selectedPaymentMethod = null;
    DOM.customAmountInput.value = '';
    renderUcOptions();
    renderPaymentMethods();
    DOM.transactionSummary.classList.remove('show');
}

// Close success popup
function closeSuccessPopup() {
    DOM.successPopup.classList.remove('active');
    document.body.style.overflow = 'auto';
}

// Save user info
function saveUserInfo() {
    const idValue = DOM.playerIdInput.value.trim();
    const nameValue = DOM.playerNameInput.value.trim();
    
    if (!idValue) {
        showNotification('Error', 'Please enter your Player ID', 'error');
        return;
    }
    
    AppState.playerId = idValue;
    AppState.playerName = nameValue || 'Unknown Player';
    
    saveToLocalStorage();
    updateUserInfoDisplay();
    
    showNotification('Saved', 'Player information saved successfully', 'success');
}

// Update user info display
function updateUserInfoDisplay() {
    if (AppState.playerId) {
        DOM.savedUserInfo.style.display = 'block';
        DOM.displayPlayerId.textContent = `ID: ${AppState.playerId}`;
        DOM.displayPlayerName.textContent = `Name: ${AppState.playerName}`;
    } else {
        DOM.savedUserInfo.style.display = 'none';
    }
}

// Update UC balance display
function updateUcBalanceDisplay() {
    DOM.ucBalanceElement.textContent = `${AppState.currentUcBalance} UC`;
}

// Reset all data
function resetAllData() {
    // Show custom confirmation
    if (confirm('Are you sure you want to reset all data?\n\nThis will:\n• Clear your UC balance\n• Delete transaction history\n• Remove saved player info\n\nThis action cannot be undone.')) {
        localStorage.clear();
        
        // Reset app state
        AppState.currentUcBalance = 0;
        AppState.playerId = '';
        AppState.playerName = '';
        AppState.selectedUcPackage = null;
        AppState.selectedPaymentMethod = null;
        AppState.transactionHistory = [];
        
        // Reset UI
        DOM.playerIdInput.value = '';
        DOM.playerNameInput.value = '';
        DOM.customAmountInput.value = '';
        
        updateUcBalanceDisplay();
        updateUserInfoDisplay();
        renderUcOptions();
        renderPaymentMethods();
        renderHistory();
        DOM.transactionSummary.classList.remove('show');
        
        // Close any open popups
        closeConfirmationPopup();
        closeSuccessPopup();
        DOM.processingPopup.classList.remove('active');
        
        showNotification('Reset Complete', 'All data has been reset successfully', 'success');
    }
}

// Show notification
function showNotification(title, message, type = 'success') {
    const icon = type === 'success' ? 'fa-check-circle' : 
                type === 'error' ? 'fa-exclamation-circle' : 
                'fa-info-circle';
    
    DOM.notificationTitle.innerHTML = `<i class="fas ${icon}"></i> ${title}`;
    DOM.notificationMessage.textContent = message;
    
    DOM.notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        DOM.notification.classList.remove('show');
    }, 4000);
}

// Setup event listeners
function setupEventListeners() {
    // Button events
    DOM.topupBtn.addEventListener('click', showConfirmationPopup);
    DOM.saveUserBtn.addEventListener('click', saveUserInfo);
    DOM.resetDataBtn.addEventListener('click', resetAllData);
    
    // Input events
    DOM.customAmountInput.addEventListener('input', handleCustomAmount);
    
    // Popup events
    DOM.confirmPaymentBtn.addEventListener('click', processPayment);
    DOM.cancelPaymentBtn.addEventListener('click', closeConfirmationPopup);
    DOM.successOkBtn.addEventListener('click', closeSuccessPopup);
    
    // Close popups when clicking outside
    document.querySelectorAll('.popup-overlay').forEach(popup => {
        popup.addEventListener('click', function(e) {
            if (e.target === this) {
                if (this.id === 'confirmation-popup') {
                    closeConfirmationPopup();
                } else if (this.id === 'success-popup') {
                    closeSuccessPopup();
                }
            }
        });
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Escape key closes popups
        if (e.key === 'Escape') {
            closeConfirmationPopup();
            closeSuccessPopup();
        }
        
        // Ctrl+S saves user info
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            saveUserInfo();
        }
    });
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', initApp);

// Add CSS for popular badge
const style = document.createElement('style');
style.textContent = `
    .popular-badge {
        position: absolute;
        top: -8px;
        right: -8px;
        background: #ff4655;
        color: white;
        font-size: 0.7rem;
        padding: 2px 8px;
        border-radius: 10px;
        font-weight: bold;
    }
    
    .uc-option {
        position: relative;
    }
`;
document.head.appendChild(style);