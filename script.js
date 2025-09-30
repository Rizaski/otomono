// Global variables
let orders = [];
let currentOrderId = null;
let isLoading = false;

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    showLoadingState();
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate loading
    loadOrders();
    updateStatistics();
    renderOrdersTable();
    hideLoadingState();
}

// Loading State Functions
function showLoadingState() {
    const main = document.querySelector('.admin-main');
    const loadingDiv = document.createElement('div');
    loadingDiv.id = 'loadingState';
    loadingDiv.className = 'loading-overlay';
    loadingDiv.innerHTML = `
        <div class="loading-content">
            <div class="loading-spinner"></div>
            <p>Loading dashboard...</p>
        </div>
    `;
    main.appendChild(loadingDiv);
}

function hideLoadingState() {
    const loadingDiv = document.getElementById('loadingState');
    if (loadingDiv) {
        loadingDiv.style.opacity = '0';
        setTimeout(() => loadingDiv.remove(), 300);
    }
}

function showButtonLoading(button, text = 'Loading...') {
    const originalText = button.innerHTML;
    button.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${text}`;
    button.disabled = true;
    return () => {
        button.innerHTML = originalText;
        button.disabled = false;
    };
}

// Order Management Functions
async function addOrder(event) {
    event.preventDefault();
    
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const resetButton = showButtonLoading(submitBtn, 'Creating Order...');
    
    try {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
        
        const formData = new FormData(event.target);
        const order = {
            id: generateOrderId(),
            customerName: formData.get('customerName'),
            customerEmail: formData.get('customerEmail'),
            customerPhone: formData.get('customerPhone'),
            jerseyQuantity: parseInt(formData.get('jerseyQuantity')),
            specialInstructions: formData.get('specialInstructions'),
            status: 'pending',
            createdDate: new Date().toISOString(),
            customerDetails: null,
            uniqueLink: null,
            notifications: []
        };
        
        orders.push(order);
        saveOrders();
        updateStatistics();
        renderOrdersTable();
        closeModal('addOrderModal');
        event.target.reset();
        
        showAlert('Order created successfully!', 'success');
    } catch (error) {
        showAlert('Failed to create order. Please try again.', 'error');
    } finally {
        resetButton();
    }
}

function generateOrderId() {
    return 'ORD-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
}

function generateUniqueLink(orderId) {
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?order=${orderId}&action=details`;
}

function showOrderDetails(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    currentOrderId = orderId;
    
    const modalContent = document.getElementById('orderDetailsContent');
    modalContent.innerHTML = `
        <div class="order-info">
            <h3><i class="fas fa-info-circle"></i> Order Information</h3>
            <div class="info-grid">
                <div class="info-item">
                    <strong>Order ID</strong>
                    <span>${order.id}</span>
                </div>
                <div class="info-item">
                    <strong>Customer Name</strong>
                    <span>${order.customerName}</span>
                </div>
                <div class="info-item">
                    <strong>Email</strong>
                    <span>${order.customerEmail}</span>
                </div>
                <div class="info-item">
                    <strong>Phone</strong>
                    <span>${order.customerPhone}</span>
                </div>
                <div class="info-item">
                    <strong>Quantity</strong>
                    <span>${order.jerseyQuantity}</span>
                </div>
                <div class="info-item">
                    <strong>Status</strong>
                    <span class="status-badge status-${order.status}">${order.status}</span>
                </div>
                <div class="info-item">
                    <strong>Created Date</strong>
                    <span>${formatDate(order.createdDate)}</span>
                </div>
            </div>
            
            ${order.specialInstructions ? `
                <div class="info-item">
                    <strong>Special Instructions</strong>
                    <span>${order.specialInstructions}</span>
                </div>
            ` : ''}
            
            ${order.uniqueLink ? `
                <div class="unique-link">
                    <h4><i class="fas fa-link"></i> Customer Details Link</h4>
                    <a href="${order.uniqueLink}" target="_blank">${order.uniqueLink}</a>
                    <p style="margin-top: 0.5rem; color: #666; font-size: 0.9rem;">
                        Share this link with the customer to collect jersey details.
                    </p>
                </div>
            ` : ''}
            
            ${order.customerDetails ? `
                <h3 style="margin-top: 2rem;"><i class="fas fa-tshirt"></i> Customer Jersey Details</h3>
                <div class="customer-details">
                    ${order.customerDetails.map((detail, index) => `
                        <div class="jersey-item">
                            <h4><i class="fas fa-tshirt"></i> Jersey ${index + 1}</h4>
                            <div class="form-row">
                                <div class="info-item">
                                    <strong>Size</strong>
                                    <span>${detail.size}</span>
                                </div>
                                <div class="info-item">
                                    <strong>Color</strong>
                                    <span>${detail.color}</span>
                                </div>
                                <div class="info-item">
                                    <strong>Type</strong>
                                    <span>${detail.type}</span>
                                </div>
                                <div class="info-item">
                                    <strong>Design</strong>
                                    <span>${detail.design}</span>
                                </div>
                            </div>
                            ${detail.additionalDetails ? `
                                <div class="info-item">
                                    <strong>Additional Details</strong>
                                    <span>${detail.additionalDetails}</span>
                                </div>
                            ` : ''}
                        </div>
                    `).join('')}
                </div>
            ` : ''}
            
            <div class="form-actions">
                ${order.status === 'pending' ? `
                    <button class="btn btn-success" onclick="approveOrder('${order.id}')">
                        <i class="fas fa-check"></i> Approve Order
                    </button>
                    <button class="btn btn-danger" onclick="rejectOrder('${order.id}')">
                        <i class="fas fa-times"></i> Reject Order
                    </button>
                ` : ''}
                
                ${!order.uniqueLink ? `
                    <button class="btn btn-primary" onclick="generateCustomerLink('${order.id}')">
                        <i class="fas fa-link"></i> Generate Customer Link
                    </button>
                ` : ''}
                
                <button class="btn btn-warning" onclick="showNotificationModal('${order.id}')">
                    <i class="fas fa-envelope"></i> Send Notification
                </button>
                
                <button class="btn btn-secondary" onclick="closeModal('orderDetailsModal')">
                    Close
                </button>
            </div>
        </div>
    `;
    
    showModal('orderDetailsModal');
}

function generateCustomerLink(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    const uniqueLink = generateUniqueLink(orderId);
    order.uniqueLink = uniqueLink;
    
    saveOrders();
    showOrderDetails(orderId);
    showAlert('Customer link generated successfully!', 'success');
}

function approveOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    order.status = 'approved';
    order.approvedDate = new Date().toISOString();
    
    saveOrders();
    updateStatistics();
    renderOrdersTable();
    closeModal('orderDetailsModal');
    
    // Auto-send approval notification
    sendAutoNotification(order, 'approved');
    showAlert('Order approved successfully!', 'success');
}

function rejectOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    order.status = 'rejected';
    order.rejectedDate = new Date().toISOString();
    
    saveOrders();
    updateStatistics();
    renderOrdersTable();
    closeModal('orderDetailsModal');
    
    // Auto-send rejection notification
    sendAutoNotification(order, 'rejected');
    showAlert('Order rejected successfully!', 'success');
}

// Customer Details Collection
function showCustomerDetailsForm(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    const modalContent = document.getElementById('customerDetailsContent');
    modalContent.innerHTML = `
        <div class="customer-details-form">
            <h3><i class="fas fa-tshirt"></i> Jersey Details Collection</h3>
            <p style="color: #666; margin-bottom: 1.5rem;">
                Please provide details for ${order.jerseyQuantity} jersey(s):
            </p>
            
            <form id="customerDetailsForm" onsubmit="submitCustomerDetails(event, '${orderId}')">
                <div id="jerseyDetailsContainer">
                    ${generateJerseyDetailsForm(order.jerseyQuantity)}
                </div>
                
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">
                        <i class="fas fa-save"></i> Submit Details
                    </button>
                </div>
            </form>
        </div>
    `;
    
    showModal('customerDetailsModal');
}

function generateJerseyDetailsForm(quantity) {
    let html = '';
    for (let i = 0; i < quantity; i++) {
        html += `
            <div class="jersey-item">
                <h4><i class="fas fa-tshirt"></i> Jersey ${i + 1}</h4>
                <div class="form-row">
                    <div class="form-group">
                        <label>Size *</label>
                        <select name="jersey_${i}_size" required>
                            <option value="">Select Size</option>
                            <option value="XS">XS</option>
                            <option value="S">S</option>
                            <option value="M">M</option>
                            <option value="L">L</option>
                            <option value="XL">XL</option>
                            <option value="XXL">XXL</option>
                            <option value="XXXL">XXXL</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Color *</label>
                        <select name="jersey_${i}_color" required>
                            <option value="">Select Color</option>
                            <option value="Red">Red</option>
                            <option value="Blue">Blue</option>
                            <option value="Green">Green</option>
                            <option value="Yellow">Yellow</option>
                            <option value="Black">Black</option>
                            <option value="White">White</option>
                            <option value="Purple">Purple</option>
                            <option value="Orange">Orange</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Type *</label>
                        <select name="jersey_${i}_type" required>
                            <option value="">Select Type</option>
                            <option value="Home Jersey">Home Jersey</option>
                            <option value="Away Jersey">Away Jersey</option>
                            <option value="Training Jersey">Training Jersey</option>
                            <option value="Goalkeeper Jersey">Goalkeeper Jersey</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Design *</label>
                        <select name="jersey_${i}_design" required>
                            <option value="">Select Design</option>
                            <option value="Plain">Plain</option>
                            <option value="Stripes">Stripes</option>
                            <option value="Checks">Checks</option>
                            <option value="Custom Logo">Custom Logo</option>
                            <option value="Numbered">Numbered</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Additional Details</label>
                    <textarea name="jersey_${i}_additional" rows="2" placeholder="Any special requirements, player name, number, etc."></textarea>
                </div>
            </div>
        `;
    }
    return html;
}

function submitCustomerDetails(event, orderId) {
    event.preventDefault();
    
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    const formData = new FormData(event.target);
    const customerDetails = [];
    
    for (let i = 0; i < order.jerseyQuantity; i++) {
        const detail = {
            size: formData.get(`jersey_${i}_size`),
            color: formData.get(`jersey_${i}_color`),
            type: formData.get(`jersey_${i}_type`),
            design: formData.get(`jersey_${i}_design`),
            additionalDetails: formData.get(`jersey_${i}_additional`)
        };
        customerDetails.push(detail);
    }
    
    order.customerDetails = customerDetails;
    order.detailsSubmittedDate = new Date().toISOString();
    
    saveOrders();
    closeModal('customerDetailsModal');
    
    // Auto-send details received notification
    sendAutoNotification(order, 'details_received');
    showAlert('Jersey details submitted successfully!', 'success');
}

// Notification System
function showNotificationModal(orderId) {
    currentOrderId = orderId;
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    const modalContent = document.getElementById('notificationForm');
    const messageField = document.getElementById('notificationMessage');
    
    // Pre-fill message based on order status
    let defaultMessage = '';
    if (order.status === 'pending') {
        defaultMessage = `Hello ${order.customerName},\n\nYour jersey order (${order.id}) is currently being processed. We will notify you once it's ready.\n\nThank you for your order!`;
    } else if (order.status === 'approved') {
        defaultMessage = `Hello ${order.customerName},\n\nGreat news! Your jersey order (${order.id}) has been approved and is now in production.\n\nWe will notify you once it's ready for pickup/delivery.\n\nThank you for your order!`;
    } else if (order.status === 'rejected') {
        defaultMessage = `Hello ${order.customerName},\n\nWe regret to inform you that your jersey order (${order.id}) has been rejected.\n\nPlease contact us for more information.\n\nThank you for your understanding.`;
    }
    
    messageField.value = defaultMessage;
    showModal('notificationModal');
}

function sendNotification(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const notificationType = formData.get('notificationType');
    const message = formData.get('message');
    
    const order = orders.find(o => o.id === currentOrderId);
    if (!order) return;
    
    // Simulate sending notification
    const notification = {
        id: generateNotificationId(),
        orderId: currentOrderId,
        type: notificationType,
        message: message,
        sentDate: new Date().toISOString(),
        status: 'sent'
    };
    
    if (!order.notifications) {
        order.notifications = [];
    }
    order.notifications.push(notification);
    
    saveOrders();
    closeModal('notificationModal');
    
    // Show success message
    const method = notificationType === 'email' ? 'Email' : 'SMS';
    showAlert(`${method} notification sent successfully to ${order.customerEmail}!`, 'success');
}

function sendAutoNotification(order, type) {
    let message = '';
    let notificationType = 'email';
    
    switch (type) {
        case 'approved':
            message = `Hello ${order.customerName},\n\nGreat news! Your jersey order (${order.id}) has been approved and is now in production.\n\nWe will notify you once it's ready for pickup/delivery.\n\nThank you for your order!`;
            break;
        case 'rejected':
            message = `Hello ${order.customerName},\n\nWe regret to inform you that your jersey order (${order.id}) has been rejected.\n\nPlease contact us for more information.\n\nThank you for your understanding.`;
            break;
        case 'details_received':
            message = `Hello ${order.customerName},\n\nThank you for submitting your jersey details for order ${order.id}.\n\nWe will review your details and notify you of the approval status soon.\n\nThank you for your order!`;
            break;
    }
    
    const notification = {
        id: generateNotificationId(),
        orderId: order.id,
        type: notificationType,
        message: message,
        sentDate: new Date().toISOString(),
        status: 'sent',
        autoGenerated: true
    };
    
    if (!order.notifications) {
        order.notifications = [];
    }
    order.notifications.push(notification);
    
    saveOrders();
    
    // Show notification sent message
    showAlert(`Auto-notification sent to ${order.customerEmail}!`, 'info');
}

function generateNotificationId() {
    return 'NOTIF-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5).toUpperCase();
}

// UI Functions
function showModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    document.body.style.overflow = 'auto';
}

function showAddOrderModal() {
    showModal('addOrderModal');
}

function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    // Insert at the top of the main content
    const main = document.querySelector('.admin-main');
    main.insertBefore(alertDiv, main.firstChild);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.parentNode.removeChild(alertDiv);
        }
    }, 5000);
}

// Table Functions
function renderOrdersTable() {
    const tbody = document.getElementById('ordersTableBody');
    const filteredOrders = getFilteredOrders();
    
    tbody.innerHTML = filteredOrders.map(order => `
        <tr>
            <td>${order.id}</td>
            <td>${order.customerName}</td>
            <td>${order.customerEmail}</td>
            <td>${order.customerPhone}</td>
            <td><span class="status-badge status-${order.status}">${order.status}</span></td>
            <td>${formatDate(order.createdDate)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-primary" onclick="showOrderDetails('${order.id}')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    ${order.uniqueLink ? `
                        <button class="btn btn-sm btn-warning" onclick="showCustomerDetailsForm('${order.id}')">
                            <i class="fas fa-edit"></i> Details
                        </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

function getFilteredOrders() {
    const statusFilter = document.getElementById('statusFilter').value;
    const searchTerm = document.getElementById('searchOrders').value.toLowerCase();
    
    return orders.filter(order => {
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        const matchesSearch = !searchTerm || 
            order.id.toLowerCase().includes(searchTerm) ||
            order.customerName.toLowerCase().includes(searchTerm) ||
            order.customerEmail.toLowerCase().includes(searchTerm);
        
        return matchesStatus && matchesSearch;
    });
}

function filterOrders() {
    renderOrdersTable();
}

function searchOrders() {
    renderOrdersTable();
}

function updateStatistics() {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const approvedOrders = orders.filter(o => o.status === 'approved').length;
    const rejectedOrders = orders.filter(o => o.status === 'rejected').length;
    
    document.getElementById('totalOrders').textContent = totalOrders;
    document.getElementById('pendingOrders').textContent = pendingOrders;
    document.getElementById('approvedOrders').textContent = approvedOrders;
    document.getElementById('rejectedOrders').textContent = rejectedOrders;
}

// Utility Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

// Data Persistence
function saveOrders() {
    localStorage.setItem('jerseyOrders', JSON.stringify(orders));
}

function loadOrders() {
    const savedOrders = localStorage.getItem('jerseyOrders');
    if (savedOrders) {
        orders = JSON.parse(savedOrders);
    }
}

// Handle URL parameters for customer details collection
function handleUrlParameters() {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('order');
    const action = urlParams.get('action');
    
    if (orderId && action === 'details') {
        const order = orders.find(o => o.id === orderId);
        if (order) {
            showCustomerDetailsForm(orderId);
        } else {
            showAlert('Order not found!', 'error');
        }
    }
}

// Initialize URL parameter handling
document.addEventListener('DOMContentLoaded', function() {
    handleUrlParameters();
});

// Close modals when clicking outside
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    });
}
