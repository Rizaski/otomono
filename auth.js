// Authentication Management
class AuthManager {
    constructor() {
        this.isAuthenticated = this.checkAuthStatus();
        this.username = localStorage.getItem('username') || null;
        this.loginTime = localStorage.getItem('loginTime') || null;
    }

    // Check if user is authenticated
    checkAuthStatus() {
        const authStatus = localStorage.getItem('isAuthenticated');
        const loginTime = localStorage.getItem('loginTime');
        
        if (authStatus === 'true' && loginTime) {
            // Check if session is still valid (24 hours)
            const loginDate = new Date(loginTime);
            const now = new Date();
            const hoursDiff = (now - loginDate) / (1000 * 60 * 60);
            
            if (hoursDiff > 24) {
                this.logout();
                return false;
            }
            
            return true;
        }
        
        return false;
    }

    // Login user
    login(username, password) {
        const DEMO_CREDENTIALS = {
            username: 'admin',
            password: 'password123'
        };

        if (username === DEMO_CREDENTIALS.username && password === DEMO_CREDENTIALS.password) {
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('username', username);
            localStorage.setItem('loginTime', new Date().toISOString());
            
            this.isAuthenticated = true;
            this.username = username;
            this.loginTime = new Date().toISOString();
            
            return true;
        }
        
        return false;
    }

    // Logout user
    logout() {
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('username');
        localStorage.removeItem('loginTime');
        
        this.isAuthenticated = false;
        this.username = null;
        this.loginTime = null;
    }

    // Redirect to login if not authenticated
    requireAuth() {
        if (!this.isAuthenticated) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    // Get current user info
    getUserInfo() {
        return {
            username: this.username,
            loginTime: this.loginTime,
            isAuthenticated: this.isAuthenticated
        };
    }

    // Update session time
    updateSession() {
        if (this.isAuthenticated) {
            localStorage.setItem('loginTime', new Date().toISOString());
            this.loginTime = new Date().toISOString();
        }
    }
}

// Global auth manager instance
const auth = new AuthManager();

// Auto-logout after inactivity (30 minutes)
let inactivityTimer;

function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => {
        if (auth.isAuthenticated) {
            auth.logout();
            alert('Session expired due to inactivity. Please login again.');
            window.location.href = 'login.html';
        }
    }, 30 * 60 * 1000); // 30 minutes
}

// Reset timer on user activity
document.addEventListener('mousedown', resetInactivityTimer);
document.addEventListener('keypress', resetInactivityTimer);
document.addEventListener('scroll', resetInactivityTimer);
document.addEventListener('touchstart', resetInactivityTimer);

// Initialize timer
resetInactivityTimer();

// Logout function for UI
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        auth.logout();
        window.location.href = 'login.html';
    }
}

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    // Skip auth check for login page
    if (window.location.pathname.includes('login.html')) {
        return;
    }
    
    // Require authentication for all other pages
    if (!auth.requireAuth()) {
        return;
    }
    
    // Update session time
    auth.updateSession();
});
