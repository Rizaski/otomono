// Dashboard Script with Modern Charts
let orders = [];
let currentOrderId = null;
let ordersChart, statusChart, revenueChart, customersChart;

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

async function initializeDashboard() {
    showLoadingState();
    await new Promise(resolve => setTimeout(resolve, 500));
    loadOrders();
    updateStatistics();
    initializeCharts();
    updateActivity();
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

// Statistics Functions
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

// Chart Initialization
function initializeCharts() {
    initializeOrdersChart();
    initializeStatusChart();
    initializeRevenueChart();
    initializeCustomersChart();
}

function initializeOrdersChart() {
    const ctx = document.getElementById('ordersChart').getContext('2d');
    const timeRange = document.getElementById('timeRange').value;
    const data = generateOrdersOverTimeData(timeRange);
    
    ordersChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Orders',
                data: data.values,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.08)',
                borderWidth: 2,
                fill: true,
                tension: 0.3,
                pointBackgroundColor: '#10b981',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 1,
                pointRadius: 3,
                pointHoverRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.03)',
                        drawBorder: false
                    },
                    ticks: {
                        font: {
                            size: 10
                        },
                        maxTicksLimit: 5
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 10
                        },
                        maxTicksLimit: 6
                    }
                }
            },
            elements: {
                point: {
                    radius: 3,
                    hoverRadius: 5
                }
            }
        }
    });
}

function initializeStatusChart() {
    const ctx = document.getElementById('statusChart').getContext('2d');
    const data = generateStatusData();
    
    statusChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: data.labels,
            datasets: [{
                data: data.values,
                backgroundColor: [
                    '#10b981',
                    '#f59e0b',
                    '#ef4444',
                    '#3b82f6'
                ],
                borderWidth: 0,
                cutout: '70%'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        usePointStyle: true,
                        font: {
                            size: 10
                        }
                    }
                }
            },
            elements: {
                arc: {
                    borderWidth: 0
                }
            }
        }
    });
}

function initializeRevenueChart() {
    const ctx = document.getElementById('revenueChart').getContext('2d');
    const data = generateRevenueData();
    
    revenueChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Revenue',
                data: data.values,
                backgroundColor: 'rgba(16, 185, 129, 0.6)',
                borderColor: '#10b981',
                borderWidth: 0,
                borderRadius: 3,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.03)',
                        drawBorder: false
                    },
                    ticks: {
                        font: {
                            size: 10
                        },
                        maxTicksLimit: 5
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 10
                        },
                        maxTicksLimit: 6
                    }
                }
            }
        }
    });
}

function initializeCustomersChart() {
    const ctx = document.getElementById('customersChart').getContext('2d');
    const data = generateCustomersData();
    
    customersChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.labels,
            datasets: [{
                label: 'Orders',
                data: data.values,
                backgroundColor: 'rgba(59, 130, 246, 0.6)',
                borderColor: '#3b82f6',
                borderWidth: 0,
                borderRadius: 3,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.03)',
                        drawBorder: false
                    },
                    ticks: {
                        font: {
                            size: 10
                        },
                        maxTicksLimit: 5
                    }
                },
                y: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 10
                        }
                    }
                }
            }
        }
    });
}

// Data Generation Functions
function generateOrdersOverTimeData(days) {
    const labels = [];
    const values = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        
        // Generate realistic data based on actual orders
        const dayOrders = orders.filter(order => {
            const orderDate = new Date(order.createdDate);
            return orderDate.toDateString() === date.toDateString();
        }).length;
        
        values.push(dayOrders);
    }
    
    return { labels, values };
}

function generateStatusData() {
    const statusCounts = {
        'Approved': orders.filter(o => o.status === 'approved').length,
        'Pending': orders.filter(o => o.status === 'pending').length,
        'Rejected': orders.filter(o => o.status === 'rejected').length,
        'Details Submitted': orders.filter(o => o.status === 'details_submitted').length
    };
    
    return {
        labels: Object.keys(statusCounts),
        values: Object.values(statusCounts)
    };
}

function generateRevenueData() {
    const labels = [];
    const values = [];
    const today = new Date();
    
    for (let i = 11; i >= 0; i--) {
        const date = new Date(today);
        date.setMonth(date.getMonth() - i);
        labels.push(date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
        
        // Generate revenue data (simplified calculation)
        const monthOrders = orders.filter(order => {
            const orderDate = new Date(order.createdDate);
            return orderDate.getMonth() === date.getMonth() && 
                   orderDate.getFullYear() === date.getFullYear();
        });
        
        const revenue = monthOrders.reduce((sum, order) => {
            return sum + (order.jerseyQuantity * 25); // $25 per jersey
        }, 0);
        
        values.push(revenue);
    }
    
    return { labels, values };
}

function generateCustomersData() {
    const customerOrders = {};
    
    orders.forEach(order => {
        const name = order.customerName;
        customerOrders[name] = (customerOrders[name] || 0) + 1;
    });
    
    const sortedCustomers = Object.entries(customerOrders)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);
    
    return {
        labels: sortedCustomers.map(([name]) => name.split(' ')[0]), // First name only
        values: sortedCustomers.map(([,count]) => count)
    };
}

// Chart Update Functions
function updateOrdersChart() {
    const timeRange = document.getElementById('timeRange').value;
    const data = generateOrdersOverTimeData(timeRange);
    
    ordersChart.data.labels = data.labels;
    ordersChart.data.datasets[0].data = data.values;
    ordersChart.update();
}

function updateRevenueChart() {
    const revenueRange = document.getElementById('revenueRange').value;
    const data = generateRevenueData();
    
    revenueChart.data.labels = data.labels;
    revenueChart.data.datasets[0].data = data.values;
    revenueChart.update();
}

// Activity Functions
function updateActivity() {
    const activityList = document.getElementById('activityList');
    const recentOrders = orders
        .sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate))
        .slice(0, 10);
    
    activityList.innerHTML = recentOrders.map(order => `
        <div class="activity-item">
            <div class="activity-icon">
                <i class="fas fa-shopping-cart"></i>
            </div>
            <div class="activity-content">
                <div class="activity-title">
                    Order ${order.id} - ${order.customerName}
                </div>
                <div class="activity-description">
                    ${order.jerseyQuantity} jersey(s) - ${order.status}
                </div>
                <div class="activity-time">
                    ${formatTimeAgo(order.createdDate)}
                </div>
            </div>
            <div class="activity-status">
                <span class="status-badge status-${order.status}">${order.status}</span>
            </div>
        </div>
    `).join('');
}

function refreshActivity() {
    updateActivity();
    showAlert('Activity refreshed!', 'success');
}

// Utility Functions
function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
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
    }, 3000);
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

// Utility Functions
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
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
