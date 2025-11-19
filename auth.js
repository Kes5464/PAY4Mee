// Authentication page JavaScript (for login and register pages)

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
