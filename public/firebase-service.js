// Firebase Service for Jersey Orders Management
import { 
    collection, 
    doc, 
    getDocs, 
    getDoc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    orderBy, 
    limit,
    onSnapshot 
} from "firebase/firestore";
import { db } from "./firebase-config.js";

class FirebaseService {
    constructor() {
        this.ordersCollection = "orders";
        this.customersCollection = "customers";
        this.settingsCollection = "settings";
    }

    // Orders Management
    async getOrders(filters = {}) {
        try {
            const ordersRef = collection(db, this.ordersCollection);
            let q = query(ordersRef);

            // Apply filters
            if (filters.status) {
                q = query(ordersRef, where("status", "==", filters.status));
            }

            if (filters.sortBy) {
                const sortField = filters.sortBy === 'date' ? 'createdAt' : filters.sortBy;
                q = query(q, orderBy(sortField, 'desc'));
            }

            if (filters.limit) {
                q = query(q, limit(filters.limit));
            }

            const querySnapshot = await getDocs(q);
            const orders = [];
            
            querySnapshot.forEach((doc) => {
                orders.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            // Apply client-side filters
            let filteredOrders = orders;
            
            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                filteredOrders = filteredOrders.filter(order => 
                    order.customer?.toLowerCase().includes(searchTerm) ||
                    order.email?.toLowerCase().includes(searchTerm) ||
                    order.jersey?.toLowerCase().includes(searchTerm) ||
                    order.id?.toLowerCase().includes(searchTerm)
                );
            }

            return filteredOrders;
        } catch (error) {
            console.error("Error getting orders:", error);
            throw error;
        }
    }

    async getOrderById(orderId) {
        try {
            const orderRef = doc(db, this.ordersCollection, orderId);
            const orderSnap = await getDoc(orderRef);
            
            if (orderSnap.exists()) {
                return {
                    id: orderSnap.id,
                    ...orderSnap.data()
                };
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error getting order:", error);
            throw error;
        }
    }

    async addOrder(orderData) {
        try {
            const ordersRef = collection(db, this.ordersCollection);
            const docRef = await addDoc(ordersRef, {
                ...orderData,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            return docRef.id;
        } catch (error) {
            console.error("Error adding order:", error);
            throw error;
        }
    }

    async updateOrder(orderId, updateData) {
        try {
            const orderRef = doc(db, this.ordersCollection, orderId);
            await updateDoc(orderRef, {
                ...updateData,
                updatedAt: new Date()
            });
            return true;
        } catch (error) {
            console.error("Error updating order:", error);
            throw error;
        }
    }

    async deleteOrder(orderId) {
        try {
            const orderRef = doc(db, this.ordersCollection, orderId);
            await deleteDoc(orderRef);
            return true;
        } catch (error) {
            console.error("Error deleting order:", error);
            throw error;
        }
    }

    // Real-time orders listener
    onOrdersChange(callback) {
        const ordersRef = collection(db, this.ordersCollection);
        const q = query(ordersRef, orderBy("createdAt", "desc"));
        
        return onSnapshot(q, (querySnapshot) => {
            const orders = [];
            querySnapshot.forEach((doc) => {
                orders.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            callback(orders);
        });
    }

    // Customers Management
    async getCustomers() {
        try {
            const customersRef = collection(db, this.customersCollection);
            const querySnapshot = await getDocs(customersRef);
            const customers = [];
            
            querySnapshot.forEach((doc) => {
                customers.push({
                    id: doc.id,
                    ...doc.data()
                });
            });

            return customers;
        } catch (error) {
            console.error("Error getting customers:", error);
            throw error;
        }
    }

    async addCustomer(customerData) {
        try {
            const customersRef = collection(db, this.customersCollection);
            const docRef = await addDoc(customersRef, {
                ...customerData,
                createdAt: new Date(),
                updatedAt: new Date()
            });
            return docRef.id;
        } catch (error) {
            console.error("Error adding customer:", error);
            throw error;
        }
    }

    async updateCustomer(customerId, updateData) {
        try {
            const customerRef = doc(db, this.customersCollection, customerId);
            await updateDoc(customerRef, {
                ...updateData,
                updatedAt: new Date()
            });
            return true;
        } catch (error) {
            console.error("Error updating customer:", error);
            throw error;
        }
    }

    // Settings Management
    async getSettings() {
        try {
            const settingsRef = doc(db, this.settingsCollection, "app");
            const settingsSnap = await getDoc(settingsRef);
            
            if (settingsSnap.exists()) {
                return settingsSnap.data();
            } else {
                // Return default settings
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
        } catch (error) {
            console.error("Error getting settings:", error);
            throw error;
        }
    }

    async updateSettings(settingsData) {
        try {
            const settingsRef = doc(db, this.settingsCollection, "app");
            await updateDoc(settingsRef, {
                ...settingsData,
                updatedAt: new Date()
            });
            return true;
        } catch (error) {
            console.error("Error updating settings:", error);
            throw error;
        }
    }

    // Reports and Analytics
    async getReports() {
        try {
            const orders = await this.getOrders();
            
            const reports = {
                totalOrders: orders.length,
                totalRevenue: orders.reduce((sum, order) => sum + (order.total || 0), 0),
                pendingOrders: orders.filter(order => order.status === 'pending').length,
                approvedOrders: orders.filter(order => order.status === 'approved').length,
                processingOrders: orders.filter(order => order.status === 'processing').length,
                shippedOrders: orders.filter(order => order.status === 'shipped').length,
                deliveredOrders: orders.filter(order => order.status === 'delivered').length,
                averageOrderValue: orders.length > 0 ? 
                    orders.reduce((sum, order) => sum + (order.total || 0), 0) / orders.length : 0
            };

            return reports;
        } catch (error) {
            console.error("Error getting reports:", error);
            throw error;
        }
    }

    // Utility Methods
    async getRecentOrders(limitCount = 5) {
        try {
            const orders = await this.getOrders({ limit: limitCount });
            return orders;
        } catch (error) {
            console.error("Error getting recent orders:", error);
            throw error;
        }
    }

    async getStatusCounts() {
        try {
            const orders = await this.getOrders();
            const counts = {};
            
            orders.forEach(order => {
                counts[order.status] = (counts[order.status] || 0) + 1;
            });
            
            return counts;
        } catch (error) {
            console.error("Error getting status counts:", error);
            throw error;
        }
    }
}

// Create and export singleton instance
export const firebaseService = new FirebaseService();
export default firebaseService;
