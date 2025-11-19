// Common JavaScript for all pages

// API Base URL - configured for production
const API_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000/api' 
    : 'https://pay4me-com-ng.onrender.com/api';

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
        userNameEl.textContent = `Hello, ${currentUser.name}`;
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
