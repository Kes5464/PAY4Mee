// Authentication page JavaScript (for login and register pages)

// OTP Verification Variables
let otpVerified = false;
let verificationType = null;
let otpTimer = null;

// Show OTP section
function showOtpSection(type) {
    verificationType = type;
    const otpSection = document.getElementById('otpSection');
    const sendOtpBtn = document.getElementById('sendOtpBtn');
    const verifyOtpBtn = document.getElementById('verifyOtpBtn');
    const otpInput = document.getElementById('otpInput');
    
    otpSection.style.display = 'block';
    sendOtpBtn.style.display = 'inline-block';
    verifyOtpBtn.style.display = 'none';
    otpInput.value = '';
    otpInput.disabled = true;
    
    document.getElementById('verificationStatus').innerHTML = `<span style="color: #667eea;">Selected: ${type === 'email' ? 'Email' : 'SMS'} verification</span>`;
}

// Send OTP
async function sendOTP() {
    const email = document.getElementById('registerEmail').value;
    const phone = document.getElementById('registerPhone').value;
    
    if (!email || !phone) {
        showModal('Please fill in email and phone number first', false);
        return;
    }
    
    if (!validatePhoneNumber(phone)) {
        showModal('Please enter a valid Nigerian phone number', false);
        return;
    }
    
    const identifier = verificationType === 'email' ? email : phone;
    
    showModal('Sending verification code...', true);
    
    const result = await apiRequest('/auth/send-otp', 'POST', {
        email: verificationType === 'email' ? email : null,
        phone: verificationType === 'phone' ? phone : null,
        type: verificationType
    });
    
    if (result.success) {
        showModal(`✅ OTP sent to your ${verificationType}! Check your ${verificationType === 'email' ? 'inbox' : 'messages'}. Code: ${result.otp}`, true);
        
        document.getElementById('otpInput').disabled = false;
        document.getElementById('sendOtpBtn').style.display = 'none';
        document.getElementById('verifyOtpBtn').style.display = 'inline-block';
        
        // Start timer
        startOtpTimer(300); // 5 minutes
    } else {
        showModal(result.message || 'Failed to send OTP', false);
    }
}

// Verify OTP
async function verifyOTP() {
    const otpInput = document.getElementById('otpInput').value;
    const email = document.getElementById('registerEmail').value;
    const phone = document.getElementById('registerPhone').value;
    
    if (!otpInput || otpInput.length !== 6) {
        showModal('Please enter a valid 6-digit OTP', false);
        return;
    }
    
    showModal('Verifying code...', true);
    
    const result = await apiRequest('/auth/verify-otp', 'POST', {
        email: verificationType === 'email' ? email : null,
        phone: verificationType === 'phone' ? phone : null,
        otp: otpInput
    });
    
    if (result.success) {
        otpVerified = true;
        showModal('✅ Verification successful!', true);
        document.getElementById('verificationStatus').innerHTML = '<span style="color: #28a745; font-weight: bold;">✓ Verified</span>';
        document.getElementById('otpSection').style.display = 'none';
        
        // Clear timer
        if (otpTimer) clearInterval(otpTimer);
    } else {
        showModal(result.message || 'Invalid OTP', false);
    }
}

// Start OTP timer
function startOtpTimer(seconds) {
    const timerEl = document.getElementById('otpTimer');
    timerEl.style.display = 'block';
    
    let timeLeft = seconds;
    
    otpTimer = setInterval(() => {
        const minutes = Math.floor(timeLeft / 60);
        const secs = timeLeft % 60;
        timerEl.textContent = `⏱️ OTP expires in ${minutes}:${secs.toString().padStart(2, '0')}`;
        
        if (timeLeft <= 0) {
            clearInterval(otpTimer);
            timerEl.textContent = '⏰ OTP expired. Please request a new one.';
            document.getElementById('sendOtpBtn').style.display = 'inline-block';
            document.getElementById('verifyOtpBtn').style.display = 'none';
            document.getElementById('otpInput').disabled = true;
        }
        
        timeLeft--;
    }, 1000);
}

// Registration Form
const registrationForm = document.getElementById('registrationForm');
if (registrationForm) {
    registrationForm.addEventListener('submit', async function(e) {
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
        
        // Check OTP verification
        if (!otpVerified) {
            showModal('⚠️ Please verify your email or phone number first', false);
            return;
        }
        
        // Show processing message
        showModal('Creating your account...', true);
        
        // Make API call
        const result = await apiRequest('/auth/register', 'POST', {
            name,
            email,
            phone,
            password
        });
        
        if (result.success) {
            // Save user and token
            currentUser = result.user;
            authToken = result.token;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            localStorage.setItem('authToken', authToken);
            
            // Show success and redirect
            showModal('Registration successful! Welcome to Pay4Me! 🎉', true);
            
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 1500);
        } else {
            showModal(result.message, false);
        }
    });
}

// Login Form
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        // Show processing message
        showModal('Logging you in...', true);
        
        // Make API call
        const result = await apiRequest('/auth/login', 'POST', {
            email,
            password
        });
        
        if (result.success) {
            // Save user and token
            currentUser = result.user;
            authToken = result.token;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            localStorage.setItem('authToken', authToken);
            
            showModal(`Welcome back, ${result.user.name}! 👋`, true);
            
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 1500);
        } else {
            showModal(result.message, false);
        }
    });
}

// Password Toggle Function
function togglePassword(inputId, button) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        button.textContent = '🙈';
    } else {
        input.type = 'password';
        button.textContent = '👁️';
    }
}
