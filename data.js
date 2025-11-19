// Data page specific JavaScript

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

document.getElementById('dataForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Check if user is logged in
    if (!authToken) {
        showModal('Please login to continue', false);
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }
    
    const network = dataNetwork.value;
    const phone = document.getElementById('dataPhone').value;
    const planValue = dataPlan.value;
    const planText = dataPlan.options[dataPlan.selectedIndex].text;
    
    if (!validatePhoneNumber(phone)) {
        showModal('Please enter a valid Nigerian phone number', false);
        return;
    }
    
    // Show processing message
    showModal('Processing your data purchase...', true);
    
    // Make API call
    const result = await apiRequest('/data/purchase', 'POST', {
        network,
        phone,
        plan: planValue,
        planText
    });
    
    if (result.success) {
        showModal(`${result.message}<br>Reference: ${result.transaction.reference} ✅`, true);
        this.reset();
        dataPlan.innerHTML = '<option value="">Select a network first</option>';
    } else {
        showModal(result.message, false);
    }
});
