// Common JavaScript for all pages

// USE LOCAL STORAGE ONLY - NO BACKEND REQUIRED
const USE_BACKEND = false; // Set to false to use localStorage only
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : 'https://pay4mee.onrender.com/api';

// Authentication State
let currentUser = null;
let authToken = null;

// Load user from localStorage on page load
window.addEventListener('DOMContentLoaded', function() {
    const savedUser = localStorage.getItem('currentUser');
    const savedToken = localStorage.getItem('authToken');
    if (savedUser && savedToken) {
        currentUser = JSON.parse(savedUser);
        authToken = savedToken;
        updateUIForLoggedInUser();
    }
});

// Update UI for logged in user
function updateUIForLoggedInUser() {
    const userNameEl = document.getElementById('userName');
    const userInfoEl = document.getElementById('userInfo');
    const loginBtnEl = document.getElementById('loginBtn');
    const registerBtnEl = document.getElementById('registerBtn');
    
    if (userNameEl && currentUser) {
        userNameEl.innerHTML = `<a href="profile.html" style="color: white; text-decoration: none;">Hello, ${currentUser.name} 👤</a>`;
    }
    if (userInfoEl) {
        userInfoEl.style.display = 'flex';
    }
    if (loginBtnEl) {
        loginBtnEl.style.display = 'none';
    }
    if (registerBtnEl) {
        registerBtnEl.style.display = 'none';
    }
}

// Update UI for logged out user
function updateUIForLoggedOutUser() {
    const userInfoEl = document.getElementById('userInfo');
    const loginBtnEl = document.getElementById('loginBtn');
    const registerBtnEl = document.getElementById('registerBtn');
    
    if (userInfoEl) {
        userInfoEl.style.display = 'none';
    }
    if (loginBtnEl) {
        loginBtnEl.style.display = 'block';
    }
    if (registerBtnEl) {
        registerBtnEl.style.display = 'block';
    }
}

// Logout functionality
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.onclick = function() {
        currentUser = null;
        authToken = null;
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
        updateUIForLoggedOutUser();
        showModal('You have been logged out successfully', true);
        setTimeout(() => {
            window.location.href = 'home.html';
        }, 1500);
    }
}

// API Helper function
async function apiRequest(endpoint, method = 'GET', data = null) {
    // If backend is disabled, use localStorage simulation
    if (!USE_BACKEND) {
        return handleLocalStorageRequest(endpoint, method, data);
    }
    
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    if (authToken) {
        options.headers['Authorization'] = `Bearer ${authToken}`;
    }

    if (data && method !== 'GET') {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_URL}${endpoint}`, options);
        const result = await response.json();
        return result;
    } catch (error) {
        return {
            success: false,
            message: 'Network error. Please check your connection.'
        };
    }
}

// Handle requests using localStorage (no backend needed)
function handleLocalStorageRequest(endpoint, method, data) {
    // Simulate async
    return new Promise((resolve) => {
        setTimeout(() => {
            // Get or initialize users database
            let users = JSON.parse(localStorage.getItem('pay4me_users') || '[]');
            
            // Registration
            if (endpoint === '/auth/register' && method === 'POST') {
                const { name, email, phone, password } = data;
                
                // Check if user exists
                if (users.find(u => u.email === email)) {
                    resolve({ success: false, message: 'Email already registered' });
                    return;
                }
                
                // Create user
                const user = {
                    id: users.length + 1,
                    name,
                    email,
                    phone,
                    password: btoa(password), // Simple encoding
                    verified: true,
                    registeredAt: new Date().toISOString()
                };
                
                users.push(user);
                localStorage.setItem('pay4me_users', JSON.stringify(users));
                
                resolve({
                    success: true,
                    message: 'Registration successful',
                    token: 'local_token_' + user.id,
                    user: { id: user.id, name: user.name, email: user.email, phone: user.phone }
                });
            }
            
            // Login
            else if (endpoint === '/auth/login' && method === 'POST') {
                const { email, password } = data;
                const user = users.find(u => u.email === email && u.password === btoa(password));
                
                if (!user) {
                    resolve({ success: false, message: 'Invalid email or password' });
                    return;
                }
                
                resolve({
                    success: true,
                    message: 'Login successful',
                    token: 'local_token_' + user.id,
                    user: { id: user.id, name: user.name, email: user.email, phone: user.phone }
                });
            }
            
            // Get Profile
            else if (endpoint === '/profile' && method === 'GET') {
                if (currentUser) {
                    const user = users.find(u => u.id === currentUser.id);
                    if (user) {
                        resolve({
                            success: true,
                            user: {
                                ...currentUser,
                                profilePicture: user.profilePicture,
                                aboutMe: user.aboutMe
                            }
                        });
                        return;
                    }
                }
                resolve({ success: false, message: 'Not authenticated' });
            }
            
            // Update Profile
            else if (endpoint === '/profile' && method === 'PUT') {
                if (currentUser) {
                    const userIndex = users.findIndex(u => u.id === currentUser.id);
                    if (userIndex !== -1) {
                        users[userIndex] = { ...users[userIndex], ...data };
                        localStorage.setItem('pay4me_users', JSON.stringify(users));
                        resolve({ success: true, message: 'Profile updated successfully', user: users[userIndex] });
                        return;
                    }
                }
                resolve({ success: false, message: 'Not authenticated' });
            }
            
            // Default response
            else {
                resolve({ success: true, message: 'Operation completed' });
            }
        }, 100);
    });
}

// Modal functions
const modal = document.getElementById('modal');
const modalMessage = document.getElementById('modalMessage');
const closeBtn = document.getElementsByClassName('close')[0];

function showModal(message, isSuccess) {
    if (modalMessage) {
        modalMessage.innerHTML = `<p class="${isSuccess ? 'success-message' : 'error-message'}">${message}</p>`;
        modal.style.display = 'block';
    }
}

if (closeBtn) {
    closeBtn.onclick = function() {
        modal.style.display = 'none';
    }
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

// Phone number validation
function validatePhoneNumber(phone) {
    const phoneRegex = /^0[789][01]\d{8}$/;
    return phoneRegex.test(phone);
}
