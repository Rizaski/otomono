// Dynamic Data Manager for Jersey Orders Application
class DataManager {
    constructor() {
        this.orders = this.loadOrders();
        this.customers = this.loadCustomers();
        this.settings = this.loadSettings();
        this.reports = this.loadReports();
        this.useFirebase = false;
        this.firebaseManager = null;
    }

    // Initialize Firebase if available
    async initializeFirebase() {
        try {
            // Try to import Firebase modules
            const { firebaseDataManager } = await import('./firebase-data-manager.js');
            this.firebaseManager = firebaseDataManager;
            await this.firebaseManager.initialize();
            this.useFirebase = true;
            console.log('Firebase Data Manager initialized');
            return true;
        } catch (error) {
            console.log('Firebase not available, using localStorage:', error.message);
            this.useFirebase = false;
            return false;
        }
    }

    // Orders Management
    loadOrders() {
        const stored = localStorage.getItem('jersey_orders');
        if (stored) {
            return JSON.parse(stored);
        }
        
        // Start with empty array - no dummy data
        return [];
    }

    saveOrders() {
        localStorage.setItem('jersey_orders', JSON.stringify(this.orders));
    }

    async addOrder(order) {
        if (this.useFirebase && this.firebaseManager) {
            return await this.firebaseManager.addOrder(order);
        } else {
            const newOrder = {
                id: `ORD-${String(this.orders.length + 1).padStart(3, '0')}`,
                ...order,
                orderDate: new Date().toISOString().split('T')[0],
                status: 'pending'
            };
            this.orders.unshift(newOrder);
            this.saveOrders();
            return newOrder;
        }
    }

    async updateOrder(id, updates) {
        if (this.useFirebase && this.firebaseManager) {
            return await this.firebaseManager.updateOrder(id, updates);
        } else {
            const index = this.orders.findIndex(order => order.id === id);
            if (index !== -1) {
                this.orders[index] = { ...this.orders[index], ...updates };
                this.saveOrders();
                return this.orders[index];
            }
            return null;
        }
    }

    async deleteOrder(id) {
        if (this.useFirebase && this.firebaseManager) {
            return await this.firebaseManager.deleteOrder(id);
        } else {
            const index = this.orders.findIndex(order => order.id === id);
            if (index !== -1) {
                this.orders.splice(index, 1);
                this.saveOrders();
                return true;
            }
            return false;
        }
    }

    getOrders(filters = {}) {
        let filteredOrders = [...this.orders];
        
        if (filters.status) {
            filteredOrders = filteredOrders.filter(order => order.status === filters.status);
        }
        
        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            filteredOrders = filteredOrders.filter(order => 
                order.customer.toLowerCase().includes(searchTerm) ||
                order.email.toLowerCase().includes(searchTerm) ||
                order.jersey.toLowerCase().includes(searchTerm) ||
                order.id.toLowerCase().includes(searchTerm)
            );
        }
        
        if (filters.sortBy) {
            filteredOrders.sort((a, b) => {
                switch (filters.sortBy) {
                    case 'date':
                        return new Date(b.orderDate) - new Date(a.orderDate);
                    case 'customer':
                        return a.customer.localeCompare(b.customer);
                    case 'status':
                        return a.status.localeCompare(b.status);
                    case 'total':
                        return b.total - a.total;
                    default:
                        return 0;
                }
            });
        }
        
        return filteredOrders;
    }

    // Customers Management
    loadCustomers() {
        const stored = localStorage.getItem('jersey_customers');
        if (stored) {
            return JSON.parse(stored);
        }
        
        // Start with empty array - no dummy data
        return [];
    }

    saveCustomers() {
        localStorage.setItem('jersey_customers', JSON.stringify(this.customers));
    }

    addCustomer(customer) {
        const newCustomer = {
            id: `CUST-${String(this.customers.length + 1).padStart(3, '0')}`,
            ...customer,
            totalOrders: 0,
            totalSpent: 0,
            lastOrder: null,
            status: 'active',
            createdAt: new Date().toISOString()
        };
        this.customers.push(newCustomer);
        this.saveCustomers();
        return newCustomer;
    }

    updateCustomer(id, updates) {
        const index = this.customers.findIndex(customer => customer.id === id);
        if (index !== -1) {
            this.customers[index] = { ...this.customers[index], ...updates };
            this.saveCustomers();
            return this.customers[index];
        }
        return null;
    }

    deleteCustomer(id) {
        const index = this.customers.findIndex(customer => customer.id === id);
        if (index !== -1) {
            this.customers.splice(index, 1);
            this.saveCustomers();
            return true;
        }
        return false;
    }

    // Settings Management
    loadSettings() {
        const stored = localStorage.getItem('jersey_settings');
        if (stored) {
            return JSON.parse(stored);
        }
        
        return {
            appName: 'Jersey Orders Management',
            currency: 'USD',
            timezone: 'UTC',
            notifications: {
                email: true,
                sms: false,
                push: true
            },
            theme: {
                primaryColor: '#dc2626',
                fontFamily: 'Poppins'
            },
            business: {
                name: 'Jersey Store',
                address: '123 Sports Street, City, State 12345',
                phone: '+1-555-JERSEY',
                email: 'orders@jerseystore.com'
            }
        };
    }

    saveSettings() {
        localStorage.setItem('jersey_settings', JSON.stringify(this.settings));
    }

    updateSettings(updates) {
        this.settings = { ...this.settings, ...updates };
        this.saveSettings();
    }

    // Reports Management
    loadReports() {
        return {
            totalOrders: this.orders.length,
            totalRevenue: this.orders.reduce((sum, order) => sum + order.total, 0),
            pendingOrders: this.orders.filter(order => order.status === 'pending').length,
            approvedOrders: this.orders.filter(order => order.status === 'approved').length,
            processingOrders: this.orders.filter(order => order.status === 'processing').length,
            shippedOrders: this.orders.filter(order => order.status === 'shipped').length,
            deliveredOrders: this.orders.filter(order => order.status === 'delivered').length,
            averageOrderValue: this.orders.length > 0 ? 
                this.orders.reduce((sum, order) => sum + order.total, 0) / this.orders.length : 0
        };
    }

    // Utility Methods
    getStatusCounts() {
        const counts = {};
        this.orders.forEach(order => {
            counts[order.status] = (counts[order.status] || 0) + 1;
        });
        return counts;
    }

    getRecentOrders(limit = 5) {
        return this.orders
            .sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))
            .slice(0, limit);
    }

    getTopCustomers(limit = 5) {
        return this.customers
            .sort((a, b) => b.totalSpent - a.totalSpent)
            .slice(0, limit);
    }

    // Export/Import functionality
    exportData() {
        return {
            orders: this.orders,
            customers: this.customers,
            settings: this.settings,
            exportDate: new Date().toISOString()
        };
    }

    importData(data) {
        if (data.orders) {
            this.orders = data.orders;
            this.saveOrders();
        }
        if (data.customers) {
            this.customers = data.customers;
            this.saveCustomers();
        }
        if (data.settings) {
            this.settings = data.settings;
            this.saveSettings();
        }
    }
}

// Global data manager instance
window.dataManager = new DataManager();


