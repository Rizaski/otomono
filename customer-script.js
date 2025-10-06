// Customer Details Collection Script
let currentOrder = null;
let isSubmitting = false;

// Initialize the customer page
document.addEventListener('DOMContentLoaded', function() {
    initializeCustomerPage();
});

async function initializeCustomerPage() {
    showPageLoading();
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate loading
    loadOrderFromUrl();
    hidePageLoading();
}

function showPageLoading() {
    const main = document.querySelector('.customer-main');
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'pageLoading';
    loadingDiv.className = 'page-loading-overlay';
    loadingDiv.innerHTML = `
        <div class="loading-content">
            <div class="loading-spinner"></div>
            <p>Loading your order details...</p>
        </div>
    `;
    main.appendChild(loadingDiv);
}

function hidePageLoading() {
    const loadingDiv = document.getElementById('pageLoading');
    if (loadingDiv) {
        loadingDiv.style.opacity = '0';
        setTimeout(() => loadingDiv.remove(), 300);
    }
}

// Load order information from URL parameters
function loadOrderFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('order');
    
    if (!orderId) {
        showError('No order ID provided in the URL.');
        return;
    }
    
    // Load orders from localStorage (simulating database)
    const orders = JSON.parse(localStorage.getItem('jerseyOrders') || '[]');
    const order = orders.find(o => o.id === orderId);
    
    if (!order) {
        showError('Order not found. Please check your link and try again.');
        return;
    }
    
    currentOrder = order;
    displayOrderInfo();
    displayDetailsForm();
}

// Display order information
function displayOrderInfo() {
    if (!currentOrder) return;
    
    const orderInfoSection = document.getElementById('orderInfo');
    orderInfoSection.innerHTML = `
        <h2><i class="fas fa-info-circle"></i> Order Information</h2>
        <div class="info-grid">
            <div class="info-item">
                <strong>Order ID</strong>
                <span>${currentOrder.id}</span>
            </div>
            <div class="info-item">
                <strong>Customer Name</strong>
                <span>${currentOrder.customerName}</span>
            </div>
            <div class="info-item">
                <strong>Email</strong>
                <span>${currentOrder.customerEmail}</span>
            </div>
            <div class="info-item">
                <strong>Phone</strong>
                <span>${currentOrder.customerPhone}</span>
            </div>
            <div class="info-item">
                <strong>Quantity</strong>
                <span>${currentOrder.jerseyQuantity} Jersey(s)</span>
            </div>
            <div class="info-item">
                <strong>Status</strong>
                <span class="status-badge status-${currentOrder.status}">${currentOrder.status}</span>
            </div>
        </div>
        ${currentOrder.specialInstructions ? `
            <div class="info-item" style="margin-top: 1rem;">
                <strong>Special Instructions</strong>
                <span>${currentOrder.specialInstructions}</span>
            </div>
        ` : ''}
    `;
}

// Display the details collection form
function displayDetailsForm() {
    if (!currentOrder) return;
    
    const detailsFormSection = document.getElementById('detailsForm');
    detailsFormSection.innerHTML = `
        <h2><i class="fas fa-tshirt"></i> Jersey Details Collection</h2>
        <p style="color: #666; margin-bottom: 2rem; font-size: 1.1rem;">
            Please provide the details for your ${currentOrder.jerseyQuantity} jersey(s). All fields marked with * are required. 
            You'll need to specify the jersey type, name, number, size category, size, sleeve type, and whether shorts are included.
        </p>
        
        <form id="customerDetailsForm" onsubmit="submitCustomerDetails(event)">
            <div id="jerseyDetailsContainer">
                ${generateJerseyDetailsForm(currentOrder.jerseyQuantity)}
            </div>
            
            <!-- Counter Table -->
            <div id="counterTable" class="counter-section">
                <h3><i class="fas fa-calculator"></i> Order Summary</h3>
                <div class="counter-table">
                    <div class="counter-row">
                        <div class="counter-category">
                            <h4>Jersey Types</h4>
                            <div class="counter-items">
                                <div class="counter-item">
                                    <span class="counter-label">Player Jersey:</span>
                                    <span class="counter-value" id="count-player-jersey">0</span>
                                </div>
                                <div class="counter-item">
                                    <span class="counter-label">Keeper Jersey:</span>
                                    <span class="counter-value" id="count-keeper-jersey">0</span>
                                </div>
                                <div class="counter-item">
                                    <span class="counter-label">Official Jersey:</span>
                                    <span class="counter-value" id="count-official-jersey">0</span>
                                </div>
                                <div class="counter-item">
                                    <span class="counter-label">Training Jersey:</span>
                                    <span class="counter-value" id="count-training-jersey">0</span>
                                </div>
                                <div class="counter-item">
                                    <span class="counter-label">Warm-up Jersey:</span>
                                    <span class="counter-value" id="count-warmup-jersey">0</span>
                                </div>
                            </div>
                        </div>
                        <div class="counter-category">
                            <h4>Size Categories</h4>
                            <div class="counter-items">
                                <div class="counter-item">
                                    <span class="counter-label">Adult:</span>
                                    <span class="counter-value" id="count-adult">0</span>
                                </div>
                                <div class="counter-item">
                                    <span class="counter-label">Kids:</span>
                                    <span class="counter-value" id="count-kids">0</span>
                                </div>
                                <div class="counter-item">
                                    <span class="counter-label">Muslima:</span>
                                    <span class="counter-value" id="count-muslima">0</span>
                                </div>
                            </div>
                        </div>
                        <div class="counter-category">
                            <h4>Sleeve Types</h4>
                            <div class="counter-items">
                                <div class="counter-item">
                                    <span class="counter-label">Short Sleeve:</span>
                                    <span class="counter-value" id="count-short-sleeve">0</span>
                                </div>
                                <div class="counter-item">
                                    <span class="counter-label">Long Sleeve:</span>
                                    <span class="counter-value" id="count-long-sleeve">0</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="form-actions" style="margin-top: 2rem; text-align: center;">
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save"></i> Submit Details
                </button>
            </div>
        </form>
    `;
    
    // Add event listeners for counter updates
    setTimeout(() => {
        addCounterEventListeners();
    }, 100);
}

// Generate the jersey details form
function generateJerseyDetailsForm(quantity) {
    let html = '';
    for (let i = 0; i < quantity; i++) {
        html += `
            <div class="jersey-item">
                <h3><i class="fas fa-tshirt"></i> Jersey ${i + 1}</h3>
                <div class="form-row">
                    <div class="form-group">
                        <label for="jersey_${i}_type">Jersey Type *</label>
                        <select id="jersey_${i}_type" name="jersey_${i}_type" required>
                            <option value="">Select Jersey Type</option>
                            <option value="Player Jersey">Player Jersey</option>
                            <option value="Keeper Jersey">Keeper Jersey</option>
                            <option value="Official Jersey">Official Jersey</option>
                            <option value="Training Jersey">Training Jersey</option>
                            <option value="Warm-up Jersey">Warm-up Jersey</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="jersey_${i}_name">Player Name *</label>
                        <input type="text" id="jersey_${i}_name" name="jersey_${i}_name" required 
                            placeholder="Enter player name" />
                    </div>
                    <div class="form-group">
                        <label for="jersey_${i}_number">Jersey Number *</label>
                        <input type="number" id="jersey_${i}_number" name="jersey_${i}_number" required 
                            placeholder="Enter jersey number" min="1" max="99" />
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="jersey_${i}_size_category">Size Category *</label>
                        <select id="jersey_${i}_size_category" name="jersey_${i}_size_category" required>
                            <option value="">Select Size Category</option>
                            <option value="Adult">Adult</option>
                            <option value="Kids">Kids</option>
                            <option value="Muslima">Muslima</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="jersey_${i}_size">Size *</label>
                        <select id="jersey_${i}_size" name="jersey_${i}_size" required>
                            <option value="">Select Size</option>
                            <option value="XS">XS</option>
                            <option value="S">S</option>
                            <option value="M">M</option>
                            <option value="L">L</option>
                            <option value="XL">XL</option>
                            <option value="2XL">2XL</option>
                            <option value="3XL">3XL</option>
                            <option value="4XL">4XL</option>
                            <option value="5XL">5XL</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="jersey_${i}_sleeve">Sleeve *</label>
                        <select id="jersey_${i}_sleeve" name="jersey_${i}_sleeve" required>
                            <option value="">Select Sleeve</option>
                            <option value="Short Sleeve">Short Sleeve</option>
                            <option value="Long Sleeve">Long Sleeve</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="jersey_${i}_shorts">Shorts *</label>
                        <select id="jersey_${i}_shorts" name="jersey_${i}_shorts" required>
                            <option value="">Select Shorts</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label for="jersey_${i}_color">Jersey Color *</label>
                        <select id="jersey_${i}_color" name="jersey_${i}_color" required>
                            <option value="">Select Color</option>
                            <option value="Red">Red</option>
                            <option value="Blue">Blue</option>
                            <option value="Green">Green</option>
                            <option value="White">White</option>
                            <option value="Black">Black</option>
                            <option value="Yellow">Yellow</option>
                            <option value="Orange">Orange</option>
                            <option value="Purple">Purple</option>
                            <option value="Custom">Custom (Specify in Additional Details)</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="jersey_${i}_material">Material Preference</label>
                        <select id="jersey_${i}_material" name="jersey_${i}_material">
                            <option value="">Select Material</option>
                            <option value="Polyester">Polyester</option>
                            <option value="Cotton Blend">Cotton Blend</option>
                            <option value="Dri-Fit">Dri-Fit</option>
                            <option value="Mesh">Mesh</option>
                            <option value="No Preference">No Preference</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="jersey_${i}_printing">Printing Style</label>
                        <select id="jersey_${i}_printing" name="jersey_${i}_printing">
                            <option value="">Select Printing</option>
                            <option value="Screen Print">Screen Print</option>
                            <option value="Heat Transfer">Heat Transfer</option>
                            <option value="Embroidery">Embroidery</option>
                            <option value="No Preference">No Preference</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label for="jersey_${i}_additional">Additional Details & Special Requirements</label>
                    <textarea id="jersey_${i}_additional" name="jersey_${i}_additional" rows="3" 
                        placeholder="Any special requirements, custom text, logo placement, specific measurements, etc."></textarea>
                </div>
            </div>
        `;
    }
    return html;
}

// Submit customer details
function submitCustomerDetails(event) {
    event.preventDefault();
    
    if (!currentOrder) {
        showError('No order found. Please refresh the page and try again.');
        return;
    }
    
    const formData = new FormData(event.target);
    const customerDetails = [];
    
    // Validate and collect details for each jersey
    for (let i = 0; i < currentOrder.jerseyQuantity; i++) {
        const type = formData.get(`jersey_${i}_type`);
        const name = formData.get(`jersey_${i}_name`);
        const number = formData.get(`jersey_${i}_number`);
        const sizeCategory = formData.get(`jersey_${i}_size_category`);
        const size = formData.get(`jersey_${i}_size`);
        const sleeve = formData.get(`jersey_${i}_sleeve`);
        const shorts = formData.get(`jersey_${i}_shorts`);
        const color = formData.get(`jersey_${i}_color`);
        const material = formData.get(`jersey_${i}_material`);
        const printing = formData.get(`jersey_${i}_printing`);
        const additionalDetails = formData.get(`jersey_${i}_additional`);
        
        if (!type || !name || !number || !sizeCategory || !size || !sleeve || !shorts || !color) {
            showError(`Please fill in all required fields for Jersey ${i + 1}.`);
            return;
        }
        
        customerDetails.push({
            type,
            name,
            number: parseInt(number),
            sizeCategory,
            size,
            sleeve,
            shorts,
            color,
            material: material || 'No Preference',
            printing: printing || 'No Preference',
            additionalDetails: additionalDetails || ''
        });
    }
    
    // Show loading state
    const form = event.target;
    form.classList.add('form-submitting');
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
    
    // Simulate API call delay
    setTimeout(() => {
        // Update the order with customer details
        const orders = JSON.parse(localStorage.getItem('jerseyOrders') || '[]');
        const orderIndex = orders.findIndex(o => o.id === currentOrder.id);
        
        if (orderIndex !== -1) {
            orders[orderIndex].customerDetails = customerDetails;
            orders[orderIndex].detailsSubmittedDate = new Date().toISOString();
            orders[orderIndex].status = 'details_submitted';
            
            // Save updated orders
            localStorage.setItem('jerseyOrders', JSON.stringify(orders));
            
            // Show success message
            showSuccessMessage();
        } else {
            showError('Failed to update order. Please try again.');
            form.classList.remove('form-submitting');
            submitBtn.innerHTML = originalText;
        }
    }, 2000);
}

// Show success message
function showSuccessMessage() {
    document.getElementById('orderInfo').style.display = 'none';
    document.getElementById('detailsForm').style.display = 'none';
    document.getElementById('successMessage').style.display = 'block';
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Show error message
function showError(message) {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());
    
    // Create new alert
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-error';
    alertDiv.innerHTML = `
        <i class="fas fa-exclamation-circle"></i>
        ${message}
    `;
    
    // Insert at the top of main content
    const main = document.querySelector('.customer-main');
    main.insertBefore(alertDiv, main.firstChild);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
        }
    }, 5000);
}

// Show success message
function showSuccess(message) {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());
    
    // Create new alert
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success';
    alertDiv.innerHTML = `
        <i class="fas fa-check-circle"></i>
        ${message}
    `;
    
    // Insert at the top of main content
    const main = document.querySelector('.customer-main');
    main.insertBefore(alertDiv, main.firstChild);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
        }
    }, 5000);
}

// Utility function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

// Add status badge styles
const style = document.createElement('style');
style.textContent = `
    .status-badge {
        padding: 0.25rem 0.75rem;
        border-radius: 20px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: none;
        letter-spacing: 0.5px;
        font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
    }
    
    .status-pending {
        background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%) !important;
        color: #dc2626 !important;
    }
    
    .status-approved {
        background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%) !important;
        color: #166534 !important;
    }
    
    .status-processing {
        background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%) !important;
        color: #1e40af !important;
    }
    
    .status-shipped {
        background: linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%) !important;
        color: #3730a3 !important;
    }
    
    .status-delivered {
        background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%) !important;
        color: #166534 !important;
    }
    
    .status-details_submitted {
        background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%) !important;
        color: #d97706 !important;
    }
    
    .status-rejected {
        background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%) !important;
        color: #dc2626 !important;
    }
    
    .status-cancelled {
        background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%) !important;
        color: #374151 !important;
    }
`;
document.head.appendChild(style);

// Counter functionality
function addCounterEventListeners() {
    if (!currentOrder) return;
    
    // Add event listeners to all form fields
    for (let i = 0; i < currentOrder.jerseyQuantity; i++) {
        const typeSelect = document.getElementById(`jersey_${i}_type`);
        const sizeCategorySelect = document.getElementById(`jersey_${i}_size_category`);
        const sleeveSelect = document.getElementById(`jersey_${i}_sleeve`);
        
        if (typeSelect) {
            typeSelect.addEventListener('change', updateCounters);
        }
        if (sizeCategorySelect) {
            sizeCategorySelect.addEventListener('change', updateCounters);
        }
        if (sleeveSelect) {
            sleeveSelect.addEventListener('change', updateCounters);
        }
    }
}

function updateCounters() {
    if (!currentOrder) return;
    
    // Initialize counters
    const counters = {
        'Player Jersey': 0,
        'Keeper Jersey': 0,
        'Official Jersey': 0,
        'Training Jersey': 0,
        'Warm-up Jersey': 0,
        'Adult': 0,
        'Kids': 0,
        'Muslima': 0,
        'Short Sleeve': 0,
        'Long Sleeve': 0
    };
    
    // Count selections for each jersey
    for (let i = 0; i < currentOrder.jerseyQuantity; i++) {
        const typeSelect = document.getElementById(`jersey_${i}_type`);
        const sizeCategorySelect = document.getElementById(`jersey_${i}_size_category`);
        const sleeveSelect = document.getElementById(`jersey_${i}_sleeve`);
        
        if (typeSelect && typeSelect.value) {
            counters[typeSelect.value] = (counters[typeSelect.value] || 0) + 1;
        }
        
        if (sizeCategorySelect && sizeCategorySelect.value) {
            counters[sizeCategorySelect.value] = (counters[sizeCategorySelect.value] || 0) + 1;
        }
        
        if (sleeveSelect && sleeveSelect.value) {
            counters[sleeveSelect.value] = (counters[sleeveSelect.value] || 0) + 1;
        }
    }
    
    // Update counter display
    updateCounterDisplay('count-player-jersey', counters['Player Jersey']);
    updateCounterDisplay('count-keeper-jersey', counters['Keeper Jersey']);
    updateCounterDisplay('count-official-jersey', counters['Official Jersey']);
    updateCounterDisplay('count-training-jersey', counters['Training Jersey']);
    updateCounterDisplay('count-warmup-jersey', counters['Warm-up Jersey']);
    updateCounterDisplay('count-adult', counters['Adult']);
    updateCounterDisplay('count-kids', counters['Kids']);
    updateCounterDisplay('count-muslima', counters['Muslima']);
    updateCounterDisplay('count-short-sleeve', counters['Short Sleeve']);
    updateCounterDisplay('count-long-sleeve', counters['Long Sleeve']);
}

function updateCounterDisplay(elementId, count) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = count;
        
        // Add animation class for visual feedback
        element.classList.add('counter-updated');
        setTimeout(() => {
            element.classList.remove('counter-updated');
        }, 300);
    }
}
