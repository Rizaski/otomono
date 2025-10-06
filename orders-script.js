// Orders Page Script
let orders = [];
let currentOrderId = null;
let isLoading = false;

// Initialize DataManager
let dataManager;

// Initialize the orders page
document.addEventListener('DOMContentLoaded', function() {
    initializeOrdersPage();
});

async function initializeOrdersPage() {
    // Initialize DataManager
    dataManager = window.dataManager;
    if (!dataManager) {
        console.error('DataManager not loaded. Please include data-manager.js');
        return;
    }
    
    // Load orders from DataManager
    loadOrders();
    renderOrdersTable();
}

// Loading State Functions
function showLoadingState() { /* no-op */ }

function hideLoadingState() { /* no-op */ }

function showButtonLoading(button, text = 'Loading...') {
    const originalText = button.innerHTML;
    button.innerHTML = `
        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 16px; height: 16px; margin-right: 6px; animation: spin 1s linear infinite;">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
        </svg>
        ${text}
    `;
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
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const formData = new FormData(event.target);
        const order = {
            id: generateOrderId(),
            customerName: formData.get('customerName'),
            customerEmail: formData.get('customerEmail'),
            customerPhone: formData.get('customerPhone'),
            jerseyQuantity: parseInt(formData.get('jerseyQuantity')),
            materialType: formData.get('materialType'),
            specialInstructions: formData.get('specialInstructions'),
            status: 'pending',
            createdDate: new Date().toISOString(),
            customerDetails: null,
            uniqueLink: null,
            notifications: []
        };
        
        orders.push(order);
        saveOrders();
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
    // Get the current URL and construct the customer link
    const currentUrl = window.location.href;
    
    // Handle different URL patterns
    let baseUrl;
    
    if (currentUrl.includes('orders.html')) {
        // Replace orders.html with customer.html
        baseUrl = currentUrl.replace(/orders\.html.*$/, '');
    } else {
        // Fallback: use origin and pathname
        baseUrl = window.location.origin + window.location.pathname.replace(/orders\.html.*$/, '');
    }
    
    // Ensure baseUrl ends with / if it doesn't already
    if (!baseUrl.endsWith('/') && !baseUrl.endsWith('.html')) {
        baseUrl += '/';
    }
    // Optionally embed minimal order payload as base64 for environments without storage/DB
    const order = orders.find(o => o.id === orderId);
    let payloadParam = '';
    if (order) {
        try {
            const minimalOrder = {
                id: order.id,
                customerName: order.customerName,
                customerEmail: order.customerEmail,
                customerPhone: order.customerPhone,
                jerseyQuantity: order.jerseyQuantity,
                materialType: order.materialType,
                status: order.status,
                specialInstructions: order.specialInstructions || '',
                createdDate: order.createdDate
            };
            const json = JSON.stringify(minimalOrder);
            const base64 = btoa(unescape(encodeURIComponent(json)));
            payloadParam = `&payload=${base64}`;
        } catch (e) {
            console.warn('Failed to encode payload for customer link', e);
        }
    }

    const customerLink = `${baseUrl}customer.html?order=${orderId}&action=details${payloadParam}`;
    
    // Debug logging
    console.log('Generating customer link:');
    console.log('- Current URL:', currentUrl);
    console.log('- Base URL:', baseUrl);
    console.log('- Order ID:', orderId);
    console.log('- Generated Link:', customerLink);
    
    return customerLink;
}

function showAddOrderModal() {
    showModal('addOrderModal');
}

function showOrderDetails(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    currentOrderId = orderId;
    
    const modalContent = document.getElementById('orderDetailsContent');
    modalContent.innerHTML = `
        <div class="order-info">
            <h3>
                <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 16px; height: 16px; margin-right: 8px;">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                Order Information
            </h3>
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
                ${order.materialType ? `
                <div class="info-item">
                    <strong>Material</strong>
                    <span>${order.materialType}</span>
                </div>` : ''}
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
                    <h4>Customer Details Link</h4>
                    <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
                        <a href="${order.uniqueLink}" target="_blank">${order.uniqueLink}</a>
                        <button class="btn btn-xs btn-secondary" onclick="copyToClipboard('${order.uniqueLink}', this)">Copy</button>
                    </div>
                    ${order.shortLink ? `
                    <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin-top:6px;">
                        <a href="${order.shortLink}" target="_blank">${order.shortLink}</a>
                        <button class="btn btn-xs btn-secondary" onclick="copyToClipboard('${order.shortLink}', this)">Copy</button>
                    </div>
                    ` : `
                    <div style="color:#888; font-size:0.85rem; margin-top:6px;">Generating short link...</div>
                    `}
                    <p style="margin-top: 0.5rem; color: #666; font-size: 0.9rem;">
                        Share this link with the customer to collect jersey details.
                    </p>
                </div>
            ` : ''}
            
            ${order.customerDetails ? `
                <h3 style="margin-top: 2rem;">Customer Jersey Details</h3>
                <div class="customer-details">
                    ${order.customerDetails.map((detail, index) => `
                        <div class="jersey-item">
                            <h4>Jersey ${index + 1}</h4>
                            <div class="form-row">
                                <div class="info-item">
                                    <strong>Jersey Type</strong>
                                    <span>${detail.type}</span>
                                </div>
                                <div class="info-item">
                                    <strong>Jersey Name</strong>
                                    <span>${detail.name}</span>
                                </div>
                                <div class="info-item">
                                    <strong>Jersey Number</strong>
                                    <span>${detail.number}</span>
                                </div>
                                <div class="info-item">
                                    <strong>Size Category</strong>
                                    <span>${detail.sizeCategory}</span>
                                </div>
                            </div>
                            <div class="form-row">
                                <div class="info-item">
                                    <strong>Size</strong>
                                    <span>${detail.size}</span>
                                </div>
                                <div class="info-item">
                                    <strong>Sleeve</strong>
                                    <span>${detail.sleeve}</span>
                                </div>
                                <div class="info-item">
                                    <strong>Shorts</strong>
                                    <span>${detail.shorts}</span>
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
                        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 16px; height: 16px; margin-right: 6px;">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M5 13l4 4L19 7"/>
                        </svg>
                        Approve Order
                    </button>
                    <button class="btn btn-danger" onclick="rejectOrder('${order.id}')">
                        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 16px; height: 16px; margin-right: 6px;">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                        Reject Order
                    </button>
                ` : ''}
                
                ${!order.uniqueLink ? `
                    <button class="btn btn-primary" onclick="generateCustomerLink('${order.id}')">
                        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 16px; height: 16px; margin-right: 6px;">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/>
                        </svg>
                        Generate Customer Link
                    </button>
                ` : ''}
                
                <button class="btn btn-warning" onclick="showNotificationModal('${order.id}')">
                    <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 16px; height: 16px; margin-right: 6px;">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                    Send Notification
                </button>
                
                <button class="btn btn-secondary" onclick="closeModal('orderDetailsModal')">
                    Close
                </button>
            </div>
        </div>
    `;
    
    showModal('orderDetailsModal');
    
    // Add mobile gesture support
    addMobileGestures();
}

// Logout functionality
function logout() {
    // Clear any stored authentication data
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('username');
    localStorage.removeItem('loginTime');
    
    // Redirect to login page
    window.location.href = 'login.html';
}

// Profile dropdown functionality
function toggleProfileDropdown() {
    const dropdown = document.getElementById('profileDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('profileDropdown');
    const profileButton = event.target.closest('.profile-dropdown button');
    
    if (dropdown && !profileButton && !event.target.closest('.profile-dropdown-content')) {
        dropdown.classList.remove('show');
    }
});

// Mobile gesture support for modal
function addMobileGestures() {
    const modal = document.getElementById('orderDetailsModal');
    const modalContent = modal.querySelector('.modal-content');
    
    if (!modalContent) return;
    
    let startY = 0;
    let currentY = 0;
    let isDragging = false;
    
    // Touch events for mobile swipe-to-close
    modalContent.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
        isDragging = true;
    });
    
    modalContent.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        
        currentY = e.touches[0].clientY;
        const deltaY = currentY - startY;
        
        // Only allow downward swipe
        if (deltaY > 0) {
            modalContent.style.transform = `translateY(${deltaY}px)`;
            modalContent.style.opacity = Math.max(0.3, 1 - (deltaY / 200));
        }
    });
    
    modalContent.addEventListener('touchend', (e) => {
        if (!isDragging) return;
        
        const deltaY = currentY - startY;
        
        // Close modal if swiped down more than 100px
        if (deltaY > 100) {
            closeModal('orderDetailsModal');
        } else {
            // Reset position
            modalContent.style.transform = '';
            modalContent.style.opacity = '';
        }
        
        isDragging = false;
    });
    
    // Prevent modal close when clicking inside content
    modalContent.addEventListener('click', (e) => {
        e.stopPropagation();
    });
    
    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal('orderDetailsModal');
        }
    });
}

function generateCustomerLink(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    const uniqueLink = generateUniqueLink(orderId);
    order.uniqueLink = uniqueLink;
    // Try to generate a short URL; non-blocking for UX
    generateShortLink(uniqueLink).then(shortUrl => {
        if (shortUrl) {
            order.shortLink = shortUrl;
            saveOrders();
            // Re-render details section if open
            showOrderDetails(orderId);
        }
    }).catch(() => {});
    
    saveOrders();
    showOrderDetails(orderId);
    showAlert('Customer link generated successfully!', 'success');
}

async function generateShortLink(longUrl) {
    // Primary: shrtco.de
    try {
        const res = await fetch(`https://api.shrtco.de/v2/shorten?url=${encodeURIComponent(longUrl)}`);
        if (res.ok) {
            const data = await res.json();
            if (data && data.ok && data.result && data.result.full_short_link) {
                return data.result.full_short_link;
            }
        }
    } catch (e) {}
    // Fallback: is.gd
    try {
        const res2 = await fetch(`https://is.gd/create.php?format=simple&url=${encodeURIComponent(longUrl)}`);
        if (res2.ok) {
            const txt = await res2.text();
            if (txt && txt.startsWith('http')) return txt.trim();
        }
    } catch (e) {}
    // Fallback: tinyurl simple API (may be blocked by CORS on some environments)
    try {
        const res3 = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`);
        if (res3.ok) {
            const txt = await res3.text();
            if (txt && txt.startsWith('http')) return txt.trim();
        }
    } catch (e) {}
    return null;
}

function copyToClipboard(text, btn) {
    const write = async () => {
        try {
            await navigator.clipboard.writeText(text);
            if (btn) {
                const old = btn.innerHTML;
                btn.innerHTML = 'Copied!';
                setTimeout(() => { btn.innerHTML = old; }, 1500);
            }
        } catch (e) {
            const ta = document.createElement('textarea');
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            try { document.execCommand('copy'); } catch (err) {}
            document.body.removeChild(ta);
        }
    };
    write();
}

function approveOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    order.status = 'approved';
    order.approvedDate = new Date().toISOString();
    
    saveOrders();
    renderOrdersTable();
    closeModal('orderDetailsModal');
    
    sendAutoNotification(order, 'approved');
    showAlert('Order approved successfully!', 'success');
}

function rejectOrder(orderId) {
    const order = orders.find(o => o.id === orderId);
    if (!order) return;
    
    order.status = 'rejected';
    order.rejectedDate = new Date().toISOString();
    
    saveOrders();
    renderOrdersTable();
    closeModal('orderDetailsModal');
    
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
            <h3>
                <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 16px; height: 16px; margin-right: 8px;">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
                Jersey Details Collection
            </h3>
            <p style="color: #666; margin-bottom: 1.5rem;">
                Please provide details for ${order.jerseyQuantity} jersey(s):
            </p>
            
            <form id="customerDetailsForm" onsubmit="submitCustomerDetails(event, '${orderId}')">
                <div id="jerseyDetailsContainer">
                    ${generateJerseyDetailsForm(order.jerseyQuantity)}
                </div>
                
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">
                        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 16px; height: 16px; margin-right: 6px;">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/>
                        </svg>
                        Submit Details
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
                <h4>
                    <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 14px; height: 14px; margin-right: 6px;">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                    </svg>
                    Jersey ${i + 1}
                </h4>
                <div class="form-row">
                    <div class="form-group">
                        <label>Jersey Type *</label>
                        <select name="jersey_${i}_type" required>
                            <option value="">Select Jersey Type</option>
                            <option value="Player Jersey">Player Jersey</option>
                            <option value="Keeper Jersey">Keeper Jersey</option>
                            <option value="Official Jersey">Official Jersey</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Jersey Name *</label>
                        <input type="text" name="jersey_${i}_name" required placeholder="Enter jersey name" />
                    </div>
                    <div class="form-group">
                        <label>Jersey Number *</label>
                        <input type="number" name="jersey_${i}_number" required placeholder="Enter jersey number" min="1" max="99" />
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Size Category *</label>
                        <select name="jersey_${i}_size_category" required>
                            <option value="">Select Size Category</option>
                            <option value="Adult">Adult</option>
                            <option value="Kids">Kids</option>
                            <option value="Muslima">Muslima</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Size *</label>
                        <select name="jersey_${i}_size" required>
                            <option value="">Select Size</option>
                            <option value="XS">XS</option>
                            <option value="S">S</option>
                            <option value="M">M</option>
                            <option value="L">L</option>
                            <option value="XL">XL</option>
                            <option value="2XL">2XL</option>
                            <option value="3XL">3XL</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Sleeve *</label>
                        <select name="jersey_${i}_sleeve" required>
                            <option value="">Select Sleeve</option>
                            <option value="Short Sleeve">Short Sleeve</option>
                            <option value="Long Sleeve">Long Sleeve</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Shorts *</label>
                        <select name="jersey_${i}_shorts" required>
                            <option value="">Select Shorts</option>
                            <option value="Yes">Yes</option>
                            <option value="No">No</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Additional Details</label>
                    <textarea name="jersey_${i}_additional" rows="2" placeholder="Any special requirements, custom text, etc."></textarea>
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
            type: formData.get(`jersey_${i}_type`),
            name: formData.get(`jersey_${i}_name`),
            number: parseInt(formData.get(`jersey_${i}_number`)),
            sizeCategory: formData.get(`jersey_${i}_size_category`),
            size: formData.get(`jersey_${i}_size`),
            sleeve: formData.get(`jersey_${i}_sleeve`),
            shorts: formData.get(`jersey_${i}_shorts`),
            additionalDetails: formData.get(`jersey_${i}_additional`)
        };
        customerDetails.push(detail);
    }
    
    order.customerDetails = customerDetails;
    order.detailsSubmittedDate = new Date().toISOString();
    
    saveOrders();
    closeModal('customerDetailsModal');
    
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

function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    const main = document.querySelector('.admin-main');
    main.insertBefore(alertDiv, main.firstChild);
    
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
    const groupBy = (document.getElementById('groupFilter') || { value: 'none' }).value;
    
    if (groupBy === 'status') {
        const groups = filteredOrders.reduce((acc, o) => {
            const key = formatStatus(o.status);
            (acc[key] = acc[key] || []).push(o);
            return acc;
        }, {});
        tbody.innerHTML = Object.keys(groups).map(g => `
            <tr><td colspan="7" style="font-weight:600;color:var(--gray-700);background:var(--gray-50);">${g}</td></tr>
            ${groups[g].map(order => rowHtml(order)).join('')}
        `).join('');
        return;
    }
    if (groupBy === 'date') {
        const groups = filteredOrders.reduce((acc, o) => {
            const d = new Date(o.createdDate);
            const key = d.toLocaleDateString();
            (acc[key] = acc[key] || []).push(o);
            return acc;
        }, {});
        tbody.innerHTML = Object.keys(groups).map(g => `
            <tr><td colspan="7" style="font-weight:600;color:var(--gray-700);background:var(--gray-50);">${g}</td></tr>
            ${groups[g].map(order => rowHtml(order)).join('')}
        `).join('');
        return;
    }
    tbody.innerHTML = filteredOrders.map(order => rowHtml(order)).join('');
}

function rowHtml(order) {
    return `
        <tr>
            <td>${order.id}</td>
            <td>${order.customerName}</td>
            <td>${order.customerEmail}</td>
            <td>${order.customerPhone}</td>
            <td><span class="status-badge status-${order.status}">${formatStatus(order.status)}</span></td>
            <td>${formatDate(order.createdDate)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-xs btn-primary" onclick="showOrderDetails('${order.id}')" title="View Order" aria-label="View Order">
                        <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                    </button>
                    ${order.uniqueLink && !order.customerDetails ? `
                        <button class="btn btn-xs btn-warning" onclick="showCustomerDetailsForm('${order.id}')" title="Enter Customer Details" aria-label="Enter Customer Details">
                            <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                            </svg>
                        </button>
                    ` : ''}
                    ${order.status === 'pending' || order.status === 'details_submitted' ? `
                        <button class="btn btn-xs btn-success" onclick="approveOrder('${order.id}')" title="Approve Order" aria-label="Approve Order">
                            <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </button>
                        <button class="btn btn-xs btn-danger" onclick="rejectOrder('${order.id}')" title="Reject Order" aria-label="Reject Order">
                            <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `;
}

function getFilteredOrders() {
    const statusFilterEl = document.getElementById('statusFilter');
    const customerFilterEl = document.getElementById('customerFilter');
    const dateFilterEl = document.getElementById('dateFilter');
    const searchEl = document.getElementById('searchOrders');

    const statusFilter = statusFilterEl ? statusFilterEl.value : 'all';
    const customerFilter = customerFilterEl ? customerFilterEl.value : 'all';
    const dateFilter = dateFilterEl ? dateFilterEl.value : 'all';
    const searchTerm = searchEl ? (searchEl.value || '').toLowerCase() : '';
    
    return orders.filter(order => {
        // Status filter
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        
        // Customer filter
        let matchesCustomer = true;
        if (customerFilter === 'with_details') {
            matchesCustomer = order.customerDetails && order.customerDetails.length > 0;
        } else if (customerFilter === 'without_details') {
            matchesCustomer = !order.customerDetails || order.customerDetails.length === 0;
        }
        
        // Date filter
        let matchesDate = true;
        if (dateFilter && dateFilter !== 'all') {
            const orderDate = new Date(order.createdDate);
            const now = new Date();
            
            switch (dateFilter) {
                case 'today':
                    matchesDate = orderDate.toDateString() === now.toDateString();
                    break;
                case 'week':
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    matchesDate = orderDate >= weekAgo;
                    break;
                case 'month':
                    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                    matchesDate = orderDate >= monthAgo;
                    break;
                case 'year':
                    const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                    matchesDate = orderDate >= yearAgo;
                    break;
            }
        }
        
        // Search filter
        const matchesSearch = !searchTerm || 
            order.id.toLowerCase().includes(searchTerm) ||
            order.customerName.toLowerCase().includes(searchTerm) ||
            order.customerEmail.toLowerCase().includes(searchTerm) ||
            order.customerPhone.toLowerCase().includes(searchTerm);
        
        return matchesStatus && matchesCustomer && matchesDate && matchesSearch;
    });
}

// Enhanced Filter Functions
function applyFilters() {
    renderOrdersTable();
    showAlert('Filters applied successfully!', 'success');
}

function clearFilters() {
    // Reset all filter controls
    document.getElementById('statusFilter').value = 'all';
    document.getElementById('customerFilter').value = 'all';
    document.getElementById('dateFilter').value = 'all';
    document.getElementById('sortFilter').value = 'date_desc';
    document.getElementById('searchOrders').value = '';
    
    // Re-render table
    renderOrdersTable();
    showAlert('Filters cleared successfully!', 'info');
}

function sortOrders() {
    const sortValue = document.getElementById('sortFilter').value;
    const [field, direction] = sortValue.split('_');
    
    orders.sort((a, b) => {
        let aValue, bValue;
        
        switch (field) {
            case 'date':
                aValue = new Date(a.createdDate);
                bValue = new Date(b.createdDate);
                break;
            case 'name':
                aValue = a.customerName.toLowerCase();
                bValue = b.customerName.toLowerCase();
                break;
            case 'status':
                aValue = a.status;
                bValue = b.status;
                break;
            default:
                return 0;
        }
        
        if (direction === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });
    
    renderOrdersTable();
}

function searchOrders() {
    renderOrdersTable();
}

// Utility Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

function formatStatus(status) {
    if (!status) return '';
    const normalized = String(status).toLowerCase().replace(/_/g, ' ');
    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

// Data Persistence
function saveOrders() {
    if (dataManager) {
        // DataManager handles saving automatically
        return;
    } else {
        // Fallback to localStorage
        localStorage.setItem('jerseyOrders', JSON.stringify(orders));
    }
}

function loadOrders() {
    if (dataManager) {
        orders = dataManager.getOrders();
    } else {
        // Fallback to localStorage
        const savedOrders = localStorage.getItem('jerseyOrders');
        if (savedOrders) {
            orders = JSON.parse(savedOrders);
        }
    }
}

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
