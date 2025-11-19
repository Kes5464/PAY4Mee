// TV subscription page specific JavaScript

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

document.getElementById('tvForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Check if user is logged in
    if (!authToken) {
        showModal('Please login to continue', false);
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }
    
    const provider = tvProvider.value;
    const smartcard = document.getElementById('tvSmartcard').value;
    const packageValue = tvPackage.value;
    const packageText = tvPackage.options[tvPackage.selectedIndex].text;
    
    if (smartcard.length < 10) {
        showModal('Please enter a valid smartcard number', false);
        return;
    }
    
    // Show processing message
    showModal('Processing your TV subscription...', true);
    
    // Make API call
    const result = await apiRequest('/tv/subscribe', 'POST', {
        provider,
        smartcard,
        packageValue,
        packageText
    });
    
    if (result.success) {
        showModal(`${result.message}<br>Reference: ${result.transaction.reference} ✅`, true);
        this.reset();
        tvPackage.innerHTML = '<option value="">Select a provider first</option>';
    } else {
        showModal(result.message, false);
    }
});
