// Data Plans for each network
const dataPlans = {
    mtn: [
        { value: 'mtn-1gb-300', text: '1GB - ₦300 (30 Days)', price: 300 },
        { value: 'mtn-2gb-500', text: '2GB - ₦500 (30 Days)', price: 500 },
        { value: 'mtn-5gb-1200', text: '5GB - ₦1,200 (30 Days)', price: 1200 },
        { value: 'mtn-10gb-2000', text: '10GB - ₦2,000 (30 Days)', price: 2000 },
        { value: 'mtn-20gb-3500', text: '20GB - ₦3,500 (30 Days)', price: 3500 },
        { value: 'mtn-50gb-8000', text: '50GB - ₦8,000 (30 Days)', price: 8000 }
    ],
    glo: [
        { value: 'glo-1gb-400', text: '1GB - ₦400 (30 Days)', price: 400 },
        { value: 'glo-2gb-700', text: '2GB - ₦700 (30 Days)', price: 700 },
        { value: 'glo-5gb-1500', text: '5GB - ₦1,500 (30 Days)', price: 1500 },
        { value: 'glo-10gb-2500', text: '10GB - ₦2,500 (30 Days)', price: 2500 },
        { value: 'glo-20gb-4000', text: '20GB - ₦4,000 (30 Days)', price: 4000 }
    ],
    airtel: [
        { value: 'airtel-1gb-350', text: '1GB - ₦350 (30 Days)', price: 350 },
        { value: 'airtel-2gb-600', text: '2GB - ₦600 (30 Days)', price: 600 },
        { value: 'airtel-5gb-1300', text: '5GB - ₦1,300 (30 Days)', price: 1300 },
        { value: 'airtel-10gb-2200', text: '10GB - ₦2,200 (30 Days)', price: 2200 },
        { value: 'airtel-20gb-3800', text: '20GB - ₦3,800 (30 Days)', price: 3800 }
    ],
    '9mobile': [
        { value: '9mobile-1gb-500', text: '1GB - ₦500 (30 Days)', price: 500 },
        { value: '9mobile-2gb-900', text: '2GB - ₦900 (30 Days)', price: 900 },
        { value: '9mobile-5gb-1800', text: '5GB - ₦1,800 (30 Days)', price: 1800 },
        { value: '9mobile-10gb-3000', text: '10GB - ₦3,000 (30 Days)', price: 3000 }
    ]
};

// TV Packages
const tvPackages = {
    dstv: [
        { value: 'dstv-padi', text: 'DSTV Padi - ₦2,500', price: 2500 },
        { value: 'dstv-yanga', text: 'DSTV Yanga - ₦3,500', price: 3500 },
        { value: 'dstv-confam', text: 'DSTV Confam - ₦6,200', price: 6200 },
        { value: 'dstv-compact', text: 'DSTV Compact - ₦10,500', price: 10500 },
        { value: 'dstv-compact-plus', text: 'DSTV Compact Plus - ₦16,600', price: 16600 },
        { value: 'dstv-premium', text: 'DSTV Premium - ₦24,500', price: 24500 }
    ],
    gotv: [
        { value: 'gotv-smallie', text: 'GOtv Smallie - ₦1,300', price: 1300 },
        { value: 'gotv-jinja', text: 'GOtv Jinja - ₦2,250', price: 2250 },
        { value: 'gotv-jolli', text: 'GOtv Jolli - ₦3,300', price: 3300 },
        { value: 'gotv-max', text: 'GOtv Max - ₦4,850', price: 4850 },
        { value: 'gotv-supa', text: 'GOtv Supa - ₦6,400', price: 6400 }
    ]
};

// Authentication State
let currentUser = null;

// Load user from localStorage on page load
window.addEventListener('DOMContentLoaded', function() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateUIForLoggedInUser();
    }
});

// Modal functions
const modal = document.getElementById('modal');
const modalMessage = document.getElementById('modalMessage');
const closeBtn = document.getElementsByClassName('close')[0];

function showModal(message, isSuccess) {
    modalMessage.innerHTML = `<p class="${isSuccess ? 'success-message' : 'error-message'}">${message}</p>`;
    modal.style.display = 'block';
}

closeBtn.onclick = function() {
    modal.style.display = 'none';
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
    if (event.target == loginModal) {
        loginModal.style.display = 'none';
    }
    if (event.target == registerModal) {
        registerModal.style.display = 'none';
    }
}

// Auth Modal Elements
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const logoutBtn = document.getElementById('logoutBtn');
const closeLoginBtn = document.getElementsByClassName('close-login')[0];
const closeRegisterBtn = document.getElementsByClassName('close-register')[0];
const switchToRegister = document.getElementById('switchToRegister');
const switchToLogin = document.getElementById('switchToLogin');

// Open/Close Auth Modals
loginBtn.onclick = function() {
    loginModal.style.display = 'block';
}

registerBtn.onclick = function() {
    registerModal.style.display = 'block';
}

closeLoginBtn.onclick = function() {
    loginModal.style.display = 'none';
}

closeRegisterBtn.onclick = function() {
    registerModal.style.display = 'none';
}

switchToRegister.onclick = function(e) {
    e.preventDefault();
    loginModal.style.display = 'none';
    registerModal.style.display = 'block';
}

switchToLogin.onclick = function(e) {
    e.preventDefault();
    registerModal.style.display = 'none';
    loginModal.style.display = 'block';
}

// Update UI for logged in user
function updateUIForLoggedInUser() {
    document.getElementById('userName').textContent = `Hello, ${currentUser.name}`;
    document.getElementById('userInfo').style.display = 'flex';
    document.getElementById('loginBtn').style.display = 'none';
    document.getElementById('registerBtn').style.display = 'none';
}

// Update UI for logged out user
function updateUIForLoggedOutUser() {
    document.getElementById('userInfo').style.display = 'none';
    document.getElementById('loginBtn').style.display = 'block';
    document.getElementById('registerBtn').style.display = 'block';
}

// Registration Form
document.getElementById('registrationForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const phone = document.getElementById('registerPhone').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    
    // Validation
    if (!validatePhoneNumber(phone)) {
        showModal('Please enter a valid Nigerian phone number', false);
        return;
    }
    
    if (password.length < 6) {
        showModal('Password must be at least 6 characters long', false);
        return;
    }
    
    if (password !== confirmPassword) {
        showModal('Passwords do not match', false);
        return;
    }
    
    // Get existing users or create new array
    let users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Check if email already exists
    if (users.some(user => user.email === email)) {
        showModal('Email already registered. Please login instead.', false);
        return;
    }
    
    // Create new user
    const newUser = {
        name: name,
        email: email,
        phone: phone,
        password: password,
        registeredAt: new Date().toISOString()
    };
    
    // Save user
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    // Auto login
    currentUser = newUser;
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Update UI
    updateUIForLoggedInUser();
    registerModal.style.display = 'none';
    this.reset();
    
    showModal('Registration successful! Welcome to Pay4Me! 🎉', true);
});

// Login Form
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Find user
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateUIForLoggedInUser();
        loginModal.style.display = 'none';
        this.reset();
        showModal(`Welcome back, ${user.name}! 👋`, true);
    } else {
        showModal('Invalid email or password. Please try again.', false);
    }
});

// Logout
logoutBtn.onclick = function() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateUIForLoggedOutUser();
    showModal('You have been logged out successfully', true);
}

// Phone number validation
function validatePhoneNumber(phone) {
    const phoneRegex = /^0[789][01]\d{8}$/;
    return phoneRegex.test(phone);
}

// Airtime Form
document.getElementById('airtimeForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const network = document.getElementById('airtimeNetwork').value;
    const phone = document.getElementById('airtimePhone').value;
    const amount = document.getElementById('airtimeAmount').value;
    
    if (!validatePhoneNumber(phone)) {
        showModal('Please enter a valid Nigerian phone number', false);
        return;
    }
    
    // Simulate processing
    showModal(`Processing ₦${amount} airtime recharge to ${phone} on ${network.toUpperCase()}...<br>Transaction successful! ✅`, true);
    
    // Reset form
    this.reset();
});

// Data Form
const dataNetwork = document.getElementById('dataNetwork');
const dataPlan = document.getElementById('dataPlan');

dataNetwork.addEventListener('change', function() {
    const network = this.value;
    dataPlan.innerHTML = '<option value="">Select Data Plan</option>';
    
    if (network && dataPlans[network]) {
        dataPlans[network].forEach(plan => {
            const option = document.createElement('option');
            option.value = plan.value;
            option.textContent = plan.text;
            dataPlan.appendChild(option);
        });
    }
});

document.getElementById('dataForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const network = dataNetwork.value;
    const phone = document.getElementById('dataPhone').value;
    const plan = dataPlan.options[dataPlan.selectedIndex].text;
    
    if (!validatePhoneNumber(phone)) {
        showModal('Please enter a valid Nigerian phone number', false);
        return;
    }
    
    // Simulate processing
    showModal(`Processing ${plan} purchase for ${phone} on ${network.toUpperCase()}...<br>Transaction successful! ✅`, true);
    
    // Reset form
    this.reset();
    dataPlan.innerHTML = '<option value="">Select a network first</option>';
});

// Betting Form
document.getElementById('bettingForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const platform = document.getElementById('bettingPlatform').value;
    const userId = document.getElementById('bettingUserId').value;
    const amount = document.getElementById('bettingAmount').value;
    
    const platformNames = {
        'sportybet': 'SportyBet',
        '1xbet': '1xBet',
        'bet9ja': 'Bet9ja'
    };
    
    // Simulate processing
    showModal(`Processing ₦${amount} funding to ${platformNames[platform]} account: ${userId}...<br>Transaction successful! ✅`, true);
    
    // Reset form
    this.reset();
});

// TV Subscription Form
const tvProvider = document.getElementById('tvProvider');
const tvPackage = document.getElementById('tvPackage');

tvProvider.addEventListener('change', function() {
    const provider = this.value;
    tvPackage.innerHTML = '<option value="">Select Package</option>';
    
    if (provider && tvPackages[provider]) {
        tvPackages[provider].forEach(pkg => {
            const option = document.createElement('option');
            option.value = pkg.value;
            option.textContent = pkg.text;
            tvPackage.appendChild(option);
        });
    }
});

document.getElementById('tvForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const provider = tvProvider.value;
    const smartcard = document.getElementById('tvSmartcard').value;
    const packageName = tvPackage.options[tvPackage.selectedIndex].text;
    
    if (smartcard.length < 10) {
        showModal('Please enter a valid smartcard number', false);
        return;
    }
    
    // Simulate processing
    showModal(`Processing ${packageName} subscription for smartcard: ${smartcard}...<br>Transaction successful! ✅`, true);
    
    // Reset form
    this.reset();
    tvPackage.innerHTML = '<option value="">Select a provider first</option>';
});

// Smooth scrolling for navigation
document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});
