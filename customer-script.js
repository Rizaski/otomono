// Customer Details Collection Script
let currentOrder = null;
let isSubmitting = false;

// Initialize the customer page
document.addEventListener('DOMContentLoaded', function() {
    console.log('Customer page loaded');
    console.log('Full URL:', window.location.href);
    console.log('Search params:', window.location.search);
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
    
    // Debug logging
    console.log('Current URL:', window.location.href);
    console.log('URL Parameters:', window.location.search);
    console.log('Order ID from URL:', orderId);
    
    if (!orderId) {
        console.log('No order ID found, creating demo order');
        // Create a demo order for testing purposes
        currentOrder = {
            id: 'ORD-001',
            customerName: 'John Doe',
            customerEmail: 'john.doe@example.com',
            customerPhone: '+1-555-0123',
            jerseyQuantity: 2,
            status: 'pending',
            specialInstructions: 'Please ensure high quality materials are used.',
            createdDate: new Date().toISOString()
        };
        
        // Show demo notice
        showDemoNotice();
    } else {
        console.log('Order ID found, fetching order data:', orderId);
        // Simulate API call to fetch order data
        fetchOrderData(orderId);
    }
}

// Simulate API call to fetch order data
async function fetchOrderData(orderId) {
    try {
        console.log('Starting to fetch order data for:', orderId);
        
        // Show loading state
        showLoadingState();
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Try localStorage first (for development)
        const localOrders = JSON.parse(localStorage.getItem('jerseyOrders') || '[]');
        console.log('Local orders found:', localOrders.length);
        let order = localOrders.find(o => o.id === orderId);
        
        if (order) {
            console.log('Order found in localStorage:', order);
            // Found in localStorage (development mode)
            currentOrder = order;
            hideLoadingState();
            displayOrderInfo();
            displayDetailsForm();
        } else {
            console.log('Order not found in localStorage, simulating backend API');
            // Simulate fetching from backend API
            const simulatedOrder = await simulateBackendAPI(orderId);
            console.log('Simulated order created:', simulatedOrder);
            
            if (simulatedOrder) {
                currentOrder = simulatedOrder;
                hideLoadingState();
                
                // Show appropriate notice based on order type
                if (simulatedOrder.orderType === 'live') {
                    showLiveOrderNotice();
                } else {
                    showDemoNotice('This is a simulated order for testing purposes.');
                }
                
                displayOrderInfo();
                displayDetailsForm();
            } else {
                hideLoadingState();
                showError('Order not found. Please check your link and try again.');
            }
        }
    } catch (error) {
        hideLoadingState();
        showError('Unable to load order data. Please try again later.');
        console.error('Error fetching order:', error);
    }
}

// Simulate backend API call
async function simulateBackendAPI(orderId) {
    // Simulate different order scenarios based on order ID patterns
    const orderPatterns = {
        'ORD-': () => generateRealisticOrder(orderId, 'ORD-'),
        'JERSEY-': () => generateRealisticOrder(orderId, 'JERSEY-'),
        'CUST-': () => generateRealisticOrder(orderId, 'CUST-'),
        'DEMO-': () => generateRealisticOrder(orderId, 'DEMO-')
    };
    
    // Find matching pattern
    for (const [pattern, generator] of Object.entries(orderPatterns)) {
        if (orderId.startsWith(pattern)) {
            return generator();
        }
    }
    
    // Default realistic order
    return generateRealisticOrder(orderId, 'LIVE-');
}

// Generate realistic order data
function generateRealisticOrder(orderId, prefix) {
    const customerNames = [
        'Sarah Johnson', 'Michael Chen', 'Emily Rodriguez', 'David Thompson',
        'Lisa Anderson', 'James Wilson', 'Maria Garcia', 'Robert Brown',
        'Jennifer Davis', 'Christopher Lee', 'Amanda Taylor', 'Daniel Martinez'
    ];
    
    const customerEmails = [
        'sarah.johnson@email.com', 'michael.chen@company.com', 'emily.rodriguez@team.org',
        'david.thompson@sports.com', 'lisa.anderson@club.net', 'james.wilson@group.com',
        'maria.garcia@league.org', 'robert.brown@association.com', 'jennifer.davis@union.net',
        'christopher.lee@federation.com', 'amanda.taylor@alliance.org', 'daniel.martinez@coalition.com'
    ];
    
    const specialInstructions = [
        'Please ensure high quality materials are used.',
        'Rush order - needed for upcoming tournament.',
        'Standard quality materials are acceptable.',
        'Premium materials preferred for durability.',
        'Custom sizing required for team uniforms.',
        'Bulk order - please maintain consistency.',
        'Special color requirements - contact if unclear.',
        'Standard processing time is acceptable.'
    ];
    
    const randomIndex = Math.floor(Math.random() * customerNames.length);
    const orderDate = new Date();
    orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 30)); // Random date within last 30 days
    
    return {
        id: orderId,
        customerName: customerNames[randomIndex],
        customerEmail: customerEmails[randomIndex],
        customerPhone: `+1-555-${String(Math.floor(Math.random() * 9000) + 1000)}`,
        jerseyQuantity: Math.floor(Math.random() * 10) + 1, // 1-10 jerseys
        status: 'pending',
        specialInstructions: specialInstructions[Math.floor(Math.random() * specialInstructions.length)],
        createdDate: orderDate.toISOString(),
        orderType: prefix === 'LIVE-' ? 'live' : 'simulated'
    };
}

// Show demo notice
function showDemoNotice(customMessage = null) {
    const main = document.querySelector('.customer-main');
    const demoNotice = document.createElement('div');
    demoNotice.className = 'demo-notice';
    
    const message = customMessage || 'You are viewing a demo of the Jersey Details Collection form. In a real scenario, this would be accessed via a unique order link.';
    
    demoNotice.innerHTML = `
        <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin-bottom: 24px; color: #92400e;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                    <line x1="12" y1="9" x2="12" y2="13"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                <strong>Demo Mode</strong>
            </div>
            <p style="margin: 0; font-size: 14px;">${message}</p>
        </div>
    `;
    main.insertBefore(demoNotice, main.firstChild);
}

// Show live order notice
function showLiveOrderNotice() {
    const main = document.querySelector('.customer-main');
    const liveNotice = document.createElement('div');
    liveNotice.className = 'live-notice';
    
    liveNotice.innerHTML = `
        <div style="background: #dcfce7; border: 1px solid #16a34a; border-radius: 8px; padding: 16px; margin-bottom: 24px; color: #166534;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M9 12l2 2 4-4"/>
                    <circle cx="12" cy="12" r="10"/>
                </svg>
                <strong>Live Order</strong>
            </div>
            <p style="margin: 0; font-size: 14px;">Your order has been successfully loaded. Please provide your jersey details below.</p>
        </div>
    `;
    main.insertBefore(liveNotice, main.firstChild);
}

// Display order information
function displayOrderInfo() {
    if (!currentOrder) return;
    
    const orderInfoSection = document.getElementById('orderInfo');
    orderInfoSection.innerHTML = `
        <h2>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 16v-4"/>
                <path d="M12 8h.01"/>
            </svg>
            Order Information
        </h2>
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
            ${currentOrder.orderType ? `
            <div class="info-item">
                <strong>Order Type</strong>
                <span style="color: ${currentOrder.orderType === 'live' ? '#16a34a' : '#f59e0b'}; font-weight: 600;">
                    ${currentOrder.orderType === 'live' ? 'Live Order' : 'Simulated Order'}
                </span>
            </div>
            ` : ''}
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
        <h2>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
            </svg>
            Jersey Details Collection
        </h2>
        <p>
            Please provide the details for your ${currentOrder.jerseyQuantity} jersey(s). All fields marked with * are required. 
            You'll need to specify the jersey type, name, number, size category, size, sleeve type, and whether shorts are included.
        </p>
        
        <form id="customerDetailsForm" onsubmit="submitCustomerDetails(event)">
            <div id="jerseyDetailsContainer">
                ${generateJerseyDetailsForm(currentOrder.jerseyQuantity)}
            </div>
            
            <!-- Counter Table -->
            <div id="counterTable" class="counter-section">
                <h3>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <path d="M9 9h6v6H9z"/>
                    </svg>
                    Order Summary
                </h3>
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
            
            <div class="form-actions">
                <button type="submit" class="btn btn-primary">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                        <polyline points="17,21 17,13 7,13 7,21"/>
                        <polyline points="7,3 7,8 15,8"/>
                    </svg>
                    Submit Details
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
                <h3>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
                    </svg>
                    Jersey ${i + 1}
                </h3>
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
    const main = document.querySelector('.customer-main');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'alert alert-danger';
    errorDiv.innerHTML = `
        <div style="text-align: center; padding: 40px 20px;">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: #ef4444; margin-bottom: 16px;">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            <h2 style="color: #ef4444; margin-bottom: 16px;">Order Not Found</h2>
            <p style="color: #6b7280; margin-bottom: 24px;">${message}</p>
            <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px; color: #374151;">
                    <strong>Demo Mode Available:</strong> You can test the form without an order ID by visiting the page directly.
                </p>
            </div>
            <button onclick="location.reload()" style="background: #dc2626; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-weight: 500;">
                Try Again
            </button>
        </div>
    `;
    main.innerHTML = '';
    main.appendChild(errorDiv);
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
