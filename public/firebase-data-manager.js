// Firebase Data Manager for Jersey Orders Application
import { firebaseService } from './firebase-service.js';

class FirebaseDataManager {
    constructor() {
        this.orders = [];
        this.customers = [];
        this.settings = {};
        this.reports = {};
        this.isInitialized = false;
    }

    // Initialize the data manager
    async initialize() {
        try {
            console.log('Initializing Firebase Data Manager...');
            
            // Load initial data
            await this.loadOrders();
            await this.loadCustomers();
            await this.loadSettings();
            await this.loadReports();
            
            this.isInitialized = true;
            console.log('Firebase Data Manager initialized successfully');
            
            return true;
        } catch (error) {
            console.error('Error initializing Firebase Data Manager:', error);
            throw error;
        }
    }

    // Orders Management
    async loadOrders() {
        try {
            this.orders = await firebaseService.getOrders();
            return this.orders;
        } catch (error) {
            console.error('Error loading orders:', error);
            this.orders = [];
            return [];
        }
    }

    async addOrder(order) {
        try {
            const orderId = await firebaseService.addOrder(order);
            const newOrder = {
                id: orderId,
                ...order,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            this.orders.unshift(newOrder);
            return newOrder;
        } catch (error) {
            console.error('Error adding order:', error);
            throw error;
        }
    }

    async updateOrder(id, updates) {
        try {
            await firebaseService.updateOrder(id, updates);
            
            const index = this.orders.findIndex(order => order.id === id);
            if (index !== -1) {
                this.orders[index] = { 
                    ...this.orders[index], 
                    ...updates, 
                    updatedAt: new Date() 
                };
                return this.orders[index];
            }
            return null;
        } catch (error) {
            console.error('Error updating order:', error);
            throw error;
        }
    }

    async deleteOrder(id) {
        try {
            await firebaseService.deleteOrder(id);
            
            const index = this.orders.findIndex(order => order.id === id);
            if (index !== -1) {
                this.orders.splice(index, 1);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error deleting order:', error);
            throw error;
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
                order.customer?.toLowerCase().includes(searchTerm) ||
                order.email?.toLowerCase().includes(searchTerm) ||
                order.jersey?.toLowerCase().includes(searchTerm) ||
                order.id?.toLowerCase().includes(searchTerm)
            );
        }
        
        if (filters.sortBy) {
            filteredOrders.sort((a, b) => {
                switch (filters.sortBy) {
                    case 'date':
                        return new Date(b.createdAt || b.orderDate) - new Date(a.createdAt || a.orderDate);
                    case 'customer':
                        return (a.customer || '').localeCompare(b.customer || '');
                    case 'status':
                        return (a.status || '').localeCompare(b.status || '');
                    case 'total':
                        return (b.total || 0) - (a.total || 0);
                    default:
                        return 0;
                }
            });
        }
        
        return filteredOrders;
    }

    // Customers Management
    async loadCustomers() {
        try {
            this.customers = await firebaseService.getCustomers();
            return this.customers;
        } catch (error) {
            console.error('Error loading customers:', error);
            this.customers = [];
            return [];
        }
    }

    async addCustomer(customer) {
        try {
            const customerId = await firebaseService.addCustomer(customer);
            const newCustomer = {
                id: customerId,
                ...customer,
                createdAt: new Date(),
                updatedAt: new Date()
            };
            
            this.customers.push(newCustomer);
            return newCustomer;
        } catch (error) {
            console.error('Error adding customer:', error);
            throw error;
        }
    }

    async updateCustomer(id, updates) {
        try {
            await firebaseService.updateCustomer(id, updates);
            
            const index = this.customers.findIndex(customer => customer.id === id);
            if (index !== -1) {
                this.customers[index] = { 
                    ...this.customers[index], 
                    ...updates, 
                    updatedAt: new Date() 
                };
                return this.customers[index];
            }
            return null;
        } catch (error) {
            console.error('Error updating customer:', error);
            throw error;
        }
    }

    async deleteCustomer(id) {
        try {
            await firebaseService.deleteOrder(id); // Assuming customers are stored in orders collection
            
            const index = this.customers.findIndex(customer => customer.id === id);
            if (index !== -1) {
                this.customers.splice(index, 1);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error deleting customer:', error);
            throw error;
        }
    }

    // Settings Management
    async loadSettings() {
        try {
            this.settings = await firebaseService.getSettings();
            return this.settings;
        } catch (error) {
            console.error('Error loading settings:', error);
            this.settings = {
                appName: 'Jersey Orders Management',
                currency: 'USD',
                timezone: 'UTC',
                notifications: { email: true, sms: false, push: true },
                theme: { primaryColor: '#dc2626', fontFamily: 'Poppins' },
                business: {
                    name: 'Jersey Store',
                    address: '123 Sports Street, City, State 12345',
                    phone: '+1-555-JERSEY',
                    email: 'orders@jerseystore.com'
                }
            };
            return this.settings;
        }
    }

    async updateSettings(updates) {
        try {
            await firebaseService.updateSettings(updates);
            this.settings = { ...this.settings, ...updates };
            return this.settings;
        } catch (error) {
            console.error('Error updating settings:', error);
            throw error;
        }
    }

    // Reports Management
    async loadReports() {
        try {
            this.reports = await firebaseService.getReports();
            return this.reports;
        } catch (error) {
            console.error('Error loading reports:', error);
            this.reports = {
                totalOrders: 0,
                totalRevenue: 0,
                pendingOrders: 0,
                approvedOrders: 0,
                processingOrders: 0,
                shippedOrders: 0,
                deliveredOrders: 0,
                averageOrderValue: 0
            };
            return this.reports;
        }
    }

    // Utility Methods
    getStatusCounts() {
        const counts = {};
        this.orders.forEach(order => {
            counts[order.status] = (counts[order.status] || 0) + 1;
        });
        return counts;
    }

    getRecentOrders(limitCount = 5) {
        return this.orders
            .sort((a, b) => new Date(b.createdAt || b.orderDate) - new Date(a.createdAt || a.orderDate))
            .slice(0, limitCount);
    }

    getTopCustomers(limitCount = 5) {
        return this.customers
            .sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0))
            .slice(0, limitCount);
    }

    // Real-time updates
    setupRealtimeUpdates() {
        try {
            // Set up real-time orders listener
            firebaseService.onOrdersChange((orders) => {
                this.orders = orders;
                // Trigger any UI updates if needed
                if (window.updateOrdersUI) {
                    window.updateOrdersUI(orders);
                }
            });
        } catch (error) {
            console.error('Error setting up real-time updates:', error);
        }
    }

    // Export/Import functionality
    async exportData() {
        return {
            orders: this.orders,
            customers: this.customers,
            settings: this.settings,
            reports: this.reports,
            exportDate: new Date().toISOString()
        };
    }

    async importData(data) {
        try {
            if (data.orders) {
                for (const order of data.orders) {
                    await this.addOrder(order);
                }
            }
            if (data.customers) {
                for (const customer of data.customers) {
                    await this.addCustomer(customer);
                }
            }
            if (data.settings) {
                await this.updateSettings(data.settings);
            }
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            throw error;
        }
    }
}

// Create and export singleton instance
export const firebaseDataManager = new FirebaseDataManager();
export default firebaseDataManager;
