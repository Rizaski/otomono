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
        </p>
        
        <form id="customerDetailsForm" onsubmit="submitCustomerDetails(event)">
            <div id="jerseyDetailsContainer">
                ${generateJerseyDetailsForm(currentOrder.jerseyQuantity)}
            </div>
            
            <div class="form-actions" style="margin-top: 2rem; text-align: center;">
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save"></i> Submit Details
                </button>
            </div>
        </form>
    `;
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
                        <label for="jersey_${i}_size">Size *</label>
                        <select id="jersey_${i}_size" name="jersey_${i}_size" required>
                            <option value="">Select Size</option>
                            <option value="XS">XS - Extra Small</option>
                            <option value="S">S - Small</option>
                            <option value="M">M - Medium</option>
                            <option value="L">L - Large</option>
                            <option value="XL">XL - Extra Large</option>
                            <option value="XXL">XXL - 2X Large</option>
                            <option value="XXXL">XXXL - 3X Large</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="jersey_${i}_color">Color *</label>
                        <select id="jersey_${i}_color" name="jersey_${i}_color" required>
                            <option value="">Select Color</option>
                            <option value="Red">Red</option>
                            <option value="Blue">Blue</option>
                            <option value="Green">Green</option>
                            <option value="Yellow">Yellow</option>
                            <option value="Black">Black</option>
                            <option value="White">White</option>
                            <option value="Purple">Purple</option>
                            <option value="Orange">Orange</option>
                            <option value="Pink">Pink</option>
                            <option value="Gray">Gray</option>
                            <option value="Navy">Navy</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="jersey_${i}_type">Type *</label>
                        <select id="jersey_${i}_type" name="jersey_${i}_type" required>
                            <option value="">Select Type</option>
                            <option value="Home Jersey">Home Jersey</option>
                            <option value="Away Jersey">Away Jersey</option>
                            <option value="Training Jersey">Training Jersey</option>
                            <option value="Goalkeeper Jersey">Goalkeeper Jersey</option>
                            <option value="Warm-up Jersey">Warm-up Jersey</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="jersey_${i}_design">Design *</label>
                        <select id="jersey_${i}_design" name="jersey_${i}_design" required>
                            <option value="">Select Design</option>
                            <option value="Plain">Plain</option>
                            <option value="Stripes">Stripes</option>
                            <option value="Checks">Checks</option>
                            <option value="Custom Logo">Custom Logo</option>
                            <option value="Numbered">Numbered</option>
                            <option value="V-neck">V-neck</option>
                            <option value="Collar">Collar</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label for="jersey_${i}_additional">Additional Details</label>
                    <textarea id="jersey_${i}_additional" name="jersey_${i}_additional" rows="3" 
                        placeholder="Any special requirements, player name, number, custom text, etc."></textarea>
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
        const size = formData.get(`jersey_${i}_size`);
        const color = formData.get(`jersey_${i}_color`);
        const type = formData.get(`jersey_${i}_type`);
        const design = formData.get(`jersey_${i}_design`);
        const additionalDetails = formData.get(`jersey_${i}_additional`);
        
        if (!size || !color || !type || !design) {
            showError(`Please fill in all required fields for Jersey ${i + 1}.`);
            return;
        }
        
        customerDetails.push({
            size,
            color,
            type,
            design,
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
        font-size: 0.8rem;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
    }
    
    .status-pending {
        background: #fff3cd;
        color: #856404;
    }
    
    .status-approved {
        background: #d4edda;
        color: #155724;
    }
    
    .status-rejected {
        background: #f8d7da;
        color: #721c24;
    }
    
    .status-details_submitted {
        background: #d1ecf1;
        color: #0c5460;
    }
`;
document.head.appendChild(style);
